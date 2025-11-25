using System;
using System.Collections.Generic;
using System.Net;
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

public class ReportServiceExceptionTests
{
    private static CosmosException CreateCosmosException(HttpStatusCode statusCode, double requestCharge = 1d)
        => new("Cosmos failure", statusCode, (int)statusCode, Guid.NewGuid().ToString(), requestCharge);

    private static CreateReportRequest BuildCreateRequest() => new()
    {
        CrimeGenre = "Hate Crime",
        CrimeType = "Assault",
        Description = "Incident description",
        Location = "Central Park",
        Region = "Taguatinga",
        CrimeDate = DateTime.UtcNow,
        Status = "Draft",
        Resolved = false
    };

    [Fact]
    public async Task CreateAsync_WhenCosmosThrows_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.Gone, 5.7);

        containerMock
            .Setup(c => c.CreateItemAsync(
                It.IsAny<Report>(),
                It.IsAny<PartitionKey>(),
                It.IsAny<ItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.CreateAsync(BuildCreateRequest(), CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportCreateFailed",
            cosmosException.RequestCharge,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["statusCode"] == HttpStatusCode.Gone.ToString())), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WhenGenericExceptionThrows_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Unexpected error");

        containerMock
            .Setup(c => c.CreateItemAsync(
                It.IsAny<Report>(),
                It.IsAny<PartitionKey>(),
                It.IsAny<ItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.CreateAsync(BuildCreateRequest(), CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task DeleteAsync_WhenCosmosReturnsNotFound_ReturnsFalseAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.NotFound, 2);

        containerMock
            .Setup(c => c.DeleteItemAsync<Report>(
                It.IsAny<string>(),
                It.IsAny<PartitionKey>(),
                null,
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.DeleteAsync("missing-id", CancellationToken.None);

        Assert.False(result);
        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportDeleteNotFound",
            cosmosException.RequestCharge,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["statusCode"] == HttpStatusCode.NotFound.ToString())), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenCosmosThrows_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.ServiceUnavailable, 2);

        containerMock
            .Setup(c => c.DeleteItemAsync<Report>(
                It.IsAny<string>(),
                It.IsAny<PartitionKey>(),
                null,
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.DeleteAsync("id", CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportDeleteFailed",
            cosmosException.RequestCharge,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["statusCode"] == HttpStatusCode.ServiceUnavailable.ToString())), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenGenericExceptionThrows_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Unexpected error");

        containerMock
            .Setup(c => c.DeleteItemAsync<Report>(
                It.IsAny<string>(),
                It.IsAny<PartitionKey>(),
                null,
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.DeleteAsync("id", CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task GetByIdAsync_WhenCosmosReturnsNotFound_ReturnsNullAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.NotFound, 1.5);

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(
                It.IsAny<string>(),
                It.IsAny<PartitionKey>(),
                null,
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.GetByIdAsync("missing-id", CancellationToken.None);

        Assert.Null(result);
        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportReadByIdNotFound",
            cosmosException.RequestCharge,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["statusCode"] == HttpStatusCode.NotFound.ToString())), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_WhenCosmosThrows_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.ServiceUnavailable, 1.5);

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(
                It.IsAny<string>(),
                It.IsAny<PartitionKey>(),
                null,
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.GetByIdAsync("id", CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportReadByIdFailed",
            cosmosException.RequestCharge,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["statusCode"] == HttpStatusCode.ServiceUnavailable.ToString())), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_WhenGenericExceptionThrows_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Unexpected error");

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(
                It.IsAny<string>(),
                It.IsAny<PartitionKey>(),
                null,
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.GetByIdAsync("id", CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task GetAllAsync_WhenCosmosThrows_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.ServiceUnavailable, 10.5);

        var iteratorMock = new Mock<FeedIterator<Report>>();
        iteratorMock.Setup(i => i.HasMoreResults).Returns(true);
        iteratorMock.Setup(i => i.ReadNextAsync(It.IsAny<CancellationToken>())).ThrowsAsync(cosmosException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<QueryDefinition>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorMock.Object);
        
        // Also setup for the overload without QueryDefinition if needed, though GetAllAsync uses one or the other based on status
        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.GetAllAsync(null, CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryAllFailed",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => d["statusCode"] == "ServiceUnavailable")), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_WhenGenericExceptionThrows_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Unexpected error");

        var iteratorMock = new Mock<FeedIterator<Report>>();
        iteratorMock.Setup(i => i.HasMoreResults).Returns(true);
        iteratorMock.Setup(i => i.ReadNextAsync(It.IsAny<CancellationToken>())).ThrowsAsync(expectedException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<string?>(),
                It.IsAny<string?>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.GetAllAsync(null, CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task GetByCrimeGenreAsync_WhenCosmosThrows_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.TooManyRequests, 8.2);

        var iteratorMock = new Mock<FeedIterator<Report>>();
        iteratorMock.Setup(i => i.HasMoreResults).Returns(true);
        iteratorMock.Setup(i => i.ReadNextAsync(It.IsAny<CancellationToken>())).ThrowsAsync(cosmosException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<QueryDefinition>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.GetByCrimeGenreAsync("Hate Crime", CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryByGenreFailed",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => 
                d["statusCode"] == "TooManyRequests" && 
                d["crimeGenre"] == "Hate Crime")), Times.Once);
    }

    [Fact]
    public async Task GetByCrimeGenreAsync_WhenGenericExceptionThrows_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Unexpected error");

        var iteratorMock = new Mock<FeedIterator<Report>>();
        iteratorMock.Setup(i => i.HasMoreResults).Returns(true);
        iteratorMock.Setup(i => i.ReadNextAsync(It.IsAny<CancellationToken>())).ThrowsAsync(expectedException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<QueryDefinition>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.GetByCrimeGenreAsync("Genre", CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task GetByCrimeTypeAsync_WhenCosmosThrows_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.TooManyRequests, 8.2);

        var iteratorMock = new Mock<FeedIterator<Report>>();
        iteratorMock.Setup(i => i.HasMoreResults).Returns(true);
        iteratorMock.Setup(i => i.ReadNextAsync(It.IsAny<CancellationToken>())).ThrowsAsync(cosmosException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<QueryDefinition>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.GetByCrimeTypeAsync("Type", CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryByTypeFailed",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => d["statusCode"] == "TooManyRequests" && d["crimeType"] == "Type")), Times.Once);
    }

    [Fact]
    public async Task GetByCrimeTypeAsync_WhenGenericExceptionThrows_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Unexpected error");

        var iteratorMock = new Mock<FeedIterator<Report>>();
        iteratorMock.Setup(i => i.HasMoreResults).Returns(true);
        iteratorMock.Setup(i => i.ReadNextAsync(It.IsAny<CancellationToken>())).ThrowsAsync(expectedException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<QueryDefinition>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.GetByCrimeTypeAsync("Type", CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task Initialization_WhenCosmosThrows_RethrowsAndTracksTelemetry()
    {
        // Arrange
        var cosmosClientMock = new Mock<CosmosClient>();
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var logger = Mock.Of<ILogger<ReportService>>();
        var options = new CosmosOptions { DatabaseId = "Db", ContainerId = "Cont" };
        
        var cosmosException = CreateCosmosException(HttpStatusCode.Unauthorized, 2.0);

        cosmosClientMock
            .Setup(c => c.CreateDatabaseIfNotExistsAsync(
                It.IsAny<string>(),
                It.IsAny<int?>(),
                It.IsAny<RequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var service = new ReportService(cosmosClientMock.Object, Options.Create(options), logger, telemetryMock.Object);

        // Act & Assert
        // Calling CreateAsync will trigger GetContainerAsync -> Initialization
        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.CreateAsync(BuildCreateRequest(), CancellationToken.None));
        
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);
        
        telemetryMock.Verify(t => t.TrackRequestUnits(
            "CosmosInitializationFailed",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => d["statusCode"] == "Unauthorized")), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WhenReadThrowsCosmosException_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.ServiceUnavailable, 5.0);
        var reportId = "report-id";

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(
                reportId,
                It.Is<PartitionKey>(pk => pk == new PartitionKey(reportId)),
                It.IsAny<ItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.UpdateAsync(reportId, new UpdateReportRequest(), CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportUpdateReadFailed",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => d["statusCode"] == "ServiceUnavailable")), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WhenReadThrowsGenericException_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Read failed");
        var reportId = "report-id";

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(
                reportId,
                It.IsAny<PartitionKey>(),
                It.IsAny<ItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.UpdateAsync(reportId, new UpdateReportRequest(), CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task UpdateAsync_WhenPatchThrowsCosmosException_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.ServiceUnavailable, 5.0);
        var reportId = "report-id";
        var existingReport = new Report { Id = reportId, Status = "Draft" };

        // Mock ReadItemAsync to succeed
        var itemResponseMock = new Mock<ItemResponse<Report>>();
        itemResponseMock.Setup(r => r.Resource).Returns(existingReport);
        containerMock
            .Setup(c => c.ReadItemAsync<Report>(reportId, It.IsAny<PartitionKey>(), It.IsAny<ItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(itemResponseMock.Object);

        // Mock PatchItemAsync to fail
        containerMock
            .Setup(c => c.PatchItemAsync<Report>(
                reportId,
                It.IsAny<PartitionKey>(),
                It.IsAny<IReadOnlyList<PatchOperation>>(),
                It.IsAny<PatchItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.UpdateAsync(reportId, new UpdateReportRequest { Status = "Approved" }, CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportUpdatePatchFailed",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => d["statusCode"] == "ServiceUnavailable")), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WhenPatchThrowsGenericException_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Patch failed");
        var reportId = "report-id";
        var existingReport = new Report { Id = reportId, Status = "Draft" };

        // Mock ReadItemAsync to succeed
        var itemResponseMock = new Mock<ItemResponse<Report>>();
        itemResponseMock.Setup(r => r.Resource).Returns(existingReport);
        containerMock
            .Setup(c => c.ReadItemAsync<Report>(reportId, It.IsAny<PartitionKey>(), It.IsAny<ItemRequestOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(itemResponseMock.Object);

        // Mock PatchItemAsync to fail
        containerMock
            .Setup(c => c.PatchItemAsync<Report>(
                reportId,
                It.IsAny<PartitionKey>(),
                It.IsAny<IReadOnlyList<PatchOperation>>(),
                It.IsAny<PatchItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.UpdateAsync(reportId, new UpdateReportRequest { Status = "Approved" }, CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task UpdateAsync_WhenReportNotFound_ReturnsNullAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.NotFound, 1.5);
        var reportId = "missing-id";

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(
                reportId,
                It.IsAny<PartitionKey>(),
                It.IsAny<ItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.UpdateAsync(reportId, new UpdateReportRequest(), CancellationToken.None);

        Assert.Null(result);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportUpdateReadMissing",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => d["statusCode"] == "NotFound")), Times.Once);
    }
}
