using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using Moq;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using ReportsApi.Tests.Services.Fakes;
using Xunit;

namespace ReportsApi.Tests.Services;

public class ReportServiceGetByIdTests
{
    [Fact]
    public async Task GetByIdAsync_WhenIdMissing_ThrowsArgumentException()
    {
        var containerMock = new Mock<Container>(MockBehavior.Strict);
        var service = ReportServiceTestHelper.CreateService(containerMock);

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => service.GetByIdAsync(" ", CancellationToken.None));
        Assert.Equal("id", exception.ParamName);
    }

    [Fact]
    public async Task GetByIdAsync_WhenItemExists_ReturnsResponseAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var report = new Report { Id = "id", CrimeGenre = "Hate", CrimeType = "Assault", Description = "d", Location = "loc", Region = "reg", CrimeDate = DateTime.UtcNow, Status = "Draft", Resolved = false };
        var itemResponse = new ItemResponseStub<Report>(report, 3.3);

        containerMock
            .Setup(c => c.ReadItemAsync<Report>("id", It.IsAny<PartitionKey>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(itemResponse);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.GetByIdAsync("id", CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("id", result!.Id);
        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportReadById",
            3.3,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["statusCode"] == itemResponse.StatusCode.ToString())), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_WhenCosmosFails_RethrowsAndTracksFailure()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var exception = new CosmosException("boom", System.Net.HttpStatusCode.RequestTimeout, 408, string.Empty, 2.1);

        containerMock
            .Setup(c => c.ReadItemAsync<Report>("id", It.IsAny<PartitionKey>(), null, It.IsAny<CancellationToken>()))
            .ThrowsAsync(exception);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var ex = await Assert.ThrowsAsync<CosmosException>(() => service.GetByIdAsync("id", CancellationToken.None));
        Assert.Equal(exception.StatusCode, ex.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportReadByIdFailed",
            exception.RequestCharge,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["statusCode"] == exception.StatusCode.ToString())), Times.Once);
    }
}
