import React from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useToast } from 'heroui-native/toast';
import { Ionicons } from '@expo/vector-icons';
import { useCreateReport, useReportModalStore } from '@repo/shared';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appThemeColors } from '~/constants/theme';
import { AppToast } from '~/components/ui/app-toast';
import { useAppTheme } from '~/providers/theme-provider';

const MAX_REASON = 1000;

export function CreateReportModal() {
  const { mutateAsync, isPending } = useCreateReport();
  const { toast } = useToast();
  const insets = useSafeAreaInsets();
  const { isOpen, targetId, targetType, close } = useReportModalStore();
  const { resolvedTheme } = useAppTheme();
  const colors = appThemeColors[resolvedTheme];

  const inputRef = React.useRef<any>(null);
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const hasOpenedRef = React.useRef(false);
  const shouldFocusInputRef = React.useRef(false);
  const snapPoints = React.useMemo(() => ['38%'], []);

  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    setReason('');
  }, [targetId, targetType]);

  React.useEffect(() => {
    if (!isOpen) {
      Keyboard.dismiss();
      inputRef.current?.blur();
      shouldFocusInputRef.current = false;
      if (!hasOpenedRef.current) {
        return;
      }

      bottomSheetRef.current?.dismiss();
      return;
    }

    hasOpenedRef.current = true;
    shouldFocusInputRef.current = true;
    const frame = requestAnimationFrame(() => {
      bottomSheetRef.current?.present();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isOpen]);

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

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.show({
        duration: 2500,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: 'Thiếu nội dung',
              message: 'Vui lòng nhập lý do báo cáo',
              variant: 'warning',
            }}
            toastProps={toastProps}
          />
        ),
      });
      return;
    }

    try {
      if (!targetId || !targetType) {
        throw new Error('Missing report target');
      }

      await mutateAsync({
        targetId,
        targetType,
        reason: reason.trim(),
      });

      toast.show({
        duration: 2500,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: 'Đã gửi báo cáo',
              message: 'Cảm ơn bạn đã giúp cải thiện cộng đồng',
              variant: 'success',
            }}
            toastProps={toastProps}
          />
        ),
      });

      setReason('');

      setTimeout(() => {
        close();
      }, 150);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Gửi báo cáo thất bại, vui lòng thử lại';

      console.log('Create report failed:', error);

      toast.show({
        duration: 3000,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: 'Gửi báo cáo thất bại',
              message: errorMsg,
              variant: 'error',
            }}
            toastProps={toastProps}
          />
        ),
      });
    }
  };

  const isNearLimit = reason.length > MAX_REASON * 0.8;

  if (!isOpen) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={(index) => {
        if (index < 0) {
          shouldFocusInputRef.current = false;
          return;
        }

        if (index === 0 && shouldFocusInputRef.current) {
          shouldFocusInputRef.current = false;
          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        }
      }}
      onDismiss={() => {
        hasOpenedRef.current = false;
        shouldFocusInputRef.current = false;
        Keyboard.dismiss();
        inputRef.current?.blur();
        close();
      }}
      topInset={insets.top}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustPan"
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <View
        className="px-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-center gap-2 pb-3">
          <Ionicons name="flag-outline" size={16} color="#ef4444" />
          <Text className="text-lg font-semibold text-app-fg dark:text-app-fg-dark">
            Báo cáo nội dung
          </Text>
        </View>

        {/* INPUT */}
        <View className="gap-2">
          <Text className="text-sm text-app-muted-fg">
            Mô tả vấn đề bạn gặp phải
          </Text>

          <BottomSheetTextInput
            ref={inputRef}
            value={reason}
            onChangeText={setReason}
            placeholder="Ví dụ: nội dung spam, lừa đảo, hoặc gây khó chịu..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={5}
            editable={!isPending}
            maxLength={MAX_REASON}
            textAlignVertical="top"
            className="min-h-30 rounded-2xl border border-app-border bg-app-surface-elevated px-4 py-3 text-base text-app-fg dark:border-app-border-dark dark:bg-app-surface-elevated-dark dark:text-app-fg-dark"
          />

          {/* counter */}
          <View className="flex-row justify-end">
            <Text
              className={`text-xs ${
                isNearLimit
                  ? 'text-red-500'
                  : 'text-app-muted-fg dark:text-app-muted-fg-dark'
              }`}
            >
              {reason.length}/{MAX_REASON}
            </Text>
          </View>
        </View>

        {/* ACTION */}
        <View className="mt-3 border-t border-app-border px-4 pt-3 dark:border-app-border-dark">
          <Pressable
            onPress={handleSubmit}
            disabled={isPending || !reason.trim()}
            className="items-center justify-center rounded-xl bg-app-primary py-3 disabled:opacity-50"
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Ionicons name="alert-circle-outline" size={16} color="#fff" />
                <Text className="text-sm font-medium text-white">
                  Gửi báo cáo
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </BottomSheetModal>
  );
}
