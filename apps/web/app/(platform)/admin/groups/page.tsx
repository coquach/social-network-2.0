'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { useAdminGroups, useGroupModeration } from '@/hooks/use-admin-group';
import { AdminGroupQuery } from '@/lib/actions/admin/admin-group-action';
import { AdminGroupDTO } from '@/models/group/adminGroupDTO';
import { GroupStatus } from '@/models/group/enums/group-status.enum';
import { LogType } from '@/models/log/logDTO';
import { AdminActivityLog } from '../_components/admin-activity-log';
import { GroupDetailDialog } from './_components/group-detail-dialog';
import { GroupReportsDrawer } from './_components/group-reports-drawer';
import { GroupsTable } from './_components/groups-table';
import { GroupsToolbar } from './_components/groups-toolbar';

export default function AdminGroupsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramsString = searchParams.toString();

  const parseFilterFromParams = React.useCallback((paramsStr: string): AdminGroupQuery => {
    const sp = new URLSearchParams(paramsStr);
    const page = Number(sp.get('page') ?? '1');
    const limit = Number(sp.get('limit') ?? '8');
    const name = sp.get('name') || undefined;
    const status = sp.get('status') || undefined;
    const memberRange = sp.get('memberRange') || undefined;
    return {
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 8,
      name,
      status: status as any,
      memberRange: memberRange as any,
    };
  }, []);

  const [filter, setFilter] = React.useState<AdminGroupQuery>(() => parseFilterFromParams(paramsString));
  const [selectedGroup, setSelectedGroup] = React.useState<AdminGroupDTO | null>(null);
  const [detailGroup, setDetailGroup] = React.useState<AdminGroupDTO | null>(null);

  const groupsQuery = useAdminGroups(filter);
  const groups = groupsQuery.data?.data ?? [];
  const total = groupsQuery.data?.total ?? 0;
  const page = groupsQuery.data?.page ?? filter.page ?? 1;
  const pageSize = groupsQuery.data?.limit ?? filter.limit ?? 8;

  const { banMutation, unbanMutation, updateStatusLocally } = useGroupModeration();

  const handleFilterChange = (changes: Partial<AdminGroupQuery>) => {
    setFilter((prev) => ({ ...prev, page: 1, ...changes }));
  };

  const handleReset = () => {
    setFilter({ page: 1, limit: filter.limit });
  };

  React.useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(filter.page ?? 1));
    params.set('limit', String(filter.limit ?? 8));
    if (filter.name) params.set('name', filter.name);
    if (filter.status) params.set('status', filter.status);
    if (filter.memberRange) params.set('memberRange', filter.memberRange);
    const next = params.toString();
    if (next !== paramsString) router.replace(`?${next}`);
  }, [filter, router, paramsString]);

  React.useEffect(() => {
    const next = parseFilterFromParams(paramsString);
    setFilter((prev) => {
      const same =
        prev.page === next.page &&
        prev.limit === next.limit &&
        prev.name === next.name &&
        prev.status === next.status &&
        prev.memberRange === next.memberRange;
      return same ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString]);

  const handleBan = (group: AdminGroupDTO) => {
    updateStatusLocally(group.id, GroupStatus.BANNED);
    banMutation.mutate(group.id);
  };

  const handleUnban = (group: AdminGroupDTO) => {
    updateStatusLocally(group.id, GroupStatus.ACTIVE);
    unbanMutation.mutate(group.id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-600">Quản lý nhóm</h1>
          <p className="text-sm text-slate-500">
            Theo dõi sức khỏe cộng đồng, báo cáo vi phạm và trạng thái duyệt nhóm.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <GroupsToolbar filter={filter} onFilterChange={handleFilterChange} onReset={handleReset} loading={groupsQuery.isLoading} />
        <div className="mt-4">
          <GroupsTable
            groups={groups}
            loading={groupsQuery.isLoading || groupsQuery.isFetching}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={(nextPage) => setFilter((prev) => ({ ...prev, page: nextPage }))}
            onViewReports={(group) => setSelectedGroup(group)}
            onViewDetail={(group) => setDetailGroup(group)}
            onBanGroup={handleBan}
            onUnbanGroup={handleUnban}
          />
        </div>
      </div>

      <AdminActivityLog
        title="Log hoạt động nhóm"
        description="Theo dõi thao tác quản trị liên quan đến nhóm."
        filter={{ logType: LogType.GROUP_LOG, limit: 10 }}
        emptyMessage="Chưa có hoạt động nào liên quan đến nhóm."
      />

      <GroupReportsDrawer
        groupId={selectedGroup?.id}
        groupName={selectedGroup?.name}
        open={!!selectedGroup}
        onOpenChange={(open) => {
          if (!open) setSelectedGroup(null);
        }}
      />

      <GroupDetailDialog
        group={detailGroup}
        open={!!detailGroup}
        onOpenChange={(open) => {
          if (!open) setDetailGroup(null);
        }}
      />
    </div>
  );
}
