import { Ionicons } from "@expo/vector-icons";
import { MediaType, type MessageDTO } from "@repo/shared";
import { Button } from "heroui-native/button";
import React from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";

import type { ChatComposerAttachment } from "~/components/chat/chat-attachment-utils";
import {
  buildAttachmentMeta,
  formatAttachmentDuration,
} from "~/components/chat/chat-attachment-utils";
import { MessageReplyPreview } from "~/components/chat/conversation-screen/message-reply-preview";
import { EmojiButton } from "~/components/ui/emoji-button";

import { cn } from "~/lib/cn";

type ChatComposerProps = {
  value: string;
  attachments: ChatComposerAttachment[];
  replyTo?: MessageDTO | null;
  onChange: (value: string) => void;
  onSend: () => void;
  onPickCamera: () => void | Promise<void>;
  onPickMedia: () => void | Promise<void>;
  onPickFile: () => void | Promise<void>;
  onToggleRecording: () => void | Promise<void>;
  onRemoveAttachment: (attachmentId: string) => void;
  onClearReply?: () => void;
  disabled?: boolean;
  isRecording?: boolean;
  recordingDurationMs?: number;
};

type ComposerActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void | Promise<void>;
};

function ComposerActionButton({
  icon,
  label,
  active = false,
  disabled = false,
  onPress,
}: ComposerActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        void onPress();
      }}
      className={cn(
        "h-10 w-10 items-center justify-center rounded-full border",
        active
          ? "border-rose-200 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/15"
          : "border-app-border bg-app-surface-elevated dark:border-app-border-dark dark:bg-app-surface-elevated-dark",
        disabled ? "opacity-50" : "active:scale-95",
      )}
    >
      <Ionicons name={icon} size={18} color={active ? "#e11d48" : "#2563eb"} />
    </Pressable>
  );
}

function ComposerAttachmentCard({
  attachment,
  onRemove,
}: {
  attachment: ChatComposerAttachment;
  onRemove: (attachmentId: string) => void;
}) {
  const meta = buildAttachmentMeta(attachment.size, attachment.durationMs);
  const isImage = attachment.type === MediaType.IMAGE;
  const isVideo = attachment.type === MediaType.VIDEO;
  const isAudio = attachment.type === MediaType.AUDIO;
  const isVisualMedia = isImage || isVideo;

  if (isVisualMedia) {
    return (
      <View className="relative">
        <Pressable className="h-20 w-20 overflow-hidden rounded-[18px] border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark">
          {isImage && attachment.previewUri ? (
            <Image
              source={{ uri: attachment.previewUri }}
              className="h-full w-full"
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-slate-950 px-2">
              <Ionicons name="film-outline" size={24} color="#ffffff" />
              <Text
                className="mt-2 font-semibold uppercase text-white"
                style={{ fontSize: 10 }}
              >
                Video
              </Text>
              {meta ? (
                <Text
                  className="mt-1 text-center text-white/80"
                  style={{ fontSize: 10 }}
                >
                  {meta}
                </Text>
              ) : null}
            </View>
          )}

          {isVideo ? (
            <View className="absolute bottom-1.5 left-1.5 rounded-full bg-black/75 px-2 py-1">
              <Text
                className="font-semibold uppercase text-white"
                style={{ fontSize: 10 }}
              >
                Video
              </Text>
            </View>
          ) : null}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Xoa ${attachment.name}`}
          onPress={() => onRemove(attachment.id)}
          className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/70"
        >
          <Ionicons name="close" size={14} color="#ffffff" />
        </Pressable>
      </View>
    );
  }

  return (
    <View className="relative min-w-0 flex-1 basis-[48%]">
      <Pressable className="min-h-[88px] overflow-hidden rounded-[18px] border border-app-border bg-app-surface px-3 py-3 dark:border-app-border-dark dark:bg-app-surface-dark">
        <View className="flex-1 justify-between gap-3">
          <View
            className={cn(
              "h-10 w-10 items-center justify-center rounded-full",
              isAudio
                ? "bg-emerald-100 dark:bg-emerald-500/15"
                : "bg-sky-100 dark:bg-sky-500/15",
            )}
          >
            <Ionicons
              name={isAudio ? "mic-outline" : "document-attach-outline"}
              size={18}
              color={isAudio ? "#059669" : "#2563eb"}
            />
          </View>

          <View className="gap-1 flex-row">
            <Text
              numberOfLines={2}
              className="text-xs font-semibold text-app-fg dark:text-app-fg-dark truncate"
            >
              {attachment.name}
            </Text>
            {meta ? (
              <Text
                numberOfLines={2}
                className="text-app-muted-fg dark:text-app-muted-fg-dark"
                style={{ fontSize: 11 }}
              >
                {meta}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Xoa ${attachment.name}`}
        onPress={() => onRemove(attachment.id)}
        className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-black/70"
      >
        <Ionicons name="close" size={14} color="#ffffff" />
      </Pressable>
    </View>
  );
}

