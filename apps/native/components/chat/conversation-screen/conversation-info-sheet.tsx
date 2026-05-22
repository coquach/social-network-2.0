import {
  type ConversationDTO,
  type ConversationWithParticipantsDTO,
  type UserDTO,
  useDeleteConversation,
  useHideConversation,
  useLeaveConversation,
  useUnhideConversation,
  useUpdateConversation,
} from '@repo/shared';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { router } from 'expo-router';
import { Button } from 'heroui-native/button';
import { Input } from 'heroui-native/input';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';

import {
  ConversationHero,
  ActionRow,
  HeroMetric,
  InfoRow,
  MemberListRow,
  SheetSection,
} from '~/components/chat/conversation-screen/conversation-info-sheet-sections';
import {
  getConversationPresenceSubtitle,
  getGroupConversationSubtitle,
  getParticipantDisplayName,
} from '~/components/chat/chat-helpers';
import { PrimaryButton, SecondaryButton } from '~/components/ui/app-button';
import { AppBottomSheet } from '~/components/ui/app-bottom-sheet';
import { AppModal } from '~/components/ui/app-modal';
import { AppToast, type AppToastData } from '~/components/ui/app-toast';
import { ImageSourceActions } from '~/components/ui/image-source-actions';
import { useSingleImageSourcePicker } from '~/lib/use-single-image-source-picker';

type PresenceLike = {
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string | null;
};

type ParticipantInfo = {
  id: string;
  name?: string;
  avatarUrl?: string;
};

type PendingConversationAction = 'leave' | 'delete' | null;

type ConversationInfoSheetProps = {
  visible: boolean;
  onClose: () => void;
  conversation?: ConversationDTO | ConversationWithParticipantsDTO | null;
  conversationName: string;
  currentUserId?: string | null;
  directAvatarUrl?: string;
  directUser?: UserDTO | null;
  presence?: PresenceLike;
};

const hasParticipantDetails = (
  conversation?: ConversationDTO | ConversationWithParticipantsDTO | null,
): conversation is ConversationWithParticipantsDTO => {
  return Array.isArray(
    (conversation as ConversationWithParticipantsDTO | null | undefined)
      ?.participantDetails,
  );
};

function formatMetaDate(value?: Date | string | null) {
  if (!value) {
    return 'Không xác định';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Không xác định';
  }

  return format(date, 'dd/MM/yyyy', { locale: vi });
}

