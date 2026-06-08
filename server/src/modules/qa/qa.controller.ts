import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type { QA, QACategory } from '@prisma/client';
import { BaseResponse } from 'src/common/apis';
import { RoleConstant } from 'src/common/constants';
import { Public, RequirePermissions } from 'src/common/decorators';
import {
  CreateQACategoryDto,
  CreateQADto,
  UpdateQACategoryDto,
  UpdateQADto,
} from './dto';
import { QaService } from './qa.service';

@Controller('qa')
export class QaController {
  constructor(private readonly qaService: QaService) {}

  @Public()
  @Get('public')
  async getPublicQAByWebIdController(
    @Query('web_id') webId?: string,
  ): Promise<BaseResponse<QACategory[]>> {
    const res = await this.qaService.getPublicQACategoriesByWebIdService(Number(webId));
    return {
      status: 'success',
      message: 'Lấy danh sách QA public theo website thành công',
      data: res,
    };
  }

  @Get('category')
  @RequirePermissions(RoleConstant.VIEW)
  async getAllQACategoriesController(): Promise<BaseResponse<QACategory[]>> {
    const res = await this.qaService.getAllQACategoriesService();
    return {
      status: 'success',
      message: 'Lấy danh sách QA category thành công',
      data: res,
    };
  }

  @Get('category/web/:webId')
  @RequirePermissions(RoleConstant.VIEW)
  async getQACategoriesByWebIdController(
    @Param('webId') webId: string,
  ): Promise<BaseResponse<QACategory[]>> {
    const res = await this.qaService.getQACategoriesByWebIdService(+webId);
    return {
      status: 'success',
      message: 'Lấy danh sách QA category theo website thành công',
      data: res,
    };
  }

  @Post('category')
  @RequirePermissions(RoleConstant.CREATE)
  async createQACategoryController(
    @Body() dto: CreateQACategoryDto,
  ): Promise<BaseResponse<QACategory>> {
    const res = await this.qaService.createQACategoryService(dto);
    return {
      status: 'success',
      message: 'Tạo QA category thành công',
      data: res,
    };
  }

  @Patch('category/:id')
  @RequirePermissions(RoleConstant.UPDATE)
  async updateQACategoryController(
    @Param('id') id: string,
    @Body() dto: UpdateQACategoryDto,
  ): Promise<BaseResponse<QACategory>> {
    const res = await this.qaService.updateQACategoryService(+id, dto);
    return {
      status: 'success',
      message: 'Cập nhật QA category thành công',
      data: res,
    };
  }

  @Delete('category/:id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteQACategoryController(
    @Param('id') id: string,
  ): Promise<BaseResponse<QACategory>> {
    const res = await this.qaService.deleteQACategoryService(+id);
    return {
      status: 'success',
      message: 'Xóa QA category thành công',
      data: res,
    };
  }

  @Get()
  @RequirePermissions(RoleConstant.VIEW)
  async getAllQAController(
    @Query('web_id') webId?: string,
    @Query('category_id') categoryId?: string,
  ): Promise<BaseResponse<QA[]>> {
    const res = await this.qaService.getAllQAService({
      web_id: webId ? Number(webId) : undefined,
      category_id: categoryId ? Number(categoryId) : undefined,
    });
    return {
      status: 'success',
      message: 'Lấy danh sách QA thành công',
      data: res,
    };
  }

  @Get('category/:categoryId')
  @RequirePermissions(RoleConstant.VIEW)
  async getQAByCategoryIdController(
    @Param('categoryId') categoryId: string,
  ): Promise<BaseResponse<QA[]>> {
    const res = await this.qaService.getQAByCategoryIdService(+categoryId);
    return {
      status: 'success',
      message: 'Lấy danh sách QA theo category thành công',
      data: res,
    };
  }

  @Post()
  @RequirePermissions(RoleConstant.CREATE)
  async createQAController(@Body() dto: CreateQADto): Promise<BaseResponse<QA>> {
    const res = await this.qaService.createQAService(dto);
    return {
      status: 'success',
      message: 'Tạo QA thành công',
      data: res,
    };
  }

  @Patch(':id')
  @RequirePermissions(RoleConstant.UPDATE)
  async updateQAController(
    @Param('id') id: string,
    @Body() dto: UpdateQADto,
  ): Promise<BaseResponse<QA>> {
    const res = await this.qaService.updateQAService(+id, dto);
    return {
      status: 'success',
      message: 'Cập nhật QA thành công',
      data: res,
    };
  }

  @Delete(':id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteQAController(@Param('id') id: string): Promise<BaseResponse<QA>> {
    const res = await this.qaService.deleteQAService(+id);
    return {
      status: 'success',
      message: 'Xóa QA thành công',
      data: res,
    };
  }
}
