using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using ReportsApi.Controllers;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using Xunit;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ReportsApi.Tests.ControllerTests
{
    public class ReportsControllerUpdateTests
    {
        private readonly Mock<IReportService> _serviceMock = new();
        private readonly ReportsController _controller;

        public ReportsControllerUpdateTests()
        {
            var loggerMock = new Mock<ILogger<ReportsController>>();
            _controller = new ReportsController(_serviceMock.Object, loggerMock.Object);
        }

        private static UpdateReportRequest CreateValidUpdate() => new()
        {
            CrimeGenre = "Hate Crime",
            CrimeType = "Assault",
            Description = "Updated description",
            Location = "Central Park",
            Region = "Taguatinga",
            CrimeDate = DateTime.UtcNow,
            Resolved = true
        };

        [Fact]
        public async Task UpdateAsync_WhenModelStateInvalid_ReturnsValidationProblem()
        {
            // Arrange
            _controller.ModelState.AddModelError("CrimeType", "The CrimeType field is required.");

            // Act
            var result = await _controller.UpdateAsync("123", CreateValidUpdate(), CancellationToken.None);

            // Assert
            var problem = Assert.IsType<ObjectResult>(result);
            // ValidationProblem may produce an ObjectResult without StatusCode set in unit tests
            // Ensure the payload is a ValidationProblemDetails instance
            Assert.IsType<ValidationProblemDetails>(problem.Value);
        }

        [Fact]
        public async Task UpdateAsync_WhenServiceThrowsArgumentException_ReturnsBadRequest()
        {
            string testId = "123";

            _serviceMock
                .Setup(s => s.UpdateAsync(testId, It.IsAny<UpdateReportRequest>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new ArgumentException("Invalid payload"));

            var result = await _controller.UpdateAsync(testId, CreateValidUpdate(), CancellationToken.None);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
        }

        [Fact]
        public async Task UpdateAsync_WhenServiceThrowsInvalidOperationException_ReturnsBadRequest()
        {
            string testId = "123";

            _serviceMock
                .Setup(s => s.UpdateAsync(testId, It.IsAny<UpdateReportRequest>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Invalid operation"));

            var result = await _controller.UpdateAsync(testId, CreateValidUpdate(), CancellationToken.None);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode);
        }

        [Fact]
        public async Task UpdateAsync_WhenServiceThrowsException_ReturnsProblem()
        {
            string testId = "123";

            _serviceMock
                .Setup(s => s.UpdateAsync(testId, It.IsAny<UpdateReportRequest>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Unexpected"));

            var result = await _controller.UpdateAsync(testId, CreateValidUpdate(), CancellationToken.None);

            var problem = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, problem.StatusCode);
        }

        [Fact]
        public async Task UpdateAsync_WhenUpdateNotFound_ReturnsNotFound()
        {
            string testId = "123";

            _serviceMock
                .Setup(s => s.UpdateAsync(testId, It.IsAny<UpdateReportRequest>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ReportResponse?)null);

            var result = await _controller.UpdateAsync(testId, CreateValidUpdate(), CancellationToken.None);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task UpdateAsync_WhenUpdateSucceeds_ReturnsOk()
        {
            string testId = "123";
            var updated = new ReportResponse(
                testId,
                "Hate Crime",
                "Assault",
                "Updated description",
                "Central Park",
                "Taguatinga",
                DateTime.UtcNow,
                null,
                DateTime.UtcNow,
                true);

            _serviceMock
                .Setup(s => s.UpdateAsync(testId, It.IsAny<UpdateReportRequest>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(updated);

            var result = await _controller.UpdateAsync(testId, CreateValidUpdate(), CancellationToken.None);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(updated, okResult.Value);
        }
    }
}
