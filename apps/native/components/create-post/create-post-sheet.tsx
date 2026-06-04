import {
  BottomSheetBackdrop,
  BottomSheetModal,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import React from 'react';
import { View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ComposerLayout } from './composer-layout';
import { CreatePostProvider } from './provider';
import { useCreatePostModal } from '@repo/shared/store/useCreatePostModal';

export function CreatePostSheet() {
  const isOpen = useCreatePostModal((state) => state.isOpen);
  const close = useCreatePostModal((state) => state.close);
  const insets = useSafeAreaInsets();
  const createPostRef = React.useRef<BottomSheetModal>(null);
  const hasOpenedRef = React.useRef(false);
  const snapPoints = React.useMemo(() => ['100%'], []);
  const animationConfigs = useBottomSheetTimingConfigs({
    duration: 320,
    easing: Easing.out(Easing.cubic),
  });

  React.useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      const frame = requestAnimationFrame(() => {
        createPostRef.current?.present();
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    if (!hasOpenedRef.current) {
      return;
    }

    createPostRef.current?.dismiss();
  }, [isOpen]);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.35}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const content = (
    <View className="flex-1 bg-app-background dark:bg-app-background-dark">
      <CreatePostProvider>
        <ComposerLayout onClose={close} />
      </CreatePostProvider>
    </View>
  );

  return (
    <BottomSheetModal
      ref={createPostRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={() => {
        hasOpenedRef.current = false;
        close();
      }}
      topInset={insets.top}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustPan"
      enablePanDownToClose={false}
      enableDynamicSizing={false}
      animationConfigs={animationConfigs}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#94a3b8' }}
      backgroundStyle={{ borderRadius: 0 }}
      onChange={(index) => {
        if (index < 0) {
          close();
        }
      }}
    >
      {content}
    </BottomSheetModal>
  );
}
