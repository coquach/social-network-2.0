import {
  MediaType,
  useCurrentUser,
  useMyPosts,
  useMyShares,
  useUpdateProfile,
  useUserFriends,
  type NativeUploadFileDescriptor,
  type PostDTO,
  type SharePostSnapshotDTO,
  type UploadableFile,
} from '@repo/shared';
import { useRouter } from 'expo-router';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeedList } from '~/app/(main)/newfeeds/components/feed-list';
import { toPostSnapshot } from '~/app/(main)/newfeeds/components/feed-mappers';
import { useTabBarAutoHide } from '~/components/navigation/use-tab-bar-auto-hide';
import { PostCardFull } from '~/components/post/post-card-full';
import { SharePost } from '~/components/post/share-post';
import {
  ProfileEditModal,
  type ProfileEditFormValues,
} from '~/components/profile/profile-edit-modal';
import { AppCard } from '~/components/ui/app-card';
import { AppToast } from '~/components/ui/app-toast';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=e2e8f0&color=0f172a&size=256';
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1400&auto=format&fit=crop';
const DEFAULT_BIO = 'Chưa cập nhật tiểu sử.';

type ProfileFeedItem =
  | { type: 'post'; data: PostDTO }
  | { type: 'share'; data: SharePostSnapshotDTO };

