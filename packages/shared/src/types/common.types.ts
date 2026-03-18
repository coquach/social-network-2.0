/**
 * Common types used across the application
 */

/**
 * Cursor-based pagination query params
 */
export interface CursorPagination {
  cursor?: string;
  limit?: number;
}

/**
 * Cursor-based pagination response using `hasNextPage`
 */
export interface CursorPageResponse<T> {
  data: T[];
  nextCursor?: string | null;
  hasNextPage: boolean;
}

/**
 * Traditional page-based pagination query params
 */
export interface Pagination {
  page?: number;
  limit?: number;
}

/**
 * Traditional page-based pagination response
 */
export interface PageResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Standard API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * Date range filter
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Common query parameters
 */
export interface QueryParams {
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
  cursor?: string;
}
