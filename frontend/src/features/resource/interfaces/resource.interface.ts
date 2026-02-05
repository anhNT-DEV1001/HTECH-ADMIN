import { IPaginationRequest } from "@/common/interfaces";
export interface ICreateResource {
  alias?: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
  href?: string;
}

export interface IResourceDetail {
  id?: number;
  alias: string;
  is_active?: boolean;
  icon?: string;
  href?: string;
}

export interface IUpdateResourceWithDetail {
  id: number;
  alias?: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
  href?: string;
  resourceDetails?: IResourceDetail[];
}

export interface IResource {
  id: number;
  alias: string;
  description: string;
  icon: string;
  is_active: boolean;
  href: string;
  created_at: Date;
  updated_at: Date;
  updated_by: number;
  created_by: number;
  resourceDetails: IResourceDetail[];
}

export interface IResourceRequest extends IPaginationRequest {
  is_active?: "all" | "true" | "false";
}
