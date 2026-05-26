import React from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Sử dụng các hook mới đã được export từ shared
import { useApproveGroupPost, useRejectGroupPost } from '@repo/shared/hooks';

export const ModerationPostSlide = ({ groupId, post }: any) => {
    // 1. Khởi tạo các hook mutation mới
    const { mutateAsync: approveMutation, isPending: isApproving } = useApproveGroupPost();
    const { mutateAsync: rejectMutation, isPending: isRejecting } = useRejectGroupPost();

    const isProcessing = isApproving || isRejecting;

    const handleAction = (type: 'approve' | 'reject') => {
        const isApprove = type === 'approve';

        Alert.alert(
            isApprove ? 'Duyệt bài viết?' : 'Từ chối bài viết?',
            isApprove
                ? 'Bài viết sẽ được hiển thị cho mọi người trong nhóm.'
                : 'Bài viết sẽ bị xóa khỏi hàng đợi duyệt.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: isApprove ? 'Duyệt' : 'Từ chối',
                    style: isApprove ? 'default' : 'destructive',
                    onPress: async () => {
                        try {
                            // 2. Truyền object { postId, groupId } vào mutation đúng như định nghĩa của hook
                            const payload = { postId: post.id, groupId };

                            if (isApprove) {
                                await approveMutation(payload);
                            } else {
                                await rejectMutation(payload);
                            }
                        } catch (e) {
                            Alert.alert('Lỗi', 'Không thể thực hiện thao tác này. Vui lòng thử lại.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            {/* Post Preview Area */}
            <View className="p-4 border-b border-slate-50 dark:border-slate-800">
                <View className="flex-row items-center gap-3 mb-3">
                    {/* Placeholder cho Avatar người đăng */}
                    <View className="h-10 w-10 rounded-full bg-slate-200" />
                    <View>
                        <Text className="font-bold text-slate-900 dark:text-white">
                            {post.authorName || 'Thành viên'}
                        </Text>
                        <Text className="text-[10px] text-slate-400">Đang chờ duyệt</Text>
                    </View>
                </View>

                <Text className="text-slate-800 dark:text-slate-200 text-sm mb-3" numberOfLines={5}>
                    {post.content}
                </Text>

                {/* Hiển thị Media Preview nếu có */}
                {post.media?.length > 0 && (
                    <View className="h-40 w-full bg-slate-100 dark:bg-slate-800 rounded-xl items-center justify-center">
                        <Ionicons name="image-outline" size={32} color="#94a3b8" />
                    </View>
                )}
            </View>

            {/* Action Buttons Area */}
            <View className="flex-row p-4 gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                <TouchableOpacity
                    onPress={() => handleAction('reject')}
                    disabled={isProcessing}
                    className="flex-1 flex-row h-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50"
                >
                    {isRejecting ? (
                        <ActivityIndicator color="#e11d48" />
                    ) : (
                        <>
                            <Ionicons name="close-circle-outline" size={20} color="#e11d48" />
                            <Text className="ml-2 font-bold text-rose-600">Từ chối</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleAction('approve')}
                    disabled={isProcessing}
                    className="flex-1 flex-row h-12 items-center justify-center rounded-2xl bg-sky-500"
                >
                    {isApproving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                            <Text className="ml-2 font-bold text-white">Duyệt bài</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};