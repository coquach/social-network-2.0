import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { pickComposerMediaAssets } from '~/lib/media-picker';

import { useCreatePostContext } from './context';

export function MediaUpload() {
  const { addMedia, isPending, media, maxMedia } = useCreatePostContext();

  const pickAssets = React.useCallback(
    async (mediaType: 'images' | 'videos') => {
      const remaining = Math.max(0, maxMedia - media.length);

      if (remaining === 0) {
        addMedia([]);
        return;
      }

      const assets = await pickComposerMediaAssets({
        mediaType,
        selectionLimit: remaining,
        permissionAlert: {
          title: 'Cần quyền truy cập',
          message: 'Hãy cấp quyền thư viện ảnh để tiếp tục tải media.',
        },
      });

      if (assets.length === 0) {
        return;
      }

      addMedia(assets as Parameters<typeof addMedia>[0]);
    },
    [addMedia, maxMedia, media.length],
  );

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        onPress={() => {
          void pickAssets('images');
        }}
        disabled={isPending}
        accessibilityRole="button"
        accessibilityLabel="Thêm ảnh"
        className="h-10 w-10 items-center justify-center rounded-full border border-app-border bg-app-surface active:opacity-75 dark:border-app-border-dark dark:bg-app-surface-dark"
      >
        <Ionicons name="image-outline" size={20} color="#64748b" />
      </Pressable>

      <Pressable
        onPress={() => {
          void pickAssets('videos');
        }}
        disabled={isPending}
        accessibilityRole="button"
        accessibilityLabel="Thêm video"
        className="h-10 w-10 items-center justify-center rounded-full border border-app-border bg-app-surface active:opacity-75 dark:border-app-border-dark dark:bg-app-surface-dark"
      >
        <Ionicons name="videocam-outline" size={20} color="#64748b" />
      </Pressable>
    </View>
  );
}
