import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View, Alert } from 'react-native';
import { GroupDTO, MembershipStatus, GroupPermission } from '@repo/shared/types';
import {
    useLeaveGroup,
    useRequestToJoinGroup,
    useAcceptGroupInvite,
    useDeclineGroupInvite,
    useCancelJoinRequest
} from '@repo/shared/hooks';
import { useRouter } from 'expo-router';
import { useGroupPermission } from '@repo/shared';

interface GroupHeaderProps {
    group: GroupDTO;
}

export const GroupHeader = ({ group }: GroupHeaderProps) => {
    const router = useRouter();
    const { can } = useGroupPermission(group);

    // Mutations
    const { mutate: joinGroup } = useRequestToJoinGroup();
    const { mutate: leaveGroup } = useLeaveGroup();
    const { mutate: acceptInvite } = useAcceptGroupInvite();
    const { mutate: declineInvite } = useDeclineGroupInvite();
    const { mutate: cancelRequest } = useCancelJoinRequest();

    const handleLeaveGroup = () => {
        Alert.alert('Rời nhóm', 'Bạn có chắc chắn muốn rời khỏi nhóm này không?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Rời nhóm', style: 'destructive', onPress: () => leaveGroup(group.id) },
        ]);
    };

    return (
        <View className="bg-white dark:bg-slate-900 pb-4 rounded-b-[40px]">
            {/* 1. Cover Image */}
            <View className="h-40 w-full bg-slate-200 dark:bg-slate-800">
                {group.coverImageUrl && (
                    <Image source={{ uri: group.coverImageUrl }} className="h-full w-full" resizeMode="cover" />
                )}
            </View>

            <View className="px-4">
                {/* 2. Avatar (Floating with White Border) */}
                <View className="-mt-12 h-24 w-24 rounded-3xl border-4 border-white dark:border-slate-900 bg-slate-100 overflow-hidden shadow-sm">
                    <Image source={{ uri: group.avatarUrl }} className="h-full w-full" />
                </View>

                {/* 3. Group Info */}
                <View className="mt-3">
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white">{group.name}</Text>
                    <View className="flex-row items-center mt-1 gap-1">
                        <Ionicons
                            name={group.privacy === 'PUBLIC' ? "earth" : "lock-closed"}
                            size={14}
                            color="#64748b"
                        />
                        <Text className="text-slate-500 text-sm">
                            {group.privacy === 'PUBLIC' ? 'Nhóm Công khai' : 'Nhóm Riêng tư'} • {group.members} thành viên
                        </Text>
                    </View>
                </View>

                {/* 4. Action Buttons Layer */}
                <View className="mt-5 flex-row flex-wrap gap-2">

                    {/* CASE: CHƯA THAM GIA */}
                    {group.membershipStatus === MembershipStatus.NONE && (
                        <TouchableOpacity
                            onPress={() => joinGroup(group.id)}
                            className="flex-1 flex-row items-center justify-center bg-blue-600 h-11 rounded-xl gap-2"
                        >
                            <Ionicons name="person-add" size={18} color="white" />
                            <Text className="text-white font-bold">Tham gia nhóm</Text>
                        </TouchableOpacity>
                    )}

                    {/* CASE: ĐANG CHỜ DUYỆT */}
                    {group.membershipStatus === MembershipStatus.PENDING_APPROVAL && (
                        <TouchableOpacity
                            onPress={() => cancelRequest({ groupId: group.id, requestId: group.id })} // Cần truyền đúng ID request nếu có
                            className="flex-1 flex-row items-center justify-center bg-amber-100 dark:bg-amber-900/30 h-11 rounded-xl gap-2"
                        >
                            <Ionicons name="time" size={18} color="#d97706" />
                            <Text className="text-amber-600 font-bold">Hủy yêu cầu</Text>
                        </TouchableOpacity>
                    )}

                    {/* CASE: ĐƯỢC MỜI */}
                    {group.membershipStatus === MembershipStatus.INVITED && (
                        <View className="flex-1 flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => acceptInvite(group.id)}
                                className="flex-1 flex-row items-center justify-center bg-blue-600 h-11 rounded-xl"
                            >
                                <Text className="text-white font-bold">Chấp nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => declineInvite(group.id)}
                                className="flex-1 flex-row items-center justify-center bg-slate-200 dark:bg-slate-800 h-11 rounded-xl"
                            >
                                <Text className="text-slate-700 dark:text-slate-300 font-bold">Từ chối</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* CASE: THÀNH VIÊN / QUẢN TRỊ */}
                    {group.membershipStatus === MembershipStatus.MEMBER && (
                        <>
                            {can(GroupPermission.INVITE_MEMBERS) && (
                                <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-blue-600 h-11 rounded-xl gap-2">
                                    <Ionicons name="share-social" size={18} color="white" />
                                    <Text className="text-white font-bold">Mời</Text>
                                </TouchableOpacity>
                            )}

                            {can(GroupPermission.MANAGE_JOIN_REQUESTS) && (
                                <TouchableOpacity
                                    onPress={() => router.push(`/(main)/groups/${group.id}/requests`)}
                                    className="h-11 px-4 items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl flex-row gap-2"
                                >
                                    <Ionicons name="people" size={20} color="#64748b" />
                                    <Text className="text-slate-600 dark:text-slate-300 font-bold">Duyệt</Text>
                                </TouchableOpacity>
                            )}

                            {can(GroupPermission.UPDATE_GROUP) && (
                                <TouchableOpacity
                                    onPress={() => router.push(`/(main)/groups/${group.id}/edit`)}
                                    className="w-11 h-11 items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl"
                                >
                                    <Ionicons name="create-outline" size={20} color="#64748b" />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={handleLeaveGroup}
                                className="w-11 h-11 items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl"
                            >
                                <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </>
                    )}

                    {/* CASE: BỊ BAN */}
                    {group.membershipStatus === MembershipStatus.BANNED && (
                        <View className="flex-1 flex-row items-center justify-center bg-red-100 h-11 rounded-xl">
                            <Text className="text-red-600 font-bold">Bạn đã bị chặn khỏi nhóm</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};