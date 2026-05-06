import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  Text,
  type LayoutChangeEvent,
  View,
  Modal,
} from 'react-native';

import { MediaType, type MediaDTO } from '@repo/shared';
import { cn } from '~/lib/cn';

type MediaCarouselProps = {
  media?: MediaDTO[];
  onPressMedia?: (index: number, media: MediaDTO) => void;
};

function resolveMediaUrl(media: MediaDTO) {
  const candidate = (media as MediaDTO & { url?: string }).url;
  return media.url ?? candidate ?? '';
}

function isValidRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function MediaSlide({
  item,
  index,
  width,
  onPressMedia,
}: {
  item: MediaDTO;
  index: number;
  width: number;
  onPressMedia?: (index: number, media: MediaDTO) => void;
}) {
  const uri = resolveMediaUrl(item);
  const [failed, setFailed] = React.useState(!isValidRemoteUrl(uri));
  const isImage = item.type === MediaType.IMAGE;
  const isVideo = item.type === MediaType.VIDEO;

  return (
    <Pressable
      onPress={() => onPressMedia?.(index, item)}
      className="overflow-hidden bg-app-surface-elevated active:opacity-90 dark:bg-app-surface-elevated-dark"
      style={{ width }}
    >
      <View style={{ aspectRatio: 1 }}>
        {isImage && !failed && (
          <Image
            source={{ uri }}
            className="h-full w-full"
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        )}

        {isVideo && (
          <View className="h-full w-full">
            <Image
              source={{ uri: (item as any).thumbnailUrl || uri }}
              className="h-full w-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 items-center justify-center">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-black/40">
                <Ionicons name="play" size={28} color="white" />
              </View>
            </View>
          </View>
        )}

        {!isVideo && (failed || !isImage) && (
          <View className="h-full w-full items-center justify-center">
            <Text>Không tải được ảnh</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function MediaCarouselComponent({ media }: MediaCarouselProps) {
  const items = React.useMemo(() => media?.filter(Boolean) ?? [], [media]);

  const [containerWidth, setContainerWidth] = React.useState(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setCurrentIndex(0);
  }, [items.length]);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setContainerWidth(nextWidth);
  }, []);

  const handleMomentumEnd = React.useCallback(
    (event: any) => {
      if (!items.length || containerWidth <= 0) return;

      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / containerWidth,
      );

      setCurrentIndex(Math.max(0, Math.min(nextIndex, items.length - 1)));
    },
    [containerWidth, items.length],
  );

  const keyExtractor = React.useCallback(
    (item: MediaDTO, index: number) =>
      `${resolveMediaUrl(item) || index}-${index}`,
    [],
  );

  const renderCarouselItem = React.useCallback(
    ({ item, index }: { item: MediaDTO; index: number }) => (
      <MediaSlide
        item={item}
        index={index}
        width={containerWidth}
        onPressMedia={(i) => setViewerIndex(i)}
      />
    ),
    [containerWidth],
  );

  const renderViewerItem = React.useCallback(
    ({ item }: { item: MediaDTO }) => {
      const uri = resolveMediaUrl(item);

      return (
        <View
          style={{ width: containerWidth }}
          className="flex-1 items-center justify-center"
        >
          <Image
            source={{ uri }}
            className="h-full w-full"
            resizeMode="contain"
          />
        </View>
      );
    },
    [containerWidth],
  );

  if (!items.length) return null;

  return (
    <>
      {/* MAIN CAROUSEL */}
      <View className="overflow-hidden" onLayout={handleLayout}>
        {containerWidth > 0 && (
          <FlatList
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onMomentumScrollEnd={handleMomentumEnd}
            initialNumToRender={1}
            windowSize={3}
            maxToRenderPerBatch={2}
            removeClippedSubviews
          />
        )}

        {/* DOTS */}
        {items.length > 1 && (
          <View className="flex-row justify-center gap-2 py-3">
            {items.map((_, index) => (
              <View
                key={index}
                className={cn(
                  'h-2 rounded-full',
                  index === currentIndex
                    ? 'w-6 bg-app-primary'
                    : 'w-2 bg-gray-300',
                )}
              />
            ))}
          </View>
        )}
      </View>

      {/* 🔥 FULLSCREEN VIEWER */}
      {viewerIndex !== null && (
        <Modal visible transparent animationType="fade">
          <View className="flex-1 bg-black">
            {/* CLOSE */}
            <Pressable
              onPress={() => setViewerIndex(null)}
              className="absolute top-12 right-4 z-10"
            >
              <Ionicons name="close" size={28} color="white" />
            </Pressable>

            {/* VIEWER LIST */}
            {containerWidth > 0 && (
              <FlatList
                data={items}
                keyExtractor={keyExtractor}
                horizontal
                pagingEnabled
                initialScrollIndex={viewerIndex}
                getItemLayout={(_, index) => ({
                  length: containerWidth,
                  offset: containerWidth * index,
                  index,
                })}
                renderItem={renderViewerItem}
                initialNumToRender={1}
                windowSize={3}
                maxToRenderPerBatch={2}
                removeClippedSubviews
              />
            )}
          </View>
        </Modal>
      )}
    </>
  );
}

export const MediaCarousel = React.memo(MediaCarouselComponent);
