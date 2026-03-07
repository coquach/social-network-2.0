'use client';

import * as React from 'react';
import clsx from 'clsx';

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
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  ListChecks,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { ContentEntryDTO, ContentStatus } from '@/models/social/post/contentEntryDTO';
import { TargetType } from '@/models/social/enums/social.enum';
import { formatDateVN } from '@/utils/user.utils';
import { AdminPagination } from '../../_components/pagination';
import { ContentDetailDialog } from './content-detail-dialog';
import { ContentReportsDialog } from './content-reports-dialog';
import { Loader } from '@/components/loader-componnet';
import { DataTableToolbar } from '../../_components/data-table-toolbar';

type ContentTableProps = {
  entries: ContentEntryDTO[];
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

const targetLabels: Record<TargetType, string> = {
  [TargetType.POST]: 'Bài viết',
  [TargetType.SHARE]: 'Chia sẻ',
  [TargetType.COMMENT]: 'Bình luận',
};

const targetClassName: Record<TargetType, string> = {
  [TargetType.POST]: 'bg-sky-50 text-sky-700 hover:bg-sky-50',
  [TargetType.SHARE]: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-50',
  [TargetType.COMMENT]: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
};

const statusLabels: Record<ContentStatus, string> = {
  [ContentStatus.ACTIVE]: 'Đang hiển thị',
  [ContentStatus.VIOLATED]: 'Vi phạm',
};

const statusClassName: Record<ContentStatus, string> = {
  [ContentStatus.ACTIVE]: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
  [ContentStatus.VIOLATED]: 'bg-rose-50 text-rose-700 hover:bg-rose-50',
};

const formatContent = (content: string) => {
  if (!content) return 'Không có nội dung';
  if (content.length <= 120) return content;
  return `${content.slice(0, 120)}...`;
};

export function ContentTable({
  entries,
  page,
  pageSize,
  total,
  loading,
  onPageChange,
}: ContentTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [selected, setSelected] = React.useState<ContentEntryDTO | null>(null);
  const [reportEntry, setReportEntry] = React.useState<ContentEntryDTO | null>(
    null
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  React.useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  const columns = React.useMemo<ColumnDef<ContentEntryDTO>[]>(
    () => [
      {
        id: 'id',
        header: 'ID',
        enableSorting: false,
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <div className="max-w-[120px] truncate font-medium text-slate-700">
            {row.original.id}
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Loại',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Badge className={targetClassName[row.original.type]}>
              {targetLabels[row.original.type]}
            </Badge>
          </div>
        ),
      },
      {
        id: 'content',
        header: 'Nội dung',
        accessorFn: (row) => row.content ?? '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="max-w-[360px] text-slate-800">
            <p className="line-clamp-2 whitespace-pre-line text-sm leading-relaxed">
              {formatContent(row.original.content)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-center">
            <Badge className={statusClassName[row.original.status]}>
              {statusLabels[row.original.status]}
            </Badge>
          </div>
        ),
      },
      {
        id: 'reports',
        header: 'Báo cáo',
        accessorFn: (row) => row.reportPendingCount ?? 0,
        cell: ({ row }) => (
          <div className="text-center">
            <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50">
              {row.original.reportPendingCount ?? 0} lần
            </Badge>
          </div>
        ),
      },
      {
        id: 'createdAt',
        header: 'Ngày tạo',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => (
          <div className="text-slate-600 text-center">
            {formatDateVN(row.original.createdAt)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Hành động',
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-center">
            <TooltipProvider delayDuration={150}>
              <div className="inline-flex items-center justify-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100 hover:bg-sky-100"
                      onClick={() => setSelected(row.original)}
                      aria-label="Xem chi ti §¨t"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Xem chi tiết
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-100 hover:bg-amber-100"
                      onClick={() => setReportEntry(row.original)}
                      aria-label="Xem báo cáo"
                    >
                      <ListChecks className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Xem báo cáo
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: entries,
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
      <div className="overflow-x-auto rounded-xl border border-sky-100">
        <Table className="min-w-[1080px]">
          <TableHeader className="bg-sky-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isIdColumn = header.column.id === 'id';
                  const isActions = header.column.id === 'actions';
                  return (
                    <TableHead
                      key={header.id}
                      className={clsx(
                        isIdColumn && 'w-[120px] text-center',
                        isActions && 'w-56 text-center'
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="ml-2 h-3.5 w-3.5" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="ml-2 h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                          )}
                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
                <TableRow key={row.id} className="hover:bg-sky-50/60">
                  {row.getVisibleCells().map((cell) => {
                    const isIdColumn = cell.column.id === 'id';
                    const isActions = cell.column.id === 'actions';
                    return (
                      <TableCell
                        key={cell.id}
                        className={clsx(
                          isIdColumn && 'w-[120px] text-center',
                          isActions && 'text-center'
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

            {!loading && table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-slate-500"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : null}

            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-slate-500"
                >
                  <Loader />
                  Đang tải dữ liệu...
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
        entityLabel="nội dung"
        onPageChange={onPageChange}
      />

      <ContentDetailDialog
        entry={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />
      <ContentReportsDialog
        entryId={reportEntry?.id}
        targetType={reportEntry?.type}
        open={!!reportEntry}
        onOpenChange={(open) => {
          if (!open) setReportEntry(null);
        }}
      />
    </>
  );
}
