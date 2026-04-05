import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View, ViewStyle } from 'react-native';
import type { MediaDTO } from '@repo/shared';

export interface PostMediaProps {
  media?: MediaDTO[];
  mediaRemaining?: number;
  size?: 'default' | 'compact';

  onPressMedia?: (index: number, media: MediaDTO) => void;
}

function PostMediaComponent({
  media,
  mediaRemaining = 0,
  size = 'default',
  onPressMedia,
}: PostMediaProps) {
  const preview = React.useMemo(() => media?.slice(0, 4) ?? [], [media]);

  const extraCount = React.useMemo(() => {
    const autoRemaining = Math.max((media?.length ?? 0) - 4, 0);
    return Math.max(mediaRemaining, autoRemaining);
  }, [media?.length, mediaRemaining]);

  if (!preview.length) return null;

  const isCompact = size === 'compact';

  const MediaTile = ({
    item,
    index,
    className,
    style,
  }: {
    item: MediaDTO;
    index: number;
    className: string;
    style?: ViewStyle;
  }) => {
    const isLastVisible = index === 3 && extraCount > 0;

    const handlePress = () => {
      onPressMedia?.(index, item);
    };

    return (
      <Pressable
        accessibilityRole="button"
        style={style}
        className={`relative overflow-hidden rounded-xl border border-app-border dark:border-app-border-dark bg-app-surface dark:bg-app-surface-dark ${className}`}
        onPress={handlePress}
      >
        <Image
          source={{ uri: item.url, cache: 'force-cache' }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* VIDEO overlay */}
        {item.type === 'VIDEO' && (
          <View className="absolute inset-0 items-center justify-center bg-black/25">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-black/45">
              <Ionicons name="play" size={18} color="#ffffff" />
            </View>
          </View>
        )}

        {/* +N overlay */}
        {isLastVisible && (
          <View className="absolute inset-0 items-center justify-center bg-black/45">
            <Text className="text-xl font-bold text-white">+{extraCount}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View className="overflow-hidden rounded-xl">
      <View>
        {/* 1 ảnh */}
        {preview.length === 1 && (
          <MediaTile
            item={preview[0]!}
            index={0}
            className="w-full"
            style={{
              aspectRatio: isCompact ? 1 : 4 / 3,
            }}
          />
        )}

        {/* 2 ảnh */}
        {preview.length === 2 && (
          <View className="flex-row gap-0.5">
            <MediaTile
              item={preview[0]!}
              index={0}
              className="flex-1"
              style={{ aspectRatio: 1 }}
            />
            <MediaTile
              item={preview[1]!}
              index={1}
              className="flex-1"
              style={{ aspectRatio: 1 }}
            />
          </View>
        )}

        {/* 3 ảnh */}
        {preview.length === 3 && (
          <View className="flex-row gap-0.5">
            <MediaTile
              item={preview[0]!}
              index={0}
              className="flex-1"
              style={{ aspectRatio: 1 }}
            />

            <View className="flex-1 gap-0.5">
              <View className="flex-1">
                <MediaTile
                  item={preview[1]!}
                  index={1}
                  className="w-full h-full"
                />
              </View>

              <View className="flex-1">
                <MediaTile
                  item={preview[2]!}
                  index={2}
                  className="w-full h-full"
                />
              </View>
            </View>
          </View>
        )}

        {/* 4 ảnh */}
        {preview.length >= 4 && (
          <View className="gap-0.5">
            <View className="flex-row gap-0.5">
              <MediaTile
                item={preview[0]!}
                index={0}
                className="flex-1"
                style={{ aspectRatio: 1 }}
              />
              <MediaTile
                item={preview[1]!}
                index={1}
                className="flex-1"
                style={{ aspectRatio: 1 }}
              />
            </View>

            <View className="flex-row gap-0.5">
              <MediaTile
                item={preview[2]!}
                index={2}
                className="flex-1"
                style={{ aspectRatio: 1 }}
              />
              <MediaTile
                item={preview[3]!}
                index={3}
                className="flex-1"
                style={{ aspectRatio: 1 }}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

export const PostMedia = React.memo(PostMediaComponent);
