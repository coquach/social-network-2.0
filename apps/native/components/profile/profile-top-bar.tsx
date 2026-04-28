import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from './profile-styles';
import type { ProfilePalette } from './profile-types';

type ProfileTopBarProps = {
  colors: ProfilePalette;
  paddingTop: number;
  onBack: () => void;
  onOpenSettings: () => void;
};

export function ProfileTopBar({
  colors,
  paddingTop,
  onBack,
  onOpenSettings,
}: ProfileTopBarProps) {
  return (
    <View
      style={[
        styles.topBar,
        {
          paddingTop,
          backgroundColor: colors.glass,
          borderBottomColor: colors.outline,
        },
      ]}
    >
      <View style={styles.topBarRow}>
        <View style={styles.topBarLeft}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: colors.surface },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
          <Text style={[styles.topBarTitle, { color: colors.primary }]}>Profile</Text>
        </View>

        <Pressable
          onPress={onOpenSettings}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: colors.surface },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="settings" size={20} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>
    </View>
  );
}
