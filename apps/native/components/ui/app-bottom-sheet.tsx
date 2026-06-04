import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useRef } from 'react';
import { Keyboard, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appThemeColors } from '~/constants/theme';
import { cn } from '~/lib/cn';
import { useAppTheme } from '~/providers/theme-provider';

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
  keyboardBehavior?: 'interactive' | 'extend' | 'fillParent';
  keyboardBlurBehavior?: 'none' | 'restore';
  androidKeyboardInputMode?: 'adjustPan' | 'adjustResize';
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
  keyboardBehavior = 'interactive',
  keyboardBlurBehavior = 'restore',
  androidKeyboardInputMode = 'adjustPan',
}: AppBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { resolvedTheme } = useAppTheme();
  const colors = appThemeColors[resolvedTheme];
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      Keyboard.dismiss();
      if (hasOpenedRef.current) {
        bottomSheetRef.current?.dismiss();
      }
      return;
    }

    hasOpenedRef.current = true;
    const frame = requestAnimationFrame(() => {
      bottomSheetRef.current?.present();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [visible]);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.4}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={dismissible ? 'close' : 'none'}
      />
    ),
    [dismissible],
  );

  if (!visible && !hasOpenedRef.current) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      enableDynamicSizing={true}
      enablePanDownToClose={dismissible}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior={keyboardBlurBehavior}
      android_keyboardInputMode={androidKeyboardInputMode}
      backdropComponent={renderBackdrop}
      onDismiss={() => {
        hasOpenedRef.current = false;
        Keyboard.dismiss();
        onClose();
      }}
      backgroundStyle={{
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          alignItems: 'stretch',
        }}
        className="px-5 pt-3"
      >
        {title ? (
          <Text
            className={cn(
              'w-full text-2xl font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark',
              titleClassName,
            )}
          >
            {title}
          </Text>
        ) : null}
        {description ? (
          <Text
            className={cn(
              'mt-2 w-full text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark',
              descriptionClassName,
            )}
          >
            {description}
          </Text>
        ) : null}
        {children ? (
          <View className={cn('mt-5 w-full', bodyClassName)}>{children}</View>
        ) : null}
        {footer ? (
          <View className={cn('mt-5 w-full gap-3', footerClassName)}>
            {footer}
          </View>
        ) : null}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
