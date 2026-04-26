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
    Math.max((anchorY ?? screenHeight - 120) - 70, 12),
    screenHeight - 100,
  );

  return (
    <Modal transparent animationType="fade" visible={open}>
      <View style={{ flex: 1 }}>
        {/* BACKDROP */}
        <Pressable
          onTouchStart={onClose}
          style={{ position: 'absolute', inset: 0 }}
        />

        {/* PICKER */}
        <View
          style={{
            position: 'absolute',
            top: pickerTop,
            alignSelf: 'center',
            maxWidth: '90%',
            flexDirection: 'row',
            alignItems: 'center',

            backgroundColor: '#fff',
            borderColor: '#e5e7eb',
            borderWidth: 1,

            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,

            elevation: 6,
          }}
        >
          {options.map((o) => (
            <Pressable
              key={o.type}
              onPress={() => {
                onSelectReaction?.(o.type);
                onClose?.();
              }}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 1.25 : 1 }],
                marginHorizontal: 8,
              })}
            >
              <Text style={{ fontSize: 28 }}>{o.emoji}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}
