using System.Net;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using ReportsApi.Configuration;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using ReportsApi.Services;
using Xunit;

namespace ReportsApi.Tests.Services;

public class ReportServiceUpdateLogicTests
{
    private readonly Mock<CosmosClient> _cosmosClientMock;
    private readonly Mock<Database> _databaseMock;
    private readonly Mock<Container> _containerMock;
    private readonly Mock<ICosmosTelemetry> _telemetryMock;
    private readonly Mock<ILogger<ReportService>> _loggerMock;
    private readonly CosmosOptions _options;

    public ReportServiceUpdateLogicTests()
    {
        _cosmosClientMock = new Mock<CosmosClient>();
        _databaseMock = new Mock<Database>();
        _containerMock = new Mock<Container>();
        _telemetryMock = new Mock<ICosmosTelemetry>();
        _loggerMock = new Mock<ILogger<ReportService>>();
        _options = new CosmosOptions
        {
            DatabaseId = "ReportsDb",
            ContainerId = "Reports",
            EnableContentResponseOnWrite = true
        };

        _cosmosClientMock.Setup(c => c.CreateDatabaseIfNotExistsAsync(It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Mock.Of<DatabaseResponse>(r => r.Database == _databaseMock.Object));
        
        _databaseMock.Setup(d => d.CreateContainerIfNotExistsAsync(It.IsAny<ContainerProperties>(), It.IsAny<int?>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Mock.Of<ContainerResponse>(r => r.Container == _containerMock.Object));
    }

    private ReportService CreateService(CosmosOptions? options = null)
    {
        var optionsWrapper = Options.Create(options ?? _options);
        return new ReportService(_cosmosClientMock.Object, optionsWrapper, _loggerMock.Object, _telemetryMock.Object);
    }

    [Fact]
    public async Task UpdateAsync_NoChanges_ReturnsExistingReport_And_NoPatchCall()
    {
        // Arrange
        var service = CreateService();
        var reportId = Guid.NewGuid().ToString();
        var existingReport = new Report
        {
            Id = reportId,
            CrimeGenre = "Genre",
            CrimeType = "Type",
            Description = "Desc",
            Location = "Loc",
            Region = "Reg",
            CrimeDate = DateTime.UtcNow,
            Status = "Pending",
            Resolved = false
        };

        var itemResponseMock = new Mock<ItemResponse<Report>>();
        itemResponseMock.Setup(r => r.Resource).Returns(existingReport);
        itemResponseMock.Setup(r => r.StatusCode).Returns(HttpStatusCode.OK);

        _containerMock.Setup(c => c.ReadItemAsync<Report>(reportId, It.IsAny<PartitionKey>(), It.IsAny<ItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(itemResponseMock.Object);

        var request = new UpdateReportRequest
        {
            CrimeGenre = "Genre", // Same
            CrimeType = "Type",   // Same
            // Other fields null
        };

        // Act
        var result = await service.UpdateAsync(reportId, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(existingReport.Id, result.Id);
        
        // Verify PatchItemAsync was NOT called
        _containerMock.Verify(c => c.PatchItemAsync<Report>(
            It.IsAny<string>(), 
            It.IsAny<PartitionKey>(), 
            It.IsAny<IReadOnlyList<PatchOperation>>(), 
            It.IsAny<PatchItemRequestOptions>(), 
            It.IsAny<CancellationToken>()), 
            Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_WithChanges_And_NullResourceResponse_ManuallyUpdatesObject()
    {
        // Arrange
        // Disable content response to trigger the manual update block logic (or simulate null resource)
        var options = new CosmosOptions
        {
            DatabaseId = "ReportsDb",
            ContainerId = "Reports",
            EnableContentResponseOnWrite = false 
        };
        var service = CreateService(options);
        
        var reportId = Guid.NewGuid().ToString();
        var existingReport = new Report
        {
            Id = reportId,
            CrimeGenre = "OldGenre",
            CrimeType = "OldType",
            Description = "OldDesc",
            Location = "OldLoc",
            Region = "OldReg",
            CrimeDate = DateTime.UtcNow.AddDays(-1),
            Status = "Pending",
            Resolved = false,
            ReporterDetails = new ReporterDetails { AgeGroup = "OldAge" }
        };

        var itemResponseMock = new Mock<ItemResponse<Report>>();
        itemResponseMock.Setup(r => r.Resource).Returns(existingReport);
        
        _containerMock.Setup(c => c.ReadItemAsync<Report>(reportId, It.IsAny<PartitionKey>(), It.IsAny<ItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(itemResponseMock.Object);

        // Mock PatchItemAsync to return a response with NULL Resource
        var patchResponseMock = new Mock<ItemResponse<Report>>();
        patchResponseMock.Setup(r => r.Resource).Returns((Report?)null!); // Simulate null return
        patchResponseMock.Setup(r => r.StatusCode).Returns(HttpStatusCode.OK);

        _containerMock.Setup(c => c.PatchItemAsync<Report>(
            reportId, 
            It.IsAny<PartitionKey>(), 
            It.IsAny<IReadOnlyList<PatchOperation>>(), 
            It.IsAny<PatchItemRequestOptions>(), 
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(patchResponseMock.Object);

        var newDate = DateTime.UtcNow;
        var request = new UpdateReportRequest
        {
            CrimeGenre = "NewGenre",
            CrimeType = "NewType",
            Description = "NewDesc",
            Location = "NewLoc",
            Region = "NewReg",
            CrimeDate = newDate,
            Status = "Approved",
            Resolved = true,
            ReporterDetails = new ReporterDetailsRequest { AgeGroup = "NewAge" }
        };

        // Act
        var result = await service.UpdateAsync(reportId, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        // Verify the returned object has the NEW values (applied manually)
        Assert.Equal("NewGenre", result.CrimeGenre);
        Assert.Equal("NewType", result.CrimeType);
        Assert.Equal("NewDesc", result.Description);
        Assert.Equal("NewLoc", result.Location);
        Assert.Equal("NewReg", result.Region);
        Assert.Equal("Approved", result.Status);
        Assert.True(result.Resolved);
        Assert.Equal("NewAge", result.ReporterDetails?.AgeGroup);
        
        // Verify PatchItemAsync WAS called
        _containerMock.Verify(c => c.PatchItemAsync<Report>(
            reportId, 
            It.IsAny<PartitionKey>(), 
            It.IsAny<IReadOnlyList<PatchOperation>>(), 
            It.IsAny<PatchItemRequestOptions>(), 
            It.IsAny<CancellationToken>()), 
            Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ReporterDetails_Logic_NullToNull_NoChange()
    {
        // Arrange
        var service = CreateService();
        var reportId = Guid.NewGuid().ToString();
        var existingReport = new Report
        {
            Id = reportId,
            ReporterDetails = null // Current is null
        };

        var itemResponseMock = new Mock<ItemResponse<Report>>();
        itemResponseMock.Setup(r => r.Resource).Returns(existingReport);
        _containerMock.Setup(c => c.ReadItemAsync<Report>(reportId, It.IsAny<PartitionKey>(), It.IsAny<ItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(itemResponseMock.Object);

        var request = new UpdateReportRequest
        {
            ReporterDetails = new ReporterDetailsRequest { AgeGroup = null } // New is effectively null/empty
        };

        // Act
        var result = await service.UpdateAsync(reportId, request, CancellationToken.None);

        // Assert
        _containerMock.Verify(c => c.PatchItemAsync<Report>(
            It.IsAny<string>(), 
            It.IsAny<PartitionKey>(), 
            It.IsAny<IReadOnlyList<PatchOperation>>(), 
            It.IsAny<PatchItemRequestOptions>(), 
            It.IsAny<CancellationToken>()), 
            Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_ReporterDetails_Logic_NullToValue_Change()
    {
        // Arrange
        var service = CreateService();
        var reportId = Guid.NewGuid().ToString();
        var existingReport = new Report
        {
            Id = reportId,
            ReporterDetails = null // Current is null
        };

        var itemResponseMock = new Mock<ItemResponse<Report>>();
        itemResponseMock.Setup(r => r.Resource).Returns(existingReport);
        _containerMock.Setup(c => c.ReadItemAsync<Report>(reportId, It.IsAny<PartitionKey>(), It.IsAny<ItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(itemResponseMock.Object);

        var patchResponseMock = new Mock<ItemResponse<Report>>();
        patchResponseMock.Setup(r => r.Resource).Returns(existingReport);
        _containerMock.Setup(c => c.PatchItemAsync<Report>(It.IsAny<string>(), It.IsAny<PartitionKey>(), It.IsAny<IReadOnlyList<PatchOperation>>(), It.IsAny<PatchItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(patchResponseMock.Object);

        var request = new UpdateReportRequest
        {
            ReporterDetails = new ReporterDetailsRequest { AgeGroup = "20-30" } // New has value
        };

        // Act
        await service.UpdateAsync(reportId, request, CancellationToken.None);

        // Assert
        _containerMock.Verify(c => c.PatchItemAsync<Report>(
            It.IsAny<string>(), 
            It.IsAny<PartitionKey>(), 
            It.Is<IReadOnlyList<PatchOperation>>(ops => ops.Any(op => op.Path == "/reporterDetails")), 
            It.IsAny<PatchItemRequestOptions>(), 
            It.IsAny<CancellationToken>()), 
            Times.Once);
    }
}
