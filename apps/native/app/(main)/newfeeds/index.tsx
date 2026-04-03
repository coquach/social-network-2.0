import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import {
  NEWFEEDS_HEADER_BAR_HEIGHT,
  NewfeedsHeader,
} from '~/components/navigation/newfeeds-header';
import { useTabBarAutoHide } from '~/components/navigation/use-tab-bar-auto-hide';
import { AppEyebrow, AppSubtitle, AppTitle } from '~/components/ui/app-text';
import { FeedScrollProvider } from '~/contexts/feed-scroll-context';
import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

import { PersonalFeed } from './components/personal-feed';
import { TrendingFeed } from './components/trending-feed';

const TOP_THRESHOLD = 12;
const DELTA_THRESHOLD = 8;
const HEADER_SHOW_DURATION = 240;
const HEADER_HIDE_DURATION = 200;

type FeedTab = 'trending' | 'personal';

export default function NewfeedsScreen() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const { handleOffsetChange } = useTabBarAutoHide();
  const colors = appThemeColors[resolvedTheme];

  const headerTranslateY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const lastScrollY = useSharedValue(0);

  const [scrollEnabled, setScrollEnabled] = React.useState(true);
  const [tab, setTab] = React.useState<FeedTab>('trending');

  const feedScrollContextValue = React.useMemo(
    () => ({ scrollEnabled, setScrollEnabled }),
    [scrollEnabled],
  );

  const headerHeight = insets.top + NEWFEEDS_HEADER_BAR_HEIGHT;

  useFocusEffect(
    React.useCallback(() => {
      headerTranslateY.value = 0;
      headerOpacity.value = 1;
      lastScrollY.value = 0;
    }, []),
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const nextOffset = Math.max(0, event.contentOffset.y);
      const delta = nextOffset - lastScrollY.value;

      if (nextOffset <= TOP_THRESHOLD) {
        headerTranslateY.value = withTiming(0, {
          duration: HEADER_SHOW_DURATION,
        });
        headerOpacity.value = withTiming(1, {
          duration: HEADER_SHOW_DURATION,
        });
        lastScrollY.value = nextOffset;
        scheduleOnRN(handleOffsetChange, nextOffset);
        return;
      }

      if (delta > DELTA_THRESHOLD) {
        headerTranslateY.value = withTiming(-headerHeight, {
          duration: HEADER_HIDE_DURATION,
        });
        headerOpacity.value = withTiming(0, {
          duration: HEADER_HIDE_DURATION,
        });
      } else if (delta < -DELTA_THRESHOLD) {
        headerTranslateY.value = withTiming(0, {
          duration: HEADER_SHOW_DURATION,
        });
        headerOpacity.value = withTiming(1, {
          duration: HEADER_SHOW_DURATION,
        });
      }

      lastScrollY.value = nextOffset;
      scheduleOnRN(handleOffsetChange, nextOffset);
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  // Intro text
  const intro = React.useMemo(
    () => (
      <View className="gap-2 pb-3">
        <AppEyebrow>Bảng tin</AppEyebrow>
        <AppTitle className="text-3xl">Newfeeds hôm nay</AppTitle>
        <AppSubtitle>
          Theo dõi bài viết xu hướng và bảng tin cá nhân theo thời gian thực.
        </AppSubtitle>
      </View>
    ),
    [],
  );

  // Segmented control
  const segmented = (
    <View className="pb-2">
      <View className="mt-1 rounded-full border border-app-border bg-app-surface-elevated p-1 dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
        <View className="flex-row">
          <Pressable
            onPress={() => setTab('trending')}
            className={`flex-1 items-center rounded-full py-2 ${
              tab === 'trending' ? 'bg-app-primary' : ''
            }`}
          >
            <AppSubtitle
              className={`text-sm font-semibold ${
                tab === 'trending' ? 'text-white' : 'text-app-muted-fg'
              }`}
            >
              Trending
            </AppSubtitle>
          </Pressable>

          <Pressable
            onPress={() => setTab('personal')}
            className={`flex-1 items-center rounded-full py-2 ${
              tab === 'personal' ? 'bg-app-primary' : ''
            }`}
          >
            <AppSubtitle
              className={`text-sm font-semibold ${
                tab === 'personal' ? 'text-white' : 'text-app-muted-fg'
              }`}
            >
              For You
            </AppSubtitle>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const contentContainerStyle = React.useMemo(
    () => ({
      paddingTop: headerHeight + 10,
      paddingBottom: 132,
      paddingHorizontal: 16,
    }),
    [headerHeight],
  );

  const ListHeader = React.useMemo(
    () => (
      <>
        {intro}
        {segmented}
      </>
    ),
    [intro, segmented],
  );

  return (
    <FeedScrollProvider value={feedScrollContextValue}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <Animated.View
          className="absolute left-0 right-0 top-0 z-20"
          style={headerAnimatedStyle}
        >
          <NewfeedsHeader />
        </Animated.View>

        {/* Feed */}
        {tab === 'trending' ? (
          <TrendingFeed
            onScroll={onScroll}
            scrollEnabled={scrollEnabled}
            listHeaderComponent={ListHeader}
            contentContainerStyle={contentContainerStyle}
          />
        ) : (
          <PersonalFeed
            onScroll={onScroll}
            scrollEnabled={scrollEnabled}
            listHeaderComponent={ListHeader}
            contentContainerStyle={contentContainerStyle}
          />
        )}
      </View>
    </FeedScrollProvider>
  );
}
