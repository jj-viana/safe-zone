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

        private static CreateReportRequest CreateSampleCreateRequest(string genre = "Hate Crime", string crimeType = "Assault") => new()
        {
            CrimeGenre = genre,
            CrimeType = crimeType,
            Description = "Initial description",
            Location = "Central Park",
            Region = "Taguatinga",
            CrimeDate = DateTime.UtcNow.AddDays(-1),
            Status = "Draft",
            Resolved = false,
            ReporterDetails = new ReporterDetailsRequest
            {
                AgeGroup = "18-24",
                Ethnicity = "Latino",
                GenderIdentity = "Non-binary",
                SexualOrientation = "Gay"
            }
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
                var createRequest = CreateSampleCreateRequest();

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
                Assert.Equal("Draft", updatedReport.Status);
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
                var createRequest = CreateSampleCreateRequest();

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
                var createRequest = CreateSampleCreateRequest();

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
                Assert.Equal("Draft", updatedReport.Status);
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
                var createRequest = CreateSampleCreateRequest();

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

        [Fact]
        public async Task UpdateReport_WithAllMutableFields_UpdatesEveryValue()
        {
            string? reportId = null;
            try
            {
                var createdReport = await CreateReportAndGetIdAsync(CreateSampleCreateRequest());
                reportId = createdReport.Id;

                var updateRequest = new UpdateReportRequest
                {
                    CrimeGenre = " Updated Genre ",
                    CrimeType = "Updated Type",
                    Description = "Updated description",
                    Location = "Updated location",
                    Region = "Updated region",
                    CrimeDate = DateTime.UtcNow,
                    Status = " Approved ",
                    Resolved = true,
                    ReporterDetails = new ReporterDetailsRequest
                    {
                        AgeGroup = "25-34",
                        Ethnicity = "Other",
                        GenderIdentity = "Female",
                        SexualOrientation = "Heterosexual"
                    }
                };

                var response = await _client.PatchAsJsonAsync($"/api/Reports/{reportId}", updateRequest);

                response.EnsureSuccessStatusCode();
                var updatedReport = await response.Content.ReadFromJsonAsync<ReportResponse>();
                Assert.NotNull(updatedReport);
                Assert.Equal("Updated Genre", updatedReport.CrimeGenre);
                Assert.Equal(updateRequest.CrimeType, updatedReport.CrimeType);
                Assert.Equal(updateRequest.Description, updatedReport.Description);
                Assert.Equal(updateRequest.Location, updatedReport.Location);
                Assert.Equal(updateRequest.Region, updatedReport.Region);
                Assert.Equal(updateRequest.Resolved, updatedReport.Resolved);
                Assert.Equal("Approved", updatedReport.Status);
                Assert.Equal(updateRequest.ReporterDetails!.AgeGroup, updatedReport.ReporterDetails!.AgeGroup);
                Assert.Equal(updateRequest.ReporterDetails!.Ethnicity, updatedReport.ReporterDetails!.Ethnicity);
                Assert.Equal(updateRequest.ReporterDetails!.GenderIdentity, updatedReport.ReporterDetails!.GenderIdentity);
                Assert.Equal(updateRequest.ReporterDetails!.SexualOrientation, updatedReport.ReporterDetails!.SexualOrientation);
            }
            finally
            {
                await CleanupReportAsync(reportId);
            }
        }

        [Fact]
        public async Task UpdateReport_WithWhitespaceStatus_ReturnsBadRequest()
        {
            string? reportId = null;
            try
            {
                var createdReport = await CreateReportAndGetIdAsync(CreateSampleCreateRequest());
                reportId = createdReport.Id;

                var updateRequest = new UpdateReportRequest
                {
                    Status = "  "
                };

                var response = await _client.PatchAsJsonAsync($"/api/Reports/{reportId}", updateRequest);

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            }
            finally
            {
                await CleanupReportAsync(reportId);
            }
        }

        [Fact]
        public async Task UpdateReport_WithNoChanges_ReturnsExistingPayload()
        {
            string? reportId = null;
            try
            {
                var createdReport = await CreateReportAndGetIdAsync(CreateSampleCreateRequest());
                reportId = createdReport.Id;

                var response = await _client.PatchAsJsonAsync($"/api/Reports/{reportId}", new UpdateReportRequest());

                response.EnsureSuccessStatusCode();
                var updatedReport = await response.Content.ReadFromJsonAsync<ReportResponse>();
                Assert.NotNull(updatedReport);
                Assert.Equal(createdReport.Id, updatedReport.Id);
                Assert.Equal(createdReport.Description, updatedReport.Description);
                Assert.Equal(createdReport.Status, updatedReport.Status);
                Assert.Equal(createdReport.ReporterDetails!.AgeGroup, updatedReport.ReporterDetails!.AgeGroup);
            }
            finally
            {
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
            var request = new HttpRequestMessage(new HttpMethod("PATCH"), requestUri) { Content = content };
            return client.SendAsync(request);
        }
    }
}
