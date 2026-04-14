import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';
import { type User } from '@prisma/client';
import { ApiError } from 'src/common/apis';
import { deleteFileFromPublic } from 'src/common/utils';
import { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompanyService(dto: CreateCompanyDto, user: User) {
    try {
      const company = await this.prisma.companyInfo.create({
        data: {
          name: dto.name,
          name_en: dto.name_en,
          email: dto.email,
          email_en: dto.email_en,
          phone: dto.phone,
          phone_en: dto.phone_en,
          address: dto.address,
          address_en: dto.address_en,
          banner: dto.banner || '',
          created_by: user.id,
          updated_by: user.id,
        },
      });

      return company;
    } catch (error: any) {
      throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllCompanyService(query: IPaginationRequest): Promise<IPaginationResponse<any>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: any = {};

    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }

    const [records, total] = await Promise.all([
      this.prisma.companyInfo.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.companyInfo.count({ where }),
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

  async getCompanyByIdService(id: number) {
    const data = await this.prisma.companyInfo.findUnique({ where: { id } });
    if (!data) throw new ApiError('Company information not found', HttpStatus.NOT_FOUND);
    return data;
  }

  async updateCompanyService(dto: UpdateCompanyDto, id: number, user: User) {
    try {
      const company = await this.prisma.companyInfo.findUnique({ where: { id } });
      if (!company) throw new ApiError('Company information not found', HttpStatus.NOT_FOUND);

      let filesToDelete: string[] = [];
      if (dto.banner && dto.banner !== company.banner) {
        if (company.banner) filesToDelete.push(company.banner as any);
      }

      const updatedCompany = await this.prisma.companyInfo.update({
        where: { id },
        data: {
          name: dto.name ?? company.name,
          name_en: dto.name_en ?? company.name_en,
          email: dto.email ?? company.email,
          email_en: dto.email_en ?? company.email_en,
          phone: dto.phone ?? company.phone,
          phone_en: dto.phone_en ?? company.phone_en,
          address: dto.address ?? company.address,
          address_en: dto.address_en ?? company.address_en,
          banner: dto.banner ?? company.banner,
          updated_by: user.id,
          updated_at: new Date(),
        },
      });

      if (updatedCompany) {
        await Promise.all(filesToDelete.map(path => deleteFileFromPublic(path)));
      }

      return updatedCompany;
    } catch (error: any) {
      throw new ApiError(`System Error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCompanyService(id: number) {
    try {
      const company = await this.prisma.companyInfo.findUnique({ where: { id } });
      if (!company) throw new ApiError('Company information not found', HttpStatus.NOT_FOUND);

      if (company.banner) {
        await deleteFileFromPublic(company.banner as any);
      }

      return await this.prisma.companyInfo.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async getPublicInfoService() {
    return this.prisma.companyInfo.findFirst({
      orderBy: { created_at: 'desc' }
    });
  }
}
