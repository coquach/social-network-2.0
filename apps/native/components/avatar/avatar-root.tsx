import React, { memo, useCallback, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Pressable, View } from 'react-native';
import { getQueryClient } from '~/lib/query-client';
import { useRouter } from 'expo-router';
import { cn } from '~/lib/cn';
import { AvatarImage } from './avatar-image';
import { AvatarName } from './avatar-name';
import { AvatarStatus } from './avatar-status';
import {
  type AvatarContextValue,
  AvatarProvider,
  type AvatarSize,
} from './avatar-context';

type AvatarRootProps = {
  userId: string;
  size?: AvatarSize;
  hasBorder?: boolean;
  isOnline?: boolean;
  statusText?: string;
  avatarUrl?: string | null;
  displayName?: string | null;
  showName?: boolean;
  showStatus?: boolean;
  showOnlineStatus?: boolean;
  children?: React.ReactNode;
  className?: string;
  imageClassName?: string;
  nameClassName?: string;
  statusClassName?: string;
  onBeforeNavigate?: () => void;
};

const AvatarRootComponent = ({
  userId,
  size = 'medium',
  hasBorder = false,
  isOnline,
  statusText,
  avatarUrl,
  displayName,
  showName = false,
  showStatus = false,
  showOnlineStatus = true,
  children,
  className,
  imageClassName,
  nameClassName,
  statusClassName,
  onBeforeNavigate,
}: AvatarRootProps) => {
  const router = useRouter();
  const queryClient = getQueryClient();

  const handlePress = useCallback(() => {
    onBeforeNavigate?.();
    router.push(`/profile/${userId}` as never);
  }, [router, userId, onBeforeNavigate]);

  const contextValue = useMemo<AvatarContextValue>(
    () => ({
      userId,
      size,
      hasBorder,
      isOnline,
      statusText,
      avatarUrl,
      displayName,
    }),
    [
      avatarUrl,
      displayName,
      handlePress,
      hasBorder,
      isOnline,
      size,
      statusText,
      userId,
    ],
  );

  const shouldRenderDefault = !children;

  return (
    <QueryClientProvider client={queryClient}>
      <AvatarProvider value={contextValue}>
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          className={cn(
            'flex-row items-center gap-2.5 active:opacity-85',
            className,
          )}
        >
          {shouldRenderDefault ? (
            <>
              <AvatarImage
                showOnlineStatus={showOnlineStatus}
                className={imageClassName}
              />

              {showName || showStatus ? (
                <View className="min-w-0 flex-1">
                  {showName ? <AvatarName className={nameClassName} /> : null}
                  {showStatus ? (
                    <AvatarStatus className={statusClassName} />
                  ) : null}
                </View>
              ) : null}
            </>
          ) : (
            children
          )}
        </Pressable>
      </AvatarProvider>
    </QueryClientProvider>
  );
};

export const AvatarRoot = memo(AvatarRootComponent);

export type { AvatarRootProps };
