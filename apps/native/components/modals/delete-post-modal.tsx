import { Ionicons } from '@expo/vector-icons';
import { useDeletePost, useDeletePostModal, useDeleteShare } from '@repo/shared';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { Text, View } from 'react-native';

import { AppModal } from '~/components/ui/app-modal';
import { AppToast } from '~/components/ui/app-toast';
import { PrimaryButton, OutlineButton } from '~/components/ui/app-button';

export function DeletePostModal() {
  const { isOpen, postId, isShare, shareId, closeModal } = useDeletePostModal();
  const { mutateAsync: deletePost, isPending: postPending } = useDeletePost();
  const { mutateAsync: deleteShare, isPending: sharePending } =
    useDeleteShare();
  const { toast } = useToast();

  const isPending = postPending || sharePending;

  const handleDelete = async () => {
    if (!postId) {
      toast.show({
        duration: 2500,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: 'Lỗi',
              message: 'Không xác định được bài viết cần xóa',
              variant: 'error',
            }}
            toastProps={toastProps}
          />
        ),
      });
      return;
    }

    try {
      if (isShare && shareId) {
        await deleteShare({ shareId, postId });
      } else {
        await deletePost(postId);
      }

      toast.show({
        duration: 2500,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: 'Đã xóa bài viết',
              message: 'Bài viết đã được xóa thành công',
              variant: 'success',
            }}
            toastProps={toastProps}
          />
        ),
      });

      closeModal();
    } catch (error) {
      toast.show({
        duration: 3000,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: 'Lỗi',
              message: 'Không thể xóa bài viết, vui lòng thử lại',
              variant: 'error',
            }}
            toastProps={toastProps}
          />
        ),
      });
    }
  };

  return (
    <AppModal
      visible={isOpen}
      onClose={closeModal}
      variant="danger"
      title="Xóa bài viết"
      dismissible={!isPending}
      footer={
        <View className="mt-2 flex-row gap-3">
          <OutlineButton
            label="Hủy"
            className="flex-1"
            onPress={closeModal}
            disabled={isPending}
          />
          <PrimaryButton
            label="Xóa"
            className="flex-1 bg-rose-600 border-rose-600"
            onPress={handleDelete}
            loading={isPending}
          />
        </View>
      }
    >
      <View className="items-center justify-center gap-4 py-2">
        <Ionicons name="trash-outline" size={48} color="#ef4444" />
        <Text className="px-2 text-center text-[15px] leading-6 text-app-fg dark:text-app-fg-dark">
          Bạn có chắc chắn muốn xóa bài viết này không? Hành động này{' '}
          <Text className="font-semibold text-red-500">không thể hoàn tác</Text>.
        </Text>
      </View>
    </AppModal>
  );
}
