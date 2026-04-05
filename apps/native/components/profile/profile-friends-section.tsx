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
import type { FriendItem, ProfilePalette } from './profile-types';

type ProfileFriendsSectionProps = {
  colors: ProfilePalette;
  elevatedCardStyle: StyleProp<ViewStyle>;
  items: FriendItem[];
};

export function ProfileFriendsSection({
  colors,
  elevatedCardStyle,
  items,
}: ProfileFriendsSectionProps) {
  return (
    <View style={[styles.sectionCard, elevatedCardStyle]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Friends</Text>
        <Pressable style={({ pressed }) => pressed && styles.pressedAction}>
          <Text style={[styles.sectionLink, { color: colors.primary }]}>See all</Text>
        </Pressable>
      </View>

      <View style={styles.friendsGrid}>
        {items.map((friend) => (
          <View key={friend.name} style={styles.friendItem}>
            <Image source={{ uri: friend.image }} style={styles.friendImage} resizeMode="cover" />
            <Text numberOfLines={1} style={[styles.friendLabel, { color: colors.onSurface }]}>
              {friend.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
