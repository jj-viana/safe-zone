using System.Globalization;
using System.Net;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using ReportsApi.Configuration;
using ReportsApi.Interfaces;
using ReportsApi.Models;

namespace ReportsApi.Services;

public class ReportService : IReportService
{
    private readonly CosmosClient _cosmosClient;
    private readonly CosmosOptions _options;
    private readonly ILogger<ReportService> _logger;
    private Container? _container;
    private readonly SemaphoreSlim _initializationLock = new(1, 1);
    private readonly ICosmosTelemetry _cosmosTelemetry;

    public ReportService(
        CosmosClient cosmosClient,
        IOptions<CosmosOptions> options,
        ILogger<ReportService> logger,
        ICosmosTelemetry cosmosTelemetry)
    {
        _cosmosClient = cosmosClient;
        _options = options.Value;
        _logger = logger;
        _cosmosTelemetry = cosmosTelemetry;
    }

    private static DateTime NormalizeDateTime(DateTime dateTime) => dateTime.Kind switch
    {
        DateTimeKind.Local => dateTime.ToUniversalTime(),
        DateTimeKind.Utc => dateTime,
        _ => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
    };

    private async Task<Container> GetContainerAsync(CancellationToken cancellationToken)
    {
        if (_container is not null)
        {
            _logger.LogDebug("Cosmos container already initialized");
            return _container;
        }

        await _initializationLock.WaitAsync(cancellationToken);
        try
        {
            if (_container is null)
            {
                _logger.LogInformation("Initializing Cosmos database {DatabaseId} and container {ContainerId}", _options.DatabaseId, _options.ContainerId);

                try
                {
                    var databaseResponse = await _cosmosClient.CreateDatabaseIfNotExistsAsync(_options.DatabaseId, cancellationToken: cancellationToken);
                    _cosmosTelemetry.TrackRequestUnits(
                        "CosmosDatabaseCreateIfNotExists",
                        databaseResponse.RequestCharge,
                        new Dictionary<string, string?>
                        {
                            ["operationStatus"] = databaseResponse.StatusCode.ToString()
                        });

                    var containerResponse = await databaseResponse.Database.CreateContainerIfNotExistsAsync(new ContainerProperties
                    {
                        Id = _options.ContainerId,
                        PartitionKeyPath = "/id"
                    }, cancellationToken: cancellationToken);

                    _container = containerResponse.Container;
                    _cosmosTelemetry.TrackRequestUnits(
                        "CosmosContainerCreateIfNotExists",
                        containerResponse.RequestCharge,
                        new Dictionary<string, string?>
                        {
                            ["operationStatus"] = containerResponse.StatusCode.ToString()
                        });
                    _logger.LogInformation("Cosmos container {ContainerId} ready", _options.ContainerId);
                }
                catch (CosmosException ex)
                {
                    _logger.LogCritical(ex, "Failed to initialize Cosmos resources {DatabaseId}/{ContainerId}", _options.DatabaseId, _options.ContainerId);
                    _cosmosTelemetry.TrackRequestUnits(
                        "CosmosInitializationFailed",
                        ex.RequestCharge,
                        new Dictionary<string, string?>
                        {
                            ["statusCode"] = ex.StatusCode.ToString()
                        });
                    throw;
                }
                catch (Exception ex)
                {
                    _logger.LogCritical(ex, "Unexpected error while initializing Cosmos resources {DatabaseId}/{ContainerId}", _options.DatabaseId, _options.ContainerId);
                    throw;
                }
            }
        }
        finally
        {
            _initializationLock.Release();
        }

        return _container;
    }

