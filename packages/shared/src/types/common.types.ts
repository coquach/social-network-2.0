/**
 * Common types used across the application
 */

/**
 * Cursor-based pagination response
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
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
  limit?: number;
  cursor?: string;
}
