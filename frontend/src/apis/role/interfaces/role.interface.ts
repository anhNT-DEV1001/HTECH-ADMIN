export interface IRole {
  id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateRoleRequest {
  name: string;
  description?: string;
}