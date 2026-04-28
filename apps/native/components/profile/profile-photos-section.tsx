import React from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { styles } from './profile-styles';
import type { ProfilePalette } from './profile-types';

type ProfilePhotosSectionProps = {
  colors: ProfilePalette;
  elevatedCardStyle: StyleProp<ViewStyle>;
  items: string[];
};

export function ProfilePhotosSection({
  colors,
  elevatedCardStyle,
  items,
}: ProfilePhotosSectionProps) {
  return (
    <View style={[styles.sectionCard, elevatedCardStyle]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Photos</Text>
        <Pressable style={({ pressed }) => pressed && styles.pressedAction}>
          <Text style={[styles.sectionLink, { color: colors.primary }]}>View all</Text>
        </Pressable>
      </View>

      <View style={styles.photosGrid}>
        {items.map((imageUrl, index) => (
          <Image
            key={`${imageUrl}-${index}`}
            source={{ uri: imageUrl }}
            style={styles.photoImage}
            resizeMode="cover"
          />
        ))}
      </View>
    </View>
  );
}
