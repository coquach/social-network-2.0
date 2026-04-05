import { Ionicons } from "@expo/vector-icons";
import EmojiPicker, { type EmojiType, vi } from "rn-emoji-keyboard";
import React from "react";
import { Pressable } from "react-native";

import { cn } from "~/lib/cn";

type EmojiButtonProps = {
  disabled?: boolean;
  onSelectEmoji: (emoji: string) => void;
  className?: string;
};

export function EmojiButton({
  disabled = false,
  onSelectEmoji,
  className,
}: EmojiButtonProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelectEmoji = React.useCallback(
    (emoji: EmojiType) => {
      onSelectEmoji(emoji.emoji);
      setOpen(false);
    },
    [onSelectEmoji],
  );

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mở bảng emoji"
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          "h-9 w-9 items-center justify-center rounded-full",
          disabled ? "opacity-50" : "active:scale-95",
          className,
        )}
      >
        <Ionicons name="happy-outline" size={20} color="#0ea5e9" />
      </Pressable>

      <EmojiPicker
        open={open}
        onClose={() => setOpen(false)}
        onEmojiSelected={handleSelectEmoji}
        translation={vi}
        enableRecentlyUsed
        enableSearchBar
        expandable={false}
        categoryPosition="bottom"
        defaultHeight={360}
        theme={{
          backdrop: "rgba(15, 23, 42, 0.32)",
          knob: "#cbd5e1",
          container: "#ffffff",
          header: "#0f172a",
          skinTonesContainer: "#ffffff",
          category: {
            icon: "#64748b",
            iconActive: "#0ea5e9",
            container: "#ffffff",
            containerActive: "#e0f2fe",
          },
          search: {
            background: "#f8fafc",
            text: "#0f172a",
            placeholder: "#94a3b8",
            icon: "#64748b",
          },
          customButton: {
            icon: "#0ea5e9",
            iconPressed: "#ffffff",
            background: "#e0f2fe",
            backgroundPressed: "#0ea5e9",
          },
          emoji: {
            selected: "#e0f2fe",
          },
        }}
      />
    </>
  );
}