export function ChatComposer({
  value,
  attachments,
  replyTo,
  onChange,
  onSend,
  onPickCamera,
  onPickMedia,
  onPickFile,
  onToggleRecording,
  onRemoveAttachment,
  onClearReply,
  disabled = false,
  isRecording = false,
  recordingDurationMs = 0,
}: ChatComposerProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [inputHeight, setInputHeight] = React.useState(22);
  const inputRef = React.useRef<TextInput>(null);
  const [selection, setSelection] = React.useState({ start: 0, end: 0 });
  const hasPayload = value.trim().length > 0 || attachments.length > 0;
  const isSendDisabled = disabled || isRecording || !hasPayload;
  const mediaAttachments = attachments.filter(
    (attachment) =>
      attachment.type === MediaType.IMAGE ||
      attachment.type === MediaType.VIDEO,
  );
  const fileAttachments = attachments.filter(
    (attachment) =>
      attachment.type !== MediaType.IMAGE &&
      attachment.type !== MediaType.VIDEO,
  );
  const minComposerHeight = isFocused ? 72 : 22;
  const maxComposerHeight = isFocused ? 128 : 72;
  const resolvedInputHeight = Math.max(minComposerHeight, inputHeight);
  const handleSelectEmoji = React.useCallback(
    (emoji: string) => {
      const start = selection.start ?? value.length;
      const end = selection.end ?? start;
      const nextValue = `${value.slice(0, start)}${emoji}${value.slice(end)}`;
      const caretPosition = start + emoji.length;

      onChange(nextValue);
      setSelection({ start: caretPosition, end: caretPosition });

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [onChange, selection.end, selection.start, value],
  );

  return (
    <View className="border-t border-app-border bg-app-surface px-4 pb-6 pt-3 dark:border-app-border-dark dark:bg-app-surface-dark">
      {replyTo ? (
        <View className="mb-3">
          <MessageReplyPreview
            replyTo={replyTo}
            tone="composer"
            onClear={onClearReply}
          />
        </View>
      ) : null}

      {attachments.length > 0 ? (
        <View className="mb-3 rounded-[24px] bg-app-surface-elevated px-2.5 py-2.5 dark:bg-app-surface-elevated-dark">
          {mediaAttachments.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {mediaAttachments.map((attachment) => (
                <ComposerAttachmentCard
                  key={attachment.id}
                  attachment={attachment}
                  onRemove={onRemoveAttachment}
                />
              ))}
            </View>
          ) : null}

          {fileAttachments.length > 0 ? (
            <View
              className={cn(
                'flex-row flex-wrap gap-2',
                mediaAttachments.length > 0 ? 'mt-2' : '',
              )}
            >
              {fileAttachments.map((attachment) => (
                <ComposerAttachmentCard
                  key={attachment.id}
                  attachment={attachment}
                  onRemove={onRemoveAttachment}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {isRecording ? (
        <View className="mb-3 flex-row items-center gap-2 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/30 dark:bg-rose-500/10">
          <View className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <Text className="flex-1 text-sm font-medium text-rose-700 dark:text-rose-200">
            Đang ghi âm{' '}
            {formatAttachmentDuration(recordingDurationMs) ?? '0:00'}
          </Text>
          <Text className="text-xs text-rose-600 dark:text-rose-200">
            Nhấn mic để dừng
          </Text>
        </View>
      ) : null}

      <View
        className={cn(
          'flex-row gap-3',
          isFocused ? 'items-end' : 'items-center',
        )}
      >
        {!isFocused || isRecording ? (
          <View className="flex-row gap-2">
            <ComposerActionButton
              icon="camera-outline"
              label="Chụp ảnh"
              disabled={disabled || isRecording}
              onPress={onPickCamera}
            />
            <ComposerActionButton
              icon="images-outline"
              label="Chọn ảnh hoặc video"
              disabled={disabled || isRecording}
              onPress={onPickMedia}
            />
            <ComposerActionButton
              icon="document-attach-outline"
              label="Chọn tệp"
              disabled={disabled || isRecording}
              onPress={onPickFile}
            />
            <ComposerActionButton
              icon={isRecording ? 'stop-circle-outline' : 'mic-outline'}
              label={isRecording ? 'Dừng ghi âm' : 'Ghi âm'}
              active={isRecording}
              disabled={disabled}
              onPress={onToggleRecording}
            />
          </View>
        ) : null}

        <View
          className={cn(
            'flex-1 flex-row items-end gap-1 border border-app-border bg-app-surface-elevated dark:border-app-border-dark dark:bg-app-surface-elevated-dark',
            isFocused
              ? 'rounded-[24px] px-3 py-3'
              : 'min-h-12 rounded-full px-3 py-1.5',
          )}
        >
          <TextInput
            ref={inputRef}
            multiline
            maxLength={1500}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#6b8aa1"
            value={value}
            selection={selection}
            onChangeText={onChange}
            onSelectionChange={(event) => {
              setSelection(event.nativeEvent.selection);
            }}
            keyboardAppearance="default"
            editable={!disabled}
            onFocus={() => {
              setIsFocused(true);
              setSelection((current) => ({
                start: current.start ?? value.length,
                end: current.end ?? value.length,
              }));
              setInputHeight((current) => Math.max(current, 72));
            }}
            onBlur={() => {
              setIsFocused(false);
              setInputHeight(22);
            }}
            onContentSizeChange={(event) => {
              const nextHeight = Math.min(
                Math.max(
                  event.nativeEvent.contentSize.height,
                  minComposerHeight,
                ),
                maxComposerHeight,
              );
              setInputHeight(nextHeight);
            }}
            style={{
              flex: 1,
              minHeight: minComposerHeight,
              height: resolvedInputHeight,
              maxHeight: maxComposerHeight,
              textAlignVertical: 'top',
              fontSize: 15,
              lineHeight: 20,
            }}
            className={cn(
              'text-app-fg dark:text-app-fg-dark',
              !isFocused ? 'py-0' : '',
              disabled ? 'opacity-60' : '',
            )}
          />
          <EmojiButton
            disabled={disabled || isRecording}
            onSelectEmoji={handleSelectEmoji}
            className={cn('mb-1', !isFocused ? 'self-center mb-0' : '')}
          />
        </View>

        <Button
          variant={isSendDisabled ? 'secondary' : 'primary'}
          className={cn(
            'h-12 w-12 min-h-12 rounded-full px-0',
            isSendDisabled ? 'opacity-70' : '',
          )}
          isDisabled={isSendDisabled}
          onPress={onSend}
        >
          <Ionicons
            name="paper-plane"
            size={18}
            color={isSendDisabled ? '#6b8aa1' : '#ffffff'}
          />
        </Button>
      </View>
    </View>
  );
}
