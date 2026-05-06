import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, TextInput, View } from 'react-native';

import { RootType, useCreateComment } from '@repo/shared';
import { useSingleImageSourcePicker } from '~/lib/use-single-image-source-picker';

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

  /** IMAGE PICKER */
  const { selectedImage, pickImage, clearImage } = useSingleImageSourcePicker({
    permissionAlert: {
      title: 'Quyền truy cập',
      cameraMessage: 'Cho phép dùng camera',
      libraryMessage: 'Cho phép truy cập thư viện',
    },
  });

  /** expose ref */
  React.useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    blur: () => {
      inputRef.current?.blur();
    },
  }));

  /** pick image */
  const onPickImage = React.useCallback(async () => {
    await pickImage('library');
  }, [pickImage]);

  /** submit */
  const onSubmit = React.useCallback(async () => {
    const content = value.trim();

    if ((!content && !selectedImage) || isPending) {
      return;
    }

    await mutateAsync({
      rootId,
      rootType,
      parentId,
      content,
      uploadFile: selectedImage?.uploadFile,
    });

    setValue('');
    clearImage();
    onSubmitted?.();
  }, [
    value,
    selectedImage,
    isPending,
    mutateAsync,
    rootId,
    rootType,
    parentId,
    clearImage,
    onSubmitted,
  ]);

  return (
    <View className="border-t border-app-border/70 bg-app-bg px-4 py-3 dark:border-app-border-dark/70 dark:bg-app-surface-dark">
      {/* PREVIEW IMAGE */}
      {selectedImage && (
        <View className="mb-2 relative">
          <Image
            source={{ uri: selectedImage.previewUri }}
            className="h-20 w-20 rounded-lg"
          />

          {/* remove image */}
          <Pressable
            onPress={clearImage}
            className="absolute -top-2 -right-2 rounded-full bg-black p-1"
          >
            <Ionicons name="close" size={14} color="white" />
          </Pressable>
        </View>
      )}

      {/* INPUT ROW */}
      <View className="flex-row items-end gap-2">
        {/* ADD MEDIA BUTTON */}
        <Pressable
          onPress={onPickImage}
          className="h-11 w-11 items-center justify-center rounded-full bg-app-surface-elevated active:opacity-80 dark:bg-app-surface-elevated-dark"
        >
          <Ionicons name="image-outline" size={20} />
        </Pressable>

        {/* TEXT INPUT */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#8aa3b7"
          multiline
          maxLength={500}
          className="max-h-28 min-h-11 flex-1 rounded-2xl border border-app-border bg-app-bg px-3 py-2.5 text-[14px] text-app-fg dark:border-app-border-dark dark:bg-app-bg-dark dark:text-app-fg-dark"
        />

        {/* SEND BUTTON */}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void onSubmit();
          }}
          disabled={isPending || (!value.trim() && !selectedImage)}
          className="h-11 w-11 items-center justify-center rounded-full bg-app-primary active:opacity-80 disabled:opacity-40"
        >
          <Ionicons name="send" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
});
