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
        public async Task CreateAsync_ReturnsException_Returns500Error()
        {
            // Arrange
            var request = CreateSampleReport();
            _serviceMock
                .Setup(s => s.CreateAsync(request, It.IsAny<CancellationToken>() ) )
                .ThrowsAsync(new Exception("Returns Exception"));

            // ACT
            var result = await _controller.CreateAsync(request, CancellationToken.None);

            //Assert
            Assert.NotNull(result);
            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
        }

    }
}