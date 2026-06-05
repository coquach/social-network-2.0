import { useGroup, useGroupPosts } from '@repo/shared/hooks';
import type { PostDTO } from '@repo/shared/types';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';


import { toPostSnapshot } from '~/components/newfeeds/feed/feed-mappers';
import { FeedList } from '~/components/newfeeds/feed/feed-list';
import { GroupHeader } from '~/components/groups/group-header';
import { useTabBarAutoHide } from '~/components/navigation/use-tab-bar-auto-hide';
import { PostCardFull } from '~/components/post/post-card-full';
import { AppHeader } from '~/components/ui/app-header';
import { AppLoadingBlock } from '~/components/ui/app-loading';
import { useCreatePostModal } from '@repo/shared/store/useCreatePostModal';
import { useCurrentUser } from '@repo/shared';
import { Image, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function GroupCreatePostEntry({ groupId }: { groupId: string }) {
  const open = useCreatePostModal((state) => state.open);
  const { data: currentUser } = useCurrentUser();

  return (
    <View className="mt-4 overflow-hidden rounded-3xl bg-app-surface dark:bg-app-surface-dark px-4 py-4">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
          <Image
            source={{ uri: currentUser?.avatarUrl || 'https://via.placeholder.com/150' }}
            className="h-full w-full"
          />
        </View>
        <TouchableOpacity
          onPress={() => open(groupId)}
          className="flex-1 h-10 flex-row items-center rounded-full bg-slate-100 px-4 dark:bg-slate-800"
        >
          <Text className="text-slate-500 dark:text-slate-400">Bạn viết gì đi...</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => open(groupId)}
          className="h-10 w-10 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-900/30"
        >
          <Ionicons name="images" size={20} color="#0ea5e9" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
        <AppLoadingBlock label="Đang tải nhóm" />
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
        keyExtractor={(item) => item.id || (item as any).postId || Math.random().toString()}
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
            <GroupCreatePostEntry groupId={group.id} />
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





