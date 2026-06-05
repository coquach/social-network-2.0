import { Ionicons } from '@expo/vector-icons';
import { getNotificationRoute, useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications } from '@repo/shared';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { AppBackButton, AppHeader, AppHeaderIconButton } from '~/components/ui/app-header';
import { AppScreen } from '~/components/ui/app-screen';
import { formatRelativeTime } from '~/utils/format-relative-time';

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

  const getNotificationProps = (type: string) => {
    switch (type) {
      case 'friendship_request':
        return { title: 'Yêu cầu kết bạn', icon: 'person-add', color: '#0ea5e9', bg: 'bg-sky-500/10' };
      case 'friendship_accept':
        return { title: 'Chấp nhận kết bạn', icon: 'person-add-outline', color: '#10b981', bg: 'bg-emerald-500/10' };
      case 'reaction':
        return { title: 'Tương tác mới', icon: 'heart', color: '#ef4444', bg: 'bg-red-500/10' };
      case 'comment':
        return { title: 'Bình luận mới', icon: 'chatbubble', color: '#3b82f6', bg: 'bg-blue-500/10' };
      case 'reply_comment':
        return { title: 'Phản hồi bình luận', icon: 'chatbubbles', color: '#3b82f6', bg: 'bg-blue-500/10' };
      case 'share':
        return { title: 'Lượt chia sẻ mới', icon: 'share-social', color: '#8b5cf6', bg: 'bg-violet-500/10' };
      case 'follow':
        return { title: 'Người theo dõi mới', icon: 'person-circle', color: '#14b8a6', bg: 'bg-teal-500/10' };
      case 'group_noti':
        return { title: 'Thông báo nhóm', icon: 'people', color: '#f59e0b', bg: 'bg-amber-500/10' };
      case 'group_invite':
        return { title: 'Lời mời vào nhóm', icon: 'mail-open', color: '#f59e0b', bg: 'bg-amber-500/10' };
      case 'post_mention':
        return { title: 'Lượt nhắc đến', icon: 'at', color: '#f59e0b', bg: 'bg-amber-500/10' };
      case 'system':
        return { title: 'Hệ thống', icon: 'information-circle', color: '#64748b', bg: 'bg-slate-500/10' };
      default:
        return { title: 'Thông báo mới', icon: 'notifications', color: '#0ea5e9', bg: 'bg-sky-500/10' };
    }
  };



  const handlePressItem = (item: any) => {
    const isRead = item.isRead ?? item.status === 'read';
    if (!isRead) markAsRead(item._id);

    const route = getNotificationRoute(item, 'native');
    if (route && route !== '/notifications' && route !== '/(stack)/notifications') {
      router.push(route as any);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isRead = item.isRead ?? item.status === 'read';
    const props = getNotificationProps(item.type);
    
    return (
      <Pressable
        onPress={() => handlePressItem(item)}
        className={`p-4 border-b border-app-border dark:border-app-border-dark flex-row items-start ${isRead ? 'bg-app-bg dark:bg-app-bg-dark opacity-80' : 'bg-sky-500/5'}`}
      >
        <View className={`h-11 w-11 rounded-full ${props.bg} items-center justify-center mr-3 mt-0.5`}>
          <Ionicons name={props.icon as any} size={22} color={props.color} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-app-fg dark:text-app-fg-dark">
            {props.title}
          </Text>
          <Text 
            className={`text-sm mt-1 leading-5 ${isRead ? 'text-app-fg-muted dark:text-app-fg-muted-dark' : 'text-app-fg dark:text-app-fg-dark'}`}
          >
            {item.message || 'Bạn có một thông báo mới'}
          </Text>
          <Text className="text-xs text-app-fg-muted dark:text-app-fg-muted-dark mt-2 font-medium">
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        {!isRead && (
          <View className="h-2.5 w-2.5 rounded-full bg-app-primary mt-2 ml-2" />
        )}
      </Pressable>
    );
  };

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
              showsVerticalScrollIndicator={false}
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
