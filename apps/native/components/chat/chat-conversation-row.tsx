import { useAuth } from '@clerk/expo';
import type { ConversationDTO } from '@repo/shared';
import { usePresenceStore, useUser } from '@repo/shared';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { DirectChatAvatar, GroupChatAvatar } from '~/components/chat/chat-avatar';
import {
  formatConversationTime,
  getConversationName,
  getConversationOtherUserId,
  getMessagePreview,
} from '~/components/chat/chat-helpers';
import { cn } from '~/lib/cn';

type ChatConversationRowProps = {
  conversation: ConversationDTO;
};

export function ChatConversationRow({ conversation }: ChatConversationRowProps) {
  const { userId } = useAuth();
  const otherUserId = getConversationOtherUserId(conversation, userId ?? null);
  const { data: otherUser } = useUser(otherUserId ?? '', { enabled: !!otherUserId });
  const presence = usePresenceStore((state) =>
    otherUserId ? state.getById(otherUserId) : undefined,
  );

  const name = getConversationName(conversation, otherUser);
  const preview = getMessagePreview(conversation.lastMessage, conversation.isGroup, name);
  const timeLabel = formatConversationTime(
    conversation.lastMessage?.createdAt ?? conversation.updatedAt,
  );
  const isUnread = getConversationUnreadState(conversation, userId ?? null);
  const hasPresence = !conversation.isGroup && presence?.status === 'online';

  return (
    <Pressable
      onPress={() => {
        router.push(`/chat/${conversation._id}`);
      }}
      className="rounded-[26px] active:bg-app-muted-fg dark:active:bg-app-muted-fg-dark"
    >
      <View className="flex-row items-center gap-3 py-2.5">
        {conversation.isGroup ? (
          <GroupChatAvatar conversation={conversation} size="lg" />
        ) : (
          <DirectChatAvatar
            name={name}
            imageUrl={otherUser?.avatarUrl}
            online={hasPresence}
            size="lg"
          />
        )}

        <View className="min-w-0 flex-1 ml-4">
          <View className="flex-row items-center justify-between gap-3">
            <Text
              className={cn(
                'flex-1 text-[15px] text-app-fg dark:text-app-fg-dark',
                isUnread ? 'font-extrabold' : 'font-semibold',
              )}
              numberOfLines={1}
            >
              {name}
            </Text>
            <Text
              className={cn(
                'text-[11px] text-app-muted-fg dark:text-app-muted-fg-dark',
                isUnread && 'font-bold text-app-primary dark:text-app-primary-dark',
              )}
            >
              {timeLabel}
            </Text>
          </View>

          <View className="mt-1 flex-row items-center gap-2">
            <Text
              className={cn(
                'flex-1 text-[13px] leading-5 text-app-muted-fg dark:text-app-muted-fg-dark',
                isUnread && 'font-semibold text-app-fg dark:text-app-fg-dark',
              )}
              numberOfLines={1}
            >
              {preview}
            </Text>

            
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function getConversationUnreadState(
  conversation: ConversationDTO,
  currentUserId: string | null,
) {
  if (!currentUserId || !conversation.lastMessage?._id) {
    return false;
  }

  const lastSeenMessageId = conversation.lastSeenMessageId instanceof Map
    ? conversation.lastSeenMessageId.get(currentUserId)
    : undefined;

  if (lastSeenMessageId) {
    return lastSeenMessageId !== conversation.lastMessage._id;
  }

  return !conversation.lastMessage.seenBy.includes(currentUserId);
}
