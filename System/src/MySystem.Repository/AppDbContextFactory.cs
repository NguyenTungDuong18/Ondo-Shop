using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace MySystem.Repository;

// Design-time tooling must not run application startup or seed an existing database.
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__PostgresSql");
        if (string.IsNullOrWhiteSpace(connection))
        {
            var environment = Argument(args, "--environment")
                ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
                ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                ?? "Development";
            var root = Argument(args, "--content-root") ?? FindApiDirectory();
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Path.GetFullPath(root))
                .AddJsonFile("appsettings.json", optional: true)
                .AddJsonFile($"appsettings.{environment}.json", optional: true)
                .Build();
            connection = configuration.GetConnectionString("PostgresSql");
        }
        if (string.IsNullOrWhiteSpace(connection))
            throw new InvalidOperationException(
                "Missing ConnectionStrings:PostgresSql. Configure the API appsettings.json or set ConnectionStrings__PostgresSql before running dotnet ef.");
        return new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connection, options => options.UseVector()).Options);
    }

    private static string? Argument(string[] args, string name)
    {
        for (var i = 0; i < args.Length; i++)
        {
            if (args[i].StartsWith(name + "=", StringComparison.Ordinal))
                return args[i][(name.Length + 1)..];
            if (args[i] == name && i + 1 < args.Length) return args[i + 1];
        }
        return null;
    }

    private static string FindApiDirectory()
    {
        foreach (var start in new[] { Directory.GetCurrentDirectory(), AppContext.BaseDirectory })
        {
            for (var directory = new DirectoryInfo(start); directory != null; directory = directory.Parent)
            {
                foreach (var relative in new[] { "", "MySystem.API", "src/MySystem.API", "System/src/MySystem.API" })
                {
                    var candidate = Path.Combine(directory.FullName, relative);
                    if (File.Exists(Path.Combine(candidate, "MySystem.API.csproj"))) return candidate;
                }
            }
        }
        throw new InvalidOperationException(
            "Cannot locate MySystem.API configuration. Run from the solution/workspace directory or pass -- --content-root <API directory>.");
    }
}
