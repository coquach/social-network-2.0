import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useUser } from '@repo/shared';
import { cn } from '~/lib/cn';
import { useAvatarContext } from './avatar-context';

type AvatarNameProps = {
  className?: string;
  numberOfLines?: number;
};

const AvatarNameComponent = ({
  className,
  numberOfLines = 1,
}: AvatarNameProps) => {
  const { userId, displayName: injectedDisplayName } = useAvatarContext();

  const { data: user, isLoading } = useUser(userId);

  const resolvedDisplayName = useMemo(() => {
    if (injectedDisplayName) return injectedDisplayName;

    const first = user?.firstName?.trim();
    const last = user?.lastName?.trim();
    return [first, last].filter(Boolean).join(' ').trim() || 'User';
  }, [injectedDisplayName, user?.firstName, user?.lastName]);

  if (isLoading && !injectedDisplayName) {
    return <View className="h-4 w-24 rounded bg-gray-200 dark:bg-slate-700" />;
  }

  return (
    <Text
      numberOfLines={numberOfLines}
      className={cn(
        'shrink text-sm font-semibold text-app-fg dark:text-app-fg-dark',
        className,
      )}
    >
      {resolvedDisplayName}
    </Text>
  );
};

export const AvatarName = memo(AvatarNameComponent);
