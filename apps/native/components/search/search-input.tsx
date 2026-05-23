import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
  Keyboard,
} from 'react-native';

import { cn } from '~/lib/cn';

type SearchInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
  loading?: boolean;
  onClear?: () => void;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  onSubmit,
  onFilterPress,
  placeholder = 'Tìm kiếm',
  loading = false,
  onClear,
  className = '',
}: SearchInputProps) {
  return (
    <View className={cn('w-full flex-row items-center gap-2', className)}>
      <View className="h-13 flex-1 flex-row items-center rounded-full border border-app-border bg-app-surface px-4 dark:border-app-border-dark dark:bg-app-surface-dark">
        <Ionicons name="search" size={18} color="#64748b" />

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#7d92a7"
          returnKeyType="search"
          onSubmitEditing={() => onSubmit?.()}
          className="ml-3 flex-1 text-[15px] text-app-fg dark:text-app-fg-dark"
          accessibilityLabel="Search"
        />

        {loading ? (
          <ActivityIndicator style={{ marginLeft: 8 }} size="small" />
        ) : value.length > 0 ? (
          <Pressable
            onPress={() => {
              onClear?.();
            }}
            accessibilityRole="button"
            className="ml-2 rounded-full p-1 active:opacity-60"
          >
            <Ionicons name="close-circle" size={18} color="#64748b" />
          </Pressable>
        ) : null}
      </View>

      {onFilterPress ? (
        <Pressable
          onPress={() => {
            Keyboard.dismiss();

            requestAnimationFrame(() => {
              onFilterPress();
            });
          }}
          className="h-10 w-10 items-center justify-center rounded-full border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark active:opacity-60"
          accessibilityRole="button"
          accessibilityLabel="Filter"
        >
          <Ionicons name="options" size={20} color="#64748b" />
        </Pressable>
      ) : null}
    </View>
  );
}

export default React.memo(SearchInput);
