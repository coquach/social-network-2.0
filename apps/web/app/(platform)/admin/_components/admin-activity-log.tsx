"use client";

import { useMemo } from "react";
import { AlertCircle, Clock, UserCheck } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuditLogs } from "@/hooks/use-admin-logs";
import { AuditLogQuery } from "@/lib/actions/admin/admin-log-action";
import { LogType } from "@/models/log/logDTO";

type AdminActivityLogProps = {
  title?: string;
  description?: string;
  filter: AuditLogQuery;
  emptyMessage?: string;
};

const formatLogType = (logType?: LogType) => {
  if (!logType) return "";
  return logType.replace(/_/g, " ");
};

const formatDateTime = (value?: Date | string) => {
  if (!value) return "";
  return format(new Date(value), "dd/MM/yyyy HH:mm");
};

export function AdminActivityLog({
  title = "Log hoạt động",
  description = "Theo dõi các thao tác quản trị",
  filter,
  emptyMessage = "Chưa có log nào",
}: AdminActivityLogProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useAdminAuditLogs(filter);

  const logs = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        {filter.logType && (
          <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
            {formatLogType(filter.logType)}
          </Badge>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <Table className="min-w-[720px]">
          <TableHeader className="bg-slate-50/60">
            <TableRow>
              <TableHead className="w-[180px] text-center">Thời gian</TableHead>
              <TableHead className="text-center">Hành động</TableHead>
              <TableHead className="text-center">Chi tiết</TableHead>
              <TableHead className="w-40 text-center">Người thực hiện</TableHead>
              <TableHead className="w-40 text-center">Đối tượng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`sk-${idx}`}>
                  <TableCell className="animate-pulse text-slate-400">
                    Đang tải...
                  </TableCell>
                  <TableCell className="animate-pulse text-slate-300">
                    &nbsp;
                  </TableCell>
                  <TableCell className="animate-pulse text-slate-300">
                    &nbsp;
                  </TableCell>
                  <TableCell className="animate-pulse text-slate-300">
                    &nbsp;
                  </TableCell>
                  <TableCell className="animate-pulse text-slate-300">
                    &nbsp;
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && logs.length === 0 && !isError ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-slate-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : null}

            {isError ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-red-600"
                >
                  Không thể tải log hoạt động.{' '}
                  <Button variant="link" onClick={() => refetch()}>
                    Thử lại
                  </Button>
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !isError
              ? logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/80">
                    <TableCell className="text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {formatDateTime(log.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800 text-center">
                      {log.action}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {log.detail}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        <UserCheck className="h-4 w-4" />
                        {log.actorId}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {log.targetId}
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <AlertCircle className="h-4 w-4" />
          {logs.length} log đang hiển thị
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetchingNextPage || isLoading}
          >
            Làm mới
          </Button>
          {hasNextPage && (
            <Button
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Đang tải...' : 'Tải thêm'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
