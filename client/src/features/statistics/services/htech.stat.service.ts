import { BaseResponse } from "@/common/types";
import axiosClient from "@/lib/axios";

export const htechStatService = {
  async getHtechStat(): Promise<BaseResponse<any>> {
    const response = await axiosClient.get<BaseResponse<any>>('/statistics/htech');
    return response.data;
  }
}