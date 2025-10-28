using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Moq;
using ReportsApi.Controllers;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using Xunit;

using ReportsApi.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace ReportsApi.Tests.Services;

public class ReportsControllerCreateTests
{
    private readonly Mock<IReportService> _serviceMock = new();
    private readonly ReportsController _controller;

    public ReportsControllerCreateTests()
    {
        var loggerMock = new Mock<ILogger<ReportsController>>();
        _controller = new ReportsController(_serviceMock.Object, loggerMock.Object);
    }

    private static CreateReportRequest CreateSampleReport() => new()
    {
        CrimeGenre = "Hate Crime",
        CrimeType = "Assault",
        Description = "Incident description",
        Location = "Central Park",
        CrimeDate = DateTime.UtcNow,
        Resolved = false
    };

    [Fact]
    public async Task CreateAsync_WhenStateisInvalid_ReturnsValidationProblem()
    {
        _controller.ModelState.AddModelError("CrimeType", "Required");
        var request = CreateSampleReport();

        var result = await _controller.CreateAsync(request, CancellationToken.None);

        var problemResult = Assert.IsType<ObjectResult>(result);

        Assert.Null(problemResult.StatusCode);

        Assert.IsType<ValidationProblemDetails>(problemResult.Value);

    }

    [Fact]

    public async Task CreateAsync_WhenServiceThrowsArgumentException_ReturnsBadRequest()
    {
        var request = CreateSampleReport();

        _serviceMock
            .Setup(s => s.CreateAsync(request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("Invalid payload"));

        var result = await _controller.CreateAsync(request, CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
    }
    [Fact]
    public async Task CreateAsync_WhenServiceReturnsCreatedReport_ReturnsCreatedAtRoute()
    {
        // use same timestamp for all objects to avoid flakiness
        var now = DateTime.UtcNow;
        
        var request = new CreateReportRequest
        {
            CrimeGenre = "Hate Crime",
            CrimeType = "Assault",
            Description = "Incident description",
            Location = "Central Park",
            CrimeDate = now,
            Resolved = false
        };

        var createdReport = new Report
        {
            Id = "12345",
            CrimeGenre = "Hate Crime",
            CrimeType = "Assault",
            Description = "Incident description",
            Location = "Central Park",
            CrimeDate = now,
            Resolved = false
        };

        var reportResponse = new ReportResponse(
            createdReport.Id,
            createdReport.CrimeGenre,
            createdReport.CrimeType,
            createdReport.Description,
            createdReport.Location,
            createdReport.CrimeDate,
            null,
            now,
            createdReport.Resolved
        );

        _serviceMock
            .Setup(s => s.CreateAsync(It.IsAny<CreateReportRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(reportResponse);

        var result = await _controller.CreateAsync(request, CancellationToken.None);

        var createdAtRouteResult = Assert.IsType<CreatedAtRouteResult>(result);
        Assert.Equal(StatusCodes.Status201Created, createdAtRouteResult.StatusCode);
        Assert.Equal("GetReportById", createdAtRouteResult.RouteName);
        Assert.Equal(createdReport.Id, createdAtRouteResult.RouteValues!["id"]);

        var value = createdAtRouteResult.Value;
        Assert.NotNull(value);
    }
}
