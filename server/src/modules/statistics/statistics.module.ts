import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { HtechStatService } from './htech/htech.stat.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StatisticsController],
  providers: [HtechStatService]
})
export class StatisticsModule {

}
