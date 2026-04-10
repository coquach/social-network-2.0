import React from 'react';
import { FlatList, Image, View } from 'react-native';

import { AppSubtitle } from '~/components/ui/app-text';

type MusicCard = {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
};

const MUSIC_MOCKS: MusicCard[] = [
  {
    id: 'm1',
    title: 'Morning Skyline',
    artist: 'Ari P',
    thumbnail: 'https://picsum.photos/seed/music1/220/220',
  },
  {
    id: 'm2',
    title: 'Late Night Loops',
    artist: 'Nova',
    thumbnail: 'https://picsum.photos/seed/music2/220/220',
  },
  {
    id: 'm3',
    title: 'Neon Pulse',
    artist: 'Kaito',
    thumbnail: 'https://picsum.photos/seed/music3/220/220',
  },
  {
    id: 'm4',
    title: 'Cloud Drift',
    artist: 'Lena F',
    thumbnail: 'https://picsum.photos/seed/music4/220/220',
  },
];

function MusicCarouselBase() {
  const renderItem = React.useCallback(({ item }: { item: MusicCard }) => {
    return (
      <View className="w-40 overflow-hidden rounded-xl border border-app-border/80 p-1.5 dark:border-app-border-dark/80 shadow-none dark:bg-app-surface-dark/95">
        <Image
          source={{ uri: item.thumbnail }}
          className="h-20 w-full rounded-lg"
          resizeMode="cover"
        />

        <View className="gap-0.5 pt-1.5">
          <AppSubtitle className="text-xs font-semibold text-app-foreground/90">
            {item.title}
          </AppSubtitle>
          <AppSubtitle className="text-[11px] text-app-muted-fg/90">
            {item.artist}
          </AppSubtitle>
        </View>
      </View>
    );
  }, []);

  return (
    <FlatList
      horizontal
      data={MUSIC_MOCKS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 4, gap: 8 }}
    />
  );
}

export const MusicCarousel = React.memo(MusicCarouselBase);
