export interface INews {
  id: number;
  thumbnail_url: string;
  newsImage: string;
  title_vn: string;
  summary_vn: string;
  content_vn: string;
  title_en: string;
  summary_en: string;
  content_en: string;
  newImages: INewsImage[] | [];
  created_at:Date;
  updated_at: Date;
}

export interface ICreateNews {
  title_vn: string;
  thumbnail_url: string;
  summary_vn: string;
  content_vn: string;
  newsImage: string;
  title_en: string;
  summary_en: string;
  content_en: string;
  newImages: INewsImage[] | [];
}

export interface IUpdateNews {
  id: number;
  thumbnail_url: string;
  newsImage: string;
  title_vn: string;
  summary_vn: string;
  content_vn: string;
  title_en: string;
  summary_en: string;
  content_en: string;
  newImages: INewsImage[] | []
}

export interface INewsImage {
  id ?: number;
  image_url: string;
  alt_text: string;
  sort_order: number
}