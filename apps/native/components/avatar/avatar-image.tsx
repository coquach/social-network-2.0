import React, { memo, useMemo } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useUser } from '@repo/shared';
import { cn } from '~/lib/cn';
import { type AvatarSize, useAvatarContext } from './avatar-context';

type AvatarImageProps = {
  showOnlineStatus?: boolean;
  className?: string;
};

const SIZE_CLASS_MAP: Record<AvatarSize, string> = {
  small: 'h-8 w-8',
  medium: 'h-10 w-10',
  large: 'h-14 w-14',
};

const DOT_SIZE_CLASS_MAP: Record<AvatarSize, string> = {
  small: 'h-2.5 w-2.5 border',
  medium: 'h-3.5 w-3.5 border-2',
  large: 'h-4 w-4 border-2',
};

const AvatarImageComponent = ({
  showOnlineStatus = false,
  className,
}: AvatarImageProps) => {
  const {
    userId,
    size,
    hasBorder,
    isOnline,
    avatarUrl: injectedAvatarUrl,
    displayName: injectedDisplayName,
  } = useAvatarContext();

  const { data: user, isLoading } = useUser(userId);

  const resolvedAvatarUrl = injectedAvatarUrl ?? user?.avatarUrl;
  const resolvedDisplayName = useMemo(() => {
    if (injectedDisplayName) return injectedDisplayName;

    const first = user?.firstName?.trim();
    const last = user?.lastName?.trim();
    return [first, last].filter(Boolean).join(' ').trim();
  }, [injectedDisplayName, user?.firstName, user?.lastName]);

  const initials = useMemo(() => {
    const parts = resolvedDisplayName?.split(' ').filter(Boolean);
    if (!parts?.length) return userId.slice(0, 1).toUpperCase() || 'U';
    if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }, [resolvedDisplayName, userId]);

  const shouldShowOnlineDot = Boolean(showOnlineStatus && isOnline);

  const rootClassName = cn(
    'relative overflow-visible rounded-full',
    SIZE_CLASS_MAP[size],
    hasBorder && 'border border-app-border dark:border-app-border-dark',
    className,
  );

  const imageContent = (
    <>
      {isLoading && !resolvedAvatarUrl ? (
        <View className="h-full w-full items-center justify-center rounded-full bg-app-surface dark:bg-app-surface-dark">
          <ActivityIndicator
            size="small"
            className="text-app-primary dark:text-app-primary-dark"
          />
        </View>
      ) : resolvedAvatarUrl ? (
        <Image
          source={{ uri: resolvedAvatarUrl, cache: 'force-cache' }}
          className="h-full w-full rounded-full"
          accessibilityLabel="User avatar"
        />
      ) : (
        <View className="h-full w-full items-center justify-center rounded-full bg-app-primary/15 dark:bg-app-primary-dark/20">
          <Text className="text-xs font-bold text-app-primary dark:text-app-primary-dark">
            {initials}
          </Text>
        </View>
      )}

      {shouldShowOnlineDot ? (
        <View
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-app-bg bg-emerald-500 dark:border-app-bg-dark',
            DOT_SIZE_CLASS_MAP[size],
          )}
        />
      ) : null}
    </>
  );

  return <View className={rootClassName}>{imageContent}</View>;
};

export const AvatarImage = memo(AvatarImageComponent);
