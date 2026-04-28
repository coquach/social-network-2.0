import { AntDesign } from "@expo/vector-icons";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { Button } from "heroui-native/button";
import React from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Text,
  View,
} from "react-native";

export type AssistantMessageItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  isPending?: boolean;
};

type AssistantMessageListProps = {
  messages: AssistantMessageItem[];
  isLoading: boolean;
  isResponding: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
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
      message: AssistantMessageItem;
    };

const toDateKey = (timestamp: number) => {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "";
  }

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameDay = (a: Date, b: Date) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const formatDayLabel = (timestamp: number) => {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "";
  }

  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, now)) {
    return "Hôm nay";
  }

  if (isSameDay(date, yesterday)) {
    return "Hôm qua";
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const buildRows = (messages: AssistantMessageItem[]): MessageListRow[] => {
  const rows: MessageListRow[] = [];
  let previousDateKey: string | null = null;

  for (const message of messages) {
    const currentDateKey = toDateKey(message.createdAt);

    if (currentDateKey !== previousDateKey) {
      rows.push({
        id: `date:${currentDateKey}`,
        type: "date",
        label: formatDayLabel(message.createdAt),
      });
      previousDateKey = currentDateKey;
    }

    rows.push({
      id: `message:${message.id}:${message.createdAt}`,
      type: "message",
      message,
    });
  }

  return rows;
};

function AssistantMessageSkeleton() {
  return (
    <View className="gap-3">
      {Array.from({ length: 6 }).map((_, index) => {
        const isRight = index % 2 === 0;

        return (
          <View
            key={`assistant-skeleton-${index}`}
            className={isRight ? "items-end" : "items-start"}
          >
            <View
              className={
                isRight
                  ? "h-10 w-[72%] rounded-[16px] bg-app-primary/25"
                  : "h-10 w-[62%] rounded-[16px] bg-app-surface-dark/15 dark:bg-app-surface/20"
              }
            />
          </View>
        );
      })}
    </View>
  );
}

export function AssistantMessageList({
  messages,
  isLoading,
  isResponding,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage,
}: AssistantMessageListProps) {
  const orderedMessages = React.useMemo(() => {
    return [...messages].sort((a, b) => {
     if (a.createdAt !== b.createdAt) {
       return b.createdAt - a.createdAt;
     }
     if (a.role !== b.role) {
       return a.role === 'assistant' ? -1 : 1;
     }
     return b.id.localeCompare(a.id);
    });
  }, [messages]);
  const rows = React.useMemo(() => buildRows(orderedMessages), [orderedMessages]);
  const listRef = React.useRef<FlashListRef<MessageListRow>>(null);
  const prevMessageCountRef = React.useRef(0);
  const isAtBottomRef = React.useRef(true);
  const hasPendingMessage = React.useMemo(
    () => messages.some((message) => message.isPending),
    [messages],
  );
  const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);

  React.useEffect(() => {
    if (messages.length === 0) {
      prevMessageCountRef.current = 0;
      isAtBottomRef.current = true;
      setShowScrollToBottom(false);
      return;
    }

    const shouldAnimate =
      prevMessageCountRef.current > 0 && isAtBottomRef.current;
    const hasNewMessages = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (!hasNewMessages) {
      return;
    }

    if (isAtBottomRef.current) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: shouldAnimate });
      });
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(true);
    }
  }, [messages.length]);

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const distanceToBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);
      const isAtBottom = distanceToBottom < 56;

      isAtBottomRef.current = isAtBottom;

      if (isAtBottom && showScrollToBottom) {
        setShowScrollToBottom(false);
      }
    },
    [showScrollToBottom],
  );

  return (
    <View className="rounded-[24px] border border-app-border bg-app-surface-elevated px-3 py-3 dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
      <View className="h-full">
        {isLoading && messages.length === 0 ? (
          <AssistantMessageSkeleton />
        ) : (
          <FlashList
            ref={listRef}
            data={rows}
            keyExtractor={(item: MessageListRow) => item.id}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }: { item: MessageListRow }) => {
              if (item.type === "date") {
                return (
                  <View className="items-center py-2">
                    <View className="rounded-full bg-app-surface px-3 py-1 dark:bg-app-surface-dark">
                      <Text className="text-[11px] font-semibold text-app-muted-fg dark:text-app-muted-fg-dark">
                        {item.label}
                      </Text>
                    </View>
                  </View>
                );
              }

              const message = item.message;
              const isUser = message.role === "user";

              return (
                <View className="w-full py-1">
                  <View
                    className={
                      isUser
                        ? "ml-auto max-w-[85%] rounded-[16px] bg-app-primary px-3 py-2"
                        : "mr-auto max-w-[85%] rounded-[16px] bg-white px-3 py-2 dark:bg-app-surface-dark"
                    }
                  >
                    <Text
                      className={
                        isUser
                          ? "text-sm text-white"
                          : "text-sm text-app-fg dark:text-app-fg-dark"
                      }
                    >
                      {message.content}
                    </Text>
                    {message.isPending ? (
                      <Text className="mt-1 text-[11px] text-white/80">Đang gửi...</Text>
                    ) : null}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center px-4">
                <Text className="text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  Chưa có hội thoại. Hãy gửi câu hỏi đầu tiên.
                </Text>
              </View>
            }
          />
        )}

        {isResponding && !hasPendingMessage ? (
          <Text className="mt-2 text-xs italic text-app-muted-fg dark:text-app-muted-fg-dark">
            Trợ lý đang trả lời...
          </Text>
        ) : null}

        
      </View>

      {hasNextPage ? (
        <Button
          variant="ghost"
          className="mt-3 self-start rounded-full px-3"
          isDisabled={isFetchingNextPage}
          onPress={() => {
            onFetchNextPage?.();
          }}
        >
          <Text className="text-xs font-semibold text-app-muted-fg dark:text-app-muted-fg-dark">
            {isFetchingNextPage ? "Đang tải..." : "Tải hội thoại cũ hơn"}
          </Text>
        </Button>
      ) : null}
    </View>
  );
}
