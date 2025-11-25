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

namespace tests.Services;

public class ReportServiceInitializationTests
{
    private readonly Mock<CosmosClient> _cosmosClientMock;
    private readonly Mock<ICosmosTelemetry> _telemetryMock;
    private readonly Mock<ILogger<ReportService>> _loggerMock;
    private readonly CosmosOptions _options;

    public ReportServiceInitializationTests()
    {
        _cosmosClientMock = new Mock<CosmosClient>();
        _telemetryMock = new Mock<ICosmosTelemetry>();
        _loggerMock = new Mock<ILogger<ReportService>>();
        _options = new CosmosOptions
        {
            DatabaseId = "ReportsDb",
            ContainerId = "Reports"
        };
    }

    private ReportService CreateService()
    {
        return new ReportService(_cosmosClientMock.Object, Options.Create(_options), _loggerMock.Object, _telemetryMock.Object);
    }

    [Fact]
    public async Task CreateAsync_WhenCosmosInitializationFailsWithCosmosException_ThrowsCosmosException()
    {
        // Arrange
        var service = CreateService();
        var cosmosException = new CosmosException("Simulated failure", HttpStatusCode.ServiceUnavailable, 0, "activity", 1.0);
        
        _cosmosClientMock.Setup(c => c.CreateDatabaseIfNotExistsAsync(It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var request = new CreateReportRequest
        {
            CrimeGenre = "Genre",
            CrimeType = "Type",
            Description = "Desc",
            Location = "Loc",
            Region = "Reg",
            CrimeDate = DateTime.UtcNow,
            Status = "Pending",
            Resolved = false
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<CosmosException>(() => service.CreateAsync(request, CancellationToken.None));
        Assert.Equal(HttpStatusCode.ServiceUnavailable, ex.StatusCode);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Critical,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Failed to initialize Cosmos resources")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WhenCosmosInitializationFailsWithGenericException_ThrowsException()
    {
        // Arrange
        var service = CreateService();
        var exception = new Exception("Unexpected failure");
        
        _cosmosClientMock.Setup(c => c.CreateDatabaseIfNotExistsAsync(It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(exception);

        var request = new CreateReportRequest
        {
            CrimeGenre = "Genre",
            CrimeType = "Type",
            Description = "Desc",
            Location = "Loc",
            Region = "Reg",
            CrimeDate = DateTime.UtcNow,
            Status = "Pending",
            Resolved = false
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<Exception>(() => service.CreateAsync(request, CancellationToken.None));
        Assert.Equal("Unexpected failure", ex.Message);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Critical,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Unexpected error while initializing Cosmos resources")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task GetContainerAsync_WhenCalledTwice_ReturnsCachedContainer()
    {
        // Arrange
        var service = CreateService();
        
        _cosmosClientMock.Setup(c => c.CreateDatabaseIfNotExistsAsync(It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Mock.Of<DatabaseResponse>(r => r.Database == Mock.Of<Database>()));
        
        var containerMock = new Mock<Container>();
        var databaseMock = Mock.Get(Mock.Of<Database>()); // This won't work as expected with the previous line setup.
        
        // Better setup
        var databaseObj = new Mock<Database>();
        _cosmosClientMock.Setup(c => c.CreateDatabaseIfNotExistsAsync(It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Mock.Of<DatabaseResponse>(r => r.Database == databaseObj.Object));

        databaseObj.Setup(d => d.CreateContainerIfNotExistsAsync(It.IsAny<ContainerProperties>(), It.IsAny<int?>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Mock.Of<ContainerResponse>(r => r.Container == containerMock.Object));

        // Mock CreateItemAsync for the CreateAsync call
        containerMock.Setup(c => c.CreateItemAsync(It.IsAny<Report>(), It.IsAny<PartitionKey>(), It.IsAny<ItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Mock.Of<ItemResponse<Report>>(r => r.Resource == new Report()));

        var request = new CreateReportRequest
        {
            CrimeGenre = "Genre",
            CrimeType = "Type",
            Description = "Desc",
            Location = "Loc",
            Region = "Reg",
            CrimeDate = DateTime.UtcNow,
            Status = "Pending",
            Resolved = false
        };

        // Act
        await service.CreateAsync(request, CancellationToken.None); // First call initializes
        await service.CreateAsync(request, CancellationToken.None); // Second call should use cached

        // Assert
        // Verify CreateDatabase/CreateContainer were called ONLY ONCE
        _cosmosClientMock.Verify(c => c.CreateDatabaseIfNotExistsAsync(It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()), Times.Once);
        databaseObj.Verify(d => d.CreateContainerIfNotExistsAsync(It.IsAny<ContainerProperties>(), It.IsAny<int?>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
