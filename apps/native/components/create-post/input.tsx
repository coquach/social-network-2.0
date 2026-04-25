import { Ionicons } from '@expo/vector-icons';
import { Audience } from '@repo/shared';
import React from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useCreatePostContext } from './context';

const AUDIENCE_OPTIONS: Array<{
  value: Audience;
  label: string;
  icon: 'globe-outline' | 'people-outline' | 'lock-closed-outline';
}> = [
  { value: Audience.PUBLIC, label: 'Công khai', icon: 'globe-outline' },
  { value: Audience.FRIENDS, label: 'Bạn bè', icon: 'people-outline' },
  {
    value: Audience.ONLY_ME,
    label: 'Chỉ mình tôi',
    icon: 'lock-closed-outline',
  },
];

export function Input() {
  const {
    content,
    setContent,
    audience,
    selectedFeeling,
    isPending,
    displayName,
    avatarUrl,
    isPrivacyChangeable,
    placeholder,
    autoFocusInput,
    maxLength,
    charCount,
    openAudienceSelector,
  } = useCreatePostContext();
  const inputRef = React.useRef<TextInput | null>(null);
  const [inputHeight, setInputHeight] = React.useState(136);
  const focusProgress = useSharedValue(0);

  const currentAudienceOption = React.useMemo(() => {
    return AUDIENCE_OPTIONS.find((option) => option.value === audience);
  }, [audience]);

  const audienceLabel = currentAudienceOption?.label ?? 'Công khai';

  React.useEffect(() => {
    if (autoFocusInput) {
      inputRef.current?.focus();
    }
  }, [autoFocusInput]);

  const inputShellStyle = useAnimatedStyle(() => {
    return {
      borderColor: focusProgress.value > 0.5 ? '#38bdf8' : '#dbe3ef',
      backgroundColor: focusProgress.value > 0.5 ? '#f8fcff' : '#ffffff',
    };
  });

  return (
    <View className="px-4 pt-3">
      <View className="flex-row items-start gap-3 pb-3">
        <View className="h-11 w-11 overflow-hidden rounded-full bg-app-surface-elevated dark:bg-app-surface-elevated-dark">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Ionicons name="person" size={20} color="#64748b" />
            </View>
          )}
        </View>

        <View className="min-w-0 flex-1 gap-1.5">
          <Text className="text-[15px] font-semibold text-app-fg dark:text-app-fg-dark">
            {displayName}
          </Text>

          {isPrivacyChangeable ? (
            <Pressable
              onPress={() => {
                openAudienceSelector();
              }}
              className="self-start flex-row items-center gap-1.5 rounded-full border border-app-border bg-app-surface-elevated px-3 py-1.5 dark:border-app-border-dark dark:bg-app-surface-elevated-dark"
            >
              <Ionicons
                name={currentAudienceOption?.icon ?? 'people-outline'}
                size={13}
                color="#64748b"
              />
              <Text className="text-xs font-medium text-app-muted-fg dark:text-app-muted-fg-dark">
                {audienceLabel}
              </Text>
              <Ionicons name="chevron-down" size={13} color="#64748b" />
            </Pressable>
          ) : null}

          {selectedFeeling ? (
            <Text className="text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
              đang cảm thấy {selectedFeeling.emoji} {selectedFeeling.name}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="border-t border-app-border pt-3 dark:border-app-border-dark">
        <Animated.View
          style={inputShellStyle}
          className="rounded-2xl border px-3 py-3 dark:border-app-border-dark dark:bg-app-surface-dark"
        >
          <TextInput
            ref={inputRef}
            value={content}
            onChangeText={setContent}
            multiline
            autoFocus={autoFocusInput}
            textAlignVertical="top"
            editable={!isPending}
            placeholder={placeholder}
            placeholderTextColor="#7d92a7"
            maxLength={maxLength}
            onFocus={() => {
              focusProgress.value = withTiming(1, {
                duration: 160,
                easing: Easing.out(Easing.cubic),
              });
            }}
            onBlur={() => {
              focusProgress.value = withTiming(0, {
                duration: 150,
                easing: Easing.out(Easing.cubic),
              });
            }}
            onContentSizeChange={(event) => {
              const nextHeight = Math.max(
                136,
                Math.min(280, event.nativeEvent.contentSize.height + 12),
              );
              setInputHeight(nextHeight);
            }}
            style={{ height: inputHeight, fontSize: 17, lineHeight: 24 }}
            className="text-app-fg dark:text-app-fg-dark"
          />
        </Animated.View>
      </View>

      <View className="flex-row items-center justify-between border-b border-app-border pb-3 pt-2 dark:border-app-border-dark">
        <Text className="text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
          {charCount}/{maxLength} kí tự
        </Text>
      </View>
    </View>
  );
}
