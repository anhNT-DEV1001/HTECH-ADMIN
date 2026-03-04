import { IPaginationRequest } from "@/common/interfaces";

export interface IFieldOfWork {
    id: number;
    name_vn: string;
    name_en?: string;
    slug: string;
}

export interface ICreateFieldOfWork {
    name_vn: string;
    name_en?: string;
}

export interface IJob {
    id: number;
    title_vn: string;
    title_en?: string;
    slug: string;
    job_type_vn?: string;
    job_type_en?: string;
    experience_vn?: string;
    experience_en?: string;
    field_of_work_id: number;
    field_of_work?: IFieldOfWork;
    description_vn: string;
    description_en?: string;
    recruitment_url?: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface ICreateJob {
    title_vn: string;
    title_en?: string;
    job_type_vn?: string;
    job_type_en?: string;
    experience_vn?: string;
    experience_en?: string;
    field_of_work_id: number;
    description_vn: string;
    description_en?: string;
    recruitment_url?: string;
    is_active?: boolean;
    sort_order?: number;
}

export interface IUpdateJob {
    id?: number;
    title_vn?: string;
    title_en?: string;
    job_type_vn?: string;
    job_type_en?: string;
    experience_vn?: string;
    experience_en?: string;
    field_of_work_id?: number;
    description_vn?: string;
    description_en?: string;
    recruitment_url?: string;
    is_active?: boolean;
    sort_order?: number;
}

export interface IJobFilterParams extends IPaginationRequest {
    job_type?: string;
    experience?: string;
    field_of_work_id?: string;
}
