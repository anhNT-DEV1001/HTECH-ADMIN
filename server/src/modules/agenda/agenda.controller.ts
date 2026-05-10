import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Prisma } from '@prisma/client';
import { BaseResponse } from 'src/common/apis';
import { RoleConstant } from 'src/common/constants';
import { RequirePermissions  } from 'src/common/decorators';
import { DeleteFileOnErrorFilter } from 'src/common/interceptors';
import type { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';
import { multerPdfOptions } from 'src/configs';
import { AgendaService } from './agenda.service';
import { CreateAgendaDto, UpdateAgendaDto } from './dto';

type AgendaPayload = Prisma.AgendaGetPayload<{
  include: {
    web: true;
    agendaDates: {
      include: {
        timelines: true;
      };
    };
  };
}>;

type AgendaQuery = IPaginationRequest & {
  web_id?: number;
  startDate?: string;
  endDate?: string;
};

type AgendaFormDataBody = {
  name_vn?: string;
  name_en?: string;
  file_url?: string;
  web_id?: string;
  SDate?: string;
  EDate?: string;
  agendaDates?: string;
};

type RawAgendaTimeline = {
  id?: number | string;
  STime?: string;
  ETime?: string;
  name_vn?: string;
  name_en?: string;
  short_name_vn?: string;
  short_name_en?: string;
  locate_vn?: string;
  locate_en?: string;
};

type RawAgendaDate = {
  id?: number | string;
  date?: string;
  description?: string;
  timelines?: RawAgendaTimeline[];
};

const getPublicFilePath = (file: Express.Multer.File) =>
  file.path.replace(/\\/g, '/').split('/public')[1] || '';

const toText = (value: string | undefined) => value?.trim() || '';
const toOptionalText = (value: string | undefined) => {
  const text = value?.trim();
  return text || undefined;
};
const toNumberValue = (value: number | string | undefined) =>
  value === undefined || value === '' ? undefined : Number(value);
const toDateValue = (value: string | undefined) =>
  value ? new Date(value) : undefined;
const toTimeValue = (value: string | undefined) => {
  if (!value) return undefined;
  const normalized = value.length === 5 ? `${value}:00` : value;
  return new Date(`1970-01-01T${normalized}.000Z`);
};

const parseAgendaDates = (value: string | undefined) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as RawAgendaDate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeAgendaDates = (value: string | undefined) =>
  parseAgendaDates(value).map((agendaDate) => ({
    id: toNumberValue(agendaDate.id),
    date: toDateValue(agendaDate.date),
    description: toOptionalText(agendaDate.description),
    timelines: (agendaDate.timelines || []).map((timeline) => ({
      id: toNumberValue(timeline.id),
      STime: toTimeValue(timeline.STime),
      ETime: toTimeValue(timeline.ETime),
      name_vn: toText(timeline.name_vn),
      name_en: toOptionalText(timeline.name_en),
      short_name_vn: toText(timeline.short_name_vn),
      short_name_en: toOptionalText(timeline.short_name_en),
      locate_vn: toText(timeline.locate_vn),
      locate_en: toOptionalText(timeline.locate_en),
    })),
  }));

const normalizeCreateAgendaBody = (body: AgendaFormDataBody): CreateAgendaDto => ({
  name_vn: toText(body.name_vn),
  name_en: toOptionalText(body.name_en),
  file_url: toOptionalText(body.file_url),
  web_id: Number(body.web_id),
  SDate: toDateValue(body.SDate) as Date,
  EDate: toDateValue(body.EDate) as Date,
  agendaDates: normalizeAgendaDates(body.agendaDates) as CreateAgendaDto['agendaDates'],
});

const normalizeUpdateAgendaBody = (body: AgendaFormDataBody): UpdateAgendaDto => ({
  name_vn: toOptionalText(body.name_vn),
  name_en: toOptionalText(body.name_en),
  file_url: body.file_url !== undefined ? toText(body.file_url) : undefined,
  web_id: toNumberValue(body.web_id),
  SDate: toDateValue(body.SDate),
  EDate: toDateValue(body.EDate),
  agendaDates: body.agendaDates !== undefined
    ? normalizeAgendaDates(body.agendaDates) as UpdateAgendaDto['agendaDates']
    : undefined,
});

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  // @RequirePermissions(RoleConstant.VIEW)
  async getAllAgendaController(
    @Query() query: AgendaQuery,
  ): Promise<BaseResponse<IPaginationResponse<AgendaPayload>>> {
    const res = await this.agendaService.getAllAgendaService(query);
    return {
      status: 'success',
      message: 'Lấy danh sách agenda thành công',
      data: res,
    };
  }

  @Get('web/:webId')
  // @RequirePermissions(RoleConstant.VIEW)
  async getAgendaByWebIdController(
    @Param('webId') webId: string,
  ): Promise<BaseResponse<AgendaPayload[]>> {
    const res = await this.agendaService.getAgendaByWebIdService(+webId);
    return {
      status: 'success',
      message: 'Lấy danh sách agenda theo website thành công',
      data: res,
    };
  }

  @Get(':id')
  // @RequirePermissions(RoleConstant.VIEW)
  async getAgendaByIdController(
    @Param('id') id: string,
  ): Promise<BaseResponse<AgendaPayload>> {
    const res = await this.agendaService.getAgendaByIdService(+id);
    return {
      status: 'success',
      message: 'Lấy chi tiết agenda thành công',
      data: res,
    };
  }

  @Post()
  // @RequirePermissions(RoleConstant.CREATE)
  @UseInterceptors(
    FileInterceptor('file', multerPdfOptions('vnsec', 'agenda')),
    DeleteFileOnErrorFilter,
  )
  async createAgendaController(
    @Body() body: AgendaFormDataBody,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<AgendaPayload>> {
    const dto = normalizeCreateAgendaBody(body);
    if (file) {
      dto.file_url = getPublicFilePath(file);
    }
    const res = await this.agendaService.createAgendaService(dto);
    return {
      status: 'success',
      message: 'Tạo agenda thành công',
      data: res,
    };
  }

  @Patch(':id')
  @RequirePermissions(RoleConstant.UPDATE)
  @UseInterceptors(
    FileInterceptor('file', multerPdfOptions('vnsec', 'agenda')),
    DeleteFileOnErrorFilter,
  )
  async updateAgendaController(
    @Param('id') id: string,
    @Body() body: AgendaFormDataBody,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<AgendaPayload>> {
    const dto = normalizeUpdateAgendaBody(body);
    if (file) {
      dto.file_url = getPublicFilePath(file);
    }
    const res = await this.agendaService.updateAgendaService(+id, dto);
    return {
      status: 'success',
      message: 'Cập nhật agenda thành công',
      data: res,
    };
  }

  @Delete(':id')
  // @RequirePermissions(RoleConstant.DELETE)
  async deleteAgendaController(
    @Param('id') id: string,
  ): Promise<BaseResponse<AgendaPayload>> {
    const res = await this.agendaService.deleteAgendaService(+id);
    return {
      status: 'success',
      message: 'Xóa agenda thành công',
      data: res,
    };
  }
}
