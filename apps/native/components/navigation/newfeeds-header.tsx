import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { type ConversationDTO, useConversations } from '@repo/shared';
import { router } from 'expo-router';
import { Button } from 'heroui-native/button';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { Text, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getConversationLastActivity,
  getConversationUnreadState,
} from '~/components/chat/chat-helpers';
import { AppToast } from '~/components/ui/app-toast';
import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

export const NEWFEEDS_HEADER_BAR_HEIGHT = 52;
const MESSAGE_BADGE_MAX = 99;

type HeaderAction = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  href?: '/chat' | '/notifications' | '/(stack)/search';
};

const RIGHT_ACTIONS: HeaderAction[] = [
  { icon: 'search-outline', label: 'Tim kiem', href: '/(stack)/search' },
  { icon: 'notifications-outline', label: 'Thong bao', href: '/notifications' },
  { icon: 'chatbubble-outline', label: 'Nhan tin', href: '/chat' },
];

const formatBadgeCount = (value: number) =>
  value > MESSAGE_BADGE_MAX ? `${MESSAGE_BADGE_MAX}+` : String(value);

function HeaderActionButton({
  action,
  badgeCount = 0,
  onPress,
  iconColor,
}: {
  action: HeaderAction;
  badgeCount?: number;
  onPress: () => void;
  iconColor: string;
}) {
  const showBadge = badgeCount > 0;

  return (
    <View className="relative">
      <Button
        variant="ghost"
        className="h-10 w-10 min-h-10 rounded-full px-0"
        onPress={onPress}
      >
        <Ionicons name={action.icon} size={20} color={iconColor} />
      </Button>

      {showBadge ? (
        <View className="absolute -right-1 -top-1 min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5">
          <Text className="text-[10px] font-extrabold leading-none text-white">
            {formatBadgeCount(badgeCount)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function NewfeedsHeader() {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const { toast } = useToast();
  const { isLoaded, userId } = useAuth();
  const colors = appThemeColors[resolvedTheme];
  const { data } = useConversations(
    { limit: 10 },
    { enabled: isLoaded && !!userId },
  );

  const unreadChatCount = React.useMemo(() => {
    if (!userId) {
      return 0;
    }

    const conversationMap = new Map<string, ConversationDTO>();

    for (const page of data?.pages ?? []) {
      for (const conversation of page.data) {
        conversationMap.set(conversation._id, conversation);
      }
    }

    return Array.from(conversationMap.values())
      .sort(
        (left, right) =>
          getConversationLastActivity(right).getTime() -
          getConversationLastActivity(left).getTime(),
      )
      .filter((conversation) => !conversation.hiddenFor?.includes(userId))
      .slice(0, 10)
      .reduce(
        (count, conversation) =>
          count + (getConversationUnreadState(conversation, userId) ? 1 : 0),
        0,
      );
  }, [data?.pages, userId]);

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
          <Image
            source={require('~/assets/icon.png')}
            className="h-8 w-8 rounded-lg"
            resizeMode="contain"
          />
          <Text className="text-2xl font-extrabold tracking-tight text-app-primary dark:text-app-primary-dark">
            Sentimeta
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          {RIGHT_ACTIONS.map((action) => (
            <HeaderActionButton
              key={action.label}
              action={action}
              badgeCount={action.href === '/chat' ? unreadChatCount : 0}
              iconColor={colors.primary}
              onPress={() => handleActionPress(action)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
