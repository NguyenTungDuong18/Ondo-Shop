export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  traceId: string;
  statusCode: number;
}

export interface PagedResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
