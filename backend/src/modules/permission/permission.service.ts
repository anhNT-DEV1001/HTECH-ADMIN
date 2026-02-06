import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateActionDto, CreateActionsDto } from './dto';
import { ApiError } from 'src/common/apis';
import { Action, Resource, ResourceDetail, RoleGroupPermission, User, UserPermission } from '@prisma/client';
import { ResourceService } from '../resource/resource.service';
import { RoleService } from '../role/role.service';
import { IPermission } from '../auth/interfaces';

@Injectable()
export class PermissionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly resourceService: ResourceService,
    private readonly roleService : RoleService
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

  async getActionInResource(): Promise<Resource[]> {
    const data = await this.resourceService.getResourceAction();
    return data;
  }

  async saveRoleGroupPermission(roleId : number , actionIds : number[] , user : User) {
    try {
      const uniqueActionIds = [...new Set(actionIds)];
      const isExist = await this.prismaService.action.findMany({
        where : {id : {in : uniqueActionIds}}
      })
      if(isExist.length !== uniqueActionIds.length) {
        throw new ApiError('Thao tác không hợp lệ !', HttpStatus.BAD_REQUEST);
      }
      const role = await this.roleService.getRoleById(roleId);
      const roleGroupPermissions = await this.prismaService.roleGroupPermission.findMany({
        where : {role_name : role.name}
      });
      if(roleGroupPermissions && roleGroupPermissions.length > 0) {
        // update
        const roleGroupPermissionIds = roleGroupPermissions.map((item) => item.action_id);
        const newActions = uniqueActionIds.filter((item) => !roleGroupPermissionIds.includes(item));
        const deletedActions = roleGroupPermissionIds.filter((item) => !uniqueActionIds.includes(item));
        const updatedActions = uniqueActionIds.filter((item) => roleGroupPermissionIds.includes(item));

        await this.prismaService.$transaction(async (tx) => {
          if(newActions.length > 0) {
            const newActionsData = newActions.map((item) => {
              return {
                action_id : item,
                role_name : role.name,
                created_by : user.id,
                updated_by : user.id,
              } as RoleGroupPermission
            })
            await tx.roleGroupPermission.createMany({
              data : newActionsData
            });
          }
          if(deletedActions.length > 0) {
            await tx.roleGroupPermission.deleteMany({
              where : {
                action_id : {
                  in : deletedActions
                },
                role_name : role.name
              }
            });
          }
          if(updatedActions.length > 0) {
            // Fix: updateMany data must be an object, not array. 
            // Since we are only updating 'updated_by' and 'role_name' is constraint, this updates all matches.
            await tx.roleGroupPermission.updateMany({
              where : {
                action_id : {
                  in : updatedActions
                },
                role_name : role.name
              },
              data : {
                updated_by: user.id
              }
            });
          }
        });
      }else {
        // create 
        await this.prismaService.$transaction(async (tx) => {
          const roleGroupPermissionData = uniqueActionIds.map((item) => {
            return {
              action_id : item,
              role_name : role.name,
              created_by : user.id,
              updated_by : user.id,
            } as RoleGroupPermission
          })
          await tx.roleGroupPermission.createMany({
            data : roleGroupPermissionData
          });
        });
      }
    } catch (error) {
      throw new ApiError(
        'Cập nhật quyền thất bại !',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  async getRoleGroupPermission(roleId : number) {
    const role = await this.roleService.getRoleById(roleId);
    const actions = await this.prismaService.action.findMany();
    const roleGroupPermission = await this.prismaService.roleGroupPermission.findMany({
      where : {role_name : role.name}
    });
    const roleGroupPermissionIds = roleGroupPermission.map((item) => item.action_id);
    const actionsWithIsActive = actions.map((item) => {
      return {
        ...item,
        is_active : roleGroupPermissionIds.includes(item.id)
      }
    });
    const resourceDtails = await this.prismaService.resourceDetail.findMany({
      include : {
        actions : true
      }
    })
    const actionsByResourceDetails = resourceDtails.map((item) => {
      return {
        ...item,
        actions : actionsWithIsActive.filter((action) => action.resource_detail_alias === item.alias)
      }
    });
    return actionsByResourceDetails;
  }

  async saveUserPermission(userId : number , actionIds: number[]) {
    try {
      const uniqueActionIds = [...new Set(actionIds)];
      const isExist = await this.prismaService.action.findMany({
        where : {id : {in : uniqueActionIds}}
      })
      if(isExist.length !== uniqueActionIds.length) {
        throw new ApiError('Thao tác không hợp lệ !', HttpStatus.BAD_REQUEST);
      }
      const user = await this.prismaService.user.findUnique({
        where : {id : userId},
      });
      const userRole = await this.prismaService.userRole.findUnique({
        where : {user_id : userId}
      });
      if(!user) {
        throw new ApiError('Không tìm thấy người dùng!', HttpStatus.BAD_REQUEST);
      }
      if(!userRole) {
        throw new ApiError('Không tìm thấy vai trò người dùng!', HttpStatus.BAD_REQUEST);
      }
      const userPermissions = await this.prismaService.userPermission.findMany({
        where : {user_role : userRole.id}
      });
      if(userPermissions && userPermissions.length > 0) {
        // update
        const userPermissionIds = userPermissions.map((item) => item.action_id);
        const newActions = uniqueActionIds.filter((item) => !userPermissionIds.includes(item));
        const deletedActions = userPermissionIds.filter((item) => !uniqueActionIds.includes(item));
        // const updatedActions = uniqueActionIds.filter((item) => userPermissionIds.includes(item)); 
        // updatedActions don't need update if no metadata fields

        await this.prismaService.$transaction(async (tx) => {
          if(newActions.length > 0) {
            const newActionsData = newActions.map((item) => {
              return {
                action_id : item,
                user_role : userRole.id,
              } as UserPermission
            })
            await tx.userPermission.createMany({
              data : newActionsData
            });
          }
          if(deletedActions.length > 0) {
            await tx.userPermission.deleteMany({
              where : {
                action_id : {
                  in : deletedActions
                },
                user_role : userRole.id
              }
            });
          }
          // Removing updatedActions block as it was invalid (array data) and seemingly redundant.
        });
      }else {
        // create 
        await this.prismaService.$transaction(async (tx) => {
          const userPermissionData = uniqueActionIds.map((item) => {
            return {
              action_id : item,
              user_role : userRole.id,
            } as UserPermission
          })
          await tx.userPermission.createMany({
            data : userPermissionData
          });
        });
      }
    } catch (error) {
      throw new ApiError(
        'Cập nhật quyền thất bại !',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  async getUserPermission(userId : number) : Promise<IPermission[]> {
    const user = await this.prismaService.user.findUnique({
      where : {id : userId}
    });
    if(!user) {
      throw new ApiError('Không tìm thấy người dùng!', HttpStatus.BAD_REQUEST);
    }
    const userRole = await this.prismaService.userRole.findUnique({
      where : {user_id : userId},
      include : {
        role: true
      }
    });
    if(!userRole) {
      throw new ApiError('Không tìm thấy vai trò người dùng!', HttpStatus.BAD_REQUEST);
    }
    
    const userPermissions = await this.prismaService.userPermission.findMany({
      where : {user_role : userRole.id}
    });
    const userPermissionIds = userPermissions.map((item) => item.action_id);
    const roleGroupPermission = await this.prismaService.roleGroupPermission.findMany({
      where : {role_name : userRole.role.name}
    });
    const roleGroupPermissionIds = roleGroupPermission.map((item) => item.action_id);
    const allActiveActionIds = [...new Set([...userPermissionIds, ...roleGroupPermissionIds])];

    const actions = await this.prismaService.action.findMany();

    const resourceDtails = await this.prismaService.resourceDetail.findMany({
      include : {
        actions : true
      }
    })
        const actionsByResourceDetails = resourceDtails.map((item) => {
      return {
        ...item,
        actions : actions.filter((action) => action.resource_detail_alias === item.alias).map((action) => {
          return {
            ...action,
            is_active : allActiveActionIds.includes(action.id)
          }
        })
      }
    });

    return actionsByResourceDetails as IPermission[];
  }
}