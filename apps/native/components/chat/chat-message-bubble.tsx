import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { MediaType, type AttachmentDTO, type MessageDTO } from "@repo/shared";
import React from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";

import {
  buildAttachmentMeta,
  getAttachmentTypeFromMessage,
} from "~/components/chat/chat-attachment-utils";
import { ChatAvatar } from "~/components/chat/chat-avatar";
import { cn } from "~/lib/cn";

type ChatMessageBubbleProps = {
  message: MessageDTO;
  senderName: string;
  senderAvatarUrl?: string;
  showAvatar: boolean;
};

const formatBubbleTime = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const formatAttachmentName = (attachment: AttachmentDTO, fallback: string) =>
  attachment.fileName?.trim() || fallback;

function AttachmentCard({
  attachment,
  isOwn,
  onPress,
}: {
  attachment: AttachmentDTO;
  isOwn: boolean;
  onPress: () => void;
}) {
  const type = getAttachmentTypeFromMessage(attachment);
  const meta = buildAttachmentMeta(attachment.size);
  const fileName = formatAttachmentName(
    attachment,
    type === MediaType.AUDIO
      ? "Ghi am"
      : type === MediaType.VIDEO
        ? "Video"
        : "Tep dinh kem",
  );
  const iconName =
    type === MediaType.VIDEO
      ? "film-outline"
      : type === MediaType.AUDIO
        ? "mic-outline"
        : "document-attach-outline";
  const previewUri =
    type === MediaType.VIDEO ? attachment.thumbnailUrl : undefined;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-[22px] border px-3 py-3",
        isOwn
          ? "border-white/20 bg-white/10"
          : "border-app-border bg-app-bg dark:border-app-border-dark dark:bg-app-bg-dark",
      )}
    >
      <View className="flex-row items-center gap-3">
        {previewUri ? (
          <View className="overflow-hidden rounded-2xl border border-white/10">
            <Image source={{ uri: previewUri }} className="h-14 w-14" />
          </View>
        ) : (
          <View
            className={cn(
              "h-11 w-11 items-center justify-center rounded-full",
              type === MediaType.VIDEO
                ? "bg-amber-100 dark:bg-amber-500/15"
                : type === MediaType.AUDIO
                  ? "bg-emerald-100 dark:bg-emerald-500/15"
                  : "bg-sky-100 dark:bg-sky-500/15",
            )}
          >
            <Ionicons
              name={iconName}
              size={19}
              color={
                type === MediaType.VIDEO
                  ? "#d97706"
                  : type === MediaType.AUDIO
                    ? "#059669"
                    : "#2563eb"
              }
            />
          </View>
        )}

        <View className="flex-1">
          <Text
            numberOfLines={2}
            className={cn(
              "text-sm font-semibold",
              isOwn
                ? "text-app-primary-foreground"
                : "text-app-fg dark:text-app-fg-dark",
            )}
          >
            {fileName}
          </Text>
          {meta ? (
            <Text
              numberOfLines={1}
              className={cn(
                "mt-1 text-[11px]",
                isOwn
                  ? "text-app-primary-foreground/80"
                  : "text-app-muted-fg dark:text-app-muted-fg-dark",
              )}
            >
              {meta}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

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
    ? "Tin nhan da bi xoa."
    : message.content?.trim() || "";
  const attachments = message.attachments ?? [];

  const openAttachment = React.useCallback(async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn("Failed to open attachment:", error);
    }
  }, []);

  return (
    <View
      className={cn(
        "flex-row items-end gap-2 px-4",
        isOwn ? "justify-end" : "justify-start",
      )}
    >
      {!isOwn ? (
        showAvatar ? (
          <ChatAvatar name={senderName} imageUrl={senderAvatarUrl} size="sm" />
        ) : (
          <View className="h-10 w-10" />
        )
      ) : null}

      <View className={cn("max-w-[78%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && showAvatar ? (
          <Text className="mb-1 ml-1 text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
            {senderName}
          </Text>
        ) : null}

        <View
          className={cn(
            "rounded-3xl px-4 py-3",
            isOwn
              ? "bg-app-primary dark:bg-app-primary-dark"
              : "bg-app-surface-elevated dark:bg-app-surface-elevated-dark",
          )}
        >
          {attachments.length > 0 && !message.isDeleted ? (
            <View className={cn(content ? "mb-3 gap-2" : "gap-2")}>
              {attachments.map((attachment, index) => {
                const type = getAttachmentTypeFromMessage(attachment);
                const key = `${attachment.url}-${index}`;

                if (type === MediaType.IMAGE) {
                  return (
                    <Pressable
                      key={key}
                      onPress={() => {
                        void openAttachment(attachment.url);
                      }}
                      className="overflow-hidden rounded-[22px] border border-white/10"
                    >
                      <Image
                        source={{ uri: attachment.url }}
                        className={cn(
                          attachments.length === 1 ? "h-56 w-60" : "h-36 w-40",
                        )}
                      />
                    </Pressable>
                  );
                }

                return (
                  <AttachmentCard
                    key={key}
                    attachment={attachment}
                    isOwn={isOwn}
                    onPress={() => {
                      void openAttachment(attachment.url);
                    }}
                  />
                );
              })}
            </View>
          ) : null}

          {content ? (
            <Text
              className={cn(
                "text-[15px] leading-5",
                isOwn
                  ? "text-app-primary-foreground"
                  : "text-app-fg dark:text-app-fg-dark",
                message.isDeleted ? "italic opacity-70" : "",
              )}
            >
              {content}
            </Text>
          ) : null}
        </View>

        <Text className="mt-1 px-1 text-[11px] text-app-muted-fg dark:text-app-muted-fg-dark">
          {bubbleTime}
        </Text>
      </View>
    </View>
  );
}
