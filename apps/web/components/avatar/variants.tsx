'use client';

import { Avatar } from './index';

/**
 * Convenience variants for common Avatar use cases
 * These provide pre-configured compositions for typical scenarios
 */

// Simple avatar - just the image
interface SimpleAvatarProps {
  userId: string;
  size?: 'small' | 'medium' | 'large';
  hasBorder?: boolean;
  reactionEmoji?: string;
  className?: string;
}

export const SimpleAvatar = ({
  userId,
  size = 'medium',
  hasBorder = false,
  reactionEmoji,
  className,
}: SimpleAvatarProps) => (
  <Avatar userId={userId} size={size} hasBorder={hasBorder} reactionEmoji={reactionEmoji} className={className}>
    <Avatar.Image showOnlineStatus={size !== 'small'} />
  </Avatar>
);

// Avatar with name
interface AvatarWithNameProps {
  userId: string;
  size?: 'small' | 'medium' | 'large';
  hasBorder?: boolean;
  reactionEmoji?: string;
  className?: string;
}

export const AvatarWithName = ({
  userId,
  size = 'medium',
  hasBorder = false,
  reactionEmoji,
  className,
}: AvatarWithNameProps) => (
  <Avatar userId={userId} size={size} hasBorder={hasBorder} reactionEmoji={reactionEmoji} className={className}>
    <Avatar.Image showOnlineStatus={size !== 'small'} />
    <Avatar.Name />
  </Avatar>
);

// Avatar with name and status
interface AvatarWithStatusProps {
  userId: string;
  size?: 'small' | 'medium' | 'large';
  hasBorder?: boolean;
  reactionEmoji?: string;
  className?: string;
}

export const AvatarWithStatus = ({
  userId,
  size = 'medium',
  hasBorder = false,
  reactionEmoji,
  className,
}: AvatarWithStatusProps) => (
  <Avatar userId={userId} size={size} hasBorder={hasBorder} reactionEmoji={reactionEmoji} className={className}>
    <Avatar.Image showOnlineStatus={size !== 'small'} />
    <div className="flex flex-col max-w-[140px]">
      <Avatar.Name />
      <Avatar.Status />
    </div>
  </Avatar>
);

// Pre-sized variants for quick use
export const SmallAvatar = ({ userId, hasBorder = false }: { userId: string; hasBorder?: boolean }) => (
  <Avatar userId={userId} size="small" hasBorder={hasBorder}>
    <Avatar.Image />
  </Avatar>
);

export const MediumAvatar = ({ userId, hasBorder = false }: { userId: string; hasBorder?: boolean }) => (
  <Avatar userId={userId} size="medium" hasBorder={hasBorder}>
    <Avatar.Image showOnlineStatus />
  </Avatar>
);

export const LargeAvatar = ({ userId, hasBorder = false }: { userId: string; hasBorder?: boolean }) => (
  <Avatar userId={userId} size="large" hasBorder={hasBorder}>
    <Avatar.Image showOnlineStatus />
  </Avatar>
);

// Comment avatar - with border and name
export const CommentAvatar = ({ userId }: { userId: string }) => (
  <Avatar userId={userId} size="medium" hasBorder>
    <Avatar.Image showOnlineStatus />
    <Avatar.Name />
  </Avatar>
);

// Post header avatar - large with name
export const PostHeaderAvatar = ({ userId }: { userId: string }) => (
  <Avatar userId={userId} size="large" hasBorder>
    <Avatar.Image showOnlineStatus />
  </Avatar>
);

// Create post avatar - large with border, conditionally show name
export const CreatePostAvatar = ({ userId, showName = false }: { userId: string; showName?: boolean }) => (
  <Avatar userId={userId} size="large" hasBorder>
    <Avatar.Image showOnlineStatus />
    {showName && <Avatar.Name />}
  </Avatar>
);

// Notification avatar - medium with reaction emoji
export const NotificationAvatar = ({
  userId,
  reactionEmoji,
}: {
  userId: string;
  reactionEmoji?: string;
}) => (
  <Avatar userId={userId} size="medium" hasBorder reactionEmoji={reactionEmoji}>
    <Avatar.Image showOnlineStatus />
  </Avatar>
);
