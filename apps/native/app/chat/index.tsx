import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@clerk/expo';
import {
  type ConversationDTO,
  useConversations,
  useDeleteConversation,
  useHideConversation,
  useLeaveConversation,
  useUnhideConversation,
} from '@repo/shared';
import { router } from 'expo-router';
import { Button } from 'heroui-native/button';
import { SearchField } from 'heroui-native/search-field';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreateConversationSheet } from '~/components/chat/create-conversation-sheet';
import {
  ChatConversationRow,
  ChatConversationRowSkeleton,
} from '~/components/chat/chat-conversation-row';
import {
  DirectChatAvatar,
  GroupChatAvatar,
} from '~/components/chat/chat-avatar';
import {
  getConversationLastActivity,
  getConversationName,
  getMessagePreview,
} from '~/components/chat/chat-helpers';
import { AppBottomSheet } from '~/components/ui/app-bottom-sheet';
import {
  AppBackButton,
  AppHeader,
  AppHeaderIconButton,
} from '~/components/ui/app-header';
import { AppLoadingBlock } from '~/components/ui/app-loading';
import { AppScreen } from '~/components/ui/app-screen';
import { AppToast, type AppToastData } from '~/components/ui/app-toast';
import { FloatingActionButton } from '~/components/ui/floating-action-button';
import { cn } from '~/lib/cn';

const sortConversations = (conversations: ConversationDTO[]) => {
  return [...conversations].sort(
    (a, b) =>
      getConversationLastActivity(b).getTime() -
      getConversationLastActivity(a).getTime(),
  );
};

const conversationSkeletonItems = Array.from(
  { length: 7 },
  (_, index) => index,
);

function ConversationSheetAction({
  icon,
  label,
  onPress,
  disabled = false,
  destructive = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Button
      variant={destructive ? 'danger-soft' : 'ghost'}
      className="min-h-14 justify-start rounded-[22px] px-4"
      isDisabled={disabled}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={18}
        color={destructive ? '#e11d48' : '#0ea5e9'}
      />
      <Text
        className={cn(
          'ml-3 text-left text-[15px] font-semibold',
          destructive
            ? 'text-rose-600 dark:text-rose-300'
            : 'text-app-fg dark:text-app-fg-dark',
        )}
      >
        {label}
      </Text>
    </Button>
  );
}

