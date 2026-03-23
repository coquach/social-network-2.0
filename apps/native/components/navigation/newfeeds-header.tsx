import { Ionicons } from '@expo/vector-icons';
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
};

const RIGHT_ACTIONS: HeaderAction[] = [
  { icon: 'search-outline', label: 'Tìm kiếm' },
  { icon: 'notifications-outline', label: 'Thông báo' },
  { icon: 'chatbubble-outline', label: 'Nhắn tin' },
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
              message: 'Chức năng này sẽ được bổ sung ở bước tiếp theo.',
            }}
            toastProps={toastProps}
          />
        ),
      });
    },
    [toast],
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
            accessibilityLabel="Mở menu"
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
              onPress={() => handleComingSoon(action.label)}
            >
              <Ionicons name={action.icon} size={20} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
