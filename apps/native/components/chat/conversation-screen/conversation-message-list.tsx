import {
  FlashList,
  type FlashListRef,
  type ListRenderItemInfo,
} from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import type { MessageDTO } from "@repo/shared";
import { Button } from "heroui-native/button";
import { Spinner } from "heroui-native/spinner";
import React from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { ChatMessageBubble } from "~/components/chat/chat-message-bubble";
import { formatMessageDateLabel, getChatDayKey } from "~/lib/chat-date-utils";
import { AppCard } from "~/components/ui/app-card";

type ParticipantVisual = {
  name: string;
  avatarUrl?: string;
};

type ConversationMessageListProps = {
  messages: MessageDTO[];
  currentUserId?: string | null;
  participantMap: Map<string, ParticipantVisual>;
  lastSeenMap: Map<string, string>;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadEarlier?: () => void;
  onReachedBottom?: () => void;
  onLongPressMessage?: (message: MessageDTO) => void;
};

type MessageListRow =
  | {
      id: string;
      type: "date";
      label: string;
    }
  | {
      id: string;
      type: "message";
      message: MessageDTO;
      senderName: string;
      senderAvatarUrl?: string;
      showAvatar: boolean;
      seenUsers: ParticipantVisual[];
      seenOverflow: number;
      isLastMessage: boolean;
    };

function DateDivider({ label }: { label: string }) {
  return (
    <Animated.View entering={FadeIn.duration(160)} className="items-center py-4">
      <View className="rounded-full bg-app-surface-elevated px-3 py-1.5 dark:bg-app-surface-elevated-dark">
        <Text className="text-[11px] font-semibold text-app-muted-fg dark:text-app-muted-fg-dark">
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View className="items-center justify-center px-6">
      <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-app-primary/12 dark:bg-app-primary-dark/16">
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={28}
          color="#0ea5e9"
        />
      </View>
      <Text className="mt-5 text-center text-lg font-bold text-app-fg dark:text-app-fg-dark">
        Chưa có tin nhắn nào
      </Text>
      <Text className="mt-2 max-w-[19rem] text-center text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
        Hãy gửi lời chào đầu tiên để bắt đầu cuộc trò chuyện này.
      </Text>
    </View>
  );
}

const buildRows = (
  messages: MessageDTO[],
  participantMap: Map<string, ParticipantVisual>,
  lastSeenMap: Map<string, string>,
): MessageListRow[] => {
  const rows: MessageListRow[] = [];
  const seenByMessageId = new Map<string, string[]>();

  lastSeenMap.forEach((lastSeenMessageId, userId) => {
    if (!lastSeenMessageId) {
      return;
    }

    const current = seenByMessageId.get(lastSeenMessageId) ?? [];
    current.push(userId);
    seenByMessageId.set(lastSeenMessageId, current);
  });

  messages.forEach((message, index) => {
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
    const previousDateKey = previousMessage
      ? getChatDayKey(previousMessage.createdAt)
      : null;
    const currentDateKey = getChatDayKey(message.createdAt);

    if (previousDateKey !== currentDateKey) {
      rows.push({
        id: `date:${currentDateKey}`,
        type: "date",
        label: formatMessageDateLabel(message.createdAt),
      });
    }

    const sender = participantMap.get(message.senderId);
    const seenUserIds = (seenByMessageId.get(message._id) ?? []).filter(
      (userId) => userId !== message.senderId,
    );

    rows.push({
      id: message._id,
      type: "message",
      message,
      senderName: sender?.name ?? "Người dùng",
      senderAvatarUrl: sender?.avatarUrl,
      showAvatar: nextMessage?.senderId !== message.senderId,
      seenUsers: seenUserIds
        .map((userId) => participantMap.get(userId))
        .filter((user): user is ParticipantVisual => Boolean(user))
        .slice(0, 3),
      seenOverflow: Math.max(0, seenUserIds.length - 3),
      isLastMessage: index === messages.length - 1,
    });
  });

  return rows;
};

