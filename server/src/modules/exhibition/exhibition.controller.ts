import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import type { Booth, Conferences, Exhibition, Exhibitor, ExhibitorRank, Zone } from '@prisma/client';
import { BaseResponse } from 'src/common/apis';
import { RoleConstant } from 'src/common/constants';
import { Public, RequirePermissions } from 'src/common/decorators';
import { DeleteFileOnErrorFilter } from 'src/common/interceptors';
import { multerExhibitionOptions, multerOptions } from 'src/configs';
import {
  CreateBoothDto,
  CreateConferenceDto,
  CreateExhibitionDto,
  CreateExhibitorDto,
  CreateExhibitorRankDto,
  CreateZoneDto,
  UpdateBoothDto,
  UpdateConferenceDto,
  UpdateExhibitionDto,
  UpdateExhibitorDto,
  UpdateExhibitorRankDto,
  UpdateZoneDto,
} from './dto';
import { ExhibitionService } from './exhibition.service';

type ExhibitorFormDataBody = {
  name?: string;
  sumary_vn?: string;
  sumary_en?: string;
  content_vn?: string;
  content_en?: string;
  rankId?: string;
  boothId?: string;
  web_id?: string;
  exhibition_ids?: string;
  remove_img?: string;
};

type ExhibitionFormDataBody = {
  logo?: string;
  logo_url?: string;
  document_pdf?: string;
  name_vn?: string;
  name_en?: string;
  title_vn?: string;
  title_en?: string;
  sumary_vn?: string;
  sumary_en?: string;
  content_vn?: string;
  content_en?: string;
  display_order?: string;
  web_id?: string;
  zone_ids?: string;
  exhibitor_ids?: string;
  remove_img?: string;
  remove_document_pdf?: string;
};

type ConferenceFormDataBody = {
  name?: string;
  sumary_vn?: string;
  sumary_en?: string;
  content_vn?: string;
  content_en?: string;
  display_order?: string;
  web_id?: string;
  exhibition_ids?: string;
  remove_img?: string;
};

const getPublicFilePath = (file: Express.Multer.File) =>
  file.path.replace(/\\/g, '/').split('/public')[1] || '';

const toText = (value: string | undefined) => value?.trim() || '';
const toOptionalText = (value: string | undefined) => {
  const text = value?.trim();
  return text || undefined;
};
const toNumberValue = (value: string | undefined) =>
  value === undefined || value === '' ? undefined : Number(value);
const toBooleanValue = (value: string | undefined) => {
  if (value === undefined || value === '') return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return Boolean(value);
};
const toNumberArray = (value: string | undefined) => {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map(Number);
  }
};

const normalizeCreateExhibitorBody = (body: ExhibitorFormDataBody): CreateExhibitorDto => ({
  name: toText(body.name),
  sumary_vn: toText(body.sumary_vn),
  sumary_en: toOptionalText(body.sumary_en),
  content_vn: toText(body.content_vn),
  content_en: toOptionalText(body.content_en),
  rankId: Number(body.rankId),
  boothId: Number(body.boothId),
  web_id: Number(body.web_id),
  exhibition_ids: toNumberArray(body.exhibition_ids),
});

const normalizeUpdateExhibitorBody = (body: ExhibitorFormDataBody): UpdateExhibitorDto => ({
  name: body.name !== undefined ? toText(body.name) : undefined,
  sumary_vn: body.sumary_vn !== undefined ? toText(body.sumary_vn) : undefined,
  sumary_en: body.sumary_en !== undefined ? toOptionalText(body.sumary_en) : undefined,
  content_vn: body.content_vn !== undefined ? toText(body.content_vn) : undefined,
  content_en: body.content_en !== undefined ? toOptionalText(body.content_en) : undefined,
  rankId: toNumberValue(body.rankId),
  boothId: toNumberValue(body.boothId),
  web_id: toNumberValue(body.web_id),
  exhibition_ids: body.exhibition_ids !== undefined ? toNumberArray(body.exhibition_ids) : undefined,
  remove_img: toBooleanValue(body.remove_img),
});

const normalizeCreateExhibitionBody = (body: ExhibitionFormDataBody): CreateExhibitionDto => ({
  logo: toOptionalText(body.logo),
  logo_url: toOptionalText(body.logo_url),
  document_pdf: toOptionalText(body.document_pdf),
  name_vn: toText(body.name_vn),
  name_en: toOptionalText(body.name_en),
  title_vn: toText(body.title_vn),
  title_en: toOptionalText(body.title_en),
  sumary_vn: toOptionalText(body.sumary_vn),
  sumary_en: toOptionalText(body.sumary_en),
  content_vn: toOptionalText(body.content_vn),
  content_en: toOptionalText(body.content_en),
  display_order: toNumberValue(body.display_order),
  web_id: Number(body.web_id),
  zone_ids: toNumberArray(body.zone_ids) || [],
  exhibitor_ids: toNumberArray(body.exhibitor_ids),
});

