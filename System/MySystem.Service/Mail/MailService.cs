using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace MySystem.Service.Mail;

public class MailService : IMailService
{
    private readonly MailOption _mailOption;
    private readonly ILogger<MailService> _logger;

    public MailService(MailOption mailOption, ILogger<MailService> logger)
    {
        _mailOption = mailOption;
        _logger = logger;
    }

    public async Task SendMail(MailContent mailContent)
    {
        var email = new MimeMessage();
        email.Sender = new MailboxAddress(_mailOption.DisplayName, _mailOption.Mail);
        email.From.Add(new MailboxAddress(_mailOption.DisplayName, _mailOption.Mail));
        email.To.Add(MailboxAddress.Parse(mailContent.To));
        email.Subject = mailContent.Subject;

        var builder = new BodyBuilder
        {
            HtmlBody = mailContent.Body
        };
        email.Body = builder.ToMessageBody();

        using var smtp = new SmtpClient();
        try
        {
            await smtp.ConnectAsync(_mailOption.Host, _mailOption.Port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_mailOption.Mail, _mailOption.Password);
            await smtp.SendAsync(email);
            _logger.LogInformation("Email sent successfully to {To}", mailContent.To);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", mailContent.To);
            throw;
        }
        finally
        {
            await smtp.DisconnectAsync(true);
        }
    }
}
