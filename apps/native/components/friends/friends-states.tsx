import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type FriendsEmptyStateProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
};

type FriendsErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function FriendsEmptyState({
  icon,
  title,
  message,
}: FriendsEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-app-surface-elevated dark:bg-app-surface-elevated-dark">
        <Ionicons name={icon} size={34} color="#0ea5e9" />
      </View>
      <Text className="text-center text-[18px] font-extrabold text-app-fg dark:text-app-fg-dark">
        {title}
      </Text>
      <Text className="mt-2 text-center text-[14px] leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
        {message}
      </Text>
    </View>
  );
}

export function FriendsErrorState({ message, onRetry }: FriendsErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
        <Ionicons name="alert-circle-outline" size={34} color="#e11d48" />
      </View>
      <Text className="text-center text-[18px] font-extrabold text-app-fg dark:text-app-fg-dark">
        Không tải được dữ liệu
      </Text>
      <Text className="mt-2 text-center text-[14px] leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-5 h-11 items-center justify-center rounded-full bg-app-primary px-6 active:opacity-80 dark:bg-app-primary-dark"
      >
        <Text className="text-[15px] font-bold text-white">Thử lại</Text>
      </Pressable>
    </View>
  );
}

export function FriendsListFooter({ loading }: { loading: boolean }) {
  if (!loading) {
    return <View className="h-8" />;
  }

  return (
    <View className="items-center py-5">
      <ActivityIndicator size="small" color="#0ea5e9" />
    </View>
  );
}
