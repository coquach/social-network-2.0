// Re-export all social enums from shared package
// Using subpath export @repo/shared/types for RSC compatibility
export {
  RootType,
  TargetType,
  Audience,
  Emotion,
  EventType,
  ReactionType,
  MediaType,
  PostGroupStatus,
  MessageStatus,
  NotificationStatus,
} from '@repo/shared';

export type { MediaDTO } from '@repo/shared';
