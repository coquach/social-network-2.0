import React from "react";

import { FloatingActionButton } from "~/components/ui/floating-action-button";

type CreatePostTabButtonProps = {
  isActive: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

export function CreatePostTabButton({
  isActive,
  onPress,
  onLongPress,
}: CreatePostTabButtonProps) {
  return (
    <FloatingActionButton
      isActive={isActive}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityLabel="Tao bai viet"
      containerClassName="mt-[-28px]"
    />
  );
}
