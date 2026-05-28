import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MusicFeatureDTO } from '@repo/shared';
import type { AudioStatus } from 'expo-audio';

import { AppModal } from '~/components/ui/app-modal';
import type { ThemeColors } from '~/constants/theme';

type MusicRecommendationModalProps = {
  visible: boolean;
  onClose: () => void;
  tracks: MusicFeatureDTO[];
  activeIndex: number;
  status: AudioStatus;
  colors: ThemeColors;
  onSelectTrack: (index: number) => void;
};

export function MusicRecommendationModal({
  visible,
  onClose,
  tracks,
  activeIndex,
  status,
  colors,
  onSelectTrack,
}: MusicRecommendationModalProps) {
  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Danh sách đề xuất"
      contentClassName="max-w-lg"
    >
      <View className="max-h-[420px]">
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item, index }) => {
            const isActive = index === activeIndex;
            return (
              <Pressable
                onPress={() => onSelectTrack(index)}
                className={`flex-row items-center gap-3 rounded-2xl border px-3 py-2 ${
                  isActive
                    ? 'border-app-primary/50 bg-app-primary/10'
                    : 'border-app-border/70 bg-app-background dark:border-app-border-dark/70 dark:bg-app-background-dark'
                }`}
              >
                <Image
                  source={{ uri: item.coverImage?.url }}
                  className="h-11 w-11 rounded-lg"
                  resizeMode="cover"
                />
                <View className="min-w-0 flex-1">
                  <Text
                    className="text-sm font-semibold text-app-fg dark:text-app-fg-dark"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className="text-xs text-app-muted-fg dark:text-app-muted-fg-dark"
                    numberOfLines={1}
                  >
                    {item.artist ?? 'Không rõ nghệ sĩ'}
                  </Text>
                </View>
                {isActive ? (
                  <Ionicons
                    name={status.playing ? 'pause-circle' : 'play-circle'}
                    size={22}
                    color={colors.primary}
                  />
                ) : null}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-8">
              <Text className="text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                Chưa có bài hát đề xuất
              </Text>
            </View>
          }
        />
      </View>
    </AppModal>
  );
}
