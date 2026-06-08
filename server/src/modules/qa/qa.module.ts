import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { QaService } from './qa.service';
import { QaController } from './qa.controller';

@Module({
  imports: [PrismaModule],
  providers: [QaService],
  controllers: [QaController],
})
export class QaModule {}
