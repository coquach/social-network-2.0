/**
 * Search Service
 * Platform-agnostic search API operations
 */

import { getApiClient } from '../client';
import type {
  PostSnapshotDTO,
  GroupSummaryDTO,
  UserDTO,
  CursorPageResponse,
  GroupPrivacy,
  Emotion,
} from '../../types';
import type { SortOrder } from '../../types/common.types';

// ==================== Filter Types ====================

/**
 * Search posts filter
 */
export interface SearchPostFilter {
  cursor?: string;
  limit?: number;
  query: string;
  userId?: string;
  groupId?: string;
  emotion?: Emotion;
  sortBy?: 'createdAt';
  sortOrder?: SortOrder;
}

/**
 * Search group sort options
 */
export enum SearchGroupSortBy {
  MEMBERS = 'members',
  CREATED_AT = 'createdAt',
}

/**
 * Search groups filter
 */
export interface SearchGroupFilter {
  cursor?: string;
  limit?: number;
  query: string;
  groupId?: string;
  privacy?: GroupPrivacy;
  sortBy?: SearchGroupSortBy;
  sortOrder?: SortOrder;
}

/**
 * Search users filter
 */
export interface SearchUserFilter {
  cursor?: string;
  limit?: number;
  query: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  sortBy?: 'createdAt';
  sortOrder?: SortOrder;
}

// ==================== Service ====================

export const searchService = {
  async searchPosts(
    filter: SearchPostFilter
  ): Promise<CursorPageResponse<PostSnapshotDTO>> {
    const { sortOrder, ...rest } = filter;
    return getApiClient().getCursorPage('/search/posts', { params: { ...rest, order: sortOrder } });
  },

  async searchGroups(
    filter: SearchGroupFilter
  ): Promise<CursorPageResponse<GroupSummaryDTO>> {
    const { sortOrder, ...rest } = filter;
    return getApiClient().getCursorPage('/search/groups', { params: { ...rest, order: sortOrder } });
  },

  async searchUsers(
    filter: SearchUserFilter
  ): Promise<CursorPageResponse<UserDTO>> {
    const { sortOrder, ...rest } = filter;
    return getApiClient().getCursorPage('/search/users', { params: { ...rest, order: sortOrder } });
  },
};
