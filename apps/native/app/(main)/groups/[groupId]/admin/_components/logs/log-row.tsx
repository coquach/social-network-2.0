import React from 'react';
import { View, Text, Image } from 'react-native';
import { GroupLogDTO } from '@repo/shared/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const LogRow = ({ log }: { log: GroupLogDTO }) => {
    const formatLogDate = (dateStr: any) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'N/A';
            return format(date, 'HH:mm - dd/MM', { locale: vi });
        } catch (e) {
            return 'N/A';
        }
    };

    return (
        <View className="flex-row items-start mb-4 gap-3">
            <View className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 items-center justify-center">
                <Image
                    source={{ uri: `https://api.dicebear.com/7.x/identicon/svg?seed=${log.userId || 'unknown'}` }}
                    className="w-full h-full rounded-full"
                />
            </View>

            <View className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-[10px] font-bold text-sky-600 uppercase">
                        {(log.eventType || 'UNKNOWN_EVENT').replace(/_/g, ' ')}
                    </Text>
                    <Text className="text-[9px] text-slate-400">
                        {formatLogDate(log.createdAt)}
                    </Text>
                </View>
                <Text className="text-sm text-slate-700 dark:text-slate-300 leading-5">
                    {log.content || 'Không có nội dung chi tiết'}
                </Text>
            </View>
        </View>
    );
};