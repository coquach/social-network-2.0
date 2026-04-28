import React, { useState } from 'react';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  GroupMemberDTO,
  GroupMemberStatus,
  GroupPermission,
  GroupRole,
} from '@repo/shared/types';
import {
  useChangeMemberPermission,
  useChangeMemberRole,
  useRemoveMember,
  useUnbanMember,
} from '@repo/shared/hooks';
import { ChangePermissionForm } from './change-permission-form';
import { ChangeRoleForm } from './change-role-form';
import { roleLabel } from './admin-members-section';
import { AppModal } from '~/components/ui/app-modal';

export const GroupAdminMemberRow = ({ member, groupId }: { member: GroupMemberDTO; groupId: string }) => {
  const [modalType, setModalType] = useState<'NONE' | 'ROLE' | 'PERM'>('NONE');
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);

  const { mutate: removeMember } = useRemoveMember();
  const { mutate: unbanMember } = useUnbanMember();

  const { mutate: changeRole, isPending: isChangingRole } = useChangeMemberRole();
  const { mutate: changePerms, isPending: isChangingPerms } = useChangeMemberPermission();

  const isOwner = member.role === GroupRole.OWNER;

  return (
    <View className="mb-2 flex-row items-center rounded-2xl border border-slate-50 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Image
        source={{ uri: member.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${member.userName}` }}
        className="h-10 w-10 rounded-full bg-slate-200"
      />

      <View className="ml-3 flex-1">
        <Text className="text-sm font-bold text-slate-900 dark:text-white" numberOfLines={1}>
          {member.userName}
        </Text>
        <Text className="text-[10px] font-medium text-sky-600">{roleLabel[member.role]}</Text>
      </View>

      {!isOwner ? (
        <View className="flex-row gap-1">
          <TouchableOpacity
            onPress={() => setModalType('ROLE')}
            className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <Ionicons name="shield-outline" size={16} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalType('PERM')}
            className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <Ionicons name="key-outline" size={16} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={member.status === GroupMemberStatus.BANNED ? () => unbanMember({ groupId, memberId: member.userId }) : () => setIsKickModalOpen(true)}
            className={`h-8 w-8 items-center justify-center rounded-full ${
              member.status === GroupMemberStatus.BANNED ? 'bg-green-100' : 'bg-red-50'
            }`}
          >
            <Ionicons
              name={member.status === GroupMemberStatus.BANNED ? 'refresh-outline' : 'person-remove-outline'}
              size={16}
              color={member.status === GroupMemberStatus.BANNED ? '#22c55e' : '#ef4444'}
            />
          </TouchableOpacity>
        </View>
      ) : null}

      <Modal visible={modalType !== 'NONE'} animationType="slide" presentationStyle="pageSheet">
        {modalType === 'ROLE' ? (
          <ChangeRoleForm
            member={member}
            isSubmitting={isChangingRole}
            onClose={() => setModalType('NONE')}
            onSubmit={(newRole) => {
              changeRole(
                { groupId, memberId: member.userId, role: newRole },
                {
                  onSuccess: () => setModalType('NONE'),
                },
              );
            }}
          />
        ) : null}

        {modalType === 'PERM' ? (
          <ChangePermissionForm
            member={member}
            isSubmitting={isChangingPerms}
            onClose={() => setModalType('NONE')}
            onSubmit={(perms: GroupPermission[]) => {
              changePerms(
                { groupId, memberId: member.userId, permissions: perms },
                {
                  onSuccess: () => setModalType('NONE'),
                },
              );
            }}
          />
        ) : null}
      </Modal>

      <AppModal
        visible={isKickModalOpen}
        onClose={() => setIsKickModalOpen(false)}
        variant="danger"
        title="Xóa thành viên"
        description={`Bạn có chắc muốn mời ${member.userName} rời nhóm?`}
        footer={
          <>
            <TouchableOpacity
              onPress={() => setIsKickModalOpen(false)}
              className="h-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              <Text className="font-semibold text-slate-700 dark:text-slate-300">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                removeMember({ groupId, memberId: member.userId });
                setIsKickModalOpen(false);
              }}
              className="h-11 items-center justify-center rounded-xl bg-rose-500"
            >
              <Text className="font-semibold text-white">Xóa</Text>
            </TouchableOpacity>
          </>
        }
      />
    </View>
  );
};
