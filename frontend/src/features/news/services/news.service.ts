import axiosClient from "@/apis/axios"
import { ICreateNews, INews, IUpdateNews } from "../interfaces";
import { BaseResponse } from "@/common/types";
import { IPaginationRequest, IPaginationResponse } from "@/common/interfaces";

export const newsService = {
  async createNews(body : ICreateNews) : Promise<BaseResponse<any>> {
    const responese = await axiosClient.post<BaseResponse<any>>('/news' , body);
    return responese.data;
  },
  async updateNews(id : number, body: IUpdateNews) : Promise<BaseResponse<any>> {
    const response = await axiosClient.patch<BaseResponse<any>>(`/news/${id}` , body);
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
  }
}