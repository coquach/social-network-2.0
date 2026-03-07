'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ContentToolbar } from './_components/content-toolbar';
import { ContentTable } from './_components/content-table';
import { useContentEntries } from '@/hooks/use-content-entries';
import { ContentEntryFilter } from '@/lib/actions/admin/content-entry-action';
import { AdminActivityLog } from '../_components/admin-activity-log';
import { LogType } from '@/models/log/logDTO';
import { TargetType } from '@/models/social/enums/social.enum';
import { ContentStatus } from '@/models/social/post/contentEntryDTO';

export default function AdminPostsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramsString = searchParams.toString();

  const parseFilterFromParams = React.useCallback(
    (paramsStr: string): ContentEntryFilter => {
      const sp = new URLSearchParams(paramsStr);
      const page = Number(sp.get('page') ?? '1');
      const limit = Number(sp.get('limit') ?? '10');
      const targetType = (sp.get('targetType') as TargetType | null) ?? TargetType.POST;
      const status = (sp.get('status') as ContentStatus | null) ?? undefined;
      const query = sp.get('query') || undefined;
      const createAt = sp.get('createAt');
      return {
        page: Number.isFinite(page) && page > 0 ? page : 1,
        limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
        targetType,
        status,
        query,
        createAt: createAt ? new Date(createAt) : undefined,
      };
    },
    []
  );

  const [filter, setFilter] = React.useState<ContentEntryFilter>(() =>
    parseFilterFromParams(paramsString)
  );

  const { data, isLoading, isFetching } = useContentEntries(filter);

  const handleFilterChange = (changes: Partial<ContentEntryFilter>) => {
    setFilter((prev) => ({ ...prev, page: 1, ...changes }));
  };

  const handleReset = () => {
    setFilter({ page: 1, limit: filter.limit ?? 10 });
  };

  React.useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(filter.page ?? 1));
    params.set('limit', String(filter.limit ?? 10));
    if (filter.targetType) params.set('targetType', filter.targetType);
    if (filter.status) params.set('status', filter.status);
    if (filter.query) params.set('query', filter.query);
    if (filter.createAt) params.set('createAt', new Date(filter.createAt).toISOString());
    const next = params.toString();
    if (next !== paramsString) router.replace(`?${next}`);
  }, [filter, router, paramsString]);

  React.useEffect(() => {
    const next = parseFilterFromParams(paramsString);
    setFilter((prev) => {
      const same =
        prev.page === next.page &&
        prev.limit === next.limit &&
        prev.query === next.query &&
        prev.targetType === next.targetType &&
        prev.status === next.status &&
        ((prev.createAt && next.createAt && prev.createAt.toString() === next.createAt.toString()) ||
          (!prev.createAt && !next.createAt));
      return same ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-600">Quản lý nội dung</h1>
          <p className="text-sm text-slate-500">
            Theo dõi báo cáo bài viết, mức độ nghiêm trọng và log xử lý
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <ContentToolbar filter={filter} onFilterChange={handleFilterChange} onReset={handleReset} />
        <div className="mt-4">
          <ContentTable
            entries={data?.data ?? []}
            page={filter.page ?? 1}
            pageSize={filter.limit ?? 10}
            total={data?.total ?? 0}
            loading={isLoading || isFetching}
            onPageChange={(page) => setFilter((prev) => ({ ...prev, page }))}
          />
        </div>
      </div>

      <AdminActivityLog
        title="Log hoạt động bài viết"
        description="Theo dõi thao tác quản trị liên quan đến nội dung bài viết"
        filter={{ logType: LogType.POST_LOG, limit: 10 }}
        emptyMessage="Chưa có hoạt động nào liên quan đến bài viết"
      />
    </div>
  );
}
