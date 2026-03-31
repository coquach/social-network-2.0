import { useAuth } from '@clerk/expo';
import { useFocusEffect } from '@react-navigation/native';
import {
  MediaType,
  type MessageDTO,
  useConversation,
  useCurrentUser,
  useMarkConversationAsRead,
  useMessages,
  usePresenceStore,
  useSendMessage,
  useUploadOptional,
  useUser,
} from '@repo/shared';
import * as DocumentPicker from 'expo-document-picker';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { Spinner } from 'heroui-native/spinner';
import React from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';

import {
  type ChatComposerAttachment,
  inferMediaType,
} from '~/components/chat/chat-attachment-utils';
import { DirectChatAvatar, GroupChatAvatar } from '~/components/chat/chat-avatar';
import { ChatComposer } from '~/components/chat/chat-composer';
import { getConversationName, getConversationOtherUserId } from '~/components/chat/chat-helpers';
import { ChatMessageBubble } from '~/components/chat/chat-message-bubble';
import { AppCard } from '~/components/ui/app-card';
import { AppScreen } from '~/components/ui/app-screen';
import { AppHeaderIconButton, AppHeader } from '~/components/ui/app-header';
import { usePresenceChannel } from '~/providers/presence-provider';
import { useSocket } from '~/providers/socket-provider';

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
  type: params.mimeType || 'application/octet-stream',
});

const ensureAttachmentLimit = (
  currentCount: number,
  nextCount: number,
): boolean => currentCount + nextCount <= MAX_ATTACHMENTS;

