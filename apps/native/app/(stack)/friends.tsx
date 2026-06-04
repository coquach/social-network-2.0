import { FlashList } from '@shopify/flash-list';
import {
  type FriendSuggestionDTO,
  type UserDTO,
  useAcceptFriendRequest,
  useBlockedUserProfiles,
  useCreateConversation,
  useCurrentUser,
  useDeclineFriendRequest,
  useDismissFriendRecommendation,
  useFriendRequestUsers,
  useFriendSuggestions,
  useFriendUsers,
  useRemoveFriend,
  useSendFriendRequest,
  useUnblockUser,
} from '@repo/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { RefreshControl, View, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  FriendCard,
  FriendCardSkeleton,
  FriendListItem,
  type FriendCardAction,
  type FriendCardUser,
} from '~/components/friends/friend-card';
import {
  FriendsEmptyState,
  FriendsErrorState,
  FriendsListFooter,
} from '~/components/friends/friends-states';
import {
  FriendsTopTabs,
  type FriendsTabKey,
} from '~/components/friends/friends-top-tabs';
import { AppHeader } from '~/components/ui/app-header';
import { AppToast, type AppToastData } from '~/components/ui/app-toast';

const PAGE_SIZE = 20;
const skeletonItems = Array.from({ length: 3 }, (_, index) => index);

type FriendListItem = {
  id: string;
  user: FriendCardUser;
  suggestion?: FriendSuggestionDTO;
};

const emptyCopy: Record<
  FriendsTabKey,
  {
    icon: React.ComponentProps<typeof FriendsEmptyState>['icon'];
    title: string;
    message: string;
  }
> = {
  friends: {
    icon: 'people-outline',
    title: 'Chưa có bạn bè',
    message: 'Khi bạn kết nối với mọi người, danh sách bạn bè sẽ xuất hiện tại đây.',
  },
  requests: {
    icon: 'mail-open-outline',
    title: 'Không có lời mời mới',
    message: 'Các lời mời kết bạn đang chờ xử lý sẽ được hiển thị ở mục này.',
  },
  suggestions: {
    icon: 'person-add-outline',
    title: 'Chưa có gợi ý phù hợp',
    message: 'Hệ thống sẽ đề xuất thêm người bạn có thể quen khi có dữ liệu mới.',
  },
  blocked: {
    icon: 'ban-outline',
    title: 'Danh sách chặn trống',
    message: 'Những người bạn đã chặn sẽ được liệt kê tại đây.',
  },
};

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Vui lòng thử lại sau.';
};

const flattenUsers = (pages?: Array<{ data?: UserDTO[] }>) => {
  return pages?.flatMap((page) => page.data ?? []) ?? [];
};

const userToListItem = (user: UserDTO): FriendListItem => ({
  id: user.id,
  user,
});

const suggestionToListItem = (
  suggestion: FriendSuggestionDTO,
): FriendListItem => ({
  id: suggestion.id,
  suggestion,
  user: {
    id: suggestion.user?.id ?? suggestion.id,
    firstName: suggestion.user?.firstName,
    lastName: suggestion.user?.lastName,
    avatarUrl: suggestion.user?.avatarUrl,
  },
});

const getSuggestionMeta = (suggestion?: FriendSuggestionDTO) => {
  if (!suggestion) {
    return undefined;
  }

  if (suggestion.mutualFriends > 0) {
    return `${suggestion.mutualFriends} bạn chung`;
  }

  if (suggestion.commonGroups && suggestion.commonGroups > 0) {
    return `${suggestion.commonGroups} nhóm chung`;
  }

  return undefined;
};

const getRequestedTab = (tab?: string | string[]): FriendsTabKey => {
  const value = Array.isArray(tab) ? tab[0] : tab;

  if (
    value === 'friends' ||
    value === 'requests' ||
    value === 'suggestions' ||
    value === 'blocked'
  ) {
    return value;
  }

  return 'friends';
};

