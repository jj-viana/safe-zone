using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using Moq;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using ReportsApi.Tests.Services.Fakes;
using Xunit;

namespace ReportsApi.Tests.Services;

public class ReportServiceUpdateDetailsTests
{
    private static Report BuildReportWithDetails(ReporterDetails? details) => new()
    {
        Id = "123",
        ReporterDetails = details
    };

    private static Mock<Container> SetupContainer(Report existing)
    {
        var containerMock = new Mock<Container>();
        containerMock
            .Setup(c => c.ReadItemAsync<Report>(existing.Id, It.IsAny<PartitionKey>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ItemResponseStub<Report>(existing, 1.0));
        
        // Default Patch setup to return the existing report (we just want to verify if Patch was called)
        containerMock
            .Setup(c => c.PatchItemAsync<Report>(
                existing.Id,
                It.IsAny<PartitionKey>(),
                It.IsAny<IReadOnlyList<PatchOperation>>(),
                It.IsAny<PatchItemRequestOptions?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ItemResponseStub<Report>(existing, 1.0));

        return containerMock;
    }

    [Fact]
    public async Task UpdateAsync_WhenCurrentDetailsNull_AndNewDetailsAllNull_DoesNotPatchDetails()
    {
        var existing = BuildReportWithDetails(null);
        var containerMock = SetupContainer(existing);
        var service = ReportServiceTestHelper.CreateService(containerMock);

        var request = new UpdateReportRequest
        {
            ReporterDetails = new ReporterDetailsRequest { AgeGroup = null, Ethnicity = null, GenderIdentity = null, SexualOrientation = null }
        };

        await service.UpdateAsync(existing.Id, request, CancellationToken.None);

        containerMock.Verify(c => c.PatchItemAsync<Report>(
            It.IsAny<string>(),
            It.IsAny<PartitionKey>(),
            It.IsAny<IReadOnlyList<PatchOperation>>(),
            It.IsAny<PatchItemRequestOptions?>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [InlineData("25-34", null, null, null)]
    [InlineData(null, "Latino", null, null)]
    [InlineData(null, null, "NB", null)]
    [InlineData(null, null, null, "Bi")]
    public async Task UpdateAsync_WhenCurrentDetailsNull_AndNewDetailsHasValue_PatchesDetails(string? age, string? eth, string? gen, string? sex)
    {
        var existing = BuildReportWithDetails(null);
        var containerMock = SetupContainer(existing);
        var service = ReportServiceTestHelper.CreateService(containerMock);

        var request = new UpdateReportRequest
        {
            ReporterDetails = new ReporterDetailsRequest { AgeGroup = age, Ethnicity = eth, GenderIdentity = gen, SexualOrientation = sex }
        };

        await service.UpdateAsync(existing.Id, request, CancellationToken.None);

        containerMock.Verify(c => c.PatchItemAsync<Report>(
            It.IsAny<string>(),
            It.IsAny<PartitionKey>(),
            It.Is<IReadOnlyList<PatchOperation>>(ops => ops.Count == 1 && ops[0].Path == "/reporterDetails"),
            It.IsAny<PatchItemRequestOptions?>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WhenCurrentDetailsNotNull_AndNewDetailsMatch_DoesNotPatchDetails()
    {
        var existing = BuildReportWithDetails(new ReporterDetails { AgeGroup = "A", Ethnicity = "E", GenderIdentity = "G", SexualOrientation = "S" });
        var containerMock = SetupContainer(existing);
        var service = ReportServiceTestHelper.CreateService(containerMock);

        var request = new UpdateReportRequest
        {
            ReporterDetails = new ReporterDetailsRequest { AgeGroup = "A", Ethnicity = "E", GenderIdentity = "G", SexualOrientation = "S" }
        };

        await service.UpdateAsync(existing.Id, request, CancellationToken.None);

        containerMock.Verify(c => c.PatchItemAsync<Report>(
            It.IsAny<string>(),
            It.IsAny<PartitionKey>(),
            It.IsAny<IReadOnlyList<PatchOperation>>(),
            It.IsAny<PatchItemRequestOptions?>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [InlineData("B", "E", "G", "S")]
    [InlineData("A", "F", "G", "S")]
    [InlineData("A", "E", "H", "S")]
    [InlineData("A", "E", "G", "T")]
    [InlineData(null, "E", "G", "S")] // Change to null
    [InlineData("A", null, "G", "S")]
    public async Task UpdateAsync_WhenCurrentDetailsNotNull_AndNewDetailsDiffer_PatchesDetails(string? age, string? eth, string? gen, string? sex)
    {
        var existing = BuildReportWithDetails(new ReporterDetails { AgeGroup = "A", Ethnicity = "E", GenderIdentity = "G", SexualOrientation = "S" });
        var containerMock = SetupContainer(existing);
        var service = ReportServiceTestHelper.CreateService(containerMock);

        var request = new UpdateReportRequest
        {
            ReporterDetails = new ReporterDetailsRequest { AgeGroup = age, Ethnicity = eth, GenderIdentity = gen, SexualOrientation = sex }
        };

        await service.UpdateAsync(existing.Id, request, CancellationToken.None);

        containerMock.Verify(c => c.PatchItemAsync<Report>(
            It.IsAny<string>(),
            It.IsAny<PartitionKey>(),
            It.Is<IReadOnlyList<PatchOperation>>(ops => ops.Count == 1 && ops[0].Path == "/reporterDetails"),
            It.IsAny<PatchItemRequestOptions?>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
