import React from 'react';
import { useMusicFeatures, useMusicRecommendations } from '@repo/shared';
import { Text, View, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';
import { setupTrackPlayer } from '~/service/track-player-service';

export function RecommendedMusicSection() {
  const recommendationsQuery = useMusicRecommendations({ page: 1, limit: 10 });
  const fallbackQuery = useMusicFeatures({ page: 1, limit: 10 });
  const recommendedTracks = recommendationsQuery.data?.data ?? [];
  const fallbackTracks = fallbackQuery.data?.data ?? [];
  const tracks = React.useMemo(() => {
    const source = recommendedTracks.length > 0 ? recommendedTracks : fallbackTracks;
    return source.filter((track) => Boolean(track.audio?.url));
  }, [fallbackTracks, recommendedTracks]);

  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const stateObj = (playbackState as any).state !== undefined ? (playbackState as any).state : playbackState;
  const isPlaying = stateObj === State.Playing || stateObj === State.Buffering;

  const playPlaylist = async (index: number) => {
    try {
      await setupTrackPlayer();
      const queue = tracks.map(track => ({
        id: String(track.id), // Bắt buộc phải là chuỗi (String) để tránh crash
        url: track.audio?.url as string, 
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Không rõ',
        artwork: track.coverImage?.url,
      }));
      
      await TrackPlayer.reset();
      await TrackPlayer.add(queue);
      if (index > 0) {
        await TrackPlayer.skip(index);
      }
      await TrackPlayer.play();
    } catch (e) {
      console.error('Lỗi khi phát nhạc:', e);
    }
  };

  if (recommendationsQuery.isLoading || fallbackQuery.isLoading) {
    return (
      <View className="items-center justify-center py-6">
        <Text className="text-sm text-slate-500">Đang tải nhạc...</Text>
      </View>
    );
  }

  if (tracks.length === 0) {
    return (
      <View className="items-center justify-center py-6">
        <Text className="text-sm text-slate-500">Chưa có bài hát đề xuất lúc này.</Text>
      </View>
    );
  }

  return (
    <View className="flex-col gap-2">
      {tracks.slice(0, 4).map((track, index) => {
        const isActive = activeTrack?.id === track.id;
        return (
          <Pressable
            key={track.id}
            onPress={async () => {
              if (isActive) {
                if (isPlaying) {
                  await TrackPlayer.pause();
                } else {
                  await TrackPlayer.play();
                }
              } else {
                await playPlaylist(index);
              }
            }}
            className={`flex-row items-center gap-3 rounded-2xl border px-3 py-2 transition-colors ${
              isActive
                ? 'border-sky-500/50 bg-sky-500/10 dark:border-sky-400/50 dark:bg-sky-400/10'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <Image
              source={{ uri: track.coverImage?.url }}
              className="h-11 w-11 rounded-lg"
              resizeMode="cover"
            />
            <View className="min-w-0 flex-1">
              <Text
                className={`text-sm font-semibold ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-slate-200'}`}
                numberOfLines={1}
              >
                {track.title}
              </Text>
              <Text
                className="text-xs text-slate-500"
                numberOfLines={1}
              >
                {track.artist ?? 'Không rõ nghệ sĩ'}
              </Text>
            </View>
            {isActive ? (
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={28}
                color="#0284c7"
              />
            ) : (
              <Ionicons
                name="play-circle-outline"
                size={28}
                color="#94a3b8"
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
