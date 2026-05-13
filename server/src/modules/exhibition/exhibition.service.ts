import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ApiError } from 'src/common/apis';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
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

@Injectable()
export class ExhibitionService {
  constructor(private readonly prisma: PrismaService) {}

  private getExhibitionLogoValue(dto: { logo?: string; logo_url?: string }) {
    return dto.logo_url?.trim() || dto.logo?.trim() || '';
  }

  private readonly zoneInclude = {
    web: true,
    exhibitions: true,
  } satisfies Prisma.ZoneInclude;

  private readonly exhibitorRankInclude = {
    web: true,
    exhibitors: true,
  } satisfies Prisma.ExhibitorRankInclude;

  private readonly boothInclude = {
    web: true,
    exhibitors: true,
  } satisfies Prisma.BoothInclude;

  private readonly exhibitionInclude = {
    web: true,
    zones: true,
    exhibitors: {
      include: {
        rank: true,
        booth: true,
      },
      orderBy: { id: 'asc' as const },
    },
  } satisfies Prisma.ExhibitionInclude;

  private readonly exhibitorInclude = {
    web: true,
    rank: true,
    booth: true,
    exhibitions: {
      include: {
        zones: true,
      },
      orderBy: { display_order: 'asc' as const },
    },
  } satisfies Prisma.ExhibitorInclude;

  async getAllZonesService() {
    return await this.prisma.zone.findMany({
      include: this.zoneInclude,
      orderBy: { id: 'asc' },
    });
  }

  async getPublicExhibitionDataService() {
    const [zones, ranks, booths, exhibitors, exhibitions] = await Promise.all([
      this.getAllZonesService(),
      this.getAllExhibitorRanksService(),
      this.getAllBoothsService(),
      this.getAllExhibitorsService(),
      this.getAllExhibitionsService(),
    ]);

    return {
      zones,
      ranks,
      booths,
      exhibitors,
      exhibitions,
    };
  }

  async getZonesByWebIdService(webId: number) {
    return await this.prisma.zone.findMany({
      where: { web_id: webId },
      include: this.zoneInclude,
      orderBy: { id: 'asc' },
    });
  }

