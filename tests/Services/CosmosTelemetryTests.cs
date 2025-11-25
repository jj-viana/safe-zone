using System.Collections.Generic;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using ReportsApi.Configuration;
using ReportsApi.Services;
using Xunit;

namespace ReportsApi.Tests.Services;

public class CosmosTelemetryTests
{
    [Fact]
    public void TrackRequestUnits_WhenChargeNonPositive_DoesNotEmitMetrics()
    {
        using var channel = new TestTelemetryChannel();
        using var configuration = new TelemetryConfiguration
        {
            TelemetryChannel = channel,
            ConnectionString = "InstrumentationKey=00000000-0000-0000-0000-000000000000",
            DisableTelemetry = false
        };
        var client = new TelemetryClient(configuration);
        var telemetry = new CosmosTelemetry(client, Options.Create(new CosmosOptions
        {
            DatabaseId = "db",
            ContainerId = "container"
        }), Mock.Of<ILogger<CosmosTelemetry>>());

        telemetry.TrackRequestUnits("Any", 0, null);
        telemetry.TrackRequestUnits("Any", -5, null);

        Assert.Empty(channel.SentTelemetry);
    }

    [Fact]
    public void TrackRequestUnits_WhenChargePositive_EnrichesMetricProperties()
    {
        using var channel = new TestTelemetryChannel();
        using var configuration = new TelemetryConfiguration
        {
            TelemetryChannel = channel,
            ConnectionString = "InstrumentationKey=00000000-0000-0000-0000-000000000000",
            DisableTelemetry = false
        };
        var client = new TelemetryClient(configuration);
        var telemetry = new CosmosTelemetry(client, Options.Create(new CosmosOptions
        {
            DatabaseId = "db",
            ContainerId = "container"
        }), Mock.Of<ILogger<CosmosTelemetry>>());

        telemetry.TrackRequestUnits("ReportCreate", 4.2, new Dictionary<string, string?>
        {
            ["statusCode"] = "200",
            ["ignored"] = null,
            [" "] = "value"
        });

        var metric = Assert.IsType<MetricTelemetry>(Assert.Single(channel.SentTelemetry));
        Assert.Equal("cosmos.request.units", metric.Name);
        Assert.Equal(4.2, metric.Sum);
        Assert.Equal("ReportCreate", metric.Properties["operation"]);
        Assert.Equal("db", metric.Properties["databaseId"]);
        Assert.Equal("container", metric.Properties["containerId"]);
        Assert.Equal("200", metric.Properties["statusCode"]);
        Assert.False(metric.Properties.ContainsKey("ignored"));
        Assert.False(metric.Properties.ContainsKey(" "));
    }
}

internal sealed class TestTelemetryChannel : ITelemetryChannel
{
    public List<ITelemetry> SentTelemetry { get; } = new();
    public bool? DeveloperMode { get; set; }
    public string? EndpointAddress { get; set; }

    public void Send(ITelemetry item) => SentTelemetry.Add(item);
    public void Flush()
    {
    }

    public void Dispose()
    {
    }
}