const normalizeUpdateExhibitionBody = (body: ExhibitionFormDataBody): UpdateExhibitionDto => ({
  logo: body.logo !== undefined ? toOptionalText(body.logo) : undefined,
  logo_url: body.logo_url !== undefined ? toOptionalText(body.logo_url) : undefined,
  document_pdf: body.document_pdf !== undefined ? toOptionalText(body.document_pdf) : undefined,
  name_vn: body.name_vn !== undefined ? toText(body.name_vn) : undefined,
  name_en: body.name_en !== undefined ? toOptionalText(body.name_en) : undefined,
  title_vn: body.title_vn !== undefined ? toText(body.title_vn) : undefined,
  title_en: body.title_en !== undefined ? toOptionalText(body.title_en) : undefined,
  sumary_vn: body.sumary_vn !== undefined ? toOptionalText(body.sumary_vn) : undefined,
  sumary_en: body.sumary_en !== undefined ? toOptionalText(body.sumary_en) : undefined,
  content_vn: body.content_vn !== undefined ? toOptionalText(body.content_vn) : undefined,
  content_en: body.content_en !== undefined ? toOptionalText(body.content_en) : undefined,
  display_order: toNumberValue(body.display_order),
  web_id: toNumberValue(body.web_id),
  zone_ids: body.zone_ids !== undefined ? toNumberArray(body.zone_ids) : undefined,
  exhibitor_ids: body.exhibitor_ids !== undefined ? toNumberArray(body.exhibitor_ids) : undefined,
  remove_img: toBooleanValue(body.remove_img),
  remove_document_pdf: toBooleanValue(body.remove_document_pdf),
});

const normalizeCreateConferenceBody = (body: ConferenceFormDataBody): CreateConferenceDto => ({
  name: toText(body.name),
  sumary_vn: toText(body.sumary_vn),
  sumary_en: toOptionalText(body.sumary_en),
  content_vn: toText(body.content_vn),
  content_en: toOptionalText(body.content_en),
  display_order: toNumberValue(body.display_order),
  web_id: Number(body.web_id),
  exhibition_ids: toNumberArray(body.exhibition_ids),
});

