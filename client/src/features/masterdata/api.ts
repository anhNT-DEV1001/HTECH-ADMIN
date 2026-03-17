import axiosClient from "@/lib/axios";
import { IMasterData, IMasterDataFilterParams, ICreateMasterDataDto, IUpdateMasterDataDto, MasterDataResponse } from "./interfaces";

export const masterDataApi = {
  getAllMasterData: async (params: IMasterDataFilterParams): Promise<MasterDataResponse> => {
    const res = await axiosClient.get('/masterdata', { params });
    return res.data;
  },

  getMasterDataByKey: async (dataKey: string): Promise<IMasterData[]> => {
    const res = await axiosClient.get(`/masterdata/key/${dataKey}`);
    return res.data;
  },

  getMasterDataById: async (id: number): Promise<IMasterData> => {
    const res = await axiosClient.get(`/masterdata/${id}`);
    return res.data;
  },

  createMasterData: async (data: ICreateMasterDataDto): Promise<IMasterData> => {
    const res = await axiosClient.post('/masterdata', data);
    return res.data;
  },

  updateMasterData: async (id: number, data: IUpdateMasterDataDto): Promise<IMasterData> => {
    const res = await axiosClient.patch(`/masterdata/${id}`, data);
    return res.data;
  },

  deleteMasterData: async (id: number): Promise<void> => {
    await axiosClient.delete(`/masterdata/${id}`);
  }
};
