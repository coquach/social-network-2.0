import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { AppInlineLoading } from '~/components/ui/app-loading';
import { Ionicons } from '@expo/vector-icons';

import { useAcceptGroupInvite, useDeclineGroupInvite } from '@repo/shared/hooks';
import { InvitedGroupDTO } from '@repo/shared/types';

interface InvitedGroupCardProps {
  group: InvitedGroupDTO;
}

export const InvitedGroupCard = ({ group }: InvitedGroupCardProps) => {
  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptGroupInvite();
  const { mutate: declineInvite, isPending: isDeclining } = useDeclineGroupInvite();

  const inviterNames = group.inviterNames?.filter(Boolean) ?? [];
  const maxVisible = 2;
  const visibleInviters = inviterNames.slice(0, maxVisible);
  const remainingCount = inviterNames.length - visibleInviters.length;

  return (
    <View className="mb-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <View className="flex-row items-center gap-3">
        <Image source={{ uri: group.avatarUrl }} className="h-14 w-14 rounded-2xl bg-slate-100" />
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900 dark:text-white" numberOfLines={1}>
            {group.name}
          </Text>
          <Text className="mt-0.5 text-xs text-slate-500">
            {group.members} thành viên • {group.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap items-center gap-1.5">
        <Text className="text-[11px] font-medium text-slate-500">Được mời bởi:</Text>
        {inviterNames.length > 0 ? (
          <>
            {visibleInviters.map((name, index) => (
              <View key={`${name}-${index}`} className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                <Text className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{name}</Text>
              </View>
            ))}
            {remainingCount > 0 ? (
              <View className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                <Text className="text-[10px] font-bold text-slate-600 dark:text-slate-300">+{remainingCount}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <Text className="text-[11px] italic text-slate-400">Không rõ</Text>
        )}
      </View>

      <View className="mt-4 flex-row gap-2">
        <TouchableOpacity
          onPress={() => acceptInvite(group.id)}
          disabled={isAccepting || isDeclining}
          className="h-10 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-sky-500"
        >
          {isAccepting ? (
            <AppInlineLoading label="Đang xử lý..." />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color="white" />
              <Text className="text-sm font-bold text-white">Chấp nhận</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => declineInvite(group.id)}
          disabled={isAccepting || isDeclining}
          className="h-10 flex-1 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
        >
          {isDeclining ? (
            <AppInlineLoading label="Đang xử lý..." />
          ) : (
            <Text className="text-sm font-bold text-slate-600 dark:text-slate-300">Từ chối</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};


