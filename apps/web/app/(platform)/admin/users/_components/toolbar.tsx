'use client';

import { RotateCcw, Search } from 'lucide-react';
import * as React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemUserFilter } from '@/lib/actions/admin/admin-users-action';
import { SystemRole, UserStatus } from '@/models/user/systemUserDTO';

type UsersToolbarProps = {
  filter: SystemUserFilter;
  onFilterChange: (changes: Partial<SystemUserFilter>) => void;
  onReset: () => void;
  loading?: boolean;
};

export function UsersToolbar({ filter, onFilterChange, onReset, loading }: UsersToolbarProps) {
  const [q, setQ] = React.useState(filter.query ?? '');
  const [status, setStatus] = React.useState<string>(filter.status ?? 'all');
  const [role, setRole] = React.useState<string>(filter.role ?? 'all');

  React.useEffect(() => {
    setQ(filter.query ?? '');
  }, [filter.query]);

  React.useEffect(() => {
    setStatus(filter.status ?? 'all');
  }, [filter.status]);

  React.useEffect(() => {
    setRole(filter.role ?? 'all');
  }, [filter.role]);



  const handleStatusChange = (value: string) => {
    setStatus(value);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
  };

  const applyFilters = React.useCallback(
    (text: string, nextStatus: string, nextRole: string) => {
      onFilterChange({
        query: text.trim() || undefined,
        status: nextStatus === 'all' ? undefined : (nextStatus as UserStatus),
        role: nextRole === 'all' ? undefined : (nextRole as SystemRole),
        page: 1,
      });
    },
    [onFilterChange]
  );

  const debouncedSearch = useDebouncedCallback(
    (text: string) => {
      applyFilters(text, status, role);
    },
    300,
    { maxWait: 800 }
  );

  React.useEffect(() => {
    onFilterChange({
      query: q.trim() || undefined,
      status: status === 'all' ? undefined : (status as UserStatus),
      role: role === 'all' ? undefined : (role as SystemRole),
      page: 1,
    });
  }, [status, role,]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Tìm kiếm</div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => {
                const val = e.target.value;
                setQ(val);
                debouncedSearch(val);
              }}
              placeholder="Tên hoặc email..."
              className="border-sky-100 pl-9 focus-visible:ring-sky-200"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Trạng thái</div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={UserStatus.ACTIVE}>Hoạt động</SelectItem>
              <SelectItem value={UserStatus.BANNED}>Bị khóa</SelectItem>
              <SelectItem value={UserStatus.DELETED}>Đã xóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Vai trò</div>
          <Select
            value={role}
            onValueChange={(value) => {
              setRole(value);
              applyFilters(q, status, value);
            }}
          >
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={SystemRole.ADMIN}>Quản trị</SelectItem>
              <SelectItem value={SystemRole.MODERATOR}>Điều hành</SelectItem>
              <SelectItem value={SystemRole.USER}>Người dùng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:justify-end sm:pb-0.5">
        <Button
          variant="outline"
          className="border-sky-200 text-slate-700 hover:bg-sky-50"
          onClick={onReset}
          disabled={loading}
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
