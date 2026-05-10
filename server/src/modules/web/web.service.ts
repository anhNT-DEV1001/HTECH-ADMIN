import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ApiError } from 'src/common/apis';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateWebDto, UpdateWebDto } from './dto';

@Injectable()
export class WebService {
  constructor(private readonly prisma: PrismaService) {}

  async createWebService(dto: CreateWebDto) {
    try {
      const existingWeb = await this.prisma.web.findUnique({
        where: { alias: dto.alias },
      });

      if (existingWeb) {
        throw new ApiError('Alias website đã tồn tại', HttpStatus.BAD_REQUEST);
      }

      return await this.prisma.web.create({
        data: {
          name: dto.name,
          alias: dto.alias,
          url: dto.url,
        },
      });
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllWebService() {
    return await this.prisma.web.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async updateWebService(id: number, dto: UpdateWebDto) {
    try {
      const web = await this.prisma.web.findUnique({ where: { id } });
      if (!web) throw new ApiError('Website không tồn tại', HttpStatus.NOT_FOUND);

      if (dto.alias && dto.alias !== web.alias) {
        const existingWeb = await this.prisma.web.findUnique({
          where: { alias: dto.alias },
        });

        if (existingWeb) {
          throw new ApiError('Alias website đã tồn tại', HttpStatus.BAD_REQUEST);
        }
      }

      return await this.prisma.web.update({
        where: { id },
        data: {
          name: dto.name ?? web.name,
          alias: dto.alias ?? web.alias,
          url: dto.url ?? web.url,
        },
      });
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteWebService(id: number) {
    try {
      const web = await this.prisma.web.findUnique({ where: { id } });
      if (!web) throw new ApiError('Website không tồn tại', HttpStatus.NOT_FOUND);

      return await this.prisma.web.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof ApiError) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ApiError(
          'Không thể xóa website vì đang có dữ liệu liên kết',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
