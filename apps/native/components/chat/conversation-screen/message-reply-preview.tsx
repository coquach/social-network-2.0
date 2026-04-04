import { Ionicons } from "@expo/vector-icons";
import { MediaType, type AttachmentDTO, type MessageDTO } from "@repo/shared";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

import { getAttachmentTypeFromMessage } from "~/components/chat/chat-attachment-utils";
import { cn } from "~/lib/cn";

type MessageReplyPreviewTone = "own" | "other" | "composer";
type MessageReplyPreviewVariant = "card" | "bubble";

type MessageReplyPreviewProps = {
  replyTo?: MessageDTO | null;
  tone?: MessageReplyPreviewTone;
  onPress?: () => void;
  onClear?: () => void;
  compact?: boolean;
  variant?: MessageReplyPreviewVariant;
};

type PreviewVisual = {
  label: string;
  thumbnailUri?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

const toneStyles: Record<
  MessageReplyPreviewTone,
  {
    cardContainer: string;
    bubbleContainer: string;
    title: string;
    body: string;
    iconColor: string;
    thumbnailBorder: string;
    closeIconColor: string;
    accent: string;
  }
> = {
  own: {
    cardContainer: "bg-white/14",
    bubbleContainer: "bg-white/12",
    title: "text-white/85",
    body: "text-white",
    iconColor: "#ffffff",
    thumbnailBorder: "border-white/20",
    closeIconColor: "#ffffff",
    accent: "bg-white/75",
  },
  other: {
    cardContainer: "bg-slate-100 dark:bg-slate-700/70",
    bubbleContainer: "bg-slate-100 dark:bg-slate-700/70",
    title: "text-slate-500 dark:text-slate-300",
    body: "text-slate-800 dark:text-slate-100",
    iconColor: "#64748b",
    thumbnailBorder: "border-slate-200 dark:border-slate-600",
    closeIconColor: "#64748b",
    accent: "bg-sky-500/55 dark:bg-sky-400/65",
  },
  composer: {
    cardContainer:
      "border border-app-border bg-app-surface-elevated dark:border-app-border-dark dark:bg-app-surface-elevated-dark",
    bubbleContainer:
      "border border-app-border bg-app-surface-elevated dark:border-app-border-dark dark:bg-app-surface-elevated-dark",
    title: "text-app-muted-fg dark:text-app-muted-fg-dark",
    body: "text-app-fg dark:text-app-fg-dark",
    iconColor: "#0ea5e9",
    thumbnailBorder: "border-app-border dark:border-app-border-dark",
    closeIconColor: "#6b7280",
    accent: "bg-sky-500/70",
  },
};

function getReplyVisual(replyTo: MessageDTO): PreviewVisual {
  if (replyTo.isDeleted) {
    return { label: "Tin nhắn đã bị xóa", icon: "trash-outline" };
  }

  const content = replyTo.content?.trim();
  if (content) {
    return { label: content };
  }

  const firstAttachment = replyTo.attachments?.[0];
  if (!firstAttachment) {
    return { label: "Tin nhắn", icon: "chatbubble-ellipses-outline" };
  }

  const type = getAttachmentTypeFromMessage(firstAttachment);
  switch (type) {
    case MediaType.IMAGE:
      return { label: "Ảnh", thumbnailUri: firstAttachment.url, icon: "image-outline" };
    case MediaType.VIDEO:
      return {
        label: "Video",
        thumbnailUri: firstAttachment.thumbnailUrl || firstAttachment.url,
        icon: "videocam-outline",
      };
    case MediaType.AUDIO:
      return { label: "Tin nhắn thoại", icon: "mic-outline" };
    default:
      return {
        label: firstAttachment.fileName?.trim() || "Tệp đính kèm",
        icon: "document-attach-outline",
      };
  }
}

function ReplyThumbnail({
  attachment,
  borderClassName,
  compact = false,
}: {
  attachment: AttachmentDTO;
  borderClassName: string;
  compact?: boolean;
}) {
  const type = getAttachmentTypeFromMessage(attachment);
  const isImage = type === MediaType.IMAGE;
  const isVideo = type === MediaType.VIDEO;
  const uri = isImage ? attachment.url : attachment.thumbnailUrl || attachment.url;

  if (!uri) {
    return null;
  }

  return (
    <View
      className={cn(
        "shrink-0 overflow-hidden border",
        compact ? "h-9 w-9 rounded-lg" : "h-11 w-11 rounded-xl",
        borderClassName,
      )}
    >
      <Image source={{ uri }} className="h-full w-full" />
      {isVideo ? (
        <View className="absolute inset-0 items-center justify-center bg-black/15">
          <Ionicons name="play" size={compact ? 14 : 16} color="#ffffff" />
        </View>
      ) : null}
    </View>
  );
}

export function MessageReplyPreview({
  replyTo,
  tone = "other",
  onPress,
  onClear,
  compact = false,
  variant = "card",
}: MessageReplyPreviewProps) {
  if (!replyTo) {
    return null;
  }

  const style = toneStyles[tone];
  const isBubble = variant === "bubble";
  const visual = getReplyVisual(replyTo);
  const firstAttachment = replyTo.attachments?.[0];
  const hasThumbnail =
    firstAttachment &&
    (getAttachmentTypeFromMessage(firstAttachment) === MediaType.IMAGE ||
      getAttachmentTypeFromMessage(firstAttachment) === MediaType.VIDEO);

  const content = (
    <View
      className={cn(
        isBubble
          ? "w-full self-stretch flex-row items-start gap-2.5 rounded-[18px] px-3 py-2.5"
          : "w-full flex-row items-start rounded-2xl",
        !isBubble && compact ? "gap-2 px-2.5 py-2" : "",
        !isBubble && !compact ? "gap-3 px-3 py-2" : "",
        isBubble ? style.bubbleContainer : style.cardContainer,
      )}
    >
      {isBubble ? (
        <View
          className={cn("mt-0.5 w-1 shrink-0 self-stretch rounded-full", style.accent)}
        />
      ) : (
        <Ionicons
          name="arrow-undo-outline"
          size={compact ? 14 : 16}
          color={style.iconColor}
          style={{ marginTop: compact ? 1 : 2 }}
        />
      )}

      <View className="min-w-0 flex-1">
        <Text
          numberOfLines={1}
          className={cn("font-semibold", style.title)}
          style={{ fontSize: compact || isBubble ? 10 : 11 }}
        >
          Trả lời tin nhắn
        </Text>

        <View className="mt-0.5 min-w-0 flex-row items-center gap-1.5">
          {!hasThumbnail && visual.icon ? (
            <Ionicons
              name={visual.icon}
              size={compact || isBubble ? 12 : 13}
              color={style.iconColor}
            />
          ) : null}
          <Text
            numberOfLines={isBubble ? 1 : 2}
            className={cn(style.body, replyTo.isDeleted ? "italic opacity-75" : "")}
            style={{
              minWidth: 0,
              flexShrink: 1,
              flexGrow: isBubble ? 1 : 0,
              fontSize: compact || isBubble ? 12 : 13,
              lineHeight: compact || isBubble ? 16 : 20,
            }}
          >
            {visual.label}
          </Text>
        </View>
      </View>

      {hasThumbnail && firstAttachment ? (
        <ReplyThumbnail
          attachment={firstAttachment}
          borderClassName={style.thumbnailBorder}
          compact={compact || isBubble}
        />
      ) : null}

      {onClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bỏ trả lời"
          onPress={onClear}
          className={cn(
            "items-center justify-center rounded-full",
            compact ? "h-7 w-7" : "h-8 w-8",
          )}
        >
          <Ionicons name="close" size={16} color={style.closeIconColor} />
        </Pressable>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="w-full self-stretch">
        {content}
      </Pressable>
    );
  }

  return content;
}
