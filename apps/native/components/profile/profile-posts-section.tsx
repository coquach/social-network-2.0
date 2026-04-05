import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { ProfilePostCard } from './profile-post-card';
import { styles } from './profile-styles';
import type { PostItem, ProfilePalette } from './profile-types';

type ProfilePostsSectionProps = {
  colors: ProfilePalette;
  elevatedCardStyle: StyleProp<ViewStyle>;
  items: PostItem[];
};

export function ProfilePostsSection({
  colors,
  elevatedCardStyle,
  items,
}: ProfilePostsSectionProps) {
  return (
    <View style={styles.postsWrap}>
      <Text style={[styles.postsHeading, { color: colors.onSurface }]}>Posts</Text>

      {items.map((post) => (
        <ProfilePostCard
          key={post.id}
          post={post}
          colors={colors}
          elevatedCardStyle={elevatedCardStyle}
        />
      ))}
    </View>
  );
}
