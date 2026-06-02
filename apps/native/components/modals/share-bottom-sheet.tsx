import React from 'react';
import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useToast } from 'heroui-native/toast';
import { Image, Keyboard, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audience, useShareBottomSheetStore, useSharePost } from '@repo/shared';
import { PrimaryButton } from '~/components/ui/app-button';
import { AppToast } from '~/components/ui/app-toast';
import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

type ShareAudienceOption = {
  value: Audience;
  label: string;
};

const shareAudienceOptions: ShareAudienceOption[] = [
  { value: Audience.PUBLIC, label: 'Công khai' },
  { value: Audience.FRIENDS, label: 'Bạn bè' },
];

export function ShareBottomSheet() {
  const { user } = useUser();
  const { toast } = useToast();
  const insets = useSafeAreaInsets();
  const { isOpen, postId, close } = useShareBottomSheetStore();
  const sharePostMutation = useSharePost();
  const inputRef = React.useRef<any>(null);
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const hasOpenedRef = React.useRef(false);
  const shouldFocusInputRef = React.useRef(false);
  const snapPoints = React.useMemo(() => ['35%'], []);
  const { resolvedTheme } = useAppTheme();
  const colors = appThemeColors[resolvedTheme];

  const [content, setContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [audience, setAudience] = React.useState<Audience>(Audience.PUBLIC);
  const [audienceMenuOpen, setAudienceMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setAudienceMenuOpen(false);
      Keyboard.dismiss();
      inputRef.current?.blur();
      shouldFocusInputRef.current = false;
    } else {
      shouldFocusInputRef.current = true;
    }
  }, [isOpen]);

  const audienceLabel = React.useMemo(() => {
    return (
      shareAudienceOptions.find((option) => option.value === audience)?.label ??
      'Công khai'
    );
  }, [audience]);

  const displayName = React.useMemo(() => {
    if (user?.fullName?.trim()) return user.fullName.trim();
    if (user?.username?.trim()) return `@${user.username.trim()}`;

    const email = user?.primaryEmailAddress?.emailAddress?.trim();
    if (email) {
      return email.split('@')[0] || 'Bạn';
    }

    return 'Bạn';
  }, [user?.fullName, user?.primaryEmailAddress?.emailAddress, user?.username]);

  const avatarUrl = user?.imageUrl;

  const canSubmit = content.trim().length > 0 && !isSubmitting;

  React.useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      const frame = requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    if (!hasOpenedRef.current) {
      return;
    }

    bottomSheetRef.current?.dismiss();
  }, [isOpen]);

  const handleSubmit = React.useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    Keyboard.dismiss();
    inputRef.current?.blur();

    try {
      if (!postId) {
        throw new Error('Missing postId');
      }

      await sharePostMutation.mutateAsync({
        postId,
        content: content.trim(),
        audience,
      });

      toast.show({
        duration: 2500,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: 'Chia sẻ thành công',
              message: 'Bài viết đã được chia sẻ.',
              variant: 'success',
            }}
            toastProps={toastProps}
          />
        ),
      });

      setContent('');
      setAudienceMenuOpen(false);

      setTimeout(() => {
        close();
      }, 150);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Chia sẻ thất bại, vui lòng thử lại';

      toast.show({
        duration: 3000,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: 'Chia sẻ thất bại',
              message: errorMsg,
              variant: 'error',
            }}
            toastProps={toastProps}
          />
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [audience, canSubmit, close, content, postId, sharePostMutation, toast]);

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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={(index) => {
        if (index < 0) {
          shouldFocusInputRef.current = false;
          Keyboard.dismiss();
          inputRef.current?.blur();
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
        setAudienceMenuOpen(false);
        close();
      }}
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
          <Ionicons name="share-outline" size={16} color="#0ea5e9" />
          <Text className="text-lg font-semibold text-app-fg dark:text-app-fg-dark">
            Chia sẻ bài viết
          </Text>
        </View>

        {/* USER */}
        <View className="flex-row items-center gap-3 pb-3">
          <View className="h-11 w-11 rounded-full overflow-hidden bg-app-primary/15 shadow-sm items-center justify-center">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person-outline" size={20} color="#0ea5e9" />
            )}
          </View>

          <View className="flex-1 gap-1">
            <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">
              {displayName}
            </Text>

            {/* audience selector */}
            <View className="relative">
              <Pressable
                className="self-start flex-row items-center gap-1 rounded-full border border-app-border px-3 py-1.5 dark:border-app-border-dark"
                onPress={() => setAudienceMenuOpen((prev) => !prev)}
              >
                <Ionicons name="people-outline" size={13} color="#64748b" />
                <Text className="text-xs font-medium text-app-muted-fg dark:text-app-muted-fg-dark">
                  {audienceLabel}
                </Text>
                <Ionicons
                  name={audienceMenuOpen ? 'chevron-up' : 'chevron-down'}
                  size={13}
                  color="#64748b"
                />
              </Pressable>

              {audienceMenuOpen && (
                <View className="absolute top-full mt-1 left-0 z-20 w-36 rounded-xl border border-app-border bg-app-surface-elevated p-1.5 shadow-sm dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
                  {shareAudienceOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      className="rounded-lg px-2.5 py-2 active:opacity-70"
                      onPress={() => {
                        setAudience(option.value);
                        setAudienceMenuOpen(false);
                      }}
                    >
                      <Text
                        className={
                          audience === option.value
                            ? 'text-xs font-semibold text-app-primary dark:text-app-primary-dark'
                            : 'text-xs text-app-fg dark:text-app-fg-dark'
                        }
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* INPUT */}
        <BottomSheetTextInput
          ref={inputRef}
          value={content}
          onChangeText={setContent}
          multiline
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          textAlignVertical="top"
          placeholder="Hãy chia sẻ cảm nghĩ của bạn về bài viết này..."
          placeholderTextColor="#94a3b8"
          maxLength={1000}
          editable={!isSubmitting}
          className="min-h-32 rounded-2xl border border-app-border bg-app-surface-elevated px-4 py-3.5 text-base text-app-fg focus:border-app-primary dark:border-app-border-dark dark:bg-app-surface-elevated-dark dark:text-app-fg-dark"
        />

        {/* counter */}
        <Text className="mt-1 text-right text-xs text-app-muted-fg">
          {content.length}/1000
        </Text>

        {/* ACTION */}
        <View className="mt-3 border-t border-app-border px-0 pt-3 dark:border-app-border-dark">
          <PrimaryButton
            label={isSubmitting ? 'Đang chia sẻ...' : 'Chia sẻ ngay'}
            onPress={() => {
              handleSubmit().catch((error: unknown) => {
                console.warn('Chia sẻ thất bại:', error);
              });
            }}
            loading={isSubmitting}
            disabled={!canSubmit}
            className="w-full"
          />
        </View>
      </View>
    </BottomSheetModal>
  );
}
