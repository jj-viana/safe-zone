using Microsoft.AspNetCore.Mvc;
using Moq;
using ReportsApi.Controllers;
using ReportsApi.Interfaces;
using ReportsApi.Models;
using Xunit;

using ReportsApi.Services;

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

    //Teste Id

    [Fact]
    public async Task GetByIdAsync_WhenServiceThrowsException_ReturnsProblem()
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
    public async Task GetByIdAsync_WhenNoResult_ReturnNotFound()
    {
        string testId = "1123";
        _serviceMock
            .Setup(s => s.GetByIdAsync(testId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ReportResponse?)null);

        var result = await _controller.GetByIdAsync(testId, CancellationToken.None);

        var notFound = Assert.IsType<NotFoundResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, notFound.StatusCode);
    }

    [Fact]
    public async Task GetByIdAsync_WhenServiceReturnsOk_CheckIfCorrect()
    {
        string testId = "12345";

        var expectedReport = new ReportResponse(testId, "Hate Crime", "Assault", "Incident description", "Central Park", DateTime.UtcNow, null, DateTime.UtcNow, false);
        
        _serviceMock
            .Setup(s => s.GetByIdAsync(testId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedReport);

        var result = await _controller.GetByIdAsync(testId, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var report = Assert.IsAssignableFrom<ReportResponse>(ok.Value);
        Assert.Equal(expectedReport, report);
    }


    //Testes Genre
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




    //Testes Type
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
    public async Task GetCrimeByTypeAsync_WhenNoResult_ReturnOkAndEmptyList()
    {
        string testType = "Burglery";

        _serviceMock
            .Setup(s => s.GetByCrimeTypeAsync(testType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ReportResponse>());

        var result = await _controller.GetByCrimeTypeAsync(testType, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IReadOnlyCollection<ReportResponse>>(ok.Value);
        // é list e não IReadOnlyCollection pq IRead é uma interface de List
        //nenhum objeto tem como tipo exato uma interface
        Assert.Empty(list);
    }

    //Valores para serem testados em GetCrimeByTypeAsync_WhenServiceReturnsOk_CheckIfCorrect
    public static IEnumerable<object[]> GetReportResponseData()
    {
        // Cenário 1: Dois reports de Burglery
        yield return new object[]
        {
            "Burglery",
            new List<ReportResponse>
            {
                new ReportResponse("114234", "Crime", "Burglery", "Home invasion", "Kansas", DateTime.UtcNow, null, DateTime.UtcNow, true),
                new ReportResponse("52355", "Crime", "Burglery", "School theft", "Acre", DateTime.UtcNow.AddDays(-1), null, DateTime.UtcNow, true)
            }
        };

        // Cenário 2: Um report de Assault
        yield return new object[]
        {
            "Assault",
            new List<ReportResponse>
            {
                new ReportResponse("98765", "Hate Crime", "Assault", "Physical attack", "New York", DateTime.UtcNow.AddDays(-5), null, DateTime.UtcNow, false)
            }
        };

        // Cenário 3: Três reports de Theft
        yield return new object[]
        {
            "Theft",
            new List<ReportResponse>
            {
                new ReportResponse("11111", "Crime", "Theft", "Car theft", "California", DateTime.UtcNow.AddDays(-2), null, DateTime.UtcNow, false),
                new ReportResponse("22222", "Crime", "Theft", "Bike stolen", "Texas", DateTime.UtcNow.AddDays(-3), null, DateTime.UtcNow, true),
                new ReportResponse("33333", "Crime", "Theft", "Wallet missing", "Florida", DateTime.UtcNow.AddDays(-4), null, DateTime.UtcNow, false)
            }
        };

        // Cenário 4: Lista vazia (nenhum crime desse tipo encontrado)
        yield return new object[]
        {
            "Vandalism",
            new List<ReportResponse>()
        };
    }

    [Theory]
    [MemberData(nameof(GetReportResponseData))]
    public async Task GetCrimeByTypeAsync_WhenServiceReturnsOk_CheckIfCorrect(string testType, List<ReportResponse> expectedReports)
    {
        _serviceMock
            .Setup(s => s.GetByCrimeTypeAsync(testType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedReports);

        var result = await _controller.GetByCrimeTypeAsync(testType, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsAssignableFrom<IReadOnlyCollection<ReportResponse>>(ok.Value);
        Assert.Equal(expectedReports.Count, list.Count);

        // Só verifica o CrimeType se a lista não estiver vazia
        if (expectedReports.Count > 0)
        {
            Assert.All(list, report => Assert.Equal(testType, report.CrimeType));
        }
    }


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