export function ConversationMessageList({
  messages,
  currentUserId,
  participantMap,
  lastSeenMap,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadEarlier,
  onReachedBottom,
  onLongPressMessage,
}: ConversationMessageListProps) {
  const listRef = React.useRef<FlashListRef<MessageListRow>>(null);
  const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);
  const isAtBottomRef = React.useRef(true);
  const prevAtBottomRef = React.useRef(true);
  const hasInitialScrollRef = React.useRef(false);
  const previousLastMessageIdRef = React.useRef<string | null>(null);
  const [animatedMessageId, setAnimatedMessageId] = React.useState<string | null>(
    null,
  );
  const [highlightedMessageId, setHighlightedMessageId] = React.useState<string | null>(
    null,
  );

  const rows = React.useMemo(
    () => buildRows(messages, participantMap, lastSeenMap),
    [lastSeenMap, messages, participantMap],
  );
  const lastMessage = messages.at(-1) ?? null;
  const rowIndexByMessageId = React.useMemo(() => {
    const map = new Map<string, number>();

    rows.forEach((row, index) => {
      if (row.type === "message") {
        map.set(row.message._id, index);
      }
    });

    return map;
  }, [rows]);

  const scrollToBottom = React.useCallback((animated: boolean) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  React.useEffect(() => {
    if (messages.length === 0) {
      hasInitialScrollRef.current = false;
      previousLastMessageIdRef.current = null;
      setAnimatedMessageId(null);
      setShowScrollToBottom(false);
      prevAtBottomRef.current = true;
      isAtBottomRef.current = true;
      return;
    }

    if (!hasInitialScrollRef.current) {
      hasInitialScrollRef.current = true;
      previousLastMessageIdRef.current = lastMessage?._id ?? null;
      scrollToBottom(false);
      onReachedBottom?.();
    }
  }, [lastMessage?._id, messages.length, onReachedBottom, scrollToBottom]);

  React.useEffect(() => {
    if (!lastMessage?._id) {
      return;
    }

    const previousLastMessageId = previousLastMessageIdRef.current;

    if (!previousLastMessageId) {
      previousLastMessageIdRef.current = lastMessage._id;
      return;
    }

    if (previousLastMessageId === lastMessage._id) {
      return;
    }

    previousLastMessageIdRef.current = lastMessage._id;
    setAnimatedMessageId(lastMessage._id);

    if (lastMessage.senderId === currentUserId || isAtBottomRef.current) {
      setShowScrollToBottom(false);
      scrollToBottom(true);
      if (lastMessage.senderId !== currentUserId && isAtBottomRef.current) {
        onReachedBottom?.();
      }
      return;
    }

    setShowScrollToBottom(true);
  }, [currentUserId, lastMessage, scrollToBottom]);

  React.useEffect(() => {
    if (!animatedMessageId) {
      return;
    }

    const timeout = setTimeout(() => {
      setAnimatedMessageId((current) =>
        current === animatedMessageId ? null : current,
      );
    }, 260);

    return () => {
      clearTimeout(timeout);
    };
  }, [animatedMessageId]);

  React.useEffect(() => {
    if (!highlightedMessageId) {
      return;
    }

    const timeout = setTimeout(() => {
      setHighlightedMessageId((current) =>
        current === highlightedMessageId ? null : current,
      );
    }, 1400);

    return () => {
      clearTimeout(timeout);
    };
  }, [highlightedMessageId]);

  const handlePressReplyTo = React.useCallback(
    (messageId: string) => {
      const targetIndex = rowIndexByMessageId.get(messageId);
      if (targetIndex == null) {
        return;
      }

      listRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0.5,
      });
      setHighlightedMessageId(messageId);
    },
    [rowIndexByMessageId],
  );

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const distanceToBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);
      const isAtBottom = distanceToBottom < 72;

      isAtBottomRef.current = isAtBottom;

      if (!prevAtBottomRef.current && isAtBottom) {
        onReachedBottom?.();
      }

      prevAtBottomRef.current = isAtBottom;

      if (isAtBottom && showScrollToBottom) {
        setShowScrollToBottom(false);
      }
    },
    [onReachedBottom, showScrollToBottom],
  );

  const renderItem = React.useCallback(
    ({ item }: ListRenderItemInfo<MessageListRow>) => {
      if (item.type === "date") {
        return <DateDivider label={item.label} />;
      }

      return (
        <ChatMessageBubble
          message={item.message}
          senderName={item.senderName}
          senderAvatarUrl={item.senderAvatarUrl}
          showAvatar={item.showAvatar}
          seenUsers={item.seenUsers}
          seenOverflow={item.seenOverflow}
          isLastMessage={item.isLastMessage}
          animateEntry={item.message._id === animatedMessageId}
          highlighted={item.message._id === highlightedMessageId}
          onLongPress={onLongPressMessage}
          onPressReplyTo={handlePressReplyTo}
        />
      );
    },
    [animatedMessageId, handlePressReplyTo, highlightedMessageId, onLongPressMessage],
  );

  if (isLoading && messages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner size="sm" color="default" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlashList
        ref={listRef}
        data={rows}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        getItemType={(item) => item.type}
        maintainVisibleContentPosition={{
          startRenderingFromBottom: true,
          autoscrollToBottomThreshold: 0.2,
          animateAutoScrollToBottom: true,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: rows.length === 0 ? "center" : "flex-end",
          paddingTop: 14,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onStartReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            onLoadEarlier?.();
          }
        }}
        onStartReachedThreshold={0.08}
        ListEmptyComponent={
          <View className="px-4">
            <AppCard className="rounded-[32px] px-6 py-10">
              <EmptyState />
            </AppCard>
          </View>
        }
        ListHeaderComponent={
          isFetchingNextPage ? (
            <View className="pb-4 pt-2">
              <Spinner size="sm" color="default" />
            </View>
          ) : (
            <View className="h-1" />
          )
        }
      />

      {showScrollToBottom ? (
        <View className="absolute bottom-5 left-0 right-0 items-center">
          <Button
            variant="primary"
            className="rounded-full px-4 shadow-none"
            onPress={() => {
              setShowScrollToBottom(false);
              scrollToBottom(true);
              onReachedBottom?.();
            }}
          >
            <Ionicons name="arrow-down" size={16} color="#ffffff" />
            <Text className="ml-2 text-sm font-semibold text-white">
              Tin nhắn mới
            </Text>
          </Button>
        </View>
      ) : null}
    </View>
  );
}
