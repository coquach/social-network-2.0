/**
 * Centralized React Query Keys
 * 
 * This file contains all query keys used across the application.
 * Centralizing query keys ensures:
 * - Consistent cache invalidation
 * - Easier refactoring
 * - Type-safe query key access
 * - Better organization
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 */

import { TargetType, ReactionType } from '@/models/social/enums/social.enum';
import { CursorPagination } from './cursor-pagination.dto';

export const queryKeys = {
  // ==================== User ====================
  user: {
    all: ['user'] as const,
    detail: (userId: string) => [...queryKeys.user.all, userId] as const,
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
    list: (targetId: string, targetType?: TargetType, reactionType?: ReactionType) => 
      [
        ...queryKeys.reactions.all, 
        targetId, 
        ...(targetType !== undefined ? [targetType] : []),
        ...(reactionType !== undefined ? [reactionType] : [])
      ] as const,
  },

  // ==================== Comments ====================
  comments: {
    all: ['comments'] as const,
    list: (rootId: string, rootType?: string, parentId?: string) => 
      [
        ...queryKeys.comments.all, 
        rootId, 
        ...(rootType !== undefined ? [rootType] : []),
        ...(parentId !== undefined ? [parentId] : [])
      ] as const,
  },

  // ==================== Shares ====================
  shares: {
    all: ['shares'] as const,
    detail: (shareId: string) => ['share', shareId] as const,
    byPost: (postId: string) => [...queryKeys.shares.all, postId] as const,
    byUser: (userId: string) => [...queryKeys.shares.all, userId] as const,
  },

  // ==================== Notifications ====================
  notifications: {
    all: ['notifications'] as const,
    list: (userId: string) => [...queryKeys.notifications.all, userId] as const,
  },

  // ==================== Feed ====================
  feed: {
    all: ['feed'] as const,
    personal: (emotion?: string) => 
      ['my-feed', emotion ?? 'ALL'] as const,
    trending: (emotion?: string) => 
      ['trending-feed', emotion ?? 'ALL'] as const,
  },

  // ==================== Friends ====================
  friends: {
    all: ['friends'] as const,
    list: (userId?: string) => 
      ['get-friends', ...(userId !== undefined ? [userId] : [])] as const,
    userFriends: (userId: string) => 
      ['get-user-friends', userId] as const,
    requests: () => ['friend-requests'] as const,
    suggestions: (query?: CursorPagination) => 
      ['friend-suggestions', ...(query !== undefined ? [query] : [])] as const,
    blocked: () => ['blocked-users'] as const,
  },

  // ==================== Groups ====================
  groups: {
    all: ['groups'] as const,
    myGroups: () => ['get-my-groups'] as const,
    invited: (query?: CursorPagination) => 
      ['get-invited-groups', ...(query !== undefined ? [query] : [])] as const,
    detail: (groupId: string) => ['group', groupId] as const,
    members: (groupId: string, filter?: string) => 
      ['group-members', groupId, ...(filter !== undefined ? [filter] : [])] as const,
    joinRequests: (groupId: string, filter?: string) => 
      ['group-join-requests', groupId, ...(filter !== undefined ? [filter] : [])] as const,
    logs: (groupId: string, filter?: string) => 
      ['group-logs', groupId, ...(filter !== undefined ? [filter] : [])] as const,
    settings: (groupId: string) => 
      ['group-settings', groupId] as const,
    recommended: (query?: CursorPagination) => 
      ['recommended-groups', ...(query !== undefined ? [query] : [])] as const,
  },

  // ==================== Conversations ====================
  conversations: {
    all: ['conversations'] as const,
    list: () => [...queryKeys.conversations.all] as const,
    detail: (conversationId: string) => 
      ['conversation', conversationId] as const,
  },

  // ==================== Messages ====================
  messages: {
    all: ['messages'] as const,
    list: (conversationId: string) => 
      [...queryKeys.messages.all, { conversationId }] as const,
  },

  // ==================== Search ====================
  search: {
    all: ['search'] as const,
    posts: (filter: string) => 
      [...queryKeys.search.all, 'posts', filter] as const,
    groups: (filter: string) => 
      [...queryKeys.search.all, 'groups', filter] as const,
    users: (filter: string) => 
      [...queryKeys.search.all, 'users', filter] as const,
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
      [...queryKeys.admin.all, 'users', ...(query !== undefined ? [query] : [])] as const,
    groups: (query?: unknown) => 
      [...queryKeys.admin.all, 'groups', ...(query !== undefined ? [query] : [])] as const,
    logs: (query?: unknown) => 
      [...queryKeys.admin.all, 'logs', ...(query !== undefined ? [query] : [])] as const,
  },

  // ==================== Emotion Journal ====================
  emotionJournal: {
    all: ['emotion-journal'] as const,
    entries: (query?: unknown) => 
      [...queryKeys.emotionJournal.all, 'entries', ...(query !== undefined ? [query] : [])] as const,
    analytics: () => 
      [...queryKeys.emotionJournal.all, 'analytics'] as const,
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
    approve: (postId: string) => ['posts', 'approve', postId] as const,
    reject: (postId: string) => ['posts', 'reject', postId] as const,
  },

  // ==================== Reactions ====================
  reactions: {
    toggle: (targetId: string, targetType: TargetType) => 
      ['reactions', 'toggle', targetId, targetType] as const,
    remove: (targetId: string, targetType: TargetType) => 
      ['reactions', 'remove', targetId, targetType] as const,
  },

  // ==================== Comments ====================
  comments: {
    create: (rootId: string) => ['comments', 'create', rootId] as const,
    update: (commentId: string) => ['comments', 'update', commentId] as const,
    delete: (commentId: string) => ['comments', 'delete', commentId] as const,
  },

  // ==================== Shares ====================
  shares: {
    create: (postId: string) => ['shares', 'create', postId] as const,
    delete: (shareId: string) => ['shares', 'delete', shareId] as const,
  },

  // ==================== Friends ====================
  friends: {
    sendRequest: (userId: string) => ['friends', 'request', userId] as const,
    acceptRequest: (userId: string) => ['friends', 'accept', userId] as const,
    rejectRequest: (userId: string) => ['friends', 'reject', userId] as const,
    cancelRequest: (userId: string) => ['friends', 'cancel', userId] as const,
    unfriend: (userId: string) => ['friends', 'unfriend', userId] as const,
    block: (userId: string) => ['friends', 'block', userId] as const,
    unblock: (userId: string) => ['friends', 'unblock', userId] as const,
  },

  // ==================== Groups ====================
  groups: {
    create: ['groups', 'create'] as const,
    update: (groupId: string) => ['groups', 'update', groupId] as const,
    delete: (groupId: string) => ['groups', 'delete', groupId] as const,
    join: (groupId: string) => ['groups', 'join', groupId] as const,
    leave: (groupId: string) => ['groups', 'leave', groupId] as const,
    invite: (groupId: string) => ['groups', 'invite', groupId] as const,
    acceptInvite: (groupId: string) => ['groups', 'accept-invite', groupId] as const,
    declineInvite: (groupId: string) => ['groups', 'decline-invite', groupId] as const,
    approveJoin: (groupId: string) => ['groups', 'approve-join', groupId] as const,
    rejectJoin: (groupId: string) => ['groups', 'reject-join', groupId] as const,
    updateMember: (groupId: string, userId: string) => 
      ['groups', 'update-member', groupId, userId] as const,
    removeMember: (groupId: string, userId: string) => 
      ['groups', 'remove-member', groupId, userId] as const,
    banMember: (groupId: string, userId: string) => 
      ['groups', 'ban-member', groupId, userId] as const,
    unbanMember: (groupId: string, userId: string) => 
      ['groups', 'unban-member', groupId, userId] as const,
  },

  // ==================== Messages ====================
  messages: {
    send: (conversationId: string) => ['messages', 'send', conversationId] as const,
    delete: (messageId: string) => ['messages', 'delete', messageId] as const,
    react: (messageId: string) => ['messages', 'react', messageId] as const,
  },

  // ==================== Conversations ====================
  conversations: {
    create: ['conversations', 'create'] as const,
    update: (conversationId: string) => ['conversations', 'update', conversationId] as const,
    delete: (conversationId: string) => ['conversations', 'delete', conversationId] as const,
    leave: (conversationId: string) => ['conversations', 'leave', conversationId] as const,
    markRead: (conversationId: string) => ['conversations', 'mark-read', conversationId] as const,
  },

  // ==================== Notifications ====================
  notifications: {
    markRead: (notificationId: string) => ['notifications', 'mark-read', notificationId] as const,
    markAllRead: ['notifications', 'mark-all-read'] as const,
  },

  // ==================== Admin ====================
  admin: {
    users: {
      create: ['admin', 'users', 'create'] as const,
      updateRole: (userId: string) => ['admin', 'users', 'update-role', userId] as const,
      ban: (userId: string) => ['admin', 'users', 'ban', userId] as const,
      unban: (userId: string) => ['admin', 'users', 'unban', userId] as const,
    },
    groups: {
      ban: (groupId: string) => ['admin', 'groups', 'ban', groupId] as const,
      unban: (groupId: string) => ['admin', 'groups', 'unban', groupId] as const,
      delete: (groupId: string) => ['admin', 'groups', 'delete', groupId] as const,
    },
    posts: {
      delete: (postId: string) => ['admin', 'posts', 'delete', postId] as const,
      restore: (postId: string) => ['admin', 'posts', 'restore', postId] as const,
    },
  },
} as const;

/**
 * Type-safe mutation key factory
 */
export type MutationKeys = typeof mutationKeys;
