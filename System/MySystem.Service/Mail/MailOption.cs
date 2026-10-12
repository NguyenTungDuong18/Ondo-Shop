using System.ComponentModel.DataAnnotations;

namespace MySystem.Service.Mail;

public class MailOption
{
    [Required]
    public string Mail { get; set; } = null!;

    [Required]
    public string DisplayName { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;

    [Required]
    public string Host { get; set; } = null!;

    public int Port { get; set; } = 587;
}
