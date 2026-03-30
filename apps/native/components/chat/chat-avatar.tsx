import React from 'react';
import { Image, Text, View } from 'react-native';

import { cn } from '~/lib/cn';

type ChatAvatarProps = {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
};

const avatarSizeClassName: Record<NonNullable<ChatAvatarProps['size']>, string> = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

const dotOffsetClassName: Record<NonNullable<ChatAvatarProps['size']>, string> = {
  sm: '-bottom-0.5 -right-0.5 h-3.5 w-3.5',
  md: '-bottom-0.5 -right-0.5 h-4 w-4',
  lg: '-bottom-1 -right-1 h-5 w-5',
};

const getInitials = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return '?';
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
};

export function ChatAvatar({
  name,
  imageUrl,
  size = 'md',
  online = false,
}: ChatAvatarProps) {
  const sizeClassName = avatarSizeClassName[size];
  const dotClassName = dotOffsetClassName[size];

  return (
    <View className="relative">
      <View
        className={cn(
          'items-center justify-center overflow-hidden rounded-full bg-app-primary/15 dark:bg-app-primary-dark/20',
          sizeClassName,
        )}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <Text className="text-sm font-bold text-app-primary dark:text-app-primary-dark">
            {getInitials(name)}
          </Text>
        )}
      </View>

      {online ? (
        <View
          className={cn(
            'absolute rounded-full border-2 border-app-surface bg-emerald-500 dark:border-app-surface-dark',
            dotClassName,
          )}
        />
      ) : null}
    </View>
  );
}
