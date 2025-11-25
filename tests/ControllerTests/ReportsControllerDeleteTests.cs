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
    public class ReportsControllerDeleteTests
    {
        private readonly Mock<IReportService> _serviceMock = new();
        private readonly ReportsController _controller;

        public ReportsControllerDeleteTests()
        {
            var loggerMock = new Mock<ILogger<ReportsController>>();
            _controller = new ReportsController(_serviceMock.Object, loggerMock.Object);
        }

        [Fact]
        public async Task DeleteAsync_WhenServiceThrowsException_ReturnsProblem()
        {
            string testId = "123";

            _serviceMock
                .Setup(s => s.DeleteAsync(testId, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Unexpected error"));

            var result = await _controller.DeleteAsync(testId, CancellationToken.None);

            var problem = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, problem.StatusCode);
        }

        [Fact]
        public async Task DeleteAsync_WhenReportNotFound_ReturnsNotFound()
        {
            string testId = "123";

            _serviceMock
                .Setup(s => s.DeleteAsync(testId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            var result = await _controller.DeleteAsync(testId, CancellationToken.None);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteAsync_WhenDeleteSucceeds_ReturnsOk()
        {
            string testId = "123";

            _serviceMock
                .Setup(s => s.DeleteAsync(testId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _controller.DeleteAsync(testId, CancellationToken.None);

            var noContentResult = Assert.IsType<NoContentResult>(result);
            Assert.Equal(StatusCodes.Status204NoContent, noContentResult.StatusCode);
        }
    }
}
