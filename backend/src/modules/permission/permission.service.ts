import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateActionDto, CreateActionsDto } from './dto';
import { ApiError } from 'src/common/apis';
import { Action, ResourceDetail, User } from '@prisma/client';
import { ResourceService } from '../resource/resource.service';

@Injectable()
export class PermissionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly resourceService: ResourceService,
  ) {}

  async createActionsInResouceDetail(dto: CreateActionsDto, user: User) {
    const resourceDetail = await this.prismaService.resourceDetail.findUnique({
      where: { id: dto.resourceDetail.id },
    });
    if (!resourceDetail)
      throw new ApiError('Không tìm thấy tài nguyên !', HttpStatus.BAD_REQUEST);
    const dataActions = dto.actions.map(
      (item) =>
        ({
          action: item.action,
          resource_detail_alias: resourceDetail.alias,
          created_by: user.id,
          updated_by: user.id,
        }) as Action,
    );

    return await this.prismaService.$transaction(async (tx) => {
      const result = await tx.action.createMany({
        data: dataActions,
        skipDuplicates: true,
      });

      return result;
    });
  }

  async updatedActionInResourceDetail(dto: any, user: User): Promise<Action> {
    const action = await this.prismaService.action.findUnique({
      where: { id: dto.id },
    });

    if (!action)
      throw new ApiError('Không tìm thấy thao tác !', HttpStatus.BAD_REQUEST);
    const actionToUpdate = {
      action: dto.action,
      updated_by: user.id,
    } as Action;

    const updatedAction = await this.prismaService.action.update({
      where: { id: dto.id },
      data: actionToUpdate,
    });

    if (!updatedAction)
      throw new ApiError(
        'Cập nhật thao tác thất bại !',
        HttpStatus.BAD_REQUEST,
      );

    return updatedAction;
  }

  async deleteAction(id: number): Promise<Action> {
    const action = await this.prismaService.action.delete({
      where: { id },
    });
    if (!action)
      throw new ApiError('Xóa thao tác thất bại !', HttpStatus.BAD_REQUEST);
    return action;
  }

  async getActionInDetail(resourceDetailId: number): Promise<ResourceDetail> {
    const data =
      await this.resourceService.getActionInResourceDetail(resourceDetailId);
    if (!data)
      throw new ApiError(
        'Không tìm thấy dữ liệu thao tác trong tài nguyên này',
        HttpStatus.BAD_REQUEST,
      );

    return data;
  }
}
