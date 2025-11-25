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

public class ReportServiceUpdateTests
{
    private static UpdateReportRequest BuildUpdateRequest() => new()
    {
        CrimeGenre = "Hate Crime",
        CrimeType = "Assault",
        Description = "Updated",
        Location = "Downtown",
        Region = "Taguatinga",
        CrimeDate = DateTime.UtcNow,
        Status = "Approved",
        Resolved = true,
        ReporterDetails = new ReporterDetailsRequest
        {
            AgeGroup = "25-34",
            Ethnicity = "Latino",
            GenderIdentity = "NB",
            SexualOrientation = "Bi"
        }
    };

    private static Report BuildExistingReport() => new()
    {
        Id = "123",
        CrimeGenre = "Original",
        CrimeType = "Theft",
        Description = "Desc",
        Location = "Old",
        Region = "Old",
        CrimeDate = DateTime.UtcNow.AddDays(-5),
        Status = "Draft",
        Resolved = false,
        ReporterDetails = new ReporterDetails
        {
            AgeGroup = "18-24",
            Ethnicity = string.Empty,
            GenderIdentity = string.Empty,
            SexualOrientation = string.Empty
        }
    };

    [Fact]
    public async Task UpdateAsync_WhenPatchAppliesChanges_ReturnsUpdatedResource()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var existing = BuildExistingReport();

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(existing.Id, It.IsAny<PartitionKey>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ItemResponseStub<Report>(existing, 1.2));

        var updateRequest = BuildUpdateRequest();
        Report? patchedReport = null;
        var capturedOperations = 0;
        containerMock
            .Setup(c => c.PatchItemAsync<Report>(
                existing.Id,
                It.IsAny<PartitionKey>(),
                It.IsAny<IReadOnlyList<PatchOperation>>(),
                It.IsAny<PatchItemRequestOptions?>(),
                It.IsAny<CancellationToken>()))
            .Callback<string, PartitionKey, IReadOnlyList<PatchOperation>, PatchItemRequestOptions?, CancellationToken>((_, _, operations, _, _) =>
            {
                capturedOperations = operations.Count;
                Assert.True(capturedOperations >= 5, "Expected multiple patch operations when fields change.");
            })
            .ReturnsAsync(() =>
            {
                patchedReport = BuildPatchedReport(updateRequest, existing.Id);
                return new ItemResponseStub<Report>(patchedReport, 3.4);
            });

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.UpdateAsync(existing.Id, updateRequest, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Hate Crime", result!.CrimeGenre);
        Assert.Equal("Approved", result.Status);
        Assert.Equal("Bi", result.ReporterDetails?.SexualOrientation);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportUpdatePatch",
            3.4,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["operations"] == capturedOperations.ToString())), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WhenNoChangesDetected_ReturnsExistingWithoutPatching()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var existing = BuildExistingReport();

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(existing.Id, It.IsAny<PartitionKey>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ItemResponseStub<Report>(existing, 1));

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var result = await service.UpdateAsync(existing.Id, new UpdateReportRequest(), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(existing.CrimeGenre, result!.CrimeGenre);
        containerMock.Verify(c => c.PatchItemAsync<Report>(It.IsAny<string>(), It.IsAny<PartitionKey>(), It.IsAny<IReadOnlyList<PatchOperation>>(), It.IsAny<PatchItemRequestOptions?>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_WhenStatusIsWhitespace_ThrowsArgumentException()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var existing = BuildExistingReport();

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(existing.Id, It.IsAny<PartitionKey>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ItemResponseStub<Report>(existing, 1));

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateAsync(existing.Id, new UpdateReportRequest
        {
            Status = "  "
        }, CancellationToken.None));

        Assert.Equal("Status", exception.ParamName, ignoreCase: true);
    }

    [Fact]
    public async Task UpdateAsync_WhenContentResponseDisabledAndReporterDetailsAdded_ReturnsMergedEntity()
    {
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var existing = BuildExistingReport();
        existing.ReporterDetails = null;

        containerMock
            .Setup(c => c.ReadItemAsync<Report>(existing.Id, It.IsAny<PartitionKey>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ItemResponseStub<Report>(existing, 1.1));

        var request = new UpdateReportRequest
        {
            ReporterDetails = new ReporterDetailsRequest
            {
                AgeGroup = " 35-44 ",
                GenderIdentity = "F",
                Ethnicity = "Latino",
                SexualOrientation = "Straight"
            }
        };

        containerMock
            .Setup(c => c.PatchItemAsync<Report>(
                existing.Id,
                It.IsAny<PartitionKey>(),
                It.Is<IReadOnlyList<PatchOperation>>(ops => ops.Count == 1),
                It.Is<PatchItemRequestOptions?>(o => o == null),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ItemResponseStub<Report>(null, 2.6));

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock, options => options.EnableContentResponseOnWrite = false);

        var result = await service.UpdateAsync(existing.Id, request, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("35-44", result!.ReporterDetails?.AgeGroup);
        Assert.Equal("F", result.ReporterDetails?.GenderIdentity);

        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportUpdatePatch",
            2.6,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["operations"] == "1")), Times.Once);
    }

    private static Report BuildPatchedReport(UpdateReportRequest request, string id) => new()
    {
        Id = id,
        CrimeGenre = request.CrimeGenre!,
        CrimeType = request.CrimeType!,
        Description = request.Description!,
        Location = request.Location!,
        Region = request.Region!,
        CrimeDate = request.CrimeDate!.Value,
        Status = request.Status!,
        Resolved = request.Resolved!.Value,
        ReporterDetails = new ReporterDetails
        {
            AgeGroup = request.ReporterDetails!.AgeGroup,
            Ethnicity = request.ReporterDetails!.Ethnicity,
            GenderIdentity = request.ReporterDetails!.GenderIdentity,
            SexualOrientation = request.ReporterDetails!.SexualOrientation
        }
    };
}
