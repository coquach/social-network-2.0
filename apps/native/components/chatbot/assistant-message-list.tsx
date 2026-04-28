import { AntDesign } from "@expo/vector-icons";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { Button } from "heroui-native/button";
import { Spinner } from "heroui-native/spinner";
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
  // Dữ liệu từ hook đã được chuẩn hóa theo thứ tự cũ -> mới.
  const orderedMessages = React.useMemo(() => messages, [messages]);
  const listRef = React.useRef<FlashListRef<AssistantMessageItem>>(null);
  const isAtBottomRef = React.useRef(true);
  const hasInitialScrollRef = React.useRef(false);
  const previousLastMessageIdRef = React.useRef<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);

  const lastMessage = orderedMessages.at(-1) ?? null;

  const scrollToBottom = React.useCallback((animated: boolean) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  React.useEffect(() => {
    if (orderedMessages.length === 0) {
      hasInitialScrollRef.current = false;
      previousLastMessageIdRef.current = null;
      isAtBottomRef.current = true;
      setShowScrollToBottom(false);
      return;
    }

    if (!hasInitialScrollRef.current) {
      hasInitialScrollRef.current = true;
      previousLastMessageIdRef.current = lastMessage?.id ?? null;
      scrollToBottom(false);
    }
  }, [lastMessage?.id, orderedMessages.length, scrollToBottom]);

  React.useEffect(() => {
    if (!lastMessage?.id) {
      return;
    }

    const previousLastMessageId = previousLastMessageIdRef.current;
    if (!previousLastMessageId) {
      previousLastMessageIdRef.current = lastMessage.id;
      return;
    }

    if (previousLastMessageId === lastMessage.id) {
      return;
    }

    previousLastMessageIdRef.current = lastMessage.id;

    if (isAtBottomRef.current) {
      setShowScrollToBottom(false);
      scrollToBottom(true);
    } else {
      setShowScrollToBottom(true);
    }
  }, [lastMessage?.id, scrollToBottom]);

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const distanceToBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);
      const isAtBottom = distanceToBottom < 72;

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
            data={orderedMessages}
            keyExtractor={(item: AssistantMessageItem) => item.id}
            maintainVisibleContentPosition={{
              startRenderingFromBottom: true,
              autoscrollToBottomThreshold: 0.2,
              animateAutoScrollToBottom: true,
            }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent:
                orderedMessages.length === 0 ? "center" : "flex-end",
              paddingTop: 14,
              paddingBottom: 24,
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onStartReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                onFetchNextPage?.();
              }
            }}
            onStartReachedThreshold={0.08}
            ListHeaderComponent={
              isFetchingNextPage ? (
                <View className="pb-4 pt-2">
                  <Spinner size="sm" color="default" />
                </View>
              ) : null
            }
            renderItem={({ item }: { item: AssistantMessageItem }) => {
              const message = item;
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

        {isResponding ? (
          <Text className="mt-2 text-xs italic text-app-muted-fg dark:text-app-muted-fg-dark">
            Trợ lý đang trả lời...
          </Text>
        ) : null}
      </View>

      {showScrollToBottom ? (
        <Button
          variant="secondary"
          className="mt-3 self-end rounded-full px-3"
          onPress={() => {
            setShowScrollToBottom(false);
            scrollToBottom(true);
          }}
        >
          <AntDesign name="down" size={12} color="#0ea5e9" />
          <Text className="ml-1 text-xs font-semibold text-app-muted-fg dark:text-app-muted-fg-dark">
            Về tin nhắn mới
          </Text>
        </Button>
      ) : null}
    </View>
  );
}
