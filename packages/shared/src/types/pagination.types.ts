/**
 * Cursor-based pagination types
 * Platform-agnostic pagination for infinite scroll
 */

export interface CursorPagination {
  cursor?: string;
  limit?: number;
}

export interface CursorPageResponse<T> {
  data: T[];
  nextCursor?: string | null;
  hasNextPage: boolean;
}
