import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { GroupDTO, GroupPrivacy, MembershipStatus } from '@repo/shared/types';

interface GroupCardProps {
  group: GroupDTO;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  const router = useRouter();

  const getStatusConfig = (status?: MembershipStatus) => {
    switch (status) {
      case MembershipStatus.MEMBER:
        return { label: 'Đã tham gia', color: '#16a34a', icon: 'checkmark-circle' as const };
      case MembershipStatus.PENDING_APPROVAL:
        return { label: 'Chờ duyệt', color: '#d97706', icon: 'time' as const };
      case MembershipStatus.INVITED:
        return { label: 'Được mời', color: '#0284c7', icon: 'mail' as const };
      default:
        return { label: 'Tham gia', color: '#0284c7', icon: 'add' as const };
    }
  };

  const statusConfig = getStatusConfig(group.membershipStatus);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => router.push(`/(main)/groups/${group.id}`)}>
      <View className="mb-4 overflow-hidden rounded-3xl border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark">
        <View className="h-24 w-full bg-slate-100 dark:bg-slate-800">
          {group.coverImageUrl ? (
            <Image source={{ uri: group.coverImageUrl }} className="h-full w-full" resizeMode="cover" />
          ) : null}
        </View>

        <View className="px-4 pb-4">
          <View className="-mt-8 h-16 w-16 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-sm dark:border-slate-900 dark:bg-slate-900">
            <Image source={{ uri: group.avatarUrl }} className="h-full w-full" />
          </View>

          <View className="mt-2 flex-row items-start justify-between">
            <View className="mr-2 flex-1">
              <Text className="text-xl font-bold text-app-fg dark:text-app-fg-dark" numberOfLines={1}>
                {group.name}
              </Text>

              <View className="mt-1 flex-row items-center gap-2">
                <View className="flex-row items-center rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                  <Ionicons
                    name={group.privacy === GroupPrivacy.PUBLIC ? 'earth-outline' : 'lock-closed-outline'}
                    size={12}
                    color="#64748b"
                  />
                  <Text className="ml-1 text-[10px] font-medium text-slate-500">
                    {group.privacy === GroupPrivacy.PUBLIC ? 'Công khai' : 'Riêng tư'}
                  </Text>
                </View>

                <Text className="text-xs text-slate-500">• {group.members} thành viên</Text>
              </View>
            </View>

            <View className="flex-row items-center rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
              <Text className="ml-1 text-xs font-semibold" style={{ color: statusConfig.color }}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {group.description ? (
            <Text className="mt-3 text-sm text-slate-500 dark:text-slate-400" numberOfLines={2}>
              {group.description}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
