import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useGroupPermission } from '@repo/shared';
import {
  useAcceptGroupInvite,
  useDeclineGroupInvite,
  useFriends,
  useInviteUserToGroup,
  useLeaveGroup,
  useRequestToJoinGroup,
} from '@repo/shared/hooks';
import { GroupDTO, GroupPermission, MembershipStatus } from '@repo/shared/types';

import { AppModal } from '~/components/ui/app-modal';
import { AppLoadingBlock } from '~/components/ui/app-loading';

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
  const { mutate: inviteUser, isPending: isInviting } = useInviteUserToGroup();
  const { data: friendsData, isLoading: isLoadingFriends, refetch: refetchFriends } = useFriends(undefined, {
    limit: 30,
  });

  const [isLeaveModalOpen, setIsLeaveModalOpen] = React.useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [inviteeId, setInviteeId] = React.useState('');
  const [selectedFriendId, setSelectedFriendId] = React.useState<string | null>(null);

  const friendIds = React.useMemo(() => {
    const rawIds = (friendsData?.pages ?? []).flatMap((page) => page.data ?? []);
    return [...new Set(rawIds)].filter(Boolean);
  }, [friendsData?.pages]);

  return (
    <View className="rounded-3xl bg-app-surface pb-4 dark:bg-app-surface-dark">
      <View className="h-44 w-full overflow-hidden rounded-t-3xl bg-slate-200 dark:bg-slate-800">
        {group.coverImageUrl ? (
          <Image source={{ uri: group.coverImageUrl }} className="h-full w-full" resizeMode="cover" />
        ) : null}
      </View>

      <View className="px-4">
        <View className="-mt-12 h-24 w-24 overflow-hidden rounded-3xl border-4 border-app-surface bg-slate-100 shadow-sm dark:border-app-surface-dark">
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

        <View className="mt-5 gap-2">
          {group.membershipStatus === MembershipStatus.NONE ? (
            <TouchableOpacity
              onPress={() => joinGroup(group.id)}
              className="h-11 flex-row items-center justify-center gap-2 rounded-xl bg-blue-600"
            >
              <Ionicons name="person-add" size={18} color="white" />
              <Text className="font-bold text-white">Tham gia nhóm</Text>
            </TouchableOpacity>
          ) : null}

          {group.membershipStatus === MembershipStatus.PENDING_APPROVAL ? (
            <View className="h-11 flex-row items-center justify-center gap-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Ionicons name="time" size={18} color="#d97706" />
              <Text className="font-bold text-amber-600">Yêu cầu tham gia đang chờ duyệt</Text>
            </View>
          ) : null}

          {group.membershipStatus === MembershipStatus.INVITED ? (
            <View className="flex-row gap-2">
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
              <View className="flex-row gap-2">
                {can(GroupPermission.INVITE_MEMBERS) ? (
                  <TouchableOpacity
                    onPress={() => {
                      setIsInviteModalOpen(true);
                      void refetchFriends();
                    }}
                    className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-blue-600"
                  >
                    <Ionicons name="share-social" size={18} color="white" />
                    <Text className="font-bold text-white">Mời thành viên</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  onPress={() => setIsLeaveModalOpen(true)}
                  className="h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  <Ionicons name="log-out-outline" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-2">
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
                      <Text className="font-bold text-slate-600 dark:text-slate-300">Yêu cầu</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}

                {can(GroupPermission.MANAGE_GROUP) ? (
                  <TouchableOpacity
                    onPress={() => router.push(`/(main)/groups/${group.id}/logs`)}
                    className="h-11 rounded-xl bg-slate-100 px-4 dark:bg-slate-800"
                  >
                    <View className="h-full flex-row items-center gap-2">
                      <Ionicons name="time-outline" size={18} color="#64748b" />
                      <Text className="font-bold text-slate-600 dark:text-slate-300">Nhật ký</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}

                {can(GroupPermission.UPDATE_GROUP_SETTINGS) ? (
                  <TouchableOpacity
                    onPress={() => router.push(`/(main)/groups/${group.id}/settings`)}
                    className="h-11 rounded-xl bg-slate-100 px-4 dark:bg-slate-800"
                  >
                    <View className="h-full flex-row items-center gap-2">
                      <Ionicons name="settings-outline" size={18} color="#64748b" />
                      <Text className="font-bold text-slate-600 dark:text-slate-300">Cài đặt</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}
              </View>
            </>
          ) : null}

          {group.membershipStatus === MembershipStatus.BANNED ? (
            <View className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-red-100">
              <Text className="font-bold text-red-600">Bạn đã bị chặn khỏi nhóm</Text>
            </View>
          ) : null}
        </View>
      </View>

      <AppModal
        visible={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        variant="warning"
        title="Rời nhóm"
        description="Bạn có chắc chắn muốn rời khỏi nhóm này không?"
        footer={
          <>
            <TouchableOpacity
              onPress={() => setIsLeaveModalOpen(false)}
              className="h-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              <Text className="font-semibold text-slate-700 dark:text-slate-300">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsLeaveModalOpen(false);
                leaveGroup(group.id);
              }}
              className="h-11 items-center justify-center rounded-xl bg-rose-500"
            >
              <Text className="font-semibold text-white">Rời nhóm</Text>
            </TouchableOpacity>
          </>
        }
      />

      <AppModal
        visible={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Mời thành viên"
        description="Chọn nhanh từ danh sách bạn bè hoặc nhập user id để gửi lời mời."
        footer={
          <>
            <TouchableOpacity
              onPress={() => setIsInviteModalOpen(false)}
              className="h-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              <Text className="font-semibold text-slate-700 dark:text-slate-300">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={(!inviteeId.trim() && !selectedFriendId) || isInviting}
              onPress={() => {
                const targetUserId = inviteeId.trim() || selectedFriendId;
                if (!targetUserId) return;
                inviteUser({ groupId: group.id, userId: targetUserId });
                setInviteeId('');
                setSelectedFriendId(null);
                setIsInviteModalOpen(false);
              }}
              className="h-11 items-center justify-center rounded-xl bg-sky-500 disabled:opacity-60"
            >
              <Text className="font-semibold text-white">{isInviting ? 'Đang gửi...' : 'Gửi lời mời'}</Text>
            </TouchableOpacity>
          </>
        }
      >
        <View className="mb-3">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-app-muted-fg dark:text-app-muted-fg-dark">
            Chọn từ bạn bè
          </Text>
          <View className="h-44 rounded-xl border border-app-border bg-app-bg p-2 dark:border-app-border-dark dark:bg-app-bg-dark">
            {isLoadingFriends ? (
              <View className="flex-1 items-center justify-center">
                <AppLoadingBlock label="Đang tải bạn bè" size="sm" variant="muted" />
              </View>
            ) : friendIds.length > 0 ? (
              <FlashList
                data={friendIds}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = selectedFriendId === item;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedFriendId(item);
                        setInviteeId(item);
                      }}
                      className={`mb-2 rounded-lg border px-3 py-2 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10'
                          : 'border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark'
                      }`}
                    >
                      <Text
                        numberOfLines={1}
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-app-fg dark:text-app-fg-dark'
                        }`}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-center text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
                  Chưa có dữ liệu bạn bè để chọn nhanh.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="mb-3">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-app-muted-fg dark:text-app-muted-fg-dark">
            Hoặc nhập User ID
          </Text>
          <TextInput
            value={inviteeId}
            onChangeText={(value) => {
              setInviteeId(value);
              if (value !== selectedFriendId) {
                setSelectedFriendId(null);
              }
            }}
            placeholder="Nhập user id"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            className="rounded-xl border border-app-border bg-app-bg px-3 py-2.5 text-sm text-app-fg dark:border-app-border-dark dark:bg-app-bg-dark dark:text-app-fg-dark"
          />
        </View>
      </AppModal>
    </View>
  );
};


