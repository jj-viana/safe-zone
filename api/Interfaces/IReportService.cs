using ReportsApi.Models;

namespace ReportsApi.Interfaces;

public interface IReportService
{
    Task<ReportResponse> CreateAsync(CreateReportRequest request, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<ReportResponse>> GetAllAsync(string? status, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<ReportResponse>> GetByCrimeGenreAsync(string crimeGenre, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<ReportResponse>> GetByCrimeTypeAsync(string crimeType, CancellationToken cancellationToken);

    Task<ReportResponse?> GetByIdAsync(string id, CancellationToken cancellationToken);

    Task<ReportResponse?> UpdateAsync(string id, UpdateReportRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken);
}
