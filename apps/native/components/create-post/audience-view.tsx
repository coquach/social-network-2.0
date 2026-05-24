import { Ionicons } from '@expo/vector-icons';
import { Audience } from '@repo/shared';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useCreatePostContext } from './context';

const AUDIENCE_OPTIONS: Array<{
  value: Audience;
  label: string;
  icon: 'globe-outline' | 'people-outline' | 'lock-closed-outline';
}> = [
  { value: Audience.PUBLIC, label: 'Công khai', icon: 'globe-outline' },
  { value: Audience.FRIENDS, label: 'Bạn bè', icon: 'people-outline' },
  {
    value: Audience.ONLY_ME,
    label: 'Chỉ mình tôi',
    icon: 'lock-closed-outline',
  },
];

export function AudienceView() {
  const { audience, setAudience, closeAudienceSelector } =
    useCreatePostContext();

  return (
    <View className="flex-1 px-4 pt-3">
      <Text className="pb-3 text-[15px] font-semibold text-app-fg dark:text-app-fg-dark">
        Ai có thể xem bài viết của bạn?
      </Text>

      <View className="gap-2">
        {AUDIENCE_OPTIONS.map((option) => {
          const isSelected = option.value === audience;

          return (
            <Pressable
              key={option.value}
              onPress={() => {
                setAudience(option.value);
                closeAudienceSelector();
              }}
              className={`flex-row items-center justify-between rounded-2xl px-3 py-3.5 ${
                isSelected
                  ? 'bg-app-primary/12 dark:bg-app-primary-dark/18'
                  : 'bg-app-surface-elevated dark:bg-app-surface-elevated-dark'
              }`}
            >
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-slate-800">
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={isSelected ? '#0ea5e9' : '#64748b'}
                  />
                </View>

                <Text
                  className={
                    isSelected
                      ? 'text-[15px] font-semibold text-app-primary dark:text-app-primary-dark'
                      : 'text-[15px] font-medium text-app-fg dark:text-app-fg-dark'
                  }
                >
                  {option.label}
                </Text>
              </View>

              {isSelected ? (
                <Ionicons name="checkmark-circle" size={22} color="#0ea5e9" />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
