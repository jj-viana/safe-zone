using System.Collections.Generic;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReportsApi.Configuration;
using ReportsApi.Interfaces;

namespace ReportsApi.Services;

public class CosmosTelemetry : ICosmosTelemetry
{
    private const string MetricName = "cosmos.request.units";
    private const string OperationProperty = "operation";
    private const string DatabaseProperty = "databaseId";
    private const string ContainerProperty = "containerId";

    private readonly TelemetryClient _telemetryClient;
    private readonly CosmosOptions _cosmosOptions;
    private readonly ILogger<CosmosTelemetry> _logger;

    public CosmosTelemetry(TelemetryClient telemetryClient, IOptions<CosmosOptions> cosmosOptions, ILogger<CosmosTelemetry> logger)
    {
        _telemetryClient = telemetryClient;
        _cosmosOptions = cosmosOptions.Value;
        _logger = logger;
    }

    public void TrackRequestUnits(string operationName, double requestCharge, IReadOnlyDictionary<string, string?>? properties = null)
    {
        if (requestCharge <= 0)
        {
            return;
        }

        var metric = new MetricTelemetry(MetricName, requestCharge)
        {
            Properties =
            {
                [OperationProperty] = operationName,
                [DatabaseProperty] = _cosmosOptions.DatabaseId,
                [ContainerProperty] = _cosmosOptions.ContainerId
            }
        };

        if (properties is not null)
        {
            foreach (var (key, value) in properties)
            {
                if (string.IsNullOrWhiteSpace(key) || value is null)
                {
                    continue;
                }

                metric.Properties[key] = value;
            }
        }

        _telemetryClient.TrackMetric(metric);
        _logger.LogDebug("Tracked {RequestCharge} RUs for Cosmos operation {Operation}", requestCharge, operationName);
    }
}
