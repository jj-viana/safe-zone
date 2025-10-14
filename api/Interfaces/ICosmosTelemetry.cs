using System.Collections.Generic;

namespace ReportsApi.Interfaces;

public interface ICosmosTelemetry
{
    void TrackRequestUnits(string operationName, double requestCharge, IReadOnlyDictionary<string, string?>? properties = null);
}
