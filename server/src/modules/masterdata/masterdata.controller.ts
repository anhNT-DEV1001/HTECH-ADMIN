import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { MasterdataService } from './masterdata.service';
import { BaseResponse } from 'src/common/apis';
import { MasterData } from '@prisma/client';
import { CreateMasterDataDto, MasterDataFilterDto, UpdateMasterDataDto } from './dto';
import { IPaginationResponse } from 'src/common/interfaces';
import { RequirePermissions } from 'src/common/decorators';
import { RoleConstant } from 'src/common/constants';

@Controller('masterdata')
export class MasterdataController {
  constructor(private readonly masterdataService: MasterdataService) {}

  @Post()
  @RequirePermissions(RoleConstant.CREATE)
  async create(@Body() createMasterDataDto: CreateMasterDataDto): Promise<BaseResponse<MasterData>> {
    const response = await this.masterdataService.create(createMasterDataDto);
    return {
      status: 'success',
      message: 'Tạo masterdata thành công!',
      data: response,
    };
  }

  @Get()
  @RequirePermissions(RoleConstant.VIEW)
  async findAll(@Query() filter: MasterDataFilterDto): Promise<BaseResponse<IPaginationResponse<MasterData>>> {
    const response = await this.masterdataService.findAll(filter);
    return {
      status: 'success',
      message: 'Lấy danh sách masterdata thành công!',
      data: response,
    };
  }

  @Get('key/:dataKey')
  @RequirePermissions(RoleConstant.VIEW)
  async getDataValueByKey(@Param('dataKey') dataKey: string): Promise<BaseResponse<MasterData[]>> {
    const response = await this.masterdataService.getDataValueByKey(dataKey);
    return {
      status: 'success',
      message: 'Lấy giá trị masterdata thành công!',
      data: response,
    };
  }

  @Get(':id')
  @RequirePermissions(RoleConstant.VIEW)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BaseResponse<MasterData>> {
    const response = await this.masterdataService.findOne(id);
    return {
      status: 'success',
      message: 'Lấy chi tiết masterdata thành công!',
      data: response,
    };
  }

  @Patch(':id')
  @RequirePermissions(RoleConstant.UPDATE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMasterDataDto: UpdateMasterDataDto,
  ): Promise<BaseResponse<MasterData>> {
    const response = await this.masterdataService.update(id, updateMasterDataDto);
    return {
      status: 'success',
      message: 'Cập nhật masterdata thành công!',
      data: response,
    };
  }

  @Delete(':id')
  @RequirePermissions(RoleConstant.DELETE)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<BaseResponse<MasterData>> {
    const response = await this.masterdataService.remove(id);
    return {
      status: 'success',
      message: 'Xóa masterdata thành công!',
      data: response,
    };
  }
}
