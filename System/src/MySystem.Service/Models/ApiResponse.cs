using System.Collections;

namespace MySystem.Service.Models;

public abstract class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? TraceId { get; set; }
    public DateTime TimestampUtc { get; set; }
}

public class ApiDataResponse : ApiResponse
{
    public object? Data { get; set; }
}

public class PaginationValue
{
    public List<object> Items { get; set; } = new();
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

public class ApiPaginationResponse : ApiResponse
{
    public List<object> Items { get; set; } = new();
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

public class ErrorResponse
{
    public string Title { get; set; } = null!;
    public int Status { get; set; }
    public string Detail { get; set; } = null!;
    public string MessageCode { get; set; } = null!;
    public object? Errors { get; set; }
    public string? TraceId { get; set; }
    public DateTime TimestampUtc { get; set; }
}

public static class ApiResponseFactory
{
    public static ApiDataResponse Base(
        object? data, bool success = true,
        string? message = null, string? traceId = null)
    {
        return new ApiDataResponse
        {
            Success = success,
            Message = message ?? (success ? "Thành công" : "Có lỗi xảy ra"),
            Data = data,
            TraceId = traceId,
            TimestampUtc = DateTime.UtcNow
        };
    }

    public static ApiPaginationResponse BasePagination(
        IList? items, int pageIndex, int pageSize, int totalCount)
    {
        var newItems = new List<object>();
        if (items != null)
        {
            foreach (var item in items)
            {
                newItems.Add(item);
            }
        }
        return new ApiPaginationResponse
        {
            Success = true,
            Message = "Lấy dữ liệu thành công",
            Items = newItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
            TotalCount = totalCount,
            HasNextPage = pageIndex * pageSize < totalCount,
            HasPreviousPage = pageIndex > 1,
            TraceId = null,
            TimestampUtc = DateTime.UtcNow
        };
    }

    public static ErrorResponse Error(
        string title, int status, string detail,
        string messageCode, object? errors, string? traceId = null)
    {
        return new ErrorResponse
        {
            Title = title,
            Status = status,
            Detail = detail,
            MessageCode = messageCode,
            Errors = errors,
            TraceId = traceId,
            TimestampUtc = DateTime.UtcNow
        };
    }
}