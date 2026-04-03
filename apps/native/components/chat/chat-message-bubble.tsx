import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { MediaType, type AttachmentDTO, type MessageDTO } from "@repo/shared";
import React from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";

import {
  buildAttachmentMeta,
  getAttachmentTypeFromMessage,
} from "~/components/chat/chat-attachment-utils";
import { ChatAvatar } from "~/components/chat/chat-avatar";
import { MessageReplyPreview } from "~/components/chat/conversation-screen/message-reply-preview";
import { cn } from "~/lib/cn";
import { formatMessageTimestamp } from "./chat-helpers";

type SeenUserVisual = {
  name: string;
  avatarUrl?: string;
};

type ChatMessageBubbleProps = {
  message: MessageDTO;
  senderName: string;
  senderAvatarUrl?: string;
  showAvatar: boolean;
  seenUsers?: SeenUserVisual[];
  seenOverflow?: number;
  isLastMessage?: boolean;
  animateEntry?: boolean;
  onLongPress?: (message: MessageDTO) => void;
};

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
      ? "Ghi âm"
      : type === MediaType.VIDEO
        ? "Video"
        : "Tệp đính kèm",
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
          ? "border-white/25 bg-white/15"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
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
              isOwn ? "text-white" : "text-app-fg dark:text-app-fg-dark",
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
                  ? "text-white/80"
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
  seenUsers = [],
  seenOverflow = 0,
  isLastMessage = false,
  animateEntry = false,
  onLongPress,
}: ChatMessageBubbleProps) {
  const { userId } = useAuth();
  const isOwn = message.senderId === userId;
  const bubbleTime = React.useMemo(
    () => formatMessageTimestamp(message.createdAt),
    [message.createdAt],
  );

  const content = message.isDeleted
    ? "Tin nhắn đã bị xóa."
    : message.content?.trim() || "";
  const attachments = message.attachments ?? [];
  const showSeenAvatars = isOwn && !message.isDeleted && seenUsers.length > 0;
  const showSentStatus =
    isOwn &&
    !message.isDeleted &&
    isLastMessage &&
    (message.clientStatus === "sending" || seenUsers.length === 0);

  const openAttachment = React.useCallback(async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn("Failed to open attachment:", error);
    }
  }, []);

  return (
    <Animated.View
      entering={animateEntry ? FadeInDown.duration(180) : undefined}
      layout={animateEntry ? LinearTransition.duration(140) : undefined}
    >
      <View
        className={cn(
          "flex-row items-end gap-2 px-4",
          isOwn ? "justify-end" : "justify-start",
        )}
      >
        {!isOwn ? (
          showAvatar ? (
            <ChatAvatar
              name={senderName}
              imageUrl={senderAvatarUrl}
              size="sm"
            />
          ) : (
            <View className="h-10 w-10" />
          )
        ) : null}

        <View
          className={cn("max-w-[78%]", isOwn ? "items-end" : "items-start")}
        >
          <Text className="mt-1 px-1 text-[11px] text-app-muted-fg dark:text-app-muted-fg-dark">
            {bubbleTime}
          </Text>
          <Pressable
            delayLongPress={180}
            disabled={!onLongPress}
            onLongPress={() => onLongPress?.(message)}
          >
            <View
              className={cn(
                "rounded-3xl border px-4 py-3 shadow-none",
                isOwn
                  ? "border-sky-500 bg-sky-500 dark:border-sky-500 dark:bg-sky-500"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
              )}
            >
              {message.replyTo ? (
                <View className={cn(content || attachments.length > 0 ? "mb-3" : "")}>
                  <MessageReplyPreview
                    replyTo={message.replyTo}
                    tone={isOwn ? "own" : "other"}
                  />
                </View>
              ) : null}

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
                              attachments.length === 1
                                ? "h-56 w-60"
                                : "h-36 w-40",
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
                    isOwn ? "text-white" : "text-app-fg dark:text-app-fg-dark",
                    message.isDeleted ? "italic opacity-70" : "",
                  )}
                >
                  {content}
                </Text>
              ) : null}
            </View>
          </Pressable>

          {isOwn && !message.isDeleted ? (
            <View className="mt-1 min-h-5 flex-row items-center gap-2 px-1">
              {showSeenAvatars ? (
                <View className="flex-row items-center">
                  {seenUsers.map((user, index) => (
                    <View
                      key={`${user.name}-${index}`}
                      className={index === 0 ? "" : "-ml-3"}
                    >
                      <ChatAvatar
                        name={user.name}
                        imageUrl={user.avatarUrl}
                        size="sm"
                      />
                    </View>
                  ))}
                  {seenOverflow > 0 ? (
                    <Text className="ml-1 text-[10px] text-app-muted-fg dark:text-app-muted-fg-dark">
                      +{seenOverflow}
                    </Text>
                  ) : null}
                </View>
              ) : showSentStatus ? (
                <Text className="text-[11px] text-app-muted-fg dark:text-app-muted-fg-dark">
                  {message.clientStatus === "sending" ? "Đang gửi..." : "Đã gửi"}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
