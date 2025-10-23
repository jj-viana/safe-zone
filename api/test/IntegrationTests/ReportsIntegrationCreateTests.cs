using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using ReportsApi.Models;
using Xunit;
using System;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace ReportsApi.Tests.IntegrationTests;

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

    public ReportsApiIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateReport_WithValidPayload_ReturnsCreated()
    {
        // Arrange
        var request = new CreateReportRequest
        {
            CrimeGenre = "Crime",
            CrimeType = "Burglary",
            Description = "Stolen laptop",
            Location = "My house",
            CrimeDate = DateTime.UtcNow,
            Resolved = false
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/reports", request, CancellationToken.None);

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var createdReport = await response.Content.ReadFromJsonAsync<ReportResponse>();
        Assert.NotNull(createdReport);
        Assert.Equal(request.CrimeGenre, createdReport.CrimeGenre);
        Assert.Equal(request.CrimeType, createdReport.CrimeType);

        // Cleanup
        if (createdReport != null)
        {
            await _client.DeleteAsync($"/api/reports/{createdReport.Id}");
        }
    }

    [Fact]
    public async Task CreateReport_WithInvalidPayload_ReturnsBadRequest()
    {
        //Arrange
        var request = new CreateReportRequest
        {
            CrimeGenre = "", // crimeGenre é um campo obrigatório
            CrimeType = "Burglary",
            Description = "Stolen laptop",
            Location = "My house",
            CrimeDate = DateTime.UtcNow,
            Resolved = false
        };

        //Act
        var response = await _client.PostAsJsonAsync("/api/reports", request, CancellationToken.None);

        //Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.NotNull(problem);

        /*
        Garantir pelo menos uma mensagem não vazia de erro relacionado a CrimeGenre
        IA tava sugerindo fazer apenas checagem se a chave CrimeGenre existe, mas é melhor
        verificar se há mensagem de erro porque a chave pode existir e o valor ser nulo 
        */
        var messages = problem.Errors
            .Where(kv => string.Equals(kv.Key, "CrimeGenre", StringComparison.OrdinalIgnoreCase))
            .SelectMany(kv => kv.Value);

        Assert.True(messages.Any(m => !string.IsNullOrWhiteSpace(m)), "Expected at least one validation message for 'CrimeGenre'.");


    }
    
    

}


