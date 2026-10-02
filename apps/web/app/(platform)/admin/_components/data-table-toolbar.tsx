'use client';

import { Table } from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const columnLabels: Record<string, string> = {
  preview: 'Nội dung',
  targetType: 'Loại',
  action: 'Hình thức',
  decision: 'Quyết định',
  confidence: 'Độ tin cậy',
  createdAt: 'Ngày tạo',
  actions: 'Thao tác',
  id: 'Mã kháng nghị',
  moderationId: 'Mã kiểm duyệt',
  userId: 'Mã người dùng',
  status: 'Trạng thái',
  reason: 'Lý do',
};

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  className?: string;
};

export function DataTableToolbar<TData>({
  table,
  className,
}: DataTableToolbarProps<TData>) {
  return (
    <div className={className ?? 'flex items-center'}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-slate-200 px-3 text-xs text-slate-600 shadow-xs hover:bg-slate-50"
          >
            Cột
            <ChevronDown className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                className="text-xs"
              >
                {columnLabels[column.id] ?? column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
