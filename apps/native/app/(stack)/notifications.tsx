import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, View, ActivityIndicator, Text, FlatList } from 'react-native';
import { useNotifications, useMarkAllNotificationsAsRead, useMarkNotificationAsRead } from '@repo/shared';
import { useRouter } from 'expo-router';

import { AppScreen } from '~/components/ui/app-screen';
import { AppHeader, AppBackButton, AppHeaderIconButton } from '~/components/ui/app-header';

export default function NotificationsScreen() {
  const router = useRouter();
  const [filterUnread, setFilterUnread] = useState<boolean>(false);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching
  } = useNotifications({
    type: undefined,
    isRead: filterUnread ? false : undefined,
    limit: 20
  });

  const { mutate: markAllRead } = useMarkAllNotificationsAsRead();
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => {
        if (!item.isRead) markAsRead(item._id);
      }}
      className={`p-4 border-b border-app-border dark:border-app-border-dark flex-row items-start ${item.isRead ? 'opacity-70' : 'bg-app-primary/5'}`}
    >
      <View className="h-10 w-10 rounded-full bg-app-primary/10 items-center justify-center mr-3 mt-1">
        <Ionicons name="notifications" size={20} color="#0ea5e9" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">
          {item.type}
        </Text>
        <Text className="text-sm text-app-fg-muted dark:text-app-fg-muted-dark mt-1">
          {item.message || 'Bạn có một thông báo mới'}
        </Text>
        <Text className="text-xs text-app-fg-muted dark:text-app-fg-muted-dark mt-2">
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      {!item.isRead && (
        <View className="h-2 w-2 rounded-full bg-app-primary mt-2" />
      )}
    </Pressable>
  );

  return (
    <AppScreen className="px-0 py-0">
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <AppHeader
          leading={<AppBackButton />}
          trailing={
            <AppHeaderIconButton
              icon="settings-outline"
              variant="ghost"
              onPress={() => router.push('/(stack)/notification-settings')}
            />
          }
          contentClassName="items-center justify-center"
        >
          <Text className="text-center text-[22px] font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
            Thông báo
          </Text>
        </AppHeader>

        <View className="flex-row px-4 py-2 gap-2 border-b border-app-border dark:border-app-border-dark">
          <Pressable
            onPress={() => setFilterUnread(!filterUnread)}
            className={`px-4 py-1.5 rounded-full border ${filterUnread ? 'bg-app-primary border-app-primary' : 'border-app-border dark:border-app-border-dark'}`}
          >
            <Text className={`text-sm font-medium ${filterUnread ? 'text-white' : 'text-app-fg dark:text-app-fg-dark'}`}>
              Chưa đọc
            </Text>
          </Pressable>
          <View className="flex-1" />
          <Pressable
            onPress={() => markAllRead()}
            className="px-2 py-1.5 justify-center"
          >
            <Text className="text-sm font-medium text-app-primary">
              Đánh dấu tất cả đã đọc
            </Text>
          </Pressable>
        </View>

        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
          ) : notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center p-8">
              <Ionicons name="notifications-off-outline" size={48} color="#94a3b8" />
              <Text className="text-center text-app-fg-muted dark:text-app-fg-muted-dark mt-4 text-base">
                Không có thông báo nào
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              refreshing={isRefetching}
              onRefresh={refetch}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="py-4">
                    <ActivityIndicator size="small" color="#0ea5e9" />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>
    </AppScreen>
  );
}
