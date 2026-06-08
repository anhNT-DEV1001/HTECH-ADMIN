import type { BaseResponse } from "@/common/types";
import axiosClient from "@/lib/axios";
import type {
  ICreateQA,
  ICreateQACategory,
  IQA,
  IQACategory,
  IUpdateQA,
  IUpdateQACategory,
} from "../interfaces";

export const qaService = {
  async getQACategories(): Promise<BaseResponse<IQACategory[]>> {
    const response = await axiosClient.get<BaseResponse<IQACategory[]>>("/qa/category");
    return response.data;
  },

  async getQACategoriesByWeb(webId: number): Promise<BaseResponse<IQACategory[]>> {
    const response = await axiosClient.get<BaseResponse<IQACategory[]>>(`/qa/category/web/${webId}`);
    return response.data;
  },

  async createQACategory(body: ICreateQACategory): Promise<BaseResponse<IQACategory>> {
    const response = await axiosClient.post<BaseResponse<IQACategory>>("/qa/category", body);
    return response.data;
  },

  async updateQACategory({ id, ...body }: IUpdateQACategory): Promise<BaseResponse<IQACategory>> {
    const response = await axiosClient.patch<BaseResponse<IQACategory>>(`/qa/category/${id}`, body);
    return response.data;
  },

  async deleteQACategory(id: number): Promise<BaseResponse<IQACategory>> {
    const response = await axiosClient.delete<BaseResponse<IQACategory>>(`/qa/category/${id}`);
    return response.data;
  },

  async getQAs(filters?: { web_id?: number; category_id?: number }): Promise<BaseResponse<IQA[]>> {
    const response = await axiosClient.get<BaseResponse<IQA[]>>("/qa", { params: filters });
    return response.data;
  },

  async getQAsByCategory(categoryId: number): Promise<BaseResponse<IQA[]>> {
    const response = await axiosClient.get<BaseResponse<IQA[]>>(`/qa/category/${categoryId}`);
    return response.data;
  },

  async createQA(body: ICreateQA): Promise<BaseResponse<IQA>> {
    const response = await axiosClient.post<BaseResponse<IQA>>("/qa", body);
    return response.data;
  },

  async updateQA({ id, ...body }: IUpdateQA): Promise<BaseResponse<IQA>> {
    const response = await axiosClient.patch<BaseResponse<IQA>>(`/qa/${id}`, body);
    return response.data;
  },

  async deleteQA(id: number): Promise<BaseResponse<IQA>> {
    const response = await axiosClient.delete<BaseResponse<IQA>>(`/qa/${id}`);
    return response.data;
  },
};
