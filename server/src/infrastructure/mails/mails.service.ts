import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ContactDto } from './dto';

@Injectable()
export class MailsService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(userEmail: string) {
    try {
      await this.mailerService.sendMail({
        to: userEmail, // Email người nhận
        subject: 'Chào mừng bạn tham gia hệ thống!', // Tiêu đề email
        text: 'Cảm ơn bạn đã đăng ký tài khoản.', // Nội dung dạng văn bản thuần túy
        html: '<b>Cảm ơn bạn đã đăng ký tài khoản.</b> <br/> Chúc bạn một ngày vui vẻ!', // Nội dung định dạng HTML
      });
      return { success: true, message: 'Gửi email thành công!' };
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      throw error;
    }
  }

  async sendContactEmail(contactData : ContactDto) {
    try {
      await this.mailerService.sendMail({
        to: contactData.email,
        subject: 'HTECH Event - Xác nhận thông tin liên hệ',
        template: './contact.template.hbs', // Trỏ tới file contact.template.hbs
        context: {
          // Truyền dữ liệu vào template
          fullName: contactData.fullName,
          phone: contactData.phone,
          company: contactData.company,
          message: contactData.message,
        },
      });
      return { success: true, message: 'Đã gửi email cảm ơn liên hệ!' };
    } catch (error) {
      console.error('Lỗi khi gửi email liên hệ:', error);
      throw error;
    }
  }
}
