import type { IWeb } from "@/features/web/interfaces";

export interface IZone {
  id: number;
  name_vn: string;
  name_en?: string | null;
  field_vn?: string | null;
  field_en?: string | null;
  description_vn?: string | null;
  description_en?: string | null;
  web_id: number;
  web?: IWeb;
  exhibitions?: IExhibition[];
  created_at?: string;
  updated_at?: string;
}

export interface IExhibitorRank {
  id: number;
  name_vn: string;
  name_en?: string | null;
  display_order: number;
  web_id: number;
  web?: IWeb;
  exhibitors?: IExhibitor[];
  created_at?: string;
  updated_at?: string;
}

export interface IBooth {
  id: number;
  name?: string | null;
  web_id: number;
  web?: IWeb;
  exhibitors?: IExhibitor[];
  created_at?: string;
  updated_at?: string;
}

export interface IExhibitor {
  id: number;
  name: string;
  img?: string | null;
  sumary_vn: string;
  sumary_en?: string | null;
  content_vn: string;
  content_en?: string | null;
  rankId: number;
  boothId: number;
  web_id: number;
  web?: IWeb;
  rank?: IExhibitorRank;
  booth?: IBooth;
  exhibitions?: IExhibition[];
  created_at?: string;
  updated_at?: string;
}

export interface IConference {
  id: number;
  name: string;
  img?: string | null;
  sumary_vn: string;
  sumary_en?: string | null;
  content_vn: string;
  content_en?: string | null;
  display_order: number;
  web_id: number;
  web?: IWeb;
  exhibitions?: IExhibition[];
  created_at?: string;
  updated_at?: string;
}

export interface IExhibition {
  id: number;
  logo?: string | null;
  img?: string | null;
  document_pdf?: string | null;
  name_vn: string;
  name_en?: string | null;
  title_vn: string;
  title_en?: string | null;
  sumary_vn?: string | null;
  sumary_en?: string | null;
  content_vn?: string | null;
  content_en?: string | null;
  display_order: number;
  web_id: number;
  web?: IWeb;
  zones?: IZone[];
  exhibitors?: IExhibitor[];
  conferences?: IConference[];
  created_at?: string;
  updated_at?: string;
}

export interface ICreateZone {
  name_vn: string;
  name_en?: string;
  field_vn?: string;
  field_en?: string;
  description_vn?: string;
  description_en?: string;
  web_id: number;
}

export interface IUpdateZone extends Partial<ICreateZone> {
  id: number;
}

export interface ICreateExhibition {
  logo?: string;
  img?: string | null;
  imgFile?: File | null;
  document_pdf?: string | null;
  documentPdfFile?: File | null;
  name_vn: string;
  name_en?: string;
  title_vn: string;
  title_en?: string;
  sumary_vn?: string;
  sumary_en?: string;
  content_vn?: string;
  content_en?: string;
  display_order?: number;
  web_id: number;
  zone_id: number;
  zone_ids?: number[];
  exhibitor_ids?: number[];
  remove_img?: boolean;
  remove_document_pdf?: boolean;
}

export interface IUpdateExhibition extends Partial<ICreateExhibition> {
  id: number;
}

export interface ICreateExhibitorRank {
  name_vn: string;
  name_en?: string;
  display_order?: number;
  web_id: number;
}

export interface IUpdateExhibitorRank extends Partial<ICreateExhibitorRank> {
  id: number;
}

export interface ICreateBooth {
  name?: string;
  web_id: number;
}

export interface IUpdateBooth extends Partial<ICreateBooth> {
  id: number;
}

export interface ICreateExhibitor {
  name: string;
  img?: string | null;
  imgFile?: File | null;
  sumary_vn: string;
  sumary_en?: string;
  content_vn: string;
  content_en?: string;
  rankId: number;
  boothId: number;
  web_id: number;
  exhibition_ids?: number[];
  remove_img?: boolean;
}

export interface IUpdateExhibitor extends Partial<ICreateExhibitor> {
  id: number;
}

export interface ICreateConference {
  name: string;
  img?: string | null;
  imgFile?: File | null;
  sumary_vn: string;
  sumary_en?: string;
  content_vn: string;
  content_en?: string;
  display_order?: number;
  web_id: number;
  exhibition_ids?: number[];
  remove_img?: boolean;
}

export interface IUpdateConference extends Partial<ICreateConference> {
  id: number;
}
