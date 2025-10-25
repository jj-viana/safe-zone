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

    private async Task<List<ReportResponse>> CreateMultipleReportsAndReturnIdsAsync()
    {
        var createRequest1 = new CreateReportRequest
        {
            CrimeGenre = "Crime",
            CrimeType = "Murder",
            Description = "Foi a dona violeta com o soco inglês no hotel",
            Location = "Acrelândia",
            CrimeDate = DateTime.UtcNow,
            Resolved = true
        };
        var createRequest2 = new CreateReportRequest
        {
            CrimeGenre = "Feeling of insecurity",
            CrimeType = "Man following me",
            Description = "Era o moço do pastel",
            Location = "Ceilândia",
            CrimeDate = DateTime.UtcNow,
            Resolved = true
        };
        var createRequest3 = new CreateReportRequest
        {
            CrimeGenre = "Crime",
            CrimeType = "Red light skipping",
            Description = "Detran não vai gostar",
            Location = "Lago morte",
            CrimeDate = DateTime.UtcNow,
            Resolved = false
        };

        var createResponse1 = await _client.PostAsJsonAsync("/api/reports", createRequest1);
        createResponse1.EnsureSuccessStatusCode();
        var createdReport1 = await createResponse1.Content.ReadFromJsonAsync<ReportResponse>();
        Assert.NotNull(createdReport1);

        var createResponse2 = await _client.PostAsJsonAsync("/api/reports", createRequest2);
        createResponse2.EnsureSuccessStatusCode();
        var createdReport2 = await createResponse2.Content.ReadFromJsonAsync<ReportResponse>();
        Assert.NotNull(createdReport2);

        var createResponse3 = await _client.PostAsJsonAsync("/api/reports", createRequest3);
        createResponse3.EnsureSuccessStatusCode();
        var createdReport3 = await createResponse3.Content.ReadFromJsonAsync<ReportResponse>();
        Assert.NotNull(createdReport3);

        var listOfReports = new List<ReportResponse> { createdReport1, createdReport2, createdReport3 };

        return listOfReports;
    }

    [Fact]
    public async Task GetAll_WithValidPayload_RetunsOk()
    {
        List<ReportResponse> reports = new();

        try
        {
            // Arrange
            reports = await CreateMultipleReportsAndReturnIdsAsync();

            // Act
            var response = await _client.GetAsync("/api/reports");
            response.EnsureSuccessStatusCode();

            //Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var returnedReports = await response.Content.ReadFromJsonAsync<List<ReportResponse>>();
            Assert.NotNull(returnedReports);

            // Deve retornar pelo menos os relatórios que criamos
            Assert.True(returnedReports.Count >= reports.Count, $"Esperado pelo menos {reports.Count} relatórios, obtidos: {returnedReports.Count}");
            // Deve conter os relatórios que criamos (comparar por Id é mais robusto)
            var returnedIds = returnedReports
                .Select(r => r.Id)
                .Where(id => !string.IsNullOrEmpty(id))
                .ToHashSet();
            foreach (var created in reports)
            {
                Assert.False(string.IsNullOrEmpty(created?.Id));
                Assert.Contains(created.Id, returnedIds);
            }
        }
        finally
        {
            // Cleanup created reports — assumes ReportResponse has a string Id property.
            foreach (var report in reports)
            {
                if (report?.Id is string id && !string.IsNullOrEmpty(id))
                {
                    await CleanupReportAsync(id);
                }
            }
        }
    }
}