export default function FriendsScreen() {
  const router = useRouter();
  const { tab, userId, userName } = useLocalSearchParams<{ tab?: string | string[], userId?: string, userName?: string }>();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<FriendsTabKey>(() =>
    getRequestedTab(tab),
  );
  const [pendingActionKey, setPendingActionKey] = React.useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  React.useEffect(() => {
    setActiveTab(getRequestedTab(tab));
  }, [tab]);

  const currentUserQuery = useCurrentUser();
  const currentUser = currentUserQuery.data;

  const isViewingOtherUser = Boolean(userId && userId !== currentUser?.id);
  const targetUserId = isViewingOtherUser ? userId! : (currentUser?.id ?? '');

  const friendsQuery = useFriendUsers(
    targetUserId,
    { limit: PAGE_SIZE, search: debouncedSearch },
    { enabled: activeTab === 'friends' && Boolean(targetUserId) },
  );
  const requestsQuery = useFriendRequestUsers(
    { limit: PAGE_SIZE },
    { enabled: activeTab === 'requests' },
  );
  const suggestionsQuery = useFriendSuggestions(
    { limit: PAGE_SIZE },
    { enabled: !isViewingOtherUser },
  );
  const blockedQuery = useBlockedUserProfiles(
    { limit: PAGE_SIZE },
    { enabled: activeTab === 'blocked' },
  );

  const createConversation = useCreateConversation();
  const removeFriend = useRemoveFriend();
  const acceptFriendRequest = useAcceptFriendRequest();
  const declineFriendRequest = useDeclineFriendRequest();
  const sendFriendRequest = useSendFriendRequest();
  const dismissFriendRecommendation = useDismissFriendRecommendation();
  const unblockUser = useUnblockUser();

  const showToast = React.useCallback(
    (value: AppToastData) => {
      toast.show({
        duration: 2400,
        component: (toastProps) => (
          <AppToast toast={value} toastProps={toastProps} />
        ),
      });
    },
    [toast],
  );

  const friends = React.useMemo(
    () => flattenUsers(friendsQuery.data?.pages).map(userToListItem),
    [friendsQuery.data?.pages],
  );

  const requests = React.useMemo(
    () => flattenUsers(requestsQuery.data?.pages).map(userToListItem),
    [requestsQuery.data?.pages],
  );

  const suggestions = React.useMemo(() => {
    const items =
      suggestionsQuery.data?.pages.flatMap((page) => page.data ?? []) ?? [];

    return items
      .filter((suggestion) => suggestion.id !== currentUser?.id)
      .map(suggestionToListItem);
  }, [currentUser?.id, suggestionsQuery.data?.pages]);

  const blockedUsers = React.useMemo(
    () => flattenUsers(blockedQuery.data?.pages).map(userToListItem),
    [blockedQuery.data?.pages],
  );

  const activeItems = React.useMemo(() => {
    if (activeTab === 'requests') {
      return requests;
    }

    if (activeTab === 'suggestions') {
      return suggestions;
    }

    if (activeTab === 'blocked') {
      return blockedUsers;
    }

    return friends;
  }, [activeTab, blockedUsers, friends, requests, suggestions]);

  const activeQueryState = React.useMemo(() => {
    if (activeTab === 'requests') {
      return requestsQuery;
    }

    if (activeTab === 'suggestions') {
      return suggestionsQuery;
    }

    if (activeTab === 'blocked') {
      return blockedQuery;
    }

    return friendsQuery;
  }, [activeTab, blockedQuery, friendsQuery, requestsQuery, suggestionsQuery]);

  const isInitialLoading =
    activeTab === 'friends'
      ? currentUserQuery.isLoading || activeQueryState.isLoading
      : activeQueryState.isLoading;
  const isRefreshing = activeQueryState.isRefetching;
  const isError =
    activeTab === 'friends'
      ? currentUserQuery.isError || activeQueryState.isError
      : activeQueryState.isError;
  const errorMessage =
    activeTab === 'friends' && currentUserQuery.isError
      ? getErrorMessage(currentUserQuery.error)
      : getErrorMessage(activeQueryState.error);

  const refetchActiveTab = React.useCallback(async () => {
    if (activeTab === 'friends') {
      await currentUserQuery.refetch();
    }

    await activeQueryState.refetch();
  }, [activeQueryState, activeTab, currentUserQuery]);

  const handleLoadMore = React.useCallback(() => {
    if (!activeQueryState.hasNextPage || activeQueryState.isFetchingNextPage) {
      return;
    }

    void activeQueryState.fetchNextPage();
  }, [activeQueryState]);

  const runAction = React.useCallback(
    async (
      key: string,
      task: () => Promise<void>,
      successToast: AppToastData,
    ) => {
      setPendingActionKey(key);

      try {
        await task();
        showToast(successToast);
      } catch (error) {
        showToast({
          title: 'Không thể thực hiện thao tác',
          message: getErrorMessage(error),
          variant: 'error',
        });
      } finally {
        setPendingActionKey(null);
      }
    },
    [showToast],
  );

  const handleOpenChat = React.useCallback(
    (user: FriendCardUser) => {
      void runAction(
        `message:${user.id}`,
        async () => {
          const conversation = await createConversation.mutateAsync({
            isGroup: false,
            participants: [user.id],
          });

          router.push(`/chat/${conversation._id}`);
        },
        {
          title: 'Đang mở cuộc trò chuyện',
          variant: 'success',
        },
      );
    },
    [createConversation, router, runAction],
  );

  const handleRemoveFriend = React.useCallback(
    (user: FriendCardUser) => {
      void runAction(
        `remove:${user.id}`,
        async () => {
          await removeFriend.mutateAsync(user.id);
          await Promise.all([friendsQuery.refetch(), currentUserQuery.refetch()]);
        },
        {
          title: 'Đã xóa bạn bè',
          message: 'Người này đã được gỡ khỏi danh sách bạn bè của bạn.',
          variant: 'success',
        },
      );
    },
    [currentUserQuery, friendsQuery, removeFriend, runAction],
  );

  const handleAcceptRequest = React.useCallback(
    (user: FriendCardUser) => {
      void runAction(
        `accept:${user.id}`,
        async () => {
          await acceptFriendRequest.mutateAsync(user.id);
          await Promise.all([
            requestsQuery.refetch(),
            friendsQuery.refetch(),
            currentUserQuery.refetch(),
          ]);
        },
        {
          title: 'Đã chấp nhận lời mời',
          message: 'Hai bạn đã trở thành bạn bè.',
          variant: 'success',
        },
      );
    },
    [acceptFriendRequest, currentUserQuery, friendsQuery, requestsQuery, runAction],
  );

  const handleDeclineRequest = React.useCallback(
    (user: FriendCardUser) => {
      void runAction(
        `decline:${user.id}`,
        async () => {
          await declineFriendRequest.mutateAsync(user.id);
          await requestsQuery.refetch();
        },
        {
          title: 'Đã từ chối lời mời',
          variant: 'success',
        },
      );
    },
    [declineFriendRequest, requestsQuery, runAction],
  );

  const handleSendRequest = React.useCallback(
    (item: FriendListItem) => {
      const suggestion = item.suggestion;

      void runAction(
        `send:${item.user.id}`,
        async () => {
          await sendFriendRequest.mutateAsync({
            targetId: item.user.id,
            recommendationId: suggestion?.recommendationId,
            recommendationRequestId: suggestion?.recommendationRequestId,
          });
          await suggestionsQuery.refetch();
        },
        {
          title: 'Đã gửi lời mời kết bạn',
          variant: 'success',
        },
      );
    },
    [runAction, sendFriendRequest, suggestionsQuery],
  );

  const handleDismissSuggestion = React.useCallback(
    (item: FriendListItem) => {
      const suggestion = item.suggestion;

      void runAction(
        `dismiss:${item.user.id}`,
        async () => {
          await dismissFriendRecommendation.mutateAsync({
            targetId: item.user.id,
            recommendationId: suggestion?.recommendationId,
            recommendationRequestId: suggestion?.recommendationRequestId,
          });
          await suggestionsQuery.refetch();
        },
        {
          title: 'Đã ẩn gợi ý',
          variant: 'success',
        },
      );
    },
    [dismissFriendRecommendation, runAction, suggestionsQuery],
  );

  const handleUnblock = React.useCallback(
    (user: FriendCardUser) => {
      void runAction(
        `unblock:${user.id}`,
        async () => {
          await unblockUser.mutateAsync(user.id);
          await blockedQuery.refetch();
        },
        {
          title: 'Đã bỏ chặn',
          message: 'Người này không còn nằm trong danh sách chặn.',
          variant: 'success',
        },
      );
    },
    [blockedQuery, runAction, unblockUser],
  );

  const getActionsForItem = React.useCallback(
    (item: FriendListItem): {
      primaryAction: FriendCardAction;
      secondaryAction?: FriendCardAction;
    } => {
      if (isViewingOtherUser) {
        return {
          primaryAction: {
            label: 'Xem hồ sơ',
            icon: 'person-circle-outline',
            variant: 'primary',
            onPress: () => router.push(`/user/${item.user.id}`),
          }
        };
      }

      if (activeTab === 'requests') {
        return {
          primaryAction: {
            label: 'Chấp nhận',
            icon: 'checkmark-circle-outline',
            variant: 'primary',
            loading: pendingActionKey === `accept:${item.user.id}`,
            disabled: Boolean(pendingActionKey),
            onPress: () => handleAcceptRequest(item.user),
          },
          secondaryAction: {
            label: 'Từ chối',
            icon: 'close-circle-outline',
            variant: 'danger',
            loading: pendingActionKey === `decline:${item.user.id}`,
            disabled: Boolean(pendingActionKey),
            onPress: () => handleDeclineRequest(item.user),
          },
        };
      }

      if (activeTab === 'suggestions') {
        return {
          primaryAction: {
            label: 'Kết bạn',
            icon: 'person-add-outline',
            variant: 'primary',
            loading: pendingActionKey === `send:${item.user.id}`,
            disabled: Boolean(pendingActionKey),
            onPress: () => handleSendRequest(item),
          },
          secondaryAction: {
            label: 'Bỏ qua',
            icon: 'close-outline',
            variant: 'neutral',
            loading: pendingActionKey === `dismiss:${item.user.id}`,
            disabled: Boolean(pendingActionKey),
            onPress: () => handleDismissSuggestion(item),
          },
        };
      }

      if (activeTab === 'blocked') {
        return {
          primaryAction: {
            label: 'Bỏ chặn',
            icon: 'lock-open-outline',
            variant: 'primary',
            loading: pendingActionKey === `unblock:${item.user.id}`,
            disabled: Boolean(pendingActionKey),
            onPress: () => handleUnblock(item.user),
          },
        };
      }

      return {
        primaryAction: {
          label: 'Nhắn tin',
          icon: 'chatbox-ellipses-outline',
          variant: 'primary',
          loading: pendingActionKey === `message:${item.user.id}`,
          disabled: Boolean(pendingActionKey),
          onPress: () => handleOpenChat(item.user),
        },
        secondaryAction: {
          label: 'Xóa',
          icon: 'person-remove-outline',
          variant: 'danger',
          loading: pendingActionKey === `remove:${item.user.id}`,
          disabled: Boolean(pendingActionKey),
          onPress: () => handleRemoveFriend(item.user),
        },
      };
    },
    [
      activeTab,
      handleAcceptRequest,
      handleDeclineRequest,
      handleDismissSuggestion,
      handleOpenChat,
      handleRemoveFriend,
      handleSendRequest,
      handleUnblock,
      pendingActionKey,
    ],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: FriendListItem }) => {
      const { primaryAction, secondaryAction } = getActionsForItem(item);

      if (activeTab === 'friends' || activeTab === 'blocked') {
        return (
          <FriendListItem
            user={item.user}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
          />
        );
      }

      return (
        <FriendCard
          user={item.user}
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
          meta={activeTab === 'suggestions' ? getSuggestionMeta(item.suggestion) : undefined}
        />
      );
    },
    [activeTab, getActionsForItem],
  );

  const emptyState = emptyCopy[activeTab];

  return (
    <View className="flex-1 bg-[#f0f2f5] dark:bg-app-bg-dark">
      <AppHeader title={isViewingOtherUser ? `Bạn bè của ${userName ?? 'người dùng'}` : "Bạn bè"} variant="default" />
      {!isViewingOtherUser && (
        <FriendsTopTabs activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {activeTab === 'friends' && (
        <View className="bg-app-surface px-5 pb-3 pt-3 dark:bg-app-bg-dark">
          <View className="h-11 flex-row items-center rounded-full bg-app-surface-elevated px-4 dark:bg-app-surface-elevated-dark">
            <Ionicons name="search" size={20} color="#64748b" />
            <TextInput
              className="flex-1 ml-2 text-base text-app-fg dark:text-app-fg-dark font-medium"
              placeholder="Tìm kiếm bạn bè..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Ionicons 
                name="close-circle" 
                size={20} 
                color="#64748b" 
                onPress={() => setSearchQuery('')}
              />
            )}
          </View>
        </View>
      )}

      {isInitialLoading && activeItems.length === 0 ? (
        <View className="gap-5 px-5 py-5">
          {skeletonItems.map((item) => (
            <FriendCardSkeleton key={item} />
          ))}
        </View>
      ) : isError ? (
        <FriendsErrorState
          message={errorMessage}
          onRetry={() => {
            void refetchActiveTab();
          }}
        />
      ) : activeItems.length === 0 ? (
        <FriendsEmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          message={emptyState.message}
        />
      ) : (
        <FlashList
          data={activeItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: Math.max(insets.bottom + 28, 44),
          }}
          ItemSeparatorComponent={() => <View className="h-5" />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <FriendsListFooter loading={activeQueryState.isFetchingNextPage} />
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                void refetchActiveTab();
              }}
              tintColor="#0ea5e9"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
