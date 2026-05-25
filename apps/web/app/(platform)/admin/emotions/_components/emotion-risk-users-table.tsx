'use client';

import * as React from 'react';
import { Copy, MoreHorizontal, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Avatar } from '@/components/avatar';
import { AdminPagination } from '../../_components/pagination';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RiskUserDTO } from '@/models/emotion/adminEmotionDTO';

import { EmotionRiskLevelBadge } from './emotion-risk-level-badge';

type Props = {
  rows: RiskUserDTO[];
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

const statusMeta = {
  monitored: {
    label: 'Đang theo dõi',
    className:
      'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
  stable: {
    label: 'Ổn định',
    className:
      'border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
} as const;

const formatRiskScore = (score: number) => {
  const normalized = score <= 1 ? score * 100 : score;

  return `${normalized.toFixed(normalized >= 10 ? 0 : 1)}%`;
};

const normalizeRiskScore = (score: number) =>
  score <= 1 ? score * 100 : score;

function resolveStatus(row: RiskUserDTO) {
  const riskLevel = row.riskItem.riskLevel.toLowerCase();

  if (['warning', 'high', 'critical'].includes(riskLevel)) {
    return statusMeta.monitored;
  }

  return statusMeta.stable;
}

const getFullName = (user: RiskUserDTO['user']) =>
  `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.id;

export function EmotionRiskUsersTable({
  rows,
  page,
  pageSize,
  total,
  loading,
  onPageChange,
}: Props) {
  const columns = React.useMemo<ColumnDef<RiskUserDTO>[]>(
    () => [
      {
        id: 'user',
        header: 'Người dùng',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar.Root
              userId={row.original.user.id}
              size="medium"
              hasBorder
              isClickable={false}
              className="shrink-0"
            >
              <Avatar.Image />
            </Avatar.Root>

            <div className="min-w-0 space-y-1">
              <div className="truncate font-medium text-slate-900">
                {getFullName(row.original.user)}
              </div>
              <div className="text-xs text-slate-400">
                {row.original.user.id}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'riskItem.riskLevel',
        header: 'Mức rủi ro',
        cell: ({ row }) => (
          <EmotionRiskLevelBadge level={row.original.riskItem.riskLevel} />
        ),
      },
      {
        accessorKey: 'riskItem.riskScore',
        header: 'Điểm rủi ro',
        cell: ({ row }) => {
          const score = normalizeRiskScore(row.original.riskItem.riskScore);

          return (
            <div className="min-w-36 space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-800">
                  {formatRiskScore(row.original.riskItem.riskScore)}
                </span>
                <span className="text-xs text-slate-400">
                  {score.toFixed(0)} / 100
                </span>
              </div>
              <Progress value={score} className="h-2 bg-slate-100" />
            </div>
          );
        },
      },
      {
        accessorKey: 'riskItem.signalCount',
        header: 'Số tín hiệu',
        cell: ({ row }) => (
          <div className="text-sm font-semibold text-slate-800">
            {row.original.riskItem.signalCount.toLocaleString('vi-VN')}
          </div>
        ),
      },
      {
        accessorKey: 'riskItem.updatedAt',
        header: 'Cập nhật lúc',
        cell: ({ row }) => (
          <div className="text-sm text-slate-600">
            {row.original.riskItem.updatedAt
              ? format(
                  new Date(row.original.riskItem.updatedAt),
                  'dd/MM/yyyy HH:mm',
                )
              : 'N/A'}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const meta = resolveStatus(row.original);

          return <Badge className={meta.className}>{meta.label}</Badge>;
        },
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-9 rounded-lg border border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100"
              onClick={async () => {
                await navigator.clipboard.writeText(row.original.user.id);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy ID
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const hasRows = table.getRowModel().rows.length > 0;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table className="min-w-275">
          <TableHeader className="bg-sky-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 text-[15px] font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`risk-skeleton-${index}`}>
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell
                      key={`risk-skeleton-${index}-${cellIndex}`}
                      className="py-4"
                    >
                      <Skeleton className="h-5 w-full rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : hasRows ? (
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-16 text-center text-sm text-slate-500"
                >
                  Không có người dùng rủi ro phù hợp với bộ lọc hiện tại.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        page={page}
        pageSize={pageSize}
        total={total}
        entityLabel="Người dùng"
        onPageChange={onPageChange}
      />
    </div>
  );
}
