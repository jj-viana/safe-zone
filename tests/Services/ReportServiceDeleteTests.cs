using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using Moq;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using ReportsApi.Tests.Services.Fakes;
using Xunit;

namespace ReportsApi.Tests.Services;

public class ReportServiceDeleteTests
{
    [Fact]
    public async Task DeleteAsync_WhenIdMissing_ReturnsFalseWithoutCosmosCalls()
    {
        var containerMock = new Mock<Container>(MockBehavior.Strict);
        var service = ReportServiceTestHelper.CreateService(containerMock);

        var result = await service.DeleteAsync("   ", CancellationToken.None);

        Assert.False(result);
        containerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task DeleteAsync_WhenCosmosDeletesItem_ReturnsTrueAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var response = new ItemResponseStub<Report>(new Report { Id = "id" }, 4.2);

        containerMock
            .Setup(c => c.DeleteItemAsync<Report>("id", It.IsAny<PartitionKey>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.DeleteAsync("id", CancellationToken.None);

        Assert.True(result);
        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportDelete",
            4.2,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["statusCode"] == response.StatusCode.ToString())), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenCosmosFails_RethrowsAndTracksFailure()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var exception = new CosmosException("boom", System.Net.HttpStatusCode.TooManyRequests, 429, string.Empty, 7.1);

        containerMock
            .Setup(c => c.DeleteItemAsync<Report>("id", It.IsAny<PartitionKey>(), null, It.IsAny<CancellationToken>()))
            .ThrowsAsync(exception);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var ex = await Assert.ThrowsAsync<CosmosException>(() => service.DeleteAsync("id", CancellationToken.None));
        Assert.Equal(exception.StatusCode, ex.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportDeleteFailed",
            exception.RequestCharge,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["statusCode"] == exception.StatusCode.ToString())), Times.Once);
    }
}
