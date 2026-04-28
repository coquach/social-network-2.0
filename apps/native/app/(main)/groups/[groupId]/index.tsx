import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppScrollScreen } from '~/components/ui/app-screen';
import { GroupHeader } from '~/components/groups/group-header';
import { Ionicons } from '@expo/vector-icons';

// Import Mock Data
import { MOCK_GROUP_DETAIL, MOCK_POSTS } from '~/constants/mock-group';

export default function GroupDetailScreen() {
    const { groupId } = useLocalSearchParams<{ groupId: string }>();

    // Giả sử isLoading = false để hiện UI ngay
    const group = MOCK_GROUP_DETAIL;

    return (
        <AppScrollScreen>
            <View className="pb-20">
                {/* 1. Header Nhóm */}
                <GroupHeader group={group} />

                {/* 2. Phần Post Feed */}
                <View className="p-4 gap-4">
                    {/* Thanh Create Post giả */}
                    <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex-row items-center gap-3 border border-slate-100 dark:border-slate-800">
                        <Image source={{ uri: 'https://i.pravatar.cc/150?u=me' }} className="h-10 w-10 rounded-full" />
                        <Text className="text-slate-400 flex-1">Bạn đang nghĩ gì...</Text>
                        <Ionicons name="images-outline" size={20} color="#64748b" />
                    </View>

                    {/* Danh sách bài viết mock */}
                    {MOCK_POSTS.map((post) => (
                        <View key={post.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <View className="flex-row items-center gap-3 mb-3">
                                <Image source={{ uri: post.avatar }} className="h-10 w-10 rounded-full" />
                                <View>
                                    <Text className="font-bold text-slate-900 dark:text-white">{post.author}</Text>
                                    <Text className="text-xs text-slate-500">{post.time}</Text>
                                </View>
                            </View>

                            <Text className="text-slate-800 dark:text-slate-200 leading-5">
                                {post.content}
                            </Text>

                            <View className="flex-row mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 gap-6">
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="heart-outline" size={18} color="#64748b" />
                                    <Text className="text-slate-500 text-xs">{post.likes}</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="chatbubble-outline" size={18} color="#64748b" />
                                    <Text className="text-slate-500 text-xs">{post.comments}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </AppScrollScreen>
    );
}