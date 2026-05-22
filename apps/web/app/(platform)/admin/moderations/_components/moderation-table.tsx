'use client';

import * as React from 'react';
import clsx from 'clsx';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, RotateCcw } from 'lucide-react';

import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { ContentModerationDTO } from '@/models/moderation/moderationDTO';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Loader } from '@/components/loader-componnet';

import { AdminPagination } from '../../_components/pagination';
import { DataTableToolbar } from '../../_components/data-table-toolbar';
import { ConfirmActionDialog } from '../../_components/confirm-action-dialog';

import { ModerationDecisionBadge } from './moderation-decision-badge';
import { ModerationSeverityBadge } from './moderation-severity-badge';

import { formatDateVN } from '@/utils/user.utils';

type Props = {
  rows: ContentModerationDTO[];
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  restoring?: boolean;
  onPageChange: (page: number) => void;
  onViewDetail: (moderationId: string) => void;
  onRestore: (row: ContentModerationDTO) => void;
};

const targetLabels: Record<string, string> = {
  POST: 'Bài viết',
  SHARE: 'Chia sẻ',
  COMMENT: 'Bình luận',
};

const formatConfidence = (value: number) => {
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
};

export function ModerationTable({
  rows,
  page,
  pageSize,
  total,
  loading,
  restoring,
  onPageChange,
  onViewDetail,
  onRestore,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [confirmRow, setConfirmRow] =
    React.useState<ContentModerationDTO | null>(null);

  React.useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  const columns = React.useMemo<ColumnDef<ContentModerationDTO>[]>(
    () => [
      {
        id: 'preview',
        header: 'Nội dung',
        accessorFn: (row) => row.targetPreview?.content ?? '',
        enableSorting: false,

        cell: ({ row }) => {
          const preview = row.original.targetPreview;
          const hasImage = !!preview?.imageUrl?.url;

          return (
            <div className="flex max-w-[360px] items-center gap-3">
              {hasImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview?.imageUrl?.url}
                  alt="preview"
                  className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover"
                />
              )}

              <p
                className="truncate text-sm text-slate-700"
                title={preview?.content || ''}
              >
                {preview?.content || 'Không có nội dung xem trước'}
              </p>
            </div>
          );
        },
      },

      {
        id: 'targetType',
        header: 'Loại',
        accessorFn: (row) => row.targetType,

        cell: ({ row }) => (
          <Badge className="border border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-50">
            {targetLabels[row.original.targetType] ?? row.original.targetType}
          </Badge>
        ),
      },

      {
        id: 'severity',
        header: 'Mức độ',
        accessorFn: (row) => row.maxSeverity,

        cell: ({ row }) => (
          <ModerationSeverityBadge severity={row.original.maxSeverity} />
        ),
      },

      {
        id: 'decision',
        header: 'Kết quả',
        accessorFn: (row) => row.finalDecision ?? '',

        cell: ({ row }) => (
          <ModerationDecisionBadge decision={row.original.finalDecision} />
        ),
      },

      {
        id: 'confidence',
        header: 'Độ tin cậy',
        accessorFn: (row) => row.confidence,

        cell: ({ row }) => (
          <div className="text-center text-sm font-semibold text-slate-700">
            {formatConfidence(row.original.confidence)}
          </div>
        ),
      },

      {
        id: 'createdAt',
        header: 'Ngày tạo',
        accessorFn: (row) => row.createdAt,

        cell: ({ row }) => (
          <div className="text-center text-sm text-slate-600">
            {formatDateVN(row.original.createdAt)}
          </div>
        ),
      },

      {
        id: 'actions',
        header: 'Thao tác',
        enableSorting: false,
        enableHiding: false,

        cell: ({ row }) => (
          <div className="text-center">
            <TooltipProvider delayDuration={150}>
              <div className="inline-flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 rounded-lg border border-sky-100 bg-sky-50 text-sky-700 shadow-sm hover:bg-sky-100"
                      onClick={() => onViewDetail(row.original.id)}
                      aria-label="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent>Xem chi tiết</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm hover:bg-emerald-100"
                      onClick={() => setConfirmRow(row.original)}
                      disabled={!row.original.isViolation || restoring}
                      aria-label="Khôi phục nội dung"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent>Khôi phục nội dung</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    [onViewDetail, restoring],
  );

  const table = useReactTable({
    data: rows,
    columns,

    state: {
      sorting,
      columnVisibility,
    },

    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <DataTableToolbar table={table} />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table className="min-w-[980px]">
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-slate-50">
                {headerGroup.headers.map((header) => {
                  const isActions = header.column.id === 'actions';

                  return (
                    <TableHead
                      key={header.id}
                      className={clsx(
                        'h-11 text-xs font-semibold uppercase tracking-wide text-slate-600',
                        isActions && 'w-36 text-center',
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 text-xs font-semibold text-slate-700 hover:bg-transparent"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}

                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="ml-2 h-3.5 w-3.5" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="ml-2 h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
                          )}
                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {!loading &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  Không có dữ liệu kiểm duyệt
                </TableCell>
              </TableRow>
            ) : null}

            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader />
                    <span className="text-sm">Đang tải dữ liệu...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        page={page}
        pageSize={pageSize}
        total={total}
        entityLabel="bản ghi"
        onPageChange={onPageChange}
      />

      <ConfirmActionDialog
        open={!!confirmRow}
        onOpenChange={(open) => {
          if (!open) setConfirmRow(null);
        }}
        title="Khôi phục nội dung này?"
        description="Nội dung sẽ được phục hồi và hiển thị lại sau khi xác nhận."
        confirmText="Khôi phục"
        onConfirm={() => {
          if (!confirmRow) return;

          onRestore(confirmRow);
          setConfirmRow(null);
        }}
      />
    </>
  );
}
