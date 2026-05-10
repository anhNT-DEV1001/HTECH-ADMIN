import type { IPaginationResponse } from "@/common/interfaces";
import type { BaseResponse } from "@/common/types";
import axiosClient from "@/lib/axios";
import type { IAgenda, IAgendaFilterParams } from "../interfaces";

export const agendaService = {
  async getAgendas(query: IAgendaFilterParams): Promise<BaseResponse<IPaginationResponse<IAgenda>>> {
    const response = await axiosClient.get<BaseResponse<IPaginationResponse<IAgenda>>>("/agenda", {
      params: query,
    });
    return response.data;
  },

  async getAgendaById(id: number): Promise<BaseResponse<IAgenda>> {
    const response = await axiosClient.get<BaseResponse<IAgenda>>(`/agenda/${id}`);
    return response.data;
  },

  async createAgenda(formData: FormData): Promise<BaseResponse<IAgenda>> {
    const response = await axiosClient.post<BaseResponse<IAgenda>>("/agenda", formData);
    return response.data;
  },

  async updateAgenda(id: number, formData: FormData): Promise<BaseResponse<IAgenda>> {
    const response = await axiosClient.patch<BaseResponse<IAgenda>>(`/agenda/${id}`, formData);
    return response.data;
  },

  async deleteAgenda(id: number): Promise<BaseResponse<IAgenda>> {
    const response = await axiosClient.delete<BaseResponse<IAgenda>>(`/agenda/${id}`);
    return response.data;
  },
};