export default function ProfileScreen() {
  const router = useRouter();
  const { handleScroll } = useTabBarAutoHide();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();

  const { data: currentUser } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const {
    data: friendsData,
    isLoading: isFriendsLoading,
    isError: isFriendsError,
  } = useUserFriends(currentUser?.id ?? '', { limit: 6 });

  const [activePostTab, setActivePostTab] = React.useState<'posts' | 'shares'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const {
    data: myPostsData,
    isLoading: isMyPostsLoading,
    isError: isMyPostsError,
    error: myPostsError,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts,
    refetch: refetchMyPosts,
    isRefetching: isRefetchingMyPosts,
  } = useMyPosts();

  const {
    data: mySharesData,
    isLoading: isMySharesLoading,
    isError: isMySharesError,
    error: mySharesError,
    fetchNextPage: fetchNextShares,
    hasNextPage: hasNextShares,
    isFetchingNextPage: isFetchingNextShares,
    refetch: refetchMyShares,
    isRefetching: isRefetchingMyShares,
  } = useMyShares();

  const displayName = React.useMemo(() => {
    const first = currentUser?.firstName?.trim() ?? '';
    const last = currentUser?.lastName?.trim() ?? '';
    return [first, last].filter(Boolean).join(' ') || 'Người dùng';
  }, [currentUser?.firstName, currentUser?.lastName]);

  const profileAvatar = currentUser?.avatarUrl || DEFAULT_AVATAR;
  const coverImage = currentUser?.coverImage?.url || currentUser?.coverImageUrl || DEFAULT_COVER;
  const bioText = currentUser?.bio?.trim() || DEFAULT_BIO;

  const myPostItems = React.useMemo(
    () => (myPostsData?.pages ?? []).flatMap((page) => page.data),
    [myPostsData?.pages],
  );

  const myShareItems = React.useMemo(
    () => (mySharesData?.pages ?? []).flatMap((page) => page.data),
    [mySharesData?.pages],
  );

  const friendItems = React.useMemo(() => {
    const friends = (friendsData?.pages ?? []).flatMap((page) => page.data);
    return friends.slice(0, 3).map((friend) => ({
      id: friend.id,
      name: [friend.firstName, friend.lastName].filter(Boolean).join(' ') || 'Người dùng',
      avatar: friend.avatarUrl || DEFAULT_AVATAR,
    }));
  }, [friendsData?.pages]);

  const photoItems = React.useMemo(() => {
    const urls: string[] = [];

    for (const post of myPostItems) {
      for (const media of post.media ?? []) {
        if (media.type === MediaType.IMAGE && media.url) {
          urls.push(media.url);
        }
      }
    }

    return Array.from(new Set(urls)).slice(0, 9);
  }, [myPostItems]);

  const showToast = React.useCallback(
    (title: string, message: string, variant: 'success' | 'error') => {
      toast.show({
        duration: 2200,
        component: (toastProps) => (
          <AppToast toast={{ title, message, variant }} toastProps={toastProps} />
        ),
      });
    },
    [toast],
  );

  const toUploadableImage = React.useCallback(
    (
      file: NativeUploadFileDescriptor | null,
    ): UploadableFile<NativeUploadFileDescriptor> | undefined => {
      if (!file) {
        return undefined;
      }

      return {
        file,
        type: MediaType.IMAGE,
        previewUri: file.uri,
      };
    },
    [],
  );

  const handleSaveProfile = React.useCallback(
    async (values: ProfileEditFormValues) => {
      await updateProfile.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        bio: values.bio,
        uploadAvatar: toUploadableImage(values.avatarFile),
        uploadCover: toUploadableImage(values.coverFile),
      });

      setIsEditModalOpen(false);
      showToast('Cập nhật hồ sơ thành công', 'Thông tin của bạn đã được lưu.', 'success');
    },
    [showToast, toUploadableImage, updateProfile],
  );

  React.useEffect(() => {
    if (!updateProfile.error) {
      return;
    }

    showToast('Cập nhật thất bại', updateProfile.error.message, 'error');
  }, [showToast, updateProfile.error]);

  const feedItems = React.useMemo<ProfileFeedItem[]>(() => {
    if (activePostTab === 'posts') {
      return myPostItems.map((post) => ({ type: 'post' as const, data: post }));
    }

    return myShareItems.map((share) => ({ type: 'share' as const, data: share }));
  }, [activePostTab, myPostItems, myShareItems]);

  const isLoading = activePostTab === 'posts' ? isMyPostsLoading : isMySharesLoading;
  const isError = activePostTab === 'posts' ? isMyPostsError : isMySharesError;
  const errorMessage = React.useMemo(() => {
    const error = activePostTab === 'posts' ? myPostsError : mySharesError;
    return error instanceof Error ? error.message : undefined;
  }, [activePostTab, myPostsError, mySharesError]);

  const hasNextPage = activePostTab === 'posts' ? Boolean(hasNextPosts) : Boolean(hasNextShares);
  const isFetchingNextPage =
    activePostTab === 'posts' ? isFetchingNextPosts : isFetchingNextShares;
  const refreshing = activePostTab === 'posts' ? isRefetchingMyPosts : isRefetchingMyShares;

  const handleRefresh = React.useCallback(async () => {
    if (activePostTab === 'posts') {
      await refetchMyPosts({
        refetchPage: (_page: unknown, index: number) => index === 0,
      } as never);
      return;
    }

    await refetchMyShares({
      refetchPage: (_page: unknown, index: number) => index === 0,
    } as never);
  }, [activePostTab, refetchMyPosts, refetchMyShares]);

  const handleLoadMore = React.useCallback(() => {
    if (activePostTab === 'posts') {
      void fetchNextPosts();
      return;
    }

    void fetchNextShares();
  }, [activePostTab, fetchNextPosts, fetchNextShares]);

  const renderItem = React.useCallback(({ item }: { item: ProfileFeedItem }) => {
    if (item.type === 'post') {
      return <PostCardFull data={toPostSnapshot(item.data)} />;
    }

    return <SharePost data={item.data} />;
  }, []);

  const keyExtractor = React.useCallback((item: ProfileFeedItem) => {
    return item.type === 'post' ? `post-${item.data.id}` : `share-${item.data.shareId}`;
  }, []);

  const header = React.useMemo(
    () => (
      <View>
        <View>
          <Image source={{ uri: coverImage }} className="h-52 w-full" resizeMode="cover" />
          <View className="absolute inset-0 bg-black/12 dark:bg-black/30" />
        </View>

        <View className="px-4">
          <View className="-mt-14">
            <View className="h-28 w-28 rounded-full border-4 border-app-bg bg-app-bg p-1 dark:border-app-bg-dark dark:bg-app-bg-dark">
              <Image source={{ uri: profileAvatar }} className="h-full w-full rounded-full" resizeMode="cover" />
            </View>
          </View>

          <Text className="mt-3 text-[28px] font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
            {displayName}
          </Text>
          <Text className="mt-1 text-[14px] leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
            {bioText}
          </Text>

          <View className="mt-4 flex-row gap-2">
            <Pressable
              onPress={() => setIsEditModalOpen(true)}
              className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-app-primary active:opacity-85 dark:bg-app-primary-dark"
            >
              <Ionicons name="create-outline" size={18} color="#ffffff" />
              <Text className="text-[15px] font-semibold text-white">Chỉnh sửa hồ sơ</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(stack)/settings')}
              className="h-11 w-11 items-center justify-center rounded-xl bg-app-surface-elevated active:opacity-85 dark:bg-app-surface-elevated-dark"
            >
              <Ionicons name="settings-outline" size={18} color="#334155" />
            </Pressable>
          </View>

          <View className="mt-5">
            <AppCard className="gap-3 rounded-3xl p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[18px] font-bold text-app-fg dark:text-app-fg-dark">Bạn bè</Text>
                <Text className="text-[14px] font-semibold text-app-primary dark:text-app-primary-dark">
                  {currentUser?.friendCount ? `${currentUser.friendCount}` : 'Xem tất cả'}
                </Text>
              </View>

              {isFriendsLoading ? (
                <View className="py-3">
                  <ActivityIndicator size="small" color="#0ea5e9" />
                </View>
              ) : isFriendsError ? (
                <Text className="text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  Không tải được danh sách bạn bè.
                </Text>
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

          {/* <View className="mt-4">
            <AppCard className="gap-3 rounded-3xl p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[18px] font-bold text-app-fg dark:text-app-fg-dark">Ảnh</Text>
                <Text className="text-[14px] font-semibold text-app-primary dark:text-app-primary-dark">
                  {photoItems.length > 0 ? `${photoItems.length} ảnh` : 'Chưa có ảnh'}
                </Text>
              </View>

              {photoItems.length === 0 ? (
                <Text className="text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  Chưa có ảnh từ bài viết.
                </Text>
              ) : (
                <View className="flex-row flex-wrap justify-between gap-y-2">
                  {photoItems.slice(0, 6).map((imageUrl, index) => (
                    <Image
                      key={`${imageUrl}-${index}`}
                      source={{ uri: imageUrl }}
                      className="aspect-square w-[32%] rounded-lg"
                      resizeMode="cover"
                    />
                  ))}
                </View>
              )}
            </AppCard>
          </View> */}

          <View className="mt-4 mb-3">
            <Text className="mb-3 text-[20px] font-bold text-app-fg dark:text-app-fg-dark">Bài viết</Text>

            <View className="mb-1 flex-row rounded-2xl bg-app-surface-elevated p-1 dark:bg-app-surface-elevated-dark">
              <Pressable
                onPress={() => setActivePostTab('posts')}
                className={`h-10 flex-1 items-center justify-center rounded-xl ${
                  activePostTab === 'posts' ? 'bg-app-surface dark:bg-app-surface-dark' : ''
                }`}
              >
                <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">Của tôi</Text>
              </Pressable>
              <Pressable
                onPress={() => setActivePostTab('shares')}
                className={`h-10 flex-1 items-center justify-center rounded-xl ${
                  activePostTab === 'shares' ? 'bg-app-surface dark:bg-app-surface-dark' : ''
                }`}
              >
                <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">Chia sẻ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    ),
    [
      activePostTab,
      bioText,
      coverImage,
      currentUser?.friendCount,
      displayName,
      friendItems,
      isFriendsError,
      isFriendsLoading,
      photoItems,
      profileAvatar,
      router,
    ],
  );

  return (
    <>
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark px-4">
        <FeedList
          items={feedItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onLoadMore={handleLoadMore}
          refreshing={refreshing}
          onRefresh={() => void handleRefresh()}
          onScroll={handleScroll}
          scrollEnabled
          listHeaderComponent={header}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom + 110, 130),
            paddingHorizontal: 0,
            paddingTop: insets.top + 8,
          }}
          emptyText={activePostTab === 'posts' ? 'Chưa có bài viết nào.' : 'Chưa có bài chia sẻ nào.'}
          estimatedItemSize={420}
          getItemType={(item) => item.type}
        />
      </View>

      <ProfileEditModal
        visible={isEditModalOpen}
        defaultFirstName={currentUser?.firstName ?? ''}
        defaultLastName={currentUser?.lastName ?? ''}
        defaultBio={currentUser?.bio ?? ''}
        defaultAvatarUrl={profileAvatar}
        defaultCoverUrl={coverImage}
        isSaving={updateProfile.isPending}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(values) => void handleSaveProfile(values)}
      />
    </>
  );
}
