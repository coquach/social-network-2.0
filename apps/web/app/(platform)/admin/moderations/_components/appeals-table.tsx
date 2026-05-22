'use client';

import * as React from 'react';
import clsx from 'clsx';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from 'lucide-react';

import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { ModerationAppealResponseDTO } from '@/models/moderation/moderationDTO';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader } from '@/components/loader-componnet';
import { AdminPagination } from '../../_components/pagination';
import { DataTableToolbar } from '../../_components/data-table-toolbar';
import { ModerationStatusBadge } from './moderation-status-badge';
import { formatDateVN } from '@/utils/user.utils';

type Props = {
  rows: ModerationAppealResponseDTO[];
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  reviewLoading?: boolean;
  onPageChange: (page: number) => void;
  onReview: (row: ModerationAppealResponseDTO) => void;
};

export function AppealsTable({
  rows,
  page,
  pageSize,
  total,
  loading,
  reviewLoading,
  onPageChange,
  onReview,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  React.useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  const columns = React.useMemo<ColumnDef<ModerationAppealResponseDTO>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Appeal ID',
        cell: ({ row }) => (
          <div className="max-w-55 truncate text-sm font-medium text-slate-700">
            {row.original.id}
          </div>
        ),
      },
      {
        accessorKey: 'moderationId',
        header: 'Moderation ID',
        cell: ({ row }) => (
          <div className="max-w-55 truncate text-sm text-slate-700">
            {row.original.moderationId}
          </div>
        ),
      },
      {
        accessorKey: 'userId',
        header: 'User ID',
        cell: ({ row }) => (
          <div className="max-w-55 truncate text-sm text-slate-700">
            {row.original.userId}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <ModerationStatusBadge status={row.original.status} />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => (
          <div className="text-sm text-slate-600">
            {formatDateVN(row.original.createdAt)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            variant="outline"
            className="border-sky-200 text-sky-700 hover:bg-sky-50"
            onClick={() => onReview(row.original)}
            disabled={reviewLoading}
          >
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </Button>
        ),
      },
    ],
    [onReview, reviewLoading],
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
      <div className="overflow-x-auto rounded-xl border border-sky-100">
        <Table className="min-w-235">
          <TableHeader className="bg-sky-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={clsx(header.column.id === 'actions' && 'w-44')}
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
                          header.getContext(),
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
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {!loading &&
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-sky-50/60">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  colSpan={6}
                  className="py-10 text-center text-slate-500"
                >
                  Không có kháng nghị
                </TableCell>
              </TableRow>
            ) : null}

            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
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
        entityLabel="kháng nghị"
        onPageChange={onPageChange}
      />
    </>
  );
}
