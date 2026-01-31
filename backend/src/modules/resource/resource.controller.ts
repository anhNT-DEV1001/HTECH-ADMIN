import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResourceService } from './resource.service';
import {
  CreateResourceDto,
  ResourceDetailDto,
  UpdateResourceWithDetailDto,
} from './dto';
import { BaseResponse } from 'src/common/apis';
import type { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';
import type{ Resource, User} from '@prisma/client';
import { AuthUser } from 'src/common/decorators'; 

@ApiTags('Resource')
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới một Resource' })
  async create(
    @Body() dto: CreateResourceDto,
    @AuthUser('user') user: User,
  ): Promise<BaseResponse<Resource>> {
    const data = await this.resourceService.createResource(dto, user);
    return {
      status: 'success',
      message: 'Tạo tài nguyên thành công',
      data,
    };
  }

  @Post(':id/details')
  @ApiOperation({ summary: 'Tạo một Resource Detail cho Resource' })
  async createDetail(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResourceDetailDto,
    @AuthUser('user') user: User,
  ): Promise<BaseResponse<any>> {
    const data = await this.resourceService.createResourceDetail(id, dto, user);
    return {
      status: 'success',
      message: 'Tạo chi tiết tài nguyên thành công',
      data,
    };
  }

  @Post(':id/details/many')
  @ApiOperation({ summary: 'Tạo nhiều Resource Detail cùng lúc' })
  async createManyDetails(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResourceDetailDto[],
    @AuthUser('user') user: User,
  ): Promise<BaseResponse<any>> {
    const data = await this.resourceService.createManyResourceDetail(
      id,
      dto,
      user,
    );
    return {
      status: 'success',
      message: `Đã xử lý ${data.count} bản ghi chi tiết`,
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách Resource kèm phân trang và Detail' })
  async findAll(
    @Query() query: IPaginationRequest // => object,
  ): Promise<BaseResponse<IPaginationResponse<Resource>>> {
    const data =
      await this.resourceService.getAllResourcesWithResourceDetail(query);
    return {
      status: 'success',
      message: 'Lấy danh sách tài nguyên thành công',
      data,
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật Resource và làm mới danh sách Detail' })
  async update(
    @Body() dto: UpdateResourceWithDetailDto,
    @AuthUser('user') user: User,
  ): Promise<BaseResponse<Resource>> {
    const data = await this.resourceService.updateResourceWithDetail(dto, user);
    return {
      status: 'success',
      message: 'Cập nhật tài nguyên thành công',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa Resource và các Detail liên quan' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BaseResponse<Resource>> {
    const data = await this.resourceService.deleteResource(id);
    return {
      status: 'success',
      message: 'Xóa tài nguyên thành công',
      data,
    };
  }
}
