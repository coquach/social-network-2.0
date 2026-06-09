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

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function parseFilterFromParams(paramsStr: string): ContentEntryFilter {
  const sp = new URLSearchParams(paramsStr);
  const page = Number(sp.get('page') ?? String(DEFAULT_PAGE));
  const limit = Number(sp.get('limit') ?? String(DEFAULT_LIMIT));
  const targetType =
    (sp.get('targetType') as TargetType | null) ?? TargetType.POST;
  const status = (sp.get('status') as ContentStatus | null) ?? undefined;
  const query = sp.get('query') || undefined;
  const createAt = sp.get('createAt');

  return {
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_PAGE,
    limit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT,
    targetType,
    status,
    query,
    createAt: createAt ? new Date(createAt) : undefined,
  };
}

function createQueryString(filter: ContentEntryFilter) {
  const params = new URLSearchParams();
  params.set('page', String(filter.page ?? DEFAULT_PAGE));
  params.set('limit', String(filter.limit ?? DEFAULT_LIMIT));
  if (filter.targetType) params.set('targetType', filter.targetType);
  if (filter.status) params.set('status', filter.status);
  if (filter.query) params.set('query', filter.query);
  if (filter.createAt) {
    params.set('createAt', new Date(filter.createAt).toISOString());
  }
  return params.toString();
}

export default function AdminPostsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramsString = searchParams?.toString() ?? '';
  const filter = React.useMemo(
    () => parseFilterFromParams(paramsString),
    [paramsString],
  );

  const { data, isLoading, isFetching } = useContentEntries(filter);

  const replaceFilter = React.useCallback(
    (nextFilter: ContentEntryFilter) => {
      const next = createQueryString(nextFilter);
      if (next !== paramsString) router.replace(`?${next}`);
    },
    [paramsString, router],
  );

  const handleFilterChange = React.useCallback(
    (changes: Partial<ContentEntryFilter>) => {
      replaceFilter({ ...filter, page: DEFAULT_PAGE, ...changes });
    },
    [filter, replaceFilter],
  );

  const handleReset = React.useCallback(() => {
    replaceFilter({
      page: DEFAULT_PAGE,
      limit: filter.limit ?? DEFAULT_LIMIT,
      targetType: TargetType.POST,
    });
  }, [filter.limit, replaceFilter]);

  const handlePageChange = React.useCallback(
    (page: number) => {
      replaceFilter({ ...filter, page });
    },
    [filter, replaceFilter],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-600">
            Quản lý nội dung
          </h1>
          <p className="text-sm text-slate-500">
            Theo dõi báo cáo bài viết, mức độ nghiêm trọng và log xử lý
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <ContentToolbar
          filter={filter}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
        <div className="mt-4">
          <ContentTable
            entries={data?.data ?? []}
            page={filter.page ?? 1}
            pageSize={filter.limit ?? 10}
            total={data?.total ?? 0}
            loading={isLoading || isFetching}
            onPageChange={handlePageChange}
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
