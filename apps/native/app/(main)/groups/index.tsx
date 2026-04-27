import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Modal
} from 'react-native';
import { useRouter } from 'expo-router';

// UI Components
import { AppEyebrow, AppSubtitle, AppTitle } from '~/components/ui/app-text';
import { GroupCard } from '~/components/groups/group-card';
import { AppCard } from '~/components/ui/app-card';

// Types & Hooks (Phần này sẽ dùng cho BE sau này)
import { MembershipStatus } from '@repo/shared/types';
// import { useMyGroups, useRecommendedGroups, useInvitedGroups } from '@repo/shared/hooks';

// Mock Data
import { MOCK_GROUPS, MOCK_ACTIVE_ROOMS } from '~/constants/mock-data';
import { CreateGroupForm } from '~/components/groups/create-group-form';
import { InvitedGroupCard } from '~/components/groups/invited-group-card';

enum GroupTab {
    MY_GROUPS = 'MY_GROUPS',
    RECOMMENDED = 'RECOMMENDED',
    INVITATIONS = 'INVITATIONS'
}

export default function GroupsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<GroupTab>(GroupTab.MY_GROUPS);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // =========================================================
    // LOGIC REAL (COMMENTED - Sẽ dùng khi có Backend)
    // =========================================================
    /*
    const myGroupsQuery = useMyGroups({ limit: 10 });
    const recommendedQuery = useRecommendedGroups({ limit: 10 });
    const invitedQuery = useInvitedGroups({ limit: 10 });
  
    const getActiveQuery = () => {
      switch (activeTab) {
        case GroupTab.MY_GROUPS: return myGroupsQuery;
        case GroupTab.RECOMMENDED: return recommendedQuery;
        case GroupTab.INVITATIONS: return invitedQuery;
      }
    };
  
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = getActiveQuery();
    const groups = data?.pages.flatMap(page => page.data) ?? []; // Dùng .data thay vì .items
    */

    // =========================================================
    // LOGIC MOCK (Đang sử dụng để check giao diện)
    // =========================================================
    const groups = useMemo(() => {
        switch (activeTab) {
            case GroupTab.MY_GROUPS:
                // Lấy các nhóm mình đã là MEMBER hoặc OWNER
                return MOCK_GROUPS.filter(g => g.membershipStatus === MembershipStatus.MEMBER);
            case GroupTab.RECOMMENDED:
                // Lấy các nhóm chưa tham gia (NONE)
                return MOCK_GROUPS.filter(g => g.membershipStatus === MembershipStatus.NONE || g.membershipStatus === MembershipStatus.PENDING_APPROVAL);
            case GroupTab.INVITATIONS:
                // Lấy các nhóm có lời mời (INVITED)
                return MOCK_GROUPS.filter(g => g.membershipStatus === MembershipStatus.INVITED);
            default:
                return [];
        }
    }, [activeTab]);

    const isLoading = false; // Mock loading state

    // Render Header
    const renderHeader = () => (
        <View className="bg-white dark:bg-slate-950 pt-4 px-4 pb-2">
            <AppEyebrow>Cộng đồng</AppEyebrow>
            <AppTitle className="text-3xl">Không gian nhóm!</AppTitle>
            <AppSubtitle className="mb-6">
                Theo dõi nhóm quan trọng, xem nhịp tương tác và vào thẳng các cuộc trò chuyện.
            </AppSubtitle>

            {/* Tab Switcher */}
            <View className="flex-row border-b border-slate-100 dark:border-slate-800 mb-4">
                {[
                    { id: GroupTab.MY_GROUPS, label: 'Của tôi' },
                    { id: GroupTab.RECOMMENDED, label: 'Gợi ý' },
                    { id: GroupTab.INVITATIONS, label: 'Lời mời' },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            className={`mr-6 pb-3 border-b-2 ${isActive ? 'border-sky-500' : 'border-transparent'}`}
                        >
                            <Text className={`font-bold ${isActive ? 'text-sky-500' : 'text-slate-400'}`}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Phòng đang hoạt động (Chỉ hiện ở Tab "Của tôi" để đỡ bị rối) */}
            {activeTab === GroupTab.MY_GROUPS && (
                <AppCard className="bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 shadow-none p-4 mb-6">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                        Phòng đang hoạt động
                    </Text>
                    <View className="gap-3">
                        {MOCK_ACTIVE_ROOMS.map((room) => (
                            <TouchableOpacity
                                key={room.title}
                                className="flex-row items-center gap-3"
                            >
                                <View className="h-10 w-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-500/10">
                                    <Ionicons name={room.icon as any} size={20} color="#0ea5e9" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                                        {room.title}
                                    </Text>
                                    <Text className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {room.members}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </AppCard>
            )}

            <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Danh sách nhóm
            </Text>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => {
        return (
            <View className="px-4 py-1">
                {activeTab === GroupTab.INVITATIONS ? (
                    // Nếu là tab Lời mời, dùng Card đặc thù
                    <InvitedGroupCard group={item} />
                ) : (
                    // Các tab khác dùng Card thông thường
                    <GroupCard group={item} />
                )}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white dark:bg-slate-950">
            <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={<View className="h-28" />}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={() => { }} tintColor="#0ea5e9" />
                }
                ListEmptyComponent={
                    <View className="py-20 items-center px-10">
                        <View className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full items-center justify-center mb-4">
                            <Ionicons name="people-outline" size={40} color="#cbd5e1" />
                        </View>
                        <Text className="text-slate-500 dark:text-slate-400 text-center font-medium">
                            Không có dữ liệu trong mục này
                        </Text>
                    </View>
                }
            />

            {/* FAB - Nút thêm nhóm */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsCreateModalOpen(true)}
                className="absolute bottom-30 right-6 w-16 h-16 bg-sky-500 rounded-full items-center justify-center shadow-lg shadow-sky-500/40"
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
            <Modal
                visible={isCreateModalOpen}
                animationType="slide"
                transparent={false}
                presentationStyle="pageSheet" // Tạo hiệu ứng lớp đè cực đẹp trên iOS
                onRequestClose={() => setIsCreateModalOpen(false)}
            >
                {/* Truyền hàm đóng modal vào component Form */}
                <CreateGroupForm onClose={() => setIsCreateModalOpen(false)} />
            </Modal>
        </View>
    );
}