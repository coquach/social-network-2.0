import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppToast } from '~/components/ui/app-toast';
import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

export const NEWFEEDS_HEADER_BAR_HEIGHT = 52;

type HeaderAction = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  href?: '/chat';
};

const RIGHT_ACTIONS: HeaderAction[] = [
  { icon: 'search-outline', label: 'Tim kiem' },
  { icon: 'notifications-outline', label: 'Thong bao' },
  { icon: 'chatbubble-outline', label: 'Nhan tin', href: '/chat' },
];

export function NewfeedsHeader() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const { toast } = useToast();
  const colors = appThemeColors[resolvedTheme];

  const handleComingSoon = React.useCallback(
    (label: string) => {
      toast.show({
        duration: 2800,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: label,
              message: 'Chuc nang nay se duoc bo sung o buoc tiep theo.',
            }}
            toastProps={toastProps}
          />
        ),
      });
    },
    [toast],
  );

  const handleActionPress = React.useCallback(
    (action: HeaderAction) => {
      if (action.href) {
        router.push(action.href);
        return;
      }

      handleComingSoon(action.label);
    },
    [handleComingSoon],
  );

  return (
    <View
      className="border-b border-app-border/70 bg-app-bg/95 px-5 dark:border-app-border-dark/70 dark:bg-app-bg-dark/95"
      style={{
        paddingTop: insets.top,
        height: insets.top + NEWFEEDS_HEADER_BAR_HEIGHT,
      }}
    >
      <View className="flex-1 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mo menu"
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
            onPress={() => handleComingSoon('Menu')}
          >
            <Ionicons name="menu-outline" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-2xl font-extrabold tracking-tight text-app-primary dark:text-app-primary-dark">
            Sentimeta
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          {RIGHT_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
              onPress={() => handleActionPress(action)}
            >
              <Ionicons name={action.icon} size={20} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
