import { feelingsUI } from '@repo/shared';
import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  type LayoutRectangle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { FeedTabs } from './feed-tabs';
import { MusicCarousel } from './music-carousel';
import type { FeedEmotion, FeedTab } from './types';

const COLLAPSE_DISTANCE = 92;
const CAROUSEL_MAX_HEIGHT = 116;

export const MUSIC_BAR_COLLAPSED_HEIGHT = 50;
export const MUSIC_BAR_EXPANDED_HEIGHT =
  MUSIC_BAR_COLLAPSED_HEIGHT + CAROUSEL_MAX_HEIGHT + 10;

type MusicBarProps = {
  tab: FeedTab;
  emotion: FeedEmotion;
  onTabChange: (tab: FeedTab) => void;
  onEmotionChange: (emotion: FeedEmotion) => void;
  scrollY: SharedValue<number>;
};

function FeedHeaderComponent({
  tab,
  emotion,
  onTabChange,
  onEmotionChange,
  scrollY,
}: MusicBarProps) {
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [buttonLayout, setButtonLayout] =
    React.useState<LayoutRectangle | null>(null);

  const emotionButtonRef = React.useRef<View>(null);

  const emotionItems = React.useMemo(
    () => [
      { key: 'all' as const, emoji: '✨', value: 'all' as const, label: 'All' },
      ...feelingsUI.map((item) => ({
        key: item.type,
        emoji: item.emoji,
        value: item.type.toLowerCase() as FeedEmotion,
        label: item.name,
      })),
    ],
    [],
  );

  const selectedEmotionItem = React.useMemo(() => {
    if (emotion === 'all') {
      return { emoji: '✨', label: 'All' };
    }

    const mapped = emotionItems.find((item) => item.value === emotion);
    return mapped ?? { emoji: '✨', label: 'All' };
  }, [emotion, emotionItems]);

  const openPicker = React.useCallback(() => {
    if (pickerVisible) {
      setPickerVisible(false);
      return;
    }

    emotionButtonRef.current?.measureInWindow((x, y, width, height) => {
      setButtonLayout({ x, y, width, height });
      setPickerVisible(true);
    });
  }, [pickerVisible]);

  const closePicker = React.useCallback(() => {
    setPickerVisible(false);
  }, []);

  const pickerPositionStyle = React.useMemo(() => {
    if (!buttonLayout) {
      return {
        top: 80,
        right: 16,
      };
    }

    return {
      top: buttonLayout.y + buttonLayout.height + 8,
      left: Math.max(12, buttonLayout.x - 176),
    };
  }, [buttonLayout]);

  const collapseProgress = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      paddingTop: interpolate(progress, [0, 1], [8, 4]),
      paddingBottom: interpolate(progress, [0, 1], [8, 4]),
    };
  });

  const carouselStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, COLLAPSE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      height: interpolate(progress, [0, 1], [CAROUSEL_MAX_HEIGHT, 0]),
      opacity: interpolate(progress, [0, 1], [1, 0]),
      marginTop: interpolate(progress, [0, 1], [8, 0]),
      transform: [
        { translateY: interpolate(progress, [0, 1], [0, -20]) },
        { scale: interpolate(progress, [0, 1], [1, 0.96]) },
      ],
    };
  });

  return (
    <>
      <Animated.View
        className="border-b border-app-border bg-app-background px-4 dark:border-app-border-dark dark:bg-app-background-dark"
        style={collapseProgress}
      >
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <FeedTabs tab={tab} onChange={onTabChange} />
          </View>

          <Pressable
            ref={emotionButtonRef}
            accessibilityRole="button"
            accessibilityLabel="Open emotion filter"
            onPress={openPicker}
            className={`h-11 w-11 items-center justify-center rounded-full border ${
              emotion === 'all'
                ? 'border-app-border bg-app-surface-elevated dark:border-app-border-dark dark:bg-app-surface-elevated-dark'
                : 'border-app-primary/40 bg-app-primary/10 dark:border-app-primary-dark/40 dark:bg-app-primary-dark/20'
            }`}
          >
            <Text className="text-xl leading-6">
              {selectedEmotionItem.emoji}
            </Text>
          </Pressable>
        </View>

        <Animated.View style={[carouselStyle, { overflow: 'hidden' }]}>
          <MusicCarousel />
        </Animated.View>

        <Modal
          transparent
          visible={pickerVisible}
          animationType="fade"
          onRequestClose={closePicker}
        >
          <Pressable className="flex-1 bg-black/5" onPress={closePicker}>
            <View
              className="absolute z-40 w-56 rounded-3xl border border-app-border bg-app-surface p-3 shadow-sm dark:border-app-border-dark dark:bg-app-surface-dark"
              style={pickerPositionStyle}
            >
              <View className="flex-row flex-wrap justify-between">
                {emotionItems.map((item) => {
                  const isSelected = emotion === item.value;

                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => {
                        onEmotionChange(item.value);
                        closePicker();
                      }}
                      className={`h-11 w-11 items-center justify-center rounded-full ${
                        isSelected
                          ? 'border border-app-primary bg-app-primary/15 dark:border-app-primary-dark dark:bg-app-primary-dark/20'
                          : 'bg-app-surface-elevated dark:bg-app-surface-elevated-dark'
                      }`}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                    >
                      <Text className="text-2xl leading-7">{item.emoji}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Pressable>
        </Modal>
      </Animated.View>
    </>
  );
}

export const FeedHeader = React.memo(FeedHeaderComponent);
