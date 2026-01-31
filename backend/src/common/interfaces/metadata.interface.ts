export interface IMetadata {
  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
}

export interface ISoftDelete extends IMetadata {
  deleted_at?: Date;
  deleted_by?: number;
}
