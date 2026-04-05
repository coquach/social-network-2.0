import { Ionicons } from '@expo/vector-icons';
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
import type { PostItem, ProfilePalette } from './profile-types';

type ProfilePostCardProps = {
  post: PostItem;
  colors: ProfilePalette;
  elevatedCardStyle: StyleProp<ViewStyle>;
};

export function ProfilePostCard({
  post,
  colors,
  elevatedCardStyle,
}: ProfilePostCardProps) {
  return (
    <View style={[styles.postCard, elevatedCardStyle]}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.avatar }} style={styles.postAvatar} resizeMode="cover" />
        <View style={styles.postMetaBlock}>
          <Text style={[styles.postAuthor, { color: colors.onSurface }]}>{post.author}</Text>
          <View style={styles.postMetaRow}>
            <Text style={[styles.postMetaText, { color: colors.onSurfaceVariant }]}>
              {post.time} •
            </Text>
            <Ionicons name="globe-outline" size={10} color={colors.onSurfaceVariant} />
          </View>
        </View>
      </View>

      <Text
        style={[
          styles.postContent,
          { color: colors.onSurface },
          post.isQuote && styles.postQuote,
        ]}
      >
        {post.content}
      </Text>

      {post.image ? (
        <Image source={{ uri: post.image }} style={styles.postMedia} resizeMode="cover" />
      ) : null}

      <View style={[styles.postActionsRow, { borderTopColor: colors.divider }]}>
        <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressedAction]}>
          <Ionicons name="thumbs-up" size={14} color={colors.onSurfaceVariant} />
          <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>{post.likes}</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressedAction]}>
          <Ionicons name="chatbubble" size={14} color={colors.onSurfaceVariant} />
          <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>{post.comments}</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressedAction]}>
          <Ionicons name="share-social-outline" size={15} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>
    </View>
  );
}
