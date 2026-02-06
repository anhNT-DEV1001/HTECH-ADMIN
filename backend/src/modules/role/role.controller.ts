import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import type { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';
import { BaseResponse } from 'src/common/apis';
import { Role } from '@prisma/client';
import { CreateRoleDto } from './dto';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UseGuards } from '@nestjs/common';
import { RequirePermissions } from 'src/common/decorators';
import { RoleConstant } from 'src/common/constants';

@Controller('role')
@UseGuards(RoleGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequirePermissions(RoleConstant.VIEW)
  async getRoleController(
    @Query() query : IPaginationRequest,
  ) : Promise<BaseResponse<IPaginationResponse<Role>>> {
    const res = await this.roleService.getAllRoles(query);
    return {
      status : 'success',
      message : 'Lấy danh sách role thành công',
      data : res
    }
  }

  @Get(':id')
  @RequirePermissions(RoleConstant.VIEW)
  async getRoleByIdController(
    @Param('id') id : number,
  ) : Promise<BaseResponse<Role>> {
    const res = await this.roleService.getRoleById(Number(id));
    return {
      status : 'success',
      message : 'Lấy thông tin role thành công',
      data : res
    }
  }

  @Post()
  async createRoleController(
    @Body() dto : CreateRoleDto
  ) : Promise<BaseResponse<Role>> {
    const res = await this.roleService.createRole(dto);
    return {
      status : 'success',
      message : 'Tạo role thành công',
      data : res
    }
  }

  @Patch(':id')
  async updateRoleController(
    @Param('id') id : number,
    @Body() dto : CreateRoleDto
  ) : Promise<BaseResponse<Role>> {
    const res = await this.roleService.updateRole(id, dto);
    return {
      status : 'success',
      message : 'Cập nhật role thành công',
      data : res
    }
  }

  @Delete(':id')
  async deleteRoleController(
    @Param('id') id : number
  ) : Promise<BaseResponse<Role>> {
    const res = await this.roleService.deletedRole(id);
    return {
      status : 'success',
      message : 'Xóa role thành công',
      data : res
    }
  }
}