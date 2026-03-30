import { useAuth } from '@clerk/expo';
import type { MessageDTO } from '@repo/shared';
import React from 'react';
import { Text, View } from 'react-native';

import { ChatAvatar } from '~/components/chat/chat-avatar';
import { cn } from '~/lib/cn';

type ChatMessageBubbleProps = {
  message: MessageDTO;
  senderName: string;
  senderAvatarUrl?: string;
  showAvatar: boolean;
};

const formatBubbleTime = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

export function ChatMessageBubble({
  message,
  senderName,
  senderAvatarUrl,
  showAvatar,
}: ChatMessageBubbleProps) {
  const { userId } = useAuth();
  const isOwn = message.senderId === userId;
  const bubbleTime = formatBubbleTime(message.createdAt);
  const content = message.isDeleted
    ? 'Tin nhan da bi xoa.'
    : message.content || 'Da gui tep dinh kem.';

  return (
    <View className={cn('flex-row items-end gap-2 px-4', isOwn ? 'justify-end' : 'justify-start')}>
      {!isOwn ? (
        showAvatar ? (
          <ChatAvatar name={senderName} imageUrl={senderAvatarUrl} size="sm" />
        ) : (
          <View className="h-10 w-10" />
        )
      ) : null}

      <View className={cn('max-w-[78%]', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && showAvatar ? (
          <Text className="mb-1 ml-1 text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
            {senderName}
          </Text>
        ) : null}

        <View
          className={cn(
            'rounded-3xl px-4 py-3',
            isOwn
              ? 'bg-app-primary dark:bg-app-primary-dark'
              : 'bg-app-surface-elevated dark:bg-app-surface-elevated-dark',
          )}
        >
          <Text
            className={cn(
              'text-[15px] leading-5',
              isOwn ? 'text-app-primary-foreground' : 'text-app-fg dark:text-app-fg-dark',
              message.isDeleted ? 'italic opacity-70' : '',
            )}
          >
            {content}
          </Text>
        </View>

        <Text className="mt-1 px-1 text-[11px] text-app-muted-fg dark:text-app-muted-fg-dark">
          {bubbleTime}
        </Text>
      </View>
    </View>
  );
}
