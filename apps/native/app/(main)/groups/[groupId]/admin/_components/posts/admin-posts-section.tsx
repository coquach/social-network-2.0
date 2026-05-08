import React, { useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useGroupPosts } from '@repo/shared/hooks';
import { PostGroupStatus } from '@repo/shared/types';
import { ModerationPostSlide } from './moderation-post-slide';

const { width } = Dimensions.get('window');

export const GroupAdminPostsSection = ({ groupId }: { groupId: string }) => {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isError
    } = useGroupPosts(groupId, {
        status: PostGroupStatus.PENDING,
    });

    const allPosts = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

    if (isLoading) {
        return (
            <View className="p-10 items-center justify-center">
                <ActivityIndicator color="#0ea5e9" size="large" />
                <Text className="text-slate-500 mt-4 font-medium text-sm">
                    Đang tải bài viết chờ duyệt...
                </Text>
            </View>
        );
    }

    // Error State
    if (isError) {
        return (
            <View className="m-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100">
                <Text className="text-red-600 dark:text-red-400 text-center text-sm">
                    Có lỗi xảy ra khi tải danh sách bài viết.
                </Text>
            </View>
        );
    }

    const renderHeader = () => (
        <View className="px-5 py-4 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                        <Ionicons name="document-text" size={16} color="#d97706" />
                    </View>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">Kiểm duyệt</Text>
                </View>

                {allPosts.length > 0 && (
                    <View className="bg-amber-500 px-2.5 py-1 rounded-full">
                        <Text className="text-white text-[10px] font-bold">{allPosts.length} BÀI ĐANG CHỜ</Text>
                    </View>
                )}
            </View>

            <Text className="text-xs text-slate-500 mt-2">
                {allPosts.length > 0
                    ? "Vuốt sang ngang để xem và phê duyệt từng nội dung."
                    : "Tuyệt vời! Không có bài viết nào đang chờ xử lý."}
            </Text>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50 dark:bg-black">
            {renderHeader()}

            <FlatList
                data={allPosts}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                snapToAlignment="center"
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onEndReached={() => hasNextPage && fetchNextPage()}
                onEndReachedThreshold={0.5}
                renderItem={({ item }) => (
                    <View style={{ width: width }} className="p-4">
                        <ModerationPostSlide groupId={groupId} post={item} />
                    </View>
                )}
                ListEmptyComponent={
                    <View className="py-20 items-center px-10" style={{ width: width }}>
                        <View className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full items-center justify-center mb-4">
                            <Ionicons name="checkmark-done" size={40} color="#94a3b8" />
                        </View>
                        <Text className="text-slate-400 text-center font-medium">
                            Hiện tại nhóm không có bài viết nào cần kiểm duyệt.
                        </Text>
                    </View>
                }
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={{ width: 100 }} className="justify-center items-center h-full">
                            <ActivityIndicator color="#0ea5e9" />
                        </View>
                    ) : null
                }
            />
        </View>
    );
};