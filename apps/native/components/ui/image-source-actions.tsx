import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppBottomSheet } from '~/components/ui/app-bottom-sheet';

type ImageSourceActionsProps = {
  visible: boolean;
  onClose: () => void;
  onPick: (source: 'library' | 'camera') => void;
  libraryLabel?: string;
  cameraLabel?: string;
};

export function ImageSourceActions({
  visible,
  onClose,
  onPick,
  libraryLabel = 'Chọn từ thư viện',
  cameraLabel = 'Chụp ảnh',
}: ImageSourceActionsProps) {
  const handlePick = (source: 'library' | 'camera') => {
    onPick(source);
    onClose();
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Chọn nguồn ảnh"
      titleClassName='text-center'
      description="Bạn muốn lấy ảnh từ đâu?"
      descriptionClassName='text-center'
      bodyClassName="gap-2"
    >
      <Pressable
        onPress={() => handlePick('camera')}
        className="flex-row items-center gap-3 rounded-2xl bg-app-surface-elevated px-4 py-3 active:opacity-80 dark:bg-app-surface-elevated-dark"
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-sky-500/15">
          <Ionicons name="camera-outline" size={18} color="#0ea5e9" />
        </View>
        <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">{cameraLabel}</Text>
      </Pressable>

      <Pressable
        onPress={() => handlePick('library')}
        className="flex-row items-center gap-3 rounded-2xl bg-app-surface-elevated px-4 py-3 active:opacity-80 dark:bg-app-surface-elevated-dark"
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-sky-500/15">
          <Ionicons name="images-outline" size={18} color="#0ea5e9" />
        </View>
        <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">{libraryLabel}</Text>
      </Pressable>
    </AppBottomSheet>
  );
}
