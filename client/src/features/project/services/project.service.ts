import axiosClient from "@/lib/axios";
import { BaseResponse } from "@/common/types";
import { IPaginationRequest, IPaginationResponse } from "@/common/interfaces";
import { IProject, IProjectCategory } from "../interfaces";

export const projectService = {
  async createProject(formData: FormData): Promise<BaseResponse<any>> {
    const response = await axiosClient.post<BaseResponse<any>>('/project', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateProject(id: number, formData: FormData): Promise<BaseResponse<any>> {
    const response = await axiosClient.patch<BaseResponse<any>>(`/project/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteProject(id: number): Promise<BaseResponse<any>> {
    const response = await axiosClient.delete<BaseResponse<any>>(`/project/${id}`);
    return response.data
  },

  async getProject(query: IPaginationRequest) {
    const response = await axiosClient.get<BaseResponse<IPaginationResponse<IProject>>>(`/project`, {
      params: query
    })
    return response.data;
  },

  async getProjectById(id: number): Promise<BaseResponse<IProject>> {
    const response = await axiosClient.get<BaseResponse<IProject>>(`/project/${id}`);
    return response.data;
  },
  async getProjectCategories(): Promise<BaseResponse<IProjectCategory[]>> {
    const response = await axiosClient.get<BaseResponse<IProjectCategory[]>>('/project/category');
    return response.data;
  },
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
}