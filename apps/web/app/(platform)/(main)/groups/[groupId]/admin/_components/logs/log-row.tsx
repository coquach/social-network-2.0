'use client';
import { GroupLogDTO } from "@repo/shared";

import { MediumAvatar } from "@/components/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EVENTS } from "./admin-logs-section";


type LogRowProps = {
  log: GroupLogDTO;
};

export const LogRow = ({ log }: LogRowProps) => {
  const meta = EVENTS[log.eventType as keyof typeof EVENTS];

  const badgeLabel = meta?.badgeLabel ?? 'Hoạt động';
  const badgeClass = meta?.className ?? 'bg-slate-50 text-slate-700 border-slate-200';
  const eventLabel = meta?.label ?? log.eventType;

 

  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
      {/* left: user + content */}
      <div className="flex items-start gap-3 min-w-0">
        <MediumAvatar userId={log.userId} />

        <div className="space-y-1 min-w-0">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{}</span>
          </p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap wrap-break-word">
            {log.content || 'Không có thêm chi tiết.'}
          </p>
          <div className="text-xs text-muted-foreground">
            {new Date(log.createdAt).toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      {/* right: type badge */}
      <div className="flex items-start justify-end sm:ml-3">
        <Badge
          variant="outline"
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
            badgeClass
          )}
          title={eventLabel}
        >
          {badgeLabel}
        </Badge>
      </div>
    </div>
  );
};
