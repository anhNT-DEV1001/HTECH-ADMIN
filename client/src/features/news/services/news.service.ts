import axiosClient from "@/lib/axios"
import { ICreateNews, INews, IUpdateNews } from "../interfaces";
import { BaseResponse } from "@/common/types";
import { IPaginationRequest, IPaginationResponse } from "@/common/interfaces";

export const newsService = {
  async createNews(formData : FormData) : Promise<BaseResponse<any>> {
    const responese = await axiosClient.post<BaseResponse<any>>('/news', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return responese.data;
  },
  async updateNews(id : number, formData: FormData) : Promise<BaseResponse<any>> {
    const response = await axiosClient.patch<BaseResponse<any>>(`/news/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  async deleteNews(id : number) : Promise<BaseResponse<any>> {
    const response = await axiosClient.delete<BaseResponse<any>>(`news/${id}`);
    return response.data;
  },

  async getNews(query : IPaginationRequest) {
    const response = await axiosClient.get<BaseResponse<IPaginationResponse<INews>>>('news' ,{
      params : query
    })
    return response.data;
  },
  async getNewsById(id : number) : Promise<BaseResponse<INews>>{
    const response = await axiosClient.get<BaseResponse<INews>>(`/news/${id}`);
    return response.data
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