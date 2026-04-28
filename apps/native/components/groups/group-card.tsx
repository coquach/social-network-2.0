import { GroupDTO, MembershipStatus, GroupPrivacy } from '@repo/shared/types';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface GroupCardProps {
    group: GroupDTO
}

export const GroupCard = ({ group }: GroupCardProps) => {
    const router = useRouter();

    const getStatusConfig = (status?: MembershipStatus) => {
        switch (status) {
            case MembershipStatus.MEMBER:
                return { label: 'Đã tham gia', color: 'bg-emerald-500/10 text-emerald-600', icon: 'checkmark-circle' };
            case MembershipStatus.PENDING_APPROVAL:
                return { label: 'Chờ duyệt', color: 'bg-amber-500/10 text-amber-600', icon: 'time' };
            default:
                return { label: 'Tham gia', color: 'bg-app-primary text-white', icon: 'add' };
        }
    }
    const statusConfig = getStatusConfig(group.membershipStatus);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`(main)/groups/${group.id}`)}>

            <View className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden mb-4 border border-white shadow-sm">
                <View className="h-24 w-full bg-slate-100 dark:bg-slate-800">
                    {group.coverImageUrl && (
                        <Image
                            source={{ uri: group.coverImageUrl }}
                            className="h-full w-full"
                            resizeMode="cover"
                        />
                    )}
                </View>
                <View className="px-4 pb-4">
                    <View className="-mt-8 h-16 w-16 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                        <Image
                            source={{ uri: group.avatarUrl }}
                            className="h-full w-full"
                        />
                    </View>

                    <View className="mt-2 flex-row justify-between items-start">
                        <View className="flex-1 mr-2">
                            <Text className="text-xl font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                                {group.name}
                            </Text>

                            <View className="flex-row items-center mt-1 gap-2">
                                <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                    <Ionicons
                                        name={group.privacy === GroupPrivacy.PUBLIC ? "earth-outline" : "lock-closed-outline"}
                                        size={12}
                                        color="#64748b"
                                    />
                                    <Text className="text-[10px] ml-1 font-medium text-slate-500">
                                        {group.privacy === GroupPrivacy.PUBLIC ? "Công khai" : "Riêng tư"}
                                    </Text>
                                </View>

                                <Text className="text-xs text-slate-500">
                                    • {group.members} thành viên
                                </Text>
                            </View>
                        </View>

                        <View className={`px-4 py-2 rounded-xl flex-row items-center ${statusConfig.color}`}>
                            <Ionicons
                                name={statusConfig.icon as any}
                                size={16}
                                color={statusConfig.color.includes('text-white') ? '#fff' : '#16a34a'}
                            />
                            <Text className="ml-1 font-semibold text-xs">{statusConfig.label}</Text>
                        </View>
                    </View>

                    {group.description && (
                        <Text
                            className="mt-3 text-sm text-slate-500 dark:text-slate-400"
                            numberOfLines={2}
                        >
                            {group.description}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    )
}