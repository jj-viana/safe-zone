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
    
}