export function ConversationInfoSheet({
  visible,
  onClose,
  conversation,
  conversationName,
  currentUserId,
  directAvatarUrl,
  directUser,
  presence,
}: ConversationInfoSheetProps) {
  const { height } = useWindowDimensions();
  const { toast } = useToast();
  const [pendingAction, setPendingAction] =
    React.useState<PendingConversationAction>(null);
  const [draftGroupName, setDraftGroupName] = React.useState('');
  const [isAvatarSheetOpen, setIsAvatarSheetOpen] = React.useState(false);

  const isGroup = Boolean(conversation?.isGroup);
  const isAdmin = Boolean(
    isGroup && currentUserId && conversation?.admins.includes(currentUserId),
  );
  const isHidden = Boolean(
    currentUserId && conversation?.hiddenFor?.includes(currentUserId),
  );

  const members = React.useMemo<ParticipantInfo[]>(() => {
    if (!hasParticipantDetails(conversation)) {
      return [];
    }

    return conversation.participantDetails.map((member) => ({
      id: member.id,
      name: getParticipantDisplayName(member),
      avatarUrl: member.avatarUrl,
    }));
  }, [conversation]);

  const { selectedImage, pickImage, clearImage, setSelectedImage } =
    useSingleImageSourcePicker({
      permissionAlert: {
        title: 'Cần quyền truy cập ảnh',
        cameraMessage: 'Hãy cho phép camera để chụp ảnh đại diện nhóm.',
        libraryMessage: 'Hãy cho phép thư viện để chọn ảnh đại diện nhóm.',
      },
      allowsEditing: true,
      aspect: [1, 1],
      fileNamePrefix: 'group-avatar',
    });

  const { mutateAsync: updateConversation, isPending: isUpdating } =
    useUpdateConversation(conversation?._id ?? '');
  const { mutateAsync: hideConversation, isPending: isHiding } =
    useHideConversation();
  const { mutateAsync: unhideConversation, isPending: isUnhiding } =
    useUnhideConversation();
  const { mutateAsync: leaveConversation, isPending: isLeaving } =
    useLeaveConversation();
  const { mutateAsync: deleteConversation, isPending: isDeleting } =
    useDeleteConversation();

  const showToast = React.useCallback(
    (value: AppToastData) => {
      toast.show({
        component: (toastProps) => (
          <AppToast toast={value} toastProps={toastProps} />
        ),
      });
    },
    [toast],
  );

  React.useEffect(() => {
    if (!visible || !conversation) {
      return;
    }

    setDraftGroupName(conversation.groupName?.trim() || '');
    setSelectedImage(null);
    setPendingAction(null);
  }, [conversation, setSelectedImage, visible]);

  const handleToggleHide = React.useCallback(async () => {
    if (!conversation?._id) {
      return;
    }

    try {
      if (isHidden) {
        await unhideConversation(conversation._id);
        showToast({
          title: 'Đã hiện cuộc trò chuyện',
          variant: 'success',
        });
        return;
      }

      await hideConversation(conversation._id);
      showToast({
        title: 'Đã ẩn cuộc trò chuyện',
        message: 'Đoạn chat đã được chuyển khỏi danh sách chính.',
        variant: 'success',
      });
      onClose();
      router.replace('/chat');
    } catch (error) {
      showToast({
        title: 'Không thể cập nhật cuộc trò chuyện',
        message:
          error instanceof Error ? error.message : 'Vui lòng thử lại sau.',
        variant: 'error',
      });
    }
  }, [
    conversation?._id,
    hideConversation,
    isHidden,
    onClose,
    showToast,
    unhideConversation,
  ]);

  const handleSaveGroup = React.useCallback(async () => {
    if (!conversation?._id || !isAdmin) {
      return;
    }

    const trimmedName = draftGroupName.trim();
    const nextName =
      trimmedName.length > 0 &&
      trimmedName !== (conversation.groupName?.trim() || '')
        ? trimmedName
        : undefined;
    const nextAvatar = selectedImage?.uploadFile;

    if (!nextName && !nextAvatar) {
      return;
    }

    try {
      await updateConversation({
        groupName: nextName,
        uploadGroupAvatar: nextAvatar,
      });
      showToast({
        title: 'Đã cập nhật nhóm',
        variant: 'success',
      });
      clearImage();
    } catch (error) {
      showToast({
        title: 'Không thể cập nhật nhóm',
        message:
          error instanceof Error ? error.message : 'Vui lòng thử lại sau.',
        variant: 'error',
      });
    }
  }, [
    clearImage,
    conversation?._id,
    conversation?.groupName,
    draftGroupName,
    isAdmin,
    selectedImage?.uploadFile,
    showToast,
    updateConversation,
  ]);

  const handleConfirmAction = React.useCallback(async () => {
    if (!conversation?._id || !pendingAction) {
      return;
    }

    try {
      if (pendingAction === 'leave') {
        await leaveConversation(conversation._id);
        showToast({
          title: 'Đã rời nhóm',
          message: 'Bạn sẽ không nhận thêm tin nhắn từ nhóm này nữa.',
          variant: 'success',
        });
      }

      if (pendingAction === 'delete') {
        await deleteConversation(conversation._id);
        showToast({
          title: 'Đã xóa nhóm',
          variant: 'success',
        });
      }

      setPendingAction(null);
      onClose();
      router.replace('/chat');
    } catch (error) {
      showToast({
        title: 'Không thể thực hiện hành động',
        message:
          error instanceof Error ? error.message : 'Vui lòng thử lại sau.',
        variant: 'error',
      });
    }
  }, [
    conversation?._id,
    deleteConversation,
    leaveConversation,
    onClose,
    pendingAction,
    showToast,
  ]);

  const subtitle = isGroup
    ? getGroupConversationSubtitle(conversation?.participants.length ?? 0)
    : getConversationPresenceSubtitle(presence);

  const actionPending = isHiding || isUnhiding || isLeaving || isDeleting;
  const confirmPending =
    pendingAction === 'leave'
      ? isLeaving
      : pendingAction === 'delete'
        ? isDeleting
        : false;

  const metaPrimaryValue = isGroup
    ? `${conversation?.participants.length ?? 0} thành viên`
    : getConversationPresenceSubtitle(presence);
  const metaSecondaryValue = isGroup
    ? `${conversation?.admins.length ?? 0} quản trị`
    : formatMetaDate(directUser?.createdAt);

  return (
    <>
      <AppBottomSheet
        visible={visible}
        onClose={onClose}
        title="Thông tin cuộc trò chuyện"
        description="Chi tiết cuộc trò chuyện và các thao tác nhanh."
        bodyClassName="mt-4"
        titleClassName="text-center"
        descriptionClassName="text-center"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 24, paddingBottom: 8 }}
          style={{ maxHeight: Math.max(420, height * 0.72) }}
        >
          <ConversationHero
            isGroup={isGroup}
            conversationName={conversationName}
            subtitle={subtitle}
            directAvatarUrl={directAvatarUrl}
            online={presence?.status === 'online'}
            groupConversation={conversation}
            groupPreviewUri={selectedImage?.previewUri}
            tertiaryText={!isGroup ? directUser?.email : undefined}
          />

          <View className="flex-row gap-3">
            <HeroMetric
              icon={isGroup ? 'people-outline' : 'time-outline'}
              value={metaPrimaryValue}
              label={isGroup ? 'Thành viên' : 'Trạng thái'}
            />
            <HeroMetric
              icon={isGroup ? 'shield-checkmark-outline' : 'calendar-outline'}
              value={metaSecondaryValue}
              label={isGroup ? 'Quản trị' : 'Tham gia'}
            />
          </View>

          {isGroup && isAdmin ? (
            <SheetSection title="Chỉnh sửa nhóm">
              <View className="gap-3 rounded-[24px] border border-app-border bg-app-surface-elevated p-4 dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
                <Input
                  variant="secondary"
                  className="min-h-13 rounded-[22px] px-4"
                  placeholder="Tên nhóm"
                  value={draftGroupName}
                  onChangeText={setDraftGroupName}
                />
                <ImageSourceActions
                  visible={isAvatarSheetOpen}
                  onClose={() => setIsAvatarSheetOpen(false)}
                  onPick={(source) => {
                    void pickImage(source);
                  }}
                />
                <View className="mt-2 items-center gap-2">
                  <Button
                    variant="secondary"
                    className="rounded-full shadow-none"
                    onPress={() => setIsAvatarSheetOpen(true)}
                  >
                    Đổi ảnh nhóm
                  </Button>
                  {selectedImage ? (
                    <Button
                      variant="ghost"
                      className="rounded-full shadow-none"
                      onPress={clearImage}
                    >
                      Bỏ ảnh
                    </Button>
                  ) : null}
                </View>
                <View className="flex-row gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1 rounded-full shadow-none"
                    isDisabled={isUpdating}
                    onPress={() => {
                      setDraftGroupName(conversation?.groupName?.trim() || '');
                      clearImage();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 rounded-full shadow-none"
                    isDisabled={isUpdating}
                    onPress={() => {
                      void handleSaveGroup();
                    }}
                  >
                    {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                  </Button>
                </View>
              </View>
            </SheetSection>
          ) : null}

          <SheetSection title="Thông tin nhanh">
            <View className="gap-3">
              <InfoRow
                icon="calendar-outline"
                label={isGroup ? 'Ngày tạo nhóm' : 'Bắt đầu trò chuyện'}
                value={formatMetaDate(conversation?.createdAt)}
              />
              <InfoRow
                icon={isGroup ? 'people-outline' : 'person-outline'}
                label={isGroup ? 'Quy mô' : 'Người dùng tham gia'}
                value={
                  isGroup
                    ? `${conversation?.participants.length ?? 0} người`
                    : formatMetaDate(directUser?.createdAt)
                }
              />
              {isGroup ? (
                <InfoRow
                  icon="person-circle-outline"
                  label="Vai trò của bạn"
                  value={isAdmin ? 'Bạn là quản trị viên' : 'Bạn là thành viên'}
                />
              ) : null}
            </View>
          </SheetSection>

          {isGroup ? (
            <SheetSection
              title="Thành viên"
              caption={`${members.length} người`}
            >
              <View className="gap-2.5">
                {members.map((member) => (
                  <MemberListRow
                    key={member.id}
                    member={member}
                    isAdmin={Boolean(conversation?.admins.includes(member.id))}
                    isCurrentUser={member.id === currentUserId}
                  />
                ))}
              </View>
            </SheetSection>
          ) : null}

          <SheetSection title="Thao tác">
            <View className="gap-2.5">
              {!isGroup ? (
                <ActionRow
                  icon={isHidden ? 'eye-outline' : 'eye-off-outline'}
                  label={
                    isHidden ? 'Hiện cuộc trò chuyện' : 'Ẩn cuộc trò chuyện'
                  }
                  disabled={actionPending}
                  onPress={() => {
                    void handleToggleHide();
                  }}
                />
              ) : (
                <>
                  <ActionRow
                    icon="exit-outline"
                    label="Rời nhóm"
                    disabled={actionPending}
                    onPress={() => setPendingAction('leave')}
                  />
                  {isAdmin ? (
                    <ActionRow
                      icon="trash-outline"
                      label="Xóa nhóm"
                      destructive
                      disabled={actionPending}
                      onPress={() => setPendingAction('delete')}
                    />
                  ) : null}
                </>
              )}
            </View>
          </SheetSection>
        </ScrollView>
      </AppBottomSheet>

      <AppModal
        visible={pendingAction !== null}
        onClose={() => {
          if (!confirmPending) {
            setPendingAction(null);
          }
        }}
        variant={pendingAction === 'delete' ? 'danger' : 'warning'}
        title={pendingAction === 'delete' ? 'Xác nhận xóa nhóm' : 'Rời nhóm?'}
        description={
          pendingAction === 'delete'
            ? 'Hành động này sẽ xóa toàn bộ cuộc trò chuyện nhóm và không thể hoàn tác.'
            : 'Bạn sẽ không còn nhận tin nhắn từ nhóm này nữa.'
        }
        dismissible={!confirmPending}
        footer={
          <>
            <PrimaryButton
              label={pendingAction === 'delete' ? 'Xóa nhóm' : 'Rời nhóm'}
              onPress={() => {
                void handleConfirmAction();
              }}
              loading={confirmPending}
              disabled={confirmPending}
              className={pendingAction === 'delete' ? 'bg-rose-600' : undefined}
            />
            <SecondaryButton
              label="Hủy"
              onPress={() => setPendingAction(null)}
              disabled={confirmPending}
            />
          </>
        }
      />
    </>
  );
}
