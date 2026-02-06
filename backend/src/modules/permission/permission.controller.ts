import { BaseResponse } from 'src/common/apis';
import { PermissionService } from './permission.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { Action, Resource, ResourceDetail, User } from '@prisma/client';
import { AuthUser } from 'src/common/decorators';
import { CreateActionsDto } from './dto';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('action/resource')
  async getActionInResourceController(): Promise<BaseResponse<Resource[]>> {
    console.log('getActionInResourceController');
    const data = await this.permissionService.getActionInResource();
    return {
      status: 'success',
      message: 'Lấy danh sách thao tác trong tài nguyên thành công !',
      data,
    };
  }

  @Get('action/:resourceDetailId')
  async getActionInDetailController(
    @Param('resourceDetailId') resourceDetailId: number,
  ): Promise<BaseResponse<ResourceDetail>> {
    const data =
      await this.permissionService.getActionInDetail(resourceDetailId);
    return {
      status: 'success',
      message: 'Lấy danh sách thao tác trong tài nguyên thành công !',
      data,
    };
  }

  @Delete('action/:id')
  async deleteActionInDetailController(
    @Param('id') id: number,
  ): Promise<BaseResponse<Action>> {
    const data = await this.permissionService.deleteAction(id);
    return {
      status: 'success',
      message: 'Lấy danh sách thao tác trong tài nguyên thành công !',
      data,
    };
  }

  @Post('action')
  async createActionInDetailController(
    @Body() body: CreateActionsDto,
    @AuthUser('user') user: User,
  ): Promise<BaseResponse<any>> {
    const data = await this.permissionService.createActionsInResouceDetail(
      body,
      user,
    );
    return {
      status: 'success',
      message: 'Thêm mới thành công !',
      data,
    };
  }

  @Patch('action')
  async updateActionInDetailController(
    @AuthUser('user') user: User,
    @Body() body: any,
  ): Promise<BaseResponse<Action>> {
    const data = await this.permissionService.updatedActionInResourceDetail(
      body,
      user,
    );
    return {
      status: 'success',
      message: 'Cập nhật thành công !',
      data,
    };
  }

  @Get('user')
  async getUserPermissionController(
    @AuthUser('user') user : User
  ) : Promise<BaseResponse<any>> {
    const data = await this.permissionService.getUserPermission(user.id);
    return {
      status: 'success',
      message: 'Lấy danh sách thao tác trong tài nguyên thành công !',
      data,
    };
  }

  @Get('role/:roleId')
  async getRolePermissionController(
    @Param('roleId') roleId: number,
  ): Promise<BaseResponse<any>> {
    const data = await this.permissionService.getRoleGroupPermission(roleId);
    return {
      status: 'success',
      message: 'Lấy danh sách thao tác trong tài nguyên thành công !',
      data,
    };
  }

  @Post('role/:roleId')
  async saveRoleGroupPermissionController(
    @Param('roleId') roleId: number,
    @Body() body: {actionIds : number[]},
    @AuthUser('user') user: User,
  ): Promise<BaseResponse<any>> {
    const data = await this.permissionService.saveRoleGroupPermission(
      roleId,
      body.actionIds,
      user,
    );
    return {
      status: 'success',
      message: 'Lưu danh sách thao tác trong tài nguyên thành công !',
      data,
    };
  }

  @Get('user/:id')
  async getUserPermissionByUserIdController(
    @Param('id') id: number,
  ): Promise<BaseResponse<any>> {
    const data = await this.permissionService.getUserPermission(id);
    return {
      status: 'success',
      message: 'Lấy danh sách thao tác trong tài nguyên thành công !',
      data,
    };
  }
}