  async createZoneService(dto: CreateZoneDto) {
    try {
      return await this.prisma.zone.create({
        data: {
          name_vn: dto.name_vn,
          name_en: dto.name_en || '',
          web_id: dto.web_id,
        },
        include: this.zoneInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error);
    }
  }

  async updateZoneService(id: number, dto: UpdateZoneDto) {
    try {
      const zone = await this.prisma.zone.findUnique({ where: { id } });
      if (!zone) throw new ApiError('Zone không tồn tại', HttpStatus.NOT_FOUND);

      return await this.prisma.zone.update({
        where: { id },
        data: {
          name_vn: dto.name_vn ?? zone.name_vn,
          name_en: dto.name_en ?? zone.name_en,
          web_id: dto.web_id ?? zone.web_id,
        },
        include: this.zoneInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error);
    }
  }

  async deleteZoneService(id: number) {
    try {
      await this.ensureExists('zone', id, 'Zone không tồn tại');
      return await this.prisma.zone.delete({ where: { id } });
    } catch (error: any) {
      this.throwHandledError(error, 'Không thể xóa zone vì đang có exhibition liên kết');
    }
  }

  async getAllExhibitorRanksService() {
    return await this.prisma.exhibitorRank.findMany({
      include: this.exhibitorRankInclude,
      orderBy: [{ display_order: 'asc' }, { id: 'asc' }],
    });
  }

  async getExhibitorRanksByWebIdService(webId: number) {
    return await this.prisma.exhibitorRank.findMany({
      where: { web_id: webId },
      include: this.exhibitorRankInclude,
      orderBy: [{ display_order: 'asc' }, { id: 'asc' }],
    });
  }

  async createExhibitorRankService(dto: CreateExhibitorRankDto) {
    try {
      return await this.prisma.exhibitorRank.create({
        data: {
          name_vn: dto.name_vn,
          name_en: dto.name_en || '',
          display_order: dto.display_order ?? 0,
          web_id: dto.web_id,
        },
        include: this.exhibitorRankInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error);
    }
  }

  async updateExhibitorRankService(id: number, dto: UpdateExhibitorRankDto) {
    try {
      const rank = await this.prisma.exhibitorRank.findUnique({ where: { id } });
      if (!rank) throw new ApiError('Exhibitor rank không tồn tại', HttpStatus.NOT_FOUND);

      return await this.prisma.exhibitorRank.update({
        where: { id },
        data: {
          name_vn: dto.name_vn ?? rank.name_vn,
          name_en: dto.name_en ?? rank.name_en,
          display_order: dto.display_order ?? rank.display_order,
          web_id: dto.web_id ?? rank.web_id,
        },
        include: this.exhibitorRankInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error);
    }
  }

  async deleteExhibitorRankService(id: number) {
    try {
      await this.ensureExists('exhibitorRank', id, 'Exhibitor rank không tồn tại');
      return await this.prisma.exhibitorRank.delete({ where: { id } });
    } catch (error: any) {
      this.throwHandledError(error, 'Không thể xóa exhibitor rank vì đang có exhibitor liên kết');
    }
  }

  async getAllBoothsService() {
    return await this.prisma.booth.findMany({
      include: this.boothInclude,
      orderBy: { id: 'asc' },
    });
  }

  async getBoothsByWebIdService(webId: number) {
    return await this.prisma.booth.findMany({
      where: { web_id: webId },
      include: this.boothInclude,
      orderBy: { id: 'asc' },
    });
  }

  async createBoothService(dto: CreateBoothDto) {
    try {
      return await this.prisma.booth.create({
        data: {
          name: dto.name || '',
          web_id: dto.web_id,
        },
        include: this.boothInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error, 'Booth đã tồn tại trong website này');
    }
  }

  async updateBoothService(id: number, dto: UpdateBoothDto) {
    try {
      const booth = await this.prisma.booth.findUnique({ where: { id } });
      if (!booth) throw new ApiError('Booth không tồn tại', HttpStatus.NOT_FOUND);

      return await this.prisma.booth.update({
        where: { id },
        data: {
          name: dto.name ?? booth.name,
          web_id: dto.web_id ?? booth.web_id,
        },
        include: this.boothInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error, 'Booth đã tồn tại trong website này');
    }
  }

  async deleteBoothService(id: number) {
    try {
      await this.ensureExists('booth', id, 'Booth không tồn tại');
      return await this.prisma.booth.delete({ where: { id } });
    } catch (error: any) {
      this.throwHandledError(error, 'Không thể xóa booth vì đang có exhibitor liên kết');
    }
  }

  async getAllExhibitionsService() {
    return await this.prisma.exhibition.findMany({
      include: this.exhibitionInclude,
      orderBy: [{ display_order: 'asc' }, { id: 'asc' }],
    });
  }

  async getExhibitionsByWebIdService(webId: number) {
    return await this.prisma.exhibition.findMany({
      where: { web_id: webId },
      include: this.exhibitionInclude,
      orderBy: [{ display_order: 'asc' }, { id: 'asc' }],
    });
  }

  async getExhibitionByIdService(id: number) {
    const exhibition = await this.prisma.exhibition.findUnique({
      where: { id },
      include: this.exhibitionInclude,
    });
    if (!exhibition) throw new ApiError('Exhibition không tồn tại', HttpStatus.NOT_FOUND);
    return exhibition;
  }

  async createExhibitionService(dto: CreateExhibitionDto) {
    try {
      const logoValue = this.getExhibitionLogoValue(dto);
      const data: Prisma.ExhibitionCreateInput = {
        logo: logoValue,
        name_vn: dto.name_vn,
        name_en: dto.name_en || '',
        title_vn: dto.title_vn,
        title_en: dto.title_en || '',
        sumary_vn: dto.sumary_vn || '',
        sumary_en: dto.sumary_en || '',
        content_vn: dto.content_vn || '',
        content_en: dto.content_en || '',
        display_order: dto.display_order ?? 0,
        web: { connect: { id: dto.web_id } },
        zones: { connect: dto.zone_ids.map((id) => ({ id })) },
        exhibitors: dto.exhibitor_ids?.length
          ? { connect: dto.exhibitor_ids.map((id) => ({ id })) }
          : undefined,
      };

      return await this.prisma.exhibition.create({
        data,
        include: this.exhibitionInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error);
    }
  }

  async updateExhibitionService(id: number, dto: UpdateExhibitionDto) {
    try {
      const exhibition = await this.prisma.exhibition.findUnique({ where: { id } });
      if (!exhibition) throw new ApiError('Exhibition không tồn tại', HttpStatus.NOT_FOUND);

      const logoValue =
        dto.logo !== undefined || dto.logo_url !== undefined
          ? this.getExhibitionLogoValue(dto)
          : exhibition.logo;

      const data: Prisma.ExhibitionUpdateInput = {
        logo: logoValue,
        name_vn: dto.name_vn ?? exhibition.name_vn,
        name_en: dto.name_en ?? exhibition.name_en,
        title_vn: dto.title_vn ?? exhibition.title_vn,
        title_en: dto.title_en ?? exhibition.title_en,
        sumary_vn: dto.sumary_vn ?? exhibition.sumary_vn,
        sumary_en: dto.sumary_en ?? exhibition.sumary_en,
        content_vn: dto.content_vn ?? exhibition.content_vn,
        content_en: dto.content_en ?? exhibition.content_en,
        display_order: dto.display_order ?? exhibition.display_order,
        web: dto.web_id !== undefined ? { connect: { id: dto.web_id } } : undefined,
        zones: dto.zone_ids !== undefined
          ? { set: dto.zone_ids.map((zoneId) => ({ id: zoneId })) }
          : undefined,
        exhibitors: dto.exhibitor_ids !== undefined
          ? { set: dto.exhibitor_ids.map((exhibitorId) => ({ id: exhibitorId })) }
          : undefined,
      };

      return await this.prisma.exhibition.update({
        where: { id },
        data,
        include: this.exhibitionInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error);
    }
  }

  async deleteExhibitionService(id: number) {
    try {
      await this.ensureExists('exhibition', id, 'Exhibition không tồn tại');
      return await this.prisma.$transaction(async (db) => {
        await db.exhibition.update({
          where: { id },
          data: { exhibitors: { set: [] }, zones: { set: [] } },
        });
        return await db.exhibition.delete({ where: { id } });
      });
    } catch (error: any) {
      this.throwHandledError(error);
    }
  }

  async getAllExhibitorsService() {
    return await this.prisma.exhibitor.findMany({
      include: this.exhibitorInclude,
      orderBy: { id: 'asc' },
    });
  }

  async getExhibitorsByWebIdService(webId: number) {
    return await this.prisma.exhibitor.findMany({
      where: { web_id: webId },
      include: this.exhibitorInclude,
      orderBy: { id: 'asc' },
    });
  }

  async getExhibitorByIdService(id: number) {
    const exhibitor = await this.prisma.exhibitor.findUnique({
      where: { id },
      include: this.exhibitorInclude,
    });
    if (!exhibitor) throw new ApiError('Exhibitor không tồn tại', HttpStatus.NOT_FOUND);
    return exhibitor;
  }

  async getPublicExhibitorByExhibitionIdService(exhibitionId: number, exhibitorId: number) {
    const exhibitor = await this.prisma.exhibitor.findFirst({
      where: {
        id: exhibitorId,
        exhibitions: {
          some: { id: exhibitionId },
        },
      },
      include: this.exhibitorInclude,
    });

    if (!exhibitor) {
      throw new ApiError('Exhibitor không tồn tại trong exhibition này', HttpStatus.NOT_FOUND);
    }

    return exhibitor;
  }

  async getPublicExhibitorsByExhibitionIdService(exhibitionId: number) {
    await this.ensureExists('exhibition', exhibitionId, 'Exhibition không tồn tại');

    return await this.prisma.exhibitor.findMany({
      where: {
        exhibitions: {
          some: { id: exhibitionId },
        },
      },
      include: this.exhibitorInclude,
      orderBy: { id: 'asc' },
    });
  }

  async createExhibitorService(dto: CreateExhibitorDto) {
    try {
      const data: Prisma.ExhibitorUncheckedCreateInput = {
        name: dto.name,
        img: dto.img || null,
        sumary_vn: dto.sumary_vn,
        sumary_en: dto.sumary_en || '',
        content_vn: dto.content_vn,
        content_en: dto.content_en || '',
        rankId: dto.rankId,
        boothId: dto.boothId,
        web_id: dto.web_id,
        exhibitions: dto.exhibition_ids?.length
          ? { connect: dto.exhibition_ids.map((id) => ({ id })) }
          : undefined,
      };

      return await this.prisma.exhibitor.create({
        data,
        include: this.exhibitorInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error);
    }
  }

  async updateExhibitorService(id: number, dto: UpdateExhibitorDto) {
    try {
      const exhibitor = await this.prisma.exhibitor.findUnique({ where: { id } });
      if (!exhibitor) throw new ApiError('Exhibitor không tồn tại', HttpStatus.NOT_FOUND);

      const data: Prisma.ExhibitorUncheckedUpdateInput = {
        name: dto.name ?? exhibitor.name,
        img: dto.remove_img ? null : (dto.img ?? exhibitor.img),
        sumary_vn: dto.sumary_vn ?? exhibitor.sumary_vn,
        sumary_en: dto.sumary_en ?? exhibitor.sumary_en,
        content_vn: dto.content_vn ?? exhibitor.content_vn,
        content_en: dto.content_en ?? exhibitor.content_en,
        rankId: dto.rankId ?? exhibitor.rankId,
        boothId: dto.boothId ?? exhibitor.boothId,
        web_id: dto.web_id ?? exhibitor.web_id,
        exhibitions: dto.exhibition_ids !== undefined
          ? { set: dto.exhibition_ids.map((exhibitionId) => ({ id: exhibitionId })) }
          : undefined,
      };

      return await this.prisma.exhibitor.update({
        where: { id },
        data,
        include: this.exhibitorInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error);
    }
  }

  async deleteExhibitorService(id: number) {
    try {
      await this.ensureExists('exhibitor', id, 'Exhibitor không tồn tại');
      return await this.prisma.$transaction(async (db) => {
        await db.exhibitor.update({
          where: { id },
          data: { exhibitions: { set: [] } },
        });
        return await db.exhibitor.delete({ where: { id } });
      });
    } catch (error: any) {
      this.throwHandledError(error);
    }
  }

  private async ensureExists(
    model: 'zone' | 'exhibitorRank' | 'booth' | 'exhibition' | 'exhibitor',
    id: number,
    message: string,
  ) {
    let data: unknown;

    switch (model) {
      case 'zone':
        data = await this.prisma.zone.findUnique({ where: { id } });
        break;
      case 'exhibitorRank':
        data = await this.prisma.exhibitorRank.findUnique({ where: { id } });
        break;
      case 'booth':
        data = await this.prisma.booth.findUnique({ where: { id } });
        break;
      case 'exhibition':
        data = await this.prisma.exhibition.findUnique({ where: { id } });
        break;
      case 'exhibitor':
        data = await this.prisma.exhibitor.findUnique({ where: { id } });
        break;
    }

    if (!data) throw new ApiError(message, HttpStatus.NOT_FOUND);
  }

  private throwHandledError(error: any, fallbackMessage?: string): never {
    if (error instanceof ApiError) throw error;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ApiError(fallbackMessage || 'Dữ liệu đã tồn tại', HttpStatus.BAD_REQUEST);
      }

      if (error.code === 'P2003') {
        throw new ApiError(
          fallbackMessage || 'Dữ liệu liên kết không hợp lệ hoặc đang được sử dụng',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.code === 'P2025') {
        throw new ApiError('Không tìm thấy dữ liệu liên kết', HttpStatus.NOT_FOUND);
      }
    }

    throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
  }
}
