import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { AppCard } from '~/components/ui/app-card';
import { AppScrollScreen } from '~/components/ui/app-screen';
import { AppEyebrow, AppSubtitle, AppTitle } from '~/components/ui/app-text';

const groupHighlights = [
  {
    name: 'Design Circle',
    stats: '128 thành viên hoạt động',
    summary: 'Trao đổi về UI, motion và hệ thống thiết kế mỗi ngày.',
    tone: 'bg-sky-500/15',
  },
  {
    name: 'Product Builders',
    stats: '16 bài đăng mới hôm nay',
    summary: 'Nơi đội sản phẩm chia sẻ roadmap, insight và thử nghiệm.',
    tone: 'bg-emerald-500/15',
  },
  {
    name: 'Mood Lab',
    stats: 'Xu hướng cảm xúc tăng mạnh',
    summary: 'Theo dõi phản hồi cộng đồng theo từng chủ đề nóng.',
    tone: 'bg-amber-500/15',
  },
  {
    name: 'Community Ops',
    stats: '9 quản trị viên đang trực',
    summary: 'Tập trung vào moderation, an toàn và xử lý báo cáo.',
    tone: 'bg-rose-500/15',
  },
];

const activeRooms = [
  { title: 'Weekly sync', members: '24 người đang tham gia', icon: 'videocam-outline' as const },
  { title: 'Feedback nóng', members: '31 bình luận trong 1 giờ', icon: 'chatbubbles-outline' as const },
  { title: 'Ý tưởng mới', members: '18 đề xuất chờ vote', icon: 'bulb-outline' as const },
  { title: 'Case study', members: '12 tài liệu vừa được chia sẻ', icon: 'document-text-outline' as const },
  { title: 'Growth room', members: '15 quản trị viên theo dõi', icon: 'trending-up-outline' as const },
  { title: 'Brand voice', members: '7 cuộc thảo luận đang mở', icon: 'megaphone-outline' as const },
  { title: 'Creator corner', members: '22 creator trực tuyến', icon: 'sparkles-outline' as const },
  { title: 'Research desk', members: '14 insight mới hôm nay', icon: 'flask-outline' as const },
];

export default function GroupsScreen() {
  return (
    <AppScrollScreen>
      <View className="gap-4 pb-28">
        <AppEyebrow>Nhóm</AppEyebrow>
        <AppTitle className="text-3xl">Không gian cộng đồng</AppTitle>
        <AppSubtitle>
          Theo dõi nhóm quan trọng, xem nhịp tương tác và vào thẳng các cuộc trò chuyện
          đang nóng.
        </AppSubtitle>

        {groupHighlights.map((group) => (
          <AppCard key={group.name} className="gap-4">
            <View className="flex-row items-center gap-4">
              <View className={`h-14 w-14 items-center justify-center rounded-2xl ${group.tone}`}>
                <Ionicons name="people-outline" size={24} color="#0ea5e9" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-app-fg dark:text-app-fg-dark">
                  {group.name}
                </Text>
                <Text className="mt-1 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  {group.stats}
                </Text>
                <Text className="mt-2 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  {group.summary}
                </Text>
              </View>
            </View>
          </AppCard>
        ))}

        <AppCard className="gap-4 bg-app-surface-elevated dark:bg-app-surface-elevated-dark">
          <Text className="text-lg font-bold text-app-fg dark:text-app-fg-dark">
            Phòng đang hoạt động
          </Text>
          <View className="gap-3">
            {activeRooms.map((room) => (
              <View key={room.title} className="flex-row items-center gap-3 rounded-2xl bg-app-bg/70 p-3 dark:bg-app-bg-dark/70">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-app-primary/10 dark:bg-app-primary-dark/15">
                  <Ionicons name={room.icon} size={20} color="#0ea5e9" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">
                    {room.title}
                  </Text>
                  <Text className="mt-1 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                    {room.members}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </AppCard>
      </View>
    </AppScrollScreen>
  );
}
