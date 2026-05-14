import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import {
  ContactDto,
  VnsecContactDto,
  VnsecRegisterDto,
  VnsecRegisterType,
} from './dto';

type RegisterMailMeta = {
  typeLabel: string;
  subject: string;
  intro: string;
  highlight: string;
  benefits: string[];
  nextSteps: string[];
};

@Injectable()
export class MailsService {
  constructor(private readonly mailerService: MailerService) {}

  private getVnsecRegisterMeta(registerType: VnsecRegisterType): RegisterMailMeta {
    const metaMap: Record<VnsecRegisterType, RegisterMailMeta> = {
      visitor: {
        typeLabel: 'Khách tham quan',
        subject: 'VNSEC - Xác nhận đăng ký Khách tham quan',
        intro:
          'Cảm ơn bạn đã đăng ký tham gia VNSEC với vai trò khách tham quan. Chúng tôi đã ghi nhận thông tin và sẽ gửi cập nhật sự kiện sớm nhất.',
        highlight:
          'Sự đăng ký này phù hợp để tham quan khu trưng bày, tham dự các phiên hội thảo công khai và mở rộng kết nối trong hệ sinh thái an ninh mạng.',
        benefits: [
          'Tham quan khu trưng bày và demo giải pháp',
          'Tham dự các phiên hội thảo mở',
          'Nhận thông tin sự kiện và tài liệu tổng hợp',
          'Cơ hội networking và B2B Matching cơ bản',
        ],
        nextSteps: [
          'Theo dõi email để nhận thông tin xác nhận và lịch sự kiện',
          'Chuẩn bị danh thiếp hoặc thông tin doanh nghiệp nếu cần kết nối đối tác',
        ],
      },
      exhibitor: {
        typeLabel: 'Nhà triển lãm',
        subject: 'VNSEC - Xác nhận đăng ký Nhà triển lãm',
        intro:
          'Cảm ơn quý doanh nghiệp đã đăng ký tham gia VNSEC với vai trò nhà triển lãm. Đội ngũ phụ trách sẽ liên hệ để tư vấn gian hàng và kế hoạch trưng bày.',
        highlight:
          'Đây là nhóm đăng ký dành cho doanh nghiệp muốn giới thiệu sản phẩm, quảng bá thương hiệu và kết nối trực tiếp với khách hàng, đối tác.',
        benefits: [
          'Cơ hội trưng bày sản phẩm, giải pháp tại sự kiện',
          'Tăng nhận diện thương hiệu trong cộng đồng chuyên môn',
          'Ưu tiên kết nối B2B Matching và khách mời mục tiêu',
          'Có thể mở rộng cơ hội speaking và hợp tác',
        ],
        nextSteps: [
          'Đội ngũ VNSEC sẽ liên hệ để trao đổi nhu cầu gian hàng và gói đồng hành',
          'Chuẩn bị tài liệu giới thiệu doanh nghiệp, sản phẩm và mục tiêu tham gia',
        ],
      },
      speaker: {
        typeLabel: 'Diễn giả',
        subject: 'VNSEC - Xác nhận đăng ký Diễn giả',
        intro:
          'Cảm ơn bạn đã đăng ký tham gia VNSEC với vai trò diễn giả. Ban tổ chức đã tiếp nhận thông tin và sẽ đánh giá để phản hồi trong thời gian sớm nhất.',
        highlight:
          'Hình thức này phù hợp với các chuyên gia, nhà lãnh đạo và người có kinh nghiệm thực chiến muốn chia sẻ góc nhìn, xu hướng và case study.',
        benefits: [
          'Cơ hội xuất hiện tại các phiên hội thảo chuyên đề',
          'Gia tăng độ tin cậy và nhận diện cá nhân',
          'Mở rộng kết nối với doanh nghiệp, đối tác và truyền thông',
          'Tham gia networking và các hoạt động dành riêng cho diễn giả',
        ],
        nextSteps: [
          'Ban tổ chức sẽ liên hệ để trao đổi chủ đề, format và khung thời gian',
          'Nên chuẩn bị tóm tắt nội dung, profile và các tài liệu hỗ trợ nếu có',
        ],
      },
    };

    return metaMap[registerType];
  }

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

  async sendVnsecContactEmail(contactData: VnsecContactDto) {
    try {
      await this.mailerService.sendMail({
        to: contactData.email,
        subject: 'VNSEC - Xác nhận đã nhận thông tin liên hệ',
        template: './vnsec-contact.template.hbs',
        context: {
          fullName: contactData.fullName,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          department: contactData.department,
          message: contactData.message,
        },
      });

      return { success: true, message: 'Đã gửi email xác nhận liên hệ VNSEC!' };
    } catch (error) {
      console.error('Lỗi khi gửi email liên hệ VNSEC:', error);
      throw error;
    }
  }

  async sendVnsecRegisterEmail(registerData: VnsecRegisterDto) {
    const meta = this.getVnsecRegisterMeta(registerData.registerType);
    const fullName = `${registerData.firstName} ${registerData.lastName}`.trim();

    try {
      await this.mailerService.sendMail({
        to: registerData.email,
        subject: meta.subject,
        template: './vnsec-register.template.hbs',
        context: {
          fullName,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email,
          phone: registerData.phone,
          company: registerData.company,
          position: registerData.position,
          interest: registerData.interest,
          registerType: registerData.registerType,
          registerTypeLabel: meta.typeLabel,
          intro: meta.intro,
          highlight: meta.highlight,
          benefits: meta.benefits,
          nextSteps: meta.nextSteps,
        },
      });

      return {
        success: true,
        message: `Da gui email xac nhan dang ky ${meta.typeLabel}!`,
        registerTypeLabel: meta.typeLabel,
      };
    } catch (error) {
      console.error('Loi khi gui email dang ky VNSEC:', error);
      throw error;
    }
  }
}
