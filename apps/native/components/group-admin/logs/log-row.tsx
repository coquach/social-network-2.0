import React from 'react';
import { Image, Text, View } from 'react-native';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { GroupLogDTO } from '@repo/shared/types';

export function LogRow({ log }: { log: GroupLogDTO }) {
  return (
    <View className="mb-4 flex-row items-start gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
        <Image
          source={{ uri: `https://api.dicebear.com/7.x/identicon/svg?seed=${log.userId}` }}
          className="h-full w-full rounded-full"
        />
      </View>

      <View className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="text-[10px] font-bold uppercase text-sky-600">
            {log.eventType.replace(/_/g, ' ')}
          </Text>
          <Text className="text-[9px] text-slate-400">
            {format(new Date(log.createdAt), 'HH:mm - dd/MM', { locale: vi })}
          </Text>
        </View>
        <Text className="text-sm leading-5 text-slate-700 dark:text-slate-300">{log.content}</Text>
      </View>
    </View>
  );
}
