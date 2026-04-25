import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import {
  useAssistantChatSession,
  type ChatbotHistoryMessageDTO,
} from "@repo/shared";
import { Button } from "heroui-native/button";
import React from "react";
import { Text, TextInput, View } from "react-native";

import { AppBottomSheet } from "~/components/ui/app-bottom-sheet";

type AssistantMessageVM = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  isPending?: boolean;
};

const mapHistoryMessageToVM = (
  message: ChatbotHistoryMessageDTO,
): AssistantMessageVM => ({
  id: `server:${message.id}`,
  role: message.role === "assistant" ? "assistant" : "user",
  content: message.content,
  createdAt: Date.parse(message.createdAt) || Date.now(),
  isPending: message.metadata?.isPending === true,
});

type AssistantChatSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function AssistantChatSheet({ visible, onClose }: AssistantChatSheetProps) {
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
  } = useAssistantChatSession(userId ?? "", { limit: 20 });

  const messages = React.useMemo(
    () => historyMessages.map(mapHistoryMessageToVM),
    [historyMessages],
  );

  const handleSend = React.useCallback(async () => {
    if (!userId) {
      return;
    }

    const message = input.trim();
    if (!message || isResponding) {
      return;
    }

    setInput("");

    try {
      await sendMessage(message);
    } catch (error) {
      console.error("[assistant] send failed:", error);
    }
  }, [input, isResponding, sendMessage, userId]);

  const handleClearHistory = React.useCallback(async () => {
    if (!userId || isClearing) {
      return;
    }

    try {
      await clearHistory();
    } catch (error) {
      console.error("[assistant] clear history failed:", error);
    }
  }, [clearHistory, isClearing, userId]);

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Tro ly AI"
      description="Hoi nhanh ve tinh nang, thao tac va cach dung ung dung."
    >
      <View className="max-h-[62vh]">
        <View className="mb-3">
          <Button
            variant="secondary"
            className="self-start rounded-full px-4"
            isDisabled={isClearing || messages.length === 0}
            onPress={() => {
              void handleClearHistory();
            }}
          >
            <Ionicons name="trash-outline" size={14} color="#0ea5e9" />
            <Text className="ml-2 text-sm font-semibold text-app-fg dark:text-app-fg-dark">
              Xoa lich su
            </Text>
          </Button>
        </View>

        <View className="rounded-[24px] border border-app-border bg-app-surface-elevated px-3 py-3 dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
          <View className="max-h-[42vh] gap-2">
            {isLoading ? (
              <Text className="text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                Dang tai hoi thoai...
              </Text>
            ) : null}

            {!isLoading && messages.length === 0 ? (
              <Text className="text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                Chua co hoi thoai. Hay gui cau hoi dau tien.
              </Text>
            ) : null}

            {!isLoading
              ? messages.map((item) => (
                  <View
                    key={item.id}
                    className={
                      item.role === "user"
                        ? "self-end max-w-[85%] rounded-[16px] bg-app-primary px-3 py-2"
                        : "self-start max-w-[85%] rounded-[16px] bg-white px-3 py-2 dark:bg-app-surface-dark"
                    }
                  >
                    <Text
                      className={
                        item.role === "user"
                          ? "text-sm text-white"
                          : "text-sm text-app-fg dark:text-app-fg-dark"
                      }
                    >
                      {item.content}
                    </Text>
                    {item.isPending ? (
                      <Text className="mt-1 text-[11px] text-white/80">
                        Dang gui...
                      </Text>
                    ) : null}
                  </View>
                ))
              : null}

            {isResponding ? (
              <Text className="text-xs italic text-app-muted-fg dark:text-app-muted-fg-dark">
                Tro ly dang tra loi...
              </Text>
            ) : null}
          </View>

          {hasNextPage ? (
            <Button
              variant="ghost"
              className="mt-3 self-start rounded-full px-3"
              isDisabled={isFetchingNextPage}
              onPress={() => {
                void fetchNextPage();
              }}
            >
              <Text className="text-xs font-semibold text-app-muted-fg dark:text-app-muted-fg-dark">
                {isFetchingNextPage ? "Dang tai..." : "Tai hoi thoai cu hon"}
              </Text>
            </Button>
          ) : null}
        </View>

        <View className="mt-3 flex-row items-end gap-2">
          <View className="flex-1 rounded-[18px] border border-app-border bg-app-surface px-3 py-2 dark:border-app-border-dark dark:bg-app-surface-dark">
            <TextInput
              multiline
              value={input}
              onChangeText={setInput}
              placeholder="Nhap cau hoi cho tro ly..."
              placeholderTextColor="#6b8aa1"
              className="text-sm text-app-fg dark:text-app-fg-dark"
              style={{ minHeight: 22, maxHeight: 100 }}
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
            <Ionicons name="send" size={16} color="#ffffff" />
          </Button>
        </View>
      </View>
    </AppBottomSheet>
  );
}

