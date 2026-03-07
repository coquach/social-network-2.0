'use client';

import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

import { ErrorFallback } from "@/components/error-fallback";
import { PostCardFull } from "@/components/post/post-card-full";
import { useGroupPermissionContext } from "@/contexts/group-permission-context";
import { useGetPostByGroup } from "@/hooks/use-post-hook";
import { MembershipStatus } from "@/models/group/groupDTO";
import { PostGroupStatus } from "@/models/social/enums/social.enum";

export const GroupPostList = ({ groupId }: { groupId: string }) => {
  const { group, role } = useGroupPermissionContext();
  const membershipStatus =
    group?.membershipStatus ??
    (role ? MembershipStatus.MEMBER : MembershipStatus.NONE);
  const isMember = membershipStatus === MembershipStatus.MEMBER;
  const canViewPosts = isMember || group?.privacy === "PUBLIC";

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPostByGroup(
    groupId,
    { limit: 10, status: PostGroupStatus.PUBLISHED },
    { enabled: canViewPosts }
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (!canViewPosts) return;
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, isFetchingNextPage, hasNextPage, canViewPosts]);

  const allPosts = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  return (
    <div className="space-y-4">
      {!canViewPosts && (
        <div className="w-full p-8 text-neutral-500 text-center">
          Bạn cần tham gia nhóm để xem bài viết.
        </div>
      )}
      {canViewPosts &&
        isLoading &&
        Array.from({ length: 2 }).map((_, index) => (
          <div key={index}>
            <PostCardFull.Skeleton />
          </div>
        ))}
      {canViewPosts && isError && <ErrorFallback message={error.message} />}
      {canViewPosts && !isLoading && !isError && allPosts.length === 0 && (
        <div className="w-full p-8 text-neutral-500 text-center">
          Không có bài viết nào trong nhóm.
        </div>
      )}

      {canViewPosts &&
        allPosts.map((post) => (
          <PostCardFull key={post.postId} data={post} />
        ))}
      {canViewPosts && isFetchingNextPage && <PostCardFull.Skeleton />}
      <div ref={ref}></div>
    </div>
  );
};
