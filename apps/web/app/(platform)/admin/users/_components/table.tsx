'use client';

import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  Ban,
  Eye,
  Lock,
  Shield,
  Trash2,
  Unlock,
  UserCheck,
} from 'lucide-react';
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

import {
  SystemRole,
  SystemUserDTO,
  UserStatus,
} from '@/models/user/systemUserDTO';
import { formatDateVN, getFullName } from '@/utils/user.utils';
import { AdminPagination } from '../../_components/pagination';
import { ConfirmActionDialog } from '../../_components/confirm-action-dialog';
import { UserDetailDialog } from './user-detail-dialog';
import { useBanUser, useUnbanUser } from '@/hooks/use-admin-users';
import { Loader } from '@/components/loader-componnet';
import { DataTableToolbar } from '../../_components/data-table-toolbar';

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === UserStatus.ACTIVE)
    return (
      <Badge className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        <BadgeCheck className="h-3.5 w-3.5" />
        Hoạt động
      </Badge>
    );

  if (status === UserStatus.BANNED)
    return (
      <Badge className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-50">
        <Ban className="h-3.5 w-3.5" />
        Bị khóa
      </Badge>
    );

  return (
    <Badge className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-100">
      <Trash2 className="h-3.5 w-3.5" />
      Đã xóa
    </Badge>
  );
}

function RoleBadge({ role }: { role: SystemRole }) {
  const roleStyles: Record<
    SystemRole,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    [SystemRole.ADMIN]: {
      label: 'Quản trị',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Shield className="h-3.5 w-3.5" />,
    },
    [SystemRole.MODERATOR]: {
      label: 'Điều hành',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <UserCheck className="h-3.5 w-3.5" />,
    },
    [SystemRole.USER]: {
      label: 'Người dùng',
      className: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: <BadgeCheck className="h-3.5 w-3.5" />,
    },
  };

  const roleStyle = roleStyles[role];

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 ${roleStyle.className}`}
    >
      {roleStyle.icon}
      {roleStyle.label}
    </Badge>
  );
}

export type UsersTableProps = {
  users: SystemUserDTO[];
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

type ActionType = 'ban' | 'unban' | 'delete';

export function UsersTable({
  users,
  page,
  pageSize,
  total,
  loading,
  onPageChange,
}: UsersTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [selected, setSelected] = React.useState<SystemUserDTO | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmUser, setConfirmUser] = React.useState<SystemUserDTO | null>(
    null
  );
  const [actionType, setActionType] = React.useState<ActionType | null>(null);

  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();

  const actionLoading = banMutation.isPending || unbanMutation.isPending;
  React.useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  const openConfirm = (type: ActionType, user: SystemUserDTO) => {
    setActionType(type);
    setConfirmUser(user);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmUser || !actionType) return;

    try {
      if (actionType === 'ban') {
        await banMutation.mutateAsync(confirmUser.id);
      } else if (actionType === 'unban') {
        await unbanMutation.mutateAsync(confirmUser.id);
      } else {
        // await deleteMutation.mutateAsync(confirmUser.id)
        console.log('TODO delete', confirmUser.id);
      }
    } finally {
      setConfirmOpen(false);
      setConfirmUser(null);
      setActionType(null);
    }
  };

  const confirmTitle = (() => {
    if (!confirmUser || !actionType) return '';
    const name = getFullName(confirmUser) || confirmUser.email;
    if (actionType === 'ban') return `Khóa tài khoản ${name}?`;
    if (actionType === 'unban') return `Mở khóa tài khoản ${name}?`;
    return `Xóa người dùng ${name}?`;
  })();

  const confirmDescription = (() => {
    if (!confirmUser || !actionType) return '';
    if (actionType === 'ban')
      return 'Người dùng sẽ không thể đăng nhập và sử dụng các tính năng cho đến khi được mở khóa.';
    if (actionType === 'unban')
      return 'Người dùng sẽ có thể đăng nhập và hoạt động bình thường trở lại.';
    return 'Hành động này không thể hoàn tác.';
  })();

  const confirmText =
    actionType === 'delete' ? 'Xóa' : actionType === 'ban' ? 'Khóa' : 'Mở khóa';
  const confirmVariant =
    actionType === 'delete' || actionType === 'ban' ? 'destructive' : 'default';

  const columns = React.useMemo<ColumnDef<SystemUserDTO>[]>(
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
        id: 'name',
        header: 'Tên người dùng',
        accessorFn: (row) => getFullName(row) ?? '',
        cell: ({ row }) => (
          <div className="text-slate-800">{getFullName(row.original)}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <div className="text-slate-600">{row.original.email}</div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Vai trò',
        enableSorting: false,
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      },
      {
        id: 'createdAt',
        header: 'Ngày tham gia',

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
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Hành động',
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-center">
            <TooltipProvider delayDuration={150}>
              <div className="inline-flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100 hover:bg-sky-100"
                      onClick={() => setSelected(row.original)}
                      aria-label="Xem thông tin"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Xem thông tin
                  </TooltipContent>
                </Tooltip>

                {row.original.status === UserStatus.BANNED ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100 hover:bg-emerald-100"
                        onClick={() => openConfirm('unban', row.original)}
                        aria-label="M? kh?a t?i kho?n"
                        disabled={actionLoading}
                      >
                        <Unlock className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      M? kh?a
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9 bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-100 hover:bg-rose-100"
                        onClick={() => openConfirm('ban', row.original)}
                        aria-label="Kh?a t?i kho?n"
                        disabled={
                          row.original.status === UserStatus.DELETED ||
                          actionLoading
                        }
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      Kh?a t?i kho?n
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 bg-slate-100 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-200"
                      onClick={() => openConfirm('delete', row.original)}
                      aria-label="Xóa người dùng"
                      disabled={
                        row.original.status === UserStatus.DELETED ||
                        actionLoading
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Xóa người dùng
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    [actionLoading]
  );

  const table = useReactTable({
    data: users,
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
        <Table className="min-w-[720px]">
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
                        isActions && 'w-40 text-center'
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
                  colSpan={7}
                  className="py-10 text-center text-slate-500"
                >
                  Không có người dùng nào được tìm thấy.
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
        entityLabel="người dùng"
        onPageChange={onPageChange}
      />

      <UserDetailDialog
        user={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={(v) => {
          if (!v) {
            setConfirmOpen(false);
            setConfirmUser(null);
            setActionType(null);
          } else setConfirmOpen(true);
        }}
        title={confirmTitle}
        description={confirmDescription}
        confirmText={confirmText}
        cancelText="Hủy"
        confirmVariant={confirmVariant}
        onConfirm={handleConfirm}
      />
    </>
  );
}
