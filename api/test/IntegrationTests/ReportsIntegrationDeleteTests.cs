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
	public class ReportsApiIntegrationDeleteTests : IClassFixture<CustomWebApplicationFactory>
	{
		private readonly HttpClient _client;

		public ReportsApiIntegrationDeleteTests(CustomWebApplicationFactory factory)
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
			if (!string.IsNullOrWhiteSpace(reportId))
			{
				try
				{
					await _client.DeleteAsync($"/api/reports/{reportId}");
				}
				catch (Exception ex)
				{
					Console.WriteLine($"Exception during cleanup: {ex}");
				}
			}
		}

		[Fact]
		public async Task DeleteReport_WithValidId_ReturnsNoContent()
		{
			string? reportId = null;
			try
			{
				// Arrange
				var createRequest = new CreateReportRequest
				{
					CrimeGenre = "Hate Crime",
					CrimeType = "Assault",
					Description = "To be deleted",
					Location = "Central Park",
					Region = "Taguatinga",
					CrimeDate = DateTime.UtcNow,
					Status = "Draft",
					Resolved = false
				};
				var createdReport = await CreateReportAndGetIdAsync(createRequest);
				reportId = createdReport.Id;

				// Act
				var deleteResponse = await _client.DeleteAsync($"/api/reports/{reportId}");

				// Assert
				Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
			}
			finally
			{
				// Cleanup (idempotente)
				await CleanupReportAsync(reportId);
			}
		}

		[Fact]
		public async Task DeleteReport_WithNonExistentId_ReturnsNotFound()
		{
			// Arrange
			var nonExistentId = "non-existent-id";

			// Act
			var response = await _client.DeleteAsync($"/api/reports/{nonExistentId}");

			// Assert
			Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
		}
	}
}
