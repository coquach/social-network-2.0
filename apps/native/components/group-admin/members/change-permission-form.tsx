import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GroupPermission } from '@repo/shared/types';
import { Ionicons } from '@expo/vector-icons';

export function ChangePermissionForm({ member, onClose, onSubmit }: any) {
  const [selected, setSelected] = useState<Set<GroupPermission>>(new Set(member.customPermissions || []));

  const permissions = Object.values(GroupPermission);

  const toggle = (perm: GroupPermission) => {
    const next = new Set(selected);
    if (next.has(perm)) {
      next.delete(perm);
    } else {
      next.add(perm);
    }
    setSelected(next);
  };

  return (
    <View className="flex-1 bg-white p-5 dark:bg-slate-950">
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">Quyền thành viên</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {permissions.map((perm) => (
          <TouchableOpacity
            key={perm}
            onPress={() => toggle(perm)}
            className="flex-row items-center justify-between border-b border-slate-50 py-4 dark:border-slate-800"
          >
            <View>
              <Text className="text-sm font-bold text-slate-800 dark:text-slate-200">{perm.replace(/_/g, ' ')}</Text>
              <Text className="mt-1 text-[10px] text-slate-400">{perm}</Text>
            </View>
            <Ionicons
              name={selected.has(perm) ? 'checkbox' : 'square-outline'}
              size={24}
              color={selected.has(perm) ? '#0ea5e9' : '#cbd5e1'}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={() => onSubmit(Array.from(selected))}
        className="mb-6 mt-4 h-14 items-center justify-center rounded-2xl bg-sky-500"
      >
        <Text className="text-lg font-bold text-white">Lưu thay đổi</Text>
      </TouchableOpacity>
    </View>
  );
}
