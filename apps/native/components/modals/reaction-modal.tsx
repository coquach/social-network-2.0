import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheet } from 'heroui-native/bottom-sheet';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { ReactionType, TargetType } from '@repo/shared';
import { useReactionModal } from '@repo/shared';
import { useReactions } from '@repo/shared';

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
  const listFadeAnim = useRef(new Animated.Value(1)).current;
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

  const reactions = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const displayedReactions = useMemo(() => {
    if (!filter) return reactions;
    return reactions.filter((reaction) => reaction.reactionType === filter);
  }, [filter, reactions]);

  useEffect(() => {
    if (!isOpen) setSelectedTab('ALL');
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) refetch();
  }, [filter, isOpen, refetch]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(listFadeAnim, {
        toValue: 0.75,
        duration: 110,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(listFadeAnim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedTab, listFadeAnim]);

  // ─────────────────────────────────────────
  type ReactionItem = {
    id: string;
    userId: string;
    reactionType: ReactionType;
  };

  const reactionCountLabel = useMemo(() => {
    const count = displayedReactions.length;

    if (!count) return 'Chưa có cảm xúc';
    return `${count} cảm xúc`;
  }, [displayedReactions.length]);

  const renderItem = ({ item }: { item: ReactionItem }) => (
    <Pressable
      className="min-h-12 flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
      android_ripple={{ color: 'rgba(15, 23, 42, 0.08)', borderless: false }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-app-primary/15">
          <Text className="text-base font-semibold text-app-primary">
            {item.userId.slice(0, 2).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1 justify-center">
          <Text
            className="text-base font-semibold text-app-fg"
            numberOfLines={1}
          >
            User {item.userId.slice(0, 8)}
          </Text>
          <Text className="mt-0.5 text-sm font-medium text-gray-700">
            {reactionLabelMap[item.reactionType]}
          </Text>
        </View>
      </View>

      <View className="ml-3 min-h-11 min-w-11 items-center justify-center rounded-xl bg-gray-100 px-2">
        <Text className="text-2xl leading-7">
          {reactionEmojiMap[item.reactionType]}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={closeModal}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-black/40" />

        <BottomSheet.Content
          snapPoints={['65%', '90%']}
          index={0}
          backgroundClassName="rounded-t-[24px] bg-app-bg"
        >
          <View className="flex-1 px-5">
            {/* Header */}
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-app-fg">Cảm xúc</Text>
              <Text className="text-base font-semibold text-app-fg">
                {reactionCountLabel}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4"
              contentContainerStyle={{
                paddingRight: 16,
              }}
            >
              <View className="flex-row items-center">
                {TABS.map((tab) => {
                  const active = tab.key === selectedTab;

                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => setSelectedTab(tab.key)}
                      className="mr-5 items-center"
                      hitSlop={8}
                      style={{
                        minWidth: 40, // 👉 tránh bị co
                        minHeight: 44,
                        justifyContent: 'center',
                      }}
                    >
                      {/* Label */}
                      <Text
                        className={`text-base ${
                          active
                            ? 'text-app-primary font-semibold'
                            : 'text-gray-700 font-medium'
                        }`}
                      >
                        {tab.label}
                      </Text>

                      {/* Underline */}
                      <View
                        className={`mt-1 h-0.5 w-full ${
                          active ? 'bg-app-primary' : 'bg-transparent'
                        }`}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

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
                <FlatList
                  data={displayedReactions}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  className="mt-4"
                  contentContainerStyle={{
                    paddingBottom: 24,
                    gap: 10,
                  }}
                  onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                      fetchNextPage();
                    }
                  }}
                  onEndReachedThreshold={0.3}
                  ListEmptyComponent={
                    <View className="min-h-45 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-8">
                      <Text className="text-base font-medium text-app-fg">
                        Chưa có cảm xúc
                      </Text>
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
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
