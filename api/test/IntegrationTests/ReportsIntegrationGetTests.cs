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

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        //mostrar para o teste o path da api
        var projectDir = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "api"));
        if (!Directory.Exists(projectDir))
        {
            throw new DirectoryNotFoundException($"Content root não encontrado: {projectDir}");
        }
        builder.UseContentRoot(projectDir);
    }
}

public class ReportsApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    // Gênero usado para testes de sucesso e limpeza
    private const string TestGenre = "IntegrationTestGenre"; 

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
        string invalidPath = "/api/reports/genre/";

        // Act
        var response = await _client.GetAsync(invalidPath);

        // Assert
        // Espera-se 404 Not Found, pois a rota /api/reports/genre/{crimeGenre} não foi correspondida.
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---

}