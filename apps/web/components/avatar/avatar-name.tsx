'use client';

import { useUser } from '@repo/shared';
import { useAvatarContext } from './avatar-context';

interface AvatarNameProps {
  className?: string;
}

export const AvatarName = ({ className = '' }: AvatarNameProps) => {
  const { userId, user, isClickable, onImageClick } = useAvatarContext();
  const { data: fetchedUser, isLoading } = useUser(userId, { enabled: !user });

  if (!user && isLoading) {
    return <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />;
  }

  const firstName = user?.firstName || fetchedUser?.firstName || 'firstName';
  const lastName = user?.lastName || fetchedUser?.lastName || 'lastName';

  return (
    <span
      className={`text-sm text-slate-800 font-semibold truncate ${
        isClickable ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onImageClick}
    >
      {firstName} {lastName}
    </span>
  );
};
