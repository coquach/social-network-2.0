'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetUser } from '@/hooks/use-user-hook';

type DirectConversationAvatarProps = {
  userId?: string;
  className?: string;
};

export const DirectAvatar = ({
  userId,
  className,
}: DirectConversationAvatarProps) => {
  const { data: user } = useGetUser(userId ?? '');

  const url = user?.avatarUrl;
  const initial = (() => {
    if (!user) return 'U';
    const full = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return (full || user.firstName || 'U').trim().charAt(0).toUpperCase();
  })();

  return (
    <Avatar className={className ?? 'h-10 w-10 border-gray-300 border-2'}>
      {url && <AvatarImage src={url} alt={initial} />}
      <AvatarFallback>images/placeholder.png</AvatarFallback>
    </Avatar>
  );
};
