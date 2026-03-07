"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSystemUsers } from "@/hooks/use-admin-users";
import { SystemUserFilter } from "@/lib/actions/admin/admin-users-action";
import { LogType } from "@/models/log/logDTO";
import { AdminActivityLog } from "../_components/admin-activity-log";
import { UsersTable } from "./_components/table";
import { UsersToolbar } from "./_components/toolbar";
import { CreateUserDialog } from "./_components/create-user-dialog";

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramsString = searchParams.toString();

  const parseFilterFromParams = React.useCallback(
    (paramsStr: string): SystemUserFilter => {
      const sp = new URLSearchParams(paramsStr);
      const page = Number(sp.get("page") ?? "1");
      const limit = Number(sp.get("limit") ?? "10");
      const status = sp.get("status") || undefined;
      const role = sp.get("role") || undefined;
      const query = sp.get("query") || undefined;
      return {
        page: Number.isFinite(page) && page > 0 ? page : 1,
        limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
        status: status as any,
        role: role as any,
        query,
      };
    },
    []
  );

  const [filter, setFilter] = React.useState<SystemUserFilter>(() =>
    parseFilterFromParams(paramsString)
  );
  const [createOpen, setCreateOpen] = React.useState(false);

  const { data, isLoading, isFetching } = useSystemUsers(filter);

  const handleFilterChange = (changes: Partial<SystemUserFilter>) => {
    setFilter((prev) => ({ ...prev, page: 1, ...changes }));
  };

  const handleReset = () => {
    setFilter({ page: 1, limit: filter.limit ?? 10 });
  };

  // sync URL with filter
  // sync filter -> URL (avoid replace if unchanged)
  React.useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(filter.page ?? 1));
    params.set("limit", String(filter.limit ?? 10));
    if (filter.query) params.set("query", filter.query);
    if (filter.status) params.set("status", filter.status);
    if (filter.role) params.set("role", filter.role);
    const next = params.toString();
    if (next !== paramsString) router.replace(`?${next}`);
  }, [filter, router, paramsString]);

  // update state when search params change (back/forward)
  React.useEffect(() => {
    const next = parseFilterFromParams(paramsString);
    setFilter((prev) => {
      const same =
        prev.page === next.page &&
        prev.limit === next.limit &&
        prev.query === next.query &&
        prev.status === next.status &&
        prev.role === next.role;
      return same ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-600">Quản lý người dùng</h1>
          <p className="text-sm text-slate-500">Theo dõi tài khoản, trạng thái hoạt động và thông tin hồ sơ.</p>
        </div>
        <Button
          className="w-full sm:w-auto bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
          onClick={() => setCreateOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Tạo thành viên
        </Button>
      </div>

      <div className="space-y-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <UsersToolbar
          filter={filter}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          loading={isLoading || isFetching}
        />

        <UsersTable
          users={data?.data ?? []}
          page={filter.page ?? 1}
          pageSize={filter.limit ?? 10}
          total={data?.total ?? 0}
          loading={isLoading || isFetching}
          onPageChange={(page) => setFilter((prev) => ({ ...prev, page }))}
        />
      </div>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      <AdminActivityLog
        title="Log hoạt động người dùng"
        description="Theo dõi thao tác quản trị liên quan đến tài khoản."
        filter={{ logType: LogType.USER_LOG, limit: 10 }}
        emptyMessage="Chưa có hoạt động nào liên quan đến người dùng."
      />
    </div>
  );
}
