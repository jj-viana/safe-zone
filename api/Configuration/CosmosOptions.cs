using System.ComponentModel.DataAnnotations;

namespace ReportsApi.Configuration;

public class CosmosOptions
{
    [Required]
    public string ConnectionString { get; set; } = string.Empty;

    [Required]
    public string DatabaseId { get; set; } = string.Empty;

    [Required]
    public string ContainerId { get; set; } = string.Empty;

    public bool EnableContentResponseOnWrite { get; set; } = false;
}
