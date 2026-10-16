using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using MySystem.Repository;
using MySystem.Repository.Entities;

public static class ProfileChecks
{
    public static async Task RunAsync(IServiceProvider services, HttpClient client, UploadProxy cloud, byte[] png)
    {
        var id = Guid.NewGuid();
        var otherId = Guid.NewGuid();
        using (var scope = services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Users.AddRange(new User { Id = id, Username = "profile", Email = "profile@example.test", FullName = "Before",
                AvatarUrl = "https://example.com/old.png", AvatarPublicId = "checks/old" },
                new User { Id = otherId, Username = "other", Email = "other@example.test", FullName = "Other",
                    AvatarUrl = "https://example.com/other.png", AvatarPublicId = "checks/other" });
            await db.SaveChangesAsync();
        }
        client.DefaultRequestHeaders.Remove("X-Test-Role"); // A normal customer may replace their own avatar.
        client.DefaultRequestHeaders.Remove("X-Test-User");
        await Avatar(HttpStatusCode.Unauthorized);
        client.DefaultRequestHeaders.Add("X-Test-User", id.ToString());
        cloud.DeleteResult = new DeletionResult { Result = "ok" };
        cloud.Result = new ImageUploadResult { SecureUrl = new Uri("https://example.com/new.png"), PublicId = "checks/new" };
        var calls = cloud.Events.Count;
        using (var result = await client.PutAsJsonAsync("/api/v1/auth/me", new {
            fullName = "Updated name", email = "profile@example.test", phoneNumber = "+84901234567", dateOfBirth = "2000-02-29",
            avatarUrl = "https://evil.example/replace.png" }))
        {
            Check(result.StatusCode == HttpStatusCode.OK, "Profile details update succeeds");
            using var json = JsonDocument.Parse(await result.Content.ReadAsStringAsync());
            var data = json.RootElement.GetProperty("data");
            Check(data.GetProperty("dateOfBirth").GetString() == "2000-02-29"
                && data.GetProperty("avatarUrl").GetString() == "https://example.com/old.png"
                && !data.TryGetProperty("avatarPublicId", out _), "Birthday round-trips; JSON cannot replace an avatar or expose its public ID");
        }
        Check(cloud.Events.Count == calls, "Editing only personal details never calls Cloudinary");
        foreach (var details in new[] {
            new { fullName = "", email = "profile@example.test", phoneNumber = "0901234567", dateOfBirth = "2000-01-01" },
            new { fullName = "Name", email = "invalid", phoneNumber = "0901234567", dateOfBirth = "2000-01-01" },
            new { fullName = "Name", email = "profile@example.test", phoneNumber = "invalid", dateOfBirth = "2000-01-01" },
            new { fullName = "Name", email = "profile@example.test", phoneNumber = "0901234567", dateOfBirth = "2999-01-01" },
            new { fullName = "Name", email = "profile@example.test", phoneNumber = "0901234567", dateOfBirth = "2001-02-29" } })
        {
            using var result = await client.PutAsJsonAsync("/api/v1/auth/me", details);
            Check(result.StatusCode == HttpStatusCode.BadRequest, "Invalid profile details rejected");
        }
        await Avatar(HttpStatusCode.BadRequest, "not an image"u8.ToArray());
        Check(cloud.Events.Count == calls, "Invalid avatar never deletes the old image");
        cloud.DeleteResult = new DeletionResult { Error = new Error { Message = "Unavailable" } };
        await Avatar(HttpStatusCode.InternalServerError);
        Check((await Current()).AvatarPublicId == "checks/old", "Failed deletion preserves the current avatar");
        cloud.DeleteResult = new DeletionResult { Result = "ok" };
        cloud.Events.Clear();
        await Avatar(HttpStatusCode.OK);
        Check(cloud.Events.SequenceEqual(new[] { "delete", "upload" }) && cloud.DeletionParameters!.PublicId == "checks/old",
            "Replacement deletes the authenticated user's stored old image before uploading");
        Check((await Current()).AvatarPublicId == "checks/new", "New avatar URL and public ID are persisted");
        cloud.Result = new ImageUploadResult { Error = new Error { Message = "Unavailable" } };
        await Avatar(HttpStatusCode.InternalServerError);
        Check((await Current()).AvatarUrl == null && (await Current()).AvatarPublicId == null,
            "Upload failure after deletion clears the dead avatar URL");
        cloud.Result = new ImageUploadResult { SecureUrl = new Uri("https://example.com/retry.png"), PublicId = "checks/retry" };
        cloud.Events.Clear();
        await Avatar(HttpStatusCode.OK);
        Check(cloud.Events.SequenceEqual(new[] { "upload" }), "First avatar/retry uploads without deleting another user's image");
        cloud.DeleteResult = new DeletionResult { Result = "not found" };
        await Avatar(HttpStatusCode.OK);
        Check((await Current()).AvatarUrl == "https://example.com/retry.png", "An already missing old image does not block replacement");
        using (var scope = services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = await db.Users.SingleAsync(x => x.Id == id);
            user.AvatarPublicId = null;
            user.AvatarUrl = "https://res.cloudinary.com/profile-check-cloud/image/upload/v123/checks/legacy.png";
            await db.SaveChangesAsync();
        }
        cloud.DeleteResult = new DeletionResult { Result = "ok" };
        await Avatar(HttpStatusCode.OK);
        Check(cloud.DeletionParameters!.PublicId == "checks/legacy", "Legacy Cloudinary avatars without stored public IDs can be replaced");
        using (var scope = services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var other = await db.Users.SingleAsync(x => x.Id == otherId);
            Check(other.AvatarPublicId == "checks/other", "Other users' avatars remain untouched");
        }
        client.DefaultRequestHeaders.Remove("X-Test-User");
        client.DefaultRequestHeaders.Add("X-Test-User", Guid.NewGuid().ToString());
        calls = cloud.Events.Count;
        await Avatar(HttpStatusCode.NotFound);
        Check(cloud.Events.Count == calls, "Unknown user cannot upload or delete images");

        async Task Avatar(HttpStatusCode expected, byte[]? bytes = null)
        {
            using var form = new MultipartFormDataContent();
            using var image = new ByteArrayContent(bytes ?? png);
            image.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            form.Add(image, "file", "avatar.png");
            form.Add(new StringContent(otherId.ToString()), "userId");
            form.Add(new StringContent("checks/other"), "publicId");
            using var result = await client.PutAsync("/api/v1/auth/me/avatar", form);
            Check(result.StatusCode == expected, $"Avatar endpoint: expected {expected}, got {result.StatusCode}");
        }
        async Task<User> Current()
        {
            using var scope = services.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users.AsNoTracking().SingleAsync(x => x.Id == id);
        }
    }

    private static void Check(bool value, string message)
    {
        if (!value) throw new InvalidOperationException(message);
        Console.WriteLine($"PASS: {message}");
    }
}
