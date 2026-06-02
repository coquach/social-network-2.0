import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useToast } from 'heroui-native/toast';
import { 
  useSendFriendRequest, 
  useRemoveFriend,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  RelationStatus,
  MessagePrivacy,
  type UserProfile
} from '@repo/shared';
import { AppToast } from '~/components/ui/app-toast';


interface ProfileActionButtonsProps {
  user: UserProfile;
}

export function ProfileActionButtons({ user }: ProfileActionButtonsProps) {
  const router = useRouter();
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

  const relationStatus = user.relation?.status || RelationStatus.NONE;
  const privacySettings = user.privacySettings || { messagePrivacy: MessagePrivacy.EVERYONE };

  const handleMessage = () => {
    // Navigate to chat screen with this user
    router.push(`/(stack)/chat/${user.id}`);
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

  return (
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

      {(relationStatus === RelationStatus.PENDING || relationStatus === 'REQUESTED_OUT') && (
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
          onPress={handleRemoveFriend}
          disabled={removeFriend.isPending}
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
        disabled={!canMessage}
        className={`h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl ${
          canMessage 
            ? 'bg-app-surface-elevated active:opacity-85 dark:bg-app-surface-elevated-dark'
            : 'bg-app-border dark:bg-app-border-dark opacity-50'
        }`}
      >
        <Ionicons name="chatbubble-outline" size={18} color={canMessage ? "#334155" : "#94a3b8"} />
        <Text className={`text-[15px] font-semibold ${canMessage ? 'text-app-fg dark:text-app-fg-dark' : 'text-app-muted-fg'}`}>
          Nhắn tin
        </Text>
      </Pressable>
    </View>
  );
}
