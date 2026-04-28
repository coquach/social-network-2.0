import React from 'react';
import { Image, View } from 'react-native';

import { styles } from './profile-styles';
import type { ProfilePalette } from './profile-types';

type ProfileCoverProps = {
  colors: ProfilePalette;
  imageUri: string;
};

export function ProfileCover({ colors, imageUri }: ProfileCoverProps) {
  return (
    <View style={styles.coverWrap}>
      <Image source={{ uri: imageUri }} style={styles.coverImage} resizeMode="cover" />
      <View style={[styles.coverOverlay, { backgroundColor: colors.coverOverlay }]} />
    </View>
  );
}
