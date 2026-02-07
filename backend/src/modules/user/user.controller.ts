import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import type { IPaginationRequest } from 'src/common/interfaces';
import { UserDto } from './dto';

@Controller('user')
export class UserController {
  constructor (private readonly userService : UserService){}
  
  @Get()
  async getAllUser(@Query() query : IPaginationRequest) {
    return this.userService.getAllUser(query);
  }

  @Post()
  async createUser(@Body() dto : UserDto) {
    return this.userService.createUser(dto);
  }

  @Patch(':id')
  async updateUser(@Param('id') id : number , @Body() dto : UserDto) {
    return this.userService.updateUser(id , dto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id : number) {
    return this.userService.deleteUser(id);
  }
}
