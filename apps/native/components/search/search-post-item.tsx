import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PostCardCompact } from '~/components/post/post-card-compact';
import type { PostSnapshotDTO } from '@repo/shared';

type Props = {
  post: PostSnapshotDTO;
  onPress?: (p: PostSnapshotDTO) => void;
};

function SearchPostItemComponent({ post, onPress }: Props) {
  const router = useRouter();

  const handlePress = React.useCallback(() => {
    onPress?.(post);
    if (post.postId) router.push(`/posts/${post.postId}` as never);
  }, [onPress, router, post]);

  return (
    <Pressable onPress={handlePress} className="active:opacity-70">
      <View>
        <PostCardCompact data={post} />
      </View>
    </Pressable>
  );
}

export const SearchPostItem = React.memo(SearchPostItemComponent);
