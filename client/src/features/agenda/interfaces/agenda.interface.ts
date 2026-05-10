import type { IPaginationRequest } from "@/common/interfaces";
import type { IZone } from "@/features/exhibition/interfaces";
import type { IWeb } from "@/features/web/interfaces";

export interface IAgendaTimeline {
  id: number;
  agenda_date_id: number;
  STime: string;
  ETime: string;
  name_vn: string;
  name_en?: string | null;
  short_name_vn: string;
  short_name_en?: string | null;
  locate_vn: string;
  locate_en?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IAgendaDate {
  id: number;
  agenda_id: number;
  date: string;
  description?: string | null;
  timelines: IAgendaTimeline[];
  created_at?: string;
  updated_at?: string;
}

export interface IAgenda {
  id: number;
  name_vn: string;
  name_en?: string | null;
  file_url: string;
  web_id: number;
  zone_id?: number | null;
  SDate: string;
  EDate: string;
  web?: IWeb;
  zone?: IZone | null;
  agendaDates: IAgendaDate[];
  created_at?: string;
  updated_at?: string;
}

export interface IAgendaTimelinePayload {
  id?: number;
  STime: string;
  ETime: string;
  name_vn: string;
  name_en?: string;
  short_name_vn: string;
  short_name_en?: string;
  locate_vn: string;
  locate_en?: string;
}

export interface IAgendaDatePayload {
  id?: number;
  date: string;
  description?: string;
  timelines?: IAgendaTimelinePayload[];
}

export interface ICreateAgenda {
  name_vn: string;
  name_en?: string;
  file_url?: string;
  file?: File | null;
  web_id: number;
  zone_id: number;
  SDate: string;
  EDate: string;
  agendaDates?: IAgendaDatePayload[];
}

export interface IUpdateAgenda extends Partial<ICreateAgenda> {
  id: number;
}

export interface IAgendaFilterParams extends IPaginationRequest {
  web_id?: number;
  startDate?: string;
  endDate?: string;
}
