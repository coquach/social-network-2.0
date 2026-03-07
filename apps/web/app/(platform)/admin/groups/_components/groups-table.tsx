'use client';

import * as React from 'react';
import clsx from 'clsx';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  ListChecks,
  Lock,
  Trash2,
  Unlock,
} from 'lucide-react';

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
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { AdminGroupDTO } from '@/models/group/adminGroupDTO';
import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';
import { GroupStatus } from '@/models/group/enums/group-status.enum';
import { formatDateVN } from '@/utils/user.utils';
import { Loader } from '@/components/loader-componnet';
import { ConfirmActionDialog } from '../../_components/confirm-action-dialog';
import { AdminPagination } from '../../_components/pagination';
import { DataTableToolbar } from '../../_components/data-table-toolbar';

const privacyLabel: Record<GroupPrivacy, string> = {
  [GroupPrivacy.PUBLIC]: 'Công khai',
  [GroupPrivacy.PRIVATE]: 'Riêng tư',
};

type ActionState = {
  title: string;
  description?: string;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive';
  onConfirm?: () => void;
};

type GroupsTableProps = {
  groups: AdminGroupDTO[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onViewReports: (group: AdminGroupDTO) => void;
  onViewDetail: (group: AdminGroupDTO) => void;
  onBanGroup?: (group: AdminGroupDTO) => void;
  onUnbanGroup?: (group: AdminGroupDTO) => void;
};

function StatusBadge({ status }: { status?: GroupStatus }) {
  if (status === GroupStatus.BANNED)
    return (
      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
        Bị hạn chế
      </Badge>
    );

  if (status === GroupStatus.INACTIVE)
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        Tạm dừng
      </Badge>
    );

  return (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
      Hoạt động
    </Badge>
  );
}

function PrivacyBadge({ privacy }: { privacy: GroupPrivacy }) {
  const label = privacyLabel[privacy];

  return (
    <Badge
      variant="secondary"
      className="border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50"
    >
      {label}
    </Badge>
  );
}

export function GroupsTable({
  groups,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onViewReports,
  onViewDetail,
  onBanGroup,
  onUnbanGroup,
}: GroupsTableProps) {
  const [action, setAction] = React.useState<ActionState | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const openAction = (payload: ActionState) => {
    setAction(payload);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    action?.onConfirm?.();
    setDialogOpen(false);
    setAction(null);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  const columns = React.useMemo<ColumnDef<AdminGroupDTO>[]>(
    () => [
      {
        id: 'id',
        header: 'Mã nhóm',
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <div className="max-w-[120px] truncate font-medium text-slate-700">
            {row.original.id}
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Tên nhóm',
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium text-slate-800">
              {row.original.name}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'privacy',
        header: 'Chế độ',
        cell: ({ row }) => <PrivacyBadge privacy={row.original.privacy} />,
      },
      {
        accessorKey: 'members',
        header: 'Thành viên',
        cell: ({ row }) => (
          <div className="font-medium text-slate-700">
            {row.original.members.toLocaleString('vi-VN')}
          </div>
        ),
      },
      {
        id: 'reports',
        header: 'Báo cáo',
        accessorFn: (row) => row.reports,
        cell: ({ row }) => (
          <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50">
            {row.original.reports} báo cáo
          </Badge>
        ),
      },
      {
        id: 'createdAt',
        header: 'Ngày tạo',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => (
          <div className="text-slate-600">
            {formatDateVN(row.original.createdAt)}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Hành động',
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100 hover:bg-sky-100"
                    onClick={() => onViewDetail(row.original)}
                    aria-label={`Xem chi tiết ${row.original.name}`}
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
                    onClick={() => onViewReports(row.original)}
                    aria-label={`Xem báo cáo của ${row.original.name}`}
                  >
                    <ListChecks className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  Xem báo cáo
                </TooltipContent>
              </Tooltip>

              {row.original.status === GroupStatus.BANNED ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100 hover:bg-emerald-100"
                      onClick={() =>
                        openAction({
                          title: `Bỏ hạn chế ${row.original.name}?`,
                          description: 'Nhóm sẽ hoạt động trở lại bình thường.',
                          confirmText: 'Bỏ hạn chế',
                          onConfirm: () => onUnbanGroup?.(row.original),
                        })
                      }
                      aria-label={`Bỏ hạn chế ${row.original.name}`}
                    >
                      <Unlock className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Bỏ hạn chế
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-100 hover:bg-rose-100"
                      onClick={() =>
                        openAction({
                          title: `Hạn chế ${row.original.name}?`,
                          description: 'Nhóm sẽ bị hạn chế và cần xem xét lại.',
                          confirmText: 'Hạn chế',
                          confirmVariant: 'destructive',
                          onConfirm: () => onBanGroup?.(row.original),
                        })
                      }
                      aria-label={`Hạn chế ${row.original.name}`}
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Hạn chế
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 bg-slate-100 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-200"
                    aria-label={`Xóa nhóm ${row.original.name}`}
                    onClick={() =>
                      openAction({
                        title: `Xóa nhóm ${row.original.name}?`,
                        description:
                          'Hành động này sẽ xóa toàn bộ nội dung và không thể hoàn tác.',
                        confirmText: 'Xóa',
                        confirmVariant: 'destructive',
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  Xóa nhóm
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        ),
      },
    ],
    [onBanGroup, onUnbanGroup, onViewDetail, onViewReports]
  );

  const table = useReactTable({
    data: groups,
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
    <TooltipProvider delayDuration={150}>
      <DataTableToolbar table={table} />
      <div className="overflow-x-auto rounded-xl border border-sky-100">
        <Table className="min-w-[960px]">
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
                        isIdColumn && 'w-[120px]',
                        isActions && 'w-52 text-center'
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
                          isIdColumn && 'w-[120px]',
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
                  colSpan={8}
                  className="py-10 text-center text-slate-500"
                >
                  Không có nhóm nào để hiển thị.
                </TableCell>
              </TableRow>
            ) : null}

            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
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
        onPageChange={onPageChange}
        entityLabel="nhóm"
      />

      <ConfirmActionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setAction(null);
        }}
        title={action?.title ?? ''}
        description={action?.description}
        confirmText={action?.confirmText}
        confirmVariant={action?.confirmVariant}
        cancelText="Hủy"
        onConfirm={handleConfirm}
      />
    </TooltipProvider>
  );
}
