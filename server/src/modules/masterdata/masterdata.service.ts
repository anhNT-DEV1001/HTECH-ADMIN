import { Injectable, NotFoundException } from '@nestjs/common';
import { MasterData, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateMasterDataDto, MasterDataFilterDto, UpdateMasterDataDto } from './dto';

@Injectable()
export class MasterdataService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMasterDataDto: CreateMasterDataDto): Promise<MasterData> {
    return this.prisma.masterData.create({
      data: createMasterDataDto,
    });
  }

  async findAll(filter: MasterDataFilterDto) {
    const { dataKey, search, page = 1, limit = 10 } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.MasterDataWhereInput = {};

    if (dataKey) {
      where.dataKey = dataKey;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { dataValue: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [records, total] = await Promise.all([
      this.prisma.masterData.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.masterData.count({ where }),
    ]);

    return {
      records,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / (limit || 10)),
      },
    };
  }

  async findOne(id: number): Promise<MasterData> {
    const masterData = await this.prisma.masterData.findUnique({
      where: { id },
    });

    if (!masterData) {
      throw new NotFoundException(`MasterData with ID ${id} not found`);
    }

    return masterData;
  }

  async update(id: number, updateMasterDataDto: UpdateMasterDataDto): Promise<MasterData> {
    await this.findOne(id);
    return this.prisma.masterData.update({
      where: { id },
      data: updateMasterDataDto,
    });
  }

  async remove(id: number): Promise<MasterData> {
    await this.findOne(id);
    return this.prisma.masterData.delete({
      where: { id },
    });
  }

  async getDataValueByKey(dataKey: string): Promise<MasterData[]> {
    const data = await this.prisma.masterData.findMany({
      where: { dataKey },
      orderBy: { created_at: 'asc' },
    });
    return data;
  }
}
