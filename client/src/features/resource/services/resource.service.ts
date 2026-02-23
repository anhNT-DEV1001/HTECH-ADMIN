import axiosClient from "@/lib/axios"
import type { ICreateResource, IResource, IUpdateResourceWithDetail } from "../interfaces";
import type { BaseResponse  } from "@/common/types";
import { IPaginationRequest, IPaginationResponse } from "@/common/interfaces";

export const resourceService =  {
  async createResource (resourceData : ICreateResource) : Promise<BaseResponse<IResource>>{
    const response = await axiosClient.post<BaseResponse<IResource>>("/resource", resourceData);
    return response.data as any;
  },
  async getAllResource(query : IPaginationRequest) : Promise<BaseResponse<IPaginationResponse<IResource>>> {
    const response = await axiosClient.get<BaseResponse<IPaginationResponse<IResource>>>("/resource" , {
      params : query
    });
    return response.data
  },
  async updateResourceWithDetail(body : IUpdateResourceWithDetail) : Promise<BaseResponse<IResource>> {
    const response = await axiosClient.patch<BaseResponse<IResource>>('/resource', body);
    return response.data as any;
  },
  async deleteResource(id : number) : Promise<BaseResponse<IResource>> {
    const response = await axiosClient.delete(`resource/${id}`);
    return response.data;
  }
}