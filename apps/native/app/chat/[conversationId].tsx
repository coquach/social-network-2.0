import { useAuth } from "@clerk/expo";
import {
  MediaType,
  type MessageDTO,
  type ConversationWithParticipantsDTO,
  useChatStore,
  useConversation,
  useCurrentUser,
  useDeleteMessage,
  useMarkConversationAsRead,
  useMessages,
  usePresenceStore,
  useSendMessage,
  useUploadOptional,
  useUser,
} from "@repo/shared";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "heroui-native/spinner";
import { useToast } from "heroui-native/toast";
import React from "react";
import { Alert, KeyboardAvoidingView, Platform, View } from "react-native";

import {
  type ChatComposerAttachment,
  inferMediaType,
} from "~/components/chat/chat-attachment-utils";
import { ChatComposer } from "~/components/chat/chat-composer";
import {
  compareMessagesAscending,
  getConversationName,
  getConversationOtherParticipant,
  getConversationOtherUserId,
  getConversationLastSeenMap,
} from "~/components/chat/chat-helpers";
import { ConversationHeader } from "~/components/chat/conversation-screen/conversation-header";
import { MessageActionSheet } from "~/components/chat/conversation-screen/message-action-sheet";
import { ConversationInfoSheet } from "~/components/chat/conversation-screen/conversation-info-sheet";
import { ConversationMessageList } from "~/components/chat/conversation-screen/conversation-message-list";
import { AppScreen } from "~/components/ui/app-screen";
import { AppToast, type AppToastData } from "~/components/ui/app-toast";
import { pickLibraryMediaAssets, pickSingleImage } from "~/lib/media-picker";
import { useNativeConversationRealtime } from "~/providers/chat-realtime-provider";
import { usePresenceChannel } from "~/providers/presence-provider";

const MAX_ATTACHMENTS = 6;

