import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { MemberSection } from './member-section';
import { AppEyebrow, AppTitle } from '~/components/ui/app-text';

export default function GroupMembersPage() {
    const { groupId } = useLocalSearchParams<{ groupId: string }>();

    if (!groupId) return null;

    return (
        <View className="flex-1 bg-white dark:bg-slate-950">
            {/* Header nhẹ nhàng cho mobile */}
            <View className="px-5 pt-4 pb-2">
                <AppEyebrow>Cộng đồng</AppEyebrow>
                <AppTitle className="text-2xl">Thành viên</AppTitle>
            </View>

            <MemberSection groupId={groupId} />
        </View>
    );
}