import { IPaginationRequest, IPaginationResponse } from "@/common/interfaces";
import { BaseResponse } from "@/common/types";
import { ICreateRoleRequest, IRole } from "../interfaces";
import axiosClient from "@/apis/axios";

export const roleService = {
  async getAllRoles(query : IPaginationRequest) : Promise<BaseResponse<IPaginationResponse<IRole>>> {
    const response = await axiosClient.get<
      BaseResponse<IPaginationResponse<IRole>>
    >("/role", {
      params: query,
    });
    return response.data;
  },

  async getRoleById(id : number) : Promise<BaseResponse<IRole>> {
    const response = await axiosClient.get<BaseResponse<IRole>>(`/role/${id}`);
    return response.data;
  },

  async createRole (body : ICreateRoleRequest) : Promise<BaseResponse<IRole>> {
    const response = await axiosClient.post<BaseResponse<IRole>>("/role", body);
    return response.data;
  },

  async updateRole (id : number, body : ICreateRoleRequest) : Promise<BaseResponse<IRole>> {
    const response = await axiosClient.patch<BaseResponse<IRole>>(`/role/${id}`, body);
    return response.data;
  },

  async deleteRole (id : number) : Promise<BaseResponse<IRole>> {
    const response = await axiosClient.delete<BaseResponse<IRole>>(`/role/${id}`);
    return response.data;
  }
}