import { ArrowUpRight, ShieldCheck, ShieldOff } from 'lucide-react';

type GroupItem = {
  name: string;
  reports: number;
  trend: string;
  status: 'ổn định' | 'cần theo dõi';
  color: string;
};

export function TopGroupsCard({ data }: { data: GroupItem[] }) {
  const maxValue = Math.max(...data.map((g) => g.reports), 1);

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Nhóm hoạt động nhiều</h2>
          <p className="text-sm text-slate-500">Theo dõi nhóm có lượt báo cáo cao để ưu tiên kiểm duyệt</p>
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-400" />
      </div>

      <div className="space-y-3">
        {data.map((group) => {
          const width = (group.reports / maxValue) * 100;
          const badge = group.status === 'ổn định' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              <ShieldCheck className="h-3 w-3" />
              {group.status}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
              <ShieldOff className="h-3 w-3" />
              {group.status}
            </span>
          );

          return (
            <div key={group.name} className="space-y-2 rounded-xl border border-slate-100 p-3">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <div className="font-medium text-slate-800">{group.name}</div>
                {badge}
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${group.color}`}
                  style={{ width: `${width}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{group.reports} báo cáo</span>
                <span className="text-slate-600">{group.trend}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
