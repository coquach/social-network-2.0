
export const dashboardActivityMock = [
  'Người dùng A đăng bài viết mới',
  'Một bài viết xuất hiện cảm xúc tiêu cực',
  'Nhân viên kiểm duyệt xử lý báo cáo',
  'Người dùng B chỉnh sửa nội dung',
] as const;
export function DashboardActivity() {
  return (
    <div className="lg:col-span-2 rounded-xl border border-sky-100 bg-white p-4">
      <h2 className="font-medium text-slate-700 mb-4">Hoạt động gần đây</h2>

      <ul className="space-y-3 text-sm text-slate-600">
        {dashboardActivityMock.map((text, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
