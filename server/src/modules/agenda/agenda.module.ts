import { Module } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { AgendaController } from './agenda.controller';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AgendaService],
  controllers: [AgendaController]
})
export class AgendaModule {}
