import React from 'react';
import { useMusicFeatures, useMusicRecommendations } from '@repo/shared';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { Text, View } from 'react-native';
import { Card } from 'heroui-native/card';

import { useAppTheme } from '~/providers/theme-provider';
import { MusicRecommendationModal } from './music/music-recommendation-modal';
import { MusicRecommendationPlayer } from './music/music-recommendation-player';

export function RecommendedMusicSection() {
  const { colors, resolvedTheme } = useAppTheme();
  const recommendationsQuery = useMusicRecommendations({ page: 1, limit: 20 });
  const fallbackQuery = useMusicFeatures({ page: 1, limit: 20 });
  const recommendedTracks = recommendationsQuery.data?.data ?? [];
  const fallbackTracks = fallbackQuery.data?.data ?? [];
  const tracks = React.useMemo(() => {
    const source = recommendedTracks.length > 0 ? recommendedTracks : fallbackTracks;
    return source.filter((track) => Boolean(track.audio?.url));
  }, [fallbackTracks, recommendedTracks]);

  const [isListOpen, setIsListOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const activeTrack = tracks[activeIndex] ?? null;
  const currentTrackUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (activeIndex >= tracks.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, tracks.length]);

  React.useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    });
  }, []);

  const formatClock = React.useCallback((seconds: number) => {
    const total = Number.isFinite(seconds)
      ? Math.max(0, Math.floor(seconds))
      : 0;
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startPlayback = React.useCallback(
    async (uri: string) => {
      try {
        if (currentTrackUrlRef.current !== uri) {
          player.replace({ uri });
          currentTrackUrlRef.current = uri;
        }
        player.play();
      } catch (error) {
        console.error('[music] playback failed:', error);
      }
    },
    [player],
  );

  const playTrackAt = React.useCallback(
    (index: number) => {
      const track = tracks[index];
      const uri = track?.audio?.url;
      if (!track || !uri) {
        return;
      }

      setActiveIndex(index);
      void startPlayback(uri);
    },
    [startPlayback, tracks],
  );

  const handleTogglePlay = React.useCallback(() => {
    const uri = activeTrack?.audio?.url;
    if (!uri) {
      return;
    }

    if (status.playing) {
      player.pause();
      return;
    }

    void startPlayback(uri);
  }, [activeTrack?.audio?.url, player, startPlayback, status.playing]);

  const handlePrevious = React.useCallback(() => {
    if (tracks.length === 0) {
      return;
    }
    const nextIndex = activeIndex === 0 ? tracks.length - 1 : activeIndex - 1;
    playTrackAt(nextIndex);
  }, [activeIndex, playTrackAt, tracks.length]);

  const handleNext = React.useCallback(() => {
    if (tracks.length === 0) {
      return;
    }
    const nextIndex = activeIndex >= tracks.length - 1 ? 0 : activeIndex + 1;
    playTrackAt(nextIndex);
  }, [activeIndex, playTrackAt, tracks.length]);

  React.useEffect(() => {
    if (status.didJustFinish) {
      handleNext();
    }
  }, [handleNext, status.didJustFinish]);

  const progress = React.useMemo(() => {
    if (!status.duration || status.duration <= 0) {
      return 0;
    }
    return Math.min(1, status.currentTime / status.duration);
  }, [status.currentTime, status.duration]);

  const palette = React.useMemo(() => {
    if (resolvedTheme === 'dark') {
      return {
        bg: '#102838',
        meta: '#7dd3fc',
        title: '#e6f4ff',
        subtle: '#9fc1d8',
        rail: '#27485f',
        accent: '#38bdf8',
        accentFg: '#082f49',
      };
    }

    return {
      bg: '#f7fbff',
      meta: '#0369a1',
      title: '#0f3a56',
      subtle: '#5f7f95',
      rail: '#dbeafe',
      accent: '#0284c7',
      accentFg: '#ffffff',
    };
  }, [resolvedTheme]);

  return (
    <>
      <Card
        variant="secondary"
        className="rounded-2xl px-2.5 py-2.5"
        style={{ backgroundColor: palette.bg }}
      >
        <Card.Body className="px-0 py-0">
          {recommendationsQuery.isError && fallbackQuery.isError ? (
            <View className="px-2.5 py-2.5">
              <Text className="text-xs text-red-500">
                Không tải được nhạc đề xuất.
              </Text>
            </View>
          ) : null}

          <MusicRecommendationPlayer
            track={activeTrack ?? tracks[0] ?? null}
            status={status}
            progress={progress}
            formatClock={formatClock}
            onPrevious={handlePrevious}
            onTogglePlay={handleTogglePlay}
            onNext={handleNext}
            onOpenList={() => setIsListOpen(true)}
            palette={palette}
          />
        </Card.Body>
      </Card>

      <MusicRecommendationModal
        visible={isListOpen}
        onClose={() => setIsListOpen(false)}
        tracks={tracks}
        activeIndex={activeIndex}
        status={status}
        colors={colors}
        onSelectTrack={playTrackAt}
      />
    </>
  );
}
