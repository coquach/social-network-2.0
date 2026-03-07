import { Activity, CheckCircle2, Clock3, Shield } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

const activities = [
  {
    title: 'Bật 2FA bắt buộc cho admin',
    actor: 'Lan Nguyen',
    time: 'Hôm nay, 09:12',
    status: 'done',
  },
  {
    title: 'Cập nhật ngưỡng auto-lock P1',
    actor: 'Khanh Tran',
    time: 'Hôm qua, 17:45',
    status: 'pending',
  },
  {
    title: 'Xuất báo cáo retention 90 ngày',
    actor: 'System',
    time: 'Hôm qua, 08:05',
    status: 'done',
  },
];

export function AuditLogCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Nhật ký thay đổi gần đây</p>
          <p className="text-xs text-slate-500">Theo dõi thay đổi cấu hình quan trọng</p>
        </div>
        <Badge className="bg-slate-900 text-white hover:bg-slate-900">
          <Shield className="mr-1 h-4 w-4" />
          Audit trail
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        {activities.map((item) => (
          <div
            key={`${item.title}-${item.time}`}
            className="flex items-start justify-between rounded-xl border border-slate-100 px-3 py-2"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-slate-50 p-2">
                <Activity className="h-4 w-4 text-sky-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">{item.actor}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <Clock3 className="h-4 w-4" />
              <span>{item.time}</span>
              <Badge
                variant="outline"
                className={
                  item.status === 'done'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }
              >
                {item.status === 'done' ? <CheckCircle2 className="mr-1 h-4 w-4" /> : null}
                {item.status === 'done' ? 'Đã áp dụng' : 'Chờ kiểm duyệt'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
