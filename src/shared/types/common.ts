export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp?: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[] | unknown;
    requestId?: string;
  };
  meta?: {
    timestamp?: string;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

export type PaginatedResponse<T> = ApiSuccessResponse<PaginatedData<T>>;
