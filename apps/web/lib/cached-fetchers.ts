import { cache } from 'react';
import { conversationService, groupService, postService, type GroupMemberFilter } from '@repo/shared';
import { initServerApi } from './server-api-init';
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

// ==================== Post Fetchers ====================

/**
 * Fetch a single post by ID with automatic deduplication
 */
export const getCachedPost = cache(
  async (postId: string) => {
    await initServerApi();
    return postService.getPost(postId);
  }
);

/**
 * Fetch posts for a specific group with automatic deduplication
 */
export const getCachedPostsByGroup = cache(
  async (
    groupId: string,
    query: {
      limit?: number;
      cursor?: string;
      status?: PostGroupStatus;
    }
  ) => {
    await initServerApi();
    return postService.getGroupPosts(groupId, query as any);
  }
);

// ==================== Group Fetchers ====================

/**
 * Fetch group members with automatic deduplication
 */
export const getCachedGroupMembers = cache(
  async (groupId: string, filter: GroupMemberFilter) => {
    await initServerApi();
    return groupService.getGroupMembers(groupId, filter);
  }
);

/**
 * Fetch recommended groups with automatic deduplication
 */
export const getCachedRecommendedGroups = cache(
  async (query: { limit?: number; cursor?: string }) => {
    await initServerApi();
    return groupService.getRecommendedGroups(query);
  }
);

// ==================== Conversation Fetchers ====================

/**
 * Fetch a conversation by ID with automatic deduplication
 */
export const getCachedConversationById = cache(
  async (conversationId: string) => {
    await initServerApi();
    return conversationService.getConversation(conversationId);
  }
);
