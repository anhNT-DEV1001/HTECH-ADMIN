import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ApiError } from 'src/common/apis';
import { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';
import { deleteFileFromPublic } from 'src/common/utils';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  CreateAgendaDateDto,
  CreateAgendaDto,
  CreateAgendaTimelineDto,
  UpdateAgendaDateDto,
  UpdateAgendaDto,
  UpdateAgendaTimelineDto,
} from './dto';

type AgendaQuery = IPaginationRequest & {
  web_id?: number;
  startDate?: string;
  endDate?: string;
};

const agendaInclude = {
  agendaDates: {
    include: {
      timelines: {
        orderBy: { STime: 'asc' as const },
      },
    },
    orderBy: { date: 'asc' as const },
  },
  web: true,
} satisfies Prisma.AgendaInclude;

type AgendaPayload = Prisma.AgendaGetPayload<{
  include: typeof agendaInclude;
}>;

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllAgendaService(query: AgendaQuery): Promise<IPaginationResponse<AgendaPayload>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'SDate',
      sortBy = 'asc',
      search,
      searchBy = 'name_vn',
      web_id,
      startDate,
      endDate,
    } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: Prisma.AgendaWhereInput = {};

    if (search && searchBy) {
      const validSearchFields = ['name_vn', 'name_en'];
      const field = validSearchFields.includes(searchBy) ? searchBy : 'name_vn';
      where[field] = {
        contains: String(search),
        mode: 'insensitive',
      };
    }

    if (web_id) {
      where.web_id = Number(web_id);
    }

    if (startDate) {
      where.SDate = {
        gte: this.toLocalDate(startDate, 'start'),
      };
    }

    if (endDate) {
      where.EDate = {
        lte: this.toLocalDate(endDate, 'end'),
      };
    }

    const validOrderFields = ['id', 'name_vn', 'SDate', 'EDate', 'created_at', 'updated_at', 'web_id'];
    const orderField = validOrderFields.includes(orderBy) ? orderBy : 'SDate';
    const orderCondition: Prisma.AgendaOrderByWithRelationInput = {
      [orderField]: sortBy === 'desc' ? 'desc' : 'asc',
    };

    const [records, total] = await Promise.all([
      this.prisma.agenda.findMany({
        where,
        skip,
        take,
        include: agendaInclude,
        orderBy: orderCondition,
      }),
      this.prisma.agenda.count({ where }),
    ]);

    return {
      records,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getAgendaByWebIdService(webId: number): Promise<AgendaPayload[]> {
    return await this.prisma.agenda.findMany({
      where: { web_id: webId },
      include: agendaInclude,
      orderBy: { SDate: 'asc' },
    });
  }

  async getAgendaByIdService(id: number): Promise<AgendaPayload> {
    const agenda = await this.prisma.agenda.findUnique({
      where: { id },
      include: agendaInclude,
    });

    if (!agenda) throw new ApiError('Agenda không tồn tại', HttpStatus.NOT_FOUND);

    return agenda;
  }

  async createAgendaService(dto: CreateAgendaDto): Promise<AgendaPayload> {
    try {
      return await this.prisma.$transaction(async (db) => {
        return await db.agenda.create({
          data: {
            name_vn: dto.name_vn,
            name_en: dto.name_en || '',
            file_url: dto.file_url || '',
            web_id: dto.web_id,
            SDate: dto.SDate,
            EDate: dto.EDate,
            agendaDates: dto.agendaDates?.length
              ? {
                create: dto.agendaDates.map((agendaDate) =>
                  this.buildCreateAgendaDateData(agendaDate),
                ),
              }
              : undefined,
          },
          include: agendaInclude,
        });
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ApiError(`System error: ${message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async updateAgendaService(id: number, dto: UpdateAgendaDto): Promise<AgendaPayload> {
    try {
      const agenda = await this.prisma.agenda.findUnique({
        where: { id },
      });

      if (!agenda) throw new ApiError('Agenda không tồn tại', HttpStatus.NOT_FOUND);
      const oldFileUrl = agenda.file_url;

      const updated = await this.prisma.$transaction(async (db) => {
        await db.agenda.update({
          where: { id },
          data: {
            name_vn: dto.name_vn ?? agenda.name_vn,
            name_en: dto.name_en ?? agenda.name_en,
            file_url: dto.file_url ?? agenda.file_url,
            web_id: dto.web_id ?? agenda.web_id,
            SDate: dto.SDate ?? agenda.SDate,
            EDate: dto.EDate ?? agenda.EDate,
          },
        });

        if (dto.agendaDates !== undefined) {
          await this.syncAgendaDates(db, id, dto.agendaDates);
        }

        const updatedAgenda = await db.agenda.findUnique({
          where: { id },
          include: agendaInclude,
        });

        if (!updatedAgenda) {
          throw new ApiError('Agenda không tồn tại', HttpStatus.NOT_FOUND);
        }

        return updatedAgenda;
      });

      if (dto.file_url !== undefined && dto.file_url !== oldFileUrl) {
        await deleteFileFromPublic(oldFileUrl);
      }

      return updated;
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ApiError(`System error: ${message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteAgendaService(id: number): Promise<AgendaPayload> {
    try {
      const agenda = await this.prisma.agenda.findUnique({
        where: { id },
        include: agendaInclude,
      });

      if (!agenda) throw new ApiError('Agenda không tồn tại', HttpStatus.NOT_FOUND);

      const deleted = await this.prisma.$transaction(async (db) => {
        const agendaDateIds = agenda.agendaDates.map((agendaDate) => agendaDate.id);

        if (agendaDateIds.length > 0) {
          await db.agendaTimeline.deleteMany({
            where: { agenda_date_id: { in: agendaDateIds } },
          });
        }

        await db.agendaDate.deleteMany({
          where: { agenda_id: id },
        });

        return await db.agenda.delete({
          where: { id },
          include: agendaInclude,
        });
      });

      await deleteFileFromPublic(agenda.file_url);

      return deleted;
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ApiError(`System error: ${message}`, HttpStatus.BAD_REQUEST);
    }
  }

  private toLocalDate(value: string, boundary: 'start' | 'end') {
    const [year, month, day] = value.split('-').map(Number);
    if (boundary === 'start') return new Date(year, month - 1, day, 0, 0, 0, 0);
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }

  private buildCreateAgendaDateData(dto: CreateAgendaDateDto) {
    return {
      date: dto.date,
      description: dto.description || '',
      timelines: dto.timelines?.length
        ? {
          create: dto.timelines.map((timeline) =>
            this.buildCreateAgendaTimelineData(timeline),
          ),
        }
        : undefined,
    };
  }

  private buildCreateAgendaTimelineData(dto: CreateAgendaTimelineDto) {
    return {
      STime: dto.STime,
      ETime: dto.ETime,
      name_vn: dto.name_vn,
      name_en: dto.name_en || '',
      short_name_vn: dto.short_name_vn,
      short_name_en: dto.short_name_en || '',
      locate_vn: dto.locate_vn,
      locate_en: dto.locate_en || '',
    };
  }

  private async syncAgendaDates(
    db: Prisma.TransactionClient,
    agendaId: number,
    agendaDates: UpdateAgendaDateDto[],
  ) {
    const existingAgendaDates = await db.agendaDate.findMany({
      where: { agenda_id: agendaId },
    });
    const incomingIds = agendaDates
      .map((agendaDate) => agendaDate.id)
      .filter((id): id is number => !!id);
    const deleteIds = existingAgendaDates
      .filter((agendaDate) => !incomingIds.includes(agendaDate.id))
      .map((agendaDate) => agendaDate.id);

    if (deleteIds.length > 0) {
      await db.agendaTimeline.deleteMany({
        where: { agenda_date_id: { in: deleteIds } },
      });
      await db.agendaDate.deleteMany({
        where: { id: { in: deleteIds } },
      });
    }

    for (const agendaDate of agendaDates) {
      if (agendaDate.id) {
        const existingAgendaDate = existingAgendaDates.find(
          (item) => item.id === agendaDate.id,
        );
        if (!existingAgendaDate) {
          throw new ApiError(
            `Agenda date không thuộc agenda hiện tại: ${agendaDate.id}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        await db.agendaDate.update({
          where: { id: agendaDate.id },
          data: {
            date: agendaDate.date ?? existingAgendaDate.date,
            description: agendaDate.description ?? existingAgendaDate.description,
          },
        });

        if (agendaDate.timelines !== undefined) {
          await this.syncAgendaTimelines(db, agendaDate.id, agendaDate.timelines);
        }
      } else {
        await db.agendaDate.create({
          data: {
            agenda_id: agendaId,
            date: agendaDate.date,
            description: agendaDate.description || '',
            timelines: agendaDate.timelines?.length
              ? {
                create: agendaDate.timelines.map((timeline) =>
                  this.buildCreateAgendaTimelineData(timeline as CreateAgendaTimelineDto),
                ),
              }
              : undefined,
          } as Prisma.AgendaDateUncheckedCreateInput,
        });
      }
    }
  }

  private async syncAgendaTimelines(
    db: Prisma.TransactionClient,
    agendaDateId: number,
    timelines: UpdateAgendaTimelineDto[],
  ) {
    const existingTimelines = await db.agendaTimeline.findMany({
      where: { agenda_date_id: agendaDateId },
    });
    const incomingIds = timelines
      .map((timeline) => timeline.id)
      .filter((id): id is number => !!id);
    const deleteIds = existingTimelines
      .filter((timeline) => !incomingIds.includes(timeline.id))
      .map((timeline) => timeline.id);

    if (deleteIds.length > 0) {
      await db.agendaTimeline.deleteMany({
        where: { id: { in: deleteIds } },
      });
    }

    for (const timeline of timelines) {
      if (timeline.id) {
        const existingTimeline = existingTimelines.find(
          (item) => item.id === timeline.id,
        );
        if (!existingTimeline) {
          throw new ApiError(
            `Agenda timeline không thuộc agenda date hiện tại: ${timeline.id}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        await db.agendaTimeline.update({
          where: { id: timeline.id },
          data: {
            STime: timeline.STime ?? existingTimeline.STime,
            ETime: timeline.ETime ?? existingTimeline.ETime,
            name_vn: timeline.name_vn ?? existingTimeline.name_vn,
            name_en: timeline.name_en ?? existingTimeline.name_en,
            short_name_vn: timeline.short_name_vn ?? existingTimeline.short_name_vn,
            short_name_en: timeline.short_name_en ?? existingTimeline.short_name_en,
            locate_vn: timeline.locate_vn ?? existingTimeline.locate_vn,
            locate_en: timeline.locate_en ?? existingTimeline.locate_en,
          },
        });
      } else {
        await db.agendaTimeline.create({
          data: {
            agenda_date_id: agendaDateId,
            STime: timeline.STime,
            ETime: timeline.ETime,
            name_vn: timeline.name_vn,
            name_en: timeline.name_en || '',
            short_name_vn: timeline.short_name_vn,
            short_name_en: timeline.short_name_en || '',
            locate_vn: timeline.locate_vn,
            locate_en: timeline.locate_en || '',
          } as Prisma.AgendaTimelineUncheckedCreateInput,
        });
      }
    }
  }
}
