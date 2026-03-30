import { Ionicons } from '@expo/vector-icons';
import { Button } from 'heroui-native/button';
import React from 'react';
import { TextInput, View } from 'react-native';

import { cn } from '~/lib/cn';

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatComposer({
  value,
  onChange,
  onSend,
  disabled = false,
}: ChatComposerProps) {
  const isSendDisabled = disabled || value.trim().length === 0;

  return (
    <View className="border-t border-app-border bg-app-surface px-4 pb-6 pt-3 dark:border-app-border-dark dark:bg-app-surface-dark">
      <View className="flex-row items-end gap-3">
        <View className="flex-1 rounded-[28px] bg-app-surface-elevated px-4 py-3 dark:bg-app-surface-elevated-dark">
          <TextInput
            multiline
            maxLength={1500}
            placeholder="Nhap tin nhan..."
            placeholderTextColor="#6b8aa1"
            value={value}
            onChangeText={onChange}
            editable={!disabled}
            className={cn(
              'min-h-6 text-[15px] leading-5 text-app-fg dark:text-app-fg-dark',
              disabled ? 'opacity-60' : '',
            )}
          />
        </View>

        <Button
          variant={isSendDisabled ? 'secondary' : 'primary'}
          className={cn('h-12 w-12 min-h-12 rounded-full px-0', isSendDisabled ? 'opacity-70' : '')}
          isDisabled={isSendDisabled}
          onPress={onSend}
        >
          <Ionicons
            name="paper-plane"
            size={18}
            color={isSendDisabled ? '#6b8aa1' : '#ffffff'}
          />
        </Button>
      </View>
    </View>
  );
}
