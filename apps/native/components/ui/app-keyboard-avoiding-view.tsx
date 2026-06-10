import React from 'react';
import { KeyboardAvoidingView, type KeyboardAvoidingViewProps } from 'react-native-keyboard-controller';

export interface AppKeyboardAvoidingViewProps extends KeyboardAvoidingViewProps {
  // Add any custom props here if needed
}

/**
 * A wrapper around KeyboardAvoidingView from react-native-keyboard-controller.
 * Best used for screens with fixed inputs at the bottom (e.g. Chat, Comments).
 */
export function AppKeyboardAvoidingView({
  children,
  style,
  keyboardVerticalOffset = 0,
  behavior = 'padding',
  ...props
}: AppKeyboardAvoidingViewProps) {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
