export interface ICreateResource {
  alias?: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
  href?: string;
}

export interface IResourceDetail {
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