import { useAuth } from "@clerk/expo";
import type { ConversationDTO } from "@repo/shared";
import { usePresenceStore, useUser } from "@repo/shared";
import React from "react";
import { Pressable, Text, View } from "react-native";

import {
  DirectChatAvatar,
  GroupChatAvatar,
} from "~/components/chat/chat-avatar";
import {
  formatConversationTime,
  getConversationLastActivity,
  getConversationName,
  getConversationOtherParticipant,
  getConversationOtherUserId,
  getConversationUnreadState,
  getMessagePreview,
} from "~/components/chat/chat-helpers";
import { cn } from "~/lib/cn";

type ChatConversationRowProps = {
  conversation: ConversationDTO;
  onPress: (conversation: ConversationDTO) => void;
  onLongPress: (conversation: ConversationDTO) => void;
};

function ChatConversationRowComponent({
  conversation,
  onPress,
  onLongPress,
}: ChatConversationRowProps) {
  const { userId } = useAuth();
  const otherUserId = getConversationOtherUserId(conversation, userId ?? null);
  const otherParticipant = React.useMemo(
    () => getConversationOtherParticipant(conversation, userId ?? null),
    [conversation, userId],
  );
  const { data: cachedOtherUser } = useUser(otherUserId ?? "", {
    enabled: false,
  });
  const presence = usePresenceStore((state) =>
    otherUserId ? state.getById(otherUserId) : undefined,
  );

  const otherUser = otherParticipant ?? cachedOtherUser ?? null;
  const name = getConversationName(conversation, otherUser);
  const lastActivity = getConversationLastActivity(conversation);
  const isUnread = getConversationUnreadState(conversation, userId ?? null);
  const avatarUrl = otherParticipant?.avatarUrl ?? cachedOtherUser?.avatarUrl;
  const hasPresence =
    !conversation.isGroup &&
    (presence?.status === "online" || otherParticipant?.isOnline === true);
  const isHidden = Boolean(userId && conversation.hiddenFor?.includes(userId));
  const preview = getMessagePreview(
    conversation.lastMessage,
    conversation.isGroup,
    name,
    { currentUserId: userId ?? null },
  );

  return (
    <Pressable
      onPress={() => onPress(conversation)}
      onLongPress={() => onLongPress(conversation)}
      delayLongPress={220}
      className="active:scale-[0.99]"
    >
      {({ pressed }) => (
        <View
          className={cn(
            "overflow-hidden rounded-[28px] border px-3 py-3.5",
            isUnread
              ? "border-sky-200 bg-white shadow-sm dark:border-sky-400/30 dark:bg-app-surface-dark"
              : "border-transparent bg-app-surface/82 dark:bg-app-surface-elevated-dark/90",
            pressed &&
              "border-sky-200/90 bg-sky-50 dark:border-sky-300/25 dark:bg-sky-500/10",
          )}
        >
          <View className="flex-row items-center gap-3">
            {conversation.isGroup ? (
              <GroupChatAvatar
                conversation={conversation}
                size="lg"
                allowNetworkFetch={false}
              />
            ) : (
              <DirectChatAvatar
                name={name}
                imageUrl={avatarUrl}
                online={hasPresence}
                size="lg"
              />
            )}

            <View className="min-w-0 flex-1">
              <View className="flex-row items-start gap-3">
                <Text
                  className={cn(
                    "flex-1 text-[15px] text-app-fg dark:text-app-fg-dark",
                    isUnread ? "font-extrabold" : "font-semibold",
                  )}
                  numberOfLines={1}
                >
                  {name}
                </Text>
                <Text
                  className={cn(
                    "text-[11px]",
                    isUnread
                      ? "font-bold text-sky-600 dark:text-sky-300"
                      : "text-app-muted-fg dark:text-app-muted-fg-dark",
                  )}
                >
                  {formatConversationTime(lastActivity)}
                </Text>
              </View>

              <View className="mt-1.5 flex-row items-center gap-2">
                <Text
                  className={cn(
                    "flex-1 text-[13px] leading-5",
                    isHidden
                      ? "italic text-app-muted-fg/90 dark:text-app-muted-fg-dark/90"
                      : isUnread
                        ? "font-semibold text-app-fg dark:text-app-fg-dark"
                        : "text-app-muted-fg dark:text-app-muted-fg-dark",
                  )}
                  numberOfLines={2}
                >
                  {isHidden ? "Cuoc tro chuyen dang bi an." : preview}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export const ChatConversationRow = React.memo(ChatConversationRowComponent);
