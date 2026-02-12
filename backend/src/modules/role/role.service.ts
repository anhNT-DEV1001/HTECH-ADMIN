import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { ApiError } from 'src/common/apis';
import { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RoleService {
  constructor(private readonly prismaService : PrismaService) {}
  async createRole(dto : CreateRoleDto ) : Promise<Role> {
    try {
      // Kiểm tra name đã tồn tại chưa
      const existingRole = await this.prismaService.role.findUnique({
        where: { name: dto.name }
      });
      if(existingRole) throw new ApiError('Tên quyền này đã tồn tại', HttpStatus.CONFLICT);

      const data = {
        name: dto.name.trim(),
        description : dto.description?.trim() || '',
      } as Role;
      const role = await this.prismaService.role.create({ data });
      if(!role) throw new ApiError('Tạo mới role thất bại', HttpStatus.BAD_REQUEST);
      return role;
    } catch (error: any) {
      if(error instanceof ApiError) throw error;
      if(error.code === 'P2002') {
        throw new ApiError('Tên quyền này đã tồn tại', HttpStatus.CONFLICT);
      }
      throw new ApiError('Lỗi khi tạo role: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateRole(id : number , dto : UpdateRoleDto) : Promise<Role> {
    try {
      const role = await this.prismaService.role.findUnique({
        where : {id}
      });
      if(!role) throw new ApiError('Role không tồn tại', HttpStatus.NOT_FOUND);

      // Kiểm tra nếu cập nhật name, có bị trùng với role khác không
      if(dto.name && dto.name !== role.name) {
        const existingRole = await this.prismaService.role.findUnique({
          where: { name: dto.name }
        });
        if(existingRole) throw new ApiError('Tên quyền này đã tồn tại', HttpStatus.CONFLICT);
      }

      const data = {
        name: dto.name ? dto.name.trim() : role.name,
        description : dto.description ? dto.description.trim() : role.description,
        updated_at : new Date(),
      } as Role;
      const updatedRole = await this.prismaService.role.update({
        where : {id},
        data
      });

      if(!updatedRole) throw new ApiError('Cập nhật role thất bại', HttpStatus.BAD_REQUEST);
      return updatedRole;
    } catch (error: any) {
      if(error instanceof ApiError) throw error;
      if(error.code === 'P2002') {
        throw new ApiError('Tên quyền này đã tồn tại', HttpStatus.CONFLICT);
      }
      throw new ApiError('Lỗi khi cập nhật role: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deletedRole(id : number) : Promise<Role> {
    try {
      const role = await this.prismaService.role.findUnique({
        where : {id}
      });
      if(!role) throw new ApiError('Role không tồn tại', HttpStatus.NOT_FOUND);

      const deletedRole =  await this.prismaService.role.delete({
        where : {id}
      });
      if(!deletedRole) throw new ApiError('Xoá role thất bại', HttpStatus.BAD_REQUEST);
      return deletedRole;
    } catch (error: any) {
      if(error instanceof ApiError) throw error;
      if(error.code === 'P2025') {
        throw new ApiError('Role không tồn tại', HttpStatus.NOT_FOUND);
      }
      if(error.code === 'P2014') {
        throw new ApiError('Không thể xoá role vì có người dùng đang sử dụng', HttpStatus.CONFLICT);
      }
      throw new ApiError('Lỗi khi xoá role: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllRoles(query: IPaginationRequest) : Promise<IPaginationResponse<Role>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      sortBy = 'desc',
      search,
      searchBy = 'name',
    } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where : Prisma.RoleWhereInput = {};
    if(search && searchBy) {
      const validSearchFields = ['name', 'description'];
      const field = validSearchFields.includes(searchBy) ? searchBy : 'name';
      where[field] = {
        contains : String(search),
        mode : 'insensitive',
      }
    }
    const validOrderFields = ['id', 'name', 'description', 'created_at', 'updated_at'];
    const orderField = validOrderFields.includes(orderBy) ? orderBy : 'created_at';
    const orderCondition : Prisma.RoleOrderByWithRelationInput = {
      [orderField] : sortBy.toLowerCase() === 'desc' ? 'desc' : 'asc'
    };
    const [records , total] = await Promise.all([
      this.prismaService.role.findMany({
        where,
        skip,
        take,
        orderBy: orderCondition
      }),
      this.prismaService.role.count({ where })
    ]);

    return {
      records,
      meta : {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      }
    }
  }

  async getUserRole(userId : number) {
    const data = await this.prismaService.userRole.findMany({
      where : {user_id: userId},
      include : {
        role : {
          include : {
            roleGroupPermission : {
              include : {
                action : true
              }
            }
          }
        },
        userPermission : {
          include : {
            action : true
          }
        }
      }
    })
    return data;
  }

  async getRoleById (id : number)  : Promise<Role> {
    const data = await this.prismaService.role.findUnique({
      where: {id},
      include : {
        roleGroupPermission : {
          include : {
            action : true
          }
        }
      }
    });
    if(!data) throw new ApiError('Không tìm thấy role', HttpStatus.NOT_FOUND);
    return data;
  }
}
