namespace MySystem.Service.Mail;

public static class MailTemplate
{
    public static string EmailContainToken(string token)
    {
        return $@"
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>
    <div style='background-color: #4F46E5; color: white; padding: 20px; text-align: center;'>
        <h2>Xác thực tài khoản của bạn</h2>
    </div>
    <div style='padding: 20px; line-height: 1.6; color: #333;'>
        <p>Xin chào,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại hệ thống của chúng tôi. Vui lòng nhấn vào nút bên dưới để hoàn tất việc xác thực tài khoản:</p>
        <div style='text-align: center; margin: 30px 0;'>
            <a href='http://localhost:5000/api/v1/auth/verify-email?token={token}' style='background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;'>Xác thực ngay</a>
        </div>
        <p>Liên kết xác thực này sẽ hết hạn sau 2 giờ.</p>
        <p>Nếu nút trên không hoạt động, bạn có thể sao chép liên kết dưới đây vào trình duyệt:</p>
        <p style='word-break: break-all; color: #4F46E5;'>http://localhost:5000/api/v1/auth/verify-email?token={token}</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
        <p style='font-size: 12px; color: #999; text-align: center;'>Email này được gửi tự động từ hệ thống.</p>
    </div>
</div>";
    }
}
