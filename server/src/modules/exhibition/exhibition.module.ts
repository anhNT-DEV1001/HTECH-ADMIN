import { Module } from '@nestjs/common';
import { ExhibitionController } from './exhibition.controller';
import { ExhibitionService } from './exhibition.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExhibitionController],
  providers: [ExhibitionService]
})
export class ExhibitionModule {}
