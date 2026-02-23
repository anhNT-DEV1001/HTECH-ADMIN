import { Action } from "@/features/action/interfaces";


export interface IPermission {
  id: number;
  alias: string;
  parent_alias: string;
  is_active: boolean;
  icon: string;
  herf: string;
  actions: Action[];
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}