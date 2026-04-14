import axiosClient from "@/lib/axios";
import { ICompanyInfo } from "../interfaces";
import { BaseResponse } from "@/common/types";
import { IPaginationRequest, IPaginationResponse } from "@/common/interfaces";

export const companyService = {
  async getPublicCompanyInfo(): Promise<BaseResponse<ICompanyInfo>> {
    const response = await axiosClient.get<BaseResponse<ICompanyInfo>>('/company/get-company-info');
    return response.data;
  },
  async getCompanyInfo(query: IPaginationRequest): Promise<BaseResponse<IPaginationResponse<ICompanyInfo>>> {
    const response = await axiosClient.get<BaseResponse<IPaginationResponse<ICompanyInfo>>>('/company', {
      params: query
    });
    return response.data;
  },
  async createCompanyInfo(formData: FormData): Promise<BaseResponse<ICompanyInfo>> {
    const response = await axiosClient.post<BaseResponse<ICompanyInfo>>('/company', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  async updateCompanyInfo(id: number, formData: FormData): Promise<BaseResponse<ICompanyInfo>> {
    const response = await axiosClient.patch<BaseResponse<ICompanyInfo>>(`/company/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};
