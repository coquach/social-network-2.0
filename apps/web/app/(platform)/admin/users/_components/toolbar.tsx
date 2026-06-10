"use client";

import { RotateCcw, Search } from "lucide-react";
import * as React from "react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SystemUserFilter } from "@/lib/actions/admin/admin-users-action";
import { SystemRole, UserStatus } from "@/models/user/systemUserDTO";

type UsersToolbarProps = {
  filter: SystemUserFilter;
  onFilterChange: (changes: Partial<SystemUserFilter>) => void;
  onReset: () => void;
  loading?: boolean;
};

export function UsersToolbar({
  filter,
  onFilterChange,
  onReset,
  loading,
}: UsersToolbarProps) {
  const [q, setQ] = React.useState(filter.query ?? "");
  const [status, setStatus] = React.useState<string>(filter.status ?? "all");
  const [role, setRole] = React.useState<string>(filter.role ?? "all");
  const latestQueryRef = React.useRef(q);

  React.useEffect(() => {
    const next = filter.query ?? "";
    setQ((prev) => (prev === next ? prev : next));
  }, [filter.query]);

  React.useEffect(() => {
    const next = filter.status ?? "all";
    setStatus((prev) => (prev === next ? prev : next));
  }, [filter.status]);

  React.useEffect(() => {
    const next = filter.role ?? "all";
    setRole((prev) => (prev === next ? prev : next));
  }, [filter.role]);

  React.useEffect(() => {
    latestQueryRef.current = q;
  }, [q]);

  const applyFilters = React.useCallback(
    (text: string, nextStatus: string, nextRole: string) => {
      onFilterChange({
        query: text.trim() || undefined,
        status: nextStatus === "all" ? undefined : (nextStatus as UserStatus),
        role: nextRole === "all" ? undefined : (nextRole as SystemRole),
        page: 1,
      });
    },
    [onFilterChange],
  );

  const handleStatusChange = React.useCallback(
    (value: string) => {
      setStatus((prev) => (prev === value ? prev : value));
      applyFilters(latestQueryRef.current, value, role);
    },
    [applyFilters, role],
  );

  const handleRoleChange = React.useCallback(
    (value: string) => {
      setRole((prev) => (prev === value ? prev : value));
      applyFilters(latestQueryRef.current, status, value);
    },
    [applyFilters, status],
  );

  const debouncedSearch = useDebouncedCallback(
    (text: string) => {
      applyFilters(text, status, role);
    },
    300,
    { maxWait: 800 },
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Tìm kiếm
          </div>
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
          <div className="mb-1 text-xs font-medium text-slate-500">
            Trạng thái
          </div>
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
          <Select value={role} onValueChange={handleRoleChange}>
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
