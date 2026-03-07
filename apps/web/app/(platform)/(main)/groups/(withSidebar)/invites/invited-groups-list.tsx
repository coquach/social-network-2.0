'use client';

import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GroupCardSummary } from '@/components/group-summary-card';
import { Loader } from '@/components/loader-componnet';
import {
  useAcceptGroupInvite,
  useDeclineGroupInvite,
  useInvitedGroups,
} from '@repo/shared';
import { InvitedGroupDTO } from '@/models/group/groupInviteDTO';

type InvitedGroupCardProps = {
  group: InvitedGroupDTO;
};

const InvitedGroupCard = ({ group }: InvitedGroupCardProps) => {
  const { mutate: acceptInvite, isPending: isAccepting } =
    useAcceptGroupInvite(group.id);
  const { mutate: declineInvite, isPending: isDeclining } =
    useDeclineGroupInvite(group.id);
  const inviterNames = group.inviterNames?.filter(Boolean) ?? [];
  const maxVisibleInviters = 2;
  const visibleInviters = inviterNames.slice(0, maxVisibleInviters);
  const remainingInviters = inviterNames.length - visibleInviters.length;

  return (
    <div className="space-y-2">
      <GroupCardSummary group={group} />
      <div className="flex flex-wrap items-center gap-1 text-xs text-slate-600">
        <span className="text-slate-500">Được mời bởi:</span>
        {inviterNames.length > 0 ? (
          <>
            {visibleInviters.map((name, index) => (
              <Badge
                key={`${name}-${index}`}
                variant="secondary"
                className="bg-slate-100 text-slate-700"
              >
                {name}
              </Badge>
            ))}
            {remainingInviters > 0 && (
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-700"
              >
                +{remainingInviters}
              </Badge>
            )}
          </>
        ) : (
          <span className="text-slate-500">Không rõ</span>
        )}
      </div>
      <div className="flex items-center gap-2 justify-between">
        <Button
          onClick={() => acceptInvite()}
          disabled={isAccepting || isDeclining}
          className='flex-1'
        >
          Chấp nhận
        </Button>
        <Button
          variant="outline"
          onClick={() => declineInvite()}
          disabled={isAccepting || isDeclining}
          className='flex-1'
        >
          Từ chối
        </Button>
      </div>
    </div>
  );
};

export const InvitedGroupsList = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInvitedGroups({ limit: 20 });

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
      <div className="flex justify-center py-10">
        <Loader size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border rounded-xl h-full bg-red-50 text-red-600 text-center space-y-2">
        <span>Không thể tải danh sách lời mời</span>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {allGroups.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            Hiện không có lời mời tham gia nhóm nào.
          </div>
        ) : (
          allGroups.map((item) => (
            <InvitedGroupCard key={item.id} group={item} />
          ))
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
