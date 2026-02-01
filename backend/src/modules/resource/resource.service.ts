import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Resource, ResourceDetail, User } from '@prisma/client';
import { ApiError } from 'src/common/apis';
import { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateResourceDto,
  ResourceDetailDto,
  UpdateResourceWithDetailDto,
} from './dto';
import { IResourceQuery } from './interfaces';

@Injectable()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  async createResource(dto: CreateResourceDto, user: User) {
    const data = {
      alias: dto.alias,
      description: dto.description,
      icon: dto.icon ?? null,
      href: dto.href ?? null,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: user.id,
      updated_by: user.id,
    } as Resource;
    const toCreate = await this.prisma.resource.create({ data });
    if (!toCreate) throw new ApiError('', HttpStatus.BAD_REQUEST);
    return toCreate;
  }

  async createResourceDetail(
    resourceId: number,
    dto: ResourceDetailDto,
    user: User,
  ) {
    if (resourceId) throw new ApiError('', HttpStatus.BAD_REQUEST);
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });
    if (!resource) throw new ApiError('', HttpStatus.BAD_REQUEST);
    const data = {
      alias: dto.alias,
      parent_alias: resource.alias,
      is_active: dto.is_active ?? true,
      icon: dto.icon ?? null,
      herf: dto.href ?? null,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: user.id,
      updated_by: user.id,
    } as ResourceDetail;

    const toCreate = await this.prisma.resourceDetail.create({ data });
    if (!toCreate) throw new ApiError('', HttpStatus.BAD_REQUEST);
    return toCreate;
  }

  async createManyResourceDetail(
    resourceId: number,
    dto: ResourceDetailDto[],
    user: User,
  ) {
    if (!dto || dto.length === 0) {
      throw new ApiError(
        'Danh sách dữ liệu không được để trống',
        HttpStatus.BAD_REQUEST,
      );
    }
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource)
      throw new ApiError(
        'Không tìm thấy tài nguyên cha!',
        HttpStatus.BAD_REQUEST,
      );

    return await this.prisma.$transaction(async (tx) => {
      const dataToCreate = dto.map((item) => ({
        alias: item.alias,
        parent_alias: resource.alias,
        is_active: item.is_active ?? true,
        icon: item.icon ?? null,
        href: item.href ?? null,
        created_by: user.id,
        updated_by: user.id,
      }));

      const result = await tx.resourceDetail.createMany({
        data: dataToCreate,
        skipDuplicates: true,
      });

      return result;
    });
  }

  async updateResourceWithDetail(
    dto: UpdateResourceWithDetailDto,
    user: User,
  ): Promise<Resource> {
    const resource = await this.prisma.resource.findUnique({
      where: { id: dto.id },
    });
    if (!resource)
      throw new ApiError('Không tìm thấy tài nguyên!', HttpStatus.BAD_REQUEST);
    return await this.prisma.$transaction(async (tx) => {
      const updatedResource = await tx.resource.update({
        where: { id: dto.id },
        data: {
          alias: dto.alias,
          description: dto.description,
          icon: dto.icon,
          href: dto.href,
          is_active: dto.is_active,
          updated_by: user.id,
        },
      });

      await tx.resourceDetail.deleteMany({
        where: { parent_alias: resource.alias },
      });
      if (dto.resourceDetails && dto.resourceDetails.length > 0) {
        const detailsToCreate = dto.resourceDetails.map((detail) => ({
          alias: detail.alias,
          parent_alias: updatedResource.alias,
          is_active: detail.is_active,
          icon: detail.icon,
          herf: detail.href,
          created_by: user.id,
          updated_by: user.id,
        }));

        await tx.resourceDetail.createMany({
          data: detailsToCreate,
        });
      }
      return updatedResource;
    });
  }

  async deleteResource(id: number): Promise<Resource> {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new ApiError(
        'Không tìm thấy tài nguyên để xóa!',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.prisma.$transaction(async (tx) => {
      await tx.resourceDetail.deleteMany({
        where: { parent_alias: resource.alias },
      });
      return await tx.resource.delete({
        where: { id },
      });
    });
  }

  async getAllResourcesWithResourceDetail(
    query: IResourceQuery,
  ): Promise<IPaginationResponse<Resource>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      sortBy = 'desc',
      search,
      searchBy,
      is_active = 'all',
    } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: Prisma.ResourceWhereInput = {};
    if (search && searchBy) {
      const validSearchFields = [
        'alias',
        'is_active',
        'updated_by',
        'created_by',
      ];
      const field = validSearchFields.includes(searchBy)
        ? searchBy
        : 'description';
      where[field] = {
        contains: String(search),
        mode: 'insensitive',
      };
    }
    if (is_active === 'true' || is_active === 'false') {
      where.is_active = is_active === 'true' ? true : false;
    }
    const validOrderFields = ['alias', 'created_at', 'updated_at'];
    const orderField = validOrderFields.includes(orderBy)
      ? orderBy
      : 'created_at';
    const orderCondition: Prisma.RoleOrderByWithRelationInput = {
      [orderField]: sortBy.toLocaleLowerCase() === 'desc' ? 'desc' : 'asc',
    };

    const [records, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        skip,
        take,
        orderBy: orderCondition,
        include: {
          resourceDetails: true,
        },
      }),
      this.prisma.resource.count({ where }),
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
}
