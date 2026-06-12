import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { CallType, MediaType, type AttachmentDTO, type MessageDTO } from "@repo/shared";
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";

import {
  buildAttachmentMeta,
  getAttachmentTypeFromMessage,
} from "~/components/chat/chat-attachment-utils";
import { ChatAvatar } from "~/components/chat/chat-avatar";
import { MessageReplyPreview } from "~/components/chat/conversation-screen/message-reply-preview";
import { useCallActions } from "~/hooks/use-call-actions";
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
  highlighted?: boolean;
  onLongPress?: (message: MessageDTO) => void;
  onPressReplyTo?: (messageId: string) => void;
};

const formatAttachmentName = (attachment: AttachmentDTO, fallback: string) =>
  attachment.fileName?.trim() || fallback;

function AudioAttachmentCard({
  attachment,
  isOwn,
}: {
  attachment: AttachmentDTO;
  isOwn: boolean;
}) {
  const player = useAudioPlayer(attachment.url);
  const status = useAudioPlayerStatus(player);
  
  const isPlaying = status.playing;
  // duration and currentTime are in milliseconds? The documentation usually indicates seconds or milliseconds, let's assume milliseconds as that's what we found in SDK 55
  // Actually Expo Audio in SDK 55: currentTime and duration are in milliseconds.
  const progressMs = status.currentTime || 0;
  const durationMs = status.duration || 1; 
  const progress = Math.min(1, Math.max(0, progressMs / durationMs));
  
  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const metaText = isPlaying || progressMs > 0 ? formatTime(progressMs) : buildAttachmentMeta(attachment.size) || "0:00";

  return (
    <Pressable
      onPress={togglePlay}
      className={cn(
        "rounded-[20px] border pl-2 pr-4 py-2 min-w-[150px] max-w-[240px]",
        isOwn
          ? "border-white/25 bg-white/15"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
      )}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={cn(
            "h-10 w-10 items-center justify-center rounded-full pl-0.5",
            isOwn ? "bg-white/20" : "bg-sky-500/10 dark:bg-sky-400/10"
          )}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={18}
            color={isOwn ? "#ffffff" : "#0ea5e9"}
          />
        </View>
        
        <View className="flex-1 flex-row items-center gap-3">
          <View className={cn("flex-1 h-1 rounded-full relative", isOwn ? "bg-white/30" : "bg-slate-200 dark:bg-slate-700")}>
            <View 
              className={cn("absolute -top-1 h-3 w-3 rounded-full", isOwn ? "bg-white" : "bg-sky-500")}
              style={{ left: `${progress * 100}%`, transform: [{ translateX: -6 }] }} 
            />
          </View>
          
          <Text className={cn("text-[11px] font-medium min-w-[28px] text-right", isOwn ? "text-white" : "text-app-fg dark:text-app-fg-dark")}>
            {metaText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

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

  if (type === MediaType.AUDIO) {
    return <AudioAttachmentCard attachment={attachment} isOwn={isOwn} />;
  }

  const isVideo = type === MediaType.VIDEO;
  const iconName = isVideo ? "film-outline" : "document-attach-outline";
  const previewUri = isVideo ? attachment.thumbnailUrl : undefined;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-3 rounded-[22px] p-3 min-w-[200px] border",
        isOwn
          ? "border-white/20 bg-sky-500/80 active:bg-sky-600"
          : "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700",
      )}
    >
      {previewUri ? (
        <View className="overflow-hidden rounded-2xl border border-white/10">
          <Image source={{ uri: previewUri }} className="h-10 w-10" />
        </View>
      ) : (
        <View
          className={cn(
            "h-10 w-10 items-center justify-center rounded-full",
            isOwn
              ? "bg-white/20"
              : isVideo
                ? "bg-amber-100 dark:bg-amber-500/15"
                : "bg-white dark:bg-slate-700"
          )}
        >
          <Ionicons
            name={iconName}
            size={18}
            color={
              isOwn
                ? "#ffffff"
                : isVideo
                  ? "#d97706"
                  : "#64748b"
            }
          />
        </View>
      )}

      <View className="flex-1">
        <Text
          numberOfLines={1}
          className={cn(
            "text-sm font-medium",
            isOwn ? "text-white" : "text-app-fg dark:text-app-fg-dark",
          )}
        >
          {fileName}
        </Text>
        {meta ? (
          <Text
            numberOfLines={1}
            className={cn(
              "mt-0.5 text-[10px]",
              isOwn
                ? "text-white/70"
                : "text-app-muted-fg dark:text-app-muted-fg-dark",
            )}
          >
            {meta}
          </Text>
        ) : null}
      </View>

      <View
        className={cn(
          "h-8 w-8 items-center justify-center rounded-full",
          isOwn ? "bg-white/10" : "bg-white dark:bg-slate-700 border border-slate-200/50 dark:border-slate-600/50"
        )}
      >
        <Ionicons
          name="download-outline"
          size={16}
          color={isOwn ? "#ffffff" : "#64748b"}
        />
      </View>
    </Pressable>
  );
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

