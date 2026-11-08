import { AntDesign } from "@expo/vector-icons";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import {
  getAssistantMessageActions,
  getAssistantMessageCards,
  getAssistantProposeActions,
} from "@repo/shared";
import { Button } from "heroui-native/button";
import { Spinner } from "heroui-native/spinner";
import React from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ActionConfirmationCard } from "./action-confirmation-card";
import { AssistantActionButtons } from "./assistant-action-buttons";
import { AssistantCards } from "./assistant-cards";

export type AssistantMessageItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  isPending?: boolean;
  metadata?: Record<string, unknown>;
};

type AssistantMessageListProps = {
  messages: AssistantMessageItem[];
  isLoading: boolean;
  isResponding: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
  onActionNavigate?: (path: string) => void;
  onStatusChange?: (
    key: string,
    status: 'idle' | 'executing' | 'success' | 'cancelled' | 'error',
    message?: string,
  ) => void;
  aiPolicy?: string;
  onGrantFullPolicy?: () => void;
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
  onActionNavigate,
  onStatusChange,
  aiPolicy,
  onGrantFullPolicy,
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
                        ? "ml-auto max-w-[85%] rounded-[16px] bg-app-primary px-3 py-2"
                        : "mr-auto max-w-[85%] rounded-[16px] bg-white px-3 py-2 dark:bg-app-surface-dark"
                    }
                  >
                    <View className="flex-row flex-wrap items-center">
                      <Text
                        className={
                          isUser
                            ? "text-sm text-white"
                            : "text-sm text-app-fg dark:text-app-fg-dark"
                        }
                      >
                        {message.content}
                      </Text>
                      {isStreaming && (
                        <View className="ml-1 h-4 w-1.5 bg-app-primary animate-pulse" />
                      )}
                    </View>
                    {!isUser && (
                      <>
                        <AssistantCards
                          cards={getAssistantMessageCards(message.metadata)}
                          onNavigate={onActionNavigate}
                        />
                        <ActionConfirmationCard
                          proposals={getAssistantProposeActions(message.metadata)}
                          onStatusChange={onStatusChange}
                        />
                        <AssistantActionButtons
                          actions={getAssistantMessageActions(message.metadata)}
                          onNavigate={onActionNavigate}
                        />
                        {!isUser &&
                          aiPolicy === 'RESTRICTED' &&
                          (message.metadata?.policyBlocked === true ||
                            message.content.toLowerCase().includes('riêng tư tối đa') ||
                            message.content.toLowerCase().includes('quyền riêng tư') ||
                            message.content.toLowerCase().includes('không thể truy cập') ||
                            message.content.toLowerCase().includes('không thể thực hiện thao tác')) && (
                            <View className="mt-2.5 rounded-xl border border-indigo-200 bg-indigo-50/90 p-2.5 dark:border-indigo-900/60 dark:bg-indigo-950/40">
                              <Text className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                                Chế độ Riêng tư tối đa đang bật
                              </Text>
                              <Text className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                                AI cần quyền Đầy đủ tính năng để tìm kiếm dữ liệu hoặc thao tác thay bạn.
                              </Text>
                              {onGrantFullPolicy ? (
                                <TouchableOpacity
                                  onPress={onGrantFullPolicy}
                                  className="mt-2 self-start rounded-lg bg-indigo-600 px-3 py-1.5"
                                >
                                  <Text className="text-xs font-semibold text-white">
                                    Cấp quyền Đầy đủ tính năng
                                  </Text>
                                </TouchableOpacity>
                              ) : null}
                            </View>
                          )}
                      </>
                    )}
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
