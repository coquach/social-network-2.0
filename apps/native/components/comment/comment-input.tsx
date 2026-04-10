import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { RootType, useCreateComment } from '@repo/shared';

export type CommentInputRef = {
  focus: () => void;
  blur: () => void;
};

type CommentInputProps = {
  rootId: string;
  rootType: RootType;
  parentId?: string;
  placeholder?: string;
  onSubmitted?: () => void;
};

export const CommentInput = React.forwardRef<
  CommentInputRef,
  CommentInputProps
>(function CommentInput(
  {
    rootId,
    rootType,
    parentId,
    placeholder = 'Viết bình luận...',
    onSubmitted,
  },
  ref,
) {
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<TextInput>(null);

  const { mutateAsync, isPending } = useCreateComment();

  /** 🔥 expose method ra ngoài */
  React.useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    blur: () => {
      inputRef.current?.blur();
    },
  }));

  const onSubmit = React.useCallback(async () => {
    const content = value.trim();
    if (!content || isPending) {
      return;
    }

    await mutateAsync({
      rootId,
      rootType,
      parentId,
      content,
    });

    setValue('');
    onSubmitted?.();
  }, [isPending, mutateAsync, onSubmitted, parentId, rootId, rootType, value]);

  return (
    <View className="flex-row items-end gap-2 border-t border-app-border/70 bg-app-bg px-4 py-3 dark:border-app-border-dark/70 dark:bg-app-surface-dark">
      <TextInput
        ref={inputRef} // 👈 quan trọng
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor="#8aa3b7"
        multiline
        maxLength={500}
        className="max-h-28 min-h-11 flex-1 rounded-2xl border border-app-border bg-app-bg px-3 py-2.5 text-[14px] text-app-fg dark:border-app-border-dark dark:bg-app-bg-dark dark:text-app-fg-dark"
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void onSubmit();
        }}
        disabled={isPending || value.trim().length === 0}
        className="h-11 w-11 items-center justify-center rounded-full bg-app-primary active:opacity-80 disabled:opacity-40"
      >
        <Ionicons name="send" size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
});
