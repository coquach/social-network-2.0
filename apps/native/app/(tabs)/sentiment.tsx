import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { AppCard } from '~/components/ui/app-card';
import { AppScrollScreen } from '~/components/ui/app-screen';
import { AppEyebrow, AppSubtitle, AppTitle } from '~/components/ui/app-text';

const sentimentCards = [
  { mood: 'Tích cực', score: '+42%', icon: 'sunny-outline' as const },
  { mood: 'Bình tĩnh', score: '+18%', icon: 'leaf-outline' as const },
  { mood: 'Tò mò', score: '+27%', icon: 'sparkles-outline' as const },
  { mood: 'Sôi nổi', score: '+35%', icon: 'flash-outline' as const },
];

export default function SentimentScreen() {
  return (
    <AppScrollScreen>
      <View className="gap-4 pb-28">
        <AppEyebrow>Cảm xúc</AppEyebrow>
        <AppTitle className="text-3xl">Bản đồ sentiment</AppTitle>
        <AppSubtitle>
          Theo dõi nhịp cảm xúc trong cộng đồng để biết chủ đề nào đang lan tỏa tích cực hoặc cần chú ý.
        </AppSubtitle>

        <View className="flex-row flex-wrap gap-3">
          {sentimentCards.map((item) => (
            <AppCard key={item.mood} className="w-[48%] gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-app-primary/10 dark:bg-app-primary-dark/15">
                <Ionicons name={item.icon} size={20} color="#0ea5e9" />
              </View>
              <Text className="text-lg font-bold text-app-fg dark:text-app-fg-dark">{item.mood}</Text>
              <Text className="text-sm text-app-muted-fg dark:text-app-muted-fg-dark">{item.score}</Text>
            </AppCard>
          ))}
        </View>
      </View>
    </AppScrollScreen>
  );
}
