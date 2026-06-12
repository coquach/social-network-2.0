import { Ionicons } from '@expo/vector-icons';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@repo/shared';
import { Switch } from 'heroui-native/switch';
import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';

import { AppBottomSheet } from '~/components/ui/app-bottom-sheet';
import { SecondaryButton } from '~/components/ui/app-button';

type ChatSettingsSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function ChatSettingsSheet({ visible, onClose }: ChatSettingsSheetProps) {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const { mutate: updatePrefs, isPending } = useUpdateNotificationPreferences();

  const handleToggle = (key: string, value: boolean) => {
    updatePrefs({
      settings: {
        [key]: value,
      },
    });
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Cài đặt thông báo Chat"
      description="Tuỳ chỉnh nhanh thông báo cho tin nhắn cá nhân và tin nhắn nhóm."
      titleClassName="text-center"
      descriptionClassName="text-center"
      bodyClassName="mt-4"
      footer={
        <View className="flex-row gap-3">
          <SecondaryButton
            label="Đóng"
            className="flex-1"
            onPress={onClose}
          />
        </View>
      }
    >
      <View className="w-full gap-4 pb-2">
        {isLoading ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="small" color="#0ea5e9" />
          </View>
        ) : (
          <View className="rounded-2xl border border-app-border dark:border-app-border-dark bg-app-surface-elevated dark:bg-app-surface-elevated-dark overflow-hidden">
            <SettingItem
              icon="chatbubble-ellipses-outline"
              title="Tin nhắn cá nhân"
              description="Nhận thông báo khi có tin nhắn mới từ bạn bè."
              value={prefs?.settings?.pushMessages ?? true}
              onValueChange={(val) => handleToggle('pushMessages', val)}
              disabled={isPending}
            />
            <View className="h-[1px] bg-app-border dark:bg-app-border-dark mx-4" />
            <SettingItem
              icon="people-outline"
              title="Tin nhắn nhóm"
              description="Nhận thông báo từ các nhóm chat."
              value={prefs?.settings?.pushGroupMessages ?? true}
              onValueChange={(val) => handleToggle('pushGroupMessages', val)}
              disabled={isPending}
            />
          </View>
        )}
      </View>
    </AppBottomSheet>
  );
}

function SettingItem({
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled
}: {
  icon: any;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between p-4">
      <View className="flex-row items-center flex-1 pr-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 dark:bg-sky-400/10 mr-3">
          <Ionicons name={icon} size={20} color="#0ea5e9" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">
            {title}
          </Text>
          <Text className="text-[13px] text-app-muted-fg dark:text-app-muted-fg-dark mt-0.5">
            {description}
          </Text>
        </View>
      </View>
      <Switch
        isSelected={value}
        onSelectedChange={onValueChange}
        isDisabled={disabled}
      />
    </View>
  );
}
