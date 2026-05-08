import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupRole, GroupMemberDTO } from '@repo/shared/types';
import { roleLabel } from './admin-members-section'; // Re-use label từ file chính

type ChangeRoleFormProps = {
    member: GroupMemberDTO;
    currentUserRole?: GroupRole; // Vai trò của admin đang thực hiện thao tác
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

    // Logic phân quyền: Chỉ Owner mới có thể set người khác làm Owner
    const allowedRoles = useMemo(() => {
        const roles = [
            GroupRole.ADMIN,
            GroupRole.MODERATOR,
            GroupRole.MEMBER,
        ];
        if (currentUserRole === GroupRole.OWNER) {
            return [GroupRole.OWNER, ...roles];
        }
        return roles;
    }, [currentUserRole]);

    return (
        <View className="flex-1 bg-white dark:bg-slate-950 p-5">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-xl font-bold text-slate-900 dark:text-white">Thay đổi vai trò</Text>
                    <Text className="text-xs text-slate-500 mt-1">Cập nhật quyền hạn cho {member.userName}</Text>
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
                                className={`flex-row items-center p-4 rounded-2xl border ${isActive
                                    ? 'bg-sky-50 border-sky-500 dark:bg-sky-500/10'
                                    : 'bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-800'
                                    }`}
                            >
                                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${isActive ? 'border-sky-500 bg-sky-500' : 'border-slate-300'
                                    }`}>
                                    {isActive && <Ionicons name="checkmark" size={12} color="white" />}
                                </View>

                                <View className="ml-4 flex-1">
                                    <Text className={`font-bold ${isActive ? 'text-sky-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {roleLabel[role]}
                                    </Text>
                                    <Text className="text-[10px] text-slate-400 mt-0.5 italic">
                                        {role === GroupRole.OWNER ? 'Toàn quyền quản lý nhóm' : `Quyền hạn cấp ${role}`}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer Actions */}
            <View className="flex-row gap-3 mt-4 mb-6">
                <TouchableOpacity
                    onPress={onClose}
                    className="flex-1 h-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800"
                >
                    <Text className="font-bold text-slate-600 dark:text-slate-400">Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onSubmit(selectedRole)}
                    disabled={isSubmitting || selectedRole === member.role}
                    className={`flex-2 h-14 items-center justify-center rounded-2xl ${isSubmitting || selectedRole === member.role
                        ? 'bg-sky-200 dark:bg-sky-900/40'
                        : 'bg-sky-500 shadow-lg shadow-sky-200'
                        }`}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="font-bold text-white text-lg">Lưu thay đổi</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};