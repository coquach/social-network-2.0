import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GroupAdminMembersSection } from './_components/members/admin-members-section';
import { GroupAdminPostsSection } from './_components/posts/admin-posts-section';
import { GroupAdminJoinRequestsSection } from './_components/join-request/admin-join-request-section';
import { GroupAdminLogsSection } from './_components/logs/admin-logs-section';

type AdminTabKey = 'members' | 'posts' | 'joinRequests' | 'logs';

const TABS: { key: AdminTabKey; label: string; icon: any }[] = [
    { key: 'members', label: 'Thành viên', icon: 'people' },
    { key: 'posts', label: 'Bài viết', icon: 'document-text' },
    { key: 'joinRequests', label: 'Yêu cầu', icon: 'person-add' },
    { key: 'logs', label: 'Nhật ký', icon: 'list' },
];

export const GroupAdminPanel = ({ groupId }: { groupId: string }) => {
    const [activeTab, setActiveTab] = useState<AdminTabKey>('members');
    const router = useRouter();

    const { top } = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-white dark:bg-slate-950" style={{ paddingTop: top }}>
            {/* 1. Header & Tab Navigation */}
            <View className="pt-2 border-b border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center px-4 py-2">
                    <Pressable
                        onPress={() => router.back()}
                        className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                    >
                        <Ionicons name="chevron-back" size={20} className="text-slate-900 dark:text-white" />
                    </Pressable>
                    <View>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Quản trị nhóm</Text>
                        <Text className="text-[11px] text-sky-500 font-medium">QUYỀN HẠN: QUẢN TRỊ VIÊN / MOD</Text>
                    </View>
                </View>

                {/* Custom Tab Bar */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row px-4 mt-2"
                >
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key)}
                                className={`flex-row items-center px-4 py-3 mr-2 border-b-2 ${isActive ? 'border-sky-500' : 'border-transparent'
                                    }`}
                            >
                                <Ionicons
                                    name={tab.icon}
                                    size={18}
                                    color={isActive ? '#0ea5e9' : '#64748b'}
                                />
                                <Text className={`ml-2 font-bold ${isActive ? 'text-sky-600' : 'text-slate-500'}`}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* 2. Main Content Area */}
            <View className="flex-1">
                {activeTab === 'members' && (
                    <GroupAdminMembersSection groupId={groupId} />
                )}
                {activeTab === 'posts' && (
                    <GroupAdminPostsSection groupId={groupId} />
                )}
                {activeTab === 'joinRequests' && (
                    <GroupAdminJoinRequestsSection groupId={groupId} />
                )}
                {activeTab === 'logs' && (
                    <GroupAdminLogsSection groupId={groupId} />
                )}
            </View>
        </View>
    );
};