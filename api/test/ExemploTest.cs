using Microsoft.AspNetCore.Mvc;
using Moq;
using ReportsApi.Controllers;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using Xunit;


using ReportsApi.Services;

namespace ReportsApi.Tests.Services;

public class ReportsControllerTests
{
    private readonly Mock<IReportService> _serviceMock = new();
    private readonly ReportsController _controller;

    public ReportsControllerTests()
    {
        var loggerMock = new Mock<ILogger<ReportsController>>();
        _controller = new ReportsController(_serviceMock.Object, loggerMock.Object);
    }
    private static CreateReportRequest CreateValidCreateRequest() => new()
    {
        CrimeGenre = "Hate Crime",
        CrimeType = "Assault",
        Description = "Incident description",
        Location = "Central Park",
        CrimeDate = DateTime.UtcNow,
        Resolved = false
    };

    [Fact]
    public async Task CreateAsync_WhenServiceThrowsArgumentException_ReturnsBadRequest()
    {
        var request = CreateValidCreateRequest();
        _serviceMock
            .Setup(s => s.CreateAsync(request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("Invalid payload"));

        var result = await _controller.CreateAsync(request, CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
    }
}