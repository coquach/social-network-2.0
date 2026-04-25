import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import React from "react";
import { Keyboard, Pressable, View, useWindowDimensions } from "react-native";
import { usePathname } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AssistantChatSheet } from "~/components/chatbot/assistant-chat-sheet";
import { useAppTheme } from "~/providers/theme-provider";
import { getItem, setItem } from "~/utils/storage";

const BUBBLE_SIZE = 58;
const BUBBLE_MARGIN = 12;
const SNAP_SPRING = {
  damping: 17,
  stiffness: 220,
};
const BUBBLE_POSITION_STORAGE_KEY = "assistant-bubble-position:v1";

type SavedBubblePosition = {
  x: number;
  y: number;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const isAllowedPathname = (pathname: string): boolean => {
  if (!pathname) {
    return false;
  }

  if (pathname.startsWith("/chat")) {
    return false;
  }

  return (
    pathname.startsWith("/newfeeds") ||
    pathname.startsWith("/groups") ||
    pathname.startsWith("/sentiment") ||
    pathname.startsWith("/profile")
  );
};

export function AssistantOverlay() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const { width, height } = useWindowDimensions();
  const { colors } = useAppTheme();
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const canShow = isLoaded && isSignedIn && isAllowedPathname(pathname) && !isKeyboardVisible;

  const minX = BUBBLE_MARGIN;
  const maxX = Math.max(BUBBLE_MARGIN, width - BUBBLE_SIZE - BUBBLE_MARGIN);
  const minY = Math.max(insets.top + 6, BUBBLE_MARGIN);
  const maxY = Math.max(
    minY,
    height - BUBBLE_SIZE - Math.max(insets.bottom + 88, 104),
  );

  const translateX = useSharedValue(maxX);
  const translateY = useSharedValue(maxY);
  const bubbleScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const gestureDistance = useSharedValue(0);
  const gestureStartedAt = useSharedValue(0);

  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadPosition = async () => {
      const raw = await getItem(BUBBLE_POSITION_STORAGE_KEY);
      if (!raw || !isMounted) {
        return;
      }

      try {
        const parsed = JSON.parse(raw) as SavedBubblePosition;
        if (typeof parsed.x !== "number" || typeof parsed.y !== "number") {
          return;
        }

        translateX.value = clamp(parsed.x, minX, maxX);
        translateY.value = clamp(parsed.y, minY, maxY);
      } catch (error) {
        console.error("[assistant] failed to parse bubble position:", error);
      }
    };

    void loadPosition();

    return () => {
      isMounted = false;
    };
  }, [maxX, maxY, minX, minY, translateX, translateY]);

  React.useEffect(() => {
    if (isSheetOpen) {
      pulseScale.value = withTiming(1, { duration: 120 });
      return;
    }

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1,
      false,
    );
  }, [isSheetOpen, pulseScale]);

  React.useEffect(() => {
    translateX.value = clamp(translateX.value, minX, maxX);
    translateY.value = clamp(translateY.value, minY, maxY);
  }, [maxX, maxY, minX, minY, translateX, translateY]);

  const persistPosition = React.useCallback((x: number, y: number) => {
    const payload: SavedBubblePosition = { x, y };
    void setItem(BUBBLE_POSITION_STORAGE_KEY, JSON.stringify(payload));
  }, []);

  const openSheet = React.useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  const panGesture = React.useMemo(() => {
    return Gesture.Pan()
      .onBegin(() => {
        startX.value = translateX.value;
        startY.value = translateY.value;
        gestureDistance.value = 0;
        gestureStartedAt.value = Date.now();
        bubbleScale.value = withSpring(1.08, SNAP_SPRING);
      })
      .onUpdate((event) => {
        const nextX = clamp(startX.value + event.translationX, minX, maxX);
        const nextY = clamp(startY.value + event.translationY, minY, maxY);

        translateX.value = nextX;
        translateY.value = nextY;
        gestureDistance.value = Math.abs(event.translationX) + Math.abs(event.translationY);
      })
      .onFinalize(() => {
        const durationMs = Date.now() - gestureStartedAt.value;
        const isTap = gestureDistance.value < 8 && durationMs < 220;

        if (isTap) {
          scheduleOnRN(openSheet);
          bubbleScale.value = withSpring(1, SNAP_SPRING);
          return;
        }

        const centerX = translateX.value + BUBBLE_SIZE / 2;
        const targetX = centerX < width / 2 ? minX : maxX;
        const targetY = clamp(translateY.value, minY, maxY);

        translateX.value = withSpring(targetX, SNAP_SPRING, (finished) => {
          if (finished) {
            scheduleOnRN(persistPosition, targetX, targetY);
          }
        });
        translateY.value = withSpring(targetY, SNAP_SPRING);
        bubbleScale.value = withSpring(1, SNAP_SPRING);
      });
  }, [
    bubbleScale,
    gestureDistance,
    gestureStartedAt,
    maxX,
    maxY,
    minX,
    minY,
    openSheet,
    persistPosition,
    startX,
    startY,
    translateX,
    translateY,
    width,
  ]);

  const bubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: bubbleScale.value * pulseScale.value },
      ],
    };
  });

  if (!canShow) {
    return null;
  }

  return (
    <>
      <View pointerEvents="box-none" className="absolute inset-0 z-[60]">
        <GestureDetector gesture={panGesture}>
          <Animated.View className="absolute" style={bubbleStyle}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open AI assistant"
              className="items-center justify-center rounded-full"
              style={{
                width: BUBBLE_SIZE,
                height: BUBBLE_SIZE,
                backgroundColor: colors.primary,
                shadowColor: "#0f172a",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.24,
                shadowRadius: 14,
                elevation: 8,
              }}
            >
              <Ionicons name="sparkles" size={24} color="#ffffff" />
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>

      <AssistantChatSheet
        visible={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
        }}
      />
    </>
  );
}
