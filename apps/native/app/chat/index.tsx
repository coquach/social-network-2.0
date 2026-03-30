import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@clerk/expo';
import { useConversations } from '@repo/shared';
import { router } from 'expo-router';
import { Input } from 'heroui-native/input';
import { Spinner } from 'heroui-native/spinner';
import { TextField } from 'heroui-native/text-field';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatConversationRow } from '~/components/chat/chat-conversation-row';
import {
  getConversationName,
  getConversationOtherUserId,
} from '~/components/chat/chat-helpers';
import { AppLoadingBlock } from '~/components/ui/app-loading';
import { AppScreen } from '~/components/ui/app-screen';
import { AppHeaderIconButton, AppHeader } from '~/components/ui/app-header';
import { useSocket } from '~/providers/socket-provider';

export default function ChatInboxScreen() {
  const insets = useSafeAreaInsets();
  const { isSignedIn, userId } = useAuth();
  const { chatSocket } = useSocket();
  const [searchText, setSearchText] = React.useState('');

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversations({ limit: 20 });

  const conversations = React.useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    const items = data?.pages.flatMap((page) => page.data) ?? [];

    if (!keyword) {
      return items;
    }

    return items.filter((conversation) => {
      const name = getConversationName(conversation);
      const preview = conversation.lastMessage?.content ?? '';

      return [name, preview].some((value) =>
        value.toLowerCase().includes(keyword),
      );
    });
  }, [data?.pages, searchText]);

  const hasSearchText = searchText.trim().length > 0;
  const emptyTitle = hasSearchText
    ? 'Không tìm thấy cuộc trò chuyện nào'
    : 'Bạn chưa có cuộc trò chuyện nào';
  const emptyDescription = hasSearchText
    ? 'Hãy thử điều chỉnh từ khóa tìm kiếm của bạn.'
    : 'Khi bạn bắt đầu một cuộc trò chuyện mới, nó sẽ xuất hiện ở đây.';

  const directParticipantIds = React.useMemo(() => {
    return conversations
      .map((conversation) =>
        getConversationOtherUserId(conversation, userId ?? null),
      )
      .filter((value): value is string => Boolean(value));
  }, [conversations, userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (!isSignedIn) {
        router.replace('/(auth)/sign-in');
      }
    }, [isSignedIn]),
  );

  React.useEffect(() => {
    if (!chatSocket) {
      return;
    }

    const handleRealtimeRefresh = () => {
      void refetch();
    };

    chatSocket.on('conversation.created', handleRealtimeRefresh);
    chatSocket.on('conversation.updated', handleRealtimeRefresh);
    chatSocket.on('conversation.deleted', handleRealtimeRefresh);
    chatSocket.on('conversation.memberLeft', handleRealtimeRefresh);
    chatSocket.on('message.new', handleRealtimeRefresh);

    return () => {
      chatSocket.off('conversation.created', handleRealtimeRefresh);
      chatSocket.off('conversation.updated', handleRealtimeRefresh);
      chatSocket.off('conversation.deleted', handleRealtimeRefresh);
      chatSocket.off('conversation.memberLeft', handleRealtimeRefresh);
      chatSocket.off('message.new', handleRealtimeRefresh);
    };
  }, [chatSocket, refetch]);

  React.useEffect(() => {
    if (!chatSocket || directParticipantIds.length === 0) {
      return;
    }

    chatSocket.emit('presence.subscribe', { userIds: directParticipantIds });

    return () => {
      chatSocket.emit('presence.unsubscribe', {
        userIds: directParticipantIds,
      });
    };
  }, [chatSocket, directParticipantIds]);

  return (
    <AppScreen className="px-0 py-0">
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <AppHeader
          title="Trò chuyện"
          trailing={<AppHeaderIconButton icon="settings" />}
        />

        <View className="px-5 pb-4">
          <TextField>
            <Input
              variant="secondary"
              className="min-h-12 rounded-[28px] px-4"
              placeholder="Tìm cuộc trò chuyện"
              value={searchText}
              onChangeText={setSearchText}
            />
          </TextField>
        </View>

        {isLoading ? (
          <AppLoadingBlock label="Đang tải cuộc trò chuyện..." />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ChatConversationRow conversation={item} />
            )}
            contentContainerStyle={{
              flexGrow: conversations.length === 0 ? 1 : 0,
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 28,
              gap: 12,
              justifyContent: conversations.length === 0 ? 'center' : 'flex-start',
            }}
            showsVerticalScrollIndicator={false}
            onRefresh={() => {
              void refetch();
            }}
            refreshing={isRefetching}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4">
                  <Spinner size="sm" color="default" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center ">
                <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-app-primary/12 dark:bg-app-primary-dark/18">
                  <Ionicons
                    name={hasSearchText ? 'search-outline' : 'chatbubbles-outline'}
                    size={28}
                    color="#0ea5e9"
                  />
                </View>
                <Text className="mt-5 text-center text-lg font-bold text-app-fg dark:text-app-fg-dark">
                  {emptyTitle}
                </Text>
                <Text className="mt-2 max-w-[17rem] text-center text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
                  {emptyDescription}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </AppScreen>
  );
}
