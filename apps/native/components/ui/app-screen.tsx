import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTabBarAutoHide } from '~/components/navigation/use-tab-bar-auto-hide';
import { cn } from '~/lib/cn';

type ScreenProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppScreen({ children, className = '' }: ScreenProps) {
  return (
    <View className={cn('flex-1 bg-app-bg px-6 pt-5 pb-8 dark:bg-app-bg-dark', className)}>
      {children}
    </View>
  );
}

export function AppCenteredScreen({ children, className = '' }: ScreenProps) {
  return (
    <View
      className={cn(
        'flex-1 items-center justify-center bg-app-bg px-6 dark:bg-app-bg-dark',
        className,
      )}
    >
      {children}
    </View>
  );
}

export function AppScrollScreen({ children, className = '' }: ScreenProps) {
  const { handleScroll } = useTabBarAutoHide();

  return (
    <ScrollView
      className={cn('flex-1 bg-app-bg dark:bg-app-bg-dark', className)}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 32,
      }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
