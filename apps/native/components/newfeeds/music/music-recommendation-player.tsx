import React from 'react';
import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'heroui-native/button';
import type { MusicFeatureDTO } from '@repo/shared';
import type { AudioStatus } from 'expo-audio';

type MusicRecommendationPlayerProps = {
  track: MusicFeatureDTO | null;
  status: AudioStatus;
  progress: number;
  formatClock: (seconds: number) => string;
  onPrevious: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onOpenList: () => void;
  palette: {
    meta: string;
    title: string;
    subtle: string;
    rail: string;
    accent: string;
    accentFg: string;
  };
};

export function MusicRecommendationPlayer({
  track,
  status,
  progress,
  formatClock,
  onPrevious,
  onTogglePlay,
  onNext,
  onOpenList,
  palette,
}: MusicRecommendationPlayerProps) {

  return (
    <View className="rounded-xl px-2.5 py-2.5">
      <View className="flex-row items-center gap-2.5">
        <Image
          source={{ uri: track?.coverImage?.url }}
          className="h-10 w-10 rounded-lg bg-black/20"
          resizeMode="cover"
        />

        <View className="min-w-0 flex-1">
          <Text className="text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.meta }}>
            Đang đề xuất
          </Text>
          <Text className="text-[13px] font-semibold" style={{ color: palette.title }} numberOfLines={1}>
            {track?.title ?? 'Chưa có bài hát đề xuất'}
          </Text>
          <Text className="text-[11px]" style={{ color: palette.subtle }} numberOfLines={1}>
            {track?.artist ?? 'Không rõ nghệ sĩ'}
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Button isIconOnly size="sm" variant="ghost" feedbackVariant="scale" onPress={onPrevious} className="h-8 w-8 min-h-0 min-w-0">
            <Ionicons name="play-skip-back" size={14} color={palette.subtle} />
          </Button>
          <Button isIconOnly size="sm" variant="primary" feedbackVariant="scale-ripple" onPress={onTogglePlay} className="h-8 w-8 min-h-0 min-w-0">
            <Ionicons name={status.playing ? 'pause' : 'play'} size={14} color={palette.accentFg} />
          </Button>
          <Button isIconOnly size="sm" variant="ghost" feedbackVariant="scale" onPress={onNext} className="h-8 w-8 min-h-0 min-w-0">
            <Ionicons name="play-skip-forward" size={14} color={palette.subtle} />
          </Button>
          <Button isIconOnly size="sm" variant="ghost" feedbackVariant="scale" onPress={onOpenList} className="h-8 w-8 min-h-0 min-w-0 ml-1">
            <Ionicons name="list" size={16} color={palette.subtle} />
          </Button>
        </View>
      </View>

      <View>
        <View className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: palette.rail }}>
          <View className="h-full rounded-full" style={{ width: `${progress * 100}%`, backgroundColor: palette.accent }} />
        </View>
        <View className="mt-1 flex-row items-center justify-between">
          <Text className="text-[10px]" style={{ color: palette.subtle }}>
            {formatClock(status.currentTime)}
          </Text>
          <Text className="text-[10px]" style={{ color: palette.subtle }}>
            {formatClock(status.duration)}
          </Text>
        </View>
      </View>
    </View>
  );
}
