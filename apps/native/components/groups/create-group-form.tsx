import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppKeyboardScrollView } from '~/components/ui/app-keyboard-scroll-view';

import { useCreateGroup } from '@repo/shared/hooks';
import { CreateGroupInput, GroupPrivacy } from '@repo/shared/types';
import { AppAlert, type AppAlertVariant } from '~/components/ui/app-alert';

interface CreateGroupFormProps {
  onClose: () => void;
}

export const CreateGroupForm = ({ onClose }: CreateGroupFormProps) => {
  const insets = useSafeAreaInsets();
  const { mutate: createGroup, isPending } = useCreateGroup();
  const [formAlert, setFormAlert] = useState<{
    title: string;
    description?: string;
    variant: AppAlertVariant;
  } | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const descriptionRef = React.useRef<TextInput>(null);
  const rulesRef = React.useRef<TextInput>(null);

  const { control, handleSubmit, setValue } = useForm<CreateGroupInput>({
    defaultValues: {
      name: '',
      description: '',
      privacy: GroupPrivacy.PUBLIC,
      rules: '',
    },
  });

  const handlePickImage = async (type: 'avatar' | 'coverImage') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const fileData = {
        uri,
        type: 'image/jpeg',
        name: type === 'avatar' ? 'avatar.jpg' : 'cover.jpg',
      };

      if (type === 'avatar') {
        setAvatarPreview(uri);
        (setValue as any)('uploadAvatar', fileData);
      } else {
        setCoverPreview(uri);
        (setValue as any)('uploadCover', fileData);
      }
    }
  };

  const onSubmit = (data: CreateGroupInput) => {
    if (!data.name) {
      setFormAlert({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập tên nhóm.',
        variant: 'warning',
      });
      return;
    }

    createGroup(data, {
      onSuccess: () => {
        setFormAlert({
          title: 'Tạo nhóm thành công',
          description: 'Nhóm của bạn đã được tạo.',
          variant: 'success',
        });
        onClose();
      },
      onError: (error) => {
        setFormAlert({
          title: 'Không thể tạo nhóm',
          description: error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
          variant: 'danger',
        });
      },
    });
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <View
        className="flex-row items-center justify-between border-b border-slate-100 px-5 pb-4 dark:border-slate-800"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={26} color="#64748b" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-slate-900 dark:text-white">Tạo nhóm mới</Text>

        <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isPending}>
          <Text className={`font-bold ${isPending ? 'text-slate-300' : 'text-sky-500'}`}>Tạo</Text>
        </TouchableOpacity>
      </View>

      <AppKeyboardScrollView>
        <View className="gap-6 p-5">
          {formAlert ? (
            <AppAlert
              title={formAlert.title}
              description={formAlert.description}
              variant={formAlert.variant}
              onClose={() => setFormAlert(null)}
            />
          ) : null}

          <View className="mb-2">
            <Text className="text-sm leading-5 text-slate-500 dark:text-slate-400">
              Tạo một cộng đồng mới để kết nối mọi người, chia sẻ nội dung và tương tác trong hệ thống SE-CV.
            </Text>
          </View>

          <View className="flex-row items-end gap-4">
            <View className="gap-2">
              <Text className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">Ảnh đại diện</Text>
              <TouchableOpacity
                onPress={() => handlePickImage('avatar')}
                className="h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              >
                {avatarPreview ? (
                  <Image source={{ uri: avatarPreview }} className="h-full w-full" />
                ) : (
                  <Ionicons name="camera-outline" size={28} color="#94a3b8" />
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-1 gap-2">
              <Text className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">Ảnh bìa nhóm</Text>
              <TouchableOpacity
                onPress={() => handlePickImage('coverImage')}
                className="h-24 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              >
                {coverPreview ? (
                  <Image source={{ uri: coverPreview }} className="h-full w-full" />
                ) : (
                  <Ionicons name="image-outline" size={28} color="#94a3b8" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="gap-2">
            <View className="flex-row">
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-300">Tên nhóm</Text>
              <Text className="ml-1 text-red-500">*</Text>
            </View>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Ví dụ: Lập trình .NET & NestJS UIT"
                  placeholderTextColor="#94a3b8"
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  value={value}
                  onChangeText={onChange}
                  returnKeyType="next"
                  onSubmitEditing={() => descriptionRef.current?.focus()}
                  blurOnSubmit={false}
                />
              )}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300">Mô tả nhóm</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  ref={descriptionRef}
                  placeholder="Giới thiệu ngắn gọn về mục đích của nhóm..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="h-28 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  value={value}
                  onChangeText={onChange}
                  returnKeyType="next"
                  onSubmitEditing={() => rulesRef.current?.focus()}
                  blurOnSubmit={false}
                />
              )}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300">Chế độ riêng tư</Text>
            <Controller
              control={control}
              name="privacy"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row gap-2">
                  {[
                    { label: 'Công khai', val: GroupPrivacy.PUBLIC, icon: 'earth-outline' },
                    { label: 'Riêng tư', val: GroupPrivacy.PRIVATE, icon: 'lock-closed-outline' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.val}
                      onPress={() => onChange(item.val)}
                      className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border p-4 ${
                        value === item.val
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10'
                          : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={18}
                        color={value === item.val ? '#0ea5e9' : '#94a3b8'}
                      />
                      <Text className={`font-bold ${value === item.val ? 'text-sky-600' : 'text-slate-500'}`}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300">Nội quy (Tùy chọn)</Text>
            <Controller
              control={control}
              name="rules"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  ref={rulesRef}
                  placeholder="Ví dụ: Không spam, tôn trọng các thành viên..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  className="h-24 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  value={value}
                  onChangeText={onChange}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
          </View>

          <View className="mb-12 mt-4 flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="h-14 flex-1 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800"
            >
              <Text className="font-bold text-slate-600 dark:text-slate-400">Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
              className={`h-14 flex-[2] items-center justify-center rounded-2xl ${
                isPending ? 'bg-sky-300' : 'bg-sky-500 shadow-md shadow-sky-200'
              }`}
            >
              <Text className="text-lg font-bold text-white">{isPending ? 'Đang tạo nhóm...' : 'Xác nhận tạo'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppKeyboardScrollView>
    </View>
  );
};
