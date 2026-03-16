import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

import { CreatePostSheet } from './create-post-sheet';
import { CreatePostTabButton } from './create-post-tab-button';
import { TabBarButton } from './tab-bar-button';

const TAB_META = {
  newfeeds: { label: 'Bảng tin', icon: 'newspaper-outline' as const },
  groups: { label: 'Nhóm', icon: 'people-outline' as const },
  sentiment: { label: 'Cảm xúc', icon: 'sparkles-outline' as const },
  profile: { label: 'Cá nhân', icon: 'person-circle-outline' as const },
};

const LEFT_TABS: Array<keyof typeof TAB_META> = ['newfeeds', 'groups'];
const RIGHT_TABS: Array<keyof typeof TAB_META> = ['sentiment', 'profile'];

function isKnownTab(name: string): name is keyof typeof TAB_META {
  return name in TAB_META;
}

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const colors = appThemeColors[resolvedTheme];
  const [isCreateSheetOpen, setIsCreateSheetOpen] = React.useState(false);

  const routesByName = React.useMemo(() => {
    return state.routes.reduce<
      Partial<Record<keyof typeof TAB_META, { index: number; key: string; name: string; params?: object }>>
    >((accumulator, route, index) => {
      if (isKnownTab(route.name)) {
        accumulator[route.name] = {
          index,
          key: route.key,
          name: route.name,
          params: route.params,
        };
      }

      return accumulator;
    }, {});
  }, [state.routes]);

  const renderTab = React.useCallback(
    (name: keyof typeof TAB_META) => {
      const route = routesByName[name];

      if (!route) {
        return <View key={name} className="flex-1" />;
      }

      const focused = state.index === route.index;
      const meta = TAB_META[name];

      const onPress = () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!focused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      };

      const onLongPress = () => {
        navigation.emit({
          type: 'tabLongPress',
          target: route.key,
        });
      };

      return (
        <TabBarButton
          key={route.key}
          label={meta.label}
          icon={meta.icon}
          activeColor={colors.primary}
          inactiveColor={colors.mutedForeground}
          isFocused={focused}
          onPress={onPress}
          onLongPress={onLongPress}
        />
      );
    },
    [colors.mutedForeground, colors.primary, navigation, routesByName, state.index],
  );

  return (
    <>
      <View
        pointerEvents="box-none"
        className="absolute bottom-0 left-0 right-0"
        style={{ paddingBottom: Math.max(insets.bottom, 10) }}
      >
        <View className="px-4">
          <View
            className="flex-row items-end rounded-[40px] border border-app-border bg-app-surface px-3 pt-2 dark:border-app-border-dark dark:bg-app-surface-dark"
            style={{
              minHeight: 84,
              paddingBottom: Platform.OS === 'ios' ? 10 : 9,
              boxShadow: '0 -10px 30px rgba(15, 23, 42, 0.08)',
            }}
          >
            <View className="flex-1 flex-row items-end justify-between pr-2">
              {LEFT_TABS.map(renderTab)}
            </View>
            <CreatePostTabButton
              isActive={isCreateSheetOpen}
              onPress={() => {
                setIsCreateSheetOpen((current) => !current);
              }}
            />
            <View className="flex-1 flex-row items-end justify-between pl-2">
              {RIGHT_TABS.map(renderTab)}
            </View>
          </View>
        </View>
      </View>
      <CreatePostSheet
        visible={isCreateSheetOpen}
        onClose={() => {
          setIsCreateSheetOpen(false);
        }}
      />
    </>
  );
}
