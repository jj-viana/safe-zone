using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using Moq;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using ReportsApi.Services;
using Xunit;

namespace ReportsApi.Tests.Services;

public class ReportServiceCoverageTests
{
    private static CosmosException CreateCosmosException(HttpStatusCode statusCode, double requestCharge = 1d)
        => new("Cosmos failure", statusCode, (int)statusCode, Guid.NewGuid().ToString(), requestCharge);

    [Fact]
    public async Task CreateAsync_WhenGenericExceptionThrows_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Unexpected error");

        containerMock
            .Setup(c => c.CreateItemAsync<Report>(
                It.IsAny<Report>(),
                It.IsAny<PartitionKey?>(),
                It.IsAny<ItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var request = new CreateReportRequest
        {
            CrimeGenre = "Genre",
            CrimeType = "Type",
            Description = "Desc",
            Location = "Loc",
            Region = "Reg",
            CrimeDate = DateTime.UtcNow,
            Status = "Status",
            Resolved = false
        };

        var exception = await Assert.ThrowsAsync<Exception>(() => service.CreateAsync(request, CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task DeleteAsync_WhenCosmosThrowsNonNotFound_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.ServiceUnavailable, 2.5);

        containerMock
            .Setup(c => c.DeleteItemAsync<Report>(
                It.IsAny<string>(),
                It.IsAny<PartitionKey>(),
                It.IsAny<ItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.DeleteAsync("id", CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportDeleteFailed",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => d["statusCode"] == "ServiceUnavailable")), Times.Once);
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
                It.IsAny<ItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.DeleteAsync("id", CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task UpdateAsync_WhenPatchThrowsCosmosException_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.ServiceUnavailable, 3.0);
        var reportId = "report-id";

        // Mock ReadItemAsync to return success
        var existingReport = new Report { Id = reportId, Status = "Draft" };
        var itemResponseMock = new Mock<ItemResponse<Report>>();
        itemResponseMock.Setup(r => r.Resource).Returns(existingReport);
        itemResponseMock.Setup(r => r.StatusCode).Returns(HttpStatusCode.OK);

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(
                reportId,
                It.IsAny<PartitionKey>(),
                It.IsAny<ItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(itemResponseMock.Object);

        // Mock PatchItemAsync to throw
        containerMock
            .Setup(c => c.PatchItemAsync<Report>(
                reportId,
                It.IsAny<PartitionKey>(),
                It.IsAny<IReadOnlyList<PatchOperation>>(),
                It.IsAny<PatchItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var request = new UpdateReportRequest { Status = "Approved" }; // Trigger a patch operation

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.UpdateAsync(reportId, request, CancellationToken.None));
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

        // Mock ReadItemAsync to return success
        var existingReport = new Report { Id = reportId, Status = "Draft" };
        var itemResponseMock = new Mock<ItemResponse<Report>>();
        itemResponseMock.Setup(r => r.Resource).Returns(existingReport);

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(
                reportId,
                It.IsAny<PartitionKey>(),
                It.IsAny<ItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(itemResponseMock.Object);

        // Mock PatchItemAsync to throw
        containerMock
            .Setup(c => c.PatchItemAsync<Report>(
                reportId,
                It.IsAny<PartitionKey>(),
                It.IsAny<IReadOnlyList<PatchOperation>>(),
                It.IsAny<PatchItemRequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var request = new UpdateReportRequest { Status = "Approved" };

        var exception = await Assert.ThrowsAsync<Exception>(() => service.UpdateAsync(reportId, request, CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task CreateAsync_WithLocalAndUtcDates_NormalizesCorrectly()
    {
        // This test targets NormalizeDateTime coverage
        var containerMock = new Mock<Container>();
        Report? capturedReport = null;

        containerMock.Setup(c => c.CreateItemAsync<Report>(
            It.IsAny<Report>(), 
            It.IsAny<PartitionKey?>(), 
            It.IsAny<ItemRequestOptions>(), 
            It.IsAny<CancellationToken>()))
            .Callback<Report, PartitionKey?, ItemRequestOptions, CancellationToken>((r, p, o, t) => capturedReport = r)
            .ReturnsAsync(new Mock<ItemResponse<Report>>().Object);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        // Case 1: Local Time
        var localDate = DateTime.Now; // Local kind
        var requestLocal = new CreateReportRequest
        {
            CrimeGenre = "G", CrimeType = "T", Description = "D", Location = "L", Region = "R", Status = "S", Resolved = false,
            CrimeDate = localDate
        };
        await service.CreateAsync(requestLocal, CancellationToken.None);
        Assert.Equal(DateTimeKind.Utc, capturedReport!.CrimeDate.Kind);

        // Case 2: Utc Time
        var utcDate = DateTime.UtcNow; // Utc kind
        var requestUtc = new CreateReportRequest
        {
            CrimeGenre = "G", CrimeType = "T", Description = "D", Location = "L", Region = "R", Status = "S", Resolved = false,
            CrimeDate = utcDate
        };
        await service.CreateAsync(requestUtc, CancellationToken.None);
        Assert.Equal(DateTimeKind.Utc, capturedReport.CrimeDate.Kind);
        Assert.Equal(utcDate, capturedReport.CrimeDate);
    }

    [Fact]
    public async Task GetAllAsync_WhenGenericExceptionThrows_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Unexpected error");

        var feedIteratorMock = new Mock<FeedIterator<Report>>();
        feedIteratorMock.Setup(f => f.HasMoreResults).Returns(true);
        feedIteratorMock.Setup(f => f.ReadNextAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(feedIteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.GetAllAsync(null, CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task GetAllAsync_WhenCosmosExceptionThrows_WithStatusFilter_TracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.ServiceUnavailable, 1.5);
        var status = "Pending";

        var feedIteratorMock = new Mock<FeedIterator<Report>>();
        feedIteratorMock.Setup(f => f.HasMoreResults).Returns(true);
        feedIteratorMock.Setup(f => f.ReadNextAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<QueryDefinition>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(feedIteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.GetAllAsync(status, CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryAllFailed",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => d["statusCode"] == "ServiceUnavailable" && d["status"] == status)), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithPartialReporterDetails_TrimsAndSavesCorrectly()
    {
        var containerMock = new Mock<Container>();
        Report? capturedReport = null;

        containerMock.Setup(c => c.CreateItemAsync<Report>(
            It.IsAny<Report>(),
            It.IsAny<PartitionKey?>(),
            It.IsAny<ItemRequestOptions>(),
            It.IsAny<CancellationToken>()))
            .Callback<Report, PartitionKey?, ItemRequestOptions, CancellationToken>((r, p, o, t) => capturedReport = r)
            .ReturnsAsync(new Mock<ItemResponse<Report>>().Object);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var request = new CreateReportRequest
        {
            CrimeGenre = "Genre",
            CrimeType = "Type",
            Description = "Desc",
            Location = "Loc",
            Region = "Reg",
            CrimeDate = DateTime.UtcNow,
            Status = "Status",
            Resolved = false,
            ReporterDetails = new ReporterDetailsRequest
            {
                AgeGroup = "  Adult  ",
                Ethnicity = null, // Null field
                GenderIdentity = "  Male  ",
                SexualOrientation = null // Null field
            }
        };

        await service.CreateAsync(request, CancellationToken.None);

        Assert.NotNull(capturedReport);
        Assert.NotNull(capturedReport.ReporterDetails);
        Assert.Equal("Adult", capturedReport.ReporterDetails.AgeGroup);
        Assert.Null(capturedReport.ReporterDetails.Ethnicity);
        Assert.Equal("Male", capturedReport.ReporterDetails.GenderIdentity);
        Assert.Null(capturedReport.ReporterDetails.SexualOrientation);
    }

    [Fact]
    public async Task GetAllAsync_WhenCosmosExceptionThrows_WithoutStatusFilter_TracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.ServiceUnavailable, 1.5);

        var feedIteratorMock = new Mock<FeedIterator<Report>>();
        feedIteratorMock.Setup(f => f.HasMoreResults).Returns(true);
        feedIteratorMock.Setup(f => f.ReadNextAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(feedIteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.GetAllAsync(null, CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryAllFailed",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => d["statusCode"] == "ServiceUnavailable" && !d.ContainsKey("status"))), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WhenIdIsInvalid_ThrowsArgumentException()
    {
        var service = ReportServiceTestHelper.CreateService(new Mock<Container>());
        var request = new UpdateReportRequest();

        await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateAsync(null!, request, CancellationToken.None));
        await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateAsync("", request, CancellationToken.None));
        await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateAsync("   ", request, CancellationToken.None));
    }

    [Fact]
    public async Task CreateAsync_WithPartialReporterDetails_InvertedNulls_TrimsAndSavesCorrectly()
    {
        var containerMock = new Mock<Container>();
        Report? capturedReport = null;

        containerMock.Setup(c => c.CreateItemAsync<Report>(
            It.IsAny<Report>(),
            It.IsAny<PartitionKey?>(),
            It.IsAny<ItemRequestOptions>(),
            It.IsAny<CancellationToken>()))
            .Callback<Report, PartitionKey?, ItemRequestOptions, CancellationToken>((r, p, o, t) => capturedReport = r)
            .ReturnsAsync(new Mock<ItemResponse<Report>>().Object);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var request = new CreateReportRequest
        {
            CrimeGenre = "Genre",
            CrimeType = "Type",
            Description = "Desc",
            Location = "Loc",
            Region = "Reg",
            CrimeDate = DateTime.UtcNow,
            Status = "Status",
            Resolved = false,
            ReporterDetails = new ReporterDetailsRequest
            {
                AgeGroup = null, // Null field
                Ethnicity = "  Latino  ",
                GenderIdentity = null, // Null field
                SexualOrientation = "  Heterosexual  "
            }
        };

        await service.CreateAsync(request, CancellationToken.None);

        Assert.NotNull(capturedReport);
        Assert.NotNull(capturedReport.ReporterDetails);
        Assert.Null(capturedReport.ReporterDetails.AgeGroup);
        Assert.Equal("Latino", capturedReport.ReporterDetails.Ethnicity);
        Assert.Null(capturedReport.ReporterDetails.GenderIdentity);
        Assert.Equal("Heterosexual", capturedReport.ReporterDetails.SexualOrientation);
    }

    [Fact]
    public async Task GetByCrimeTypeAsync_WhenCosmosExceptionThrows_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.ServiceUnavailable, 1.5);
        var crimeType = "Theft";

        var feedIteratorMock = new Mock<FeedIterator<Report>>();
        feedIteratorMock.Setup(f => f.HasMoreResults).Returns(true);
        feedIteratorMock.Setup(f => f.ReadNextAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<QueryDefinition>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(feedIteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.GetByCrimeTypeAsync(crimeType, CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryByTypeFailed",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => d["statusCode"] == "ServiceUnavailable" && d["crimeType"] == crimeType)), Times.Once);
    }

    [Fact]
    public async Task GetByCrimeTypeAsync_WhenGenericExceptionThrows_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Unexpected error");

        var feedIteratorMock = new Mock<FeedIterator<Report>>();
        feedIteratorMock.Setup(f => f.HasMoreResults).Returns(true);
        feedIteratorMock.Setup(f => f.ReadNextAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<QueryDefinition>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(feedIteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.GetByCrimeTypeAsync("Theft", CancellationToken.None));
        Assert.Same(expectedException, exception);
    }

    [Fact]
    public async Task GetByCrimeGenreAsync_WhenCosmosExceptionThrows_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var cosmosException = CreateCosmosException(HttpStatusCode.ServiceUnavailable, 1.5);
        var crimeGenre = "Violent";

        var feedIteratorMock = new Mock<FeedIterator<Report>>();
        feedIteratorMock.Setup(f => f.HasMoreResults).Returns(true);
        feedIteratorMock.Setup(f => f.ReadNextAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(cosmosException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<QueryDefinition>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(feedIteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<CosmosException>(() => service.GetByCrimeGenreAsync(crimeGenre, CancellationToken.None));
        Assert.Equal(cosmosException.StatusCode, exception.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryByGenreFailed",
            cosmosException.RequestCharge,
            It.Is<Dictionary<string, string?>>(d => d["statusCode"] == "ServiceUnavailable" && d["crimeGenre"] == crimeGenre)), Times.Once);
    }

    [Fact]
    public async Task GetByCrimeGenreAsync_WhenGenericExceptionThrows_Rethrows()
    {
        var containerMock = new Mock<Container>();
        var expectedException = new Exception("Unexpected error");

        var feedIteratorMock = new Mock<FeedIterator<Report>>();
        feedIteratorMock.Setup(f => f.HasMoreResults).Returns(true);
        feedIteratorMock.Setup(f => f.ReadNextAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(
                It.IsAny<QueryDefinition>(),
                It.IsAny<string>(),
                It.IsAny<QueryRequestOptions>()))
            .Returns(feedIteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<Exception>(() => service.GetByCrimeGenreAsync("Violent", CancellationToken.None));
        Assert.Same(expectedException, exception);
    }
}
