import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

import { cn } from '~/lib/cn';

const DEFAULT_AVATAR = Image.resolveAssetSource(
  require('~/assets/images/placeholder.png'),
).uri;
const DEFAULT_COVER = Image.resolveAssetSource(
  require('~/assets/images/placeholder-bg.png'),
).uri;

const cardShadow = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};

export type FriendCardUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  coverImage?: {
    url?: string;
  };
};

export type FriendCardAction = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  variant: 'primary' | 'danger' | 'neutral';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

type FriendCardProps = {
  user: FriendCardUser;
  primaryAction: FriendCardAction;
  secondaryAction?: FriendCardAction;
  meta?: string;
};

const getFullName = (user: FriendCardUser) => {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Người dùng';
};

const getCoverImage = (user: FriendCardUser) => {
  return user.coverImage?.url || user.coverImageUrl || DEFAULT_COVER;
};

const getAvatarImage = (user: FriendCardUser) => {
  return user.avatarUrl || DEFAULT_AVATAR;
};

function FriendActionButton({
  action,
  fullWidth = false,
}: {
  action: FriendCardAction;
  fullWidth?: boolean;
}) {
  const isDanger = action.variant === 'danger';
  const isNeutral = action.variant === 'neutral';
  const iconColor = isDanger || !isNeutral ? '#ffffff' : '#406179';

  return (
    <Pressable
      onPress={action.onPress}
      disabled={action.disabled || action.loading}
      className={cn(
        'h-[43px] flex-row items-center justify-center gap-2 rounded-full px-3 active:opacity-80',
        fullWidth ? 'flex-1' : 'w-[48.5%]',
        action.variant === 'primary' && 'bg-app-primary dark:bg-app-primary-dark',
        action.variant === 'danger' && 'bg-rose-600 dark:bg-rose-500',
        action.variant === 'neutral' &&
          'bg-app-surface-elevated dark:bg-app-surface-elevated-dark',
        (action.disabled || action.loading) && 'opacity-70',
      )}
    >
      {action.loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Ionicons name={action.icon} size={18} color={iconColor} />
      )}
      <Text
        numberOfLines={1}
        className={cn(
          'text-[16px] font-extrabold',
          isNeutral
            ? 'text-app-fg dark:text-app-fg-dark'
            : 'text-white',
        )}
      >
        {action.label}
      </Text>
    </Pressable>
  );
}

export function FriendCard({
  user,
  primaryAction,
  secondaryAction,
  meta,
}: FriendCardProps) {
  return (
    <View
      className="overflow-hidden rounded-2xl bg-app-surface dark:bg-app-surface-dark"
      style={cardShadow}
    >
      <View className="h-[120px] bg-app-surface-elevated dark:bg-app-surface-elevated-dark">
        <Image
          source={{ uri: getCoverImage(user) }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      <Image
        source={{ uri: getAvatarImage(user) }}
        className="absolute left-5 top-[82px] h-[78px] w-[78px] rounded-full border-4 border-app-surface bg-app-surface dark:border-app-surface-dark dark:bg-app-surface-dark"
        resizeMode="cover"
      />

      <View className="px-4 pb-4 pt-[54px]">
        <Text
          numberOfLines={1}
          className="text-[22px] font-extrabold text-app-fg dark:text-app-fg-dark"
        >
          {getFullName(user)}
        </Text>

        {meta ? (
          <Text
            numberOfLines={1}
            className="mt-1 text-[13px] font-medium text-app-muted-fg dark:text-app-muted-fg-dark"
          >
            {meta}
          </Text>
        ) : null}

        <View className="mt-6 flex-row justify-between">
          <FriendActionButton
            action={primaryAction}
            fullWidth={!secondaryAction}
          />
          {secondaryAction ? <FriendActionButton action={secondaryAction} /> : null}
        </View>
      </View>
    </View>
  );
}

export function FriendCardSkeleton() {
  return (
    <View
      className="overflow-hidden rounded-2xl bg-app-surface dark:bg-app-surface-dark"
      style={cardShadow}
    >
      <View className="h-[120px] bg-app-surface-elevated dark:bg-app-surface-elevated-dark" />
      <View className="absolute left-5 top-[82px] h-[78px] w-[78px] rounded-full border-4 border-app-surface bg-app-surface-elevated dark:border-app-surface-dark dark:bg-app-surface-elevated-dark" />
      <View className="px-4 pb-4 pt-[62px]">
        <View className="h-6 w-40 rounded-full bg-app-surface-elevated dark:bg-app-surface-elevated-dark" />
        <View className="mt-7 flex-row justify-between">
          <View className="h-[43px] w-[48.5%] rounded-full bg-app-surface-elevated dark:bg-app-surface-elevated-dark" />
          <View className="h-[43px] w-[48.5%] rounded-full bg-app-surface-elevated dark:bg-app-surface-elevated-dark" />
        </View>
      </View>
    </View>
  );
}
