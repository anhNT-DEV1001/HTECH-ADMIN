import axiosClient from "@/lib/axios";
import { BaseResponse } from "@/common/types";
import { IPaginationRequest, IPaginationResponse } from "@/common/interfaces";
import { IJob, IFieldOfWork, ICreateJob, IUpdateJob } from "../interfaces/jobs.interface";

export const jobService = {
    async createJob(data: ICreateJob): Promise<BaseResponse<any>> {
        const response = await axiosClient.post<BaseResponse<any>>('/jobs', data);
        return response.data;
    },

    async updateJob(id: number, data: IUpdateJob): Promise<BaseResponse<any>> {
        const response = await axiosClient.patch<BaseResponse<any>>(`/jobs/${id}`, data);
        return response.data;
    },

    async deleteJob(id: number): Promise<BaseResponse<any>> {
        const response = await axiosClient.delete<BaseResponse<any>>(`/jobs/${id}`);
        return response.data;
    },

    async getJobs(query: IPaginationRequest) {
        const response = await axiosClient.get<BaseResponse<IPaginationResponse<IJob>>>(`/jobs`, {
            params: query
        });
        return response.data;
    },

    async getJobById(id: number): Promise<BaseResponse<IJob>> {
        const response = await axiosClient.get<BaseResponse<IJob>>(`/jobs/${id}`);
        return response.data;
    },

    async getFieldsOfWork(): Promise<BaseResponse<IFieldOfWork[]>> {
        const response = await axiosClient.get<BaseResponse<IFieldOfWork[]>>('/jobs/field-of-works');
        return response.data;
    },

    async createFieldOfWork(data: { name_vn: string; name_en?: string }): Promise<BaseResponse<IFieldOfWork>> {
        const response = await axiosClient.post<BaseResponse<IFieldOfWork>>('/jobs/field-of-works', data);
        return response.data;
    },

    async deleteFieldOfWork(id: number): Promise<BaseResponse<any>> {
        const response = await axiosClient.delete<BaseResponse<any>>(`/jobs/field-of-works/${id}`);
        return response.data;
    },
};
