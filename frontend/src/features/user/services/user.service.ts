import axiosClient from "@/apis/axios";
import { IPaginationRequest, IPaginationResponse } from "@/common/interfaces";
import { BaseResponse } from "@/common/types";
import { IUserForm, IUserResponse } from "../interfaces/user.interface";

export const userService = {
  async getAllUsers(query? : IPaginationRequest) : Promise<BaseResponse<IPaginationResponse<IUserResponse>>> {
    const response = await axiosClient.get<BaseResponse<IPaginationResponse<IUserResponse>>>('user', {
      params : query
    });
    return response.data;
  },
  async createUser(body : IUserForm) : Promise<BaseResponse<IUserResponse>> {
    const response = await axiosClient.post<BaseResponse<IUserResponse>>('user', body);
    return response.data;
  },
  async updateUser(id : number, body : IUserForm) : Promise<BaseResponse<IUserResponse>> {
    const response = await axiosClient.patch<BaseResponse<IUserResponse>>(`user/${id}`, body);
    return response.data;
  },
  async deleteUser(id : number) : Promise<BaseResponse<void>> {
    const response = await axiosClient.delete<BaseResponse<void>>(`user/${id}`);
    return response.data;
  },
  async getUserById(id : number) : Promise<BaseResponse<IUserResponse>> {
    const response = await axiosClient.get<BaseResponse<IUserResponse>>(`user/${id}`);
    return response.data;
  }
}