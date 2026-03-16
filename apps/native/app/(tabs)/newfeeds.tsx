import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { AppCard } from '~/components/ui/app-card';
import { AppScrollScreen } from '~/components/ui/app-screen';
import { AppEyebrow, AppSubtitle, AppTitle } from '~/components/ui/app-text';

const feedHighlights = [
  { title: 'Bài viết nổi bật', meta: '24 cập nhật mới', icon: 'flame-outline' as const },
  { title: 'Bạn bè đang bàn luận', meta: '8 chủ đề đang tăng tốc', icon: 'chatbubble-ellipses-outline' as const },
  { title: 'Gợi ý dành cho bạn', meta: '12 nội dung hợp gu hôm nay', icon: 'sparkles-outline' as const },
];

export default function NewfeedsScreen() {
  return (
    <AppScrollScreen>
      <View className="gap-4 pb-28">
        <AppEyebrow>Bảng tin</AppEyebrow>
        <AppTitle className="text-3xl">Newfeeds hôm nay</AppTitle>
        <AppSubtitle>
          Các cuộc trò chuyện, nhịp cảm xúc và nội dung đang được quan tâm nhất đều nằm ở đây.
        </AppSubtitle>

        <AppCard className="gap-4 bg-app-surface-elevated dark:bg-app-surface-elevated-dark">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-app-fg dark:text-app-fg-dark">
                Nhịp bảng tin đang lên
              </Text>
              <Text className="mt-1 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                Cá nhân hóa theo nhóm bạn theo dõi và chủ đề bạn phản ứng nhiều.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-app-primary/15 dark:bg-app-primary-dark/20">
              <Ionicons name="pulse-outline" size={22} color="#0ea5e9" />
            </View>
          </View>
        </AppCard>

        {feedHighlights.map((item) => (
          <AppCard key={item.title} className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-app-fg dark:text-app-fg-dark">{item.title}</Text>
                <Text className="mt-1 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  {item.meta}
                </Text>
              </View>
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-app-primary/10 dark:bg-app-primary-dark/15">
                <Ionicons name={item.icon} size={20} color="#0ea5e9" />
              </View>
            </View>
          </AppCard>
        ))}
      </View>
    </AppScrollScreen>
  );
}
