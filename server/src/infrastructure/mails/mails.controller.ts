import { Body, Controller, Post } from '@nestjs/common';
import { MailsService } from './mails.service';
import { Public } from 'src/common/decorators';
import { ContactDto } from './dto';
import { BaseResponse } from 'src/common/apis';

@Controller('mails')
export class MailsController {
  constructor(private readonly mailsService: MailsService) {}
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
}
