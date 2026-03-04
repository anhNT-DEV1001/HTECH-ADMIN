export interface ProjectImage {
  id: number;
  project_id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export interface ProjectCategory {
  id: number;
  name_vn: string;
  name_en?: string;
  slug: string;
}

export interface FeaturedProject {
  id: number;
  title_vn: string;
  title_en?: string;
  slug: string;
  summary_vn: string;
  summary_en?: string;
  description_vn: string;
  description_en?: string;
  thumbnail_url?: string;
  client_name?: string;
  venue_vn?: string;
  venue_en?: string;
  location_url?: string;
  start_date: string;
  end_date?: string;
  scale?: string;
  industry_vn?: string;
  industry_en?: string;
  status: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  category_id: number;
  category: ProjectCategory;
  projectImages: ProjectImage[];
}

export interface NewsImage {
  id: number;
  news_id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export interface NewsCategory {
  id: number;
  name_vn: string;
  name_en?: string;
  slug: string;
}

export interface FeaturedNews {
  id: number;
  title_vn: string;
  title_en?: string;
  summary_vn: string;
  summary_en?: string;
  content_vn: string;
  content_en?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  category_id?: number;
  thumbnail_url?: string;
  is_featured: boolean;
  category?: NewsCategory;
  newsImages: NewsImage[];
}

export interface FieldOfWork {
  id: number;
  name_vn: string;
  name_en?: string;
  slug: string;
}

export interface OpenJob {
  id: number;
  title_vn: string;
  title_en?: string;
  slug: string;
  job_type_vn?: string;
  job_type_en?: string;
  experience_vn?: string;
  experience_en?: string;
  field_of_work_id: number;
  field_of_work: FieldOfWork;
  description_vn: string;
  description_en?: string;
  recruitment_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface HtechStatResponse {
  featuredProjects: FeaturedProject[];
  featuredNews: FeaturedNews[];
  openJobs: OpenJob[];
}
