using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using ReportsApi.Models;
using Xunit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Threading;

namespace ReportsApi.Tests.IntegrationTests.Get;

public class ReportsApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    // Gênero usado para testes de sucesso e limpeza
    private const string TestGenre = "IntegrationTestGenre";
    // Tipo de crime usado para testes de sucesso e limpeza
    private const string TestCrimeType = "IntegrationTestCrimeType"; 

    public ReportsApiIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<ReportResponse> CreateReportAndGetIdAsync(CreateReportRequest createRequest)
        {
            var createResponse = await _client.PostAsJsonAsync("/api/reports", createRequest);
            createResponse.EnsureSuccessStatusCode();
            var createdReport = await createResponse.Content.ReadFromJsonAsync<ReportResponse>();
            Assert.NotNull(createdReport);
            return createdReport;
        }
    private async Task CleanupReportAsync(string? reportId)
        {

            if (!string.IsNullOrEmpty(reportId))
            {
                await _client.DeleteAsync($"/api/reports/{reportId}");
            }
        }

    [Fact]
    public async Task GetByCrimeGenreAsync_WhenReturnsCorrectly_ReturnsOkWithData()
    {
        // Arrange
        // 1. Criar um ou mais reports com um gênero específico para garantir que o teste seja isolado e confiável.
        var createRequest = new CreateReportRequest
        {
            CrimeGenre = TestGenre,
            CrimeType = "Integration Test Crime",
            Description = "Test report for integration testing",
            Location = "Test Location",
            CrimeDate = DateTime.UtcNow,
            Resolved = false
        };
        var createdReport = await CreateReportAndGetIdAsync(createRequest);
        
        try
        {
            // Act
            var response = await _client.GetAsync($"/api/reports/crime-genre/{TestGenre}");

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var reports = await response.Content.ReadFromJsonAsync<List<ReportResponse>>();
            
            // Verifica se a lista não está vazia e contém o relatório que criamos (e possivelmente outros)
            Assert.NotNull(reports);
            Assert.True(reports.Any(r => r.Id == createdReport.Id), "A lista retornada deve conter o relatório criado.");
            Assert.All(reports.Where(r => r.Id == createdReport.Id), 
                       r => Assert.Equal(TestGenre, r.CrimeGenre));
        }
        finally
        {
            // Cleanup: Garantir que o relatório de teste seja deletado.
            if (createdReport != null)
            {
                await CleanupReportAsync(createdReport.Id);
            }
        }
    }

    // ---

    [Fact]
    public async Task GetByCrimeGenreAsync_WhenNoValuesFound_ReturnsOkWithEmptyList()
    {
        // Arrange
        // Usamos um gênero improvável de existir para garantir que a consulta retorne 0 resultados.
        string nonExistentGenre = Guid.NewGuid().ToString(); 

        // Act
        var response = await _client.GetAsync($"/api/reports/crime-genre/{nonExistentGenre}");

        // Assert
        // A API REST deve retornar 200 OK com um corpo vazio (lista) quando não há resultados.
        response.EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var reports = await response.Content.ReadFromJsonAsync<List<ReportResponse>>();
        Assert.NotNull(reports);
        // Verifica se a lista está vazia
        Assert.Empty(reports);
    }

    // ---

    [Fact]
    public async Task GetByCrimeGenreAsync_WhenPassingNull_ReturnsNotFound()
    {
        // Arrange
        // Em um roteamento ASP.NET Core, um segmento de URL ausente (que simula 'null' ou vazio)
        // para um parâmetro obrigatório de rota geralmente resulta em 404 Not Found antes de chegar ao controller.
        string invalidPath = "/api/reports/crime-genre/";

        // Act
        var response = await _client.GetAsync(invalidPath);

        // Assert
        // Espera-se 404 Not Found, pois a rota /api/reports/genre/{crimeGenre} não foi correspondida.
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---

    [Fact]
    public async Task GetByCrimeTypeAsync_WhenReturnsCorrectly_ReturnsOkWithData()
    {
        // Arrange
        // Criar um report com um tipo de crime específico para garantir que o teste seja isolado e confiável.
        var createRequest = new CreateReportRequest
        {
            CrimeGenre = "Test Genre for Crime Type",
            CrimeType = TestCrimeType,
            Description = "Test report for crime type integration testing",
            Location = "Test Location",
            CrimeDate = DateTime.UtcNow,
            Resolved = false
        };
        var createdReport = await CreateReportAndGetIdAsync(createRequest);
        
        try
        {
            // Act
            var response = await _client.GetAsync($"/api/reports/crime-type/{TestCrimeType}");

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var reports = await response.Content.ReadFromJsonAsync<List<ReportResponse>>();
            
            // Verifica se a lista não está vazia e contém o relatório que criamos
            Assert.NotNull(reports);
            Assert.True(reports.Any(r => r.Id == createdReport.Id), "A lista retornada deve conter o relatório criado.");
            Assert.All(reports.Where(r => r.Id == createdReport.Id), 
                       r => Assert.Equal(TestCrimeType, r.CrimeType));
        }
        finally
        {
            // Cleanup: Garantir que o relatório de teste seja deletado.
            if (createdReport != null)
            {
                await CleanupReportAsync(createdReport.Id);
            }
        }
    }

    // ---

    [Fact]
    public async Task GetByCrimeTypeAsync_WhenNoValuesFound_ReturnsOkWithEmptyList()
    {
        // Arrange
        // Usamos um tipo de crime improvável de existir para garantir que a consulta retorne 0 resultados.
        string nonExistentCrimeType = Guid.NewGuid().ToString();

        // Act
        var response = await _client.GetAsync($"/api/reports/crime-type/{nonExistentCrimeType}");

        // Assert
        // A API REST deve retornar 200 OK com um corpo vazio (lista) quando não há resultados.
        response.EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var reports = await response.Content.ReadFromJsonAsync<List<ReportResponse>>();
        Assert.NotNull(reports);
        // Verifica se a lista está vazia
        Assert.Empty(reports);
    }

    // ---

    [Fact]
    public async Task GetByCrimeTypeAsync_WhenPassingNull_ReturnsNotFound()
    {
        // Arrange
        // Em um roteamento ASP.NET Core, um segmento de URL ausente (que simula 'null' ou vazio)
        // para um parâmetro obrigatório de rota geralmente resulta em 404 Not Found antes de chegar ao controller.
        string invalidPath = "/api/reports/crime-type/";

        // Act
        var response = await _client.GetAsync(invalidPath);

        // Assert
        // Espera-se 404 Not Found, pois a rota /api/reports/crime-type/{crimeType} não foi correspondida.
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---

    [Fact]
    public async Task GetByIdAsync_WhenReturnsCorrectly_ReturnsOkWithData()
    {
        // Arrange
        // Criar um report de teste para garantir que temos um ID válido para buscar.
        var createRequest = new CreateReportRequest
        {
            CrimeGenre = "Test Genre",
            CrimeType = "Test Crime Type",
            Description = "Test report for GetById integration testing",
            Location = "Test Location",
            CrimeDate = DateTime.UtcNow,
            Resolved = false
        };
        var createdReport = await CreateReportAndGetIdAsync(createRequest);
        
        try
        {
            // Act
            var response = await _client.GetAsync($"/api/reports/{createdReport.Id}");

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var report = await response.Content.ReadFromJsonAsync<ReportResponse>();
            
            // Verifica se o relatório retornado é o mesmo que foi criado
            Assert.NotNull(report);
            Assert.Equal(createdReport.Id, report.Id);
            Assert.Equal(createdReport.CrimeGenre, report.CrimeGenre);
            Assert.Equal(createdReport.CrimeType, report.CrimeType);
            Assert.Equal(createdReport.Description, report.Description);
        }
        finally
        {
            // Cleanup: Garantir que o relatório de teste seja deletado.
            await CleanupReportAsync(createdReport.Id);
        }
    }

    // ---

    [Fact]
    public async Task GetByIdAsync_WhenNotFound_ReturnsNotFound()
    {
        // Arrange
        // Usamos um ID improvável de existir para garantir que a consulta retorne 404.
        string nonExistentId = Guid.NewGuid().ToString();

        // Act
        var response = await _client.GetAsync($"/api/reports/{nonExistentId}");

        // Assert
        // A API REST deve retornar 404 Not Found quando o recurso não é encontrado.
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---

    [Fact]
    public async Task GetByIdAsync_WhenIdIsNull_ReturnsOk()
    {
        // Arrange
        // Quando não passamos nenhum ID após /api/reports/, a rota /api/reports/ 
        // corresponde ao endpoint GetAllAsync, não ao GetByIdAsync.
        // Portanto, deve retornar 200 OK com a lista de todos os reports.

        // Act
        var response = await _client.GetAsync("/api/reports/");

        // Assert
        // Deve retornar 200 OK porque /api/reports/ chama GetAllAsync.
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ---

}