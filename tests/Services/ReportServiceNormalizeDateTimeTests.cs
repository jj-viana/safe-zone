using System;
using System.Threading;
using System.Threading.Tasks;
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

public class ReportServiceNormalizeDateTimeTests
{
    private readonly Mock<CosmosClient> _cosmosClientMock;
    private readonly Mock<IOptions<CosmosOptions>> _optionsMock;
    private readonly Mock<ILogger<ReportService>> _loggerMock;
    private readonly Mock<ICosmosTelemetry> _cosmosTelemetryMock;
    private readonly ReportService _service;
    private readonly Mock<Container> _containerMock;

    public ReportServiceNormalizeDateTimeTests()
    {
        _cosmosClientMock = new Mock<CosmosClient>();
        _optionsMock = new Mock<IOptions<CosmosOptions>>();
        _loggerMock = new Mock<ILogger<ReportService>>();
        _cosmosTelemetryMock = new Mock<ICosmosTelemetry>();

        _optionsMock.Setup(o => o.Value).Returns(new CosmosOptions
        {
            ConnectionString = "AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==",
            DatabaseId = "TestDb",
            ContainerId = "TestContainer"
        });

        _containerMock = new Mock<Container>();
        var databaseMock = new Mock<Database>();
        
        _cosmosClientMock.Setup(c => c.CreateDatabaseIfNotExistsAsync(It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Mock.Of<DatabaseResponse>(r => r.Database == databaseMock.Object));
            
        databaseMock.Setup(d => d.CreateContainerIfNotExistsAsync(It.IsAny<ContainerProperties>(), It.IsAny<int?>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Mock.Of<ContainerResponse>(r => r.Container == _containerMock.Object));

        _service = new ReportService(
            _cosmosClientMock.Object,
            _optionsMock.Object,
            _loggerMock.Object,
            _cosmosTelemetryMock.Object);
    }

    [Fact]
    public async Task CreateAsync_WithUtcDate_PreservesUtcKind()
    {
        // Arrange
        var utcDate = DateTime.UtcNow;
        var request = CreateRequest(utcDate);
        
        SetupCreateItem();

        // Act
        await _service.CreateAsync(request, CancellationToken.None);

        // Assert
        _containerMock.Verify(c => c.CreateItemAsync(
            It.Is<Report>(r => r.CrimeDate.Kind == DateTimeKind.Utc && r.CrimeDate == utcDate),
            It.IsAny<PartitionKey>(),
            It.IsAny<ItemRequestOptions>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithLocalDate_ConvertsToUtc()
    {
        // Arrange
        var localDate = DateTime.Now;
        var request = CreateRequest(localDate);
        
        SetupCreateItem();

        // Act
        await _service.CreateAsync(request, CancellationToken.None);

        // Assert
        _containerMock.Verify(c => c.CreateItemAsync(
            It.Is<Report>(r => r.CrimeDate.Kind == DateTimeKind.Utc && r.CrimeDate == localDate.ToUniversalTime()),
            It.IsAny<PartitionKey>(),
            It.IsAny<ItemRequestOptions>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithUnspecifiedDate_TreatsAsUtc()
    {
        // Arrange
        var unspecifiedDate = new DateTime(2023, 1, 1, 12, 0, 0, DateTimeKind.Unspecified);
        var request = CreateRequest(unspecifiedDate);
        
        SetupCreateItem();

        // Act
        await _service.CreateAsync(request, CancellationToken.None);

        // Assert
        _containerMock.Verify(c => c.CreateItemAsync(
            It.Is<Report>(r => r.CrimeDate.Kind == DateTimeKind.Utc && r.CrimeDate == unspecifiedDate),
            It.IsAny<PartitionKey>(),
            It.IsAny<ItemRequestOptions>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    private CreateReportRequest CreateRequest(DateTime crimeDate)
    {
        return new CreateReportRequest
        {
            CrimeGenre = "Genre",
            CrimeType = "Type",
            Description = "Desc",
            Location = "Loc",
            Region = "Reg",
            CrimeDate = crimeDate,
            Status = "Pending",
            Resolved = false
        };
    }

    private void SetupCreateItem()
    {
        _containerMock.Setup(c => c.CreateItemAsync(It.IsAny<Report>(), It.IsAny<PartitionKey>(), It.IsAny<ItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Mock.Of<ItemResponse<Report>>(r => r.Resource == new Report()));
    }
}
