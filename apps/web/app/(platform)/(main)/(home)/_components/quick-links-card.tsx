'use client';

import Link from 'next/link';
import { Compass, UserPlus } from 'lucide-react';

const quickLinks = [
  {
    label: 'Thêm bạn bè',
    description: 'Kết nối với những người bạn biết',
    href: '/friends/suggestions',
    icon: UserPlus,
    accent: 'from-sky-400 to-blue-500',
  },
  {
    label: 'Khám phá nhóm',
    description: 'Tìm nhóm phù hợp với sở thích của bạn',
    href: '/groups/explore',
    icon: Compass,
    accent: 'from-amber-400 to-orange-500',
  },
];

export function QuickLinksCard() {
  return (
    <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-linear-to-r from-sky-50 via-white to-indigo-50 px-4 py-3">
        <p className="text-lg font-bold text-sky-500">Gợi ý nhanh</p>
      </div>
      <div className="space-y-3 p-4">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${item.accent} text-white shadow-sm`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">
                {item.label}
              </p>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
            <span className="text-xs font-semibold text-sky-600 opacity-0 transition group-hover:opacity-100">
              Xem
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
