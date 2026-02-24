export interface IPaginationRequest {
  page?: number;
  limit?: number;
  orderBy?: string;
  sortBy?: "asc" | "desc";
  searchBy?: string;
  search?: string;
}
export interface IPaginationResponse<T> {
  records: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
