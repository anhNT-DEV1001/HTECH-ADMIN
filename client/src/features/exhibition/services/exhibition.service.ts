import type { BaseResponse } from "@/common/types";
import axiosClient from "@/lib/axios";
import type {
  IBooth,
  ICreateBooth,
  ICreateExhibition,
  ICreateExhibitor,
  ICreateExhibitorRank,
  ICreateZone,
  IExhibition,
  IExhibitor,
  IExhibitorRank,
  IUpdateBooth,
  IUpdateExhibition,
  IUpdateExhibitor,
  IUpdateExhibitorRank,
  IUpdateZone,
  IZone,
} from "../interfaces";

const appendExhibitorFormData = (
  formData: FormData,
  body: Partial<ICreateExhibitor>,
) => {
  if (body.name !== undefined) formData.append("name", body.name);
  if (body.sumary_vn !== undefined) formData.append("sumary_vn", body.sumary_vn);
  if (body.sumary_en !== undefined) formData.append("sumary_en", body.sumary_en);
  if (body.content_vn !== undefined) formData.append("content_vn", body.content_vn);
  if (body.content_en !== undefined) formData.append("content_en", body.content_en);
  if (body.rankId !== undefined) formData.append("rankId", String(body.rankId));
  if (body.boothId !== undefined) formData.append("boothId", String(body.boothId));
  if (body.web_id !== undefined) formData.append("web_id", String(body.web_id));
  if (body.exhibition_ids !== undefined) {
    formData.append("exhibition_ids", JSON.stringify(body.exhibition_ids));
  }
  if (body.remove_img !== undefined) {
    formData.append("remove_img", String(body.remove_img));
  }
  if (body.imgFile) {
    formData.append("file", body.imgFile);
  }
};

const appendExhibitionFormData = (
  formData: FormData,
  body: Partial<ICreateExhibition>,
) => {
  if (body.logo !== undefined) formData.append("logo", body.logo);
  if (body.name_vn !== undefined) formData.append("name_vn", body.name_vn);
  if (body.name_en !== undefined) formData.append("name_en", body.name_en);
  if (body.title_vn !== undefined) formData.append("title_vn", body.title_vn);
  if (body.title_en !== undefined) formData.append("title_en", body.title_en);
  if (body.sumary_vn !== undefined) formData.append("sumary_vn", body.sumary_vn);
  if (body.sumary_en !== undefined) formData.append("sumary_en", body.sumary_en);
  if (body.content_vn !== undefined) formData.append("content_vn", body.content_vn);
  if (body.content_en !== undefined) formData.append("content_en", body.content_en);
  if (body.display_order !== undefined) {
    formData.append("display_order", String(body.display_order));
  }
  if (body.web_id !== undefined) formData.append("web_id", String(body.web_id));
  if (body.zone_ids !== undefined) formData.append("zone_ids", JSON.stringify(body.zone_ids));
  if (body.exhibitor_ids !== undefined) {
    formData.append("exhibitor_ids", JSON.stringify(body.exhibitor_ids));
  }
  if (body.remove_img !== undefined) {
    formData.append("remove_img", String(body.remove_img));
  }
  if (body.imgFile) {
    formData.append("file", body.imgFile);
  }
};

