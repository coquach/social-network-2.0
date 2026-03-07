'use client';
import { Loader } from "@/components/loader-componnet";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroupMembers } from '@repo/shared';
import { GroupMemberStatus } from "@/models/group/enums/group-member-status.enum";
import { GroupRole } from "@/models/group/enums/group-role.enum";
import { GroupMemberDTO } from "@/models/group/groupMemberDTO";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { MemberCard } from "./_components/member-card";
import { UserCircle2 } from "lucide-react";

type MemberSectionProps = {
  groupId: string;
};

export const MemberSection = ({ groupId }: MemberSectionProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    isError,
    error,
  } = useGroupMembers(groupId, {
    status: GroupMemberStatus.ACTIVE,
    limit: 20,
  });

  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allMembers: GroupMemberDTO[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data ?? []);
  }, [data]);

  console.log('All members:', allMembers);

  const totalActive = allMembers.length;

  // Gom nhóm theo role
  const groupedByRole = useMemo(() => {
    const map: Partial<Record<GroupRole, GroupMemberDTO[]>> = {};
    for (const member of allMembers) {
      const r = member.role;
      if (!map[r]) map[r] = [];
      map[r]!.push(member);
    }
    return map;
  }, [allMembers]);

  const roleOrder: GroupRole[] = [
    GroupRole.OWNER,
    GroupRole.ADMIN,
    GroupRole.MODERATOR,
    GroupRole.MEMBER,
  ];

  const roleLabel: Record<GroupRole, string> = {
    [GroupRole.OWNER]: 'Chủ nhóm',
    [GroupRole.ADMIN]: 'Quản trị viên',
    [GroupRole.MODERATOR]: 'Người kiểm duyệt',
    [GroupRole.MEMBER]: 'Thành viên',
  };

  if (isLoading || status === 'pending') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 text-center">
        Không thể tải danh sách thành viên.
        {error instanceof Error && (
          <>
            <br />
            {error.message}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
      {/* Header */}
      <div className="flex gap-2 items-center">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
          <UserCircle2 className="h-4 w-4" />
        </div>
       
          <h2 className="text-sm font-semibold text-sky-900">
            Thành viên nhóm
          </h2>
        
      </div>

      {/* List theo từng role */}
      {roleOrder.map((role) => {
        const members = groupedByRole[role];
        if (!members || members.length === 0) return null;

        return (
          <section key={role} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide text-sky-800">
                {roleLabel[role]} ({members.length})
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              {members.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Sentinel infinite scroll */}
      <div ref={ref} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && <Loader size={32} />}
        {!hasNextPage && totalActive > 0 && (
          <span className="text-xs text-muted-foreground">
            Đã hiển thị tất cả thành viên.
          </span>
        )}
      </div>
    </div>
  );
};
