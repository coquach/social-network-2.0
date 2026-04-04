import { Ionicons } from "@expo/vector-icons";
import EmojiPicker from "rn-emoji-picker";
import { emojis } from "rn-emoji-picker/dist/data";
import type { Emoji } from "rn-emoji-picker/dist/interfaces";
import React from "react";
import { Pressable, View, useColorScheme } from "react-native";

import { AppBottomSheet } from "~/components/ui/app-bottom-sheet";
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
  const [recent, setRecent] = React.useState<Emoji[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mở bảng emoji"
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          "h-10 w-10 items-center justify-center rounded-full border border-app-border bg-app-surface-elevated dark:border-app-border-dark dark:bg-app-surface-elevated-dark",
          disabled ? "opacity-50" : "active:scale-95",
          className,
        )}
      >
        <Ionicons name="happy-outline" size={19} color="#0ea5e9" />
      </Pressable>

      <AppBottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Emoji"
        description="Chọn emoji để chèn vào tin nhắn."
        bodyClassName="mt-4"
      >
        <View className="h-[360px] overflow-hidden rounded-[24px] border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark">
          <EmojiPicker
            emojis={emojis}
            recent={recent}
            loading={false}
            autoFocus
            darkMode={isDark}
            perLine={8}
            onSelect={(emoji) => {
              onSelectEmoji(emoji.emoji);
              setOpen(false);
            }}
            onChangeRecent={setRecent}
          />
        </View>
      </AppBottomSheet>
    </>
  );
}