export default function ChatConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { userId } = useAuth();
  const { chatSocket } = useSocket();
  const uploadService = useUploadOptional();
  const { data: currentUser } = useCurrentUser();
  const [composerValue, setComposerValue] = React.useState('');
  const [attachments, setAttachments] = React.useState<ChatComposerAttachment[]>([]);
  const listRef = React.useRef<FlatList<MessageDTO>>(null);
  const isRecordingRef = React.useRef(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const {
    data: conversation,
    isLoading: isConversationLoading,
    refetch: refetchConversation,
  } = useConversation(conversationId ?? '', {
    enabled: Boolean(conversationId),
  });
  const {
    data: messagesPage,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useMessages(conversationId ?? '', {
    limit: 30,
  });

  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage(conversationId ?? '');
  const { mutate: markConversationAsRead } = useMarkConversationAsRead();

  const otherUserId = React.useMemo(() => {
    if (!conversation) {
      return null;
    }

    return getConversationOtherUserId(conversation, userId ?? null);
  }, [conversation, userId]);

  const { data: otherUser } = useUser(otherUserId ?? '', {
    enabled: Boolean(otherUserId),
  });
  const presence = usePresenceStore((state) =>
    otherUserId ? state.getById(otherUserId) : undefined,
  );

  const messages = React.useMemo(() => {
    const items = messagesPage?.pages.flatMap((page) => page.data) ?? [];
    return [...items].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [messagesPage?.pages]);

  const participantIds = React.useMemo(() => {
    return (conversation?.participants ?? []).filter((participantId) => participantId !== userId);
  }, [conversation?.participants, userId]);

  usePresenceChannel(participantIds);

  const participantMap = React.useMemo(() => {
    const map = new Map<string, { name: string; avatarUrl?: string }>();

    if (currentUser?.id) {
      const ownName = `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Ban';
      map.set(currentUser.id, {
        name: ownName,
        avatarUrl: currentUser.avatarUrl,
      });
    }

    if (otherUser?.id) {
      const otherName = `${otherUser.firstName} ${otherUser.lastName}`.trim() || 'Nguoi dung';
      map.set(otherUser.id, {
        name: otherName,
        avatarUrl: otherUser.avatarUrl,
      });
    }

    return map;
  }, [currentUser, otherUser]);

  const conversationName = conversation
    ? getConversationName(conversation, otherUser)
    : 'Cuoc tro chuyen';

  const recordingDurationMs = React.useMemo(() => {
    const currentTime = (audioRecorder as { currentTime?: number }).currentTime;
    return typeof currentTime === 'number' ? Math.round(currentTime * 1000) : 0;
  }, [audioRecorder, recorderState]);

  const ensureUploadsEnabled = React.useCallback(() => {
    if (uploadService) {
      return true;
    }

    Alert.alert(
      'Thiếu cấu hình upload',
      'Thêm EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME và EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET vào app native để gửi tệp.',
    );
    return false;
  }, [uploadService]);

  const appendAttachments = React.useCallback((nextItems: ChatComposerAttachment[]) => {
    if (nextItems.length === 0) {
      return;
    }

    setAttachments((current) => {
      if (!ensureAttachmentLimit(current.length, nextItems.length)) {
        Alert.alert(
          'Vượt quá giới hạn',
          `Mỗi tin nhắn chỉ gửi tối đa ${MAX_ATTACHMENTS} tệp.`,
        );
        return current;
      }

      return [...current, ...nextItems];
    });
  }, []);

  const handlePickMedia = React.useCallback(async () => {
    if (!ensureUploadsEnabled()) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập thư viện', 'Hãy cho phép truy cập ảnh và video để gửi media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: Math.max(1, MAX_ATTACHMENTS - attachments.length),
    });

    if (result.canceled) {
      return;
    }

    const mappedAttachments = result.assets.map((asset) => {
      const type = asset.type === 'video' ? MediaType.VIDEO : MediaType.IMAGE;
      const name =
        asset.fileName || `${type === MediaType.VIDEO ? 'video' : 'image'}-${Date.now()}`;
      const mimeType =
        asset.mimeType || (type === MediaType.VIDEO ? 'video/mp4' : 'image/jpeg');

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

  const handlePickFile = React.useCallback(async () => {
    if (!ensureUploadsEnabled()) {
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: '*/*',
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
          mimeType: 'audio/m4a',
          durationMs: recordingDurationMs,
          previewUri: audioRecorder.uri,
          uploadFile: {
            file: buildFileDescriptor({
              uri: audioRecorder.uri,
              name: fileName,
              mimeType: 'audio/m4a',
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
      Alert.alert('Cần quyền micro', 'Hãy cho phép truy cập micro để ghi âm.');
      return;
    }

    if (!ensureAttachmentLimit(attachments.length, 1)) {
      Alert.alert(
        'Vượt quá giới hạn',
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
    setAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!conversationId || !chatSocket) {
        return undefined;
      }

      chatSocket.emit('conversation.join', { conversationId });

      return () => {
        chatSocket.emit('conversation.leave', { conversationId });
      };
    }, [chatSocket, conversationId]),
  );

  React.useEffect(() => {
    if (!chatSocket || !conversationId) {
      return;
    }

    const handleRealtimeRefresh = (payload?: { conversationId?: string }) => {
      if (payload?.conversationId && payload.conversationId !== conversationId) {
        return;
      }

      void refetchMessages();
      void refetchConversation();
    };

    chatSocket.on('message.new', handleRealtimeRefresh);
    chatSocket.on('message.deleted', handleRealtimeRefresh);
    chatSocket.on('conversation.updated', handleRealtimeRefresh);
    chatSocket.on('conversation.read', handleRealtimeRefresh);

    return () => {
      chatSocket.off('message.new', handleRealtimeRefresh);
      chatSocket.off('message.deleted', handleRealtimeRefresh);
      chatSocket.off('conversation.updated', handleRealtimeRefresh);
      chatSocket.off('conversation.read', handleRealtimeRefresh);
    };
  }, [chatSocket, conversationId, refetchConversation, refetchMessages]);

  React.useEffect(() => {
    if (!conversationId || messages.length === 0) {
      return;
    }

    markConversationAsRead(conversationId);
  }, [conversationId, markConversationAsRead, messages.length]);

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
      uploadFiles: attachments.map((attachment) => attachment.uploadFile),
    });

    setComposerValue('');
    setAttachments([]);

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [attachments, composerValue, conversationId, sendMessage]);

  const subtitle = conversation?.isGroup
    ? `${conversation.participants.length} thanh vien`
    : presence?.status === 'online'
      ? 'Dang hoat dong'
      : 'Ngoai tuyen';

  return (
    <AppScreen className="px-0 py-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-app-bg dark:bg-app-bg-dark"
      >
        <View className="flex-1">
          <AppHeader
            variant="bordered"
            trailing={<AppHeaderIconButton icon="ellipsis-horizontal" iconSize={18} />}
            contentClassName="flex-row items-center gap-3"
          >
            <View className="flex-1 flex-row items-center gap-3">
              {conversation?.isGroup ? (
                <GroupChatAvatar conversation={conversation} />
              ) : (
                <DirectChatAvatar
                  name={conversationName}
                  imageUrl={otherUser?.avatarUrl}
                  online={presence?.status === 'online'}
                />
              )}
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="text-base font-semibold text-app-fg dark:text-app-fg-dark"
                >
                  {conversationName}
                </Text>
                <Text
                  numberOfLines={1}
                  className="mt-0.5 text-xs text-app-muted-fg dark:text-app-muted-fg-dark"
                >
                  {subtitle}
                </Text>
              </View>
            </View>
          </AppHeader>

          {isConversationLoading || isMessagesLoading ? (
            <View className="flex-1 items-center justify-center">
              <Spinner size="sm" color="default" />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item._id}
              renderItem={({ item, index }) => {
                const sender = participantMap.get(item.senderId);
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const showAvatar = previousMessage?.senderId !== item.senderId;

                return (
                  <ChatMessageBubble
                    message={item}
                    senderName={sender?.name ?? 'Nguoi dung'}
                    senderAvatarUrl={sender?.avatarUrl}
                    showAvatar={showAvatar}
                  />
                );
              }}
              contentContainerStyle={{
                paddingVertical: 18,
                paddingBottom: 28,
                gap: 12,
              }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                listRef.current?.scrollToEnd({ animated: true });
              }}
              ListEmptyComponent={
                <AppCard className="mx-4 rounded-[32px] px-6 py-10">
                  <Text className="text-center text-base font-semibold text-app-fg dark:text-app-fg-dark">
                    Chua co tin nhan nao
                  </Text>
                  <Text className="mt-2 text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                    Gui loi chao dau tien de bat dau cuoc tro chuyen.
                  </Text>
                </AppCard>
              }
            />
          )}

          <ChatComposer
            value={composerValue}
            attachments={attachments}
            onChange={setComposerValue}
            onPickMedia={handlePickMedia}
            onPickFile={handlePickFile}
            onToggleRecording={handleToggleRecording}
            onRemoveAttachment={handleRemoveAttachment}
            onSend={() => {
              void handleSend();
            }}
            isRecording={recorderState.isRecording}
            recordingDurationMs={recordingDurationMs}
            disabled={isSending || !conversationId}
          />
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
