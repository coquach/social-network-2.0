import { cache } from 'react';
import { getConversationById } from './actions/chat/chat-actions';
import {
  getGroupMembers,
  getRecommendedGroups,
  type GroupMemberFilter,
} from './actions/group/group-action';
import {
  getPost,
  getPostsByGroup,
} from './actions/social/post/post-action';
import { getShareById } from './actions/social/share/share-action';
import type { PostGroupStatus } from '@/models/social/enums/social.enum';

/**
 * Cached server-side data fetchers using React.cache() for automatic
 * per-request deduplication. These should only be used in Server Components.
 *
 * React.cache() ensures that multiple calls with identical arguments within
 * a single server render will only execute once, preventing unnecessary
 * duplicate network requests.
 *
 * @see https://react.dev/reference/react/cache
 */

// ==================== Share Fetchers ====================

/**
 * Fetch a single share by ID with automatic deduplication
 */
export const getCachedShare = cache(
  async (token: string, shareId: string) => {
    return getShareById(token, shareId);
  }
);

// ==================== Post Fetchers ====================

/**
 * Fetch a single post by ID with automatic deduplication
 */
export const getCachedPost = cache(
  async (token: string, postId: string) => {
    return getPost(token, postId);
  }
);

/**
 * Fetch posts for a specific group with automatic deduplication
 */
export const getCachedPostsByGroup = cache(
  async (
    token: string,
    groupId: string,
    query: {
      limit?: number;
      cursor?: string;
      status?: PostGroupStatus;
    }
  ) => {
    return getPostsByGroup(token, groupId, query);
  }
);

// ==================== Group Fetchers ====================

/**
 * Fetch group members with automatic deduplication
 */
export const getCachedGroupMembers = cache(
  async (token: string, groupId: string, filter: GroupMemberFilter) => {
    return getGroupMembers(token, groupId, filter);
  }
);

/**
 * Fetch recommended groups with automatic deduplication
 */
export const getCachedRecommendedGroups = cache(
  async (token: string, query: { limit?: number; cursor?: string }) => {
    return getRecommendedGroups(token, query);
  }
);

// ==================== Conversation Fetchers ====================

/**
 * Fetch a conversation by ID with automatic deduplication
 */
export const getCachedConversationById = cache(
  async (token: string, conversationId: string) => {
    return getConversationById(token, conversationId);
  }
);
