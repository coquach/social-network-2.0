import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupMemberDTO, GroupRole } from '@repo/shared/types';
import { roleLabel } from './admin-members-section';

type ChangeRoleFormProps = {
  member: GroupMemberDTO;
  currentUserRole?: GroupRole;
  isSubmitting: boolean;
  onSubmit: (newRole: GroupRole) => void;
  onClose: () => void;
};

export const ChangeRoleForm = ({
  member,
  currentUserRole,
  isSubmitting,
  onSubmit,
  onClose,
}: ChangeRoleFormProps) => {
  const [selectedRole, setSelectedRole] = useState<GroupRole>(member.role);

  const allowedRoles = React.useMemo(() => {
    const roles = [GroupRole.ADMIN, GroupRole.MODERATOR, GroupRole.MEMBER];
    if (currentUserRole === GroupRole.OWNER) {
      return [GroupRole.OWNER, ...roles];
    }
    return roles;
  }, [currentUserRole]);

  return (
    <View className="flex-1 bg-white p-5 dark:bg-slate-950">
      <View className="mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Thay đổi vai trò</Text>
          <Text className="mt-1 text-xs text-slate-500">Cập nhật quyền hạn cho {member.userName}</Text>
        </View>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-3">
          {allowedRoles.map((role) => {
            const isActive = selectedRole === role;
            return (
              <TouchableOpacity
                key={role}
                onPress={() => setSelectedRole(role)}
                className={`flex-row items-center rounded-2xl border p-4 ${
                  isActive
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10'
                    : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                    isActive ? 'border-sky-500 bg-sky-500' : 'border-slate-300'
                  }`}
                >
                  {isActive ? <Ionicons name="checkmark" size={12} color="white" /> : null}
                </View>

                <View className="ml-4 flex-1">
                  <Text className={`font-bold ${isActive ? 'text-sky-600' : 'text-slate-700 dark:text-slate-300'}`}>
                    {roleLabel[role]}
                  </Text>
                  <Text className="mt-0.5 text-[10px] italic text-slate-400">
                    {role === GroupRole.OWNER ? 'Toàn quyền quản lý nhóm' : `Quyền hạn cấp ${role}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View className="mb-6 mt-4 flex-row gap-3">
        <TouchableOpacity
          onPress={onClose}
          className="h-14 flex-1 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800"
        >
          <Text className="font-bold text-slate-600 dark:text-slate-400">Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSubmit(selectedRole)}
          disabled={isSubmitting || selectedRole === member.role}
          className={`h-14 flex-[2] items-center justify-center rounded-2xl ${
            isSubmitting || selectedRole === member.role ? 'bg-sky-200 dark:bg-sky-900/40' : 'bg-sky-500 shadow-lg shadow-sky-200'
          }`}
        >
          {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-lg font-bold text-white">Lưu thay đổi</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};
