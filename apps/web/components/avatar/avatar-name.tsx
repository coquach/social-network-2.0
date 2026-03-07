'use client';

import { useUser } from '@repo/shared';
import { useAvatarContext } from './avatar-context';

interface AvatarNameProps {
  className?: string;
}

export const AvatarName = ({ className = '' }: AvatarNameProps) => {
  const { userId, isClickable, onImageClick } = useAvatarContext();
  const { data: fetchedUser, isLoading } = useUser(userId);

  if (isLoading) {
    return <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />;
  }

  return (
    <span
      className={`text-sm text-slate-800 font-semibold truncate ${
        isClickable ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onImageClick}
    >
      {fetchedUser?.firstName || 'firstName'} {fetchedUser?.lastName || 'lastName'}
    </span>
  );
};
