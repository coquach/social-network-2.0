import { useAuth } from '@clerk/expo';
import type { ConversationDTO } from '@repo/shared';
import { usePresenceStore, useUser } from '@repo/shared';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { ChatAvatar } from '~/components/chat/chat-avatar';
import {
  formatConversationTime,
  getConversationName,
  getConversationOtherUserId,
  getMessagePreview,
} from '~/components/chat/chat-helpers';
import { AppCard } from '~/components/ui/app-card';

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

  return (
    <Pressable
      onPress={() => {
        router.push(`/chat/${conversation._id}`);
      }}
      className="active:opacity-95"
    >
      <AppCard className="flex-row items-center gap-3 rounded-[28px] px-4 py-3">
        <ChatAvatar
          name={name}
          imageUrl={conversation.isGroup ? conversation.groupAvatar?.url : otherUser?.avatarUrl}
          online={presence?.status === 'online'}
        />

        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-3">
            <Text
              className="flex-1 text-base font-semibold text-app-fg dark:text-app-fg-dark"
              numberOfLines={1}
            >
              {name}
            </Text>
            <Text className="text-xs text-app-muted-fg dark:text-app-muted-fg-dark">{timeLabel}</Text>
          </View>

          <Text
            className="mt-1 text-sm text-app-muted-fg dark:text-app-muted-fg-dark"
            numberOfLines={1}
          >
            {preview}
          </Text>
        </View>
      </AppCard>
    </Pressable>
  );
}
