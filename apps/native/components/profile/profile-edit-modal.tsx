import { Button } from 'heroui-native/button';
import React from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, Pressable } from 'react-native';

import { NativeUploadFileDescriptor, INTEREST_OPTIONS } from '@repo/shared';

import { AppModal } from '~/components/ui/app-modal';
import { ImageSourceActions } from '~/components/ui/image-source-actions';
import { useSingleImageSourcePicker } from '~/lib/use-single-image-source-picker';

export type ProfileEditFormValues = {
  firstName: string;
  lastName: string;
  bio: string;
  location?: string;
  jobTitle?: string;
  company?: string;
  school?: string;
  interests?: string[];
  avatarFile: NativeUploadFileDescriptor | null;
  coverFile: NativeUploadFileDescriptor | null;
};

type ProfileEditModalProps = {
  visible: boolean;
  defaultFirstName: string;
  defaultLastName: string;
  defaultBio: string;
  defaultLocation?: string;
  defaultJobTitle?: string;
  defaultCompany?: string;
  defaultSchool?: string;
  defaultInterests?: string[];
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
  defaultLocation = '',
  defaultJobTitle = '',
  defaultCompany = '',
  defaultSchool = '',
  defaultInterests = [],
  defaultAvatarUrl,
  defaultCoverUrl,
  isSaving,
  onClose,
  onSave,
}: ProfileEditModalProps) {
  const [firstName, setFirstName] = React.useState(defaultFirstName || '');
  const [lastName, setLastName] = React.useState(defaultLastName || '');
  const [bio, setBio] = React.useState(defaultBio || '');
  const [location, setLocation] = React.useState(defaultLocation || '');
  const [jobTitle, setJobTitle] = React.useState(defaultJobTitle || '');
  const [company, setCompany] = React.useState(defaultCompany || '');
  const [school, setSchool] = React.useState(defaultSchool || '');
  const [interests, setInterests] = React.useState<string[]>(defaultInterests || []);
  
  const [customInterest, setCustomInterest] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isAvatarSheetOpen, setIsAvatarSheetOpen] = React.useState(false);
  const [isCoverSheetOpen, setIsCoverSheetOpen] = React.useState(false);

  const lastNameRef = React.useRef<TextInput>(null);
  const bioRef = React.useRef<TextInput>(null);

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

  const [prevVisible, setPrevVisible] = React.useState(visible);

  if (visible && !prevVisible) {
    setFirstName(defaultFirstName || '');
    setLastName(defaultLastName || '');
    setBio(defaultBio || '');
    setLocation(defaultLocation || '');
    setJobTitle(defaultJobTitle || '');
    setCompany(defaultCompany || '');
    setSchool(defaultSchool || '');
    setInterests(defaultInterests || []);
    setCustomInterest('');
    setErrorMessage(null);
    setPrevVisible(true);
  } else if (!visible && prevVisible) {
    setPrevVisible(false);
  }

  React.useEffect(() => {
    if (visible) {
      avatarPicker.clearImage();
      coverPicker.clearImage();
    }
  }, [visible, avatarPicker.clearImage, coverPicker.clearImage]);

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
      location: location.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      company: company.trim() || undefined,
      school: school.trim() || undefined,
      interests: interests.length > 0 ? interests : undefined,
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
    location,
    jobTitle,
    company,
    school,
    interests,
    onSave,
  ]);

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests((prev) => prev.filter((i) => i !== interest));
    } else {
      if (interests.length >= 10) {
        setErrorMessage('Tối đa 10 sở thích.');
        return;
      }
      setInterests((prev) => [...prev, interest]);
    }
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (!trimmed) return;
    if (interests.includes(trimmed)) {
      setCustomInterest('');
      return;
    }
    if (interests.length >= 10) {
      setErrorMessage('Tối đa 10 sở thích.');
      return;
    }
    setInterests((prev) => [...prev, trimmed]);
    setCustomInterest('');
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Chỉnh sửa hồ sơ"
      dismissible={!isSaving}
      contentClassName="max-h-[92%]"
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-6"
      >
        <View className="gap-4">
          <View className="items-center">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Ảnh đại diện
          </Text>
          <TouchableOpacity
            onPress={() => setIsAvatarSheetOpen(true)}
            activeOpacity={0.9}
            className="relative"
          >
            <Image
              source={{ uri: avatarPreview }}
              className="h-24 w-24 rounded-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 items-center justify-center rounded-full bg-black/30">
              <Text className="text-xs font-semibold text-white">Đổi ảnh</Text>
            </View>
          </TouchableOpacity>
          <View className="mt-2">
            {avatarPicker.selectedImage ? (
              <Button
                variant="ghost"
                className="min-h-10 rounded-full px-4"
                onPress={avatarPicker.clearImage}
              >
                Xóa ảnh
              </Button>
            ) : null}
            <ImageSourceActions
              visible={isAvatarSheetOpen}
              onClose={() => setIsAvatarSheetOpen(false)}
              onPick={(source) => {
                void avatarPicker.pickImage(source);
              }}
              libraryLabel="Chọn ảnh từ thư viện"
              cameraLabel="Chụp ảnh đại diện"
            />
          </View>
        </View>

        <View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Ảnh bìa
          </Text>
          <TouchableOpacity
            onPress={() => setIsCoverSheetOpen(true)}
            activeOpacity={0.9}
            className="overflow-hidden rounded-xl"
          >
            <Image
              source={{ uri: coverPreview }}
              className="h-28 w-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 items-center justify-center bg-black/25">
              <Text className="text-sm font-semibold text-white">
                Đổi ảnh bìa
              </Text>
            </View>
          </TouchableOpacity>
          <View className="mt-2">
            {coverPicker.selectedImage ? (
              <Button
                variant="ghost"
                className="min-h-10 rounded-full px-4"
                onPress={coverPicker.clearImage}
              >
                Xóa ảnh
              </Button>
            ) : null}
            <ImageSourceActions
              visible={isCoverSheetOpen}
              onClose={() => setIsCoverSheetOpen(false)}
              onPick={(source) => {
                void coverPicker.pickImage(source);
              }}
              libraryLabel="Chọn ảnh bìa từ thư viện"
              cameraLabel="Chụp ảnh bìa"
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
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Họ
          </Text>
          <TextInput
            ref={lastNameRef}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nhập họ"
            autoCapitalize="words"
            className="min-h-11 rounded-xl border border-app-border bg-app-surface px-3 text-[15px] text-app-fg dark:border-app-border-dark dark:bg-app-surface-dark dark:text-app-fg-dark"
            returnKeyType="next"
            onSubmitEditing={() => bioRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Tiểu sử
          </Text>
          <TextInput
            ref={bioRef}
            value={bio}
            onChangeText={setBio}
            placeholder="Giới thiệu ngắn về bạn"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={240}
            className="min-h-24 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-[15px] text-app-fg dark:border-app-border-dark dark:bg-app-surface-dark dark:text-app-fg-dark"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          <Text className="mt-1 text-right text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
            {(bio || '').trim().length}/240
          </Text>
        </View>

        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Địa điểm
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Nơi bạn đang sống"
            className="min-h-11 rounded-xl border border-app-border bg-app-surface px-3 text-[15px] text-app-fg dark:border-app-border-dark dark:bg-app-surface-dark dark:text-app-fg-dark"
          />
        </View>

        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Công việc
          </Text>
          <TextInput
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder="Chức danh, ví dụ: Software Engineer"
            className="min-h-11 rounded-xl border border-app-border bg-app-surface px-3 text-[15px] text-app-fg dark:border-app-border-dark dark:bg-app-surface-dark dark:text-app-fg-dark"
          />
        </View>

        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Nơi làm việc
          </Text>
          <TextInput
            value={company}
            onChangeText={setCompany}
            placeholder="Công ty của bạn"
            className="min-h-11 rounded-xl border border-app-border bg-app-surface px-3 text-[15px] text-app-fg dark:border-app-border-dark dark:bg-app-surface-dark dark:text-app-fg-dark"
          />
        </View>

        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Trường học
          </Text>
          <TextInput
            value={school}
            onChangeText={setSchool}
            placeholder="Trường bạn đã / đang học"
            className="min-h-11 rounded-xl border border-app-border bg-app-surface px-3 text-[15px] text-app-fg dark:border-app-border-dark dark:bg-app-surface-dark dark:text-app-fg-dark"
          />
        </View>

        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-app-muted-fg dark:text-app-muted-fg-dark">
            Sở thích ({interests.length}/10)
          </Text>
          <View className="mb-3 flex-row flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = interests.includes(interest);
              return (
                <Pressable
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  className={`rounded-full border px-3 py-1.5 ${
                    isSelected
                      ? 'border-app-primary bg-app-primary/10 dark:bg-app-primary-dark/20'
                      : 'border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isSelected
                        ? 'font-bold text-app-primary dark:text-app-primary-dark'
                        : 'text-app-fg dark:text-app-fg-dark'
                    }`}
                  >
                    {interest}
                  </Text>
                </Pressable>
              );
            })}
            
            {/* Custom interests that are not in the predefined list */}
            {interests
              .filter((i) => !INTEREST_OPTIONS.includes(i as any))
              .map((interest) => (
                <Pressable
                  key={`custom-${interest}`}
                  onPress={() => toggleInterest(interest)}
                  className="rounded-full border border-app-primary bg-app-primary/10 px-3 py-1.5 dark:bg-app-primary-dark/20"
                >
                  <Text className="text-sm font-bold text-app-primary dark:text-app-primary-dark">
                    {interest} ✕
                  </Text>
                </Pressable>
              ))}
          </View>
          <View className="flex-row gap-2">
            <TextInput
              value={customInterest}
              onChangeText={setCustomInterest}
              placeholder="Thêm sở thích khác..."
              className="min-h-11 flex-1 rounded-xl border border-app-border bg-app-surface px-3 text-[15px] text-app-fg dark:border-app-border-dark dark:bg-app-surface-dark dark:text-app-fg-dark"
              onSubmitEditing={addCustomInterest}
              blurOnSubmit={false}
              returnKeyType="done"
            />
            <Button
              variant="outline"
              className="h-11 rounded-xl px-4"
              onPress={addCustomInterest}
              isDisabled={!customInterest.trim() || interests.length >= 10}
            >
              Thêm
            </Button>
          </View>
        </View>

        {errorMessage ? (
          <Text className="text-sm text-red-500">{errorMessage}</Text>
        ) : null}
        </View>
      </ScrollView>
    </AppModal>
  );
}
