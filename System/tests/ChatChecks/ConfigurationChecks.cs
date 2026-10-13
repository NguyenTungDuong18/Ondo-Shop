using Microsoft.EntityFrameworkCore;
using MySystem.Repository;

internal static class ConfigurationChecks
{
    public static void Run()
    {
        var directory = Path.Combine(Path.GetTempPath(), "chat-config-check-" + Guid.NewGuid());
        Directory.CreateDirectory(directory);
        var original = Environment.GetEnvironmentVariable("ConnectionStrings__PostgresSql");
        try
        {
            Environment.SetEnvironmentVariable("ConnectionStrings__PostgresSql", null);
            File.WriteAllText(Path.Combine(directory, "appsettings.json"),
                """{"ConnectionStrings":{"PostgresSql":"Host=localhost;Database=base_check;Username=test;Password=test"}}""");
            File.WriteAllText(Path.Combine(directory, "appsettings.Test.json"),
                """{"ConnectionStrings":{"PostgresSql":"Host=localhost;Database=environment_check;Username=test;Password=test"}}""");
            var factory = new AppDbContextFactory();
            using var baseline = factory.CreateDbContext(["--content-root", directory, "--environment", "Absent"]);
            Assert(baseline.Database.GetDbConnection().Database == "base_check", "EF reads API base configuration");
            using var environment = factory.CreateDbContext(["--content-root", directory, "--environment", "Test"]);
            Assert(environment.Database.GetDbConnection().Database == "environment_check", "environment configuration overrides base configuration");
            Environment.SetEnvironmentVariable("ConnectionStrings__PostgresSql", "Host=localhost;Database=override_check;Username=test");
            using var overridden = factory.CreateDbContext(["--content-root", directory, "--environment", "Test"]);
            Assert(overridden.Database.GetDbConnection().Database == "override_check", "environment variable takes precedence");
            Environment.SetEnvironmentVariable("ConnectionStrings__PostgresSql", null);
            File.WriteAllText(Path.Combine(directory, "appsettings.json"), "{}");
            try
            {
                using var missing = factory.CreateDbContext(["--content-root", directory, "--environment", "Absent"]);
                throw new Exception("Missing connection should fail.");
            }
            catch (InvalidOperationException ex) when (ex.Message.StartsWith("Missing ConnectionStrings:PostgresSql"))
            { Console.WriteLine("PASS missing connection fails without guessing another database"); }
        }
        finally
        {
            Environment.SetEnvironmentVariable("ConnectionStrings__PostgresSql", original);
            foreach (var name in new[] { "appsettings.json", "appsettings.Test.json" })
                File.Delete(Path.Combine(directory, name));
            Directory.Delete(directory);
        }
    }
    private static void Assert(bool condition, string message)
    {
        if (!condition) throw new Exception(message);
        Console.WriteLine("PASS " + message);
    }
}
