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
  Animated,
} from "react-native";
import Markdown from 'react-native-markdown-display';

const TypingIndicator = () => {
  const opacities = React.useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3)
  ]).current;

  React.useEffect(() => {
    const animations = opacities.map((op, i) =>
      Animated.sequence([
        Animated.delay(i * 200),
        Animated.loop(
          Animated.sequence([
            Animated.timing(op, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(op, { toValue: 0.3, duration: 400, useNativeDriver: true })
          ])
        )
      ])
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <View className="flex-row items-center space-x-1 py-1 px-1">
      {opacities.map((op, i) => (
        <Animated.View 
          key={i} 
          style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', opacity: op, marginHorizontal: 2 }} 
        />
      ))}
    </View>
  );
};

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
    
    // If it's a new message OR the content of the last message changed (streaming)
    if (previousLastMessageId !== lastMessage.id) {
      previousLastMessageIdRef.current = lastMessage.id;
      
      if (isAtBottomRef.current) {
        setShowScrollToBottom(false);
        scrollToBottom(true);
      } else {
        setShowScrollToBottom(true);
      }
    } else if (isResponding && isAtBottomRef.current) {
      // During streaming, if we are already at the bottom, stay at the bottom
      scrollToBottom(true);
    }
  }, [lastMessage?.id, lastMessage?.content.length, isResponding, scrollToBottom]);

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
              const isStreaming = message.isPending && !isUser;

              return (
                <View className="w-full py-1">
                  <View
                    className={
                      isUser
                        ? "ml-auto max-w-[85%] rounded-[20px] rounded-tr-[4px] bg-app-primary px-3 py-2 shadow-sm"
                        : "mr-auto max-w-[85%] rounded-[20px] rounded-tl-[4px] bg-white px-3 py-2 dark:bg-app-surface-dark shadow-sm border border-app-border/50 dark:border-app-border-dark/50"
                    }
                  >
                    <View className="flex-row flex-wrap items-center">
                      {isUser ? (
                        <Text className="text-[15px] text-white">
                          {message.content}
                        </Text>
                      ) : (
                        <View className="w-full">
                          {message.content ? (
                            <Markdown 
                              style={{
                                body: { fontSize: 15, color: '#1e293b' },
                                code_inline: { backgroundColor: '#f1f5f9', padding: 2, borderRadius: 4 },
                                code_block: { backgroundColor: '#0f172a', color: '#f8fafc', padding: 8, borderRadius: 8 },
                              }}
                            >
                              {message.content}
                            </Markdown>
                          ) : null}
                          
                          {isStreaming && !message.content ? (
                            <TypingIndicator />
                          ) : null}
                          
                          {isStreaming && message.content ? (
                            <View className="ml-1 mt-1 h-3 w-3 rounded-full bg-app-primary animate-pulse" />
                          ) : null}
                        </View>
                      )}
                    </View>
                    {message.isPending && isUser ? (
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
