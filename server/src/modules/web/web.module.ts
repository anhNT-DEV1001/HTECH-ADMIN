import { Module } from '@nestjs/common';
import { WebService } from './web.service';
import { WebController } from './web.controller';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WebService],
  controllers: [WebController]
})
export class WebModule {}
