import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AppBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  dismissible?: boolean;
};

export function AppBottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
}: AppBottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-slate-950/35">
        <Pressable className="flex-1" onPress={dismissible ? onClose : undefined} />
        <View
          className="rounded-t-[32px] border border-b-0 border-app-border bg-app-surface px-5 pt-3 dark:border-app-border-dark dark:bg-app-surface-dark"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="mb-4 items-center">
            <View className="h-1.5 w-14 rounded-full bg-app-border dark:bg-app-border-dark" />
          </View>
          {title ? (
            <Text className="text-2xl font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
              {title}
            </Text>
          ) : null}
          {description ? (
            <Text className="mt-2 text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
              {description}
            </Text>
          ) : null}
          {children ? <View className="mt-5">{children}</View> : null}
          {footer ? <View className="mt-5 gap-3">{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}
