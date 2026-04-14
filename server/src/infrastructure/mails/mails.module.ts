import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';
import { MailsController } from './mails.controller';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { key } from 'src/configs';
@Module({
  imports: [
    MailerModule.forRoot({
      transport : {
        host: key.mail.host, 
        port: key.mail.port,
        secure: key.mail.secure, 
        auth: {
          user: key.mail.user, 
          pass: key.mail.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: `"HTECH EVENT" <${key.mail.user}>`, 
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    })
  ],
  providers: [MailsService],
  controllers: [MailsController]
})
export class MailsModule {}
