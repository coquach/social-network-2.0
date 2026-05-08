import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useGroup } from '@repo/shared/hooks';
import { GroupAdminGuard } from './admin-guard';
import { GroupAdminPanel } from './admin-section';

export default function GroupAdminPage() {
    const { groupId } = useLocalSearchParams<{ groupId: string }>();

    const { data: group } = useGroup(groupId as string);

    return (
        <GroupAdminGuard group={group}>
            <GroupAdminPanel groupId={groupId as string} />
        </GroupAdminGuard>
    );
}