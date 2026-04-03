import React from 'react';
import { Dimensions, Modal, Pressable, Text, View } from 'react-native';
import { ReactionType } from '@repo/shared';

export type ReactionOption = {
  type: ReactionType;
  emoji: string;
  label: string;
};

type Props = {
  open: boolean;
  anchorY?: number;
  options: ReactionOption[];
  onSelectReaction?: (reaction: ReactionType) => void;
  onClose?: () => void;
};

export function ReactionPicker({
  open,
  anchorY,
  options,
  onSelectReaction,
  onClose,
}: Props) {
  if (!open) return null;

  const screenHeight = Dimensions.get('window').height;
  const pickerTop = Math.min(
    Math.max((anchorY ?? screenHeight - 120) - 64, 12),
    screenHeight - 76,
  );

  return (
    <Modal
      transparent
      animationType="fade"
      visible={open}
      onRequestClose={onClose}
    >
      <View className="flex-1">
        {/* BACKDROP */}
        <Pressable onPress={onClose} className="absolute inset-0" />

        {/* PICKER */}
        <View
          style={{ top: pickerTop }}
          className="absolute left-10 right-10 z-20 flex-row items-center rounded-full border border-app-border bg-app-fg-dark px-2 py-2 dark:border-app-border-dark dark:bg-app-fg-dark"
        >
          {options.map((o) => (
            <Pressable
              key={o.type}
              onPress={() => onSelectReaction?.(o.type)}
              className="flex-1 items-center justify-center py-0.5"
            >
              <Text className="text-2xl">{o.emoji}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}
