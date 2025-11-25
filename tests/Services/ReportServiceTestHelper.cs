using System;
using System.Reflection;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using ReportsApi.Configuration;
using ReportsApi.Interfaces;
using ReportsApi.Services;

namespace ReportsApi.Tests.Services;

internal static class ReportServiceTestHelper
{
    public static ReportService CreateService(Mock<Container> containerMock, Mock<ICosmosTelemetry>? telemetryMock = null, Action<CosmosOptions>? configureOptions = null)
    {
        var cosmosClient = Mock.Of<CosmosClient>();
        var options = new CosmosOptions
        {
            ConnectionString = "AccountEndpoint=https://localhost:8081/;AccountKey=fake==;",
            DatabaseId = "ReportsDb",
            ContainerId = "Reports",
            EnableContentResponseOnWrite = true
        };
        configureOptions?.Invoke(options);
        var logger = Mock.Of<ILogger<ReportService>>();
        var telemetry = telemetryMock ?? new Mock<ICosmosTelemetry>();

        var service = new ReportService(cosmosClient, Options.Create(options), logger, telemetry.Object);
        var containerField = typeof(ReportService).GetField("_container", BindingFlags.Instance | BindingFlags.NonPublic)
            ?? throw new InvalidOperationException("Unable to locate container field");
        containerField.SetValue(service, containerMock.Object);
        return service;
    }
}
