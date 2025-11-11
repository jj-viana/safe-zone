using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ReportsApi.Models;

public class Report
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("crimeGenre")]
    public string CrimeGenre { get; set; } = null!;

    [JsonPropertyName("crimeType")]
    public string CrimeType { get; set; } = null!;

    [JsonPropertyName("description")]
    public string Description { get; set; } = null!;

    [JsonPropertyName("location")]
    public string Location { get; set; } = null!;

    [JsonPropertyName("region")]
    public string Region { get; set; } = null!;

    [JsonPropertyName("crimeDate")]
    public DateTime CrimeDate { get; set; }
        = DateTime.UtcNow;

    [JsonPropertyName("reporterDetails")]
    public ReporterDetails? ReporterDetails { get; set; }
        = null;

    [JsonPropertyName("createdDate")]
    public DateTime CreatedDate { get; set; }
        = DateTime.UtcNow;

    [JsonPropertyName("resolved")]
    public bool Resolved { get; set; }
        = false;

    [JsonIgnore]
    public string PartitionKey => Id;
}

public class ReporterDetails
{
    [JsonPropertyName("ageGroup")]
    public string? AgeGroup { get; set; }
        = null;

    [JsonPropertyName("ethnicity")]
    public string? Ethnicity { get; set; }
        = null;

    [JsonPropertyName("genderIdentity")]
    public string? GenderIdentity { get; set; }
        = null;

    [JsonPropertyName("sexualOrientation")]
    public string? SexualOrientation { get; set; }
        = null;
}

public class ReporterDetailsRequest
{
    [StringLength(32)]
    [JsonPropertyName("ageGroup")]
    public string? AgeGroup { get; set; }
        = null;

    [StringLength(32)]
    [JsonPropertyName("ethnicity")]
    public string? Ethnicity { get; set; }
        = null;

    [StringLength(32)]
    [JsonPropertyName("genderIdentity")]
    public string? GenderIdentity { get; set; }
        = null;

    [StringLength(32)]
    [JsonPropertyName("sexualOrientation")]
    public string? SexualOrientation { get; set; }
        = null;
}

public class CreateReportRequest
{
    [Required]
    [StringLength(256)]
    [JsonPropertyName("crimeGenre")]
    public string CrimeGenre { get; set; } = null!;

    [Required]
    [StringLength(256)]
    [JsonPropertyName("crimeType")]
    public string CrimeType { get; set; } = null!;

    [Required]
    [StringLength(2048)]
    [JsonPropertyName("description")]
    public string Description { get; set; } = null!;

    [Required]
    [StringLength(512)]
    [JsonPropertyName("location")]
    public string Location { get; set; } = null!;

    [Required]
    [StringLength(128)]
    [JsonPropertyName("region")]
    public string Region { get; set; } = null!;

    [Required]
    [JsonPropertyName("crimeDate")]
    public DateTime? CrimeDate { get; set; }
        = null;

    [JsonPropertyName("reporterDetails")]
    public ReporterDetailsRequest? ReporterDetails { get; set; }
        = null;

    [Required]
    [JsonPropertyName("resolved")]
    public bool? Resolved { get; set; }
        = null;
}

public class UpdateReportRequest
{
    [StringLength(256)]
    [JsonPropertyName("crimeGenre")]
    public string? CrimeGenre { get; set; }
        = null;

    [StringLength(256)]
    [JsonPropertyName("crimeType")]
    public string? CrimeType { get; set; }
        = null;

    [StringLength(2048)]
    [JsonPropertyName("description")]
    public string? Description { get; set; }
        = null;

    [StringLength(512)]
    [JsonPropertyName("location")]
    public string? Location { get; set; }
        = null;

    [StringLength(128)]
    [JsonPropertyName("region")]
    public string? Region { get; set; }
        = null;

    [JsonPropertyName("crimeDate")]
    public DateTime? CrimeDate { get; set; }
        = null;

    [JsonPropertyName("reporterDetails")]
    public ReporterDetailsRequest? ReporterDetails { get; set; }
        = null;

    [JsonPropertyName("resolved")]
    public bool? Resolved { get; set; }
        = null;
}

public record ReporterDetailsResponse(
    [property: JsonPropertyName("ageGroup")] string? AgeGroup,
    [property: JsonPropertyName("ethnicity")] string? Ethnicity,
    [property: JsonPropertyName("genderIdentity")] string? GenderIdentity,
    [property: JsonPropertyName("sexualOrientation")] string? SexualOrientation)
{
    public static ReporterDetailsResponse? FromModel(ReporterDetails? details) =>
        details is null
            ? null
            : new ReporterDetailsResponse(
                details.AgeGroup,
                details.Ethnicity,
                details.GenderIdentity,
                details.SexualOrientation);
}

public record ReportResponse(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("crimeGenre")] string CrimeGenre,
    [property: JsonPropertyName("crimeType")] string CrimeType,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("location")] string Location,
    [property: JsonPropertyName("region")] string Region,
    [property: JsonPropertyName("crimeDate")] DateTime CrimeDate,
    [property: JsonPropertyName("reporterDetails")] ReporterDetailsResponse? ReporterDetails,
    [property: JsonPropertyName("createdDate")] DateTime CreatedDate,
    [property: JsonPropertyName("resolved")] bool Resolved)
{
    public static ReportResponse FromModel(Report report) =>
        new(
            report.Id,
            report.CrimeGenre,
            report.CrimeType,
            report.Description,
            report.Location,
            report.Region,
            report.CrimeDate,
            ReporterDetailsResponse.FromModel(report.ReporterDetails),
            report.CreatedDate,
            report.Resolved);
}
