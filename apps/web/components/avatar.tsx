'use client';

// Re-export everything from the new avatar module
export * from './avatar/index';

// Explicit re-exports for convenience variants (helps with TypeScript resolution)
export {
  SimpleAvatar,
  AvatarWithName,
  AvatarWithStatus,
  SmallAvatar,
  MediumAvatar,
  LargeAvatar,
  CommentAvatar,
  PostHeaderAvatar,
  CreatePostAvatar,
  NotificationAvatar,
} from './avatar/variants';

