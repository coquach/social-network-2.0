import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import {
  NEWFEEDS_HEADER_BAR_HEIGHT,
  NewfeedsHeader,
} from '~/components/navigation/newfeeds-header';
import { useTabBarAutoHide } from '~/components/navigation/use-tab-bar-auto-hide';
import { AppCard } from '~/components/ui/app-card';
import { AppEyebrow, AppSubtitle, AppTitle } from '~/components/ui/app-text';
import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

const HEADER_HIDE_DISTANCE = 88;

const feedHighlights = [
  { title: 'Bài viết nổi bật', meta: '24 cập nhật mới', icon: 'flame-outline' as const },
  {
    title: 'Bạn bè đang bàn luận',
    meta: '8 chủ đề đang tăng tốc',
    icon: 'chatbubble-ellipses-outline' as const,
  },
  {
    title: 'Gợi ý dành cho bạn',
    meta: '12 nội dung hợp gu hôm nay',
    icon: 'sparkles-outline' as const,
  },
];

const feedStories = [
  {
    author: 'Ngọc Trâm',
    category: 'Xu hướng cộng đồng',
    summary: 'Bản cập nhật mới đang kéo thêm nhiều thảo luận tích cực quanh trải nghiệm đăng bài.',
    stats: '189 lượt xem, 46 phản hồi',
  },
  {
    author: 'Minh Khoa',
    category: 'Phân tích dữ liệu',
    summary: 'Tín hiệu sentiment trong nhóm sản phẩm đang nghiêng mạnh về các chủ đề thử nghiệm A/B.',
    stats: '132 lượt xem, 18 bình luận',
  },
  {
    author: 'Lan Hương',
    category: 'Nội dung nổi bật',
    summary: 'Các bài viết ngắn có tốc độ lan truyền tốt hơn vào buổi tối, đặc biệt ở nhóm creator.',
    stats: '214 lượt xem, 63 phản hồi',
  },
  {
    author: 'Hoàng Phúc',
    category: 'Vận hành cộng đồng',
    summary: 'Thông báo theo nhóm nhỏ đang cho tỷ lệ nhấp tốt hơn so với broadcast toàn hệ thống.',
    stats: '97 lượt xem, 12 phản hồi',
  },
  {
    author: 'Thảo Vy',
    category: 'Insight người dùng',
    summary: 'Người dùng mới có xu hướng tương tác mạnh với nội dung có ví dụ trực quan ngay đầu bài.',
    stats: '156 lượt xem, 25 phản hồi',
  },
  {
    author: 'Tuấn Anh',
    category: 'Đề xuất sản phẩm',
    summary: 'Nhiều phản hồi đang gom về nhu cầu lọc bảng tin theo nhóm quan tâm và mức độ ưu tiên.',
    stats: '241 lượt xem, 71 phản hồi',
  },
  {
    author: 'Khánh Linh',
    category: 'Nghiên cứu thị trường',
    summary: 'Các chủ đề về cộng đồng chuyên môn đang giữ người dùng lâu hơn nội dung mang tính giải trí ngắn.',
    stats: '118 lượt xem, 20 phản hồi',
  },
  {
    author: 'Đức Thành',
    category: 'Báo cáo nhanh',
    summary: 'Tỷ lệ lưu bài tăng rõ khi card tóm tắt có số liệu cụ thể và thông điệp ngắn gọn.',
    stats: '167 lượt xem, 38 phản hồi',
  },
];

export default function NewfeedsScreen() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const { handleOffsetChange } = useTabBarAutoHide();
  const colors = appThemeColors[resolvedTheme];
  const scrollY = useSharedValue(0);

  const headerHeight = insets.top + NEWFEEDS_HEADER_BAR_HEIGHT;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const nextOffset = Math.max(0, event.contentOffset.y);

      scrollY.value = nextOffset;
      scheduleOnRN(handleOffsetChange, nextOffset);
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = -interpolate(
      scrollY.value,
      [0, HEADER_HIDE_DISTANCE],
      [0, headerHeight],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HIDE_DISTANCE * 0.6, HEADER_HIDE_DISTANCE],
      [1, 0.92, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.View
        className="absolute left-0 right-0 top-0 z-20"
        style={headerAnimatedStyle}
      >
        <NewfeedsHeader />
      </Animated.View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + 16,
          paddingBottom: 144,
          paddingHorizontal: 24,
        }}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <AppEyebrow>Bảng tin</AppEyebrow>
          <AppTitle className="text-3xl">Newfeeds hôm nay</AppTitle>
          <AppSubtitle>
            Các cuộc trò chuyện, nhịp cảm xúc và nội dung đang được quan tâm nhất đều nằm ở
            đây.
          </AppSubtitle>

          <AppCard className="gap-4 bg-app-surface-elevated dark:bg-app-surface-elevated-dark">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-lg font-bold text-app-fg dark:text-app-fg-dark">
                  Nhịp bảng tin đang lên
                </Text>
                <Text className="mt-1 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  Cá nhân hóa theo nhóm bạn theo dõi và chủ đề bạn phản ứng nhiều.
                </Text>
              </View>
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-app-primary/15 dark:bg-app-primary-dark/20">
                <Ionicons name="pulse-outline" size={22} color={colors.primary} />
              </View>
            </View>
          </AppCard>

          {feedHighlights.map((item) => (
            <AppCard key={item.title} className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-lg font-bold text-app-fg dark:text-app-fg-dark">
                    {item.title}
                  </Text>
                  <Text className="mt-1 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                    {item.meta}
                  </Text>
                </View>
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-app-primary/10 dark:bg-app-primary-dark/15">
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>
              </View>
            </AppCard>
          ))}

          {feedStories.map((story) => (
            <AppCard key={`${story.author}-${story.category}`} className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-sm font-semibold uppercase tracking-[1.5px] text-app-primary dark:text-app-primary-dark">
                    {story.category}
                  </Text>
                  <Text className="mt-2 text-lg font-bold text-app-fg dark:text-app-fg-dark">
                    {story.author}
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
                    {story.summary}
                  </Text>
                  <Text className="mt-3 text-xs font-semibold uppercase tracking-[1.5px] text-app-muted-fg dark:text-app-muted-fg-dark">
                    {story.stats}
                  </Text>
                </View>
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-app-primary/10 dark:bg-app-primary-dark/15">
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                </View>
              </View>
            </AppCard>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
