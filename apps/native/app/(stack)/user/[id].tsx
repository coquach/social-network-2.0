import { Ionicons } from '@expo/vector-icons';
import {
  PrivacyLevel,
  RelationStatus,
  toPostSnapshot,
  useFriendUsers,
  useUser,
  useUserPosts,
  useUserShares,
  type SharePostSnapshotDTO,
} from '@repo/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeedList } from '~/components/newfeeds/feed/feed-list';
import { PostCardFull } from '~/components/post/post-card-full';
import { SharePost } from '~/components/post/share-post';
import { ProfileActionButtons } from '~/components/profile/profile-action-buttons';
import { AppCard } from '~/components/ui/app-card';

const DEFAULT_AVATAR = Image.resolveAssetSource(
  require('~/assets/images/placeholder.png'),
).uri;
const DEFAULT_COVER = Image.resolveAssetSource(
  require('~/assets/images/placeholder-bg.png'),
).uri;
const DEFAULT_BIO = 'Chưa cập nhật tiểu sử.';

export default function OtherUserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [activePostTab, setActivePostTab] = React.useState<'posts' | 'shares'>(
    'posts',
  );

  const { data: user, isLoading: isUserLoading } = useUser(id as string, {
    enabled: !!id,
  });

  const { data: friendsData, isLoading: isFriendsLoading } = useFriendUsers(
    id as string,
    { limit: 6 },
  );



  const displayName = React.useMemo(() => {
    const first = user?.firstName?.trim() ?? '';
    const last = user?.lastName?.trim() ?? '';
    return [first, last].filter(Boolean).join(' ') || 'Người dùng';
  }, [user?.firstName, user?.lastName]);

  const profileAvatar = user?.avatarUrl || DEFAULT_AVATAR;
  const coverImage =
    user?.coverImage?.url || user?.coverImageUrl || DEFAULT_COVER;
  const bioText = user?.bio?.trim() || DEFAULT_BIO;

  // Quyền riêng tư: Khoá trang cá nhân nếu PRIVATE và chưa phải bạn bè
  const isPrivate =
    user?.privacySettings?.profileVisibility === PrivacyLevel.PRIVATE;
  const isFriend = user?.relation?.status === RelationStatus.FRIEND;
  const isLocked = isPrivate && !isFriend;

  const friendItems = React.useMemo(() => {
    const friends = (friendsData?.pages ?? []).flatMap((page) => page.data);
    return friends.slice(0, 3).map((friend) => ({
      id: friend.id,
      name:
        [friend.firstName, friend.lastName].filter(Boolean).join(' ') ||
        'Người dùng',
      avatar: friend.avatarUrl || DEFAULT_AVATAR,
    }));
  }, [friendsData?.pages]);

  const header = React.useMemo(
    () => (
      <View>
        <Pressable
          onPress={() => router.back()}
          className="absolute top-12 left-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-black/40 active:bg-black/60"
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </Pressable>
        <View>
          <Image
            source={{ uri: coverImage }}
            className="h-52 w-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/12 dark:bg-black/30" />
        </View>

        <View className="px-4">
          <View className="-mt-14">
            <View className="h-28 w-28 rounded-full border-4 border-app-bg bg-app-bg p-1 dark:border-app-bg-dark dark:bg-app-bg-dark">
              <Image
                source={{ uri: profileAvatar }}
                className="h-full w-full rounded-full"
                resizeMode="cover"
              />
            </View>
          </View>

          <Text className="mt-3 text-[28px] font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
            {displayName}
          </Text>

          {/* Privacy Enforcement: Hide bio if locked */}
          {!isLocked && (
            <>
              <Text className="mt-1 text-[14px] leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
                {bioText}
              </Text>

              <View className="mt-4 flex-row items-center gap-6">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[15px] font-bold text-app-fg dark:text-app-fg-dark">
                    {user?.postCount ?? 0}
                  </Text>
                  <Text className="text-[15px] text-app-muted-fg dark:text-app-muted-fg-dark">
                    bài viết
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[15px] font-bold text-app-fg dark:text-app-fg-dark">
                    {user?.friendCount ?? 0}
                  </Text>
                  <Text className="text-[15px] text-app-muted-fg dark:text-app-muted-fg-dark">
                    bạn bè
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Render Action Buttons Component */}
          {user && <ProfileActionButtons user={user} />}

          {/* Privacy Enforcement: Lock Screen UI */}
          {isLocked ? (
            <View className="mt-6">
              <AppCard className="items-center justify-center rounded-3xl p-8 py-12 gap-4">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-app-surface-elevated dark:bg-app-surface-elevated-dark">
                  <Ionicons
                    name="lock-closed-outline"
                    size={32}
                    color="#64748b"
                  />
                </View>
                <Text className="text-[18px] font-bold text-app-fg dark:text-app-fg-dark text-center">
                  Hồ sơ riêng tư
                </Text>
                <Text className="text-[14px] text-app-muted-fg dark:text-app-muted-fg-dark text-center max-w-[250px]">
                  Người dùng này đã khoá bảo vệ trang cá nhân. Hãy kết bạn để
                  xem toàn bộ bài viết và thông tin chi tiết.
                </Text>
              </AppCard>
            </View>
          ) : (
            <>
              {/* Intro Section */}
              <View className="mt-5">
                <AppCard className="gap-4 rounded-3xl p-5">
                  <Text className="text-[18px] font-bold text-app-fg dark:text-app-fg-dark">
                    Giới thiệu
                  </Text>
                  
                  <View className="gap-3">
                    {user?.jobTitle || user?.company ? (
                      <View className="flex-row items-center gap-3">
                        <Ionicons name="briefcase-outline" size={22} color="#64748b" />
                        <Text className="flex-1 text-[15px] text-app-fg dark:text-app-fg-dark leading-5">
                          {user?.jobTitle ? `Làm ${user.jobTitle} tại ` : 'Làm việc tại '}
                          <Text className="font-bold">{user?.company || 'Công ty'}</Text>
                        </Text>
                      </View>
                    ) : null}

                    {user?.school ? (
                      <View className="flex-row items-center gap-3">
                        <Ionicons name="school-outline" size={22} color="#64748b" />
                        <Text className="flex-1 text-[15px] text-app-fg dark:text-app-fg-dark leading-5">
                          Từng học tại <Text className="font-bold">{user.school}</Text>
                        </Text>
                      </View>
                    ) : null}

                    {user?.location ? (
                      <View className="flex-row items-center gap-3">
                        <Ionicons name="location-outline" size={22} color="#64748b" />
                        <Text className="flex-1 text-[15px] text-app-fg dark:text-app-fg-dark leading-5">
                          Sống tại <Text className="font-bold">{user.location}</Text>
                        </Text>
                      </View>
                    ) : null}

                    {user?.createdAt ? (
                      <View className="flex-row items-center gap-3">
                        <Ionicons name="time-outline" size={22} color="#64748b" />
                        <Text className="flex-1 text-[15px] text-app-fg dark:text-app-fg-dark leading-5">
                          Tham gia vào <Text className="font-bold">{new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</Text>
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {user?.interests && user.interests.length > 0 ? (
                    <View className="mt-1 flex-row flex-wrap gap-2">
                      {user.interests.map((interest, idx) => (
                        <View key={idx} className="rounded-full bg-app-surface-elevated px-3 py-1.5 dark:bg-app-surface-elevated-dark border border-app-border dark:border-app-border-dark">
                          <Text className="text-[13px] font-medium text-app-fg dark:text-app-fg-dark">
                            {interest}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </AppCard>
              </View>

              {/* Friends Section */}
              <View className="mt-5">
                <AppCard className="gap-3 rounded-3xl p-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-[18px] font-bold text-app-fg dark:text-app-fg-dark">
                      Bạn bè
                    </Text>
                    {typeof user?.friendCount === 'number' ? (
                      <Text className="mt-0.5 text-[12px] text-app-muted-fg dark:text-app-muted-fg-dark">
                        {user.friendCount} người bạn
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() =>
                      router.push(
                        `/(stack)/friends?userId=${user?.id}&userName=${user?.firstName}`,
                      )
                    }
                    className="rounded-full px-2 py-1 active:opacity-70"
                  >
                    <Text className="text-[14px] font-semibold text-app-primary dark:text-app-primary-dark">
                      Xem tất cả
                    </Text>
                  </Pressable>
                </View>

                {isFriendsLoading ? (
                  <View className="py-3">
                    <ActivityIndicator size="small" color="#0ea5e9" />
                  </View>
                ) : friendItems.length === 0 ? (
                  <Text className="text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                    Chưa có bạn bè hiển thị.
                  </Text>
                ) : (
                  <View className="flex-row justify-between">
                    {friendItems.map((friend) => (
                      <View key={friend.id} className="w-[31.8%]">
                        <Image
                          source={{ uri: friend.avatar }}
                          className="aspect-square w-full rounded-xl"
                          resizeMode="cover"
                        />
                        <Text
                          numberOfLines={1}
                          className="mt-2 text-center text-[12px] text-app-fg dark:text-app-fg-dark"
                        >
                          {friend.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </AppCard>
            </View>
            </>
          )}

          {/* Tabs */}
          {!isLocked && (
            <View className="mt-4">
              <View className="mb-1 flex-row rounded-2xl bg-app-surface-elevated p-1 dark:bg-app-surface-elevated-dark">
                <Pressable
                  onPress={() => setActivePostTab('posts')}
                  className={`h-10 flex-1 items-center justify-center rounded-xl ${
                    activePostTab === 'posts'
                      ? 'bg-app-surface dark:bg-app-surface-dark'
                      : ''
                  }`}
                >
                  <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">
                    Bài viết
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setActivePostTab('shares')}
                  className={`h-10 flex-1 items-center justify-center rounded-xl ${
                    activePostTab === 'shares'
                      ? 'bg-app-surface dark:bg-app-surface-dark'
                      : ''
                  }`}
                >
                  <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">
                    Lượt chia sẻ
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    ),
    [
      coverImage,
      profileAvatar,
      displayName,
      bioText,
      friendItems,
      isFriendsLoading,
      user,
      isLocked,
      activePostTab,
    ],
  );

  // 1. Dùng hook useUserPosts và useUserShares
  const {
    data: userPostsData,
    isLoading: isUserPostsLoading,
    isError: isUserPostsError,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts,
  } = useUserPosts(id as string);

  const {
    data: userSharesData,
    isLoading: isUserSharesLoading,
    isError: isUserSharesError,
    fetchNextPage: fetchNextShares,
    hasNextPage: hasNextShares,
    isFetchingNextPage: isFetchingNextShares,
  } = useUserShares(id as string);

  // 2. Map data từ InfiniteQuery thành mảng các bài viết
  type ProfileFeedItem =
    | { type: 'post'; data: any }
    | { type: 'share'; data: SharePostSnapshotDTO };

  const feedItems = React.useMemo<ProfileFeedItem[]>(() => {
    if (activePostTab === 'posts') {
      return (userPostsData?.pages.flatMap((page) => page.data) ?? []).map(
        (post) => ({
          type: 'post' as const,
          data: post,
        }),
      );
    }
    return (userSharesData?.pages.flatMap((page) => page.data) ?? []).map(
      (share) => ({
        type: 'share' as const,
        data: share,
      }),
    );
  }, [activePostTab, userPostsData?.pages, userSharesData?.pages]);

  // 3. Render hàm cho từng bài viết trong danh sách
  const renderItem = React.useCallback(
    ({ item }: { item: ProfileFeedItem }) => {
      if (item.type === 'post') {
        return <PostCardFull data={toPostSnapshot(item.data)} />;
      }
      return <SharePost data={item.data} />;
    },
    [],
  );

  const keyExtractor = React.useCallback((item: ProfileFeedItem) => {
    if (item.type === 'post') {
      const post = item.data as any;
      const postId = post?.postId || post?.id || Math.random().toString();
      return `post-${postId}`;
    }
    return `share-${item.data?.shareId || Math.random().toString()}`;
  }, []);

  const isLoadingFeed =
    activePostTab === 'posts' ? isUserPostsLoading : isUserSharesLoading;
  const isErrorFeed =
    activePostTab === 'posts' ? isUserPostsError : isUserSharesError;
  const isFetchingNextFeed =
    activePostTab === 'posts' ? isFetchingNextPosts : isFetchingNextShares;
  const hasNextFeed =
    activePostTab === 'posts' ? !!hasNextPosts : !!hasNextShares;
  const loadMoreFeed =
    activePostTab === 'posts'
      ? () => fetchNextPosts()
      : () => fetchNextShares();

  if (isUserLoading) {
    return (
      <View className="flex-1 bg-app-bg items-center justify-center dark:bg-app-bg-dark">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-app-bg items-center justify-center dark:bg-app-bg-dark">
        <Text className="text-app-fg dark:text-app-fg-dark">
          Không tìm thấy người dùng
        </Text>
      </View>
    );
  }

  if (isLocked) {
    return (
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <FeedList
          items={[]}
          keyExtractor={() => 'empty'}
          renderItem={() => null}
          listHeaderComponent={header}
          isLoading={false}
          isError={false}
          isFetchingNextPage={false}
          hasNextPage={false}
          onLoadMore={() => {}}
          scrollEnabled={true}
          emptyText=""
          estimatedItemSize={200}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom + 80, 100),
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
      <FeedList
        items={feedItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        listHeaderComponent={header}
        isLoading={isLoadingFeed}
        isError={isErrorFeed}
        isFetchingNextPage={isFetchingNextFeed}
        hasNextPage={hasNextFeed}
        onLoadMore={loadMoreFeed}
        scrollEnabled={true}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 110, 130),
          paddingHorizontal: 0,
          paddingTop: insets.top + 8,
        }}
        emptyText={
          activePostTab === 'posts'
            ? 'Chưa có bài viết nào.'
            : 'Chưa có bài chia sẻ nào.'
        }
        estimatedItemSize={420}
        getItemType={(item) => item.type}
        bodyHorizontalPadding={16}
      />
    </View>
  );
}
