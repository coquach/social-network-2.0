import { HeartPulse, Sparkles, Telescope } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export const EmotionDashboardHeader = () => {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-linear-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] sm:p-8">
      <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-14 bottom-2 h-44 w-44 rounded-full bg-emerald-200/45 blur-3xl" />

      <div className="relative space-y-5">
        <Badge
          variant="outline"
          className="w-fit border-sky-200 bg-white/80 text-sky-700"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Bảng điều khiển trí tuệ cảm xúc
        </Badge>

        <div className="space-y-2">
          <h1 className="text-pretty text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Hiểu rõ nhịp cảm xúc của bạn chỉ trong một màn hình
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Dashboard này chuyển dữ liệu cảm xúc thô thành tóm tắt dễ hiểu, bối
            cảnh xu hướng và gợi ý hành động thực tế để bạn điều chỉnh tốt hơn
            mỗi ngày.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/90 bg-white/70 p-3 backdrop-blur-sm">
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
              Rõ ràng cảm xúc
            </p>
            <p className="text-sm text-slate-700">
              Nhìn nhanh cảm xúc nổi bật và mức độ hiện tại.
            </p>
          </div>
          <div className="rounded-2xl border border-white/90 bg-white/70 p-3 backdrop-blur-sm">
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Telescope className="h-3.5 w-3.5 text-sky-600" />
              Tín hiệu hành động
            </p>
            <p className="text-sm text-slate-700">
              Chuyển biến động và rủi ro thành gợi ý cụ thể, dễ hiểu.
            </p>
          </div>
          <div className="rounded-2xl border border-white/90 bg-white/70 p-3 backdrop-blur-sm">
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Theo dõi liên tục
            </p>
            <p className="text-sm text-slate-700">
              Xem lại lịch sử cảm xúc mà không cần đọc bảng kỹ thuật rối mắt.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
