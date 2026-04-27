import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InvitedGroupDTO } from '@repo/shared/types';
import { useAcceptGroupInvite, useDeclineGroupInvite } from '@repo/shared/hooks';

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
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3 shadow-sm">
            {/* 1. Group Info */}
            <View className="flex-row items-center gap-3">
                <Image
                    source={{ uri: group.avatarUrl }}
                    className="w-14 h-14 rounded-2xl bg-slate-100"
                />
                <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                        {group.name}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                        {group.members} thành viên • {group.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                    </Text>
                </View>
            </View>

            {/* 2. Inviter Section (Badges) */}
            <View className="mt-4 flex-row flex-wrap items-center gap-1.5">
                <Text className="text-[11px] text-slate-500 font-medium">Được mời bởi:</Text>
                {inviterNames.length > 0 ? (
                    <>
                        {visibleInviters.map((name, index) => (
                            <View
                                key={`${name}-${index}`}
                                className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg"
                            >
                                <Text className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{name}</Text>
                            </View>
                        ))}
                        {remainingCount > 0 && (
                            <View className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                <Text className="text-[10px] font-bold text-slate-600 dark:text-slate-300">+{remainingCount}</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <Text className="text-[11px] text-slate-400 italic">Không rõ</Text>
                )}
            </View>

            {/* 3. Action Buttons */}
            <View className="flex-row gap-2 mt-4">
                <TouchableOpacity
                    onPress={() => acceptInvite(group.id)}
                    disabled={isAccepting || isDeclining}
                    className="flex-1 bg-sky-500 h-10 rounded-xl items-center justify-center flex-row gap-2"
                >
                    {isAccepting ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                            <Text className="text-white font-bold text-sm">Chấp nhận</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => declineInvite(group.id)}
                    disabled={isAccepting || isDeclining}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 h-10 rounded-xl items-center justify-center"
                >
                    {isDeclining ? (
                        <ActivityIndicator size="small" color="#64748b" />
                    ) : (
                        <Text className="text-slate-600 dark:text-slate-300 font-bold text-sm">Từ chối</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};