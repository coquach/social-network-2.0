import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useToast } from 'heroui-native/toast';
import { 
  useSendFriendRequest, 
  useRemoveFriend,
  useAcceptFriendRequest,
  RelationStatus,
  MessagePrivacy,
  type UserProfile
} from '@repo/shared';

interface ProfileActionButtonsProps {
  user: UserProfile;
}

export function ProfileActionButtons({ user }: ProfileActionButtonsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  
  const sendFriendRequest = useSendFriendRequest();
  const removeFriend = useRemoveFriend();
  const acceptFriendRequest = useAcceptFriendRequest();

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

      {relationStatus === RelationStatus.PENDING && (
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