export const exhibitionService = {
  async getExhibitions(): Promise<BaseResponse<IExhibition[]>> {
    const response = await axiosClient.get<BaseResponse<IExhibition[]>>("/exhibition");
    return response.data;
  },

  async createExhibition(body: ICreateExhibition): Promise<BaseResponse<IExhibition>> {
    const { zone_id, ...payload } = body;
    const formData = new FormData();
    appendExhibitionFormData(formData, { ...payload, zone_ids: [zone_id] });
    const response = await axiosClient.post<BaseResponse<IExhibition>>("/exhibition", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async updateExhibition({ id, ...body }: IUpdateExhibition): Promise<BaseResponse<IExhibition>> {
    const { zone_id, ...payload } = body;
    const formData = new FormData();
    appendExhibitionFormData(formData, {
      ...payload,
      zone_ids: zone_id !== undefined ? [zone_id] : undefined,
    });
    const response = await axiosClient.patch<BaseResponse<IExhibition>>(
      `/exhibition/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  async deleteExhibition(id: number): Promise<BaseResponse<IExhibition>> {
    const response = await axiosClient.delete<BaseResponse<IExhibition>>(`/exhibition/${id}`);
    return response.data;
  },

  async getZones(): Promise<BaseResponse<IZone[]>> {
    const response = await axiosClient.get<BaseResponse<IZone[]>>("/exhibition/zones");
    return response.data;
  },

  async createZone(body: ICreateZone): Promise<BaseResponse<IZone>> {
    const response = await axiosClient.post<BaseResponse<IZone>>("/exhibition/zones", body);
    return response.data;
  },

  async updateZone({ id, ...body }: IUpdateZone): Promise<BaseResponse<IZone>> {
    const response = await axiosClient.patch<BaseResponse<IZone>>(`/exhibition/zones/${id}`, body);
    return response.data;
  },

  async deleteZone(id: number): Promise<BaseResponse<IZone>> {
    const response = await axiosClient.delete<BaseResponse<IZone>>(`/exhibition/zones/${id}`);
    return response.data;
  },

  async getExhibitorRanks(): Promise<BaseResponse<IExhibitorRank[]>> {
    const response = await axiosClient.get<BaseResponse<IExhibitorRank[]>>("/exhibition/ranks");
    return response.data;
  },

  async createExhibitorRank(body: ICreateExhibitorRank): Promise<BaseResponse<IExhibitorRank>> {
    const response = await axiosClient.post<BaseResponse<IExhibitorRank>>("/exhibition/ranks", body);
    return response.data;
  },

  async updateExhibitorRank({
    id,
    ...body
  }: IUpdateExhibitorRank): Promise<BaseResponse<IExhibitorRank>> {
    const response = await axiosClient.patch<BaseResponse<IExhibitorRank>>(
      `/exhibition/ranks/${id}`,
      body,
    );
    return response.data;
  },

  async deleteExhibitorRank(id: number): Promise<BaseResponse<IExhibitorRank>> {
    const response = await axiosClient.delete<BaseResponse<IExhibitorRank>>(`/exhibition/ranks/${id}`);
    return response.data;
  },

  async getBooths(): Promise<BaseResponse<IBooth[]>> {
    const response = await axiosClient.get<BaseResponse<IBooth[]>>("/exhibition/booths");
    return response.data;
  },

  async createBooth(body: ICreateBooth): Promise<BaseResponse<IBooth>> {
    const response = await axiosClient.post<BaseResponse<IBooth>>("/exhibition/booths", body);
    return response.data;
  },

  async updateBooth({ id, ...body }: IUpdateBooth): Promise<BaseResponse<IBooth>> {
    const response = await axiosClient.patch<BaseResponse<IBooth>>(`/exhibition/booths/${id}`, body);
    return response.data;
  },

  async deleteBooth(id: number): Promise<BaseResponse<IBooth>> {
    const response = await axiosClient.delete<BaseResponse<IBooth>>(`/exhibition/booths/${id}`);
    return response.data;
  },

  async getExhibitors(): Promise<BaseResponse<IExhibitor[]>> {
    const response = await axiosClient.get<BaseResponse<IExhibitor[]>>("/exhibition/exhibitors");
    return response.data;
  },

  async createExhibitor(body: ICreateExhibitor): Promise<BaseResponse<IExhibitor>> {
    const formData = new FormData();
    appendExhibitorFormData(formData, body);
    const response = await axiosClient.post<BaseResponse<IExhibitor>>("/exhibition/exhibitors", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async updateExhibitor({ id, ...body }: IUpdateExhibitor): Promise<BaseResponse<IExhibitor>> {
    const formData = new FormData();
    appendExhibitorFormData(formData, body);
    const response = await axiosClient.patch<BaseResponse<IExhibitor>>(
      `/exhibition/exhibitors/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  async deleteExhibitor(id: number): Promise<BaseResponse<IExhibitor>> {
    const response = await axiosClient.delete<BaseResponse<IExhibitor>>(`/exhibition/exhibitors/${id}`);
    return response.data;
  },
};
