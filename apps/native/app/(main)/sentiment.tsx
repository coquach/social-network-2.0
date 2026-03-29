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
  { mood: 'Cẩn trọng', score: '+14%', icon: 'shield-checkmark-outline' as const },
  { mood: 'Kỳ vọng', score: '+21%', icon: 'rocket-outline' as const },
];

const sentimentSignals = [
  { topic: 'Ra mắt tính năng mới', status: 'Tăng tốc', detail: 'Mức quan tâm tăng 28% trong 6 giờ' },
  { topic: 'Phản hồi onboarding', status: 'Ổn định', detail: 'Phần lớn phản hồi giữ tông trung tính' },
  { topic: 'Thông báo hệ thống', status: 'Cần chú ý', detail: 'Tỷ lệ phản ứng tiêu cực nhích lên 9%' },
  { topic: 'Bài viết chuyên sâu', status: 'Lan tỏa tốt', detail: 'Tỷ lệ lưu bài và chia sẻ tăng đều' },
  { topic: 'Sự kiện cộng đồng', status: 'Rất tích cực', detail: 'Nhiều bình luận chủ động tham gia' },
  { topic: 'Nội dung ngắn', status: 'Phân hóa', detail: 'Có khác biệt rõ giữa các nhóm người dùng' },
  { topic: 'Đề xuất thuật toán', status: 'Thử nghiệm', detail: 'Mức tương tác cao nhưng giữ chân chưa ổn định' },
  { topic: 'Thông điệp thương hiệu', status: 'Đang cải thiện', detail: 'Phản hồi về ngôn ngữ đã mềm hơn' },
];

export default function SentimentScreen() {
  return (
    <AppScrollScreen>
      <View className="gap-4 pb-28">
        <AppEyebrow>Cảm xúc</AppEyebrow>
        <AppTitle className="text-3xl">Bản đồ sentiment</AppTitle>
        <AppSubtitle>
          Theo dõi nhịp cảm xúc trong cộng đồng để biết chủ đề nào đang lan tỏa tích cực
          hoặc cần chú ý.
        </AppSubtitle>

        <View className="flex-row flex-wrap gap-3">
          {sentimentCards.map((item) => (
            <AppCard key={item.mood} className="w-[48%] gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-app-primary/10 dark:bg-app-primary-dark/15">
                <Ionicons name={item.icon} size={20} color="#0ea5e9" />
              </View>
              <Text className="text-lg font-bold text-app-fg dark:text-app-fg-dark">
                {item.mood}
              </Text>
              <Text className="text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                {item.score}
              </Text>
            </AppCard>
          ))}
        </View>

        <AppCard className="gap-4">
          <Text className="text-lg font-bold text-app-fg dark:text-app-fg-dark">
            Tín hiệu theo chủ đề
          </Text>
          <View className="gap-3">
            {sentimentSignals.map((signal) => (
              <View
                key={signal.topic}
                className="rounded-2xl border border-app-border/70 p-4 dark:border-app-border-dark/70"
              >
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="flex-1 text-base font-semibold text-app-fg dark:text-app-fg-dark">
                    {signal.topic}
                  </Text>
                  <Text className="text-sm font-semibold text-app-primary dark:text-app-primary-dark">
                    {signal.status}
                  </Text>
                </View>
                <Text className="mt-2 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  {signal.detail}
                </Text>
              </View>
            ))}
          </View>
        </AppCard>
      </View>
    </AppScrollScreen>
  );
}
