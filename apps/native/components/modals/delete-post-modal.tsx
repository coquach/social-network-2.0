import { Ionicons } from '@expo/vector-icons';
import { useDeletePost, useDeletePostModal, useDeleteShare } from '@repo/shared';
import { useToast } from 'heroui-native/toast';
import { Button } from 'heroui-native/button';
import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';

import { AppModal } from '~/components/ui/app-modal';
import { AppToast } from '~/components/ui/app-toast';

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
          <Button
            variant="outline"
            className="flex-1 min-h-12 rounded-xl"
            onPress={closeModal}
            isDisabled={isPending}
          >
            <Text className="font-semibold text-app-fg dark:text-app-fg-dark">Hủy</Text>
          </Button>
          <Button
            className="flex-1 min-h-12 bg-rose-600 rounded-xl"
            onPress={handleDelete}
            isDisabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="font-semibold text-white">Xóa</Text>
            )}
          </Button>
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
