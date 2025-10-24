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
using System.Text;
using System.Linq;
using System.Threading;

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
    public async Task CreateReport_WithWrongTypeInPayload_ReturnsBadRequest()
    {
        // Arrange: enviar JSON onde alguns campos têm tipos incorretos
        var invalidJson = @"{
            ""CrimeGenre"": 123,                // número em vez de string
            ""CrimeType"": ""Burglary"",
            ""Description"": ""Stolen laptop"",
            ""Location"": ""My house"",
            ""CrimeDate"": ""not-a-date"",      // string inválida para DateTime
            ""Resolved"": ""notabool""          // string em vez de boolean
        }";

        var content = new StringContent(invalidJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/reports", content, CancellationToken.None);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        /*
        Lê como string e não como objeto ValidationProblemDetails pq como múltiplos campos falham
        não conseguimos prever o comportamento exato para poder dar map nessa classe 
        (alguns campos aparecem com $ ou sem mensgem quando deveriam ter) 
        */
        var responseBody = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(responseBody), "Expected error response body");

        /* 
        Verificar que o corpo da resposta contém indicações de erro
        (mais flexível que verificar estrutura específica do ValidationProblemDetails)
        o importante é que o erro seja o correto(badrequest) os detalhes da resposta
        não importam muito para o teste
        */
        Assert.True(
           responseBody.Contains("error", StringComparison.OrdinalIgnoreCase) ||
           responseBody.Contains("invalid", StringComparison.OrdinalIgnoreCase) ||
           responseBody.Contains("type", StringComparison.OrdinalIgnoreCase),
           $"Expected error message in response body. Received: {responseBody}");
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
    [Fact]
    public async Task CreateReport_WithNullPayload_ReturnsBadRequest()
    {
        // Arrange: 
        string? invalidJson = null;
        var content = new StringContent(invalidJson ?? string.Empty, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/reports", content, CancellationToken.None);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var responseBody = await response.Content.ReadAsStringAsync();
        Assert.False(string.IsNullOrWhiteSpace(responseBody), "Expected error response body");

        //Verifica mensagem de erro pelas palavras chave a seguir
        Assert.True(
            responseBody.Contains("error", StringComparison.OrdinalIgnoreCase) ||
            responseBody.Contains("invalid", StringComparison.OrdinalIgnoreCase) ||
            responseBody.Contains("null", StringComparison.OrdinalIgnoreCase) ||
            responseBody.Contains("payload", StringComparison.OrdinalIgnoreCase) ||
            responseBody.Contains("request", StringComparison.OrdinalIgnoreCase),
            $"Expected error message in response body. Received: {responseBody}");
    }

    [Fact]
    public async Task CreateReport_ToBigOfaRequest_ReturnsBadRequest()
    {
        //descrição estoura limite de caracteres
        var invalidJson = "{\n" +
            "  \"CrimeGenre\": \"Crime\",\n" +
            "  \"CrimeType\": \"Burglary\",\n" +
            $"  \"Description\": \"{new string('x', 2050)}\",\n" +
            "  \"Location\": \"My house\",\n" +
            $"  \"CrimeDate\": \"{DateTime.UtcNow:o}\",\n" +
            "  \"Resolved\": false\n" +
            "}";

        var content = new StringContent(invalidJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/reports", content, CancellationToken.None);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();

        Assert.False(string.IsNullOrWhiteSpace(body), "Expected error response body");
        //Procura por palavras chave do erro na string de resposta do servidor
        Assert.True(
            body.Contains("description", StringComparison.OrdinalIgnoreCase) ||
            body.Contains("length", StringComparison.OrdinalIgnoreCase) ||
            body.Contains("max", StringComparison.OrdinalIgnoreCase) ||
            body.Contains("2050"),
            $"Expected error message related to description length. Received: {body}");


    }



}


