import { BottomSheet } from "heroui-native/bottom-sheet";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "~/lib/cn";

type AppBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  dismissible?: boolean;
  bodyClassName?: string;
  footerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  keyboardBehavior?: "interactive" | "extend" | "fillParent";
  keyboardBlurBehavior?: "none" | "restore";
  androidKeyboardInputMode?: "adjustPan" | "adjustResize";
};

export function AppBottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
  bodyClassName,
  footerClassName,
  titleClassName,
  descriptionClassName,
  keyboardBehavior = "interactive",
  keyboardBlurBehavior = "restore",
  androidKeyboardInputMode = "adjustPan",
}: AppBottomSheetProps) {
  const insets = useSafeAreaInsets();

  // Don't mount the sheet at all when not visible — prevents the
  // "ghost render" flash where @gorhom/bottom-sheet briefly shows
  // the handle before animating to the closed position.
  if (!visible) return null;

  return (
    <BottomSheet
      isOpen={visible}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
    >
      <BottomSheet.Portal>
        <BottomSheet.Overlay
          className="bg-slate-950/35"
          isCloseOnPress={dismissible}
        />
        <BottomSheet.Content
          enableDynamicSizing
          enablePanDownToClose={dismissible}
          keyboardBehavior={keyboardBehavior}
          keyboardBlurBehavior={keyboardBlurBehavior}
          android_keyboardInputMode={androidKeyboardInputMode}
          backgroundClassName="rounded-t-[32px] border border-b-0 border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark"
          contentContainerClassName="px-5 pt-3"
          handleIndicatorClassName="bg-app-border dark:bg-app-border-dark"
          contentContainerProps={{
            style: {
              paddingBottom: Math.max(insets.bottom, 16),
              alignItems: "stretch",
            },
          }}
        >
          {title ? (
            <BottomSheet.Title
              className={cn(
                "w-full text-2xl font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark",
                titleClassName,
              )}
            >
              {title}
            </BottomSheet.Title>
          ) : null}
          {description ? (
            <BottomSheet.Description
              className={cn(
                "mt-2 w-full text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark",
                descriptionClassName,
              )}
            >
              {description}
            </BottomSheet.Description>
          ) : null}
          {children ? (
            <View className={cn("mt-5 w-full", bodyClassName)}>{children}</View>
          ) : null}
          {footer ? (
            <View className={cn("mt-5 w-full gap-3", footerClassName)}>
              {footer}
            </View>
          ) : null}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
