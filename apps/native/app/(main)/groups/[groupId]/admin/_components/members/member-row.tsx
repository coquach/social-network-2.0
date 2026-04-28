import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    GroupMemberDTO,
    GroupRole,
    GroupMemberStatus,
    GroupPermission // Thêm import này
} from '@repo/shared/types';
import {
    useRemoveMember,
    useBanMember,
    useUnbanMember,
    useChangeMemberRole,        // Thêm hook này
    useChangeMemberPermission   // Thêm hook này
} from '@repo/shared/hooks';
import { ChangeRoleForm } from './change-role-form';
import { ChangePermissionForm } from './change-permission-form';
import { roleLabel } from './admin-members-section';

export const GroupAdminMemberRow = ({ member, groupId }: { member: GroupMemberDTO, groupId: string }) => {
    const [modalType, setModalType] = useState<'NONE' | 'ROLE' | 'PERM'>('NONE');

    const { mutate: removeMember } = useRemoveMember();
    const { mutate: banMember } = useBanMember();
    const { mutate: unbanMember } = useUnbanMember();

    // Khai báo thêm các mutation xử lý Role và Permission để lấy trạng thái Loading
    const { mutate: changeRole, isPending: isChangingRole } = useChangeMemberRole();
    const { mutate: changePerms, isPending: isChangingPerms } = useChangeMemberPermission();

    const isOwner = member.role === GroupRole.OWNER;

    const handleKick = () => {
        Alert.alert('Xóa thành viên', `Bạn có chắc muốn mời ${member.userName} rời nhóm?`, [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Xóa', style: 'destructive', onPress: () => removeMember({ groupId, memberId: member.userId }) }
        ]);
    };

    return (
        <View className="bg-white dark:bg-slate-900 p-3 rounded-2xl flex-row items-center mb-2 border border-slate-50 dark:border-slate-800 shadow-sm">
            <Image
                source={{ uri: member.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${member.userName}` }}
                className="w-10 h-10 rounded-full bg-slate-200"
            />

            <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-slate-900 dark:text-white" numberOfLines={1}>{member.userName}</Text>
                <Text className="text-[10px] text-sky-600 font-medium">{roleLabel[member.role]}</Text>
            </View>

            {!isOwner && (
                <View className="flex-row gap-1">
                    <TouchableOpacity
                        onPress={() => setModalType('ROLE')}
                        className="w-8 h-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                    >
                        <Ionicons name="shield-outline" size={16} color="#64748b" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setModalType('PERM')}
                        className="w-8 h-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                    >
                        <Ionicons name="key-outline" size={16} color="#64748b" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={member.status === GroupMemberStatus.BANNED ? () => unbanMember({ groupId, memberId: member.userId }) : handleKick}
                        className={`w-8 h-8 items-center justify-center rounded-full ${member.status === GroupMemberStatus.BANNED ? 'bg-green-100' : 'bg-red-50'}`}
                    >
                        <Ionicons
                            name={member.status === GroupMemberStatus.BANNED ? "refresh-outline" : "person-remove-outline"}
                            size={16}
                            color={member.status === GroupMemberStatus.BANNED ? "#22c55e" : "#ef4444"}
                        />
                    </TouchableOpacity>
                </View>
            )}

            {/* Modal Chỉnh sửa - ĐÃ FIX PROPS */}
            <Modal visible={modalType !== 'NONE'} animationType="slide" presentationStyle="pageSheet">
                {modalType === 'ROLE' && (
                    <ChangeRoleForm
                        member={member}
                        isSubmitting={isChangingRole} // Truyền trạng thái loading vào
                        onClose={() => setModalType('NONE')}
                        onSubmit={(newRole) => {
                            changeRole({ groupId, memberId: member.userId, role: newRole }, {
                                onSuccess: () => setModalType('NONE')
                            });
                        }}
                    />
                )}
                {modalType === 'PERM' && (
                    <ChangePermissionForm
                        member={member}
                        isSubmitting={isChangingPerms} // Truyền trạng thái loading vào
                        onClose={() => setModalType('NONE')}
                        onSubmit={(perms: GroupPermission[]) => { // Định nghĩa rõ kiểu dữ liệu cho perms
                            changePerms({ groupId, memberId: member.userId, permissions: perms }, {
                                onSuccess: () => setModalType('NONE')
                            });
                        }}
                    />
                )}
            </Modal>
        </View>
    );
};