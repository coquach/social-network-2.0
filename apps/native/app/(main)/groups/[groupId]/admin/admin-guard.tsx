import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGroupPermission } from '@repo/shared/hooks';
import { GroupRole, GroupDTO } from '@repo/shared/types';
import { Ionicons } from '@expo/vector-icons';

const ADMIN_ROLES = new Set<GroupRole>([
    GroupRole.OWNER,
    GroupRole.ADMIN,
    GroupRole.MODERATOR,
]);

export const GroupAdminGuard = ({
    children,
    group
}: {
    children: React.ReactNode,
    group: GroupDTO | undefined
}) => {
    const router = useRouter();
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    const { role } = useGroupPermission(group);

    const isAllowed = !!role && ADMIN_ROLES.has(role);

    useEffect(() => {
        if (group && !isAllowed) {
            router.replace(`/(main)/groups/${groupId}`);
        }
    }, [group, isAllowed, groupId]);

    if (!group) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-slate-950">
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text className="mt-4 text-slate-500 text-sm">Đang kiểm tra quyền hạn...</Text>
            </View>
        );
    }

    if (!isAllowed) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-slate-950 p-6">
                <Ionicons name="lock-closed-outline" size={64} color="#f43f5e" />
                <Text className="mt-4 text-lg font-bold text-slate-900 dark:text-white text-center">
                    Truy cập bị từ chối
                </Text>
                <Text className="mt-2 text-slate-500 text-center text-sm">
                    Bạn không có quyền quản trị để truy cập trang này. Đang chuyển hướng...
                </Text>
            </View>
        );
    }

    return <>{children}</>;
};