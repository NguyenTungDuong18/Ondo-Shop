using System.ComponentModel.DataAnnotations;

namespace MySystem.Service.JwtService;

public class JwtOption
{
    [Required]
    public string Issuer { get; set; } = null!;

    [Required]
    public string Audience { get; set; } = null!;

    [Required]
    public string AccessTokenKey { get; set; } = null!;

    public int AccessTokenExpirationMinutes { get; set; } = 120;

    public int RefreshTokenExpirationDays { get; set; } = 7;
}
