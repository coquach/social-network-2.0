import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ListRenderItem,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

import { ReactionType, TargetType } from '@repo/shared';
import { useReactionModal, useReactions } from '@repo/shared';
import { Avatar } from '~/components/avatar';

// ─────────────────────────────────────────

type ReactionItem = {
  id: string;
  userId: string;
  reactionType: ReactionType;
};

// ─────────────────────────────────────────

const reactionEmojiMap: Record<ReactionType, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  HAHA: '😆',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😡',
};

const reactionLabelMap: Record<ReactionType, string> = {
  LIKE: 'Thích',
  LOVE: 'Yêu thích',
  HAHA: 'Haha',
  WOW: 'Wow',
  SAD: 'Buồn',
  ANGRY: 'Phẫn nộ',
};

const TABS: Array<{ key: 'ALL' | ReactionType; label: string }> = [
  { key: 'ALL', label: 'Tất cả' },
  { key: ReactionType.LIKE, label: '👍' },
  { key: ReactionType.LOVE, label: '❤️' },
  { key: ReactionType.HAHA, label: '😆' },
  { key: ReactionType.WOW, label: '😮' },
  { key: ReactionType.SAD, label: '😢' },
  { key: ReactionType.ANGRY, label: '😡' },
];

// ─────────────────────────────────────────

export function ReactionModal() {
  const { isOpen, closeModal, targetId, targetType } = useReactionModal();

  const [selectedTab, setSelectedTab] = useState<'ALL' | ReactionType>('ALL');

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const hasOpenedRef = useRef(false);
  const listFadeAnim = useRef(new Animated.Value(1)).current;

  const snapPoints = useMemo(() => ['60%'], []);

  const filter = selectedTab === 'ALL' ? undefined : selectedTab;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useReactions(targetId ?? '', targetType ?? TargetType.POST, filter, {
    enabled: isOpen,
  });

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

  const handleClose = useCallback(() => {
    hasOpenedRef.current = false;
    closeModal();
  }, [closeModal]);

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

  // flatten data
  const reactions = useMemo<ReactionItem[]>(() => {
    return (data?.pages.flatMap((p: any) => p.data) ?? []).map(
      (r: any): ReactionItem => ({
        id: r.id,
        userId: r.userId,
        reactionType: r.reactionType as ReactionType,
      }),
    );
  }, [data]);

  // reset tab
  useEffect(() => {
    if (!isOpen) setSelectedTab('ALL');
  }, [isOpen]);

  // refetch khi đổi tab
  useEffect(() => {
    if (isOpen) refetch();
  }, [filter]);

  // animation
  useEffect(() => {
    listFadeAnim.setValue(0.9);
    Animated.timing(listFadeAnim, {
      toValue: 1,
      duration: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selectedTab]);

  const reactionCountLabel = useMemo(() => {
    if (!reactions.length) return 'Chưa có tương tác';
    return `${reactions.length} lượt tương tác`;
  }, [reactions.length]);

  const renderItem: ListRenderItem<ReactionItem> = ({ item }) => (
    <Pressable
      className="min-h-12 flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
      android_ripple={{ color: 'rgba(15, 23, 42, 0.08)' }}
    >
      {/* LEFT */}
      <Avatar
        userId={item.userId}
        size="medium"
        showName
        className="flex-1"
        onBeforeNavigate={closeModal}
      >
        <Avatar.Image showOnlineStatus />

        <View className="flex-1 min-w-0">
          <Avatar.Name />

          <Text className="text-sm text-gray-600">
            {reactionLabelMap[item.reactionType]}
          </Text>
        </View>
      </Avatar>

      {/* RIGHT (optional nếu muốn tách emoji riêng) */}
      <Text className="text-2xl">{reactionEmojiMap[item.reactionType]}</Text>
    </Pressable>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onDismiss={handleClose}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ borderRadius: 24 }}
    >
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="pt-2 pb-2 flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-app-fg">
            Xem lượt tương tác
          </Text>
          <Text className="text-base font-semibold text-app-fg">
            {reactionCountLabel}
          </Text>
        </View>

        {/* Tabs */}
        <View className="pb-2">
          <BottomSheetScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <View className="flex-row items-center">
              {TABS.map((tab) => {
                const active = tab.key === selectedTab;

                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setSelectedTab(tab.key)}
                    className="mr-5 items-center px-2"
                  >
                    <Text
                      className={`text-lg ${
                        active
                          ? 'text-app-primary font-semibold'
                          : 'text-gray-600'
                      }`}
                    >
                      {tab.label}
                    </Text>

                    <View
                      className={`mt-1 h-0.5 w-full ${
                        active ? 'bg-app-primary' : 'bg-transparent'
                      }`}
                    />
                  </Pressable>
                );
              })}
            </View>
          </BottomSheetScrollView>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center">
            <Text>Lỗi load reactions</Text>
          </View>
        ) : (
          <Animated.View style={{ flex: 1, opacity: listFadeAnim }}>
            <BottomSheetFlatList<ReactionItem>
              data={reactions}
              keyExtractor={(item: ReactionItem) => item.id}
              renderItem={renderItem}
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingVertical: 12,
                gap: 10,
              }}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.3}
              ListEmptyComponent={
                <View className="items-center mt-10">
                  <Text>Chưa có tương tác</Text>
                </View>
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator />
                  </View>
                ) : null
              }
            />
          </Animated.View>
        )}
      </View>
    </BottomSheetModal>
  );
}
