import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppBottomSheet } from '~/components/ui/app-bottom-sheet';
import { PrimaryButton, SecondaryButton } from '~/components/ui/app-button';
import { AppCard } from '~/components/ui/app-card';
import { AppToast } from '~/components/ui/app-toast';
import { AppEyebrow, AppSubtitle } from '~/components/ui/app-text';

type CreatePostSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const CREATE_OPTIONS = [
  {
    key: 'post',
    icon: 'create-outline' as const,
    title: 'Viết bài mới',
    description: 'Chia sẻ suy nghĩ, trạng thái hoặc một câu chuyện ngắn.',
  },
  {
    key: 'media',
    icon: 'images-outline' as const,
    title: 'Ảnh hoặc video',
    description: 'Đăng album, reel ngắn hoặc khoảnh khắc trong ngày.',
  },
  {
    key: 'mood',
    icon: 'happy-outline' as const,
    title: 'Cảm xúc và hoạt động',
    description: 'Check-in tâm trạng, hoạt động hoặc địa điểm nổi bật.',
  },
];

export function CreatePostSheet({ visible, onClose }: CreatePostSheetProps) {
  const { toast } = useToast();

  const handleOptionPress = React.useCallback(
    (title: string) => {
      onClose();
      toast.show({
        duration: 2800,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: 'Composer đang được nối',
              message: `${title} sẽ được mở ở bước tiếp theo.`,
              variant: 'info',
            }}
            toastProps={toastProps}
          />
        ),
      });
    },
    [onClose, toast],
  );

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Tạo bài viết"
      description="Chọn kiểu nội dung bạn muốn đăng. Sheet này thay cho route create-post riêng."
      footer={
        <>
          <PrimaryButton
            label="Tạo nhanh"
            onPress={() => {
              handleOptionPress('Bài viết nhanh');
            }}
          />
          <SecondaryButton label="Đóng" onPress={onClose} />
        </>
      }
    >
      <View className="gap-3">
        <View className="gap-1">
          <AppEyebrow>Nội dung nổi bật</AppEyebrow>
          <AppSubtitle className="text-sm">
            Giữ luồng tạo nội dung ở cùng ngữ cảnh tab, không đẩy người dùng sang một màn
            riêng.
          </AppSubtitle>
        </View>

        {CREATE_OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            onPress={() => {
              handleOptionPress(option.title);
            }}
          >
            <AppCard className="rounded-[28px] p-0">
              <View className="flex-row items-center gap-4 p-4">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-app-primary/12 dark:bg-app-primary-dark/16">
                  <Ionicons name={option.icon} size={22} color="#0ea5e9" />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-base font-bold text-app-fg dark:text-app-fg-dark">
                    {option.title}
                  </Text>
                  <Text className="text-sm leading-5 text-app-muted-fg dark:text-app-muted-fg-dark">
                    {option.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </View>
            </AppCard>
          </Pressable>
        ))}
      </View>
    </AppBottomSheet>
  );
}
