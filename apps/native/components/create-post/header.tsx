import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useCreatePostContext } from './context';
import type { CreatePostView } from './types';

type HeaderProps = {
  onClose: () => void;
  view: CreatePostView;
};

export function Header({ onClose, view }: HeaderProps) {
  const { submit, isPending, isSubmitDisabled, closeAudienceSelector } =
    useCreatePostContext();

  const handleSubmit = React.useCallback(async () => {
    if (isSubmitDisabled) {
      return;
    }

    const success = await submit();

    if (success) {
      onClose();
    }
  }, [isSubmitDisabled, onClose, submit]);

  return (
    <View className="min-h-14 flex-row items-center justify-between border-b border-app-border px-3 py-2.5 dark:border-app-border-dark">
      <Pressable
        onPress={view === 'audience' ? closeAudienceSelector : onClose}
        accessibilityRole="button"
        accessibilityLabel={
          view === 'audience' ? 'Quay lại' : 'Đóng trình soạn bài'
        }
        className="h-10 w-10 items-center justify-center rounded-full bg-app-surface-elevated active:opacity-70 dark:bg-app-surface-elevated-dark"
      >
        <Ionicons
          name={view === 'audience' ? 'chevron-back' : 'close'}
          size={20}
          color="#64748b"
        />
      </Pressable>

      <View className="min-w-0 flex-1 items-center px-2">
        <Text className="text-[16px] font-semibold text-app-fg dark:text-app-fg-dark">
          {view === 'audience' ? 'Đối tượng xem' : 'Tạo bài viết'}
        </Text>
      </View>

      {view === 'composer' ? (
        <Pressable
          onPress={() => {
            void handleSubmit();
          }}
          disabled={isSubmitDisabled}
          accessibilityRole="button"
          accessibilityLabel="Đăng bài"
          className={`min-w-20 items-center rounded-full px-3.5 py-2.5 ${
            isSubmitDisabled
              ? 'bg-slate-200 dark:bg-slate-700'
              : 'bg-app-primary dark:bg-app-primary-dark'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              isSubmitDisabled
                ? 'text-slate-500 dark:text-slate-300'
                : 'text-white'
            }`}
          >
            {isPending ? 'Đang đăng' : 'Đăng'}
          </Text>
        </Pressable>
      ) : (
        <View className="h-11 w-11" />
      )}
    </View>
  );
}
