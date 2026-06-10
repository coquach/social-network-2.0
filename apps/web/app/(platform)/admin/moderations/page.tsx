'use client';

import * as React from 'react';
import { Loader2, RefreshCw, ShieldAlert, MessagesSquare } from 'lucide-react';
import { toast } from 'sonner';

import { TargetType } from '@repo/shared';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAdminAppeals,
  useAdminModerationRecords,
  useRestoreModeratedContent,
  useReviewAppeal,
} from '@/hooks/use-admin-moderation';
import {
  AdminAppealQuery,
  AdminModerationQuery,
} from '@/lib/actions/admin/admin-moderation';
import {
  AppealStatus,
  FinalDecision,
  Severity,
} from '@/models/moderation/enums/moderationEnum';
import { ModerationAppealResponseDTO } from '@/models/moderation/moderationDTO';
import { AppealsTable } from './_components/appeals-table';
import { ModerationDetailDrawer } from './_components';
import { ModerationTable } from './_components/moderation-table';
import {
  ModerationAppealsToolbarValue,
  ModerationToolbar,
  ModerationViolationToolbarValue,
} from './_components/moderation-toolbar';
import { AdminActivityLog } from '../_components/admin-activity-log';
import { LogType } from '@/models/log/logDTO';

const DEFAULT_LIMIT = 10;

type TabKey = 'violations' | 'appeals';

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getDefaultViolationDateRange = () => {
  const toDate = new Date();
  const fromDate = new Date();

  fromDate.setDate(toDate.getDate() - 7);

  return {
    fromDate: formatDateInput(fromDate),
    toDate: formatDateInput(toDate),
  };
};

