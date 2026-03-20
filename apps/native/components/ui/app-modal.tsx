import { Dialog } from 'heroui-native/dialog';
import React from 'react';
import { View } from 'react-native';

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
    <Dialog isOpen={visible} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="bg-slate-950/40"
          isCloseOnPress={dismissible}
        />
        <Dialog.Content
          className="w-full max-w-md rounded-[28px] border border-app-border bg-app-surface p-5 dark:border-app-border-dark dark:bg-app-surface-dark"
          isSwipeable={false}
        >
          {title ? (
            <Dialog.Title className="text-2xl font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
              {title}
            </Dialog.Title>
          ) : null}
          {description ? (
            <Dialog.Description className="mt-2 text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
              {description}
            </Dialog.Description>
          ) : null}
          {children ? <View className="mt-5">{children}</View> : null}
          {footer ? <View className="mt-5 gap-3">{footer}</View> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
