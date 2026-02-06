import { IResourceDetail } from "@/features/resource/interfaces";

export interface Action {
  id? : number;
  action: string;
  resource_detail_alias: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
  is_active?: boolean;
}

export interface IActionDetailForm {
  resourceDetail: IResourceDetail;
  actions: Action[];
}

export interface IResourceDetailWithAction {
  id? : number;
  alias: string;
  is_active?: boolean;
  icon?: string;
  href?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
  actions?: Action[];
}

