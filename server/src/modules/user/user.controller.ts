import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import type { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';
import { UpdateUserDto, UserDto } from './dto';
import { IAuthResponse } from '../auth/interfaces';
import { BaseResponse } from 'src/common/apis';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor (private readonly userService : UserService){}
  
  @Get()
  async getAllUser(@Query() query : IPaginationRequest) : Promise<BaseResponse<IPaginationResponse<IAuthResponse>>>{
    const data = await this.userService.getAllUser(query);
    return {
      status : 'success',
      message : 'Lấy danh sách người dùng thành công !',
      data : data
    };
  }

  @Post()
  async createUser(@Body() dto : UserDto) : Promise<BaseResponse<IAuthResponse>>{
    const data = await this.userService.createUser(dto);
    return {
      status : 'success',
      message : 'Thêm mới người dùng thành công !',
      data : data
    };
  }

  @Patch(':id')
  async updateUser(@Param('id') id : number , @Body() dto : UpdateUserDto) : Promise<BaseResponse<IAuthResponse>>{
    const data = await this.userService.updateUser(id , dto);
    return {
      status : 'success',
      message : 'Cập nhật người dùng thành công !',
      data : data
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id : number) : Promise<BaseResponse<IAuthResponse>>{
    const data = await this.userService.deleteUser(id);
    return {
      status : 'success',
      message : 'Xóa người dùng thành công !',
      data : data
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id : number) : Promise<BaseResponse<IAuthResponse>>{
    const data = await this.userService.getUserById(id);
    return {
      status : 'success',
      message : 'Lấy người dùng thành công !',
      data : data
    };
  }
}
