using Microsoft.AspNetCore.Mvc;
using Moq;
using ReportsApi.Controllers;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using Xunit;


namespace ReportsApi.Tests.Services;

public class ReportsControllerUpdateTests
{
    private readonly Mock<IReportService> _serviceMock = new();
    private readonly ReportsController _controller;

    public ReportsControllerUpdateTests()
    {
        var loggerMock = new Mock<ILogger<ReportsController>>();
        _controller = new ReportsController(_serviceMock.Object, loggerMock.Object);
    }


    private static UpdateReportRequest CreateSampleUpdateRequest() => new UpdateReportRequest()
    {
        CrimeGenre = "Crime",
        CrimeType = "Assassination",
        Description = "Assassinato aqui na esquina da escola",
        Location = "Esquina da escola"

    };

    [Fact]
    public async Task UpdateAsync_WhenServiceThrowsArgumentException_ReturnsBadRequest()
    {
        UpdateReportRequest updateRequest = CreateSampleUpdateRequest();

        string id = Guid.NewGuid().ToString();
        _serviceMock
            .Setup(s => s.UpdateAsync(id, updateRequest, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("Invalid argument"));

        var result = await _controller.UpdateAsync(id, updateRequest, CancellationToken.None);
        var problem = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(StatusCodes.Status400BadRequest, problem.StatusCode);

    }


}