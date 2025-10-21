using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging.ApplicationInsights;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using ReportsApi.Configuration;
using ReportsApi.Interfaces;
using ReportsApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services
	.AddOptions<CosmosOptions>()
	.Bind(builder.Configuration.GetSection("CosmosDB"))
	.ValidateDataAnnotations()
	.Validate(options => !string.IsNullOrWhiteSpace(options.ConnectionString), "Cosmos ConnectionString deve ser configurado.");

builder.Services.AddSingleton(sp =>
{
	var options = sp.GetRequiredService<IOptions<CosmosOptions>>().Value;

	var clientOptions = new CosmosClientOptions
	{
		ApplicationName = builder.Environment.ApplicationName,
		ConnectionMode = ConnectionMode.Gateway,
		EnableContentResponseOnWrite = options.EnableContentResponseOnWrite,
		SerializerOptions = new CosmosSerializationOptions
		{
			PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
		}
	};

	return new CosmosClient(options.ConnectionString, clientOptions);
});

builder.Services.AddApplicationInsightsTelemetry(options =>
{
	var connectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
	if (!string.IsNullOrWhiteSpace(connectionString))
	{
		options.ConnectionString = connectionString;
	}

	options.EnableQuickPulseMetricStream = true;
	options.EnableAdaptiveSampling = false;
});

builder.Logging.AddFilter<ApplicationInsightsLoggerProvider>(string.Empty, LogLevel.Debug);
builder.Logging.AddFilter<ApplicationInsightsLoggerProvider>("Microsoft", LogLevel.Warning);

builder.Services.AddSingleton<ICosmosTelemetry, CosmosTelemetry>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddControllers();
builder.Services.AddHealthChecks();
builder.Services.AddEndpointsApiExplorer();

// Configuração de CORS para permitir APENAS chamadas do frontend
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend", policy =>
	{
		var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
			?? new[] { "http://localhost:3000" };

		policy.WithOrigins(allowedOrigins)
			.AllowAnyMethod()
			.AllowAnyHeader()
			.WithExposedHeaders("Location");
	});
});

builder.Services.AddSwaggerGen(options =>
{
	options.SwaggerDoc("v1", new OpenApiInfo
	{
		Title = "Reports API",
		Version = "v1",
		Description = "API to manage reports stored in Azure Cosmos DB."
	});
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI(options =>
	{
		options.SwaggerEndpoint("/swagger/v1/swagger.json", "Reports API v1");
	});
}
app.MapControllers();
app.MapHealthChecks("/");

app.Run();
