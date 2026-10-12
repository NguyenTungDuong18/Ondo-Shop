using System.Security.Claims;

namespace MySystem.Service.JwtService;

public interface IJwtService
{
    string GenerateAccessToken(IEnumerable<Claim> claims);
    ClaimsPrincipal? ValidateToken(string token);
    string GenerateEmailVerificationToken(IEnumerable<Claim> claims, int expirationHours);
    string GenerateRefreshToken();
}
