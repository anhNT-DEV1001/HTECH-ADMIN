import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { ApiError } from 'src/common/apis';
import { UserRole } from '@prisma/client';
import { IPaginationRequest } from 'src/common/interfaces';

@Injectable()
export class UserService {
  constructor (private readonly prisna : PrismaService){}
  
  async getAllUser(query : IPaginationRequest) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'desc',
      orderBy = 'created_at',
    } = query;
    const skip = (page - 1) * limit;
    const take = limit;
    const orderByObject = { [orderBy]: sortBy };
    const [data, count] = await this.prisna.$transaction([
      this.prisna.user.findMany({
        skip,
        take,
        orderBy: orderByObject,
      }),
      this.prisna.user.count(),
    ]);
    return {
      data,
      count,
      page,
      limit,
      totalPage: Math.ceil(count / limit),
    };
  }

  async createUser(dto: UserDto) {
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
        const newUser = await tx.user.create({ data: toCreate });
        if(!newUser) throw new ApiError('Tạo người dùng thất bại !', HttpStatus.BAD_REQUEST);
        const initUserRole = {
          role_id: 1,
          user_id: newUser.id,
        } as UserRole;
        await tx.userRole.create({ data: initUserRole });
        return newUser;
      })
    } catch (error) {
      throw new ApiError('Tạo người dùng thất bại !', HttpStatus.BAD_REQUEST);
    }
  }

  async updateUser(id : number , dto : UserDto) {
    try {
      const user = await this.prisna.user.findUnique({ where: { id } });
      if(!user) throw new ApiError('Người dùng không tồn tại !', HttpStatus.BAD_REQUEST);
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const toUpdate = {
        username: dto.username,
        password: hashedPassword,
        email: dto.email,
        fullName: dto.fullName,
        phone: dto.phone,
        dob: dto.dob,
      }
      const updatedUser = await this.prisna.user.update({ where: { id }, data: toUpdate });
      return updatedUser;
    } catch (error) {
      throw new ApiError('Cập nhật người dùng thất bại !', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUser(id : number) {
    try {
      const user = await this.prisna.user.findUnique({ where: { id } });
      if(!user) throw new ApiError('Người dùng không tồn tại !', HttpStatus.BAD_REQUEST);
      const deletedUser = await this.prisna.user.delete({ where: { id } });
      return deletedUser;
    } catch (error) {
      throw new ApiError('Xóa người dùng thất bại !', HttpStatus.BAD_REQUEST);
    }
  }
}
