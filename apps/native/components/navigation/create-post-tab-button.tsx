import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type CreatePostTabButtonProps = {
  isActive: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

export function CreatePostTabButton({
  isActive,
  onPress,
  onLongPress,
}: CreatePostTabButtonProps) {
  const progress = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [isActive, progress]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.8, 1]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.12]) }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -6]) },
      { scale: interpolate(progress.value, [0, 1], [1, 1.07]) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, 4])}deg` },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg` },
    ],
  }));

  return (
    <View className="-mt-7 items-center justify-start">
      <View className="h-18 w-18 items-center justify-center">
        <Animated.View
          style={haloStyle}
          className="absolute h-18 w-18 rounded-full bg-app-primary/12 dark:bg-app-primary-dark/16"
        />
        <Animated.View
          style={haloStyle}
          className="absolute h-14.5 w-14.5 rounded-[22px] border border-white/50 bg-white/65 dark:border-slate-200/10 dark:bg-slate-950/18"
        />
        <Animated.View style={buttonStyle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tạo bài viết"
            onPress={onPress}
            onLongPress={onLongPress}
            disabled={isActive}
            className="h-15.5 w-15.5 items-center justify-center rounded-3xl bg-app-primary dark:bg-app-primary-dark"
            style={{
              boxShadow: isActive
                ? '0 22px 46px rgba(14, 165, 233, 0.42)'
                : '0 16px 30px rgba(14, 165, 233, 0.28)',
            }}
          >
            <Animated.View style={iconStyle}>
              <Ionicons name="add" size={26} color="#ffffff" />
            </Animated.View>
          </Pressable>
        </Animated.View>
        <Animated.View
          style={haloStyle}
          className="absolute bottom-3.5 right-3 h-2.5 w-2.5 rounded-full bg-white/80"
        />
      </View>
    </View>
  );
}