export default function AdminModerationsPage() {
  const [tab, setTab] = React.useState<TabKey>('violations');
  const [violationsPage, setViolationsPage] = React.useState(1);
  const [appealsPage, setAppealsPage] = React.useState(1);
  const [violationsSearch, setViolationsSearch] = React.useState('');
  const [appealsSearch, setAppealsSearch] = React.useState('');
  const [moderationId, setModerationId] = React.useState<string | null>(null);
  const [selectedAppeal, setSelectedAppeal] =
    React.useState<ModerationAppealResponseDTO | null>(null);
  const defaultViolationDateRange = React.useMemo(
    () => getDefaultViolationDateRange(),
    [],
  );
  const [violationsFilter, setViolationsFilter] = React.useState<{
    targetType: TargetType | 'all';
    maxSeverity: Severity | 'all';
    finalDecision: FinalDecision | 'all';
    fromDate: string;
    toDate: string;
  }>(() => ({
    targetType: 'all',
    maxSeverity: 'all',
    finalDecision: 'all',
    ...getDefaultViolationDateRange(),
  }));
  const [appealsFilter, setAppealsFilter] = React.useState<{
    appealStatus: AppealStatus | 'all';
  }>({
    appealStatus: 'all',
  });

  const moderationQueryFilters = React.useMemo<AdminModerationQuery>(
    () => ({
      page: violationsPage,
      limit: DEFAULT_LIMIT,
      targetType:
        violationsFilter.targetType === 'all'
          ? undefined
          : violationsFilter.targetType,
      maxSeverity:
        violationsFilter.maxSeverity === 'all'
          ? undefined
          : violationsFilter.maxSeverity,
      finalDecision:
        violationsFilter.finalDecision === 'all'
          ? undefined
          : violationsFilter.finalDecision,
      fromDate: violationsFilter.fromDate || undefined,
      toDate: violationsFilter.toDate || undefined,
    }),
    [violationsPage, violationsFilter],
  );

  const appealsQueryFilters = React.useMemo<AdminAppealQuery>(
    () => ({
      page: appealsPage,
      limit: DEFAULT_LIMIT,
      status:
        appealsFilter.appealStatus === 'all'
          ? undefined
          : appealsFilter.appealStatus,
    }),
    [appealsPage, appealsFilter],
  );

  const moderationQuery = useAdminModerationRecords(moderationQueryFilters);
  const appealsQuery = useAdminAppeals(appealsQueryFilters);
  const reviewAppealMutation = useReviewAppeal();
  const restoreMutation = useRestoreModeratedContent();

  const moderationRows = React.useMemo(() => moderationQuery.data?.data ?? [], [moderationQuery.data?.data]);
  const appealRows = React.useMemo(() => appealsQuery.data?.data ?? [], [appealsQuery.data?.data]);

  const filteredModerationRows = React.useMemo(() => {
    const keyword = violationsSearch.trim().toLowerCase();

    return moderationRows.filter((row) => {
      if (!keyword) return true;

      return [
        row.id,
        row.userId,
        row.targetId,
        row.targetType,
        row.displayMessage,
        row.targetPreview?.content,
      ]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(keyword));
    });
  }, [moderationRows, violationsSearch]);

  const filteredAppealRows = React.useMemo(() => {
    const keyword = appealsSearch.trim().toLowerCase();

    return appealRows.filter((row) => {
      if (!keyword) return true;

      return [row.id, row.moderationId, row.userId, row.reason, row.status]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(keyword));
    });
  }, [appealRows, appealsSearch]);

  const handleRefresh = async () => {
    await Promise.all([moderationQuery.refetch(), appealsQuery.refetch()]);
    toast.success('Đã làm mới dữ liệu kiểm duyệt');
  };

  const handleResetViolations = () => {
    setViolationsSearch('');
    setViolationsFilter({
      targetType: 'all',
      maxSeverity: 'all',
      finalDecision: 'all',
      ...defaultViolationDateRange,
    });
  };

  const handleResetAppeals = () => {
    setAppealsSearch('');
    setAppealsFilter({ appealStatus: 'all' });
  };

  const handleRestoreContent = async () => {
    if (!moderationId) return;

    await restoreMutation.mutateAsync({
      moderationId,
      status: AppealStatus.APPROVED,
    });
  };

  const handleApproveAppeal = async (reviewNote?: string) => {
    if (!selectedAppeal) return;

    await reviewAppealMutation.mutateAsync({
      appealId: selectedAppeal.id,
      body: {
        status: AppealStatus.APPROVED,
        reviewNote: reviewNote?.trim() || undefined,
      },
    });

    setSelectedAppeal(null);
    setModerationId(null);
  };

  const handleRejectAppeal = async (reviewNote?: string) => {
    if (!selectedAppeal) return;

    await reviewAppealMutation.mutateAsync({
      appealId: selectedAppeal.id,
      body: {
        status: AppealStatus.REJECTED,
        reviewNote: reviewNote?.trim() || undefined,
      },
    });

    setSelectedAppeal(null);
    setModerationId(null);
  };

  const violationToolbarValue: ModerationViolationToolbarValue = {
    search: violationsSearch,
    targetType: violationsFilter.targetType,
    maxSeverity: violationsFilter.maxSeverity,
    finalDecision: violationsFilter.finalDecision,
    fromDate: violationsFilter.fromDate,
    toDate: violationsFilter.toDate,
  };

  const appealToolbarValue: ModerationAppealsToolbarValue = {
    search: appealsSearch,
    appealStatus: appealsFilter.appealStatus,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-600">
            Kiểm duyệt nội dung
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý nội dung vi phạm và kháng nghị.
          </p>
        </div>

        <Button
          variant="outline"
          className="border-sky-200 text-slate-700 hover:bg-sky-50"
          onClick={handleRefresh}
        >
          {moderationQuery.isFetching || appealsQuery.isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Làm mới
        </Button>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
          <TabsList className="mb-4 inline-flex h-auto w-fit max-w-full items-center gap-1.5 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <TabsTrigger
              value="violations"
              className="group flex h-12 min-w-44 items-center justify-between rounded-[14px] border border-transparent bg-transparent px-5 py-3 text-sm font-medium text-slate-500 transition-all duration-200 ease-out hover:bg-white hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-sky-200 data-[state=active]:-translate-y-px data-[state=active]:border-sky-200 data-[state=active]:bg-[#E6F4FF] data-[state=active]:font-semibold data-[state=active]:text-sky-800 data-[state=active]:shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
            >
              <span className="flex items-center gap-2 font-semibold text-inherit">
                <ShieldAlert className="h-4 w-4 text-inherit transition-all duration-200 group-data-[state=active]:scale-105" />
                Vi phạm
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 transition-all duration-200 group-data-[state=active]:bg-sky-600 group-data-[state=active]:text-white">
                {moderationQuery.data?.total ?? 0}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="appeals"
              className="group flex h-12 min-w-44 items-center justify-between rounded-[14px] border border-transparent bg-transparent px-5 py-3 text-sm font-medium text-slate-500 transition-all duration-200 ease-out hover:bg-white hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-sky-200 data-[state=active]:-translate-y-px data-[state=active]:border-sky-200 data-[state=active]:bg-[#E6F4FF] data-[state=active]:font-semibold data-[state=active]:text-sky-800 data-[state=active]:shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
            >
              <span className="flex items-center gap-2 font-semibold text-inherit">
                <MessagesSquare className="h-4 w-4 text-inherit transition-all duration-200 group-data-[state=active]:scale-105" />
                Kháng nghị
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 transition-all duration-200 group-data-[state=active]:bg-sky-600 group-data-[state=active]:text-white">
                {appealsQuery.data?.total ?? 0}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="violations" className="space-y-4">
            <ModerationToolbar
              variant="violations"
              value={violationToolbarValue}
              onChange={(next) => {
                setViolationsSearch(next.search);
                setViolationsFilter({
                  targetType: next.targetType,
                  maxSeverity: next.maxSeverity,
                  finalDecision: next.finalDecision,
                  fromDate: next.fromDate,
                  toDate: next.toDate,
                });
                setViolationsPage(1);
              }}
              onReset={handleResetViolations}
              loading={moderationQuery.isLoading}
            />

            <ModerationTable
              rows={filteredModerationRows}
              page={violationsPage}
              pageSize={DEFAULT_LIMIT}
              total={moderationQuery.data?.total ?? 0}
              loading={moderationQuery.isLoading || moderationQuery.isFetching}
              restoring={restoreMutation.isPending}
              onPageChange={setViolationsPage}
              onViewDetail={(nextModerationId) => {
                setModerationId(nextModerationId);
                setSelectedAppeal(null);
              }}
              onRestore={(row) => {
                void restoreMutation.mutateAsync({
                  moderationId: row.id,
                  status: AppealStatus.APPROVED,
                });
              }}
            />
          </TabsContent>

          <TabsContent value="appeals" className="space-y-4">
            <ModerationToolbar
              variant="appeals"
              value={appealToolbarValue}
              onChange={(next) => {
                setAppealsSearch(next.search);
                setAppealsFilter({ appealStatus: next.appealStatus });
                setAppealsPage(1);
              }}
              onReset={handleResetAppeals}
              loading={appealsQuery.isLoading}
            />

            <AppealsTable
              rows={filteredAppealRows}
              page={appealsPage}
              pageSize={DEFAULT_LIMIT}
              total={appealsQuery.data?.total ?? 0}
              loading={appealsQuery.isLoading || appealsQuery.isFetching}
              reviewLoading={reviewAppealMutation.isPending}
              onPageChange={setAppealsPage}
              onReview={(row) => {
                setModerationId(row.moderationId);
                setSelectedAppeal(row);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ModerationDetailDrawer
        moderationId={moderationId}
        appeal={selectedAppeal}
        open={!!moderationId}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setModerationId(null);
            setSelectedAppeal(null);
          }
        }}
        onApproveAppeal={handleApproveAppeal}
        onRejectAppeal={handleRejectAppeal}
        onRestoreContent={handleRestoreContent}
        reviewLoading={reviewAppealMutation.isPending}
        restoreLoading={restoreMutation.isPending}
      />

      <AdminActivityLog
        title="Log hoạt động bài viết"
        description="Theo dõi thao tác quản trị liên quan đến nội dung bài viết"
        filter={{ logType: LogType.MODERATE_LOG, limit: 10 }}
        emptyMessage="Chưa có hoạt động nào liên quan đến bài viết"
      />
    </div>
  );
}
