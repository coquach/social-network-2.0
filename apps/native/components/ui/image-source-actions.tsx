import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '~/providers/theme-provider';
import { appThemeColors } from '~/constants/theme';

type ImageSourceActionsProps = {
  visible: boolean;
  onClose: () => void;
  onPick: (source: 'library' | 'camera') => void;
  libraryLabel?: string;
  cameraLabel?: string;
};

export function ImageSourceActions({
  visible,
  onClose,
  onPick,
  libraryLabel = 'Chọn từ thư viện',
  cameraLabel = 'Chụp ảnh',
}: ImageSourceActionsProps) {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const colors = appThemeColors[resolvedTheme];
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      if (hasOpenedRef.current) {
        bottomSheetRef.current?.dismiss();
      }
      return;
    }
    hasOpenedRef.current = true;
    const frame = requestAnimationFrame(() => {
      bottomSheetRef.current?.present();
    });
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  const handlePick = (source: 'library' | 'camera') => {
    onPick(source);
    onClose();
  };

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.4}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  if (!visible && !hasOpenedRef.current) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={() => {
        hasOpenedRef.current = false;
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
        style={{ paddingBottom: Math.max(insets.bottom, 16), alignItems: 'stretch' }}
        className="px-5 pt-3"
      >
        <Text className="w-full text-center text-2xl font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
          Chọn nguồn ảnh
        </Text>
        <Text className="mt-2 w-full text-center text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
          Bạn muốn lấy ảnh từ đâu?
        </Text>

        <View className="mt-5 w-full gap-2">
          <Pressable
            onPress={() => handlePick('camera')}
            className="flex-row items-center gap-3 rounded-2xl bg-app-surface-elevated px-4 py-3 active:opacity-80 dark:bg-app-surface-elevated-dark"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-sky-500/15">
              <Ionicons name="camera-outline" size={18} color="#0ea5e9" />
            </View>
            <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">{cameraLabel}</Text>
          </Pressable>

          <Pressable
            onPress={() => handlePick('library')}
            className="flex-row items-center gap-3 rounded-2xl bg-app-surface-elevated px-4 py-3 active:opacity-80 dark:bg-app-surface-elevated-dark"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-sky-500/15">
              <Ionicons name="images-outline" size={18} color="#0ea5e9" />
            </View>
            <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">{libraryLabel}</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
