import { AntDesign } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useAssistantChatSession } from "@repo/shared";
import { Button } from "heroui-native/button";
import React from "react";
import { Platform, Text, TextInput, View } from "react-native";

import {
  AssistantMessageList,
  type AssistantMessageItem,
} from "~/components/chatbot/assistant-message-list";
import { AppModal } from "~/components/ui/app-modal";
import { KeyboardAwareContainer } from "~/components/ui/keyboard-aware-container";
import { getChatDateMs } from "~/lib/chat-date-utils";

type AssistantChatModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function AssistantChatModal({ visible, onClose }: AssistantChatModalProps) {
  const { userId } = useAuth();
  const [input, setInput] = React.useState("");
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
    resetError,
  } = useAssistantChatSession(userId ?? "", { limit: 20, enabled: visible });

  const messages = React.useMemo(() => {
    const fallbackBase = Date.now();

    return historyMessages.map((message, index) => {
      const parsedCreatedAt = getChatDateMs(message.createdAt);
      const createdAt =
        Number.isFinite(parsedCreatedAt) && parsedCreatedAt > 0
          ? parsedCreatedAt
          : fallbackBase + index;

      return {
        id: `server:${message.id}`,
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content,
        createdAt,
        isPending: message.metadata?.isPending === true,
      } satisfies AssistantMessageItem;
    });
  }, [historyMessages]);

  const handleSend = React.useCallback(async () => {
    if (!userId) {
      return;
    }

    const message = input.trim();
    if (!message || isResponding) {
      return;
    }

    

    try {
      await sendMessage(message);
      setInput('');
    } catch (sendError) {
      console.error("[assistant] send failed:", sendError);
    }
  }, [input, isResponding, sendMessage, userId]);

  const handleClearHistory = React.useCallback(async () => {
    if (!userId || isClearing) {
      return;
    }

    try {
      await clearHistory();
    } catch (clearError) {
      console.error("[assistant] clear history failed:", clearError);
    }
  }, [clearHistory, isClearing, userId]);

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Trợ lý AI"
      titleClassName="text-center text-app-fg dark:text-app-fg-dark"
      contentClassName="self-center w-[92%] max-w-[92%] rounded-[28px] border border-app-border bg-app-surface px-4 py-4 dark:border-app-border-dark dark:bg-app-surface-dark"
    >
      <KeyboardAwareContainer
        enabled={visible}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="w-full"
      >
        <View style={{ height: 440 }}>
          {error ? (
            <View className="mb-3 rounded-[16px] border border-rose-200 bg-rose-50 px-3 py-2 dark:border-rose-500/30 dark:bg-rose-500/10">
              <Text className="text-xs text-rose-700 dark:text-rose-200">
                {error.message || "Không thể tải hội thoại với trợ lý."}
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

          <View className="mb-2">
            <Button
              variant="secondary"
              className="self-end rounded-full px-4"
              isDisabled={isClearing || messages.length === 0}
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

          <View className="mt-2 flex-row items-end gap-2">
            <View className="flex-1 rounded-[18px] border border-app-border bg-app-surface-elevated px-3 py-2 dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
              <TextInput
                multiline
                value={input}
                onChangeText={setInput}
                placeholder="Nhập câu hỏi cho trợ lý..."
                placeholderTextColor="#6b8aa1"
                className="text-sm text-app-fg dark:text-app-fg-dark"
                style={{ minHeight: 34, maxHeight: 100 }}
                returnKeyType="send"
    
                onSubmitEditing={() => {
                  void handleSend();
                }}
              />
            </View>
            <Button
              variant="primary"
              className="h-11 w-11 rounded-full px-0"
              isDisabled={!input.trim() || isResponding}
              onPress={() => {
                void handleSend();
              }}
            >
              <AntDesign name="arrow-up" size={16} color="#ffffff" />
            </Button>
          </View>
        </View>
      </KeyboardAwareContainer>
    </AppModal>
  );
}
