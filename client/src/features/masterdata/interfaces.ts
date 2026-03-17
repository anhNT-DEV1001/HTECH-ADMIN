import { IPaginationRequest, IPaginationResponse } from "@/common/interfaces";

export interface IMasterData {
  id: number;
  dataValue: string;
  dataKey: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface ICreateMasterDataDto {
  dataValue: string;
  dataKey: string;
  name: string;
  description?: string;
}

export interface IUpdateMasterDataDto {
  dataValue?: string;
  dataKey?: string;
  name?: string;
  description?: string;
}

export interface IMasterDataFilterParams extends IPaginationRequest {
  dataKey?: string;
}

export type MasterDataResponse = IPaginationResponse<IMasterData>;
