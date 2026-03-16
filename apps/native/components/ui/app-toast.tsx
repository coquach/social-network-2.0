import React from 'react';
import { Text, View } from 'react-native';

export type AppToastVariant = 'info' | 'success' | 'warning' | 'error';

export type AppToastData = {
  title: string;
  message?: string;
  variant?: AppToastVariant;
};

const variantClasses: Record<AppToastVariant, { container: string; accent: string }> = {
  info: {
    container: 'border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10',
    accent: 'bg-sky-500',
  },
  success: {
    container: 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10',
    accent: 'bg-emerald-500',
  },
  warning: {
    container: 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10',
    accent: 'bg-amber-500',
  },
  error: {
    container: 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10',
    accent: 'bg-rose-500',
  },
};

type AppToastProps = {
  toast: AppToastData;
};

export function AppToast({ toast }: AppToastProps) {
  const variant = toast.variant ?? 'info';
  const styles = variantClasses[variant];

  return (
    <View className={`overflow-hidden rounded-2xl border px-4 py-3 ${styles.container}`}>
      <View className={`absolute bottom-0 left-0 top-0 w-1 ${styles.accent}`} />
      <View className="pl-1">
        <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">{toast.title}</Text>
        {toast.message ? (
          <Text className="mt-1 text-sm leading-5 text-app-muted-fg dark:text-app-muted-fg-dark">
            {toast.message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
