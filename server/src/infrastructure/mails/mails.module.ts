import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';
import { MailsController } from './mails.controller';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { existsSync } from 'fs';
import { join } from 'path';
import { key } from 'src/configs';

const distTemplatesDir = join(process.cwd(), 'dist/src/infrastructure/mails/templates');
const srcTemplatesDir = join(process.cwd(), 'src/infrastructure/mails/templates');
const mailTemplatesDir = existsSync(distTemplatesDir)
  ? distTemplatesDir
  : srcTemplatesDir;

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
        dir: mailTemplatesDir,
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
