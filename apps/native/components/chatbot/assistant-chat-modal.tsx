import { useAuth } from '@clerk/expo';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import {
  AiAssistantPolicy,
  resolveSurfaceFromPathname,
  useAssistantChatSession,
  useAssistantConversations,
  useCurrentUser,
  useUpdateProfile,
} from '@repo/shared';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import {
  AssistantMessageList,
  type AssistantMessageItem,
} from '~/components/chatbot/assistant-message-list';
import { AppModal } from '~/components/ui/app-modal';
import { SecondaryButton, GhostButton } from '~/components/ui/app-button';

type AssistantChatModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function AssistantChatModal({
  visible,
  onClose,
}: AssistantChatModalProps) {
  const { userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const surface = React.useMemo(
    () => resolveSurfaceFromPathname(pathname || '', 'native'),
    [pathname],
  );
  const { data: currentUser } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [input, setInput] = React.useState('');
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [showSessionsList, setShowSessionsList] = React.useState(false);
  const fallbackTimestampBaseRef = React.useRef(Date.now());

  const {
    conversations,
    deleteConversation,
  } = useAssistantConversations(userId ?? '', 20, visible);

  const activeConversation = React.useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId],
  );

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
    updateProposalStatus,
  } = useAssistantChatSession(userId ?? '', {
    limit: 20,
    enabled: visible,
    surface,
    conversationId: activeConversationId ?? undefined,
    aiPolicy: currentUser?.privacySettings?.aiPolicy,
    onConversationCreated: (newId) => setActiveConversationId(newId),
  });

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
        metadata: message.metadata,
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
                <GhostButton
                  className="mt-1 h-8 self-start rounded-full"
                  onPress={() => {
                    resetError();
                    void retryHistory();
                  }}
                >
                  <Text className="text-xs font-semibold text-rose-700 dark:text-rose-200">
                    Thử tải lại
                  </Text>
                </GhostButton>
              ) : null}
            </View>
          ) : null}

          <View className="mb-2 flex-row items-center justify-between gap-1">
            <SecondaryButton
              className="h-9 rounded-full px-3 max-w-[170px]"
              onPress={() => setShowSessionsList((prev) => !prev)}
            >
              <Ionicons name="chatbubbles-outline" size={14} color="#0ea5e9" />
              <Text numberOfLines={1} className="ml-1 text-xs font-semibold text-app-fg dark:text-app-fg-dark">
                {activeConversation?.title || 'Phiên mới'}
              </Text>
            </SecondaryButton>

            <View className="flex-row items-center gap-1">
              <SecondaryButton
                className="h-9 rounded-full px-2.5"
                onPress={() => {
                  setActiveConversationId('new');
                  setShowSessionsList(false);
                }}
              >
                <Ionicons name="add" size={16} color="#0ea5e9" />
              </SecondaryButton>
              <SecondaryButton
                className="h-9 rounded-full px-2.5"
                disabled={isRefreshingHistory}
                onPress={() => {
                  void refreshHistory();
                }}
              >
                <AntDesign name="reload" size={13} color="#0ea5e9" />
              </SecondaryButton>
              <SecondaryButton
                className="h-9 rounded-full px-2.5"
                disabled={isClearing || isChatBusy || messages.length === 0}
                onPress={() => {
                  void handleClearHistory();
                }}
              >
                <AntDesign name="delete" size={13} color="#0ea5e9" />
              </SecondaryButton>
            </View>
          </View>

          {showSessionsList ? (
            <View className="mb-2 max-h-48 rounded-2xl border border-app-border bg-app-surface-elevated p-2 dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
              <View className="mb-2 flex-row items-center justify-between px-1">
                <Text className="text-xs font-bold text-app-fg dark:text-app-fg-dark">
                  Lịch sử phiên ({conversations.length}/20)
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setActiveConversationId('new');
                    setShowSessionsList(false);
                  }}
                >
                  <Text className="text-xs font-semibold text-sky-500">+ Phiên mới</Text>
                </TouchableOpacity>
              </View>
              <ScrollView className="max-h-36">
                {conversations.length === 0 ? (
                  <Text className="py-2 text-center text-xs text-app-muted-fg">
                    Chưa có phiên nào được lưu.
                  </Text>
                ) : (
                  conversations.map((conv) => (
                    <TouchableOpacity
                      key={conv.id}
                      onPress={() => {
                        setActiveConversationId(conv.id);
                        setShowSessionsList(false);
                      }}
                      className={`mb-1 flex-row items-center justify-between rounded-xl p-2 ${
                        activeConversationId === conv.id
                          ? 'bg-sky-500/15'
                          : 'bg-app-surface dark:bg-app-surface-dark'
                      }`}
                    >
                      <View className="flex-1 pr-2">
                        <Text
                          numberOfLines={1}
                          className={`text-xs font-medium ${
                            activeConversationId === conv.id
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-app-fg dark:text-app-fg-dark'
                          }`}
                        >
                          {conv.title || 'Cuộc trò chuyện'}
                        </Text>
                        <Text className="text-[10px] text-app-muted-fg">
                          {new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          void deleteConversation(conv.id);
                          if (activeConversationId === conv.id) {
                            setActiveConversationId(null);
                          }
                        }}
                        className="p-1"
                      >
                        <AntDesign name="delete" size={12} color="#94a3b8" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          ) : null}

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
              onActionNavigate={(targetPath) => {
                onClose();
                router.push(targetPath as any);
              }}
              onStatusChange={updateProposalStatus}
              aiPolicy={currentUser?.privacySettings?.aiPolicy}
              onGrantFullPolicy={() => {
                updateProfile.mutate({
                  privacySettings: {
                    ...currentUser?.privacySettings,
                    aiPolicy: AiAssistantPolicy.FULL,
                  },
                });
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
