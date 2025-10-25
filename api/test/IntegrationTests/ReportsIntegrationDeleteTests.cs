using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Net.Http;
using ReportsApi.Models;
using Xunit;

namespace ReportsApi.Tests.IntegrationTests
{
	public class ReportsApiIntegrationDeleteTests : IClassFixture<CustomWebApplicationFactory>
	{
		private readonly HttpClient _client;

		public ReportsApiIntegrationDeleteTests(CustomWebApplicationFactory factory)
		{
			_client = factory.CreateClient();
		}

		// Helper: create a report and return the full response with Id
		private async Task<ReportResponse> CreateReportAndGetIdAsync(CreateReportRequest createRequest)
		{
			var createResponse = await _client.PostAsJsonAsync("/api/reports", createRequest);
			createResponse.EnsureSuccessStatusCode();
			var created = await createResponse.Content.ReadFromJsonAsync<ReportResponse>();
			Assert.NotNull(created);
			return created!;
		}

		// Helper: best-effort cleanup for any leftover record
		private async Task CleanupReportAsync(string? reportId)
		{
			if (!string.IsNullOrWhiteSpace(reportId))
			{
				try
				{
					await _client.DeleteAsync($"/api/Reports/{reportId}");
				}
				catch
				{
					// ignore cleanup failures
				}
			}
		}

		[Fact]
		public async Task DeleteReport_WithValidId_ReturnsNoContent()
		{
			string? reportId = null;
			try
			{
				// Arrange: create a valid report
				var createRequest = new CreateReportRequest
				{
					CrimeGenre = "Hate Crime",
					CrimeType = "Assault",
					Description = "Initial description",
					Location = "Central Park",
					CrimeDate = DateTime.UtcNow,
					Resolved = false
				};

				var created = await CreateReportAndGetIdAsync(createRequest);
				reportId = created.Id;

				// Act: delete by id
				var deleteResponse = await _client.DeleteAsync($"/api/Reports/{reportId}");

				// Assert
				Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

				// Optional: verify it's gone
				var getAfterDelete = await _client.GetAsync($"/api/Reports/{reportId}");
				Assert.Equal(HttpStatusCode.NotFound, getAfterDelete.StatusCode);
			}
			finally
			{
				await CleanupReportAsync(reportId);
			}
		}

		[Fact]
		public async Task DeleteReport_WithNonExistentId_ReturnsNotFound()
		{
			// Arrange
			var nonExistentId = "non-existent-id";

			// Act
			var response = await _client.DeleteAsync($"/api/Reports/{nonExistentId}");

			// Assert
			Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
		}

		[Fact]
		public async Task DeleteReport_WithNullId_ReturnsNotFound()
		{
			// Act: try to pass a null-like id value in the route
			var response = await _client.DeleteAsync("/api/Reports/null");

			// Assert: API should treat it as an unknown id
			Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
		}
	}
}
