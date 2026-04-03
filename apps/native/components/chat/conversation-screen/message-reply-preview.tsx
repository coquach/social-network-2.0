import { Ionicons } from "@expo/vector-icons";
import { MediaType, type MessageDTO } from "@repo/shared";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

import { getAttachmentTypeFromMessage } from "~/components/chat/chat-attachment-utils";
import { cn } from "~/lib/cn";

type MessageReplyPreviewTone = "own" | "other" | "composer";

type MessageReplyPreviewProps = {
  replyTo?: MessageDTO | null;
  tone?: MessageReplyPreviewTone;
  onPress?: () => void;
  onClear?: () => void;
};

const toneStyles: Record<
  MessageReplyPreviewTone,
  {
    container: string;
    iconColor: string;
    title: string;
    body: string;
    thumbnailBorder: string;
    closeIconColor: string;
  }
> = {
  own: {
    container: "bg-white/14",
    iconColor: "#ffffff",
    title: "text-white/85",
    body: "text-white",
    thumbnailBorder: "border-white/15",
    closeIconColor: "#ffffff",
  },
  other: {
    container:
      "bg-slate-100 dark:bg-slate-700/70",
    iconColor: "#64748b",
    title: "text-slate-500 dark:text-slate-300",
    body: "text-slate-800 dark:text-slate-100",
    thumbnailBorder: "border-slate-200 dark:border-slate-600",
    closeIconColor: "#64748b",
  },
  composer: {
    container:
      "border border-app-border bg-app-surface-elevated dark:border-app-border-dark dark:bg-app-surface-elevated-dark",
    iconColor: "#0ea5e9",
    title: "text-app-muted-fg dark:text-app-muted-fg-dark",
    body: "text-app-fg dark:text-app-fg-dark",
    thumbnailBorder: "border-app-border dark:border-app-border-dark",
    closeIconColor: "#6b7280",
  },
};

function getReplyFallback(replyTo: MessageDTO) {
  if (replyTo.isDeleted) {
    return "Tin nhắn đã bị xóa";
  }

  const firstAttachment = replyTo.attachments?.[0];
  if (!firstAttachment) {
    return "Tin nhắn";
  }

  const type = getAttachmentTypeFromMessage(firstAttachment);
  switch (type) {
    case MediaType.IMAGE:
      return "Ảnh";
    case MediaType.VIDEO:
      return "Video";
    case MediaType.AUDIO:
      return "Tin nhắn thoại";
    default:
      return "Tệp đính kèm";
  }
}

export function MessageReplyPreview({
  replyTo,
  tone = "other",
  onPress,
  onClear,
}: MessageReplyPreviewProps) {
  if (!replyTo) {
    return null;
  }

  const style = toneStyles[tone];
  const firstAttachment = replyTo.attachments?.[0];
  const replyText = replyTo.content?.trim() || getReplyFallback(replyTo);
  const canShowImage =
    firstAttachment &&
    getAttachmentTypeFromMessage(firstAttachment) === MediaType.IMAGE;

  const content = (
    <View className={cn("flex-row items-center gap-3 rounded-2xl px-3 py-2", style.container)}>
      <Ionicons
        name="arrow-undo-outline"
        size={16}
        color={style.iconColor}
      />
      <View className="min-w-0 flex-1">
        <Text className={cn("text-[11px] font-semibold", style.title)}>
          Trả lời tin nhắn
        </Text>
        <Text
          numberOfLines={2}
          className={cn(
            "mt-0.5 text-[13px] leading-5",
            style.body,
            replyTo.isDeleted ? "italic opacity-75" : "",
          )}
        >
          {replyText}
        </Text>
      </View>

      {canShowImage ? (
        <View className={cn("overflow-hidden rounded-xl border", style.thumbnailBorder)}>
          <Image
            source={{ uri: firstAttachment.url }}
            className="h-11 w-11"
          />
        </View>
      ) : null}

      {onClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bỏ trả lời"
          onPress={onClear}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Ionicons name="close" size={16} color={style.closeIconColor} />
        </Pressable>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="w-full">
        {content}
      </Pressable>
    );
  }

  return content;
}
