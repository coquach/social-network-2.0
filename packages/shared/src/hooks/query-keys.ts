/**
 * Centralized React Query Keys for @repo/shared
 * 
 * Platform-agnostic query keys that can be used across web and mobile.
 * Following the same pattern as the web app for consistency.
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 */

import { TargetType, ReactionType } from '../types/enums';

export const queryKeys = {
  // ==================== User ====================
  user: {
    all: ['user'] as const,
    detail: (userId: string) => [...queryKeys.user.all, userId] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    friends: (userId: string) =>
      [...queryKeys.user.all, userId, 'friends'] as const,
  },

  // ==================== Posts ====================
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.posts.lists(), userId] as const,
    myPosts: () => [...queryKeys.posts.lists(), 'me'] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (postId: string) => [...queryKeys.posts.details(), postId] as const,
    editHistories: (postId: string) =>
      [...queryKeys.posts.detail(postId), 'edit-histories'] as const,
    byGroup: (groupId: string) =>
      [...queryKeys.posts.all, 'group', groupId] as const,
    groupPending: (groupId: string) =>
      [...queryKeys.posts.byGroup(groupId), 'pending'] as const,
  },

  // ==================== Reactions ====================
  reactions: {
    all: ['reactions'] as const,
    list: (
      targetId: string,
      targetType?: TargetType,
      reactionType?: ReactionType,
    ) =>
      [
        ...queryKeys.reactions.all,
        targetId,
        ...(targetType !== undefined ? [targetType] : []),
        ...(reactionType !== undefined ? [reactionType] : []),
      ] as const,
  },

  // ==================== Comments ====================
  comments: {
    all: ['comments'] as const,
    lists: () => [...queryKeys.comments.all, 'list'] as const,
    detail: (commentId: string) =>
      [...queryKeys.comments.all, 'detail', commentId] as const,
    byPost: (postId: string) =>
      [...queryKeys.comments.all, 'post', postId] as const,
    replies: (commentId: string) =>
      [...queryKeys.comments.all, 'replies', commentId] as const,
    list: (rootId: string, rootType?: string, parentId?: string) =>
      [
        ...queryKeys.comments.all,
        rootId,
        ...(rootType !== undefined ? [rootType] : []),
        ...(parentId !== undefined ? [parentId] : []),
      ] as const,
  },

  // ==================== Notifications ====================
  notifications: {
    all: ['notifications'] as const,
    list: (userId?: string) =>
      [
        ...queryKeys.notifications.all,
        ...(userId !== undefined ? [userId] : []),
      ] as const,
    unreadCount: () =>
      [...queryKeys.notifications.all, 'unread-count'] as const,
  },

  // ==================== Feed ====================
  feed: {
    all: ['feed'] as const,
    personal: (emotion?: string) =>
      [...queryKeys.feed.all, 'personal', emotion ?? 'ALL'] as const,
    trending: (emotion?: string) =>
      [...queryKeys.feed.all, 'trending', emotion ?? 'ALL'] as const,
  },

  // ==================== Friends ====================
  friends: {
    all: ['friends'] as const,
    list: (userId?: string) =>
      ['get-friends', ...(userId !== undefined ? [userId] : [])] as const,
    userFriends: (userId: string) => ['get-user-friends', userId] as const,
    requests: () => ['friend-requests'] as const,
    suggestions: (query?: unknown) =>
      ['friend-suggestions', ...(query !== undefined ? [query] : [])] as const,
    analytics: (days?: number) =>
      [
        'friend-recommendation-analytics',
        ...(typeof days === 'number' ? [days] : []),
      ] as const,
    blocked: () => ['blocked-users'] as const,
    relationshipStatus: (targetId: string) =>
      [...queryKeys.friends.all, 'status', targetId] as const,
  },

  // ==================== Conversations ====================
  conversations: {
    all: ['conversations'] as const,
    list: () => [...queryKeys.conversations.all, 'list'] as const,
    detail: (conversationId: string) =>
      [...queryKeys.conversations.all, conversationId] as const,
  },

  // ==================== Messages ====================
  messages: {
    all: ['messages'] as const,
    list: (conversationId: string) =>
      [...queryKeys.messages.all, conversationId] as const,
  },

  // ==================== Search ====================
  search: {
    all: ['search'] as const,
    users: (query: string) =>
      [...queryKeys.search.all, 'users', query] as const,
    posts: (query: string) =>
      [...queryKeys.search.all, 'posts', query] as const,
    groups: (query: string) =>
      [...queryKeys.search.all, 'groups', query] as const,
  },

  // ==================== Chatbot ====================
  chatbot: {
    all: ['chatbot'] as const,
    history: (userId: string, pageSize?: number) =>
      [
        ...queryKeys.chatbot.all,
        'history',
        userId,
        ...(typeof pageSize === 'number' ? [pageSize] : []),
      ] as const,
  },

  // ==================== Groups ====================
  groups: {
    all: ['groups'] as const,
    lists: () => [...queryKeys.groups.all, 'list'] as const,
    myGroups: () => ['get-my-groups'] as const,
    invited: (query?: unknown) =>
      ['get-invited-groups', ...(query !== undefined ? [query] : [])] as const,
    detail: (groupId: string) => ['group', groupId] as const,
    members: (groupId: string, filter?: string) =>
      [
        'group-members',
        groupId,
        ...(filter !== undefined ? [filter] : []),
      ] as const,
    joinRequests: (groupId: string, filter?: string) =>
      [
        'group-join-requests',
        groupId,
        ...(filter !== undefined ? [filter] : []),
      ] as const,
    logs: (groupId: string, filter?: string) =>
      [
        'group-logs',
        groupId,
        ...(filter !== undefined ? [filter] : []),
      ] as const,
    settings: (groupId: string) => ['group-settings', groupId] as const,
    recommended: (query?: unknown) =>
      ['recommended-groups', ...(query !== undefined ? [query] : [])] as const,
  },

  // ==================== Shares ====================
  shares: {
    all: ['shares'] as const,
    detail: (shareId: string) => ['share', shareId] as const,
    byPost: (postId: string) => [...queryKeys.shares.all, postId] as const,
    byUser: (userId: string) => [...queryKeys.shares.all, userId] as const,
  },

  // ==================== Reports ====================
  reports: {
    all: ['reports'] as const,
    list: () => [...queryKeys.reports.all, 'list'] as const,
    detail: (reportId: string) => [...queryKeys.reports.all, reportId] as const,
  },

  // ==================== Admin ====================
  admin: {
    all: ['admin'] as const,
    dashboard: () => [...queryKeys.admin.all, 'dashboard'] as const,
    users: (query?: unknown) =>
      [
        ...queryKeys.admin.all,
        'users',
        ...(query !== undefined ? [query] : []),
      ] as const,
    groups: (query?: unknown) =>
      [
        ...queryKeys.admin.all,
        'groups',
        ...(query !== undefined ? [query] : []),
      ] as const,
    logs: (query?: unknown) =>
      [
        ...queryKeys.admin.all,
        'logs',
        ...(query !== undefined ? [query] : []),
      ] as const,
  },

  // ==================== Emotion Journal ====================
  emotionJournal: {
    all: ['emotion-journal'] as const,
    entries: (query?: unknown) =>
      [
        ...queryKeys.emotionJournal.all,
        'entries',
        ...(query !== undefined ? [query] : []),
      ] as const,
    analytics: () => [...queryKeys.emotionJournal.all, 'analytics'] as const,
  },
} as const;

