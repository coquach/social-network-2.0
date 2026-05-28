import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  type StyleProp,
  type ViewStyle,
  View,
  type FlatListProps,
} from 'react-native';

import { RootType, useComments, type CommentDTO } from '@repo/shared';

import { CommentItem } from './comment-item';

/** ================= PROPS ================= */
type CommentListProps = {
  rootId: string;
  rootType: RootType;
  listHeaderComponent?: React.ReactElement | null;
  style?: StyleProp<ViewStyle>;
} & Pick<
  FlatListProps<CommentDTO>,
  'contentContainerStyle' | 'ListFooterComponent'
>;

/** ================= COMPONENT ================= */
export const CommentList = React.forwardRef<
  FlatList<CommentDTO>,
  CommentListProps
>(function CommentList(
  {
    rootId,
    rootType,
    listHeaderComponent,
    style,
    contentContainerStyle,
    ListFooterComponent,
  },
  ref,
) {
  /** ================= DATA ================= */
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useComments({ rootId, rootType });

  const comments = React.useMemo(() => {
    const all = data?.pages.flatMap((page) => page.data) ?? [];
    return all.filter((item) => !item.parentId);
  }, [data]);

  const pages = data?.pages ?? [];
  const lastPage = pages[pages.length - 1];
  const hasNextPage = Boolean(lastPage && lastPage.page < lastPage.totalPages);

  /** ================= RENDER ================= */
  const renderItem = React.useCallback(
    ({ item }: { item: CommentDTO }) => (
      <CommentItem comment={item} rootId={rootId} rootType={rootType} />
    ),
    [rootId, rootType],
  );

  const keyExtractor = React.useCallback((item: CommentDTO) => item.id, []);

  /** ================= DEFAULT FOOTER ================= */
  const defaultFooter = React.useMemo(
    () => (
      <View className="pb-6">
        {hasNextPage && (
          <View className="px-4 pb-3">
            <Text
              className="text-center text-sm font-semibold text-app-primary"
              onPress={() => {
                if (!isFetchingNextPage) {
                  void fetchNextPage();
                }
              }}
            >
              {isFetchingNextPage ? 'Đang tải thêm...' : 'Tải thêm bình luận'}
            </Text>
          </View>
        )}
      </View>
    ),
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  /** ================= EMPTY / ERROR ================= */
  const listEmpty = React.useMemo(() => {
    if (isLoading) {
      return (
        <View className="items-center py-8">
          <ActivityIndicator size="small" color="#0ea5e9" />
        </View>
      );
    }

    if (isError) {
      return (
        <View className="items-center px-6 py-8">
          <Text className="text-center text-sm text-red-500">
            {error?.message ?? 'Không tải được bình luận.'}
          </Text>
          <Text
            className="mt-2 text-sm font-semibold text-app-primary"
            onPress={() => {
              void refetch();
            }}
          >
            Thử lại
          </Text>
        </View>
      );
    }

    return (
      <View className="items-center px-6 py-8">
        <Text className="text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận.
        </Text>
      </View>
    );
  }, [error?.message, isError, isLoading, refetch]);

  /** ================= UI ================= */
  return (
    <FlatList
      ref={ref}
      style={style}
      data={comments}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={listHeaderComponent}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={ListFooterComponent ?? defaultFooter}
      contentContainerStyle={contentContainerStyle}
      className="bg-app-bg dark:bg-app-bg-dark"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.6}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      }}
      removeClippedSubviews
      initialNumToRender={6}
      windowSize={8}
      maxToRenderPerBatch={4}
      updateCellsBatchingPeriod={50}
    />
  );
});