function CallMessageCard({
  message,
  isOwn,
  onStartCall,
}: {
  message: MessageDTO;
  isOwn: boolean;
  onStartCall: (type: CallType) => void;
}) {
  const meta = (message as any).systemMeta;
  const isVideo = meta?.callType === "video" || meta?.callType === "VIDEO";
  const duration = meta?.durationSec;
  const endedReason = meta?.endedReason;
  const callStatus = meta?.callStatus;

  // Determine status details
  let statusText = "Cuộc gọi thoại";

  if (isVideo) {
    statusText = "Cuộc gọi video";
  }

  // Handle missed/rejected states
  const isMissed = 
    callStatus === "MISSED" || 
    endedReason === "MISSED" || 
    endedReason === "REJECTED";
    
  const isCancelled = callStatus === "CANCELLED" || endedReason === "CANCELLED";

  if (isMissed) {
    statusText = isVideo ? "Cuộc gọi video nhỡ" : "Cuộc gọi nhỡ";
  } else if (isCancelled) {
    statusText = isVideo ? "Cuộc gọi video đã hủy" : "Cuộc gọi thoại đã hủy";
  } else {
    statusText = isVideo ? "Cuộc gọi video đã kết thúc" : "Cuộc gọi thoại đã kết thúc";
  }

  const durationStr = duration && duration > 0 ? formatDuration(duration) : null;

  return (
    <View className="flex-row items-center gap-3 py-1 min-w-[200px]">
      <View className="flex-1 justify-center">
        <Text className={cn("text-[14px] font-semibold", isOwn ? "text-white" : "text-app-fg dark:text-app-fg-dark")}>
          {statusText}
        </Text>
        {durationStr ? (
          <Text className={cn("text-[11px] mt-0.5", isOwn ? "text-white/80" : "text-app-muted-fg dark:text-app-muted-fg-dark")}>
            Thời lượng: {durationStr}
          </Text>
        ) : (
          <Text className={cn("text-[11px] mt-0.5 opacity-80", isOwn ? "text-white/70" : "text-app-muted-fg dark:text-app-muted-fg-dark")}>
            {isMissed ? "Nhấn để gọi lại" : "Nhấn để gọi"}
          </Text>
        )}
      </View>
      <Pressable
        onPress={() => onStartCall(isVideo ? CallType.VIDEO : CallType.AUDIO)}
        className={cn(
          "h-11 w-11 items-center justify-center rounded-2xl",
          isOwn ? "bg-white/20 active:bg-white/30" : "bg-slate-100 dark:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700"
        )}
      >
        <Ionicons 
          name={isVideo ? "videocam" : "call"} 
          size={16} 
          color={isOwn ? "white" : "#0ea5e9"}
        />
      </Pressable>
    </View>
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
  highlighted = false,
  onLongPress,
  onPressReplyTo,
}: ChatMessageBubbleProps) {
  const { userId } = useAuth();
  const { startCall } = useCallActions();
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
    <View>
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
            <View className="flex-col gap-1.5">
              {message.replyTo ? (
                <View className="mb-0.5 max-w-full">
                  <MessageReplyPreview
                    replyTo={message.replyTo}
                    tone={isOwn ? "own" : "other"}
                    variant="bubble"
                    onPress={() => {
                      if (message.replyTo?._id) {
                        onPressReplyTo?.(message.replyTo._id);
                      }
                    }}
                  />
                </View>
              ) : null}

              {attachments.length > 0 && !message.isDeleted ? (
                <View className={cn(
                  "gap-1.5",
                  attachments.length === 1 ? "" : "flex-row flex-wrap"
                )}>
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
                          className="overflow-hidden rounded-[22px] border border-white/10 bg-black/5"
                        >
                          <Image
                            source={{ uri: attachment.url }}
                            className={cn(
                              attachments.length === 1
                                ? "h-64 w-[280px]"
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

              {(message as any).messageType === "system_call" ? (
                <View
                  className={cn(
                    "rounded-2xl px-3 py-2 max-w-full",
                    isOwn
                      ? "bg-sky-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100",
                  )}
                >
                  <CallMessageCard 
                    message={message}
                    isOwn={isOwn}
                    onStartCall={(type) => {
                      void startCall(message.conversationId, type);
                    }}
                  />
                </View>
              ) : null}

              {content && (message as any).messageType !== "system_call" ? (
                <View
                  className={cn(
                    "rounded-[22px] border px-4 py-3 shadow-none max-w-full",
                    isOwn
                      ? "border-sky-500 bg-sky-500 dark:border-sky-500 dark:bg-sky-500"
                      : "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800",
                    highlighted
                      ? isOwn
                        ? "border-white bg-sky-400 dark:border-white dark:bg-sky-400"
                        : "border-sky-300 bg-sky-50 dark:border-sky-400 dark:bg-sky-500/10"
                      : "",
                  )}
                >
                  <Text
                    className={cn(
                      "text-[15px] leading-5",
                      isOwn ? "text-white" : "text-app-fg dark:text-app-fg-dark",
                      message.isDeleted ? "italic opacity-70" : "",
                    )}
                  >
                    {content}
                  </Text>
                </View>
              ) : null}
              
              {message.isDeleted && !content && attachments.length === 0 && (message as any).messageType !== "system_call" ? (
                <View
                  className={cn(
                    "rounded-[22px] border px-4 py-3 shadow-none max-w-full",
                    isOwn
                      ? "border-sky-500 bg-sky-500 dark:border-sky-500 dark:bg-sky-500"
                      : "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800",
                  )}
                >
                  <Text
                    className={cn(
                      "text-[15px] leading-5 italic opacity-70",
                      isOwn ? "text-white" : "text-app-fg dark:text-app-fg-dark",
                    )}
                  >
                    Tin nhắn đã bị xoá.
                  </Text>
                </View>
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
                        size="xs"
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
    </View>
  );
}
