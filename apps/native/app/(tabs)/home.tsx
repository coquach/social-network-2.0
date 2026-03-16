import { useUser } from '@clerk/expo';
import { Pressable, Text, View } from 'react-native';

import type { ThemePreference } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

const themeOptions: Array<{ label: string; value: ThemePreference }> = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function HomeScreen() {
  const { user } = useUser();
  const { themePreference, resolvedTheme, setThemePreference } = useAppTheme();

  return (
    <View className="flex-1 items-center justify-center bg-app-bg px-6 dark:bg-app-bg-dark">
      <Text className="mb-2 text-3xl font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
        Xin chào
      </Text>
      <Text className="text-center text-base text-app-muted-fg dark:text-app-muted-fg-dark">
        {user?.primaryEmailAddress?.emailAddress ?? 'Bạn đã đăng nhập bằng Clerk'}
      </Text>

      <View className="mt-8 w-full max-w-sm rounded-2xl border border-app-border bg-app-surface p-2 dark:border-app-border-dark dark:bg-app-surface-dark">
        <Text className="mb-2 px-1 text-xs font-semibold uppercase text-app-muted-fg dark:text-app-muted-fg-dark">
          Giao diện
        </Text>
        <View className="flex-row gap-2">
          {themeOptions.map((option) => {
            const isActive = themePreference === option.value;
            const optionContainerClass = isActive
              ? 'bg-app-primary dark:bg-app-primary-dark'
              : 'bg-app-surface-elevated dark:bg-app-surface-elevated-dark';
            const optionTextClass = isActive
              ? 'text-app-primary-fg dark:text-app-primary-fg-dark'
              : 'text-app-fg dark:text-app-fg-dark';

            return (
              <Pressable
                key={option.value}
                className={`flex-1 rounded-xl px-3 py-2 active:opacity-80 ${optionContainerClass}`}
                onPress={() => setThemePreference(option.value)}
              >
                <Text className={`text-center text-xs font-semibold ${optionTextClass}`}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-3 text-center text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
          Đang dùng: {resolvedTheme}
        </Text>
      </View>
    </View>
  );
}

