export interface Pagination {
  page?: number;
  limit?: number;
}

export interface PageResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}