using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace MySystem.API.Extensions;

public static class SwaggerExtensions
{
    public static void AddSwaggerServices(this IServiceCollection services)
    {
        services.AddSwaggerGen();
    }

    public static void UseSwaggerAPI(this WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "MySystem API v1");
            options.DisplayRequestDuration();   // Hiển thị thời gian thực hiện của request
            options.EnableTryItOutByDefault();
            options.DocExpansion(DocExpansion.List);
        });

        // Redirect root access to swagger
        app.MapGet("/", () => Results.Redirect("/swagger/index.html"))
            .ExcludeFromDescription();
    }
}