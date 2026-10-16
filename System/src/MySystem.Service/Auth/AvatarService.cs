using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MySystem.Repository;
using MySystem.Repository.Entities;
using MySystem.Service.Exceptions;
using MySystem.Service.Media;

namespace MySystem.Service.Auth;

public class AvatarService(AppDbContext db, Media.IService media, IOptions<CloudinaryOptions> options)
{
    public async Task<Response.UserResponse> ReplaceAsync(Guid userId, IFormFile file,
        CancellationToken cancellationToken = default)
    {
        // Reject invalid files before touching the existing avatar.
        await Media.Service.ValidateImageAsync(file, cancellationToken);
        await using var transaction = db.Database.IsRelational()
            ? await db.Database.BeginTransactionAsync(cancellationToken) : null;
        // Serialize replacements for this user across API instances.
        var users = db.Database.IsRelational()
            ? db.Users.FromSqlInterpolated($"SELECT * FROM \"Users\" WHERE \"Id\" = {userId} FOR UPDATE")
            : db.Users.AsQueryable();
        var user = await users.FirstOrDefaultAsync(x => x.Id == userId && !x.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy người dùng.");

        var oldPublicId = user.AvatarPublicId ?? LegacyPublicId(user.AvatarUrl);
        if (!string.IsNullOrWhiteSpace(oldPublicId))
        {
            try { await media.DeleteImageAsync(oldPublicId); }
            catch (NotFoundException ex) when (ex.MessageCode == "CLOUDINARY_IMAGE_NOT_FOUND")
            { /* An already removed avatar must not prevent a replacement. */ }
            user.AvatarUrl = null;
            user.AvatarPublicId = null;
        }

        user.UpdatedAt = DateTime.UtcNow;
        Media.Response.UploadImageResult image;
        try
        {
            image = await media.UploadImageAsync(file, cancellationToken);
        }
        catch
        {
            // Delete-before-upload is intentional. If upload fails, don't keep a dead URL.
            await db.SaveChangesAsync(CancellationToken.None);
            if (transaction != null) await transaction.CommitAsync(CancellationToken.None);
            throw;
        }

        user.AvatarUrl = image.Url;
        user.AvatarPublicId = image.PublicId;
        await db.SaveChangesAsync(CancellationToken.None);
        if (transaction != null) await transaction.CommitAsync(CancellationToken.None);
        return Service.MapUserToResponse(user);
    }

    private string? LegacyPublicId(string? url)
    {
        // Only derive IDs from raw upload URLs belonging to the configured cloud.
        // External avatars are replaced without attempting to delete external resources.
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)
            || uri.Scheme != "https" || uri.Host != "res.cloudinary.com") return null;
        var prefix = $"/{options.Value.CloudName}/image/upload/";
        if (!uri.AbsolutePath.StartsWith(prefix, StringComparison.Ordinal)) return null;
        var path = Uri.UnescapeDataString(uri.AbsolutePath[prefix.Length..]);
        var slash = path.IndexOf('/');
        if (slash > 1 && path[0] == 'v' && path[1..slash].All(char.IsDigit)) path = path[(slash + 1)..];
        var extension = path.LastIndexOf('.');
        if (extension > path.LastIndexOf('/')) path = path[..extension];
        return path;
    }
}
