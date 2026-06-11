import { useAuth } from '@clerk/expo';
import { AntDesign } from '@expo/vector-icons';
import { useAssistantChatSession } from '@repo/shared';
import { Button } from 'heroui-native/button';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View, TouchableOpacity } from 'react-native';

import {
  AssistantMessageList,
  type AssistantMessageItem,
} from '~/components/chatbot/assistant-message-list';
import { AppModal } from '~/components/ui/app-modal';

type AssistantChatModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function AssistantChatModal({
  visible,
  onClose,
}: AssistantChatModalProps) {
  const { userId } = useAuth();
  const [input, setInput] = React.useState('');
  const fallbackTimestampBaseRef = React.useRef(Date.now());
  const {
    messages: historyMessages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    sendMessage,
    clearHistory,
    isResponding,
    isClearing,
    error,
    isHistoryError,
    retryHistory,
    refreshHistory,
    isRefreshingHistory,
    isSyncingHistory,
    resetError,
  } = useAssistantChatSession(userId ?? '', { limit: 20, enabled: visible });

  const messages = React.useMemo(() => {
    const fallbackBase = fallbackTimestampBaseRef.current;
    const toTimestamp = (value: string | number | Date | null | undefined) => {
      if (value === null || value === undefined) {
        return Number.NaN;
      }

      if (value instanceof Date) {
        return value.getTime();
      }

      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : Number.NaN;
      }

      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    };
    const toStableFallbackTimestamp = (messageId: string, offset: number) => {
      let hash = 0;
      for (let index = 0; index < messageId.length; index += 1) {
        hash = (hash * 33 + messageId.charCodeAt(index)) >>> 0;
      }

      return fallbackBase + (hash % 86_400_000) + offset;
    };

    return historyMessages.map((message, index) => {
      const parsedCreatedAt = toTimestamp(message.createdAt);
      const createdAt =
        Number.isFinite(parsedCreatedAt) && parsedCreatedAt > 0
          ? parsedCreatedAt
          : toStableFallbackTimestamp(message.id, index);

      return {
        id: `server:${message.id}`,
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
        createdAt,
        isPending: message.metadata?.isPending === true,
      } satisfies AssistantMessageItem;
    });
  }, [historyMessages]);
  const isChatBusy = isResponding || isSyncingHistory;

  const handleSend = React.useCallback(async () => {
    if (!userId) {
      return;
    }

    const message = input.trim();
    if (!message || isChatBusy) {
      return;
    }

    try {
      await sendMessage(message);
      setInput('');
    } catch (sendError) {
      console.error('[assistant] send failed:', sendError);
    }
  }, [input, isChatBusy, sendMessage, userId]);

  const handleClearHistory = React.useCallback(async () => {
    if (!userId || isClearing || isChatBusy) {
      return;
    }

    try {
      await clearHistory();
    } catch (clearError) {
      console.error('[assistant] clear history failed:', clearError);
    }
  }, [clearHistory, isChatBusy, isClearing, userId]);

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Trợ lý AI"
      titleClassName="text-center text-app-fg dark:text-app-fg-dark"
      contentClassName="self-center w-[92%] max-w-[92%] rounded-[28px] border border-app-border bg-app-surface px-4 py-4 dark:border-app-border-dark dark:bg-app-surface-dark"
    >
      <View className="w-full">
        <View style={{ height: 440 }}>
          {error ? (
            <View className="mb-3 rounded-[16px] border border-rose-200 bg-rose-50 px-3 py-2 dark:border-rose-500/30 dark:bg-rose-500/10">
              <Text className="text-xs text-rose-700 dark:text-rose-200">
                {error.message || 'Không thể tải hội thoại với trợ lý.'}
              </Text>
              {isHistoryError ? (
                <Button
                  variant="ghost"
                  className="mt-1 h-8 self-start rounded-full px-3"
                  onPress={() => {
                    resetError();
                    void retryHistory();
                  }}
                >
                  <Text className="text-xs font-semibold text-rose-700 dark:text-rose-200">
                    Thử tải lại
                  </Text>
                </Button>
              ) : null}
            </View>
          ) : null}

          <View className="mb-2 flex-row items-center justify-end gap-2">
            <Button
              variant="secondary"
              className="rounded-full px-4"
              isDisabled={isRefreshingHistory}
              onPress={() => {
                void refreshHistory();
              }}
            >
              <AntDesign name="reload" size={14} color="#0ea5e9" />
              <Text className="ml-2 text-sm font-semibold text-app-fg dark:text-app-fg-dark">
                {isRefreshingHistory ? 'Đang làm mới...' : 'Làm mới'}
              </Text>
            </Button>
            <Button
              variant="secondary"
              className="rounded-full px-4"
              isDisabled={isClearing || isChatBusy || messages.length === 0}
              onPress={() => {
                void handleClearHistory();
              }}
            >
              <AntDesign name="delete" size={14} color="#0ea5e9" />
              <Text className="ml-2 text-sm font-semibold text-app-fg dark:text-app-fg-dark">
                Xóa lịch sử
              </Text>
            </Button>
          </View>

          <View style={{ minHeight: 220, flex: 1 }}>
            <AssistantMessageList
              messages={messages}
              isLoading={isLoading}
              isResponding={isResponding}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onFetchNextPage={() => {
                void fetchNextPage();
              }}
            />
          </View>

          <View className="mt-2 flex-row items-center gap-2">
            <View className="flex-1 rounded-[18px] border border-app-border bg-app-surface-elevated px-3 py-2 dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
              <TextInput
                multiline
                value={input}
                onChangeText={setInput}
                placeholder="Nhập câu hỏi cho trợ lý..."
                placeholderTextColor="#6b8aa1"
                className="text-sm text-app-fg dark:text-app-fg-dark"
                style={{ minHeight: 34, maxHeight: 100 }}
                editable={!isChatBusy}
                returnKeyType="send"
                onSubmitEditing={() => {
                  void handleSend();
                }}
              />
            </View>
            <TouchableOpacity
              disabled={!input.trim() || isChatBusy}
              onPress={() => {
                void handleSend();
              }}
              className={`h-11 w-11 items-center justify-center rounded-full ${
                !input.trim() || isChatBusy
                  ? 'bg-slate-200 dark:bg-slate-800'
                  : 'bg-app-primary dark:bg-app-primary-dark'
              }`}
            >
              <AntDesign
                name="send"
                size={16}
                color={!input.trim() || isChatBusy ? '#94a3b8' : '#ffffff'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppModal>
  );
}
