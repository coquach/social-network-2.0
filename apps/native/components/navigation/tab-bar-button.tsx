import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type TabBarButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeColor: string;
  inactiveColor: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

export function TabBarButton({
  label,
  icon,
  activeColor,
  inactiveColor,
  isFocused,
  onPress,
  onLongPress,
}: TabBarButtonProps) {
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFocused, progress]);

  const capsuleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.5, 1]),
    transform: [
      { scaleX: interpolate(progress.value, [0, 1], [0.88, 1]) },
      { scaleY: interpolate(progress.value, [0, 1], [0.88, 1]) },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -1.5]) },
      { scale: interpolate(progress.value, [0, 1], [1, 1.08]) },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.72, 1]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -1]) }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      className="min-w-[72px] items-center justify-center py-2"
    >
      <View className="items-center">
        <View className="relative h-12 w-16 items-center justify-center">
          <Animated.View
            style={capsuleStyle}
            className="absolute h-12 w-16 rounded-[20px] bg-app-primary/12 dark:bg-app-primary-dark/18"
          />
          <Animated.View style={iconStyle}>
            <Ionicons
              name={icon}
              size={24}
              color={isFocused ? activeColor : inactiveColor}
            />
          </Animated.View>
        </View>
        <Animated.View style={labelStyle}>
          <Text
            className={`text-[11px] font-semibold ${
              isFocused
                ? 'text-app-primary dark:text-app-primary-dark'
                : 'text-app-muted-fg dark:text-app-muted-fg-dark'
            }`}
          >
            {label}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}
