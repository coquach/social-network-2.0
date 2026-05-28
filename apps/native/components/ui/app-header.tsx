import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button } from 'heroui-native/button';
import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '~/lib/cn';

type AppHeaderIconButtonProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  variant?: 'ghost' | 'secondary';
  iconSize?: number;
  iconColor?: string;
  className?: string;
};

type AppBackButtonProps = Omit<AppHeaderIconButtonProps, 'icon' | 'variant' | 'iconSize'>;

type AppStackHeaderProps = {
  title?: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: 'default' | 'bordered';
};

function HeaderSlot({ children }: { children?: React.ReactNode }) {
  return <View className="min-h-11 min-w-11 items-center justify-center">{children}</View>;
}

export function AppHeaderIconButton({
  icon,
  onPress,
  variant = 'secondary',
  iconSize = 20,
  iconColor = '#0ea5e9',
  className,
}: AppHeaderIconButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn('h-11 w-11 min-h-11 rounded-full px-0', className)}
      onPress={onPress}
    >
      <Ionicons name={icon} size={iconSize} color={iconColor} />
    </Button>
  );
}

export function AppBackButton({
  onPress,
  iconColor = '#0ea5e9',
  className,
}: AppBackButtonProps) {
  return (
    <AppHeaderIconButton
      icon="chevron-back"
      iconSize={22}
      iconColor={iconColor}
      variant="ghost"
      className={className}
      onPress={onPress ?? (() => router.back())}
    />
  );
}

export function AppHeader({
  title,
  subtitle,
  leading,
  trailing,
  children,
  className,
  contentClassName,
  variant = 'default',
}: AppStackHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn(
        'px-5 pb-4',
        variant === 'bordered' && 'border-b border-app-border px-4 dark:border-app-border-dark',
        className,
      )}
      style={{ paddingTop: Math.max(insets.top, 20) }}
    >
      <View className="flex-row items-center gap-3">
        <HeaderSlot>{leading ?? <AppBackButton />}</HeaderSlot>

        <View
          className={cn(
            'flex-1',
            children ? contentClassName : cn('items-center justify-center', contentClassName),
          )}
        >
          {children ? (
            children
          ) : (
            <>
              {title ? (
                <Text
                  numberOfLines={1}
                  className="text-center text-2xl font-extrabold text-app-fg dark:text-app-fg-dark"
                >
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text
                  numberOfLines={1}
                  className="mt-1 text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark"
                >
                  {subtitle}
                </Text>
              ) : null}
            </>
          )}
        </View>

        <HeaderSlot>{trailing}</HeaderSlot>
      </View>
    </View>
  );
}
