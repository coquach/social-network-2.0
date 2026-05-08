import React, { useMemo } from 'react';
import { View, Text, SectionList, ActivityIndicator } from 'react-native';

// Hooks & Types từ shared của bạn
import { useGroupMembers } from '@repo/shared/hooks';
import { GroupMemberStatus, GroupRole } from '@repo/shared/types';
import { MemberCard } from './components/member-card';


const roleLabel: Record<GroupRole, string> = {
    OWNER: 'Chủ nhóm',
    ADMIN: 'Quản trị viên',
    MODERATOR: 'Người kiểm duyệt',
    MEMBER: 'Thành viên',
};

const roleOrder: GroupRole[] = [
    GroupRole.OWNER,
    GroupRole.ADMIN,
    GroupRole.MODERATOR,
    GroupRole.MEMBER,
];

export const MemberSection = ({ groupId }: { groupId: string }) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch
    } = useGroupMembers(groupId, {
        status: GroupMemberStatus.ACTIVE,
        limit: 20,
    });

    const allMembers = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

    // Chuyển đổi dữ liệu sang định dạng Sections cho SectionList
    const sections = useMemo(() => {
        return roleOrder.map(role => ({
            title: roleLabel[role],
            role,
            data: allMembers.filter(m => m.role === role)
        })).filter(section => section.data.length > 0);
    }, [allMembers]);

    if (isLoading) {
        return (
            <View className="p-10 items-center">
                <ActivityIndicator color="#0ea5e9" />
            </View>
        );
    }

    if (isError) {
        return (
            <View className="p-10 items-center">
                <Text className="text-red-500">Không thể tải danh sách thành viên</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white dark:bg-slate-950">
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                stickySectionHeadersEnabled={false} // Header sẽ trượt theo danh sách (giống web)
                renderItem={({ item }) => <MemberCard member={item} />}
                renderSectionHeader={({ section: { title, data } }) => (
                    <View className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 mt-2 rounded-xl mb-2 flex-row justify-between items-center mx-4 border border-slate-100 dark:border-slate-800">
                        <Text className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-widest">
                            {title}
                        </Text>
                        <Text className="text-[10px] font-bold text-slate-400">
                            {data.length} THÀNH VIÊN
                        </Text>
                    </View>
                )}
                // Infinite Scroll logic
                onEndReached={() => hasNextPage && fetchNextPage()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <ActivityIndicator className="my-6" color="#0ea5e9" />
                    ) : (
                        <View className="h-20 items-center justify-center">
                            {allMembers.length > 0 && <Text className="text-slate-400 text-[10px]">ĐÃ HIỂN THỊ TẤT CẢ</Text>}
                        </View>
                    )
                }
                refreshing={isLoading}
                onRefresh={refetch}
                contentContainerStyle={{ paddingTop: 16 }}
            />
        </View>
    );
};