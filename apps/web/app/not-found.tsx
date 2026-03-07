'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_55%)]" />
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-100 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-indigo-100 blur-3xl" />

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-sky-100 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(14,165,233,0.12)] backdrop-blur">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-1 text-xs font-semibold text-sky-600">
          404 · Không tìm thấy
        </div>
        <h1 className="mt-4 text-3xl font-bold text-sky-500">
          Trang bạn tìm không tồn tại
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Đường dẫn có thể đã bị xoá, đổi tên hoặc bạn không có quyền truy cập.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-sky-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
          >
            Về trang chủ
          </Link>
          <Link
            href="/groups"
            className="inline-flex h-10 items-center justify-center rounded-md border border-sky-100 bg-white px-5 text-sm font-semibold text-sky-600 shadow-sm transition hover:bg-sky-50"
          >
            Khám phá nhóm
          </Link>
        </div>
      </div>
    </div>
  );
}
