import type { BaseResponse } from "@/common/types";
import axiosClient from "@/lib/axios";
import type { ICreateWeb, IUpdateWeb, IWeb } from "../interfaces";

export const webService = {
  async getAllWeb(): Promise<BaseResponse<IWeb[]>> {
    const response = await axiosClient.get<BaseResponse<IWeb[]>>("/web");
    return response.data;
  },

  async createWeb(body: ICreateWeb): Promise<BaseResponse<IWeb>> {
    const response = await axiosClient.post<BaseResponse<IWeb>>("/web", body);
    return response.data;
  },

  async updateWeb({ id, ...body }: IUpdateWeb): Promise<BaseResponse<IWeb>> {
    const response = await axiosClient.patch<BaseResponse<IWeb>>(
      `/web/${id}`,
      body,
    );
    return response.data;
  },

  async deleteWeb(id: number): Promise<BaseResponse<IWeb>> {
    const response = await axiosClient.delete<BaseResponse<IWeb>>(`/web/${id}`);
    return response.data;
  },
};
