import { useGroup, useGroupPosts } from '@repo/shared/hooks';
import type { PostDTO } from '@repo/shared/types';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { toPostSnapshot } from '~/app/(main)/newfeeds/components/feed-mappers';
import { FeedList } from '~/app/(main)/newfeeds/components/feed-list';
import { GroupHeader } from '~/components/groups/group-header';
import { useTabBarAutoHide } from '~/components/navigation/use-tab-bar-auto-hide';
import { PostCardFull } from '~/components/post/post-card-full';
import { AppHeader } from '~/components/ui/app-header';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { handleScroll } = useTabBarAutoHide();

  const { data: group, isLoading: isGroupLoading, isError: isGroupError } = useGroup(groupId ?? '');

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useGroupPosts(groupId ?? '');

  const posts = React.useMemo<PostDTO[]>(
    () => (data?.pages ?? []).flatMap((page) => page.data ?? []),
    [data?.pages],
  );

  if (isGroupLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg dark:bg-app-bg-dark">
        <ActivityIndicator size="small" color="#0ea5e9" />
      </View>
    );
  }

  if (!group || isGroupError) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg px-6 dark:bg-app-bg-dark">
        <Text className="text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
          Không thể tải thông tin nhóm.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
      <FeedList
        items={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCardFull data={toPostSnapshot(item)} />}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={Boolean(hasNextPage)}
        onLoadMore={() => void fetchNextPage()}
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        onScroll={handleScroll}
        scrollEnabled
        listHeaderComponent={
          <View>
            <AppHeader title="Chi tiết nhóm" subtitle="Cập nhật thảo luận và hoạt động nhóm" variant="bordered" />
            <GroupHeader group={group} />
          </View>
        }
        contentContainerStyle={{ paddingBottom: 110, paddingTop: 0, paddingHorizontal: 12 }}
        emptyText="Nhóm này chưa có bài viết nào."
        estimatedItemSize={420}
        getItemType={() => 'post'}
      />
    </View>
  );
}
