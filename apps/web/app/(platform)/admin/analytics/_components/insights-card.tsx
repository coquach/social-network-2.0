import { BellRing, CheckCircle2, Clock3, TrendingUp } from 'lucide-react';

type InsightsCardProps = {
  successRate: number;
  priorityCount: number;
  avgResponseMinutes: number;
  flagged: number;
};

export function InsightsCard({ successRate, priorityCount, avgResponseMinutes, flagged }: InsightsCardProps) {
  const insights = [
    {
      title: 'Tỷ lệ xử lý thành công',
      value: `${successRate}%`,
      hint: 'Đã duyệt trong vòng 24h',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Báo cáo ưu tiên',
      value: priorityCount.toLocaleString('vi-VN'),
      hint: 'Cần xem trong 2h tới',
      icon: BellRing,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Thời gian phản hồi TB',
      value: `${Math.floor(avgResponseMinutes / 60)}h ${(avgResponseMinutes % 60).toString().padStart(2, '0')}m`,
      hint: 'Cải thiện 12% so với tuần trước',
      icon: Clock3,
      color: 'text-sky-600 bg-sky-50',
    },
    {
      title: 'Báo cáo cần ưu tiên',
      value: flagged.toLocaleString('vi-VN'),
      hint: 'Đang được kiểm duyệt thủ công',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Điểm nổi bật</h2>
      <p className="text-sm text-slate-500">Chỉ số giúp ưu tiên nguồn lực kiểm duyệt</p>

      <div className="mt-4 space-y-3">
        {insights.map((item) => (
          <div key={item.title} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="font-medium text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-500">{item.hint}</div>
              </div>
            </div>
            <div className="text-base font-semibold text-slate-800">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
