using System;
using System.Collections.Generic;
using System.Net;
using System.Reflection;
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

public class ReportServiceTests
{
    [Fact]
    public async Task CreateAsync_ValidRequest_PersistsReportAndReturnsResponse()
    {
        // Arrange
        var cosmosClientMock = new Mock<CosmosClient>();
        var loggerMock = new Mock<ILogger<ReportService>>();
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var options = Options.Create(new CosmosOptions
        {
            ConnectionString = "AccountEndpoint=https://localhost:8081/;AccountKey=dummy;",
            DatabaseId = "safe-zone",
            ContainerId = "reports",
            EnableContentResponseOnWrite = true
        });

        var service = new ReportService(
            cosmosClientMock.Object,
            options,
            loggerMock.Object,
            telemetryMock.Object);

        var containerMock = new Mock<Container>();
        var containerField = typeof(ReportService).GetField("_container", BindingFlags.NonPublic | BindingFlags.Instance);
        containerField!.SetValue(service, containerMock.Object); // bypass Cosmos initialization for unit testing

        Report? capturedReport = null;
        PartitionKey? capturedPartitionKey = null;
        ItemRequestOptions? capturedOptions = null;

        var responseMock = new Mock<ItemResponse<Report>>();
        responseMock.SetupGet(r => r.RequestCharge).Returns(1.5);
        responseMock.SetupGet(r => r.StatusCode).Returns(HttpStatusCode.Created);

        containerMock
            .Setup(c => c.CreateItemAsync(
                It.IsAny<Report>(),
                It.IsAny<PartitionKey>(),
                It.IsAny<ItemRequestOptions?>(),
                It.IsAny<CancellationToken>()))
            .Callback((Report report, PartitionKey partitionKey, ItemRequestOptions? options, CancellationToken _) =>
            {
                capturedReport = report;
                capturedPartitionKey = partitionKey;
                capturedOptions = options;
            })
            .ReturnsAsync(responseMock.Object);

        var request = new CreateReportRequest
        {
            CrimeGenre = " Hate Crime ",
            CrimeType = " Physical Assault ",
            Description = " Incident description ",
            Location = " Some Street ",
            CrimeDate = DateTime.SpecifyKind(new DateTime(2024, 4, 12, 20, 15, 0), DateTimeKind.Local),
            ReporterDetails = new ReporterDetailsRequest
            {
                AgeGroup = " 25-34 ",
                Ethnicity = " Mixed ",
                GenderIdentity = " Non-binary ",
                SexualOrientation = " LGBTQIA+ "
            },
            Resolved = true
        };

        // Act
        var result = await service.CreateAsync(request, CancellationToken.None);

        // Assert
        Assert.NotNull(capturedReport);
        Assert.Equal(result.Id, capturedReport!.Id);
        Assert.Equal("Hate Crime", capturedReport.CrimeGenre);
        Assert.Equal("Physical Assault", capturedReport.CrimeType);
        Assert.Equal("Incident description", capturedReport.Description);
        Assert.Equal("Some Street", capturedReport.Location);
        Assert.Equal(DateTimeKind.Utc, capturedReport.CrimeDate.Kind);
        Assert.NotNull(capturedReport.ReporterDetails);
        Assert.Equal("25-34", capturedReport.ReporterDetails!.AgeGroup);
        Assert.Equal("Mixed", capturedReport.ReporterDetails.Ethnicity);
        Assert.Equal("Non-binary", capturedReport.ReporterDetails.GenderIdentity);
        Assert.Equal("LGBTQIA+", capturedReport.ReporterDetails.SexualOrientation);
        Assert.True(capturedReport.Resolved);
        Assert.Equal(capturedReport.Id, result.Id);
        Assert.Equal(capturedReport.CrimeGenre, result.CrimeGenre);
        Assert.Equal(capturedReport.CrimeType, result.CrimeType);
        Assert.Equal(capturedReport.Description, result.Description);
        Assert.Equal(capturedReport.Location, result.Location);
        Assert.Equal(capturedReport.CrimeDate, result.CrimeDate);
        Assert.Equal(capturedReport.Resolved, result.Resolved);
        Assert.NotNull(result.ReporterDetails);
        Assert.Equal(capturedReport.ReporterDetails!.AgeGroup, result.ReporterDetails!.AgeGroup);
        Assert.Equal(capturedReport.ReporterDetails.Ethnicity, result.ReporterDetails.Ethnicity);
        Assert.Equal(capturedReport.ReporterDetails.GenderIdentity, result.ReporterDetails.GenderIdentity);
        Assert.Equal(capturedReport.ReporterDetails.SexualOrientation, result.ReporterDetails.SexualOrientation);
        Assert.NotNull(capturedPartitionKey);
        Assert.Equal(new PartitionKey(capturedReport.Id), capturedPartitionKey!.Value);
        Assert.NotNull(capturedOptions);
        Assert.True(capturedOptions!.EnableContentResponseOnWrite);
        telemetryMock.Verify(t => t.TrackRequestUnits(
            "ReportCreate",
            1.5,
            It.Is<IReadOnlyDictionary<string, string?>>(d => d["statusCode"] == HttpStatusCode.Created.ToString())), Times.Once);
    }
}
