using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using Moq;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using ReportsApi.Services;
using ReportsApi.Tests.Services.Fakes;
using Xunit;

namespace ReportsApi.Tests.Services;

public class ReportServiceQueryTests
{
    [Fact]
    public async Task GetAllAsync_WhenIteratorReturnsMultiplePages_AggregatesResultsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();

        var reportsPage1 = new List<Report>
        {
            new()
            {
                Id = "1",
                CrimeGenre = "Hate Crime",
                CrimeType = "Assault",
                Description = "Desc",
                Location = "A",
                Region = "B",
                CrimeDate = DateTime.UtcNow,
                Status = "Draft",
                Resolved = false
            }
        };

        var reportsPage2 = new List<Report>
        {
            new()
            {
                Id = "2",
                CrimeGenre = "Crime",
                CrimeType = "Theft",
                Description = "Desc",
                Location = "C",
                Region = "D",
                CrimeDate = DateTime.UtcNow,
                Status = "Approved",
                Resolved = true
            },
            new()
            {
                Id = "3",
                CrimeGenre = "Crime",
                CrimeType = "Theft",
                Description = "Desc",
                Location = "E",
                Region = "F",
                CrimeDate = DateTime.UtcNow,
                Status = "Approved",
                Resolved = false
            }
        };

        var iteratorStub = new FeedIteratorStub<Report>(new[]
        {
            new FeedResponseStub<Report>(reportsPage1, 3.5),
            new FeedResponseStub<Report>(reportsPage2, 2.5)
        });

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorStub);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.GetAllAsync(null, CancellationToken.None);

        Assert.Equal(3, result.Count);
        Assert.Contains(result, r => r.Id == "1");
        Assert.Contains(result, r => r.Id == "2");
        Assert.Equal("Approved", result.Single(r => r.Id == "2").Status);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryAllPage",
            It.IsAny<double>(),
            It.Is<IReadOnlyDictionary<string, string?>>(d => d.ContainsKey("pageIndex"))), Times.Exactly(2));

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryAllTotal",
            6,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["pages"] == "2")), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_WithStatusFilter_UsesQueryDefinition()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        QueryDefinition? capturedQuery = null;

        var iteratorStub = new FeedIteratorStub<Report>(new[]
        {
            new FeedResponseStub<Report>(Enumerable.Empty<Report>(), 1)
        });

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(It.IsAny<QueryDefinition>(), It.IsAny<string?>(), It.IsAny<QueryRequestOptions>()))
            .Callback<QueryDefinition, string?, QueryRequestOptions>((query, _, _) => capturedQuery = query)
            .Returns(iteratorStub);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        await service.GetAllAsync(" Approved ", CancellationToken.None);

        Assert.NotNull(capturedQuery);
        Assert.Contains("c.status", capturedQuery!.QueryText, StringComparison.OrdinalIgnoreCase);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryAllPage",
            It.IsAny<double>(),
            It.Is<IReadOnlyDictionary<string, string?>>(d => d.TryGetValue("status", out var status) && status == "Approved")), Times.Once);
    }

    [Fact]
    public async Task GetByCrimeGenreAsync_WhenIteratorReturnsPages_ReturnsResultsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();

        var iteratorStub = new FeedIteratorStub<Report>(new[]
        {
            new FeedResponseStub<Report>(new[]
            {
                new Report { Id = "1", CrimeGenre = "Hate", CrimeType = "Assault", Description = "d", Location = "l", Region = "r", CrimeDate = DateTime.UtcNow, Status = "Draft", Resolved = false }
            }, 1.2),
            new FeedResponseStub<Report>(new[]
            {
                new Report { Id = "2", CrimeGenre = "Hate", CrimeType = "Assault", Description = "d", Location = "l", Region = "r", CrimeDate = DateTime.UtcNow, Status = "Approved", Resolved = true }
            }, 0.8)
        });

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(It.IsAny<QueryDefinition>(), It.IsAny<string?>(), It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorStub);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.GetByCrimeGenreAsync(" Hate Crime ", CancellationToken.None);

        Assert.Equal(2, result.Count);
        Assert.All(result, r => Assert.Equal("Hate", r.CrimeGenre));

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryByGenrePage",
            It.IsAny<double>(),
            It.Is<IReadOnlyDictionary<string, string?>>(d => d.ContainsKey("crimeGenre"))), Times.Exactly(2));

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryByGenreTotal",
            2.0,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["pages"] == "2")), Times.Once);
    }

    [Fact]
    public async Task GetByCrimeTypeAsync_WhenIteratorReturnsPages_ReturnsResultsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();

        var iteratorStub = new FeedIteratorStub<Report>(new[]
        {
            new FeedResponseStub<Report>(new[]
            {
                new Report { Id = "1", CrimeGenre = "Crime", CrimeType = "Theft", Description = "d", Location = "l", Region = "r", CrimeDate = DateTime.UtcNow, Status = "Draft", Resolved = false }
            }, 1.2),
            new FeedResponseStub<Report>(new[]
            {
                new Report { Id = "2", CrimeGenre = "Crime", CrimeType = "Theft", Description = "d", Location = "l", Region = "r", CrimeDate = DateTime.UtcNow, Status = "Approved", Resolved = true }
            }, 0.8)
        });

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(It.IsAny<QueryDefinition>(), It.IsAny<string?>(), It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorStub);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.GetByCrimeTypeAsync(" Theft ", CancellationToken.None);

        Assert.Equal(2, result.Count);
        Assert.All(result, r => Assert.Equal("Theft", r.CrimeType));

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryByTypePage",
            It.IsAny<double>(),
            It.Is<IReadOnlyDictionary<string, string?>>(d => d.ContainsKey("crimeType"))), Times.Exactly(2));

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryByTypeTotal",
            2.0,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["pages"] == "2")), Times.Once);
    }

    [Fact]
    public async Task GetByCrimeTypeAsync_WhenIteratorReturnsEmptyPage_ReturnsEmptyList()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();

        var iteratorStub = new FeedIteratorStub<Report>(new[]
        {
            new FeedResponseStub<Report>(Enumerable.Empty<Report>(), 1.0)
        });

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(It.IsAny<QueryDefinition>(), It.IsAny<string?>(), It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorStub);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.GetByCrimeTypeAsync("Theft", CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByCrimeTypeAsync_WhenReadNextThrows_RethrowsAndTracksTelemetry()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var iteratorMock = new Mock<FeedIterator<Report>>();
        var exception = new CosmosException("failure", System.Net.HttpStatusCode.InternalServerError, 500, string.Empty, 5.5);

        iteratorMock
            .SetupSequence(i => i.HasMoreResults)
            .Returns(true)
            .Returns(false);

        iteratorMock
            .Setup(i => i.ReadNextAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(exception);

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(It.IsAny<QueryDefinition>(), It.IsAny<string?>(), It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorMock.Object);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var ex = await Assert.ThrowsAsync<CosmosException>(() => service.GetByCrimeTypeAsync("Theft", CancellationToken.None));
        Assert.Equal(exception.StatusCode, ex.StatusCode);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportQueryByTypeFailed",
            exception.RequestCharge,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["crimeType"] == "Theft")), Times.Once);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GetByCrimeGenreAsync_WhenGenreIsInvalid_ThrowsArgumentException(string? invalidGenre)
    {
        var containerMock = new Mock<Container>();
        var service = ReportServiceTestHelper.CreateService(containerMock);

        await Assert.ThrowsAsync<ArgumentException>(() => service.GetByCrimeGenreAsync(invalidGenre!, CancellationToken.None));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GetByCrimeTypeAsync_WhenTypeIsInvalid_ThrowsArgumentException(string? invalidType)
    {
        var containerMock = new Mock<Container>();
        var service = ReportServiceTestHelper.CreateService(containerMock);

        await Assert.ThrowsAsync<ArgumentException>(() => service.GetByCrimeTypeAsync(invalidType!, CancellationToken.None));
    }

    [Fact]
    public async Task GetAllAsync_WhenIteratorReturnsEmptyPage_ReturnsEmptyList()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();

        var iteratorStub = new FeedIteratorStub<Report>(new[]
        {
            new FeedResponseStub<Report>(Enumerable.Empty<Report>(), 1.0)
        });

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorStub);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.GetAllAsync(null, CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByCrimeGenreAsync_WhenIteratorReturnsEmptyPage_ReturnsEmptyList()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();

        var iteratorStub = new FeedIteratorStub<Report>(new[]
        {
            new FeedResponseStub<Report>(Enumerable.Empty<Report>(), 1.0)
        });

        containerMock
            .Setup(c => c.GetItemQueryIterator<Report>(It.IsAny<QueryDefinition>(), It.IsAny<string?>(), It.IsAny<QueryRequestOptions>()))
            .Returns(iteratorStub);

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.GetByCrimeGenreAsync("Hate Crime", CancellationToken.None);

        Assert.Empty(result);
    }
}
