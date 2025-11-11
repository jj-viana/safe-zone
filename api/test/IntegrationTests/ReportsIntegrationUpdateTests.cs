using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using ReportsApi.Models;
using Xunit;
using System.Net.Http;

namespace ReportsApi.Tests.IntegrationTests
{
    public class ReportsApiIntegrationUpdateTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public ReportsApiIntegrationUpdateTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        private static UpdateReportRequest CreateSampleUpdateRequest() => new()
        {
            Description = "Updated description",
            Resolved = true
        };

        // create a report 
        private async Task<ReportResponse> CreateReportAndGetIdAsync(CreateReportRequest createRequest)
        {
            var createResponse = await _client.PostAsJsonAsync("/api/reports", createRequest);
            createResponse.EnsureSuccessStatusCode();
            var createdReport = await createResponse.Content.ReadFromJsonAsync<ReportResponse>();
            Assert.NotNull(createdReport);
            return createdReport;
        }

        // tries to delete the created record after the test execution
        private async Task CleanupReportAsync(string? reportId)
        {
           
            if (!string.IsNullOrEmpty(reportId))
            {
                await _client.DeleteAsync($"/api/reports/{reportId}");
            }
        }

        [Fact]
        public async Task UpdateReport_WithValidPayload_ReturnsOk()
        {
            string? reportId = null; 
            try
            {
                // Arrange
                var createRequest = new CreateReportRequest
                {
                    CrimeGenre = "Hate Crime",
                    CrimeType = "Assault",
                    Description = "Initial description",
                    Location = "Central Park",
                    Region = "Taguatinga",
                    CrimeDate = DateTime.UtcNow,
                    Resolved = false
                };

                // create the report 
                var createdReport = await CreateReportAndGetIdAsync(createRequest);
                reportId = createdReport.Id; // Capture Id for cleanup

                // prepare the update
                var updateRequest = new UpdateReportRequest
                {
                    Description = "Updated description",
                    Resolved = true
                };

                // Act
                var updateResponse = await _client.PatchAsJsonAsync($"/api/Reports/{reportId}", updateRequest);

                // Assert
                Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
                var updatedReport = await updateResponse.Content.ReadFromJsonAsync<ReportResponse>();
                Assert.NotNull(updatedReport);
                Assert.Equal(updateRequest.Description, updatedReport.Description);
                Assert.Equal(updateRequest.Resolved, updatedReport.Resolved);
            }
            finally
            {
                
                await CleanupReportAsync(reportId);
            }
        }

        [Fact]
        public async Task UpdateReport_WithNonExistentId_ReturnsNotFound()
        {
            // Arrange
            var nonExistentId = "non-existent-id";
            var updateRequest = CreateSampleUpdateRequest();

            // Act
            var response = await _client.PatchAsJsonAsync($"/api/Reports/{nonExistentId}", updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task UpdateReport_WithInvalidType_ReturnsBadRequest()
        {
            string? reportId = null;
            try
            {
                // Arrange
                var createRequest = new CreateReportRequest
                {
                    CrimeGenre = "Hate Crime",
                    CrimeType = "Assault",
                    Description = "Initial description",
                    Location = "Central Park",
                    Region = "Taguatinga",
                    CrimeDate = DateTime.UtcNow,
                    Resolved = false
                };

                var createdReport = await CreateReportAndGetIdAsync(createRequest);
                reportId = createdReport.Id;

                var invalidContent = new
                {
                    description = 123, // number instead of string
                    resolved = "true" //  string instead of bool
                };

                // Act
                var response = await _client.PatchAsJsonAsync($"/api/Reports/{reportId}", invalidContent);

                // Assert
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            }
            finally
            {
                await CleanupReportAsync(reportId);
            }
        }

        [Fact]
        public async Task UpdateReport_WithNullDescription_ReturnsOk()
        {
            string? reportId = null;
            try
            {
                // Arrange
                var createRequest = new CreateReportRequest
                {
                    CrimeGenre = "Hate Crime",
                    CrimeType = "Assault",
                    Description = "Initial description",
                    Location = "Central Park",
                    Region = "Taguatinga",
                    CrimeDate = DateTime.UtcNow,
                    Resolved = false
                };

                var createdReport = await CreateReportAndGetIdAsync(createRequest);
                reportId = createdReport.Id;

                var updateRequest = new UpdateReportRequest
                {
                    Description = null,
                    Resolved = true
                };

                // Act
                var response = await _client.PatchAsJsonAsync($"/api/Reports/{reportId}", updateRequest);

                // Assert
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                var updatedReport = await response.Content.ReadFromJsonAsync<ReportResponse>();
                
                Assert.NotNull(updatedReport);
                Assert.Equal("Initial description", updatedReport.Description);
                Assert.True(updatedReport.Resolved);
            }
            finally
            {
                // CLEANUP
                await CleanupReportAsync(reportId);
            }
        }

        [Fact]
        public async Task UpdateReport_WithTooLongDescription_ReturnsBadRequest()
        {
            string? reportId = null;
            try
            {
                // Arrange 
                var createRequest = new CreateReportRequest
                {
                    CrimeGenre = "Hate Crime",
                    CrimeType = "Assault",
                    Description = "Initial description",
                    Location = "Central Park",
                    Region = "Taguatinga",
                    CrimeDate = DateTime.UtcNow,
                    Resolved = false
                };

                var createdReport = await CreateReportAndGetIdAsync(createRequest);
                reportId = createdReport.Id;


                var updateRequest = new UpdateReportRequest
                {
                    Description = new string('x', 2049),
                    Resolved = true
                };

                // Act
                var response = await _client.PatchAsJsonAsync($"/api/Reports/{createdReport.Id}", updateRequest);

                // Assert
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            }
            finally
            {
                // CLEANUP
                await CleanupReportAsync(reportId);
            }
        }
    }

  // method extension to support PATCH (pieces)
    public static class HttpClientExtensions
    {
        public static Task<HttpResponseMessage> PatchAsJsonAsync<TValue>(this HttpClient client, string requestUri, TValue value)
        {
            var content = JsonContent.Create(value);
            using var request = new HttpRequestMessage(new HttpMethod("PATCH"), requestUri) { Content = content };
            return client.SendAsync(request);
        }
    }
}