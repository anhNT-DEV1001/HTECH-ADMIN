import { Controller, Get } from '@nestjs/common';
import { HtechStatService } from './htech/htech.stat.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly htechStatService: HtechStatService) {}
  @Get('htech')
  async getHtechStatController() {
    const res = await this.htechStatService.getHtechStat();
    return {
      status: 'success',
      message: 'Success getting htech statistics',
      data: res,
    }
  }
}
