import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
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
import { FeedHeader } from '~/components/newfeeds/feed-header';
import { RecommendedMusicSection } from '~/components/newfeeds/recommended-music-section';
import { useTabBarAutoHide } from '~/components/navigation/use-tab-bar-auto-hide';
import { FeedScrollProvider } from '~/contexts/feed-scroll-context';
import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';
import {
  mapFeedEmotionToApiEmotion,
  useFeedFilterStore,
} from '~/store/feed-filter-store';

import { PersonalFeed } from './components/personal-feed';
import { TrendingFeed } from './components/trending-feed';

const TOP_THRESHOLD = 12;
const DELTA_THRESHOLD = 8;
const HEADER_SHOW_DURATION = 240;
const HEADER_HIDE_DURATION = 200;
const EMOTION_DEBOUNCE_MS = 200;
const MUSIC_SECTION_HEIGHT = 170;
const FEED_FILTER_HEIGHT = 92;

export default function NewfeedsScreen() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const { handleOffsetChange } = useTabBarAutoHide();
  const colors = appThemeColors[resolvedTheme];

  const headerTranslateY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const lastScrollY = useSharedValue(0);
  const lastForwardedOffset = useSharedValue(0);

  const [scrollEnabled, setScrollEnabled] = React.useState(true);
  const feedType = useFeedFilterStore((state) => state.feedType);
  const emotion = useFeedFilterStore((state) => state.emotion);
  const setFeedType = useFeedFilterStore((state) => state.setFeedType);
  const setEmotion = useFeedFilterStore((state) => state.setEmotion);

  const [debouncedEmotion, setDebouncedEmotion] = React.useState(() =>
    mapFeedEmotionToApiEmotion(emotion),
  );

  const selectedApiEmotion = React.useMemo(
    () => mapFeedEmotionToApiEmotion(emotion),
    [emotion],
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmotion(selectedApiEmotion);
    }, EMOTION_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [selectedApiEmotion]);

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
      lastForwardedOffset.value = 0;
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
        lastForwardedOffset.value = nextOffset;
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

      if (Math.abs(nextOffset - lastForwardedOffset.value) >= DELTA_THRESHOLD) {
        scheduleOnRN(handleOffsetChange, nextOffset);
        lastForwardedOffset.value = nextOffset;
      }
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const stickyMusicBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const onTabChange = React.useCallback(
    (tab: 'trending' | 'personal') => {
      setFeedType(tab);
    },
    [setFeedType],
  );

  const onEmotionChange = React.useCallback(
    (nextEmotion: Parameters<typeof setEmotion>[0]) => {
      setEmotion(nextEmotion);
    },
    [setEmotion],
  );

  const contentContainerStyle = React.useMemo(
    () => ({
      paddingTop: headerHeight + MUSIC_SECTION_HEIGHT + FEED_FILTER_HEIGHT,
      paddingBottom: 132,
      paddingHorizontal: 16,
    }),
    [headerHeight],
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

        <Animated.View
          className="absolute left-0 right-0 z-10"
          style={[stickyMusicBarStyle, { top: headerHeight }]}
        >
          <View className="px-4 py-2">
            <RecommendedMusicSection />
          </View>
        </Animated.View>

        <Animated.View
          className="absolute left-0 right-0 z-[9]"
          style={[stickyMusicBarStyle, { top: headerHeight + MUSIC_SECTION_HEIGHT }]}
        >
          <FeedHeader
            tab={feedType}
            emotion={emotion}
            onTabChange={onTabChange}
            onEmotionChange={onEmotionChange}
          />
        </Animated.View>

        {/* Feed */}
        {feedType === 'trending' ? (
          <TrendingFeed
            mainEmotion={debouncedEmotion}
            onScroll={onScroll}
            scrollEnabled={scrollEnabled}
            contentContainerStyle={contentContainerStyle}
          />
        ) : (
          <PersonalFeed
            mainEmotion={debouncedEmotion}
            onScroll={onScroll}
            scrollEnabled={scrollEnabled}
            contentContainerStyle={contentContainerStyle}
          />
        )}
      </View>
    </FeedScrollProvider>
  );
}
