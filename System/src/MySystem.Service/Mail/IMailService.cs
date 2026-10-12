using System.Threading.Tasks;

namespace MySystem.Service.Mail;

public interface IMailService
{
    Task SendMail(MailContent mailContent);
}
