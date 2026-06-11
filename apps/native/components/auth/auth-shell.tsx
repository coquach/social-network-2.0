import React from 'react';
import { View } from 'react-native';
import { AppKeyboardScrollView } from '~/components/ui/app-keyboard-scroll-view';

type AuthShellProps = {
  children: React.ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <AppKeyboardScrollView
      className="flex-1 bg-app-bg dark:bg-app-bg-dark"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 28,
      }}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
      bottomOffset={20}
    >
      <View
        pointerEvents="none"
        className="absolute -right-20 -top-10 h-64 w-64 rounded-full bg-app-primary/20 dark:bg-app-primary-dark/15"
      />
      <View
        pointerEvents="none"
        className="absolute left-6 top-28 h-20 w-20 rounded-full border border-app-border/60 bg-app-surface/80 dark:border-app-border-dark/50 dark:bg-app-surface-dark/60"
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-16 -left-20 h-72 w-72 rounded-full bg-app-primary/10 dark:bg-app-primary-dark/10"
      />
      <View className="w-full max-w-md self-center gap-5">{children}</View>
    </AppKeyboardScrollView>
  );
}
