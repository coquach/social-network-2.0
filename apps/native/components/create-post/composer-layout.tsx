import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React from 'react';
import { View } from 'react-native';
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Actions } from './actions';
import { AudienceView } from './audience-view';
import { Header } from './header';
import { Input } from './input';
import { MediaPreview } from './media-preview';
import { useCreatePostContext } from './context';

type ComposerLayoutProps = {
  onClose: () => void;
};

const FOOTER_HEIGHT = 78;

export function ComposerLayout({ onClose }: ComposerLayoutProps) {
  const insets = useSafeAreaInsets();
  const { view } = useCreatePostContext();

  return (
    <View className="flex-1 bg-app-background dark:bg-app-background-dark">
      <Header onClose={onClose} view={view} />

      {view === 'composer' ? (
        <Animated.View
          key="composer"
          entering={SlideInRight.duration(180)}
          exiting={SlideOutLeft.duration(140)}
          className="flex-1"
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentContainerStyle={{
              paddingBottom: Math.max(
                120,
                FOOTER_HEIGHT + Math.max(insets.bottom, 16) + 18,
              ),
            }}
          >
            <Input />
            <MediaPreview />
          </BottomSheetScrollView>

          <Animated.View className="absolute bottom-0 left-0 right-0 border-t border-app-border bg-app-surface/96 px-4 pt-3 dark:border-app-border-dark dark:bg-app-surface-dark/96">
            <View style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
              <Actions />
            </View>
          </Animated.View>
        </Animated.View>
      ) : (
        <Animated.View
          key="audience"
          entering={SlideInLeft.duration(180)}
          exiting={SlideOutRight.duration(140)}
          className="flex-1"
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 24) + 24,
            }}
          >
            <AudienceView />
          </BottomSheetScrollView>
        </Animated.View>
      )}
    </View>
  );
}
