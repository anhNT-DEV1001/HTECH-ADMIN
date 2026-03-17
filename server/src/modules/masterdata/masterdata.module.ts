import { Module } from '@nestjs/common';
import { MasterdataService } from './masterdata.service';
import { MasterdataController } from './masterdata.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule
  ],
  providers: [MasterdataService],
  controllers: [MasterdataController]
})
export class MasterdataModule {}
