'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { useUser, usePresenceStore } from '@repo/shared';
import { useAvatarContext } from './avatar-context';
import { BLUR_PLACEHOLDERS } from '@/lib/blur-placeholder';

interface AvatarImageProps {
  showOnlineStatus?: boolean;
  className?: string;
}

export const AvatarImage = ({
  showOnlineStatus = false,
  className = '',
}: AvatarImageProps) => {
  const { userId, size, hasBorder, reactionEmoji, isClickable, onImageClick } =
    useAvatarContext();
  const { userId: currentUserId } = useAuth();
  const { data: fetchedUser, isLoading } = useUser(userId);
  const isOnline = usePresenceStore((state) => state.isOnline(userId));

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'small':
        return 'h-6 w-6';
      case 'large':
        return 'h-12 w-12';
      default:
        return 'h-8 w-8';
    }
  }, [size]);

  const showOnline = showOnlineStatus && isOnline && userId !== currentUserId && size !== 'small';

  if (isLoading) {
    return (
      <div
        className={`
          ${sizeClasses}
          ${hasBorder ? 'border-2 border-gray-300' : ''} 
          rounded-full
          animate-pulse
          bg-gray-200
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        relative
        ${sizeClasses}
        ${hasBorder ? 'border-2 border-gray-300' : ''} 
        rounded-full
        ${isClickable ? 'cursor-pointer hover:opacity-90' : ''}
        ${className}
      `}
      onClick={onImageClick}
    >
      <Image
        fill
        loading="lazy"
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDERS.avatar}
        style={{
          objectFit: 'cover',
          borderRadius: '100%',
        }}
        alt="Avatar"
        src={fetchedUser?.avatarUrl || '/images/placeholder.png'}
      />

      {reactionEmoji && (
        <div
          className="
            absolute -bottom-1 -right-1 
            bg-white rounded-full shadow-md 
            flex items-center justify-center
            w-5 h-5 text-sm
          "
        >
          {reactionEmoji}
        </div>
      )}

      {showOnline && (
        <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-white rounded-full w-3 h-3" />
      )}
    </div>
  );
};
