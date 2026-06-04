import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '~/components/avatar';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';

import type { UserDTO } from '@repo/shared';

type Props = {
  user: UserDTO;
  onPress?: (user: UserDTO) => void;
};

function SearchUserItemComponent({ user, onPress }: Props) {
  const router = useRouter();
  const { userId: currentUserId } = useAuth();

  const handlePress = React.useCallback(() => {
    onPress?.(user);
    if (user.id === currentUserId) {
      router.push(`/(main)/profile` as never);
    } else {
      router.push(`/(stack)/user/${user.id}` as never);
    }
  }, [onPress, router, user, currentUserId]);

  const displayName = useMemo(() => {
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

    if (fullName) return fullName;

    return 'Người dùng';
  }, [user.firstName, user.lastName]);

  const userEmail = useMemo(() => {
    return user.email || 'Chưa có email';
  }, [user.email]);

  const userBio = useMemo(() => {
    return user.bio?.trim() || 'Chưa có mô tả';
  }, [user.bio]);

  return (
    <Pressable onPress={handlePress} className="active:opacity-80">
      <View className="overflow-hidden rounded-[20px] border border-transparent bg-app-surface/90 px-3 py-3 dark:bg-app-surface-dark/90">
        <View className="flex-row items-start gap-3">
          <Avatar.Root
            userId={user.id}
            avatarUrl={user.avatarUrl}
            size="large"
          />

          <View className="min-w-0 flex-1">
            {/* Full name */}
            <Text
              className="text-[15px] font-semibold text-app-fg dark:text-app-fg-dark"
              numberOfLines={1}
            >
              {displayName}
            </Text>

            {/* Email */}
            <View className="mt-1 self-start rounded-full bg-app-accent/10 px-2 py-0.5 dark:bg-app-accent/15">
              <Text
                className="text-[12px] font-medium tracking-wide text-app-accent"
                numberOfLines={1}
              >
                {userEmail}
              </Text>
            </View>

            {/* Bio */}
            <Text
              className="mt-2 text-sm leading-5 text-app-muted-fg dark:text-app-muted-fg-dark"
              numberOfLines={2}
            >
              {userBio}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export const SearchUserItem = React.memo(SearchUserItemComponent);
