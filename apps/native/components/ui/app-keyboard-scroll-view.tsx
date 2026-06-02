import React from 'react';
import { KeyboardAwareScrollView, type KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface AppKeyboardScrollViewProps extends KeyboardAwareScrollViewProps {
  /**
   * Additional bottom padding to add above the keyboard
   */
  bottomOffset?: number;
}

/**
 * A wrapper around KeyboardAwareScrollView from react-native-keyboard-controller.
 * Best used for scrollable forms like Login, Sign Up, or Profile Edit.
 */
export function AppKeyboardScrollView({
  children,
  style,
  contentContainerStyle,
  bottomOffset = 16,
  ...props
}: AppKeyboardScrollViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAwareScrollView
      style={[{ flex: 1 }, style]}
      contentContainerStyle={contentContainerStyle}
      // Add safe area insets to ensure it doesn't get hidden behind the home indicator
      bottomOffset={bottomOffset + insets.bottom}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
