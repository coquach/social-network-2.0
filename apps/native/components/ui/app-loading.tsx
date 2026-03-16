import React from 'react';
import { ActivityIndicator, Modal, Text, View } from 'react-native';

type AppLoadingContentProps = {
  label?: string;
  description?: string;
};

type AppLoadingOverlayProps = AppLoadingContentProps & {
  visible: boolean;
};

export function AppLoadingBlock({
  label = 'Đang xử lý',
  description,
}: AppLoadingContentProps) {
  return (
    <View className="items-center gap-3 rounded-3xl border border-app-border bg-app-surface px-5 py-6 dark:border-app-border-dark dark:bg-app-surface-dark">
      <ActivityIndicator size="small" color="#0ea5e9" />
      <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">{label}</Text>
      {description ? (
        <Text className="text-center text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function AppLoadingOverlay({
  visible,
  label = 'Đang xử lý',
  description,
}: AppLoadingOverlayProps) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 items-center justify-center bg-slate-950/35 px-6">
        <View className="w-full max-w-xs">
          <AppLoadingBlock label={label} description={description} />
        </View>
      </View>
    </Modal>
  );
}
