/**
 * Search Service
 * Platform-agnostic search API operations
 */

import { getApiClient } from '../client';
import type {
  PostSnapshotDTO,
  GroupSummaryDTO,
  UserDTO,
  CursorPaginatedResponse,
  GroupPrivacy,
  Emotion,
} from '../../types';

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
  isActive?: boolean;
}

// ==================== Service ====================

export const searchService = {
  /**
   * Search posts
   */
  async searchPosts(
    filter: SearchPostFilter
  ): Promise<CursorPaginatedResponse<PostSnapshotDTO>> {
    return getApiClient().get('/search/posts', { params: filter });
  },

  /**
   * Search groups
   */
  async searchGroups(
    filter: SearchGroupFilter
  ): Promise<CursorPaginatedResponse<GroupSummaryDTO>> {
    return getApiClient().get('/search/groups', { params: filter });
  },

  /**
   * Search users
   */
  async searchUsers(
    filter: SearchUserFilter
  ): Promise<CursorPaginatedResponse<UserDTO>> {
    return getApiClient().get('/search/users', { params: filter });
  },
};
