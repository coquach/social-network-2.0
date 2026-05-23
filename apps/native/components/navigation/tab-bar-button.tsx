import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

type TabBarButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  avatarUrl?: string | null;
  activeColor: string;
  inactiveColor: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

export function TabBarButton({
  label,
  icon,
  avatarUrl,
  activeColor,
  inactiveColor,
  isFocused,
  onPress,
  onLongPress,
}: TabBarButtonProps) {
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    // Sử dụng withSpring để tạo độ nảy mượt mà, tự nhiên
    progress.value = withSpring(isFocused ? 1 : 0, {
      damping: 12, // Độ cản (càng thấp càng nảy nhiều)
      stiffness: 150, // Độ cứng của lò xo (càng cao tốc độ nảy càng nhanh)
      mass: 1, // Khối lượng
    });
  }, [isFocused, progress]);

  const capsuleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]), // Ẩn hẳn khi chưa focus
    transform: [
      { scaleX: interpolate(progress.value, [0, 1], [0.7, 1]) },
      { scaleY: interpolate(progress.value, [0, 1], [0.7, 1]) },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      // Đẩy icon lên cao hơn một chút khi active
      { translateY: interpolate(progress.value, [0, 1], [0, -3]) },
      // Phóng to rõ rệt hơn (tăng từ 1.08 lên 1.25)
      { scale: interpolate(progress.value, [0, 1], [1, 1.25]) },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.72, 1]),
    transform: [
      // Nhường chỗ cho icon phóng to
      { translateY: interpolate(progress.value, [0, 1], [0, 2]) },
      // Tùy chọn: Bạn cũng có thể thu nhỏ text đi một chút khi icon to ra
      // { scale: interpolate(progress.value, [0, 1], [1, 0.9]) }
    ],
  }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      className="min-w-18 items-center justify-center py-2"
    >
      <View className="items-center">
        <View className="relative h-12 w-16 items-center justify-center">
          <Animated.View
            style={capsuleStyle}
            className="absolute h-12 w-16 rounded-[20px]"
          />
          <Animated.View style={iconStyle}>
            {avatarUrl ? (
              <View
                className="h-9 w-9 overflow-hidden rounded-full"
                style={{
                  borderWidth: isFocused ? 2 : 1.5,
                  borderColor: isFocused ? activeColor : inactiveColor,
                }}
              >
                <Image
                  source={{ uri: avatarUrl }}
                  resizeMode="cover"
                  style={{ height: '100%', width: '100%' }}
                />
              </View>
            ) : (
              <Ionicons
                name={icon}
                size={26}
                color={isFocused ? activeColor : inactiveColor}
              />
            )}
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
