import React, { useMemo } from 'react';
import { BottomSheet } from 'heroui-native/bottom-sheet';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { usePostShares, useShareListModal } from '@repo/shared';

// ─────────────────────────────────────────

export function ShareListModal() {
  const { isOpen, closeModal, postId } = useShareListModal();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = usePostShares(postId ?? '', {});

  const shares = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const handleScroll = (e: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;

    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={closeModal}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-black/40" />

        <BottomSheet.Content
          enableDynamicSizing
          backgroundClassName="rounded-t-[24px] bg-app-bg"
          contentContainerClassName="pb-8 pt-2"
        >
          <View className="px-4">
            <Text className="text-lg font-semibold">Danh sách chia sẻ</Text>

            {isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator />
              </View>
            ) : isError ? (
              <View className="py-8 items-center">
                <Text>Lỗi load shares</Text>
              </View>
            ) : shares.length === 0 ? (
              <View className="py-8 items-center">
                <Text>Chưa có ai chia sẻ</Text>
              </View>
            ) : (
              <ScrollView
                className="mt-3 max-h-96"
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {shares.map((share) => (
                  <View
                    key={share.shareId}
                    className="py-3 border-b border-gray-200"
                  >
                    <Text className="font-medium">
                      User {share.userId.slice(0, 6)}
                    </Text>

                    {share.content ? (
                      <Text className="text-sm mt-1 text-gray-600">
                        {share.content}
                      </Text>
                    ) : null}
                  </View>
                ))}

                {isFetchingNextPage && (
                  <View className="py-4 items-center">
                    <ActivityIndicator />
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
