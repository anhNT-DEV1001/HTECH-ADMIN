import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import type { Booth, Exhibition, Exhibitor, ExhibitorRank, Zone } from '@prisma/client';
import { BaseResponse } from 'src/common/apis';
import { RoleConstant } from 'src/common/constants';
import { Public, RequirePermissions } from 'src/common/decorators';
import {
  CreateBoothDto,
  CreateExhibitionDto,
  CreateExhibitorDto,
  CreateExhibitorRankDto,
  CreateZoneDto,
  UpdateBoothDto,
  UpdateExhibitionDto,
  UpdateExhibitorDto,
  UpdateExhibitorRankDto,
  UpdateZoneDto,
} from './dto';
import { ExhibitionService } from './exhibition.service';

@Controller('exhibition')
export class ExhibitionController {
  constructor(private readonly exhibitionService: ExhibitionService) {}

  @Public()
  @Get('public')
  async getPublicExhibitionDataController() {
    const res = await this.exhibitionService.getPublicExhibitionDataService();
    return {
      status: 'success',
      message: 'Lấy dữ liệu exhibition public thành công',
      data: res,
    };
  }

  @Public()
  @Get('public/zones')
  async getPublicZonesController(): Promise<BaseResponse<Zone[]>> {
    const res = await this.exhibitionService.getAllZonesService();
    return { status: 'success', message: 'Lấy danh sách zone public thành công', data: res };
  }

  @Public()
  @Get('public/ranks')
  async getPublicExhibitorRanksController(): Promise<BaseResponse<ExhibitorRank[]>> {
    const res = await this.exhibitionService.getAllExhibitorRanksService();
    return {
      status: 'success',
      message: 'Lấy danh sách hạng exhibitor public thành công',
      data: res,
    };
  }

  @Public()
  @Get('public/booths')
  async getPublicBoothsController(): Promise<BaseResponse<Booth[]>> {
    const res = await this.exhibitionService.getAllBoothsService();
    return { status: 'success', message: 'Lấy danh sách booth public thành công', data: res };
  }

  @Public()
  @Get('public/exhibitors')
  async getPublicExhibitorsController(): Promise<BaseResponse<Exhibitor[]>> {
    const res = await this.exhibitionService.getAllExhibitorsService();
    return {
      status: 'success',
      message: 'Lấy danh sách exhibitor public thành công',
      data: res,
    };
  }

  @Public()
  @Get('public/exhibitors/:id')
  async getPublicExhibitorByIdController(
    @Param('id') id: string,
  ): Promise<BaseResponse<Exhibitor>> {
    const res = await this.exhibitionService.getExhibitorByIdService(+id);
    return { status: 'success', message: 'Lấy chi tiết exhibitor public thành công', data: res };
  }

  @Public()
  @Get('public/exhibitions/:exhibitionId/exhibitors/:exhibitorId')
  async getPublicExhibitorByExhibitionIdController(
    @Param('exhibitionId') exhibitionId: string,
    @Param('exhibitorId') exhibitorId: string,
  ): Promise<BaseResponse<Exhibitor>> {
    const res = await this.exhibitionService.getPublicExhibitorByExhibitionIdService(
      +exhibitionId,
      +exhibitorId,
    );
    return {
      status: 'success',
      message: 'Lấy chi tiết exhibitor theo exhibition public thành công',
      data: res,
    };
  }

  @Public()
  @Get('public/exhibitions/:id/exhibitors')
  async getPublicExhibitorsByExhibitionIdController(
    @Param('id') id: string,
  ): Promise<BaseResponse<Exhibitor[]>> {
    const res = await this.exhibitionService.getPublicExhibitorsByExhibitionIdService(+id);
    return {
      status: 'success',
      message: 'Lấy danh sách exhibitor theo exhibition public thành công',
      data: res,
    };
  }

  @Public()
  @Get('public/exhibitions')
  async getPublicExhibitionsController(): Promise<BaseResponse<Exhibition[]>> {
    const res = await this.exhibitionService.getAllExhibitionsService();
    return {
      status: 'success',
      message: 'Lấy danh sách exhibition public thành công',
      data: res,
    };
  }

  @Public()
  @Get('public/exhibitions/:id')
  async getPublicExhibitionByIdController(
    @Param('id') id: string,
  ): Promise<BaseResponse<Exhibition>> {
    const res = await this.exhibitionService.getExhibitionByIdService(+id);
    return { status: 'success', message: 'Lấy chi tiết exhibition public thành công', data: res };
  }

  @Get('zones')
  @RequirePermissions(RoleConstant.VIEW)
  async getAllZonesController(): Promise<BaseResponse<Zone[]>> {
    const res = await this.exhibitionService.getAllZonesService();
    return { status: 'success', message: 'Lấy danh sách zone thành công', data: res };
  }

