import { Ionicons } from '@expo/vector-icons';
import { MediaType } from '@repo/shared';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import { useCreatePostContext } from './context';

export function MediaPreview() {
  const { previews, removeMedia } = useCreatePostContext();

  if (previews.length === 0) {
    return null;
  }

  const isSingle = previews.length === 1;

  const renderMediaThumb = (
    item: (typeof previews)[number],
    style?: {
      width?: number | `${number}%`;
      height?: number;
      aspectRatio?: number;
    },
  ) => {
    return (
      <Animated.View
        key={item.key}
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(140)}
        layout={LinearTransition.duration(180)}
        className="relative overflow-hidden rounded-xl"
        style={style}
      >
        {item.type === MediaType.IMAGE ? (
          <Image
            source={{ uri: item.preview }}
            className="h-full w-full rounded-xl bg-app-surface-elevated dark:bg-app-surface-elevated-dark"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center rounded-xl bg-slate-900/80">
            <Ionicons name="videocam" size={26} color="#f1f5f9" />
            <Text className="mt-2 text-xs font-semibold text-slate-100">
              VIDEO
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => removeMedia(item.key)}
          className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/70"
          accessibilityRole="button"
          accessibilityLabel="Xóa tệp"
        >
          <Ionicons name="close" size={16} color="#ffffff" />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View className="px-4 pb-3 pt-1">
      {isSingle ? (
        renderMediaThumb(previews[0], {
          width: '100%',
          aspectRatio: 1,
        })
      ) : (
        <Animated.View
          layout={LinearTransition.duration(180)}
          className="flex-row flex-wrap gap-2"
        >
          {previews.map((item) =>
            renderMediaThumb(item, {
              width: '48%',
              aspectRatio: 1,
            }),
          )}
        </Animated.View>
      )}
    </View>
  );
}
