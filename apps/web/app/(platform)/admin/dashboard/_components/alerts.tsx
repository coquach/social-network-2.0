export const dashboardAlertsMock = [
  'Cảm xúc tiêu cực có xu hướng tăng trong 24 giờ qua',
  'Có 3 nội dung đang chờ kiểm duyệt',
  'Tần suất báo cáo tăng nhẹ so với hôm qua',
] as const;

export function DashboardAlerts() {
  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
      <h2 className="font-medium text-sky-700 mb-2">Lưu ý hệ thống</h2>

      <ul className="text-sm text-slate-600 list-disc pl-4 space-y-1">
        {dashboardAlertsMock.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
