import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { cn } from "~/lib/cn";

type FloatingActionButtonProps = {
  isActive: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  accessibilityLabel: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  containerClassName?: string;
  buttonClassName?: string;
};

export function FloatingActionButton({
  isActive,
  onPress,
  onLongPress,
  accessibilityLabel,
  icon = "add",
  containerClassName,
  buttonClassName,
}: FloatingActionButtonProps) {
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
    <View className={cn("items-center justify-start", containerClassName)}>
      <View className="h-[72px] w-[72px] items-center justify-center">
        <Animated.View
          style={haloStyle}
          className="absolute h-[72px] w-[72px] rounded-full bg-app-primary/12 dark:bg-app-primary-dark/16"
        />
        <Animated.View
          style={haloStyle}
          className="absolute h-[58px] w-[58px] rounded-[22px] border border-white/50 bg-white/65 dark:border-slate-200/10 dark:bg-slate-950/18"
        />
        <Animated.View style={buttonStyle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            className={cn(
              "h-[62px] w-[62px] items-center justify-center rounded-[24px] bg-app-primary dark:bg-app-primary-dark",
              buttonClassName,
            )}
            style={{
              boxShadow: isActive
                ? "0 22px 46px rgba(14, 165, 233, 0.42)"
                : "0 16px 30px rgba(14, 165, 233, 0.28)",
            }}
          >
            <Animated.View style={iconStyle}>
              <Ionicons name={icon} size={26} color="#ffffff" />
            </Animated.View>
          </Pressable>
        </Animated.View>
        <Animated.View
          style={haloStyle}
          className="absolute bottom-[14px] right-[12px] h-2.5 w-2.5 rounded-full bg-white/80"
        />
      </View>
    </View>
  );
}
