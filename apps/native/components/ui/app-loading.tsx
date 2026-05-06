import { Spinner } from 'heroui-native/spinner';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cn } from '~/lib/cn';

type AppLoadingSize = 'sm' | 'md' | 'lg';
type AppLoadingVariant = 'default' | 'muted';

type AppLoadingContentProps = {
  label?: string;
  description?: string;
  size?: AppLoadingSize;
  variant?: AppLoadingVariant;
  icon?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

type AppInlineLoadingProps = {
  label?: string;
  size?: AppLoadingSize;
  className?: string;
};

type AppLoadingOverlayProps = AppLoadingContentProps & {
  visible: boolean;
};

export function AppInlineLoading({ label = 'Đang tải...', size = 'sm', className }: AppInlineLoadingProps) {
  return (
    <View className={cn('flex-row items-center justify-center gap-2', className)}>
      <Spinner size={size} color="default" />
      <Text className="text-sm font-medium text-app-muted-fg dark:text-app-muted-fg-dark">{label}</Text>
    </View>
  );
}

export function AppLoadingBlock({
  label = 'Đang xử lý',
  description,
  size = 'sm',
  variant = 'default',
  icon,
  className,
  contentClassName,
}: AppLoadingContentProps) {
  const titleClass =
    variant === 'muted'
      ? 'text-app-muted-fg dark:text-app-muted-fg-dark'
      : 'text-app-fg dark:text-app-fg-dark';

  return (
    <View className={cn('flex-1 items-center justify-center', className)}>
      <View className={cn('items-center justify-center gap-3', contentClassName)}>
        {icon ?? <Spinner size={size} color="default" />}
        <Text className={cn('text-center text-base font-semibold', titleClass)}>{label}</Text>
        {description ? (
          <Text className="max-w-[18rem] text-center text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function AppLoadingOverlay({
  visible,
  label = 'Đang xử lý',
  description,
  size = 'sm',
  variant = 'default',
  icon,
  className,
  contentClassName,
}: AppLoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      className="items-center justify-center bg-app-bg/78 px-6 dark:bg-app-bg-dark/82"
      pointerEvents="auto"
      style={StyleSheet.absoluteFillObject}
    >
      <AppLoadingBlock
        label={label}
        description={description}
        size={size}
        variant={variant}
        icon={icon}
        className={className}
        contentClassName={contentClassName}
      />
    </View>
  );
}
