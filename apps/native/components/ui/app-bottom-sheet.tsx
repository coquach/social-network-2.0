import { BottomSheet } from 'heroui-native/bottom-sheet';
import React from 'react';
import { View } from 'react-native';
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
    <BottomSheet isOpen={visible} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay
          className="bg-slate-950/35"
          isCloseOnPress={dismissible}
        />
        <BottomSheet.Content
          enableDynamicSizing
          enablePanDownToClose={dismissible}
          backgroundClassName="rounded-t-[32px] border border-b-0 border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark"
          contentContainerClassName="px-5 pt-3"
          handleIndicatorClassName="bg-app-border dark:bg-app-border-dark"
          contentContainerProps={{ style: { paddingBottom: Math.max(insets.bottom, 16) } }}
        >
          {title ? (
            <BottomSheet.Title className="text-2xl font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
              {title}
            </BottomSheet.Title>
          ) : null}
          {description ? (
            <BottomSheet.Description className="mt-2 text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
              {description}
            </BottomSheet.Description>
          ) : null}
          {children ? <View className="mt-5">{children}</View> : null}
          {footer ? <View className="mt-5 gap-3">{footer}</View> : null}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
