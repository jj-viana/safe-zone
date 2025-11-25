using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using Moq;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using ReportsApi.Services;
using Xunit;

namespace ReportsApi.Tests.Services;

public class ReportServiceCreateTests
{
    [Theory]
    [InlineData("CrimeGenre")]
    [InlineData("CrimeType")]
    [InlineData("Description")]
    [InlineData("Location")]
    [InlineData("Region")]
    [InlineData("CrimeDate")]
    [InlineData("Status")]
    [InlineData("Resolved")]
    public async Task CreateAsync_WithNullRequiredField_ThrowsArgumentException(string fieldName)
    {
        // Arrange
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

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

        // Set the specific field to null
        switch (fieldName)
        {
            case "CrimeGenre": request.CrimeGenre = null!; break;
            case "CrimeType": request.CrimeType = null!; break;
            case "Description": request.Description = null!; break;
            case "Location": request.Location = null!; break;
            case "Region": request.Region = null!; break;
            case "CrimeDate": request.CrimeDate = null; break;
            case "Status": request.Status = null!; break;
            case "Resolved": request.Resolved = null; break;
        }

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => 
            service.CreateAsync(request, CancellationToken.None));
        
        Assert.Contains(fieldName, exception.Message);
    }

    [Fact]
    public async Task CreateAsync_WithEmptyStatus_ThrowsArgumentException()
    {
        // Arrange
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

        var request = new CreateReportRequest
        {
            CrimeGenre = "Genre",
            CrimeType = "Type",
            Description = "Desc",
            Location = "Loc",
            Region = "Reg",
            CrimeDate = DateTime.UtcNow,
            Status = "   ", // Empty after trim
            Resolved = false
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => 
            service.CreateAsync(request, CancellationToken.None));
        
        Assert.Contains("Status", exception.Message);
    }

    [Fact]
    public async Task CreateAsync_WithReporterDetails_MapsDetailsCorrectly()
    {
        // Arrange
        var telemetryMock = new Mock<ICosmosTelemetry>();
        var containerMock = new Mock<Container>();
        
        // Setup CreateItemAsync to capture the item passed to it
        Report? capturedReport = null;
        containerMock.Setup(c => c.CreateItemAsync<Report>(
            It.IsAny<Report>(), 
            It.IsAny<PartitionKey?>(), 
            It.IsAny<ItemRequestOptions>(), 
            It.IsAny<CancellationToken>()))
            .Callback<Report, PartitionKey?, ItemRequestOptions, CancellationToken>((r, p, o, t) => capturedReport = r)
            .ReturnsAsync((Report r, PartitionKey? p, ItemRequestOptions o, CancellationToken t) => 
            {
                return new Mock<ItemResponse<Report>>().Object;
            });

        var service = ReportServiceTestHelper.CreateService(containerMock, telemetryMock);

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
                AgeGroup = " 25-34 ",
                Ethnicity = " Latino ",
                GenderIdentity = " Male ",
                SexualOrientation = " Heterosexual "
            }
        };

        // Act
        await service.CreateAsync(request, CancellationToken.None);

        // Assert
        Assert.NotNull(capturedReport);
        Assert.NotNull(capturedReport.ReporterDetails);
        Assert.Equal("25-34", capturedReport.ReporterDetails.AgeGroup);
        Assert.Equal("Latino", capturedReport.ReporterDetails.Ethnicity);
        Assert.Equal("Male", capturedReport.ReporterDetails.GenderIdentity);
        Assert.Equal("Heterosexual", capturedReport.ReporterDetails.SexualOrientation);
    }
}
