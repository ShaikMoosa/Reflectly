export type UUID = string;

export interface BaseEntity {
  id: UUID;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: UUID;
  email: string;
  name?: string;
  avatar_url?: string;
}

export type Status = 'active' | 'inactive' | 'pending' | 'deleted';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: Record<string, unknown>;
}
