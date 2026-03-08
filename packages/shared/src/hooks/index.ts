/**
 * React Query Hooks for @repo/shared
 * 
 * Platform-agnostic hooks that work with React Query.
 * These hooks use the services layer and provide caching, optimistic updates,
 * and automatic refetching.
 */

// Query keys
export * from './query-keys';

// Post hooks
export * from './usePost';

// User hooks
export * from './useUser';

// Comment hooks
export * from './useComment';

// Reaction hooks
export * from './useReaction';

// Share hooks
export * from './useShare';

// Notification hooks
export * from './useNotification';

// Message hooks
export * from './useMessage';

// Conversation hooks
export * from './useConversation';

// Friend hooks
export * from './useFriend';

// Feed hooks
export * from './useFeed';

// Group hooks
export * from './useGroup';

// Search hooks
export * from './useSearch';

// Report hooks
export * from './useReport';

// UI utility hooks (web-only, requires DOM)
// Note: Import these directly from './useUI' in web apps only
// export * from './useUI';
