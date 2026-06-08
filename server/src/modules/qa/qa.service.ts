import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ApiError } from 'src/common/apis';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  CreateQACategoryDto,
  CreateQADto,
  UpdateQACategoryDto,
  UpdateQADto,
} from './dto';

@Injectable()
export class QaService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly qaCategoryInclude = {
    web: true,
    qas: {
      include: {
        category: {
          include: {
            web: true,
          },
        },
      },
      orderBy: { id: 'asc' as const },
    },
  } satisfies Prisma.QACategoryInclude;

  private readonly qaInclude = {
    category: {
      include: {
        web: true,
      },
    },
  } satisfies Prisma.QAInclude;

  async getAllQACategoriesService() {
    return await this.prisma.qACategory.findMany({
      include: this.qaCategoryInclude,
      orderBy: [{ web_id: 'asc' }, { id: 'asc' }],
    });
  }

  async getQACategoriesByWebIdService(webId: number) {
    return await this.prisma.qACategory.findMany({
      where: { web_id: webId },
      include: this.qaCategoryInclude,
      orderBy: { id: 'asc' },
    });
  }

  async getPublicQACategoriesByWebIdService(webId: number) {
    if (!webId || Number.isNaN(webId)) {
      throw new ApiError('web_id không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    return await this.prisma.qACategory.findMany({
      where: { web_id: webId },
      include: this.qaCategoryInclude,
      orderBy: { id: 'asc' },
    });
  }

  async createQACategoryService(dto: CreateQACategoryDto) {
    try {
      return await this.prisma.qACategory.create({
        data: {
          name_vn: dto.name_vn,
          name_en: dto.name_en || '',
          web: { connect: { id: dto.web_id } },
        },
        include: this.qaCategoryInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error, 'Website liên kết không hợp lệ');
    }
  }

  async updateQACategoryService(id: number, dto: UpdateQACategoryDto) {
    try {
      const category = await this.prisma.qACategory.findUnique({ where: { id } });
      if (!category) throw new ApiError('QA category không tồn tại', HttpStatus.NOT_FOUND);

      return await this.prisma.qACategory.update({
        where: { id },
        data: {
          name_vn: dto.name_vn ?? category.name_vn,
          name_en: dto.name_en ?? category.name_en,
          web: dto.web_id !== undefined ? { connect: { id: dto.web_id } } : undefined,
        },
        include: this.qaCategoryInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error, 'Website liên kết không hợp lệ');
    }
  }

  async deleteQACategoryService(id: number) {
    try {
      const category = await this.prisma.qACategory.findUnique({
        where: { id },
        include: { qas: { select: { id: true } } },
      });

      if (!category) throw new ApiError('QA category không tồn tại', HttpStatus.NOT_FOUND);
      if (category.qas.length > 0) {
        throw new ApiError('Không thể xóa QA category vì đang có QA liên kết', HttpStatus.BAD_REQUEST);
      }

      return await this.prisma.qACategory.delete({
        where: { id },
        include: this.qaCategoryInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error, 'Không thể xóa QA category vì đang có QA liên kết');
    }
  }

  async getAllQAService(filter: { web_id?: number; category_id?: number }) {
    const where: Prisma.QAWhereInput = {};

    if (filter.category_id !== undefined) {
      where.category_id = filter.category_id;
    }

    if (filter.web_id !== undefined) {
      where.category = {
        web_id: filter.web_id,
      };
    }

    return await this.prisma.qA.findMany({
      where,
      include: this.qaInclude,
      orderBy: [{ category_id: 'asc' }, { id: 'asc' }],
    });
  }

  async getQAByCategoryIdService(categoryId: number) {
    return await this.prisma.qA.findMany({
      where: { category_id: categoryId },
      include: this.qaInclude,
      orderBy: { id: 'asc' },
    });
  }

  async createQAService(dto: CreateQADto) {
    try {
      return await this.prisma.qA.create({
        data: {
          category: { connect: { id: dto.category_id } },
          question_vn: dto.question_vn,
          question_en: dto.question_en || '',
          ans_vn: dto.ans_vn || '',
          ans_en: dto.ans_en || '',
        },
        include: this.qaInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error, 'QA category liên kết không hợp lệ');
    }
  }

  async updateQAService(id: number, dto: UpdateQADto) {
    try {
      const qa = await this.prisma.qA.findUnique({ where: { id } });
      if (!qa) throw new ApiError('QA không tồn tại', HttpStatus.NOT_FOUND);

      return await this.prisma.qA.update({
        where: { id },
        data: {
          category: dto.category_id !== undefined ? { connect: { id: dto.category_id } } : undefined,
          question_vn: dto.question_vn ?? qa.question_vn,
          question_en: dto.question_en ?? qa.question_en,
          ans_vn: dto.ans_vn ?? qa.ans_vn,
          ans_en: dto.ans_en ?? qa.ans_en,
        },
        include: this.qaInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error, 'QA category liên kết không hợp lệ');
    }
  }

  async deleteQAService(id: number) {
    try {
      const qa = await this.prisma.qA.findUnique({ where: { id } });
      if (!qa) throw new ApiError('QA không tồn tại', HttpStatus.NOT_FOUND);

      return await this.prisma.qA.delete({
        where: { id },
        include: this.qaInclude,
      });
    } catch (error: any) {
      this.throwHandledError(error);
    }
  }

  private throwHandledError(error: any, fallbackMessage?: string): never {
    if (error instanceof ApiError) throw error;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