  @Get('zones/web/:webId')
  @RequirePermissions(RoleConstant.VIEW)
  async getZonesByWebIdController(@Param('webId') webId: string): Promise<BaseResponse<Zone[]>> {
    const res = await this.exhibitionService.getZonesByWebIdService(+webId);
    return { status: 'success', message: 'Lấy danh sách zone theo website thành công', data: res };
  }

  @Post('zones')
  @RequirePermissions(RoleConstant.CREATE)
  async createZoneController(@Body() dto: CreateZoneDto): Promise<BaseResponse<Zone>> {
    const res = await this.exhibitionService.createZoneService(dto);
    return { status: 'success', message: 'Tạo zone thành công', data: res };
  }

  @Patch('zones/:id')
  @RequirePermissions(RoleConstant.UPDATE)
  async updateZoneController(
    @Param('id') id: string,
    @Body() dto: UpdateZoneDto,
  ): Promise<BaseResponse<Zone>> {
    const res = await this.exhibitionService.updateZoneService(+id, dto);
    return { status: 'success', message: 'Cập nhật zone thành công', data: res };
  }

  @Delete('zones/:id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteZoneController(@Param('id') id: string): Promise<BaseResponse<Zone>> {
    const res = await this.exhibitionService.deleteZoneService(+id);
    return { status: 'success', message: 'Xóa zone thành công', data: res };
  }

  @Get('ranks')
  @RequirePermissions(RoleConstant.VIEW)
  async getAllExhibitorRanksController(): Promise<BaseResponse<ExhibitorRank[]>> {
    const res = await this.exhibitionService.getAllExhibitorRanksService();
    return { status: 'success', message: 'Lấy danh sách hạng exhibitor thành công', data: res };
  }

  @Get('ranks/web/:webId')
  @RequirePermissions(RoleConstant.VIEW)
  async getExhibitorRanksByWebIdController(
    @Param('webId') webId: string,
  ): Promise<BaseResponse<ExhibitorRank[]>> {
    const res = await this.exhibitionService.getExhibitorRanksByWebIdService(+webId);
    return {
      status: 'success',
      message: 'Lấy danh sách hạng exhibitor theo website thành công',
      data: res,
    };
  }

  @Post('ranks')
  @RequirePermissions(RoleConstant.CREATE)
  async createExhibitorRankController(
    @Body() dto: CreateExhibitorRankDto,
  ): Promise<BaseResponse<ExhibitorRank>> {
    const res = await this.exhibitionService.createExhibitorRankService(dto);
    return { status: 'success', message: 'Tạo hạng exhibitor thành công', data: res };
  }

  @Patch('ranks/:id')
  @RequirePermissions(RoleConstant.UPDATE)
  async updateExhibitorRankController(
    @Param('id') id: string,
    @Body() dto: UpdateExhibitorRankDto,
  ): Promise<BaseResponse<ExhibitorRank>> {
    const res = await this.exhibitionService.updateExhibitorRankService(+id, dto);
    return { status: 'success', message: 'Cập nhật hạng exhibitor thành công', data: res };
  }

  @Delete('ranks/:id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteExhibitorRankController(
    @Param('id') id: string,
  ): Promise<BaseResponse<ExhibitorRank>> {
    const res = await this.exhibitionService.deleteExhibitorRankService(+id);
    return { status: 'success', message: 'Xóa hạng exhibitor thành công', data: res };
  }

  @Get('booths')
  @RequirePermissions(RoleConstant.VIEW)
  async getAllBoothsController(): Promise<BaseResponse<Booth[]>> {
    const res = await this.exhibitionService.getAllBoothsService();
    return { status: 'success', message: 'Lấy danh sách booth thành công', data: res };
  }

  @Get('booths/web/:webId')
  @RequirePermissions(RoleConstant.VIEW)
  async getBoothsByWebIdController(@Param('webId') webId: string): Promise<BaseResponse<Booth[]>> {
    const res = await this.exhibitionService.getBoothsByWebIdService(+webId);
    return { status: 'success', message: 'Lấy danh sách booth theo website thành công', data: res };
  }

  @Post('booths')
  @RequirePermissions(RoleConstant.CREATE)
  async createBoothController(@Body() dto: CreateBoothDto): Promise<BaseResponse<Booth>> {
    const res = await this.exhibitionService.createBoothService(dto);
    return { status: 'success', message: 'Tạo booth thành công', data: res };
  }

  @Patch('booths/:id')
  @RequirePermissions(RoleConstant.UPDATE)
  async updateBoothController(
    @Param('id') id: string,
    @Body() dto: UpdateBoothDto,
  ): Promise<BaseResponse<Booth>> {
    const res = await this.exhibitionService.updateBoothService(+id, dto);
    return { status: 'success', message: 'Cập nhật booth thành công', data: res };
  }