/**
 * Type-safe query key factory
 * Usage example:
 * 
 * ```ts
 * const postKey = queryKeys.posts.detail('post-123')
 * const reactionsKey = queryKeys.reactions.list('target-id', TargetType.POST)
 * ```
 */
export type QueryKeys = typeof queryKeys;

/**
 * Mutation Keys Factory
 * 
 * Centralized mutation keys for consistent mutation tracking and management.
 * Benefits:
 * - Enable useMutationState for cross-component mutation tracking
 * - Consistent naming across the application
 * - Type-safe mutation key access
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/mutations
 */
export const mutationKeys = {
  // ==================== Posts ====================
  posts: {
    create: ['posts', 'create'] as const,
    update: (postId: string) => ['posts', 'update', postId] as const,
    delete: (postId: string) => ['posts', 'delete', postId] as const,
  },

  // ==================== Comments ====================
  comments: {
    create: ['comments', 'create'] as const,
    update: (commentId: string) => ['comments', 'update', commentId] as const,
    delete: (commentId: string) => ['comments', 'delete', commentId] as const,
  },

  // ==================== Reactions ====================
  reactions: {
    react: ['reactions', 'react'] as const,
    unreact: ['reactions', 'unreact'] as const,
  },

  // ==================== Friends ====================
  friends: {
    send: ['friends', 'send'] as const,
    dismiss: ['friends', 'dismiss'] as const,
    accept: ['friends', 'accept'] as const,
    decline: ['friends', 'decline'] as const,
    cancel: ['friends', 'cancel'] as const,
    remove: ['friends', 'remove'] as const,
    block: ['friends', 'block'] as const,
    unblock: ['friends', 'unblock'] as const,
  },

  // ==================== Groups ====================
  groups: {
    create: ['groups', 'create'] as const,
    update: (groupId: string) => ['groups', 'update', groupId] as const,
    delete: (groupId: string) => ['groups', 'delete', groupId] as const,
    join: (groupId: string) => ['groups', 'join', groupId] as const,
    leave: (groupId: string) => ['groups', 'leave', groupId] as const,
  },

  // ==================== Messages ====================
  messages: {
    send: ['messages', 'send'] as const,
    delete: (messageId: string) => ['messages', 'delete', messageId] as const,
  },
} as const;
