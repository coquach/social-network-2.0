import { useAuth } from '@clerk/expo';
import { useFocusEffect } from '@react-navigation/native';
import {
  type MessageDTO,
  useConversation,
  useCurrentUser,
  useMarkConversationAsRead,
  useMessages,
  usePresenceStore,
  useSendMessage,
  useUser,
} from '@repo/shared';
import { useLocalSearchParams } from 'expo-router';
import { Spinner } from 'heroui-native/spinner';
import React from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import { DirectChatAvatar, GroupChatAvatar } from '~/components/chat/chat-avatar';
import { ChatComposer } from '~/components/chat/chat-composer';
import { getConversationName, getConversationOtherUserId } from '~/components/chat/chat-helpers';
import { ChatMessageBubble } from '~/components/chat/chat-message-bubble';
import { AppCard } from '~/components/ui/app-card';
import { AppScreen } from '~/components/ui/app-screen';
import { AppHeaderIconButton, AppHeader } from '~/components/ui/app-header';
import { usePresenceChannel } from '~/providers/presence-provider';
import { useSocket } from '~/providers/socket-provider';

export default function ChatConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { userId } = useAuth();
  const { chatSocket } = useSocket();
  const { data: currentUser } = useCurrentUser();
  const [composerValue, setComposerValue] = React.useState('');
  const listRef = React.useRef<FlatList<MessageDTO>>(null);

  const {
    data: conversation,
    isLoading: isConversationLoading,
    refetch: refetchConversation,
  } = useConversation(conversationId ?? '', {
    enabled: Boolean(conversationId),
  });
  const {
    data: messagesPage,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useMessages(conversationId ?? '', {
    limit: 30,
  });

  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage(conversationId ?? '');
  const { mutate: markConversationAsRead } = useMarkConversationAsRead();

  const otherUserId = React.useMemo(() => {
    if (!conversation) {
      return null;
    }

    return getConversationOtherUserId(conversation, userId ?? null);
  }, [conversation, userId]);

  const { data: otherUser } = useUser(otherUserId ?? '', {
    enabled: Boolean(otherUserId),
  });
  const presence = usePresenceStore((state) =>
    otherUserId ? state.getById(otherUserId) : undefined,
  );

  const messages = React.useMemo(() => {
    const items = messagesPage?.pages.flatMap((page) => page.data) ?? [];
    return [...items].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [messagesPage?.pages]);

  const participantIds = React.useMemo(() => {
    return (conversation?.participants ?? []).filter((participantId) => participantId !== userId);
  }, [conversation?.participants, userId]);

  usePresenceChannel(participantIds);

  const participantMap = React.useMemo(() => {
    const map = new Map<string, { name: string; avatarUrl?: string }>();

    if (currentUser?.id) {
      const ownName = `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Ban';
      map.set(currentUser.id, {
        name: ownName,
        avatarUrl: currentUser.avatarUrl,
      });
    }

    if (otherUser?.id) {
      const otherName = `${otherUser.firstName} ${otherUser.lastName}`.trim() || 'Nguoi dung';
      map.set(otherUser.id, {
        name: otherName,
        avatarUrl: otherUser.avatarUrl,
      });
    }

    return map;
  }, [currentUser, otherUser]);

  const conversationName = conversation
    ? getConversationName(conversation, otherUser)
    : 'Cuoc tro chuyen';

  useFocusEffect(
    React.useCallback(() => {
      if (!conversationId || !chatSocket) {
        return undefined;
      }

      chatSocket.emit('conversation.join', { conversationId });

      return () => {
        chatSocket.emit('conversation.leave', { conversationId });
      };
    }, [chatSocket, conversationId]),
  );

  React.useEffect(() => {
    if (!chatSocket || !conversationId) {
      return;
    }

    const handleRealtimeRefresh = (payload?: { conversationId?: string }) => {
      if (payload?.conversationId && payload.conversationId !== conversationId) {
        return;
      }

      void refetchMessages();
      void refetchConversation();
    };

    chatSocket.on('message.new', handleRealtimeRefresh);
    chatSocket.on('message.deleted', handleRealtimeRefresh);
    chatSocket.on('conversation.updated', handleRealtimeRefresh);
    chatSocket.on('conversation.read', handleRealtimeRefresh);

    return () => {
      chatSocket.off('message.new', handleRealtimeRefresh);
      chatSocket.off('message.deleted', handleRealtimeRefresh);
      chatSocket.off('conversation.updated', handleRealtimeRefresh);
      chatSocket.off('conversation.read', handleRealtimeRefresh);
    };
  }, [chatSocket, conversationId, refetchConversation, refetchMessages]);

  React.useEffect(() => {
    if (!conversationId || messages.length === 0) {
      return;
    }

    markConversationAsRead(conversationId);
  }, [conversationId, markConversationAsRead, messages.length]);

  const handleSend = React.useCallback(async () => {
    const content = composerValue.trim();
    if (!conversationId || content.length === 0) {
      return;
    }

    await sendMessage({
      conversationId,
      content,
    });

    setComposerValue('');

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [composerValue, conversationId, sendMessage]);

  const subtitle = conversation?.isGroup
    ? `${conversation.participants.length} thanh vien`
    : presence?.status === 'online'
      ? 'Dang hoat dong'
      : 'Ngoai tuyen';

  return (
    <AppScreen className="px-0 py-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-app-bg dark:bg-app-bg-dark"
      >
        <View className="flex-1">
          <AppHeader
            variant="bordered"
            trailing={<AppHeaderIconButton icon="ellipsis-horizontal" iconSize={18} />}
            contentClassName="flex-row items-center gap-3"
          >
            <View className="flex-1 flex-row items-center gap-3">
              {conversation?.isGroup ? (
                <GroupChatAvatar conversation={conversation} />
              ) : (
                <DirectChatAvatar
                  name={conversationName}
                  imageUrl={otherUser?.avatarUrl}
                  online={presence?.status === 'online'}
                />
              )}
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="text-base font-semibold text-app-fg dark:text-app-fg-dark"
                >
                  {conversationName}
                </Text>
                <Text
                  numberOfLines={1}
                  className="mt-0.5 text-xs text-app-muted-fg dark:text-app-muted-fg-dark"
                >
                  {subtitle}
                </Text>
              </View>
            </View>
          </AppHeader>

          {isConversationLoading || isMessagesLoading ? (
            <View className="flex-1 items-center justify-center">
              <Spinner size="sm" color="default" />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item._id}
              renderItem={({ item, index }) => {
                const sender = participantMap.get(item.senderId);
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const showAvatar = previousMessage?.senderId !== item.senderId;

                return (
                  <ChatMessageBubble
                    message={item}
                    senderName={sender?.name ?? 'Nguoi dung'}
                    senderAvatarUrl={sender?.avatarUrl}
                    showAvatar={showAvatar}
                  />
                );
              }}
              contentContainerStyle={{
                paddingVertical: 18,
                paddingBottom: 28,
                gap: 12,
              }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                listRef.current?.scrollToEnd({ animated: true });
              }}
              ListEmptyComponent={
                <AppCard className="mx-4 rounded-[32px] px-6 py-10">
                  <Text className="text-center text-base font-semibold text-app-fg dark:text-app-fg-dark">
                    Chua co tin nhan nao
                  </Text>
                  <Text className="mt-2 text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                    Gui loi chao dau tien de bat dau cuoc tro chuyen.
                  </Text>
                </AppCard>
              }
            />
          )}

          <ChatComposer
            value={composerValue}
            onChange={setComposerValue}
            onSend={() => {
              void handleSend();
            }}
            disabled={isSending || !conversationId}
          />
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