  @Delete('booths/:id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteBoothController(@Param('id') id: string): Promise<BaseResponse<Booth>> {
    const res = await this.exhibitionService.deleteBoothService(+id);
    return { status: 'success', message: 'Xóa booth thành công', data: res };
  }

  @Get('exhibitors')
  @RequirePermissions(RoleConstant.VIEW)
  async getAllExhibitorsController(): Promise<BaseResponse<Exhibitor[]>> {
    const res = await this.exhibitionService.getAllExhibitorsService();
    return { status: 'success', message: 'Lấy danh sách exhibitor thành công', data: res };
  }

  @Get('exhibitors/web/:webId')
  @RequirePermissions(RoleConstant.VIEW)
  async getExhibitorsByWebIdController(
    @Param('webId') webId: string,
  ): Promise<BaseResponse<Exhibitor[]>> {
    const res = await this.exhibitionService.getExhibitorsByWebIdService(+webId);
    return {
      status: 'success',
      message: 'Lấy danh sách exhibitor theo website thành công',
      data: res,
    };
  }

  @Get('exhibitors/:id')
  @RequirePermissions(RoleConstant.VIEW)
  async getExhibitorByIdController(@Param('id') id: string): Promise<BaseResponse<Exhibitor>> {
    const res = await this.exhibitionService.getExhibitorByIdService(+id);
    return { status: 'success', message: 'Lấy chi tiết exhibitor thành công', data: res };
  }

  @Post('exhibitors')
  @RequirePermissions(RoleConstant.CREATE)
  async createExhibitorController(
    @Body() dto: CreateExhibitorDto,
  ): Promise<BaseResponse<Exhibitor>> {
    const res = await this.exhibitionService.createExhibitorService(dto);
    return { status: 'success', message: 'Tạo exhibitor thành công', data: res };
  }

  @Patch('exhibitors/:id')
  @RequirePermissions(RoleConstant.UPDATE)
  async updateExhibitorController(
    @Param('id') id: string,
    @Body() dto: UpdateExhibitorDto,
  ): Promise<BaseResponse<Exhibitor>> {
    const res = await this.exhibitionService.updateExhibitorService(+id, dto);
    return { status: 'success', message: 'Cập nhật exhibitor thành công', data: res };
  }

  @Delete('exhibitors/:id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteExhibitorController(@Param('id') id: string): Promise<BaseResponse<Exhibitor>> {
    const res = await this.exhibitionService.deleteExhibitorService(+id);
    return { status: 'success', message: 'Xóa exhibitor thành công', data: res };
  }

  @Get()
  @RequirePermissions(RoleConstant.VIEW)
  async getAllExhibitionsController(): Promise<BaseResponse<Exhibition[]>> {
    const res = await this.exhibitionService.getAllExhibitionsService();
    return { status: 'success', message: 'Lấy danh sách exhibition thành công', data: res };
  }

  @Get('web/:webId')
  @RequirePermissions(RoleConstant.VIEW)
  async getExhibitionsByWebIdController(
    @Param('webId') webId: string,
  ): Promise<BaseResponse<Exhibition[]>> {
    const res = await this.exhibitionService.getExhibitionsByWebIdService(+webId);
    return {
      status: 'success',
      message: 'Lấy danh sách exhibition theo website thành công',
      data: res,
    };
  }

  @Get(':id')
  @RequirePermissions(RoleConstant.VIEW)
  async getExhibitionByIdController(@Param('id') id: string): Promise<BaseResponse<Exhibition>> {
    const res = await this.exhibitionService.getExhibitionByIdService(+id);
    return { status: 'success', message: 'Lấy chi tiết exhibition thành công', data: res };
  }

  @Post()
  @RequirePermissions(RoleConstant.CREATE)
  async createExhibitionController(
    @Body() dto: CreateExhibitionDto,
  ): Promise<BaseResponse<Exhibition>> {
    const res = await this.exhibitionService.createExhibitionService(dto);
    return { status: 'success', message: 'Tạo exhibition thành công', data: res };
  }

  @Patch(':id')
  @RequirePermissions(RoleConstant.UPDATE)
  async updateExhibitionController(
    @Param('id') id: string,
    @Body() dto: UpdateExhibitionDto,
  ): Promise<BaseResponse<Exhibition>> {
    const res = await this.exhibitionService.updateExhibitionService(+id, dto);
    return { status: 'success', message: 'Cập nhật exhibition thành công', data: res };
  }

  @Delete(':id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteExhibitionController(@Param('id') id: string): Promise<BaseResponse<Exhibition>> {
    const res = await this.exhibitionService.deleteExhibitionService(+id);
    return { status: 'success', message: 'Xóa exhibition thành công', data: res };
  }
}
