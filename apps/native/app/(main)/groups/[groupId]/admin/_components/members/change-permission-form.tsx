import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { GroupPermission } from '@repo/shared/types';
import { Ionicons } from '@expo/vector-icons';

export const ChangePermissionForm = ({ member, onClose, onSubmit }: any) => {
    const [selected, setSelected] = useState<Set<GroupPermission>>(new Set(member.customPermissions || []));

    const permissions = Object.values(GroupPermission);

    const toggle = (perm: GroupPermission) => {
        const next = new Set(selected);
        if (next.has(perm)) next.delete(perm);
        else next.add(perm);
        setSelected(next);
    };

    return (
        <View className="flex-1 bg-white dark:bg-slate-950 p-5">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold dark:text-white">Quyền thành viên</Text>
                <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#64748b" /></TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {permissions.map((perm) => (
                    <TouchableOpacity
                        key={perm}
                        onPress={() => toggle(perm)}
                        className="flex-row items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800"
                    >
                        <View>
                            <Text className="font-bold text-slate-800 dark:text-slate-200 text-sm">{perm.replace(/_/g, ' ')}</Text>
                            <Text className="text-[10px] text-slate-400 mt-1">{perm}</Text>
                        </View>
                        <Ionicons
                            name={selected.has(perm) ? "checkbox" : "square-outline"}
                            size={24}
                            color={selected.has(perm) ? "#0ea5e9" : "#cbd5e1"}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
                onPress={() => onSubmit(Array.from(selected))}
                className="bg-sky-500 h-14 rounded-2xl items-center justify-center mt-4 mb-6"
            >
                <Text className="text-white font-bold text-lg">Lưu thay đổi</Text>
            </TouchableOpacity>
        </View>
    );
};