'use client';
import { Loader } from '@/components/loader-componnet';
import { useRecommendedGroups } from '@repo/shared';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { GroupCardSummary } from '../../../../../../components/group-summary-card';

export const ExploreList = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useRecommendedGroups({ limit: 20 });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, isFetchingNextPage, hasNextPage]);

  const allGroups = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border rounded-xl h-full bg-red-50 text-red-600 text-center space-y-2">
        <span>Không thể tải nhóm khám phá 😢</span>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }
  return (
    <div className="space-y-4 ">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {allGroups.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            Hiện không có nhóm nào.
          </div>
        ) : (
          allGroups.map((item) => {
            return <GroupCardSummary key={item.id} group={item} />;
          })
        )}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader size={24} />
        </div>
      )}

      <div ref={ref}></div>
    </div>
  );
};
