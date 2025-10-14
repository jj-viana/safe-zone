using Microsoft.AspNetCore.Mvc;
using ReportsApi.Interfaces;
using ReportsApi.Models;

namespace ReportsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _service;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IReportService service, ILogger<ReportsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new incident report.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ReportResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAsync([FromBody] CreateReportRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            _logger.LogInformation("Received request to create report");
            _logger.LogDebug("Create report payload received");
            var created = await _service.CreateAsync(request, cancellationToken);

            _logger.LogInformation("Report {ReportId} created successfully", created.Id);
            return CreatedAtRoute("GetReportById", new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid payload when creating report");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when creating report");
            return Problem(title: "Unexpected error when creating report", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Lists all incident reports.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ReportResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllAsync(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Listing all reports");
            var reports = await _service.GetAllAsync(cancellationToken);
            _logger.LogInformation("Returned {Count} reports", reports.Count);
            return Ok(reports);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when listing reports");
            return Problem(title: "Unexpected error when listing reports", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Lists all incident reports for a given crime genre.
    /// </summary>
    [HttpGet("crime-genre/{crimeGenre}")]
    [ProducesResponseType(typeof(IEnumerable<ReportResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetByCrimeGenreAsync(string crimeGenre, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(crimeGenre))
        {
            return BadRequest(new { error = "The crimeGenre value is required." });
        }

        try
        {
            _logger.LogInformation("Listing reports by crime genre {CrimeGenre}", crimeGenre);
            var reports = await _service.GetByCrimeGenreAsync(crimeGenre, cancellationToken);
            _logger.LogInformation("Returned {Count} reports for crime genre {CrimeGenre}", reports.Count, crimeGenre);
            return Ok(reports);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when listing reports by crime genre {CrimeGenre}", crimeGenre);
            return Problem(title: "Unexpected error when listing reports", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Lists all incident reports for a given crime type.
    /// </summary>
    [HttpGet("crime-type/{crimeType}")]
    [ProducesResponseType(typeof(IEnumerable<ReportResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetByCrimeTypeAsync(string crimeType, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(crimeType))
        {
            return BadRequest(new { error = "The crimeType value is required." });
        }

        try
        {
            _logger.LogInformation("Listing reports by crime type {CrimeType}", crimeType);
            var reports = await _service.GetByCrimeTypeAsync(crimeType, cancellationToken);
            _logger.LogInformation("Returned {Count} reports for crime type {CrimeType}", reports.Count, crimeType);
            return Ok(reports);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when listing reports by crime type {CrimeType}", crimeType);
            return Problem(title: "Unexpected error when listing reports", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Gets an incident report by its identifier.
    /// </summary>
    [HttpGet("{id}", Name = "GetReportById")]
    [ProducesResponseType(typeof(ReportResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Fetching report {ReportId}", id);
            var report = await _service.GetByIdAsync(id, cancellationToken);
            if (report is null)
            {
                _logger.LogInformation("Report {ReportId} not found", id);
                return NotFound();
            }

            _logger.LogInformation("Report {ReportId} returned", id);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when fetching report {ReportId}", id);
            return Problem(title: "Unexpected error when fetching report", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Updates an incident report.
    /// </summary>
    [HttpPatch("{id}")]
    [ProducesResponseType(typeof(ReportResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAsync(string id, [FromBody] UpdateReportRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            _logger.LogInformation("Updating report {ReportId}", id);
            var updated = await _service.UpdateAsync(id, request, cancellationToken);
            if (updated is null)
            {
                _logger.LogInformation("Report {ReportId} not found for update", id);
                return NotFound();
            }

            _logger.LogInformation("Report {ReportId} updated", id);
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid payload when updating report {ReportId}", id);
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when updating report {ReportId}", id);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when updating report {ReportId}", id);
            return Problem(title: "Unexpected error when updating report", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Deletes an incident report by its identifier.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(string id, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Deleting report {ReportId}", id);
            var deleted = await _service.DeleteAsync(id, cancellationToken);
            if (!deleted)
            {
                _logger.LogInformation("Report {ReportId} not found for deletion", id);
                return NotFound();
            }

            _logger.LogInformation("Report {ReportId} deleted", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when deleting report {ReportId}", id);
            return Problem(title: "Unexpected error when deleting report", statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
