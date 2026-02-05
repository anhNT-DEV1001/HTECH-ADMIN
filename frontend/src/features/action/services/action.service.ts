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

  async createActionInDetail(data: IActionDetailForm) {
    const response = await axiosClient.post("/permission/action", data);
    return response.data;
  },
  async updatedActionInDetail(data: any) {
    const response = await axiosClient.patch("/permission/action");
    return response.data;
  },

  async deleteAction(id: number) {
    const response = await axiosClient.delete(`/permission/action/${id}`);
    return response.data;
  },
};
