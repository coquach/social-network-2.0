import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { InviteStatus } from '@repo/shared/types';

export const JoinRequestRow = ({ request, canManage, approving, rejecting, onApprove, onReject }: any) => {

    const handleApprove = () => {
        Alert.alert('Chấp nhận', 'Bạn có chắc chắn muốn cho thành viên này vào nhóm?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đồng ý', onPress: onApprove }
        ]);
    };

    const handleReject = () => {
        Alert.alert('Từ chối', 'Từ chối yêu cầu tham gia của thành viên này?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Từ chối', style: 'destructive', onPress: onReject }
        ]);
    };

    return (
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex-row items-center justify-between mb-2 shadow-sm">
            <View className="flex-row items-center flex-1">
                {/* Giả sử bạn có avatarUrl trong request, nếu không dùng inviteeId để fetch */}
                <View className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    <Image source={{ uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.inviteeId}` }} className="w-full h-full" />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                        ID: {request.inviteeId.substring(0, 8)}...
                    </Text>
                    <Text className="text-[10px] text-slate-500 uppercase">{request.status}</Text>
                </View>
            </View>

            {request.status === 'PENDING' && canManage && (
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={handleApprove}
                        disabled={approving || rejecting}
                        className="bg-sky-500 px-3 py-2 rounded-xl"
                    >
                        <Text className="text-white text-xs font-bold">Duyệt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleReject}
                        disabled={approving || rejecting}
                        className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl"
                    >
                        <Text className="text-slate-600 dark:text-slate-400 text-xs font-bold">Bỏ</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};