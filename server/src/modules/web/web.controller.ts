import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import type { Web } from '@prisma/client';
import { BaseResponse } from 'src/common/apis';
import { RoleConstant } from 'src/common/constants';
import { RequirePermissions } from 'src/common/decorators';
import { CreateWebDto, UpdateWebDto } from './dto';
import { WebService } from './web.service';

@Controller('web')
export class WebController {
  constructor(private readonly webService: WebService) {}

  @Get()
  // @RequirePermissions(RoleConstant.VIEW)
  async getAllWebController(): Promise<BaseResponse<Web[]>> {
    const res = await this.webService.getAllWebService();
    return {
      status: 'success',
      message: 'Lấy danh sách website thành công',
      data: res,
    };
  }

  @Post()
  @RequirePermissions(RoleConstant.CREATE)
  async createWebController(
    @Body() dto: CreateWebDto,
  ): Promise<BaseResponse<Web>> {
    const res = await this.webService.createWebService(dto);
    return {
      status: 'success',
      message: 'Tạo website thành công',
      data: res,
    };
  }

  @Patch(':id')
  // @RequirePermissions(RoleConstant.UPDATE)
  async updateWebController(
    @Param('id') id: string,
    @Body() dto: UpdateWebDto,
  ): Promise<BaseResponse<Web>> {
    const res = await this.webService.updateWebService(+id, dto);
    return {
      status: 'success',
      message: 'Cập nhật website thành công',
      data: res,
    };
  }

  @Delete(':id')
  // @RequirePermissions(RoleConstant.DELETE)
  async deleteWebController(
    @Param('id') id: string,
  ): Promise<BaseResponse<Web>> {
    const res = await this.webService.deleteWebService(+id);
    return {
      status: 'success',
      message: 'Xóa website thành công',
      data: res,
    };
  }
}
