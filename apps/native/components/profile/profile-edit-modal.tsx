import { Button } from 'heroui-native/button';
import React from 'react';
import { Image, Text, TextInput, View } from 'react-native';

import type { NativeUploadFileDescriptor } from '@repo/shared';

import { AppModal } from '~/components/ui/app-modal';
import { ImageSourceActions } from '~/components/ui/image-source-actions';
import { useSingleImageSourcePicker } from '~/lib/use-single-image-source-picker';

export type ProfileEditFormValues = {
  firstName: string;
  lastName: string;
  bio: string;
  avatarFile: NativeUploadFileDescriptor | null;
  coverFile: NativeUploadFileDescriptor | null;
};

type ProfileEditModalProps = {
  visible: boolean;
  defaultFirstName: string;
  defaultLastName: string;
  defaultBio: string;
  defaultAvatarUrl: string;
  defaultCoverUrl: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: ProfileEditFormValues) => void;
};

export function ProfileEditModal({
  visible,
  defaultFirstName,
  defaultLastName,
  defaultBio,
  defaultAvatarUrl,
  defaultCoverUrl,
  isSaving,
  onClose,
  onSave,
}: ProfileEditModalProps) {
  const [firstName, setFirstName] = React.useState(defaultFirstName);
  const [lastName, setLastName] = React.useState(defaultLastName);
  const [bio, setBio] = React.useState(defaultBio);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const avatarPicker = useSingleImageSourcePicker({
    permissionAlert: {
      title: 'Cần quyền truy cập',
      cameraMessage: 'Vui lòng cho phép truy cập camera để chụp ảnh đại diện.',
      libraryMessage: 'Vui lòng cho phép truy cập thư viện để chọn ảnh đại diện.',
    },
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.9,
    fileNamePrefix: 'avatar',
  });

  const coverPicker = useSingleImageSourcePicker({
    permissionAlert: {
      title: 'Cần quyền truy cập',
      cameraMessage: 'Vui lòng cho phép truy cập camera để chụp ảnh bìa.',
      libraryMessage: 'Vui lòng cho phép truy cập thư viện để chọn ảnh bìa.',
    },
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.9,
    fileNamePrefix: 'cover',
  });

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    setFirstName(defaultFirstName);
    setLastName(defaultLastName);
    setBio(defaultBio);
    avatarPicker.clearImage();
    coverPicker.clearImage();
    setErrorMessage(null);
  }, [
    avatarPicker,
    coverPicker,
    defaultBio,
    defaultFirstName,
    defaultLastName,
    visible,
  ]);

  const avatarPreview = avatarPicker.selectedImage?.previewUri ?? defaultAvatarUrl;
  const coverPreview = coverPicker.selectedImage?.previewUri ?? defaultCoverUrl;

  const handleSave = React.useCallback(() => {
    const nextFirstName = firstName.trim();
    const nextLastName = lastName.trim();
    const nextBio = bio.trim();

    if (!nextFirstName || !nextLastName) {
      setErrorMessage('Họ và tên là bắt buộc.');
      return;
    }

    if (nextBio.length > 240) {
      setErrorMessage('Tiểu sử tối đa 240 ký tự.');
      return;
    }

    setErrorMessage(null);
    onSave({
      firstName: nextFirstName,
      lastName: nextLastName,
      bio: nextBio,
      avatarFile:
        (avatarPicker.selectedImage?.uploadFile.file as NativeUploadFileDescriptor | undefined) ??
        null,
      coverFile:
        (coverPicker.selectedImage?.uploadFile.file as NativeUploadFileDescriptor | undefined) ??
        null,
    });
  }, [
    avatarPicker.selectedImage,
    bio,
    coverPicker.selectedImage,
    firstName,
    lastName,
    onSave,
  ]);

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Chỉnh sửa hồ sơ"
      description="Cập nhật thông tin cá nhân, ảnh đại diện và ảnh bìa."
      dismissible={!isSaving}
      footer={
        <View className="gap-2">
          <Button
            variant="primary"
            className="min-h-11 rounded-xl"
            onPress={handleSave}
            isDisabled={isSaving}
          >
            Lưu thay đổi
          </Button>
          <Button
            variant="outline"
            className="min-h-11 rounded-xl"
            onPress={onClose}
            isDisabled={isSaving}
          >
            Hủy
          </Button>
        </View>
      }
    >
      <View className="gap-4">
        <View className="items-center">
          <View className="relative">
            <Image source={{ uri: avatarPreview }} className="h-24 w-24 rounded-full" resizeMode="cover" />
            <View className="absolute inset-0 items-center justify-center rounded-full bg-black/30">
              <Text className="text-xs font-semibold text-white">Đổi ảnh</Text>
            </View>
          </View>
          <View className="mt-2">
            <ImageSourceActions
              onPick={(source) => {
                void avatarPicker.pickImage(source);
              }}
              onClear={avatarPicker.clearImage}
              showClear={Boolean(avatarPicker.selectedImage)}
              libraryLabel="Thư viện"
              cameraLabel="Chụp ảnh"
              clearLabel="Bỏ ảnh"
            />
          </View>
        </View>

        <View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Ảnh bìa
          </Text>
          <View className="overflow-hidden rounded-xl">
            <Image source={{ uri: coverPreview }} className="h-28 w-full" resizeMode="cover" />
            <View className="absolute inset-0 items-center justify-center bg-black/25">
              <Text className="text-sm font-semibold text-white">Đổi ảnh bìa</Text>
            </View>
          </View>
          <View className="mt-2">
            <ImageSourceActions
              onPick={(source) => {
                void coverPicker.pickImage(source);
              }}
              onClear={coverPicker.clearImage}
              showClear={Boolean(coverPicker.selectedImage)}
              libraryLabel="Thư viện"
              cameraLabel="Chụp ảnh"
              clearLabel="Bỏ ảnh"
            />
          </View>
        </View>

        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Tên
          </Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Nhập tên"
            autoCapitalize="words"
            className="min-h-11 rounded-xl border border-app-border bg-app-surface px-3 text-[15px] text-app-fg dark:border-app-border-dark dark:bg-app-surface-dark dark:text-app-fg-dark"
          />
        </View>

        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Họ
          </Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nhập họ"
            autoCapitalize="words"
            className="min-h-11 rounded-xl border border-app-border bg-app-surface px-3 text-[15px] text-app-fg dark:border-app-border-dark dark:bg-app-surface-dark dark:text-app-fg-dark"
          />
        </View>

        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Tiểu sử
          </Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Giới thiệu ngắn về bạn"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={240}
            className="min-h-24 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-[15px] text-app-fg dark:border-app-border-dark dark:bg-app-surface-dark dark:text-app-fg-dark"
          />
          <Text className="mt-1 text-right text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
            {bio.trim().length}/240
          </Text>
        </View>

        {errorMessage ? <Text className="text-sm text-red-500">{errorMessage}</Text> : null}
      </View>
    </AppModal>
  );
}

