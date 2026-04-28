import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { styles } from './profile-styles';
import type { ProfilePalette } from './profile-types';

type ProfileHeroProps = {
  colors: ProfilePalette;
  elevatedCardStyle: StyleProp<ViewStyle>;
  avatarUri: string;
  userName: string;
  bio: string;
  onEditPress: () => void;
};

export function ProfileHero({
  colors,
  elevatedCardStyle,
  avatarUri,
  userName,
  bio,
  onEditPress,
}: ProfileHeroProps) {
  return (
    <>
      <View style={[styles.avatarRing, elevatedCardStyle]}>
        <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
      </View>

      <Text style={[styles.profileName, { color: colors.onSurface }]}>{userName}</Text>
      <Text style={[styles.profileBio, { color: colors.onSurfaceVariant }]}>{bio}</Text>

      <Pressable
        onPress={onEditPress}
        style={({ pressed }) => [
          styles.editButton,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="create-outline" size={18} color={colors.primaryForeground} />
        <Text style={[styles.editButtonText, { color: colors.primaryForeground }]}>Edit Profile</Text>
      </Pressable>
    </>
  );
}
