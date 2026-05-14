import { Body, Controller, Post } from '@nestjs/common';
import { MailsService } from './mails.service';
import { Public } from 'src/common/decorators';
import { ContactDto, VnsecContactDto, VnsecRegisterDto } from './dto';
import { BaseResponse } from 'src/common/apis';

@Controller('mails')
export class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  private getRegisterTypeLabel(registerType: VnsecRegisterDto['registerType']) {
    const labels = {
      visitor: 'Khach tham quan',
      exhibitor: 'Nha trien lam',
      speaker: 'Dien gia',
    };

    return labels[registerType];
  }

  @Public()
  @Post('submit')
  async submitContactForm(@Body() body: ContactDto) : Promise<BaseResponse<any>>{
    // 1. (Tùy chọn) Lưu thông tin 'body' vào Database thông qua Prisma ở đây
    // await this.prisma.contact.create({ data: body });

    // 2. Gửi email cảm ơn
    await this.mailsService.sendContactEmail(body);

    return {
      status:'success',
      message:'Thông tin liên hệ đã được gửi thành công. Cảm ơn bạn đã liên hệ với chúng tôi!',
      data:null
    }
  }

  @Public()
  @Post('vnsec/contact')
  async submitVnsecContactController(
    @Body() body: VnsecContactDto,
  ): Promise<BaseResponse<any>> {
    await this.mailsService.sendVnsecContactEmail(body);

    return {
      status: 'success',
      message:
        'Thông tin liên hệ VNSEC đã được gửi thành công. Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất!',
      data: null,
    };
  }

  @Public()
  @Post('vnsec/register')
  async submitVnsecRegisterController(
    @Body() body: VnsecRegisterDto,
  ): Promise<BaseResponse<any>> {
    await this.mailsService.sendVnsecRegisterEmail(body);

    return {
      status: 'success',
      message: `Dang ky ${this.getRegisterTypeLabel(body.registerType)} da duoc gui thanh cong. Chung toi se lien he voi ban trong thoi gian som nhat!`,
      data: null,
    };
  }
}
