import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useGroupPermission } from '@repo/shared';
import {
  useAcceptGroupInvite,
  useCurrentUser,
  useDeclineGroupInvite,
  useGroupJoinRequests,
  useGroupMembers,
  useInviteUserToGroup,
  useLeaveGroup,
  useRequestToJoinGroup,
  useUserFriends,
} from '@repo/shared/hooks';
import {
  GroupDTO,
  GroupMemberStatus,
  GroupPermission,
  JoinRequestStatus,
  MembershipStatus,
  UserDTO,
} from '@repo/shared/types';

import { AppLoadingBlock } from '~/components/ui/app-loading';
import { AppModal } from '~/components/ui/app-modal';
import { AppToast } from '~/components/ui/app-toast';

interface GroupHeaderProps {
  group: GroupDTO;
}

export const GroupHeader = ({ group }: GroupHeaderProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { can } = useGroupPermission(group);

  const { data: currentUser } = useCurrentUser();
  const {
    data: friendsData,
    isLoading: isLoadingFriends,
    isRefetching: isRefetchingFriends,
    refetch: refetchFriends,
  } = useUserFriends(currentUser?.id ?? '', { limit: 30 });

  const { data: memberData } = useGroupMembers(group.id, {
    status: GroupMemberStatus.ACTIVE,
    limit: 100,
  });

  const { data: requestData } = useGroupJoinRequests(group.id, {
    status: JoinRequestStatus.PENDING,
    limit: 100,
  });

  const { mutate: joinGroup, isPending: isJoining } = useRequestToJoinGroup();
  const { mutate: leaveGroup, isPending: isLeaving } = useLeaveGroup();
  const { mutate: acceptInvite, isPending: isAcceptingInvite } =
    useAcceptGroupInvite();
  const { mutate: declineInvite, isPending: isDecliningInvite } =
    useDeclineGroupInvite();
  const { mutate: inviteUser, isPending: isInviting } = useInviteUserToGroup();

  const [isLeaveModalOpen, setIsLeaveModalOpen] = React.useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [selectedFriend, setSelectedFriend] = React.useState<UserDTO | null>(
    null,
  );

  const showToast = React.useCallback(
    (
      title: string,
      message: string,
      variant: 'success' | 'error' | 'warning' | 'info',
    ) => {
      toast.show({
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

  const friends = React.useMemo(() => {
    const merged = (friendsData?.pages ?? []).flatMap(
      (page) => page.data ?? [],
    );
    const dedup = new Map<string, UserDTO>();
    merged.forEach((user) => dedup.set(user.id, user));
    return Array.from(dedup.values());
  }, [friendsData?.pages]);

  const filteredFriends = React.useMemo(() => {
    const term = searchKeyword.trim().toLowerCase();
    if (!term) return friends;
    return friends.filter((friend) => {
      const fullName = `${friend.firstName} ${friend.lastName}`.toLowerCase();
      return fullName.includes(term) || friend.id.toLowerCase().includes(term);
    });
  }, [friends, searchKeyword]);

  const activeMemberIds = React.useMemo(() => {
    const ids = (memberData?.pages ?? [])
      .flatMap((p) => p.data ?? [])
      .map((member) => member.userId);
    return new Set(ids);
  }, [memberData?.pages]);

  const pendingInviteIds = React.useMemo(() => {
    const ids = (requestData?.pages ?? [])
      .flatMap((p) => p.data ?? [])
      .filter((request) => request.status === 'PENDING')
      .map((request) => request.inviteeId);
    return new Set(ids);
  }, [requestData?.pages]);

  const renderQuickAction = (
    icon: React.ComponentProps<typeof Ionicons>['name'],
    label: string,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      onPress={onPress}
      className="h-11 rounded-xl bg-slate-100 px-4 dark:bg-slate-800"
    >
      <View className="h-full flex-row items-center gap-2">
        <Ionicons name={icon} size={18} color="#64748b" />
        <Text className="font-bold text-slate-600 dark:text-slate-300">
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="rounded-3xl bg-app-surface pb-4 dark:bg-app-surface-dark">
      <View className="h-44 w-full overflow-hidden rounded-t-3xl bg-slate-200 dark:bg-slate-800">
        {group.coverImageUrl ? (
          <Image
            source={{ uri: group.coverImageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : null}
      </View>

      <View className="px-4">
        <View className="-mt-12 h-24 w-24 overflow-hidden rounded-3xl border-4 border-app-surface bg-slate-100 shadow-sm dark:border-app-surface-dark">
          <Image source={{ uri: group.avatarUrl }} className="h-full w-full" />
        </View>

        <View className="mt-3">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            {group.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons
              name={group.privacy === 'PUBLIC' ? 'earth' : 'lock-closed'}
              size={14}
              color="#64748b"
            />
            <Text className="text-sm text-slate-500">
              {group.privacy === 'PUBLIC' ? 'Nhóm công khai' : 'Nhóm riêng tư'}{' '}
              • {group.members} thành viên
            </Text>
          </View>
        </View>

        <View className="mt-5 gap-2">
          {group.membershipStatus === MembershipStatus.NONE ? (
            <TouchableOpacity
              disabled={isJoining}
              onPress={() =>
                joinGroup(group.id, {
                  onSuccess: () =>
                    showToast(
                      'Đã gửi yêu cầu',
                      'Thao tác tham gia nhóm thành công.',
                      'success',
                    ),
                  onError: (error) =>
                    showToast('Tham gia thất bại', error.message, 'error'),
                })
              }
              className="h-11 flex-row items-center justify-center gap-2 rounded-xl bg-blue-600 disabled:opacity-70"
            >
              {isJoining ? null : (
                <Ionicons name="person-add" size={18} color="white" />
              )}
              <Text className="font-bold text-white">
                {isJoining ? 'Đang xử lý...' : 'Tham gia nhóm'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {group.membershipStatus === MembershipStatus.PENDING_APPROVAL ? (
            <View className="h-11 flex-row items-center justify-center gap-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Ionicons name="time" size={18} color="#d97706" />
              <Text className="font-bold text-amber-600">
                Yêu cầu tham gia đang chờ duyệt
              </Text>
            </View>
          ) : null}

          {group.membershipStatus === MembershipStatus.INVITED ? (
            <View className="flex-row gap-2">
              <TouchableOpacity
                disabled={isAcceptingInvite || isDecliningInvite}
                onPress={() =>
                  acceptInvite(group.id, {
                    onSuccess: () =>
                      showToast(
                        'Đã tham gia nhóm',
                        'Bạn đã chấp nhận lời mời.',
                        'success',
                      ),
                    onError: (error) =>
                      showToast('Không thể chấp nhận', error.message, 'error'),
                  })
                }
                className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-blue-600 disabled:opacity-70"
              >
                <Text className="font-bold text-white">Chấp nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isAcceptingInvite || isDecliningInvite}
                onPress={() =>
                  declineInvite(group.id, {
                    onSuccess: () =>
                      showToast(
                        'Đã từ chối',
                        'Bạn đã từ chối lời mời vào nhóm.',
                        'info',
                      ),
                    onError: (error) =>
                      showToast('Không thể từ chối', error.message, 'error'),
                  })
                }
                className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 disabled:opacity-70"
              >
                <Text className="font-bold text-slate-700 dark:text-slate-300">
                  Từ chối
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {group.membershipStatus === MembershipStatus.MEMBER ? (
            <>
              <View className="flex-row gap-2">
                {can(GroupPermission.INVITE_MEMBERS) ? (
                  <TouchableOpacity
                    disabled={isInviting}
                    onPress={() => {
                      setIsInviteModalOpen(true);
                      void refetchFriends();
                    }}
                    className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-blue-600 disabled:opacity-70"
                  >
                    <Ionicons name="share-social" size={18} color="white" />
                    <Text className="font-bold text-white">Mời thành viên</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  disabled={isLeaving}
                  onPress={() => setIsLeaveModalOpen(true)}
                  className="h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-70"
                >
                  <Ionicons name="log-out-outline" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {renderQuickAction('people-outline', 'Thành viên', () =>
                  router.push(`/(main)/groups/${group.id}/members`),
                )}
                {can(GroupPermission.MANAGE_JOIN_REQUESTS)
                  ? renderQuickAction('checkmark-done-outline', 'Yêu cầu', () =>
                      router.push(`/(main)/groups/${group.id}/requests`),
                    )
                  : null}
                {can(GroupPermission.MANAGE_GROUP)
                  ? renderQuickAction('time-outline', 'Nhật ký', () =>
                      router.push(`/(main)/groups/${group.id}/logs`),
                    )
                  : null}
                {can(GroupPermission.UPDATE_GROUP_SETTINGS)
                  ? renderQuickAction('settings-outline', 'Cài đặt', () =>
                      router.push(`/(main)/groups/${group.id}/settings`),
                    )
                  : null}
              </View>
            </>
          ) : null}

          {group.membershipStatus === MembershipStatus.BANNED ? (
            <View className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-red-100">
              <Text className="font-bold text-red-600">
                Bạn đã bị chặn khỏi nhóm
              </Text>
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
              <Text className="font-semibold text-slate-700 dark:text-slate-300">
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={isLeaving}
              onPress={() => {
                leaveGroup(group.id, {
                  onSuccess: () =>
                    showToast(
                      'Đã rời nhóm',
                      'Bạn đã rời nhóm thành công.',
                      'success',
                    ),
                  onError: (error) =>
                    showToast('Không thể rời nhóm', error.message, 'error'),
                });
                setIsLeaveModalOpen(false);
              }}
              className="h-11 items-center justify-center rounded-xl bg-rose-500 disabled:opacity-70"
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
        description="Chọn bạn bè để mời nhanh hoặc nhập user id thủ công."
        footer={
          <>
            <TouchableOpacity
              onPress={() => setIsInviteModalOpen(false)}
              className="h-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              <Text className="font-semibold text-slate-700 dark:text-slate-300">
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!selectedFriend || isInviting}
              onPress={() => {
                const targetUserId = selectedFriend?.id;
                if (!targetUserId) return;
                inviteUser(
                  { groupId: group.id, userId: targetUserId },
                  {
                    onSuccess: () =>
                      showToast(
                        'Đã gửi lời mời',
                        'Lời mời tham gia nhóm đã được gửi.',
                        'success',
                      ),
                    onError: (error) =>
                      showToast(
                        'Không thể mời thành viên',
                        error.message,
                        'error',
                      ),
                  },
                );
                setSearchKeyword('');
                setSelectedFriend(null);
                setIsInviteModalOpen(false);
              }}
              className="h-11 items-center justify-center rounded-xl bg-sky-500 disabled:opacity-60"
            >
              <Text className="font-semibold text-white">
                {isInviting ? 'Đang gửi...' : 'Gửi lời mời'}
              </Text>
            </TouchableOpacity>
          </>
        }
      >
        <View className="mb-3">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-app-muted-fg dark:text-app-muted-fg-dark">
            Tìm bạn bè
          </Text>
          <TextInput
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            placeholder="Nhập tên người dùng"
            placeholderTextColor="#94a3b8"
            className="rounded-xl border border-app-border bg-app-bg px-3 py-2.5 text-sm text-app-fg dark:border-app-border-dark dark:bg-app-bg-dark dark:text-app-fg-dark"
          />
        </View>

        <View className="mb-3">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-app-muted-fg dark:text-app-muted-fg-dark">
            Chọn từ bạn bè
          </Text>
          <View className="h-48 rounded-xl border border-app-border bg-app-bg p-2 dark:border-app-border-dark dark:bg-app-bg-dark">
            {isLoadingFriends || isRefetchingFriends ? (
              <AppLoadingBlock
                label="Đang tải bạn bè"
                size="sm"
                variant="muted"
              />
            ) : filteredFriends.length > 0 ? (
              <FlashList
                data={filteredFriends}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const fullName = `${item.firstName} ${item.lastName}`;
                  const isSelected = selectedFriend?.id === item.id;
                  const isAlreadyMember = activeMemberIds.has(item.id);
                  const isAlreadyInvited = pendingInviteIds.has(item.id);
                  const isDisabled = isAlreadyMember || isAlreadyInvited;
                  const statusLabel = isAlreadyMember
                    ? 'Đã là thành viên'
                    : isAlreadyInvited
                      ? 'Đã mời'
                      : '';

                  return (
                    <TouchableOpacity
                      disabled={isDisabled}
                      onPress={() => {
                        setSelectedFriend(item);
                      }}
                      className={`mb-2 flex-row items-center rounded-lg border px-3 py-2 ${
                        isDisabled
                          ? 'border-slate-200 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800/70 opacity-70'
                          : isSelected
                            ? 'border-sky-500 bg-sky-500/10'
                            : 'border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark'
                      }`}
                    >
                      <Image
                        source={{ uri: item.avatarUrl }}
                        className="h-8 w-8 rounded-full bg-slate-200"
                      />
                      <View className="ml-3 flex-1">
                        <Text
                          numberOfLines={1}
                          className={`text-sm font-semibold ${
                            isSelected
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-app-fg dark:text-app-fg-dark'
                          }`}
                        >
                          {fullName}
                        </Text>
                      </View>
                      {statusLabel ? (
                        <View className="ml-2 rounded-full bg-slate-200 px-2 py-1 dark:bg-slate-700">
                          <Text className="text-[10px] font-semibold text-slate-600 dark:text-slate-200">
                            {statusLabel}
                          </Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-center text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
                  Không tìm thấy bạn bè phù hợp.
                </Text>
              </View>
            )}
          </View>
        </View>
      </AppModal>
    </View>
  );
};