export default function ChatInboxScreen() {
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [searchText, setSearchText] = React.useState('');
  const [selectedConversation, setSelectedConversation] =
    React.useState<ConversationDTO | null>(null);
  const [actionOpen, setActionOpen] = React.useState(false);
  const [createConversationOpen, setCreateConversationOpen] =
    React.useState(false);

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversations({ limit: 20 }, { enabled: isLoaded && !!isSignedIn });

  const { mutateAsync: hideConversation, isPending: isHiding } =
    useHideConversation();
  const { mutateAsync: unhideConversation, isPending: isUnhiding } =
    useUnhideConversation();
  const { mutateAsync: leaveConversation, isPending: isLeaving } =
    useLeaveConversation();
  const { mutateAsync: deleteConversation, isPending: isDeleting } =
    useDeleteConversation();

  const showActionToast = React.useCallback(
    (value: AppToastData) => {
      toast.show({
        component: (toastProps) => (
          <AppToast toast={value} toastProps={toastProps} />
        ),
      });
    },
    [toast],
  );

  const handleSettingsPress = React.useCallback(() => {
    showActionToast({
      title: 'Tính năng đang phát triển',
      message:
        'Chức năng này sẽ sớm được ra mắt trong các bản cập nhật tiếp theo.',
      variant: 'info',
    });
  }, [showActionToast]);

  useFocusEffect(
    React.useCallback(() => {
      if (isLoaded && !isSignedIn) {
        router.replace('/(auth)/sign-in');
      }
    }, [isLoaded, isSignedIn]),
  );

  const allConversations = React.useMemo(() => {
    const items = data?.pages.flatMap((page) => page.data) ?? [];
    return sortConversations(items);
  }, [data?.pages]);

  const conversations = React.useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return allConversations;
    }

    return allConversations.filter((conversation) => {
      const name = getConversationName(conversation);
      const preview = getMessagePreview(
        conversation.lastMessage,
        conversation.isGroup,
        name,
        { currentUserId: userId ?? null },
      );

      return [name, preview].some((value) =>
        value.toLowerCase().includes(keyword),
      );
    });
  }, [allConversations, searchText, userId]);

  const selectedConversationName = React.useMemo(() => {
    if (!selectedConversation) {
      return '';
    }

    return getConversationName(selectedConversation);
  }, [selectedConversation]);

  const isHidden = Boolean(
    userId && selectedConversation?.hiddenFor?.includes(userId),
  );
  const isGroup = Boolean(selectedConversation?.isGroup);
  const isGroupAdmin = Boolean(
    selectedConversation?.isGroup &&
    userId &&
    selectedConversation.admins.includes(userId),
  );
  const isActionPending = isHiding || isUnhiding || isLeaving || isDeleting;

  const closeActionSheet = React.useCallback(() => {
    setActionOpen(false);
    setSelectedConversation(null);
  }, []);

  const openConversationActions = React.useCallback(
    (conversation: ConversationDTO) => {
      setSelectedConversation(conversation);
      setActionOpen(true);
    },
    [],
  );

  const handleOpenConversation = React.useCallback(
    (conversation: ConversationDTO) => {
      router.push(`/chat/${conversation._id}`);
    },
    [],
  );

  const executeConversationAction = React.useCallback(
    async (action: 'hide' | 'unhide' | 'leave' | 'delete') => {
      if (!selectedConversation) {
        return;
      }

      try {
        if (action === 'hide') {
          await hideConversation(selectedConversation._id);
          showActionToast({
            title: 'Đã ẩn cuộc trò chuyện',
            message: 'Bạn có thể bật hiện lại bằng cách giữ đoạn chat',
            variant: 'success',
          });
        }

        if (action === 'unhide') {
          await unhideConversation(selectedConversation._id);
          showActionToast({
            title: 'Đã hiện cuộc trò chuyện',
            variant: 'success',
          });
        }

        if (action === 'leave') {
          await leaveConversation(selectedConversation._id);
          showActionToast({
            title: 'Đã rời nhóm ',
            message: 'Bạn sẽ không nhận được tin nhắn từ nhóm này nữa.',
            variant: 'success',
          });
        }

        if (action === 'delete') {
          await deleteConversation(selectedConversation._id);
          showActionToast({
            title: 'Da xoa nhom',
            variant: 'success',
          });
        }

        closeActionSheet();
      } catch (error) {
        showActionToast({
          title: 'Không thể thực hiện hành động',
          message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
          variant: 'error',
        });
      }
    },
    [
      closeActionSheet,
      deleteConversation,
      hideConversation,
      leaveConversation,
      selectedConversation,
      showActionToast,
      unhideConversation,
    ],
  );

  const confirmConversationAction = React.useCallback(
    (action: 'leave' | 'delete') => {
      if (!selectedConversation) {
        return;
      }

      const config =
        action === 'leave'
          ? {
              title: 'Rời nhóm?',
              message: 'Bạn sẽ không nhận được tin nhắn từ nhóm này nữa.',
              confirmText: 'Rời nhóm',
            }
          : {
              title: 'Xóa nhóm?',
              message: 'Hành động này không thể hoàn tác.',
              confirmText: 'Xóa nhóm',
            };

      Alert.alert(config.title, config.message, [
        { text: 'Hủy', style: 'cancel' },
        {
          text: config.confirmText,
          style: 'destructive',
          onPress: () => {
            void executeConversationAction(action);
          },
        },
      ]);
    },
    [executeConversationAction, selectedConversation],
  );

  const hasSearchText = searchText.trim().length > 0;

  const emptyTitle = hasSearchText
    ? 'Không tìm thấy cuộc trò chuyện nào'
    : 'Bạn chưa có cuộc trò chuyện nào';
  const emptyDescription = hasSearchText
    ? 'Hãy thử điều chỉnh từ khóa tìm kiếm của bạn.'
    : 'Nhấn vào biểu tượng tin nhắn để bắt đầu cuộc trò chuyện mới với bạn bè của bạn.';

  return (
    <AppScreen className="px-0 py-0">
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <View className="absolute left-0 right-0 top-0 h-48 overflow-hidden">
          <View className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-sky-300/18 dark:bg-sky-400/10" />
          <View className="absolute right-6 top-4 h-24 w-24 rounded-full bg-cyan-300/14 dark:bg-cyan-300/10" />
        </View>

        <AppHeader
          leading={<AppBackButton />}
          trailing={
            <AppHeaderIconButton
              icon="settings-outline"
              variant="ghost"
              onPress={handleSettingsPress}
            />
          }
          contentClassName="items-center justify-center"
        >
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-[22px] font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
              Trò chuyện
            </Text>
          </View>
        </AppHeader>

        <View className="px-5 pb-4">
          <SearchField value={searchText} onChange={setSearchText}>
            <SearchField.Group className="rounded-[28px] border border-white/70 bg-white/92 dark:border-app-border-dark dark:bg-app-surface-dark/92">
              <SearchField.SearchIcon
                iconProps={{ color: '#0ea5e9', size: 18 }}
              />
              <SearchField.Input
                variant="secondary"
                placeholder="Tìm kiếm các cuộc trò chuyện"
                className="min-h-12 rounded-[28px] bg-transparent"
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </View>

        {isLoading ? (
          <FlashList
            data={conversationSkeletonItems}
            keyExtractor={(item) => `conversation-skeleton-${item}`}
            renderItem={() => <ChatConversationRowSkeleton />}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 28,
              paddingTop: 6,
            }}
            ItemSeparatorComponent={() => <View className="h-2.5" />}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : null}

        {!isLoading ? (
          <>
            {isLoading ? (
              <AppLoadingBlock label="Đang tải cuộc trò chuyện..." />
            ) : (
              <FlashList
                data={conversations}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <ChatConversationRow
                    conversation={item}
                    onPress={handleOpenConversation}
                    onLongPress={openConversationActions}
                  />
                )}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: insets.bottom + 28,
                  paddingTop: 6,
                  flex: 1,
                  justifyContent:
                    conversations.length === 0 ? 'center' : 'flex-start',
                }}
                ItemSeparatorComponent={() => <View className="h-2.5" />}
                showsVerticalScrollIndicator={false}
                onRefresh={() => {
                  void refetch();
                }}
                refreshing={isRefetching}
                onEndReached={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    void fetchNextPage();
                  }
                }}
                onEndReachedThreshold={0.35}
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <View className="py-5">
                      <AppLoadingBlock label="Đang tải thêm..." />
                    </View>
                  ) : (
                    <View className="h-4" />
                  )
                }
                ListEmptyComponent={
                  <View className="items-center justify-center px-8 pt-24">
                    <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-app-primary/12 dark:bg-app-primary-dark/18">
                      <Ionicons
                        name={
                          hasSearchText
                            ? 'search-outline'
                            : 'chatbubbles-outline'
                        }
                        size={28}
                        color="#0ea5e9"
                      />
                    </View>
                    <Text className="mt-5 text-center text-lg font-bold text-app-fg dark:text-app-fg-dark">
                      {emptyTitle}
                    </Text>
                    <Text className="mt-2 max-w-[17rem] text-center text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
                      {emptyDescription}
                    </Text>
                  </View>
                }
              />
            )}
          </>
        ) : null}
      </View>

      <AppBottomSheet
        visible={actionOpen}
        onClose={closeActionSheet}
        title={selectedConversationName || 'Tùy chọn cuộc trò chuyện'}
        description="Nhấn giữ cuộc trò chuyện để xem thêm tùy chọn"
      >
        {selectedConversation ? (
          <View className="gap-4">
            <View className="flex-row items-center gap-3 rounded-[24px] bg-app-surface-elevated px-3 py-3 dark:bg-app-surface-elevated-dark">
              {selectedConversation.isGroup ? (
                <GroupChatAvatar
                  conversation={selectedConversation}
                  size="md"
                />
              ) : (
                <DirectChatAvatar
                  name={selectedConversationName || 'Cuộc trò chuyện'}
                  size="md"
                />
              )}
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="text-[15px] font-semibold text-app-fg dark:text-app-fg-dark"
                >
                  {selectedConversationName}
                </Text>
                <Text
                  numberOfLines={2}
                  className="mt-1 text-[13px] leading-5 text-app-muted-fg dark:text-app-muted-fg-dark"
                >
                  {getMessagePreview(
                    selectedConversation.lastMessage,
                    selectedConversation.isGroup,
                    selectedConversationName,
                    { currentUserId: userId ?? null },
                  )}
                </Text>
              </View>
            </View>

            <View className="gap-2">
              {!isGroup ? (
                <ConversationSheetAction
                  icon={isHidden ? 'eye-outline' : 'eye-off-outline'}
                  label={
                    isHidden ? 'Hiện cuộc trò chuyện' : 'Ẩn cuộc trò chuyện'
                  }
                  disabled={isActionPending}
                  onPress={() => {
                    void executeConversationAction(
                      isHidden ? 'unhide' : 'hide',
                    );
                  }}
                />
              ) : null}

              {isGroup ? (
                <ConversationSheetAction
                  label="Rời nhóm"
                  icon="log-out-outline"
                  destructive
                  disabled={isActionPending}
                  onPress={() => confirmConversationAction('leave')}
                />
              ) : null}

              {isGroupAdmin ? (
                <ConversationSheetAction
                  label="Xóa nhóm"
                  destructive
                  icon="trash-outline"
                  disabled={isActionPending}
                  onPress={() => confirmConversationAction('delete')}
                />
              ) : null}
            </View>

            <Button
              variant="secondary"
              className="rounded-[22px]"
              onPress={closeActionSheet}
            >
              Hủy
            </Button>
          </View>
        ) : null}
      </AppBottomSheet>

      <View
        pointerEvents="box-none"
        className="absolute bottom-0 left-0 right-0"
      >
        <View
          className="items-end px-5"
          style={{ paddingBottom: insets.bottom + 18 }}
        >
          <FloatingActionButton
            isActive={createConversationOpen}
            onPress={() => {
              setCreateConversationOpen((current) => !current);
            }}
            accessibilityLabel="Tao cuoc tro chuyen"
          />
        </View>
      </View>

      <CreateConversationSheet
        visible={createConversationOpen}
        onClose={() => {
          setCreateConversationOpen(false);
        }}
      />
    </AppScreen>
  );
}
