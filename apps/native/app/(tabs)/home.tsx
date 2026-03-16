import { useUser } from '@clerk/expo';
import { Pressable, Text, View } from 'react-native';

import { AppCard } from '~/components/ui/app-card';
import { AppCenteredScreen } from '~/components/ui/app-screen';
import { AppEyebrow, AppSubtitle, AppTitle } from '~/components/ui/app-text';
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
    <AppCenteredScreen>
      <AppTitle className="mb-2 text-center text-3xl">Xin chào</AppTitle>
      <AppSubtitle className="text-center">
        {user?.primaryEmailAddress?.emailAddress ?? 'Bạn đã đăng nhập bằng Clerk'}
      </AppSubtitle>

      <AppCard className="mt-8 w-full max-w-sm p-2">
        <AppEyebrow className="mb-2 px-1">Giao diện</AppEyebrow>
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
      </AppCard>
    </AppCenteredScreen>
  );
}
