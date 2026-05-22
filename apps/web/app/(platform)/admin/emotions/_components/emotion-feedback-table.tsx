'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { AdminPagination } from '../../_components/pagination';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { FeedbackListItemDTO } from '@/models/emotion/adminEmotionDTO';

type Props = {
  rows: FeedbackListItemDTO[];
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

const accuracyBadgeClass = (accurate: boolean) =>
  accurate
    ? 'border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
    : 'border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100';

const emotionLabels: Record<string, string> = {
  joy: 'Vui',
  sadness: 'Buồn',
  anger: 'Tức giận',
  angry: 'Tức giận',
  fear: 'Sợ hãi',
  disgust: 'Chán ghét',
  surprise: 'Ngạc nhiên',
  neutral: 'Trung lập',
};

const formatEmotionLabel = (emotion?: string | null) => {
  if (!emotion) return 'Không xác định';

  return emotionLabels[emotion.toLowerCase()] ?? emotion;
};

const formatAccuracyLabel = (value: boolean) => (value ? 'Đúng' : 'Sai');

export function EmotionFeedbackTable({
  rows,
  page,
  pageSize,
  total,
  loading,
  onPageChange,
}: Props) {
  const columns = React.useMemo<ColumnDef<FeedbackListItemDTO>[]>(
    () => [
      {
        accessorKey: 'predictedEmotion',
        header: 'Cảm xúc dự đoán',
        cell: ({ row }) => (
          <div className="font-medium text-slate-900">
            {formatEmotionLabel(row.original.predictedEmotion)}
          </div>
        ),
      },
      {
        accessorKey: 'expectedEmotion',
        header: 'Cảm xúc mong đợi',
        cell: ({ row }) => (
          <div className="text-slate-700">
            {formatEmotionLabel(row.original.expectedEmotion)}
          </div>
        ),
      },
      {
        accessorKey: 'isAccurate',
        header: 'Độ chính xác',
        cell: ({ row }) => (
          <Badge className={accuracyBadgeClass(row.original.isAccurate)}>
            {formatAccuracyLabel(row.original.isAccurate)}
          </Badge>
        ),
      },
      {
        accessorKey: 'modelVersion',
        header: 'Phiên bản mô hình',
        cell: ({ row }) => (
          <div className="text-slate-600">
            {row.original.modelVersion ?? 'không xác định'}
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Ngày tạo',
        cell: ({ row }) => (
          <div className="text-slate-600">
            {format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm')}
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
        <Table className="min-w-230">
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
                <TableRow key={`feedback-skeleton-${index}`}>
                  {Array.from({ length: 5 }).map((__, cellIndex) => (
                    <TableCell
                      key={`feedback-skeleton-${index}-${cellIndex}`}
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
                  colSpan={5}
                  className="py-16 text-center text-sm text-slate-500"
                >
                  Không có phản hồi nào khớp bộ lọc hiện tại.
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
        entityLabel="phản hồi"
        onPageChange={onPageChange}
      />
    </div>
  );
}
