'use client';

import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';

import { GroupCardSummary } from '@/components/group-summary-card';
import { PostCardFull } from '@/components/post/post-card-full';
import { Card } from '@/components/ui/card';
import {
  useSearchGroups,
  useSearchPosts,
  useSearchUsers,
  GroupDTO,
  GroupSummaryDTO,
  GroupPrivacy,
  GroupStatus,
  PostSnapshotDTO,
  Emotion,
  UserDTO,
} from '@repo/shared';
import { SearchGroupSortBy } from '@/lib/actions/search/search-actions';
import { UserSearchCard } from './_components/user-search-card';

type SearchType = 'posts' | 'groups' | 'users';
const SEARCH_TYPES: SearchType[] = ['posts', 'groups', 'users'];

export default function SearchPageClient() {
  const params = useSearchParams();

  const rawQ = params?.get('q') ?? '';
  const q = rawQ.trim();
  const paramType = params?.get('type') as SearchType | null;
  const type: SearchType = SEARCH_TYPES.includes(paramType ?? 'posts')
    ? (paramType as SearchType)
    : 'posts';

  // post filters
  const emotionParam = params?.get('emotion');
  const emotion = emotionParam ? (emotionParam as Emotion) : undefined;

  // group filters
  const privacyParam = params?.get('privacy') as GroupPrivacy | null;
  const sortByParam = params?.get('sortBy') as SearchGroupSortBy | null;
  const privacy = privacyParam ?? undefined;
  const sortBy = sortByParam ?? undefined;

  // user filters
  const isActiveStr = params?.get('isActive') ?? undefined;
  const isActive =
    isActiveStr === 'true' ? true : isActiveStr === 'false' ? false : undefined;

  // Queries
  const postsQ = useSearchPosts({ query: q, emotion });
  const groupsQ = useSearchGroups({ query: q, privacy, sortBy });
  const usersQ = useSearchUsers({ query: q });

  const activeQ =
    type === 'posts' ? postsQ : type === 'groups' ? groupsQ : usersQ;
  const postItems = postsQ.data?.pages.flatMap((page) => page.data ?? []) ?? [];
  const groupItems =
    groupsQ.data?.pages.flatMap((page) => page.data ?? []) ?? [];
  const userItems = usersQ.data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const activeItems =
    type === 'posts' ? postItems : type === 'groups' ? groupItems : userItems;

  // Infinite
  const { ref, inView } = useInView({ rootMargin: '260px' });
  React.useEffect(() => {
    if (!inView) return;
    if (activeQ.hasNextPage && !activeQ.isFetchingNextPage)
      activeQ.fetchNextPage();
  }, [
    inView,
    activeQ.hasNextPage,
    activeQ.isFetchingNextPage,
    activeQ.fetchNextPage,
    activeQ,
  ]);

  // Label tiếng Việt theo type
  const typeLabel =
    type === 'posts' ? 'bài viết' : type === 'groups' ? 'nhóm' : 'người dùng';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-sky-500">
              Kết quả tìm kiếm
            </div>
            <div className="text-sm text-slate-500">
              {q ? (
                <>
                  Đang tìm{' '}
                  <span className="font-semibold text-slate-800">{q}</span>
                  <span className="text-slate-400"> - </span>
                  Loại:{' '}
                  <span className="font-medium text-sky-600">{typeLabel}</span>
                </>
              ) : (
                'Hãy nhập từ khóa ở thanh tìm kiếm để xem kết quả tại đây.'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Empty query */}
      {!q ? (
        <Card className="rounded-2xl border border-sky-100 bg-white p-6">
          <div className="text-sm text-slate-600">
            Bạn hãy tìm kiếm từ{' '}
            <span className="font-medium text-sky-700">
              thanh Search trên navbar
            </span>{' '}
            để hiển thị kết quả.
          </div>
        </Card>
      ) : activeQ.isLoading ? (
        // Loading skeleton
        <div className="space-y-4">
          {type === 'posts' &&
            Array.from({ length: 3 }).map((_, i) => (
              <PostCardFull.Skeleton key={i} />
            ))}

          {type === 'groups' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <GroupCardSummary.Skeleton key={i} />
              ))}
            </div>
          )}

          {type === 'users' &&
            Array.from({ length: 4 }).map((_, i) => (
              <UserSearchCard.Skeleton key={i} />
            ))}
        </div>
      ) : activeQ.isError ? (
        // Error
        <Card className="rounded-2xl border border-red-100 bg-white p-6">
          <div className="text-sm text-red-600 font-medium">
            Có lỗi khi tải kết quả.
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {(activeQ.error as Error)?.message ?? 'Vui lòng thử lại sau.'}
          </div>
        </Card>
      ) : activeItems.length === 0 ? (
        // No result
        <Card className="rounded-2xl border border-sky-100 bg-white p-6">
          <div className="text-sm text-slate-600">
            Không tìm thấy{' '}
            <span className="font-medium text-sky-700">{typeLabel}</span> phù
            hợp với từ khóa{' '}
            <span className="font-semibold text-slate-800">{q}</span>.
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Thử đổi từ khóa, hoặc chỉnh bộ lọc ở thanh bên trái.
          </div>
        </Card>
      ) : (
        // Results
        <div className="space-y-4">
          {type === 'posts' &&
            postItems.map((post: PostSnapshotDTO) => (
              <PostCardFull key={post.postId} data={post} />
            ))}

          {type === 'groups' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groupItems.map((group: GroupSummaryDTO) => {
                const groupCard: GroupDTO = {
                  id: group.id,
                  name: group.name,
                  description: group.description,
                  avatarUrl: group.avatarUrl ?? '',
                  coverImageUrl: '',
                  privacy: group.privacy,
                  rules: undefined,
                  members: group.members,
                  status: GroupStatus.ACTIVE,
                  createdAt: group.createdAt,
                };

                return <GroupCardSummary key={group.id} group={groupCard} />;
              })}
            </div>
          )}

          {type === 'users' &&
            userItems.map((user: UserDTO) => (
              <UserSearchCard key={user.id} user={user} />
            ))}

          <div ref={ref} />

          {activeQ.isFetchingNextPage && (
            <div className="text-sm text-sky-700 font-medium">
              Đang tải thêm...
            </div>
          )}
          {!activeQ.hasNextPage && (
            <div className="text-sm text-slate-500">
              Đã hiển thị hết kết quả.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
