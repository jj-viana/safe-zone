using Microsoft.AspNetCore.Mvc;
using Moq;
using ReportsApi.Controllers;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using Xunit;

using ReportsApi.Services;
using System.Drawing;

namespace ReportsApi.Tests.Services;

public class ReportsControllerGetTests
{
    private readonly Mock<IReportService> _serviceMock = new();
    private readonly ReportsController _controller;

    public ReportsControllerGetTests()
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

    public async Task GetByIdAsync_WhenServiceThrowsException_Returnsproblem()
    {
        string testId = "123";

        _serviceMock
            .Setup(s => s.GetByIdAsync(testId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("Invalid payload"));

        var result = await _controller.GetByIdAsync(testId, CancellationToken.None);

        var problem = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, problem.StatusCode);

    }

    [Fact]

    public async Task GetCrimeByGenreAsync_WhenServiceThrowsException_ReturnsProblem()
    {
        string testGenre = "Hate Crime";

        _serviceMock
            .Setup(s => s.GetByCrimeGenreAsync(testGenre, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("Invalid payload"));

        var result = await _controller.GetByCrimeGenreAsync(testGenre, CancellationToken.None);

        var problem = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, problem.StatusCode);

    }

    [Fact]
    public async Task GetCrimeByTypeAsync_WhenServiceThrowsException_ReturnsProblem()
    {
        string testType = "Assault";

        _serviceMock
            .Setup(s => s.GetByCrimeTypeAsync(testType, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("Invalid payload"));

        var result = await _controller.GetByCrimeTypeAsync(testType, CancellationToken.None);

        var problem = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, problem.StatusCode);

    }

    [Fact]

    public async Task GetByCrimeGenreAsync_WhenServiceReturnsValidReport_ReturnsOk()
    {
        string testGenre = "Hate Crime";

        _serviceMock
            .Setup(s => s.GetByCrimeGenreAsync(testGenre, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ReportResponse>());

        var result = await _controller.GetByCrimeGenreAsync(testGenre, CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);

    }

    [Fact]

    public async Task GetByCrimeGenreAsync_WhenListIsEmpty_ReturnsOkWithEmptyList()
    {
        string testGenre = "No Results Found";

        _serviceMock
            .Setup(s => s.GetByCrimeGenreAsync(testGenre, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ReportResponse>());

        var result = await _controller.GetByCrimeGenreAsync(testGenre, CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(result); 
        Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);

        var reports = Assert.IsAssignableFrom<IEnumerable<ReportResponse>>(okResult.Value); 
        Assert.Empty(reports);
    }

    [Fact]

    public async Task GetAllAsync_WhenServiceThrowsException_ReturnsProblem()
    {
        _serviceMock
            .Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("Invalid payload"));

        var result = await _controller.GetAllAsync(CancellationToken.None);

        var problem = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, problem.StatusCode);

    }

    [Fact]

    public async Task GetAllAsync_WhenServiceReturnsValidReport_ReturnsOk()
    {
        _serviceMock
            .Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ReportResponse>());

        var result = await _controller.GetAllAsync(CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);

    }

   
}