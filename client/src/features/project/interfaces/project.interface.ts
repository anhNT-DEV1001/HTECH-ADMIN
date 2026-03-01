import { IPaginationRequest } from "@/common/interfaces";

export type ProjectStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface IProjectImage {
  id?: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export interface IProjectCategory {
  id: number;
  name_vn: string;
  name_en?: string;
}

export interface ICreateProjectCategory {
  name_vn: string;
  name_en?: string;
}

export interface IProject {
  id: number;
  thumbnail_url: string;
  title_vn: string;
  summary_vn: string;
  description_vn: string;
  title_en?: string;
  summary_en?: string;
  description_en?: string;
  client_name?: string;
  venue_vn?: string;
  venue_en?: string;
  location_url?: string;
  start_date?: Date;
  end_date?: Date;
  scale?: string;
  industry_vn?: string;
  industry_en?: string;
  status?: ProjectStatus;
  is_featured?: boolean;
  sort_order?: number;
  category_id?: number;
  projectImages?: IProjectImage[];
  created_at?: Date;
  updated_at?: Date;
}

export interface ICreateProject {
  title_vn: string;
  summary_vn: string;
  description_vn: string;
  title_en?: string;
  summary_en?: string;
  description_en?: string;
  thumbnail_url?: string;
  client_name?: string;
  venue_vn?: string;
  venue_en?: string;
  location_url?: string;
  start_date?: Date;
  end_date?: Date;
  scale?: string;
  industry_vn?: string;
  industry_en?: string;
  status?: ProjectStatus;
  is_featured?: boolean;
  sort_order?: number;
  category_id?: number;
  projectImages?: IProjectImage[];
}

export interface IUpdateProject {
  id: number;
  title_vn?: string;
  summary_vn?: string;
  description_vn?: string;
  title_en?: string;
  summary_en?: string;
  description_en?: string;
  thumbnail_url?: string;
  client_name?: string;
  venue_vn?: string;
  venue_en?: string;
  location_url?: string;
  start_date?: Date;
  end_date?: Date;
  scale?: string;
  industry_vn?: string;
  industry_en?: string;
  status?: ProjectStatus;
  is_featured?: boolean;
  sort_order?: number;
  category_id?: number;
  projectImages?: IProjectImage[];
}

export interface IProjectFilterParams extends IPaginationRequest {
  category_id?: number;
  startDate?: string;
  endDate?: string;
}