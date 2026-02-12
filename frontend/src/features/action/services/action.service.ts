import axiosClient from "@/apis/axios";
import { IActionDetailForm } from "../interfaces/action.interface";
import { BaseResponse } from "@/common/types";
import { IResourceDetailWithAction } from "../interfaces";

export const actionService = {
  async getActionInDetail(resourceDetailId: number) {
    const response = await axiosClient.get<BaseResponse<IResourceDetailWithAction>>(
      `/permission/action/${resourceDetailId}`,
    );
    return response.data;
  },

  async createActionInDetail(data: IActionDetailForm) : Promise<BaseResponse<IResourceDetailWithAction>> {
    const response = await axiosClient.post<BaseResponse<IResourceDetailWithAction>>("/permission/action", data);
    return response.data;
  },
  async updatedActionInDetail(data: any) : Promise<BaseResponse<IResourceDetailWithAction>> {
    const response = await axiosClient.patch<BaseResponse<IResourceDetailWithAction>>("/permission/action");
    return response.data;
  },

  async deleteAction(id: number) : Promise<BaseResponse<IResourceDetailWithAction>> {
    const response = await axiosClient.delete<BaseResponse<IResourceDetailWithAction>>(`/permission/action/${id}`);
    return response.data;
  },
};
