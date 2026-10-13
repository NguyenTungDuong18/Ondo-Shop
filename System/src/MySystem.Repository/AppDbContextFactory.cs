using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MySystem.Repository;

// Design-time tooling must not run application startup or seed an existing database.
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__PostgresSql")
            ?? "Host=localhost;Database=mysystem;Username=postgres";
        return new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connection, options => options.UseVector()).Options);
    }
}
