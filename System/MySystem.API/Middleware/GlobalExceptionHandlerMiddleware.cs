using System.Net;
using System.Text.Json;
using MySystem.Service.Exceptions;
using MySystem.Service.Models;

namespace MySystem.API.Middleware;

public class GlobalExceptionHandlerMiddleware : IMiddleware
{
    private readonly IHostEnvironment _environment;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(
        IHostEnvironment environment,
        ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            AppException appEx = ex switch
            {
                AppException alreadyAppEx => alreadyAppEx,
                _ => new ServerException("An unexpected system error occurred.")
            };

            if (appEx.StatusCode >= 500)
            {
                _logger.LogError(ex, "Unhandled exception occurred while processing request {Path}",
                                context.Request.Path);
            }
            else
            {
                _logger.LogWarning("Request {Path} failed with status {StatusCode}: {Message}",
                                context.Request.Path, appEx.StatusCode, ex.Message);
            }

            if (context.Response.HasStarted)
            {
                _logger.LogWarning("The response has already started, the global exception middleware will not write an error response");
                throw;
            }

            context.Response.ContentType = "application/json";

            context.Response.StatusCode = appEx.StatusCode;

            object? errors = null;
            if (ex is ValidationExceptionErrorV1 valEx)
            {
                errors = valEx.Errors;
            }
            else if (_environment.IsDevelopment())
            {
                errors = new { detail = ex.Message };
            }

            var response = ApiResponseFactory.Error(
                title: appEx.Title,
                status: appEx.StatusCode,
                detail: appEx.StatusCode >= 500 ? "An unexpected error occurred." : ex.Message,
                messageCode: appEx.MessageCode,
                errors: errors,
                traceId: context.TraceIdentifier
            );

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}