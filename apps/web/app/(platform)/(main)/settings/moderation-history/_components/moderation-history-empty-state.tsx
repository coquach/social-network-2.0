'use client';

import { ShieldAlert } from 'lucide-react';

export function EmptyModerationState() {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200/70 bg-slate-50/70 px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-950/50">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-sky-100 bg-white/90 text-sky-600 shadow-sm dark:border-sky-950 dark:bg-slate-950 dark:text-sky-300">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Chưa có lịch sử kiểm duyệt
          </h2>
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            Khi có bản ghi kiểm duyệt mới, chúng sẽ xuất hiện tại đây để bạn xem
            lại nhanh chóng.
          </p>
        </div>
      </div>
    </div>
  );
}
