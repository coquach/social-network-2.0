import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  dismissible?: boolean;
};

export function AppModal({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
}: AppModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-slate-950/40 px-6">
        <Pressable className="absolute inset-0" onPress={dismissible ? onClose : undefined} />
        <View className="w-full max-w-md rounded-[28px] border border-app-border bg-app-surface p-5 dark:border-app-border-dark dark:bg-app-surface-dark">
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
