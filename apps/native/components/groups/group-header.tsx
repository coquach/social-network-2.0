import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGroupPermission } from '@repo/shared';
import {
  useAcceptGroupInvite,
  useDeclineGroupInvite,
  useLeaveGroup,
  useRequestToJoinGroup,
} from '@repo/shared/hooks';
import { GroupDTO, GroupPermission, MembershipStatus } from '@repo/shared/types';
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

interface GroupHeaderProps {
  group: GroupDTO;
}

export const GroupHeader = ({ group }: GroupHeaderProps) => {
  const router = useRouter();
  const { can } = useGroupPermission(group);

  const { mutate: joinGroup } = useRequestToJoinGroup();
  const { mutate: leaveGroup } = useLeaveGroup();
  const { mutate: acceptInvite } = useAcceptGroupInvite();
  const { mutate: declineInvite } = useDeclineGroupInvite();

  const handleLeaveGroup = () => {
    Alert.alert('Rời nhóm', 'Bạn có chắc chắn muốn rời khỏi nhóm này không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Rời nhóm', style: 'destructive', onPress: () => leaveGroup(group.id) },
    ]);
  };

  const handleCancelPending = () => {
    Alert.alert(
      'Chưa hỗ trợ',
      'Hiện tại chưa có requestId từ API detail để hủy yêu cầu tham gia. Mình sẽ nối ngay khi backend trả field này.',
      [{ text: 'Đã hiểu' }],
    );
  };

  return (
    <View className="rounded-b-[40px] bg-white pb-4 dark:bg-slate-900">
      <View className="h-40 w-full bg-slate-200 dark:bg-slate-800">
        {group.coverImageUrl ? (
          <Image source={{ uri: group.coverImageUrl }} className="h-full w-full" resizeMode="cover" />
        ) : null}
      </View>

      <View className="px-4">
        <View className="-mt-12 h-24 w-24 overflow-hidden rounded-3xl border-4 border-white bg-slate-100 shadow-sm dark:border-slate-900">
          <Image source={{ uri: group.avatarUrl }} className="h-full w-full" />
        </View>

        <View className="mt-3">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">{group.name}</Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name={group.privacy === 'PUBLIC' ? 'earth' : 'lock-closed'} size={14} color="#64748b" />
            <Text className="text-sm text-slate-500">
              {group.privacy === 'PUBLIC' ? 'Nhóm công khai' : 'Nhóm riêng tư'} • {group.members} thành viên
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row flex-wrap gap-2">
          {group.membershipStatus === MembershipStatus.NONE ? (
            <TouchableOpacity
              onPress={() => joinGroup(group.id)}
              className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-blue-600"
            >
              <Ionicons name="person-add" size={18} color="white" />
              <Text className="font-bold text-white">Tham gia nhóm</Text>
            </TouchableOpacity>
          ) : null}

          {group.membershipStatus === MembershipStatus.PENDING_APPROVAL ? (
            <TouchableOpacity
              onPress={handleCancelPending}
              className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-amber-100 dark:bg-amber-900/30"
            >
              <Ionicons name="time" size={18} color="#d97706" />
              <Text className="font-bold text-amber-600">Đang chờ duyệt</Text>
            </TouchableOpacity>
          ) : null}

          {group.membershipStatus === MembershipStatus.INVITED ? (
            <View className="flex-1 flex-row gap-2">
              <TouchableOpacity
                onPress={() => acceptInvite(group.id)}
                className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-blue-600"
              >
                <Text className="font-bold text-white">Chấp nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => declineInvite(group.id)}
                className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800"
              >
                <Text className="font-bold text-slate-700 dark:text-slate-300">Từ chối</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {group.membershipStatus === MembershipStatus.MEMBER ? (
            <>
              {can(GroupPermission.INVITE_MEMBERS) ? (
                <TouchableOpacity className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-blue-600">
                  <Ionicons name="share-social" size={18} color="white" />
                  <Text className="font-bold text-white">Mời</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={() => router.push(`/(main)/groups/${group.id}/members`)}
                className="h-11 rounded-xl bg-slate-100 px-4 dark:bg-slate-800"
              >
                <View className="h-full flex-row items-center gap-2">
                  <Ionicons name="people-outline" size={18} color="#64748b" />
                  <Text className="font-bold text-slate-600 dark:text-slate-300">Thành viên</Text>
                </View>
              </TouchableOpacity>

              {can(GroupPermission.MANAGE_JOIN_REQUESTS) ? (
                <TouchableOpacity
                  onPress={() => router.push(`/(main)/groups/${group.id}/requests`)}
                  className="h-11 rounded-xl bg-slate-100 px-4 dark:bg-slate-800"
                >
                  <View className="h-full flex-row items-center gap-2">
                    <Ionicons name="checkmark-done-outline" size={18} color="#64748b" />
                    <Text className="font-bold text-slate-600 dark:text-slate-300">Duyệt</Text>
                  </View>
                </TouchableOpacity>
              ) : null}

              {can(GroupPermission.UPDATE_GROUP) ? (
                <TouchableOpacity
                  onPress={() => router.push(`/(main)/groups/${group.id}/settings`)}
                  className="h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  <Ionicons name="settings-outline" size={20} color="#64748b" />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={handleLeaveGroup}
                className="h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                <Ionicons name="log-out-outline" size={20} color="#64748b" />
              </TouchableOpacity>
            </>
          ) : null}

          {group.membershipStatus === MembershipStatus.BANNED ? (
            <View className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-red-100">
              <Text className="font-bold text-red-600">Bạn đã bị chặn khỏi nhóm</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};
