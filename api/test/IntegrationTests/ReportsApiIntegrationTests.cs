using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using ReportsApi.Models;
using Xunit;
using System;

namespace ReportsApi.Tests.IntegrationTests;

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
            CrimeGenre = "novo método?",
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
}

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
