using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Threading;
using Microsoft.Azure.Cosmos;

namespace ReportsApi.Tests.Services.Fakes;

/// <summary>
/// Provides Cosmos SDK doubles to unit test <see cref="ReportService"/> without hitting the network.
/// </summary>
internal sealed class TestCosmosDiagnostics : CosmosDiagnostics
{
    private readonly string _diagnostics;

    public TestCosmosDiagnostics(string diagnostics = "diagnostics")
    {
        _diagnostics = diagnostics;
    }

    public override IReadOnlyList<(string regionName, Uri uri)> GetContactedRegions() => Array.Empty<(string regionName, Uri uri)>();

    public override string ToString() => _diagnostics;
}

internal sealed class FeedResponseStub<T> : FeedResponse<T>
{
    private readonly IReadOnlyList<T> _items;
    private readonly Headers _headers = new();
    private readonly double _requestCharge;
    private readonly string? _continuationToken;
    private readonly CosmosDiagnostics _diagnostics = new TestCosmosDiagnostics();

    public FeedResponseStub(IEnumerable<T> items, double requestCharge, string? continuationToken = null)
    {
        _items = items.ToList();
        _requestCharge = requestCharge;
        _continuationToken = continuationToken;
        _headers.Add("x-ms-request-charge", requestCharge.ToString(CultureInfo.InvariantCulture));
    }

    public override Headers Headers => _headers;
    public override IReadOnlyList<T> Resource => _items;
    public override int Count => _items.Count;
    public override double RequestCharge => _requestCharge;
    public override string IndexMetrics => string.Empty;
    public override HttpStatusCode StatusCode => HttpStatusCode.OK;
    public override string? ContinuationToken => _continuationToken;
    public override string ActivityId => Guid.NewGuid().ToString();
    public override CosmosDiagnostics Diagnostics => _diagnostics;
    public override IEnumerator<T> GetEnumerator() => _items.GetEnumerator();
}

internal sealed class FeedIteratorStub<T> : FeedIterator<T>
{
    private readonly Queue<FeedResponse<T>> _responses;

    public FeedIteratorStub(IEnumerable<FeedResponse<T>> responses)
    {
        _responses = new Queue<FeedResponse<T>>(responses);
    }

    public override bool HasMoreResults => _responses.Count > 0;

    public override Task<FeedResponse<T>> ReadNextAsync(CancellationToken cancellationToken = default)
    {
        if (!HasMoreResults)
        {
            throw new InvalidOperationException("No more results available in iterator stub.");
        }

        return Task.FromResult(_responses.Dequeue());
    }
}

internal sealed class ItemResponseStub<T> : ItemResponse<T>
{
    private readonly T? _resource;
    private readonly double _requestCharge;
    private readonly HttpStatusCode _statusCode;
    private readonly Headers _headers = new();
    private readonly CosmosDiagnostics _diagnostics = new TestCosmosDiagnostics();

    public ItemResponseStub(T? resource, double requestCharge, HttpStatusCode statusCode = HttpStatusCode.OK)
    {
        _resource = resource;
        _requestCharge = requestCharge;
        _statusCode = statusCode;
    }

    public override T Resource => _resource!;
    public override double RequestCharge => _requestCharge;
    public override string ActivityId => Guid.NewGuid().ToString();
    public override string ETag => string.Empty;
    public override Headers Headers => _headers;
    public override HttpStatusCode StatusCode => _statusCode;
    public override CosmosDiagnostics Diagnostics => _diagnostics;
}