const createAttachmentId = () =>
  `attachment:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildFileDescriptor = (params: {
  uri: string;
  name: string;
  mimeType?: string;
}) => ({
  uri: params.uri,
  name: params.name,
  type: params.mimeType || "application/octet-stream",
});

const ensureAttachmentLimit = (
  currentCount: number,
  nextCount: number,
): boolean => currentCount + nextCount <= MAX_ATTACHMENTS;

export default function ChatConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { userId } = useAuth();
  const { toast } = useToast();
  const uploadService = useUploadOptional();
  const { data: currentUser } = useCurrentUser();
  const { replyTo, setReplyTo, clearReply } = useChatStore();
  const [composerValue, setComposerValue] = React.useState("");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedMessage, setSelectedMessage] = React.useState<MessageDTO | null>(
    null,
  );
  const [attachments, setAttachments] = React.useState<
    ChatComposerAttachment[]
  >([]);
  const isRecordingRef = React.useRef(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const { data: conversation, isLoading: isConversationLoading } =
    useConversation(conversationId ?? "", {
      enabled: Boolean(conversationId),
    });
  const {
    data: messagesPage,
    isLoading: isMessagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId ?? "", {
    limit: 30,
  });

  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage(
    conversationId ?? "",
  );
  const { mutateAsync: deleteMessage, isPending: isDeletingMessage } =
    useDeleteMessage(conversationId ?? "");
  const { mutate: markConversationAsRead } = useMarkConversationAsRead();

  const otherUserId = React.useMemo(() => {
    if (!conversation) {
      return null;
    }

    return getConversationOtherUserId(conversation, userId ?? null);
  }, [conversation, userId]);

  const { data: otherUser } = useUser(otherUserId ?? "", {
    enabled: Boolean(otherUserId),
  });
  const presence = usePresenceStore((state) =>
    otherUserId ? state.getById(otherUserId) : undefined,
  );

  const fetchedMessages = React.useMemo(() => {
    const items = messagesPage?.pages.flatMap((page) => page.data) ?? [];
    return [...items].sort(compareMessagesAscending);
  }, [messagesPage?.pages]);

  const participantIds = React.useMemo(() => {
    return (conversation?.participants ?? []).filter(
      (participantId) => participantId !== userId,
    );
  }, [conversation?.participants, userId]);

  const isHiddenForMe = React.useMemo(() => {
    if (!userId) {
      return false;
    }

    return Boolean(conversation?.hiddenFor?.includes(userId));
  }, [conversation?.hiddenFor, userId]);

  usePresenceChannel(participantIds);

  const { messages, handleReachedBottom } = useNativeConversationRealtime({
    conversationId,
    isHiddenForMe,
    fetchedMessages,
    markConversationAsRead,
  });

  const otherParticipant = React.useMemo(() => {
    if (!conversation) {
      return null;
    }

    return getConversationOtherParticipant(conversation, userId ?? null);
  }, [conversation, userId]);

  const participantMap = React.useMemo(() => {
    const map = new Map<string, { name: string; avatarUrl?: string }>();
    const conversationWithParticipants = conversation as
      | ConversationWithParticipantsDTO
      | undefined;

    if (Array.isArray(conversationWithParticipants?.participantDetails)) {
      conversationWithParticipants.participantDetails.forEach((participant) => {
        map.set(participant.id, {
          name: participant.name?.trim() || "Người dùng",
          avatarUrl: participant.avatarUrl,
        });
      });
    }

    if (currentUser?.id) {
      const ownName =
        `${currentUser.firstName} ${currentUser.lastName}`.trim() || "Bạn";
      map.set(currentUser.id, {
        name: ownName,
        avatarUrl: currentUser.avatarUrl,
      });
    }

    if (otherUser?.id) {
      const otherName =
        `${otherUser.firstName} ${otherUser.lastName}`.trim() || "Người dùng";
      map.set(otherUser.id, {
        name: otherName,
        avatarUrl: otherUser.avatarUrl,
      });
    }

    return map;
  }, [conversation, currentUser, otherUser]);

  const lastSeenMap = React.useMemo(
    () => getConversationLastSeenMap(conversation?.lastSeenMessageId as never),
    [conversation?.lastSeenMessageId],
  );

  const showToast = React.useCallback(
    (value: AppToastData) => {
      toast.show({
        component: (toastProps) => <AppToast toast={value} toastProps={toastProps} />,
      });
    },
    [toast],
  );

  const conversationName = conversation
    ? getConversationName(conversation, otherUser ?? otherParticipant)
    : "Cuộc trò chuyện";

  const recordingDurationMs = React.useMemo(() => {
    const currentTime = (audioRecorder as { currentTime?: number }).currentTime;
    return typeof currentTime === "number" ? Math.round(currentTime * 1000) : 0;
  }, [audioRecorder, recorderState]);

  React.useEffect(() => {
    clearReply();
    setSelectedMessage(null);
  }, [clearReply, conversationId]);

  const ensureUploadsEnabled = React.useCallback(() => {
    if (uploadService) {
      return true;
    }

    Alert.alert(
      "Thiếu cấu hình upload",
      "Thêm EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME và EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET vào app native để gửi tệp.",
    );
    return false;
  }, [uploadService]);

  const appendAttachments = React.useCallback(
    (nextItems: ChatComposerAttachment[]) => {
      if (nextItems.length === 0) {
        return;
      }

      setAttachments((current) => {
        if (!ensureAttachmentLimit(current.length, nextItems.length)) {
          Alert.alert(
            "Vượt quá giới hạn",
            `Mỗi tin nhắn chỉ gửi tối đa ${MAX_ATTACHMENTS} tệp.`,
          );
          return current;
        }

        return [...current, ...nextItems];
      });
    },
    [],
  );

  const handlePickMedia = React.useCallback(async () => {
    if (!ensureUploadsEnabled()) {
      return;
    }

    const assets = await pickLibraryMediaAssets({
      permissionAlert: {
        title: "Cần quyền truy cập thư viện",
        message: "Hãy cho phép truy cập ảnh và video để gửi media.",
      },
      mediaTypes: ["images", "videos"],
      selectionLimit: Math.max(1, MAX_ATTACHMENTS - attachments.length),
    });

    if (assets.length === 0) {
      return;
    }

    const mappedAttachments = assets.map((asset) => {
      const type = asset.type === "video" ? MediaType.VIDEO : MediaType.IMAGE;
      const name =
        asset.fileName ||
        `${type === MediaType.VIDEO ? "video" : "image"}-${Date.now()}`;
      const mimeType =
        asset.mimeType ||
        (type === MediaType.VIDEO ? "video/mp4" : "image/jpeg");

      return {
        id: createAttachmentId(),
        type,
        name,
        mimeType,
        size: asset.fileSize,
        durationMs: asset.duration ?? undefined,
        previewUri: asset.uri,
        uploadFile: {
          file: buildFileDescriptor({
            uri: asset.uri,
            name,
            mimeType,
          }),
          type,
          previewUri: asset.uri,
        },
      } satisfies ChatComposerAttachment;
    });

    appendAttachments(mappedAttachments);
  }, [appendAttachments, attachments.length, ensureUploadsEnabled]);

  const handlePickCamera = React.useCallback(async () => {
    if (!ensureUploadsEnabled()) {
      return;
    }

    const asset = await pickSingleImage({
      source: "camera",
      permissionAlert: {
        title: "Cần quyền truy cập camera",
        message: "Hãy cho phép camera để chụp ảnh gửi trong cuộc trò chuyện.",
      },
      allowsEditing: false,
    });

    if (!asset) {
      return;
    }

    const name = asset.fileName || `image-${Date.now()}.jpg`;
    const mimeType = asset.mimeType || "image/jpeg";

    appendAttachments([
      {
        id: createAttachmentId(),
        type: MediaType.IMAGE,
        name,
        mimeType,
        size: asset.fileSize,
        previewUri: asset.uri,
        uploadFile: {
          file: buildFileDescriptor({
            uri: asset.uri,
            name,
            mimeType,
          }),
          type: MediaType.IMAGE,
          previewUri: asset.uri,
        },
      } satisfies ChatComposerAttachment,
    ]);
  }, [appendAttachments, ensureUploadsEnabled]);

  const handlePickFile = React.useCallback(async () => {
    if (!ensureUploadsEnabled()) {
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: "*/*",
    });

    if (result.canceled) {
      return;
    }

    const mappedAttachments = result.assets.map((asset) => {
      const type = inferMediaType(asset.mimeType, asset.name);

      return {
        id: createAttachmentId(),
        type,
        name: asset.name,
        mimeType: asset.mimeType ?? undefined,
        size: asset.size ?? undefined,
        previewUri: type === MediaType.IMAGE ? asset.uri : undefined,
        uploadFile: {
          file: buildFileDescriptor({
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType ?? undefined,
          }),
          type,
          previewUri: type === MediaType.IMAGE ? asset.uri : undefined,
        },
      } satisfies ChatComposerAttachment;
    });

    appendAttachments(mappedAttachments);
  }, [appendAttachments, ensureUploadsEnabled]);

  const handleToggleRecording = React.useCallback(async () => {
    if (!ensureUploadsEnabled()) {
      return;
    }

    if (recorderState.isRecording) {
      await audioRecorder.stop();
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      if (!audioRecorder.uri) {
        return;
      }

      const fileName = `voice-note-${Date.now()}.m4a`;
      appendAttachments([
        {
          id: createAttachmentId(),
          type: MediaType.AUDIO,
          name: fileName,
          mimeType: "audio/m4a",
          durationMs: recordingDurationMs,
          previewUri: audioRecorder.uri,
          uploadFile: {
            file: buildFileDescriptor({
              uri: audioRecorder.uri,
              name: fileName,
              mimeType: "audio/m4a",
            }),
            type: MediaType.AUDIO,
            previewUri: audioRecorder.uri,
          },
        },
      ]);
      return;
    }

    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Cần quyền micro", "Hãy cho phép truy cập micro để ghi âm.");
      return;
    }

    if (!ensureAttachmentLimit(attachments.length, 1)) {
      Alert.alert(
        "Vượt quá giới hạn",
        `Mỗi tin nhắn chỉ gửi tối đa ${MAX_ATTACHMENTS} tệp.`,
      );
      return;
    }

    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  }, [
    appendAttachments,
    attachments.length,
    audioRecorder,
    ensureUploadsEnabled,
    recorderState.isRecording,
    recordingDurationMs,
  ]);

  const handleRemoveAttachment = React.useCallback((attachmentId: string) => {
    setAttachments((current) =>
      current.filter((attachment) => attachment.id !== attachmentId),
    );
  }, []);

  React.useEffect(() => {
    isRecordingRef.current = recorderState.isRecording;
  }, [recorderState.isRecording]);

  React.useEffect(() => {
    return () => {
      if (isRecordingRef.current) {
        void audioRecorder.stop().catch(() => undefined);
      }
    };
  }, [audioRecorder]);

  const handleSend = React.useCallback(async () => {
    const content = composerValue.trim();
    if (!conversationId || (content.length === 0 && attachments.length === 0)) {
      return;
    }

    await sendMessage({
      conversationId,
      content,
      replyTo: replyTo?._id,
      uploadFiles: attachments.map((attachment) => attachment.uploadFile),
    });

    setComposerValue("");
    setAttachments([]);
    clearReply();
  }, [attachments, clearReply, composerValue, conversationId, replyTo?._id, sendMessage]);

  const handleLongPressMessage = React.useCallback((message: MessageDTO) => {
    setSelectedMessage(message);
  }, []);

  const handleCopyMessage = React.useCallback(async () => {
    const content = selectedMessage?.content?.trim();
    if (!content) {
      return;
    }

    try {
      await Clipboard.setStringAsync(content);
      showToast({
        title: "Đã sao chép",
        message: "Nội dung tin nhắn đã được lưu vào bộ nhớ tạm.",
        variant: "success",
      });
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to copy message:", error);
      showToast({
        title: "Không thể sao chép",
        message: "Vui lòng thử lại sau.",
        variant: "error",
      });
    }
  }, [selectedMessage?.content, showToast]);

  const handleReplyMessage = React.useCallback(() => {
    if (!selectedMessage || selectedMessage.isDeleted) {
      return;
    }

    setReplyTo(selectedMessage);
    setSelectedMessage(null);
  }, [selectedMessage, setReplyTo]);

  const handleDeleteMessage = React.useCallback(() => {
    const message = selectedMessage;
    if (!message || message.senderId !== userId) {
      return;
    }

    setSelectedMessage(null);
    Alert.alert("Xóa tin nhắn", "Bạn có chắc muốn xóa tin nhắn này không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          void deleteMessage(message._id)
            .then(() => {
              showToast({
                title: "Đã xóa tin nhắn",
                variant: "success",
              });
            })
            .catch((error) => {
              console.error("Failed to delete message:", error);
              showToast({
                title: "Không thể xóa tin nhắn",
                message: "Vui lòng thử lại sau.",
                variant: "error",
              });
            });
        },
      },
    ]);
  }, [deleteMessage, selectedMessage, showToast, userId]);

  return (
    <AppScreen className="px-0 py-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-app-bg dark:bg-app-bg-dark"
      >
        <View className="flex-1">
          <ConversationHeader
            conversation={conversation}
            conversationName={conversationName}
            directAvatarUrl={otherUser?.avatarUrl ?? otherParticipant?.avatarUrl}
            presence={presence}
            onOpenDrawer={() => {
              setDrawerOpen(true);
            }}
          />

          {isConversationLoading ? (
            <View className="flex-1 items-center justify-center">
              <Spinner size="sm" color="default" />
            </View>
          ) : (
            <ConversationMessageList
              messages={messages}
              currentUserId={userId}
              participantMap={participantMap}
              lastSeenMap={lastSeenMap}
              isLoading={isMessagesLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadEarlier={() => {
                void fetchNextPage();
              }}
              onReachedBottom={handleReachedBottom}
              onLongPressMessage={handleLongPressMessage}
            />
          )}

          <ChatComposer
            value={composerValue}
            attachments={attachments}
            replyTo={replyTo}
            onChange={setComposerValue}
            onPickCamera={handlePickCamera}
            onPickMedia={handlePickMedia}
            onPickFile={handlePickFile}
            onToggleRecording={handleToggleRecording}
            onRemoveAttachment={handleRemoveAttachment}
            onClearReply={clearReply}
            onSend={() => {
              void handleSend();
            }}
            isRecording={recorderState.isRecording}
            recordingDurationMs={recordingDurationMs}
            disabled={
              isSending || isDeletingMessage || !conversationId || isHiddenForMe
            }
          />

          <ConversationInfoSheet
            visible={drawerOpen}
            onClose={() => {
              setDrawerOpen(false);
            }}
            conversation={conversation}
            conversationName={conversationName}
            currentUserId={userId}
            directAvatarUrl={otherUser?.avatarUrl ?? otherParticipant?.avatarUrl}
            presence={presence}
          />

          <MessageActionSheet
            visible={Boolean(selectedMessage)}
            message={selectedMessage}
            isOwn={selectedMessage?.senderId === userId}
            onClose={() => {
              setSelectedMessage(null);
            }}
            onCopy={() => {
              void handleCopyMessage();
            }}
            onReply={handleReplyMessage}
            onDelete={handleDeleteMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
