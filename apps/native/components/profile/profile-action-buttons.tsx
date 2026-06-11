import { Ionicons } from '@expo/vector-icons';
import {
  MessagePrivacy,
  RelationStatus,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
  type UserProfile,
} from '@repo/shared';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { AppToast } from '~/components/ui/app-toast';
import { AppBottomSheet } from '~/components/ui/app-bottom-sheet';
import { useStartConversation } from '~/hooks/use-start-conversation';

interface ProfileActionButtonsProps {
  user: UserProfile;
}

export function ProfileActionButtons({ user }: ProfileActionButtonsProps) {
  const { toast } = useToast();

  const showToast = React.useCallback(
    (title: string, message: string, variant: 'success' | 'error') => {
      toast.show({
        duration: 2200,
        component: (toastProps) => (
          <AppToast
            toast={{ title, message, variant }}
            toastProps={toastProps}
          />
        ),
      });
    },
    [toast],
  );

  const sendFriendRequest = useSendFriendRequest();
  const removeFriend = useRemoveFriend();
  const acceptFriendRequest = useAcceptFriendRequest();
  const rejectFriendRequest = useRejectFriendRequest();
  const { startConversation, isPending: isStartingChat } =
    useStartConversation();

  const relationStatus = user.relation?.status || RelationStatus.NONE;
  const privacySettings = user.privacySettings || {
    messagePrivacy: MessagePrivacy.EVERYONE,
  };

  const handleMessage = async () => {
    // 1. Proactive Privacy Check
    if (
      privacySettings.messagePrivacy === MessagePrivacy.FRIENDS &&
      relationStatus !== RelationStatus.FRIEND
    ) {
      showToast(
        'Không thể nhắn tin',
        'Người dùng này chỉ nhận tin nhắn từ bạn bè',
        'error',
      );
      return;
    }

    // 2. Start Conversation
    try {
      await startConversation(user.id);
    } catch (e) {
      showToast('Lỗi', 'Không thể bắt đầu cuộc trò chuyện', 'error');
    }
  };

  const handleAddFriend = async () => {
    try {
      await sendFriendRequest.mutateAsync(user.id);
      showToast('Thành công', 'Đã gửi lời mời kết bạn', 'success');
    } catch (e) {
      showToast('Lỗi', 'Không thể gửi lời mời kết bạn', 'error');
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await removeFriend.mutateAsync(user.id);
      showToast('Thành công', 'Đã huỷ kết bạn', 'success');
    } catch (e) {
      showToast('Lỗi', 'Không thể huỷ kết bạn', 'error');
    }
  };

  const handleAcceptFriend = async () => {
    try {
      await acceptFriendRequest.mutateAsync(user.id);
      showToast('Thành công', 'Đã chấp nhận kết bạn', 'success');
    } catch (e) {
      showToast('Lỗi', 'Không thể chấp nhận kết bạn', 'error');
    }
  };

  const handleRejectFriend = async () => {
    try {
      await rejectFriendRequest.mutateAsync(user.id);
      showToast('Thành công', 'Đã từ chối kết bạn', 'success');
    } catch (e) {
      showToast('Lỗi', 'Không thể từ chối kết bạn', 'error');
    }
  };

  // Determine if messaging is allowed
  const canMessage =
    privacySettings.messagePrivacy === MessagePrivacy.EVERYONE ||
    relationStatus === RelationStatus.FRIEND;

  const [isOptionsVisible, setIsOptionsVisible] = React.useState(false);

  return (
    <>
      <View className="mt-4 flex-row gap-2 w-full">
        {/* Dynamic Relation Button */}
        {relationStatus === RelationStatus.NONE && (
          <Pressable
            onPress={handleAddFriend}
            disabled={sendFriendRequest.isPending}
            className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-app-primary active:opacity-85 dark:bg-app-primary-dark"
          >
            <Ionicons name="person-add-outline" size={18} color="#ffffff" />
            <Text className="text-[15px] font-semibold text-white">
              {sendFriendRequest.isPending ? 'Đang gửi...' : 'Thêm bạn bè'}
            </Text>
          </Pressable>
        )}

        {(relationStatus === RelationStatus.PENDING ||
          relationStatus === 'REQUESTED_OUT') && (
          <Pressable
            onPress={handleRemoveFriend}
            disabled={removeFriend.isPending}
            className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-rose-500 active:opacity-85"
          >
            <Ionicons name="close-circle-outline" size={18} color="#ffffff" />
            <Text className="text-[15px] font-semibold text-white">
              Huỷ lời mời
            </Text>
          </Pressable>
        )}

        {relationStatus === 'REQUESTED_IN' && (
          <>
            <Pressable
              onPress={handleAcceptFriend}
              disabled={acceptFriendRequest.isPending}
              className="h-11 flex-1 flex-row items-center justify-center gap-1 rounded-xl bg-app-primary active:opacity-85 dark:bg-app-primary-dark"
            >
              <Text className="text-[15px] font-semibold text-white">
                Chấp nhận
              </Text>
            </Pressable>
            <Pressable
              onPress={handleRejectFriend}
              disabled={rejectFriendRequest.isPending}
              className="h-11 flex-1 flex-row items-center justify-center gap-1 rounded-xl bg-rose-500 active:opacity-85"
            >
              <Text className="text-[15px] font-semibold text-white">
                Từ chối
              </Text>
            </Pressable>
          </>
        )}

        {relationStatus === RelationStatus.FRIEND && (
          <Pressable
            onPress={() => setIsOptionsVisible(true)}
            className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-app-surface-elevated active:opacity-85 dark:bg-app-surface-elevated-dark"
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#10b981" />
            <Text className="text-[15px] font-semibold text-emerald-500">
              Bạn bè
            </Text>
          </Pressable>
        )}

        {/* Message Button */}
        <Pressable
          onPress={handleMessage}
          disabled={!canMessage || isStartingChat}
          className={`h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl ${
            canMessage
              ? 'bg-app-surface-elevated active:opacity-85 dark:bg-app-surface-elevated-dark'
              : 'bg-app-border dark:bg-app-border-dark opacity-50'
          }`}
        >
          {isStartingChat ? (
            <ActivityIndicator size="small" color="#334155" />
          ) : (
            <>
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={canMessage ? '#334155' : '#94a3b8'}
              />
              <Text
                className={`text-[15px] font-semibold ${canMessage ? 'text-app-fg dark:text-app-fg-dark' : 'text-app-muted-fg'}`}
              >
                Nhắn tin
              </Text>
            </>
          )}
        </Pressable>
      </View>

      <AppBottomSheet
        visible={isOptionsVisible}
        onClose={() => setIsOptionsVisible(false)}
        title="Quản lý tình bạn"
        dismissible
      >
        <View className="gap-2 pb-6">
          <Pressable
            onPress={() => {
              setIsOptionsVisible(false);
              void handleRemoveFriend();
            }}
            className="flex-row items-center gap-4 rounded-2xl bg-app-surface p-4 active:bg-app-bg dark:bg-app-surface-dark dark:active:bg-app-bg-dark"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Ionicons name="person-remove-outline" size={20} color="#ef4444" />
            </View>
            <Text className="text-base font-semibold text-red-500">
              Hủy kết bạn
            </Text>
          </Pressable>
        </View>
      </AppBottomSheet>
    </>
  );
}
