import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto, UserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { ApiError } from 'src/common/apis';
import { Prisma, UserRole } from '@prisma/client';
import { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';
import { IAuthResponse } from '../auth/interfaces';

@Injectable()
export class UserService {
  constructor (private readonly prisna : PrismaService){}
  
  async getAllUser(query : IPaginationRequest) : Promise<IPaginationResponse<IAuthResponse>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'desc',
      orderBy = 'created_at',
      search = '',
      searchBy = 'fullName'
    } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where : Prisma.UserWhereInput = {};
    if(search && searchBy){
      const validSearchFields = ['username', 'fullName', 'email', 'phone'];
      const field = validSearchFields.includes(searchBy) ? searchBy : 'fullName';
      where[field] = {
        contains: String(search),
        mode: 'insensitive',
      };
    }
    const validOrderFields = ['id', 'username', 'email', 'fullName', 'phone', 'dob', 'created_at', 'updated_at'];
    const orderField = validOrderFields.includes(orderBy) ? orderBy : 'created_at';
    const orderByObject = { [orderField]: sortBy.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    
    const [data, count] = await this.prisna.$transaction([
      this.prisna.user.findMany({
        where,
        skip,
        take,
        orderBy: orderByObject as any,
        select : {
          id : true,
          username : true,
          email : true,
          fullName : true,
          phone : true,
          dob : true,
          created_at : true,
          updated_at : true,
        }
      }),
      this.prisna.user.count({where}),
    ]);
    return {
      records: data as IAuthResponse[],
      meta : {
        total : count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      }
    };
  }

  async createUser(dto: UserDto) : Promise<IAuthResponse | any> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    try {
      await this.prisna.$transaction( async (tx) => {
        const toCreate = {
          username: dto.username,
          password: hashedPassword,
          email: dto.email,
          fullName: dto.fullName,
          phone: dto.phone,
          dob: dto.dob,
        }
        const newUser = await tx.user.create({ 
          data: toCreate,
          select : {
            id : true,
            username : true,
            email : true,
            fullName : true,
            phone : true,
            dob : true,
            created_at : true,
            updated_at : true,
          }
        });
        if(!newUser) throw new ApiError('Tạo người dùng thất bại !', HttpStatus.BAD_REQUEST);
        const initUserRole = {
          role_id: 1,
          user_id: newUser.id,
        } as UserRole;
        await tx.userRole.create({ data: initUserRole });
        return newUser as IAuthResponse;
      })
    } catch (error) {
      throw new ApiError('Tạo người dùng thất bại !', HttpStatus.BAD_REQUEST);
    }
  }

  async updateUser(id : number , dto : UpdateUserDto) : Promise<IAuthResponse> {
    try {
      const user = await this.prisna.user.findUnique({ where: { id } });
      if(!user) throw new ApiError('Người dùng không tồn tại !', HttpStatus.BAD_REQUEST);
      let hashedPassword = '';
      if(dto.password && dto.password !== ''){
        hashedPassword = await bcrypt.hash(dto.password, 10);
      }
      const toUpdate = {
        username: dto.username,
        password: hashedPassword !== '' ? hashedPassword : user.password,
        email: dto.email,
        fullName: dto.fullName,
        phone: dto.phone,
        dob: dto.dob,
      }
      const updatedUser = await this.prisna.user.update({ where: { id }, data: toUpdate });
      return updatedUser as IAuthResponse;
    } catch (error) {
      throw new ApiError('Cập nhật người dùng thất bại !', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUser(id : number) : Promise<IAuthResponse> {
    try {
      const user = await this.prisna.user.findUnique({ where: { id } });
      if(!user) throw new ApiError('Người dùng không tồn tại !', HttpStatus.BAD_REQUEST);
      await this.prisna.userRole.delete({ where: { user_id: id } });
      await this.prisna.token.delete({ where: { user_id: id } });
      const deletedUser = await this.prisna.user.delete({ 
        where: { id },
        select : {
          id : true,
          username : true,
          email : true,
          fullName : true,
          phone : true,
          dob : true,
          created_at : true,
          updated_at : true,
        }
      });
      return deletedUser as IAuthResponse;
    } catch (error) {
      throw new ApiError('Xóa người dùng thất bại !', HttpStatus.BAD_REQUEST);
    }
  }

  async getUserById(id : number) : Promise<IAuthResponse> {
    try {
      const user = await this.prisna.user.findUnique({ where: { id }, 
        select : {
          id : true,
          username : true,
          email : true,
          fullName : true,
          phone : true,
          dob : true,
          created_at : true,
          updated_at : true,
        }
      });
      if(!user) throw new ApiError('Người dùng không tồn tại !', HttpStatus.BAD_REQUEST);
      return user as IAuthResponse;
    } catch (error) {
      throw new ApiError('Lấy người dùng thất bại !', HttpStatus.BAD_REQUEST);
    }
  }
}
