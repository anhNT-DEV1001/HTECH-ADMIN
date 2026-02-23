import { BaseResponse } from "@/common/types";
import { IPermission } from "../interfaces";
import axiosClient from "@/lib/axios";

export const permissionService = {
  async getAllPermissionByRole(roleId : number) : Promise<BaseResponse<IPermission[]>> {
    const response = await axiosClient.get<BaseResponse<IPermission[]>>(`/permission/role/${roleId}`);
    return response.data;
  },

  async savePermissionByRole(roleId : number, actions : number[]) : Promise<BaseResponse<IPermission[]>> {
    const response = await axiosClient.post<BaseResponse<IPermission[]>>(`/permission/role/${roleId}`, { actionIds: actions });
    return response.data;
  },

  async getAllPermissionByUser(userId : number) : Promise<BaseResponse<IPermission[]>> {
    const response = await axiosClient.get<BaseResponse<IPermission[]>>(`/permission/user/${userId}`);
    return response.data;
  },

  async savePermissionByUser(userId : number, actions : number[]) : Promise<BaseResponse<IPermission[]>> {
    const response = await axiosClient.post<BaseResponse<IPermission[]>>(`/permission/user/${userId}`, { actionIds: actions });
    return response.data;
  }
}