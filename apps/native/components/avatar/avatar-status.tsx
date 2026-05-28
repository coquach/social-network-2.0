import React, { memo } from 'react';
import { Text } from 'react-native';
import { cn } from '~/lib/cn';
import { useAvatarContext } from './avatar-context';

type AvatarStatusProps = {
  className?: string;
  numberOfLines?: number;
};

const AvatarStatusComponent = ({
  className,
  numberOfLines = 1,
}: AvatarStatusProps) => {
  const { isOnline, statusText } = useAvatarContext();

  if (!statusText && typeof isOnline === 'undefined') {
    return null;
  }

  const resolvedStatusText = statusText ?? (isOnline ? 'Online' : 'Offline');

  return (
    <Text
      numberOfLines={numberOfLines}
      className={cn(
        'text-xs',
        isOnline
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-app-muted-fg dark:text-app-muted-fg-dark',
        className,
      )}
    >
      {resolvedStatusText}
    </Text>
  );
};

export const AvatarStatus = memo(AvatarStatusComponent);