    public async Task<ReportResponse> CreateAsync(CreateReportRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating new report");
        var container = await GetContainerAsync(cancellationToken);

        var crimeGenre = request.CrimeGenre ?? throw new ArgumentException("The crimeGenre field is required.", nameof(request.CrimeGenre));
        var crimeType = request.CrimeType ?? throw new ArgumentException("The crimeType field is required.", nameof(request.CrimeType));
        var description = request.Description ?? throw new ArgumentException("The description field is required.", nameof(request.Description));
        var location = request.Location ?? throw new ArgumentException("The location field is required.", nameof(request.Location));
        var region = request.Region ?? throw new ArgumentException("The region field is required.", nameof(request.Region));
        var crimeDate = request.CrimeDate ?? throw new ArgumentException("The crimeDate field is required.", nameof(request.CrimeDate));
        var status = request.Status ?? throw new ArgumentException("The status field is required.", nameof(request.Status));
        var resolved = request.Resolved ?? throw new ArgumentException("The resolved field is required.", nameof(request.Resolved));

        var normalizedStatus = status.Trim();
        if (normalizedStatus.Length == 0)
        {
            throw new ArgumentException("The status field must not be empty.", nameof(request.Status));
        }

        ReporterDetails? reporterDetails = null;
        if (request.ReporterDetails is not null)
        {
            var details = request.ReporterDetails;
            reporterDetails = new ReporterDetails
            {
                AgeGroup = details.AgeGroup?.Trim(),
                Ethnicity = details.Ethnicity?.Trim(),
                GenderIdentity = details.GenderIdentity?.Trim(),
                SexualOrientation = details.SexualOrientation?.Trim()
            };
        }

        var report = new Report
        {
            Id = Guid.NewGuid().ToString(),
            CrimeGenre = crimeGenre.Trim(),
            CrimeType = crimeType.Trim(),
            Description = description.Trim(),
            Location = location.Trim(),
            Region = region.Trim(),
            CrimeDate = NormalizeDateTime(crimeDate),
            ReporterDetails = reporterDetails,
            CreatedDate = DateTime.UtcNow,
            Status = normalizedStatus,
            Resolved = resolved
        };

        var itemRequestOptions = new ItemRequestOptions
        {
            EnableContentResponseOnWrite = _options.EnableContentResponseOnWrite
        };

        try
        {
            _logger.LogDebug("Persisting report {ReportId} in Cosmos", report.Id);
            var response = await container.CreateItemAsync(report, new PartitionKey(report.PartitionKey), itemRequestOptions, cancellationToken);
            _cosmosTelemetry.TrackRequestUnits(
                "ReportCreate",
                response.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["partitionKeyPath"] = "/id",
                    ["statusCode"] = response.StatusCode.ToString()
                });
            _logger.LogInformation("Report {ReportId} created successfully", report.Id);
        }
        catch (CosmosException ex)
        {
            _logger.LogError(ex, "Failed to create report in Cosmos DB");
            _cosmosTelemetry.TrackRequestUnits(
                "ReportCreateFailed",
                ex.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = ex.StatusCode.ToString(),
                    ["partitionKeyPath"] = "/id"
                });
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected failure while creating report {ReportId}", report.Id);
            throw;
        }

        return ReportResponse.FromModel(report);
    }

    public async Task<IReadOnlyCollection<ReportResponse>> GetAllAsync(string? status, CancellationToken cancellationToken)
    {
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? null : status.Trim();
        _logger.LogInformation("Fetching all reports with status filter {StatusFilter}", normalizedStatus ?? "Any");
        var container = await GetContainerAsync(cancellationToken);
        var results = new List<ReportResponse>();
        double totalRequestCharge = 0;
        var pageIndex = 0;

        var queryRequestOptions = new QueryRequestOptions
        {
            MaxBufferedItemCount = 100,
            MaxConcurrency = -1
        };

        FeedIterator<Report> queryIterator;
        if (normalizedStatus is null)
        {
            queryIterator = container.GetItemQueryIterator<Report>(requestOptions: queryRequestOptions);
        }
        else
        {
            var queryDefinition = new QueryDefinition("SELECT * FROM c WHERE c.status = @status")
                .WithParameter("@status", normalizedStatus);
            queryIterator = container.GetItemQueryIterator<Report>(queryDefinition, requestOptions: queryRequestOptions);
        }

        while (queryIterator.HasMoreResults)
        {
            FeedResponse<Report> response;
            try
            {
                response = await queryIterator.ReadNextAsync(cancellationToken);
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex, "Failed to fetch reports from Cosmos DB with status filter {StatusFilter}", normalizedStatus ?? "Any");
                var failureTelemetry = new Dictionary<string, string?>
                {
                    ["statusCode"] = ex.StatusCode.ToString()
                };
                if (normalizedStatus is not null)
                {
                    failureTelemetry["status"] = normalizedStatus;
                }

                _cosmosTelemetry.TrackRequestUnits(
                    "ReportQueryAllFailed",
                    ex.RequestCharge,
                    failureTelemetry);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while fetching reports with status filter {StatusFilter}", normalizedStatus ?? "Any");
                throw;
            }

            _logger.LogDebug("Fetched {Count} reports batch (status filter {StatusFilter})", response.Count, normalizedStatus ?? "Any");
            totalRequestCharge += response.RequestCharge;
            var pageTelemetry = new Dictionary<string, string?>
            {
                ["pageIndex"] = pageIndex.ToString(CultureInfo.InvariantCulture),
                ["queryName"] = normalizedStatus is null ? "GetAllReports" : "GetAllReportsByStatus"
            };
            if (normalizedStatus is not null)
            {
                pageTelemetry["status"] = normalizedStatus;
            }
            _cosmosTelemetry.TrackRequestUnits(
                "ReportQueryAllPage",
                response.RequestCharge,
                pageTelemetry);
            pageIndex++;
            results.AddRange(response.Resource.Select(ReportResponse.FromModel));
        }

        var totalTelemetry = new Dictionary<string, string?>
        {
            ["pages"] = pageIndex.ToString(CultureInfo.InvariantCulture)
        };
        if (normalizedStatus is not null)
        {
            totalTelemetry["status"] = normalizedStatus;
        }

        _cosmosTelemetry.TrackRequestUnits(
            "ReportQueryAllTotal",
            totalRequestCharge,
            totalTelemetry);

        _logger.LogInformation("Returning {Count} reports for status filter {StatusFilter}", results.Count, normalizedStatus ?? "Any");
        return results;
    }

    public async Task<IReadOnlyCollection<ReportResponse>> GetByCrimeGenreAsync(string crimeGenre, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(crimeGenre))
        {
            throw new ArgumentException("The crimeGenre value is required.", nameof(crimeGenre));
        }

        _logger.LogInformation("Fetching reports by crime genre {CrimeGenre}", crimeGenre);
        var container = await GetContainerAsync(cancellationToken);
        var results = new List<ReportResponse>();
        double totalRequestCharge = 0;
        var pageIndex = 0;

        var normalizedCrimeGenre = crimeGenre.Trim();

        var queryDefinition = new QueryDefinition("SELECT * FROM c WHERE c.crimeGenre = @crimeGenre")
            .WithParameter("@crimeGenre", normalizedCrimeGenre);

        var queryIterator = container.GetItemQueryIterator<Report>(
            queryDefinition,
            requestOptions: new QueryRequestOptions
            {
                MaxBufferedItemCount = 100,
                MaxConcurrency = -1
            });

        while (queryIterator.HasMoreResults)
        {
            FeedResponse<Report> response;
            try
            {
                response = await queryIterator.ReadNextAsync(cancellationToken);
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex, "Failed to fetch reports by crime genre {CrimeGenre} in Cosmos DB", normalizedCrimeGenre);
                _cosmosTelemetry.TrackRequestUnits(
                    "ReportQueryByGenreFailed",
                    ex.RequestCharge,
                    new Dictionary<string, string?>
                    {
                        ["statusCode"] = ex.StatusCode.ToString(),
                        ["crimeGenre"] = normalizedCrimeGenre
                    });
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while fetching reports by crime genre {CrimeGenre}", normalizedCrimeGenre);
                throw;
            }

            _logger.LogDebug("Fetched {Count} reports batch for genre {CrimeGenre}", response.Count, normalizedCrimeGenre);
            totalRequestCharge += response.RequestCharge;
            _cosmosTelemetry.TrackRequestUnits(
                "ReportQueryByGenrePage",
                response.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["pageIndex"] = pageIndex.ToString(CultureInfo.InvariantCulture),
                    ["crimeGenre"] = normalizedCrimeGenre
                });
            pageIndex++;
            results.AddRange(response.Resource.Select(ReportResponse.FromModel));
        }

        _cosmosTelemetry.TrackRequestUnits(
            "ReportQueryByGenreTotal",
            totalRequestCharge,
            new Dictionary<string, string?>
            {
                ["pages"] = pageIndex.ToString(CultureInfo.InvariantCulture),
                ["crimeGenre"] = normalizedCrimeGenre
            });

        _logger.LogInformation("Returning {Count} reports for crime genre {CrimeGenre}", results.Count, normalizedCrimeGenre);
        return results;
    }

    public async Task<IReadOnlyCollection<ReportResponse>> GetByCrimeTypeAsync(string crimeType, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(crimeType))
        {
            throw new ArgumentException("The crimeType value is required.", nameof(crimeType));
        }

        _logger.LogInformation("Fetching reports by crime type {CrimeType}", crimeType);
        var container = await GetContainerAsync(cancellationToken);
        var results = new List<ReportResponse>();
        double totalRequestCharge = 0;
        var pageIndex = 0;

        var normalizedCrimeType = crimeType.Trim();

        var queryDefinition = new QueryDefinition("SELECT * FROM c WHERE c.crimeType = @crimeType")
            .WithParameter("@crimeType", normalizedCrimeType);

        var queryIterator = container.GetItemQueryIterator<Report>(
            queryDefinition,
            requestOptions: new QueryRequestOptions
            {
                MaxBufferedItemCount = 100,
                MaxConcurrency = -1
            });

        while (queryIterator.HasMoreResults)
        {
            FeedResponse<Report> response;
            try
            {
                response = await queryIterator.ReadNextAsync(cancellationToken);
            }
            catch (CosmosException ex)
            {
                _logger.LogError(ex, "Failed to fetch reports by crime type {CrimeType} in Cosmos DB", normalizedCrimeType);
                _cosmosTelemetry.TrackRequestUnits(
                    "ReportQueryByTypeFailed",
                    ex.RequestCharge,
                    new Dictionary<string, string?>
                    {
                        ["statusCode"] = ex.StatusCode.ToString(),
                        ["crimeType"] = normalizedCrimeType
                    });
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while fetching reports by crime type {CrimeType}", normalizedCrimeType);
                throw;
            }

            _logger.LogDebug("Fetched {Count} reports batch for crime type {CrimeType}", response.Count, normalizedCrimeType);
            totalRequestCharge += response.RequestCharge;
            _cosmosTelemetry.TrackRequestUnits(
                "ReportQueryByTypePage",
                response.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["pageIndex"] = pageIndex.ToString(CultureInfo.InvariantCulture),
                    ["crimeType"] = normalizedCrimeType
                });
            pageIndex++;
            results.AddRange(response.Resource.Select(ReportResponse.FromModel));
        }

        _cosmosTelemetry.TrackRequestUnits(
            "ReportQueryByTypeTotal",
            totalRequestCharge,
            new Dictionary<string, string?>
            {
                ["pages"] = pageIndex.ToString(CultureInfo.InvariantCulture),
                ["crimeType"] = normalizedCrimeType
            });

        _logger.LogInformation("Returning {Count} reports for crime type {CrimeType}", results.Count, normalizedCrimeType);
        return results;
    }

    public async Task<ReportResponse?> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new ArgumentException("The report id is required.", nameof(id));
        }

        _logger.LogInformation("Fetching report {ReportId}", id);
        var container = await GetContainerAsync(cancellationToken);
        try
        {
            var response = await container.ReadItemAsync<Report>(id, new PartitionKey(id), cancellationToken: cancellationToken);
            _cosmosTelemetry.TrackRequestUnits(
                "ReportReadById",
                response.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = response.StatusCode.ToString()
                });
            _logger.LogDebug("Report {ReportId} found", id);
            return ReportResponse.FromModel(response.Resource);
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogInformation("Report {ReportId} not found", id);
            _cosmosTelemetry.TrackRequestUnits(
                "ReportReadByIdNotFound",
                ex.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = ex.StatusCode.ToString()
                });
            return null;
        }
        catch (CosmosException ex)
        {
            _logger.LogError(ex, "Failed to fetch report {ReportId}", id);
            _cosmosTelemetry.TrackRequestUnits(
                "ReportReadByIdFailed",
                ex.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = ex.StatusCode.ToString()
                });
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while fetching report {ReportId}", id);
            throw;
        }
    }

    public async Task<ReportResponse?> UpdateAsync(string id, UpdateReportRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new ArgumentException("The report id is required.", nameof(id));
        }

        _logger.LogInformation("Updating report {ReportId}", id);
        var container = await GetContainerAsync(cancellationToken);
        Report existing;
        try
        {
            var readResponse = await container.ReadItemAsync<Report>(id, new PartitionKey(id), cancellationToken: cancellationToken);
            existing = readResponse.Resource;
            _cosmosTelemetry.TrackRequestUnits(
                "ReportUpdateReadExisting",
                readResponse.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = readResponse.StatusCode.ToString()
                });
            _logger.LogDebug("Loaded existing report {ReportId} for update", id);
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogInformation("Report {ReportId} not found for update", id);
            _cosmosTelemetry.TrackRequestUnits(
                "ReportUpdateReadMissing",
                ex.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = ex.StatusCode.ToString()
                });
            return null;
        }
        catch (CosmosException ex)
        {
            _logger.LogError(ex, "Failed to fetch report for update {ReportId}", id);
            _cosmosTelemetry.TrackRequestUnits(
                "ReportUpdateReadFailed",
                ex.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = ex.StatusCode.ToString()
                });
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while preparing update for report {ReportId}", id);
            throw;
        }

        var operations = new List<PatchOperation>();

        string? updatedCrimeGenre = null;
        if (!string.IsNullOrWhiteSpace(request.CrimeGenre))
        {
            var normalized = request.CrimeGenre.Trim();
            if (!string.Equals(existing.CrimeGenre, normalized, StringComparison.Ordinal))
            {
                operations.Add(PatchOperation.Set("/crimeGenre", normalized));
                updatedCrimeGenre = normalized;
            }
        }

        string? updatedCrimeType = null;
        if (!string.IsNullOrWhiteSpace(request.CrimeType))
        {
            var normalized = request.CrimeType.Trim();
            if (!string.Equals(existing.CrimeType, normalized, StringComparison.Ordinal))
            {
                operations.Add(PatchOperation.Set("/crimeType", normalized));
                updatedCrimeType = normalized;
            }
        }

        string? updatedDescription = null;
        if (!string.IsNullOrWhiteSpace(request.Description))
        {
            var normalized = request.Description.Trim();
            if (!string.Equals(existing.Description, normalized, StringComparison.Ordinal))
            {
                operations.Add(PatchOperation.Set("/description", normalized));
                updatedDescription = normalized;
            }
        }

        string? updatedLocation = null;
        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            var normalized = request.Location.Trim();
            if (!string.Equals(existing.Location, normalized, StringComparison.Ordinal))
            {
                operations.Add(PatchOperation.Set("/location", normalized));
                updatedLocation = normalized;
            }
        }

        string? updatedRegion = null;
        if (!string.IsNullOrWhiteSpace(request.Region))
        {
            var normalized = request.Region.Trim();
            if (!string.Equals(existing.Region, normalized, StringComparison.Ordinal))
            {
                operations.Add(PatchOperation.Set("/region", normalized));
                updatedRegion = normalized;
            }
        }

        DateTime? updatedCrimeDate = null;
        if (request.CrimeDate.HasValue)
        {
            var normalizedDate = NormalizeDateTime(request.CrimeDate.Value);
            if (existing.CrimeDate != normalizedDate)
            {
                operations.Add(PatchOperation.Set("/crimeDate", normalizedDate));
                updatedCrimeDate = normalizedDate;
            }
        }

        bool? updatedResolved = null;
        if (request.Resolved.HasValue && existing.Resolved != request.Resolved.Value)
        {
            operations.Add(PatchOperation.Set("/resolved", request.Resolved.Value));
            updatedResolved = request.Resolved.Value;
        }

        string? updatedStatus = null;
        if (request.Status is not null)
        {
            var normalized = request.Status.Trim();
            if (normalized.Length == 0)
            {
                throw new ArgumentException("The status field must not be empty.", nameof(request.Status));
            }
            if (!string.Equals(existing.Status, normalized, StringComparison.Ordinal))
            {
                operations.Add(PatchOperation.Set("/status", normalized));
                updatedStatus = normalized;
            }
        }

        ReporterDetails? updatedReporterDetails = null;
        if (request.ReporterDetails is not null)
        {
            var detailsRequest = request.ReporterDetails;
            var normalizedDetails = new ReporterDetails
            {
                AgeGroup = detailsRequest.AgeGroup?.Trim(),
                Ethnicity = detailsRequest.Ethnicity?.Trim(),
                GenderIdentity = detailsRequest.GenderIdentity?.Trim(),
                SexualOrientation = detailsRequest.SexualOrientation?.Trim()
            };

            var currentDetails = existing.ReporterDetails;

            static bool EqualsOrdinal(string? left, string? right) => string.Equals(left, right, StringComparison.Ordinal);

            var detailsChanged = currentDetails is null
                ? normalizedDetails.AgeGroup is not null
                    || normalizedDetails.Ethnicity is not null
                    || normalizedDetails.GenderIdentity is not null
                    || normalizedDetails.SexualOrientation is not null
                : !EqualsOrdinal(currentDetails.AgeGroup, normalizedDetails.AgeGroup)
                    || !EqualsOrdinal(currentDetails.Ethnicity, normalizedDetails.Ethnicity)
                    || !EqualsOrdinal(currentDetails.GenderIdentity, normalizedDetails.GenderIdentity)
                    || !EqualsOrdinal(currentDetails.SexualOrientation, normalizedDetails.SexualOrientation);

            if (detailsChanged)
            {
                operations.Add(PatchOperation.Set("/reporterDetails", normalizedDetails));
                updatedReporterDetails = normalizedDetails;
            }
        }

        if (operations.Count == 0)
        {
            return ReportResponse.FromModel(existing);
        }

        PatchItemRequestOptions? requestOptions = null;
        if (_options.EnableContentResponseOnWrite)
        {
            requestOptions = new PatchItemRequestOptions
            {
                EnableContentResponseOnWrite = true
            };
        }

        try
        {
            var response = await container.PatchItemAsync<Report>(
                id,
                new PartitionKey(existing.PartitionKey),
                operations,
                requestOptions,
                cancellationToken: cancellationToken);

            var updatedResource = response.Resource;
            _cosmosTelemetry.TrackRequestUnits(
                "ReportUpdatePatch",
                response.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = response.StatusCode.ToString(),
                    ["operations"] = operations.Count.ToString(CultureInfo.InvariantCulture)
                });
            if (updatedResource is null)
            {
                if (updatedCrimeGenre is not null)
                {
                    existing.CrimeGenre = updatedCrimeGenre;
                }

                if (updatedCrimeType is not null)
                {
                    existing.CrimeType = updatedCrimeType;
                }

                if (updatedDescription is not null)
                {
                    existing.Description = updatedDescription;
                }

                if (updatedLocation is not null)
                {
                    existing.Location = updatedLocation;
                }

                if (updatedRegion is not null)
                {
                    existing.Region = updatedRegion;
                }

                if (updatedCrimeDate.HasValue)
                {
                    existing.CrimeDate = updatedCrimeDate.Value;
                }

                if (updatedResolved.HasValue)
                {
                    existing.Resolved = updatedResolved.Value;
                }

                if (updatedStatus is not null)
                {
                    existing.Status = updatedStatus;
                }

                if (updatedReporterDetails is not null)
                {
                    existing.ReporterDetails = updatedReporterDetails;
                }

                updatedResource = existing;
            }

            _logger.LogInformation("Report {ReportId} updated successfully", id);
            return ReportResponse.FromModel(updatedResource);
        }
        catch (CosmosException ex)
        {
            _logger.LogError(ex, "Failed to update report {ReportId}", id);
            _cosmosTelemetry.TrackRequestUnits(
                "ReportUpdatePatchFailed",
                ex.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = ex.StatusCode.ToString()
                });
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating report {ReportId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return false;
        }

        _logger.LogInformation("Deleting report {ReportId}", id);
        var container = await GetContainerAsync(cancellationToken);

        try
        {
            var response = await container.DeleteItemAsync<Report>(id, new PartitionKey(id), cancellationToken: cancellationToken);
            _cosmosTelemetry.TrackRequestUnits(
                "ReportDelete",
                response.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = response.StatusCode.ToString()
                });
            _logger.LogInformation("Report {ReportId} deleted successfully", id);
            return true;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogInformation("Report {ReportId} not found for deletion", id);
            _cosmosTelemetry.TrackRequestUnits(
                "ReportDeleteNotFound",
                ex.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = ex.StatusCode.ToString()
                });
            return false;
        }
        catch (CosmosException ex)
        {
            _logger.LogError(ex, "Failed to delete report {ReportId}", id);
            _cosmosTelemetry.TrackRequestUnits(
                "ReportDeleteFailed",
                ex.RequestCharge,
                new Dictionary<string, string?>
                {
                    ["statusCode"] = ex.StatusCode.ToString()
                });
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while deleting report {ReportId}", id);
            throw;
        }
    }
}