const normalizeUpdateConferenceBody = (body: ConferenceFormDataBody): UpdateConferenceDto => ({
  name: body.name !== undefined ? toText(body.name) : undefined,
  sumary_vn: body.sumary_vn !== undefined ? toText(body.sumary_vn) : undefined,
  sumary_en: body.sumary_en !== undefined ? toOptionalText(body.sumary_en) : undefined,
  content_vn: body.content_vn !== undefined ? toText(body.content_vn) : undefined,
  content_en: body.content_en !== undefined ? toOptionalText(body.content_en) : undefined,
  display_order: toNumberValue(body.display_order),
  web_id: toNumberValue(body.web_id),
  exhibition_ids: body.exhibition_ids !== undefined ? toNumberArray(body.exhibition_ids) : undefined,
  remove_img: toBooleanValue(body.remove_img),
});

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
  @Get('public/zones/web/:webId')
  async getPublicZonesByWebIdController(@Param('webId') webId: string) {
    const res = await this.exhibitionService.getPublicZonesWithExhibitionsByWebIdService(+webId);
    return {
      status: 'success',
      message: 'Lấy danh sách zone theo website public thành công',
      data: res,
    };
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
  @Get('public/conferences')
  async getPublicConferencesController(): Promise<BaseResponse<Conferences[]>> {
    const res = await this.exhibitionService.getAllConferencesService();
    return {
      status: 'success',
      message: 'Lấy danh sách conference public thành công',
      data: res,
    };
  }

  @Public()
  @Get('public/conferences/:id')
  async getPublicConferenceByIdController(
    @Param('id') id: string,
  ): Promise<BaseResponse<Conferences>> {
    const res = await this.exhibitionService.getConferenceByIdService(+id);
    return { status: 'success', message: 'Lấy chi tiết conference public thành công', data: res };
  }

  @Public()
  @Get('public/exhibitions/:id/conferences')
  async getPublicConferencesByExhibitionIdController(
    @Param('id') id: string,
  ): Promise<BaseResponse<Conferences[]>> {
    const res = await this.exhibitionService.getPublicConferencesByExhibitionIdService(+id);
    return {
      status: 'success',
      message: 'Lấy danh sách conference theo exhibition public thành công',
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
  @UseInterceptors(
    FileInterceptor('file', multerOptions('vnsec', 'exhibitor')),
    DeleteFileOnErrorFilter,
  )
  async createExhibitorController(
    @Body() body: ExhibitorFormDataBody,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<Exhibitor>> {
    const dto = normalizeCreateExhibitorBody(body);
    if (file) {
      dto.img = getPublicFilePath(file);
    }
    const res = await this.exhibitionService.createExhibitorService(dto);
    return { status: 'success', message: 'Tạo exhibitor thành công', data: res };
  }

  @Patch('exhibitors/:id')
  @RequirePermissions(RoleConstant.UPDATE)
  @UseInterceptors(
    FileInterceptor('file', multerOptions('vnsec', 'exhibitor')),
    DeleteFileOnErrorFilter,
  )
  async updateExhibitorController(
    @Param('id') id: string,
    @Body() body: ExhibitorFormDataBody,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<Exhibitor>> {
    const dto = normalizeUpdateExhibitorBody(body);
    if (file) {
      dto.img = getPublicFilePath(file);
    }
    const res = await this.exhibitionService.updateExhibitorService(+id, dto);
    return { status: 'success', message: 'Cập nhật exhibitor thành công', data: res };
  }

  @Delete('exhibitors/:id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteExhibitorController(@Param('id') id: string): Promise<BaseResponse<Exhibitor>> {
    const res = await this.exhibitionService.deleteExhibitorService(+id);
    return { status: 'success', message: 'Xóa exhibitor thành công', data: res };
  }

  @Get('conferences')
  @RequirePermissions(RoleConstant.VIEW)
  async getAllConferencesController(): Promise<BaseResponse<Conferences[]>> {
    const res = await this.exhibitionService.getAllConferencesService();
    return { status: 'success', message: 'Lấy danh sách conference thành công', data: res };
  }

  @Get('conferences/web/:webId')
  @RequirePermissions(RoleConstant.VIEW)
  async getConferencesByWebIdController(
    @Param('webId') webId: string,
  ): Promise<BaseResponse<Conferences[]>> {
    const res = await this.exhibitionService.getConferencesByWebIdService(+webId);
    return {
      status: 'success',
      message: 'Lấy danh sách conference theo website thành công',
      data: res,
    };
  }

  @Get('conferences/:id')
  @RequirePermissions(RoleConstant.VIEW)
  async getConferenceByIdController(@Param('id') id: string): Promise<BaseResponse<Conferences>> {
    const res = await this.exhibitionService.getConferenceByIdService(+id);
    return { status: 'success', message: 'Lấy chi tiết conference thành công', data: res };
  }

  @Post('conferences')
  @RequirePermissions(RoleConstant.CREATE)
  @UseInterceptors(
    FileInterceptor('file', multerOptions('vnsec', 'conference')),
    DeleteFileOnErrorFilter,
  )
  async createConferenceController(
    @Body() body: ConferenceFormDataBody,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<Conferences>> {
    const dto = normalizeCreateConferenceBody(body);
    if (file) {
      dto.img = getPublicFilePath(file);
    }
    const res = await this.exhibitionService.createConferenceService(dto);
    return { status: 'success', message: 'Tạo conference thành công', data: res };
  }

  @Patch('conferences/:id')
  @RequirePermissions(RoleConstant.UPDATE)
  @UseInterceptors(
    FileInterceptor('file', multerOptions('vnsec', 'conference')),
    DeleteFileOnErrorFilter,
  )
  async updateConferenceController(
    @Param('id') id: string,
    @Body() body: ConferenceFormDataBody,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<Conferences>> {
    const dto = normalizeUpdateConferenceBody(body);
    if (file) {
      dto.img = getPublicFilePath(file);
    }
    const res = await this.exhibitionService.updateConferenceService(+id, dto);
    return { status: 'success', message: 'Cập nhật conference thành công', data: res };
  }

  @Delete('conferences/:id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteConferenceController(@Param('id') id: string): Promise<BaseResponse<Conferences>> {
    const res = await this.exhibitionService.deleteConferenceService(+id);
    return { status: 'success', message: 'Xóa conference thành công', data: res };
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'document_pdf_file', maxCount: 1 },
      ],
      multerExhibitionOptions('vnsec', 'exhibition'),
    ),
    DeleteFileOnErrorFilter,
  )
  async createExhibitionController(
    @Body() body: ExhibitionFormDataBody,
    @UploadedFiles()
    files?: {
      file?: Express.Multer.File[];
      document_pdf_file?: Express.Multer.File[];
    },
  ): Promise<BaseResponse<Exhibition>> {
    const dto = normalizeCreateExhibitionBody(body);
    const file = files?.file?.[0];
    const documentPdfFile = files?.document_pdf_file?.[0];
    if (file) {
      dto.img = getPublicFilePath(file);
    }
    if (documentPdfFile) {
      dto.document_pdf = getPublicFilePath(documentPdfFile);
    }
    const res = await this.exhibitionService.createExhibitionService(dto);
    return { status: 'success', message: 'Tạo exhibition thành công', data: res };
  }

  @Patch(':id')
  @RequirePermissions(RoleConstant.UPDATE)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'document_pdf_file', maxCount: 1 },
      ],
      multerExhibitionOptions('vnsec', 'exhibition'),
    ),
    DeleteFileOnErrorFilter,
  )
  async updateExhibitionController(
    @Param('id') id: string,
    @Body() body: ExhibitionFormDataBody,
    @UploadedFiles()
    files?: {
      file?: Express.Multer.File[];
      document_pdf_file?: Express.Multer.File[];
    },
  ): Promise<BaseResponse<Exhibition>> {
    const dto = normalizeUpdateExhibitionBody(body);
    const file = files?.file?.[0];
    const documentPdfFile = files?.document_pdf_file?.[0];
    if (file) {
      dto.img = getPublicFilePath(file);
    }
    if (documentPdfFile) {
      dto.document_pdf = getPublicFilePath(documentPdfFile);
    }
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
