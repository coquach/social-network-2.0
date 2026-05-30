'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export type ModerationHistoryPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function ModerationHistoryPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: ModerationHistoryPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const windowSize = 5;
  const half = Math.floor(windowSize / 2);

  let start = clamp(page - half, 1, Math.max(1, totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const pages = Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  );

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const go = (nextPage: number) => {
    const next = clamp(nextPage, 1, totalPages);

    if (next !== page) {
      onPageChange(next);
    }
  };

  const pageButtonClassName =
    'h-9 rounded-xl border border-sky-200 px-3 text-sm transition-colors hover:bg-sky-50';
  const inactiveButtonClassName =
    'bg-white/90 text-slate-700 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-900';
  const activeButtonClassName =
    'border-sky-500 bg-sky-500 text-white shadow-sm hover:bg-sky-500 dark:border-sky-400 dark:bg-sky-400 dark:text-slate-950';
  const navButtonClassName =
    'gap-1 px-2.5 border border-sky-200 bg-white/90 text-slate-700 hover:bg-sky-50 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-900';

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Hiển thị{' '}
        <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
          {from}
        </span>
        –
        <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
          {to}
        </span>{' '}
        trên{' '}
        <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
          {total}
        </span>{' '}
        bản ghi
      </p>

      <Pagination className="w-full lg:w-auto lg:justify-end">
        <PaginationContent className="flex w-full flex-wrap items-center justify-center gap-1.5 lg:w-auto lg:justify-end">
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-disabled={!canPrev}
              size="default"
              className={cn(
                navButtonClassName,
                canPrev ? '' : 'pointer-events-none opacity-50',
              )}
              onClick={(event) => {
                event.preventDefault();

                if (canPrev) {
                  go(page - 1);
                }
              }}
            >
              <ChevronLeftIcon className="size-4" />
              <span className="hidden sm:block">Trước</span>
            </PaginationLink>
          </PaginationItem>

          {start > 1 ? (
            <>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  size="default"
                  className={cn(pageButtonClassName, inactiveButtonClassName)}
                  onClick={(event) => {
                    event.preventDefault();
                    go(1);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
          ) : null}

          {pages.map((p) => {
            const active = p === page;

            return (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={active}
                  size="default"
                  className={cn(
                    pageButtonClassName,
                    active ? activeButtonClassName : inactiveButtonClassName,
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    go(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {end < totalPages ? (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  size="default"
                  className={cn(pageButtonClassName, inactiveButtonClassName)}
                  onClick={(event) => {
                    event.preventDefault();
                    go(totalPages);
                  }}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          ) : null}

          <PaginationItem>
            <PaginationLink
              href="#"
              aria-disabled={!canNext}
              size="default"
              className={cn(
                navButtonClassName,
                canNext ? '' : 'pointer-events-none opacity-50',
              )}
              onClick={(event) => {
                event.preventDefault();

                if (canNext) {
                  go(page + 1);
                }
              }}
            >
              <span className="hidden sm:block">Sau</span>
              <ChevronRightIcon className="size-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
