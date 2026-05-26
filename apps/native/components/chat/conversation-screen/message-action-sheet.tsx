import { Ionicons } from '@expo/vector-icons';
import type { MessageDTO } from '@repo/shared';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { MessageReplyPreview } from '~/components/chat/conversation-screen/message-reply-preview';
import { AppBottomSheet } from '~/components/ui/app-bottom-sheet';
import { cn } from '~/lib/cn';

type MessageActionSheetProps = {
  visible: boolean;
  message: MessageDTO | null;
  isOwn: boolean;
  onClose: () => void;
  onCopy: () => void;
  onReply: () => void;
  onDelete: () => void;
};

type MessageActionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled?: boolean;
  destructive?: boolean;
  onPress: () => void;
};

function MessageActionRow({
  icon,
  label,
  disabled = false,
  destructive = false,
  onPress,
}: MessageActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-[22px] border px-4 py-3',
        destructive
          ? 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10'
          : 'border-app-border bg-app-surface-elevated dark:border-app-border-dark dark:bg-app-surface-elevated-dark',
        disabled ? 'opacity-45' : 'active:scale-[0.99]',
      )}
    >
      <View
        className={cn(
          'h-10 w-10 items-center justify-center rounded-full',
          destructive
            ? 'bg-rose-100 dark:bg-rose-500/20'
            : 'bg-sky-100 dark:bg-sky-500/15',
        )}
      >
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? '#e11d48' : '#0ea5e9'}
        />
      </View>
      <Text
        className={cn(
          'text-[15px] font-semibold',
          destructive
            ? 'text-rose-600 dark:text-rose-300'
            : 'text-app-fg dark:text-app-fg-dark',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function MessageActionSheet({
  visible,
  message,
  isOwn,
  onClose,
  onCopy,
  onReply,
  onDelete,
}: MessageActionSheetProps) {
  const previewText =
    message?.content?.trim() ||
    (message?.attachments?.length ? 'Tin nhắn có tệp đính kèm' : undefined);

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Tác vụ tin nhắn"
      description="Chọn thao tác bạn muốn thực hiện với tin nhắn này."
      bodyClassName="gap-3"
    >
      {message ? (
        <View className="gap-3">
          <View className="rounded-[24px] border border-app-border bg-app-surface px-4 py-4 dark:border-app-border-dark dark:bg-app-surface-dark">
            {message.replyTo ? (
              <View className="mb-3">
                <MessageReplyPreview
                  replyTo={message.replyTo}
                  tone="composer"
                />
              </View>
            ) : null}

            {previewText ? (
              <Text
                numberOfLines={3}
                className={cn(
                  'text-[15px] leading-6 text-app-fg dark:text-app-fg-dark',
                  message.isDeleted
                    ? 'italic text-app-muted-fg dark:text-app-muted-fg-dark'
                    : '',
                )}
              >
                {message.isDeleted ? 'Tin nhắn đã bị xóa.' : previewText}
              </Text>
            ) : (
              <Text className="text-[15px] italic text-app-muted-fg dark:text-app-muted-fg-dark">
                Tin nhắn
              </Text>
            )}
          </View>

          <MessageActionRow
            icon="copy-outline"
            label="Sao chép"
            disabled={!message.content?.trim()}
            onPress={onCopy}
          />
          <MessageActionRow
            icon="arrow-undo-outline"
            label="Trả lời"
            disabled={message.isDeleted}
            onPress={onReply}
          />
          {isOwn ? (
            <MessageActionRow
              icon="trash-outline"
              label="Xóa tin nhắn"
              destructive
              onPress={onDelete}
            />
          ) : null}
        </View>
      ) : null}
    </AppBottomSheet>
  );
}
