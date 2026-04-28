import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  type KeyboardEvent,
  Platform,
  View,
  type KeyboardAvoidingViewProps,
} from "react-native";

import { cn } from "~/lib/cn";

type UseKeyboardHeightOptions = {
  enabled?: boolean;
};

export function useKeyboardHeight({ enabled = true }: UseKeyboardHeightOptions = {}) {
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) {
      setHeight(0);
      return;
    }

    const handleShow = (event: KeyboardEvent) => {
      setHeight(event.endCoordinates.height);
    };
    const handleHide = () => {
      setHeight(0);
    };
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, handleShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [enabled]);

  return height;
}

type KeyboardAwareContainerProps = {
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
  keyboardVerticalOffset?: number;
  behavior?: KeyboardAvoidingViewProps["behavior"];
  withKeyboardHeightPadding?: boolean;
  keyboardHeightPaddingOffset?: number;
};

export function KeyboardAwareContainer({
  children,
  className,
  enabled = true,
  keyboardVerticalOffset = 0,
  behavior = Platform.OS === "ios" ? "padding" : undefined,
  withKeyboardHeightPadding = false,
  keyboardHeightPaddingOffset = 0,
}: KeyboardAwareContainerProps) {
  const keyboardHeight = useKeyboardHeight({
    enabled: enabled && withKeyboardHeightPadding,
  });
  const keyboardPadding = withKeyboardHeightPadding
    ? Math.max(0, keyboardHeight - keyboardHeightPaddingOffset)
    : 0;

  return (
    <KeyboardAvoidingView
      enabled={enabled}
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      className={cn("w-full", className)}
    >
      {keyboardPadding > 0 ? (
        <View style={{ paddingBottom: keyboardPadding }}>{children}</View>
      ) : (
        children
      )}
    </KeyboardAvoidingView>
  );
}
