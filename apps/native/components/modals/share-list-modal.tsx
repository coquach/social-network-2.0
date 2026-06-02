import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

import {
  SharePostSnapshotDTO,
  usePostShares,
  useShareListModal,
} from '@repo/shared';
import { Avatar } from '../avatar';

// ─────────────────────────────────────────

export function ShareListModal() {
  const { isOpen, closeModal, postId } = useShareListModal();

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const hasOpenedRef = useRef(false);

  const snapPoints = useMemo(() => ['60%'], []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = usePostShares(postId ?? '', {});

  const shares = useMemo(
    () => data?.pages.flatMap((p: any) => p.data) ?? [],
    [data],
  );

  // open / close
  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      const frame = requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    if (!hasOpenedRef.current) {
      return;
    }

    bottomSheetRef.current?.dismiss();
  }, [isOpen]);

  // ─────────────────────────────────────────

  // ─────────────────────────────────────────
  // backdrop (dim background kiểu Facebook)

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.3}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  // ─────────────────────────────────────────

  const renderItem = ({ item }: { item: SharePostSnapshotDTO }) => (
    <View className="py-3 border-b border-gray-200">
      <View className="flex-row items-center gap-3">
        <Avatar
          userId={item.userId}
          size="medium"
          showName
          className="flex-1"
          onBeforeNavigate={closeModal}
        >
          <Avatar.Image showOnlineStatus />

          <View className="flex-1">
            <Avatar.Name />

            {item.content ? (
              <Text
                className="text-sm mt-1 text-gray-600"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.content}
              </Text>
            ) : null}
          </View>
        </Avatar>
      </View>
    </View>
  );

  // ─────────────────────────────────────────

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onDismiss={() => {
        hasOpenedRef.current = false;
        closeModal();
      }}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ borderRadius: 24 }}
    >
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="pt-2 pb-2">
          <Text className="text-lg font-semibold">Danh sách chia sẻ</Text>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center">
            <Text>Lỗi load shares</Text>
          </View>
        ) : shares.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text>Chưa có ai chia sẻ</Text>
          </View>
        ) : (
          <BottomSheetFlatList
            data={shares}
            keyExtractor={(item: SharePostSnapshotDTO) => item.shareId}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingBottom: 20,
            }}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <ActivityIndicator />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </BottomSheetModal>
  );
}
