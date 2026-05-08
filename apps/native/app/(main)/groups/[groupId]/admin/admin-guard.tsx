import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGroupPermission } from '@repo/shared';
import { GroupRole, GroupDTO } from '@repo/shared/types';

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
    }, [group, isAllowed]);

    if (!group) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-slate-950">
                <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
        );
    }

    if (!isAllowed) return null;

    return <>{children}</>;
};