'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AvatarProvider } from './avatar-context';
import { UserSnapshotDTO } from '@repo/shared';

interface AvatarRootProps {
  userId: string;
  user?: UserSnapshotDTO;
  size?: 'small' | 'medium' | 'large';
  hasBorder?: boolean;
  isClickable?: boolean;
  reactionEmoji?: string;
  children: React.ReactNode;
  className?: string;
  onImageClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const AvatarRoot = ({
  userId,
  user,
  size = 'medium',
  hasBorder = false,
  isClickable = true,
  reactionEmoji,
  children,
  className = '',
  onImageClick,
}: AvatarRootProps) => {
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isClickable) return;
      if (onImageClick) {
        onImageClick(e);
        return;
      }
      e.stopPropagation();
      router.push(`/profile/${userId}`);
    },
    [router, userId, isClickable, onImageClick]
  );

  return (
    <AvatarProvider
      value={{
        userId,
        user,
        size,
        hasBorder,
        isClickable,
        reactionEmoji,
        onImageClick: handleClick,
      }}
    >
      <div className={`flex items-center gap-3 ${className}`}>{children}</div>
    </AvatarProvider>
  );
};
