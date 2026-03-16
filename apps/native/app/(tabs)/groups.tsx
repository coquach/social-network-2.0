import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { AppCard } from '~/components/ui/app-card';
import { AppScrollScreen } from '~/components/ui/app-screen';
import { AppEyebrow, AppSubtitle, AppTitle } from '~/components/ui/app-text';

const groups = [
  { name: 'Design Circle', stats: '128 thành viên hoạt động', tone: 'bg-sky-500/15' },
  { name: 'Product Builders', stats: '16 bài đăng mới hôm nay', tone: 'bg-emerald-500/15' },
  { name: 'Mood Lab', stats: 'Xu hướng cảm xúc tăng mạnh', tone: 'bg-amber-500/15' },
];

export default function GroupsScreen() {
  return (
    <AppScrollScreen>
      <View className="gap-4 pb-28">
        <AppEyebrow>Nhóm</AppEyebrow>
        <AppTitle className="text-3xl">Không gian cộng đồng</AppTitle>
        <AppSubtitle>
          Theo dõi nhóm quan trọng, xem nhịp tương tác và vào thẳng các cuộc trò chuyện đang nóng.
        </AppSubtitle>

        {groups.map((group) => (
          <AppCard key={group.name} className="gap-4">
            <View className="flex-row items-center gap-4">
              <View className={`h-14 w-14 items-center justify-center rounded-2xl ${group.tone}`}>
                <Ionicons name="people-outline" size={24} color="#0ea5e9" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-app-fg dark:text-app-fg-dark">{group.name}</Text>
                <Text className="mt-1 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  {group.stats}
                </Text>
              </View>
            </View>
          </AppCard>
        ))}
      </View>
    </AppScrollScreen>
  );
}
