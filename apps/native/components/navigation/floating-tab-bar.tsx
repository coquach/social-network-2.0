import { useUser } from '@clerk/expo';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

import { CreatePostTabButton } from './create-post-tab-button';
import { TabBarButton } from './tab-bar-button';
import { useTabBarVisibility } from './tab-bar-visibility-context';
import { useCreatePostModal } from '@repo/shared/store/useCreatePostModal';

const TAB_BAR_SHOW_DURATION = 320;
const TAB_BAR_HIDE_DURATION = 500;

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
  const { user } = useUser();
  const { resolvedTheme } = useAppTheme();
  const { isVisible } = useTabBarVisibility();
  const colors = appThemeColors[resolvedTheme];
  const isCreateSheetOpen = useCreatePostModal((state) => state.isOpen);
  const openCreatePost = React.useCallback(() => {
    if (!useCreatePostModal.getState().isOpen) {
      useCreatePostModal.getState().open();
    }
  }, []);
  const tabBarVisibility = useSharedValue(1);

  React.useEffect(() => {
    tabBarVisibility.value = withTiming(isVisible ? 1 : 0, {
      duration: isVisible ? TAB_BAR_SHOW_DURATION : TAB_BAR_HIDE_DURATION,
    });
  }, [isVisible, tabBarVisibility]);

  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      opacity: tabBarVisibility.value,
      transform: [
        {
          translateY: (1 - tabBarVisibility.value) * 140,
        },
      ],
    };
  });

  const routesByName = React.useMemo(() => {
    return state.routes.reduce<
      Partial<
        Record<
          keyof typeof TAB_META,
          { index: number; key: string; name: string; params?: object }
        >
      >
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
          avatarUrl={name === 'profile' ? (user?.imageUrl ?? null) : null}
          activeColor={colors.primary}
          inactiveColor={colors.mutedForeground}
          isFocused={focused}
          onPress={onPress}
          onLongPress={onLongPress}
        />
      );
    },
    [
      colors.mutedForeground,
      colors.primary,
      navigation,
      routesByName,
      state.index,
      user?.imageUrl,
    ],
  );

  return (
    <>
      <Animated.View
        pointerEvents={isVisible && !isCreateSheetOpen ? 'box-none' : 'none'}
        className="absolute bottom-0 left-0 right-0"
        style={[
          { paddingBottom: Math.max(insets.bottom, 10) },
          animatedTabBarStyle,
        ]}
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
              onPress={openCreatePost}
            />
            <View className="flex-1 flex-row items-end justify-between pl-2">
              {RIGHT_TABS.map(renderTab)}
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
