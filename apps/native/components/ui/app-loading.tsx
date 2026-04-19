import { Spinner } from 'heroui-native/spinner';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type AppLoadingContentProps = {
  label?: string;
  description?: string;
};

type AppLoadingOverlayProps = AppLoadingContentProps & {
  visible: boolean;
};

export function AppLoadingBlock({
  label = 'Dang xu ly',
  description,
}: AppLoadingContentProps) {
  return (
    <View className="items-center justify-center gap-3 flex-1">
      <Spinner size="sm" color="default" />
      <Text className="text-center text-base font-semibold text-app-fg dark:text-app-fg-dark">
        {label}
      </Text>
      {description ? (
        <Text className="max-w-[18rem] text-center text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function AppLoadingOverlay({
  visible,
  label = 'Dang xu ly',
  description,
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
      <AppLoadingBlock label={label} description={description} />
    </View>
  );
}
