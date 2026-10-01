'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  Shield,
  Lock,
  Eye,
  Activity,
  History,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SettingsIndexPage() {
  const router = useRouter();

  const settingGroups = [
    {
      title: 'Tài khoản & Riêng tư',
      items: [
        {
          id: 'account',
          label: 'Trung tâm tài khoản',
          icon: <Eye className="h-5 w-5 text-slate-500" />,
          description: 'Quản lý thông tin cá nhân và bảo mật tài khoản',
          href: '#',
          isComingSoon: true,
        },
        {
          id: 'privacy',
          label: 'Quyền riêng tư',
          icon: <Lock className="h-5 w-5 text-sky-500" />,
          description: 'Quản lý ai có thể xem hồ sơ và nhắn tin cho bạn',
          href: '/settings/privacy',
        },
        {
          id: 'privacy-policy',
          label: 'Chính sách bảo mật',
          icon: <Shield className="h-5 w-5 text-emerald-500" />,
          description: 'Tìm hiểu cách chúng tôi bảo vệ dữ liệu của bạn',
          href: '/settings/privacy-policy',
        },
      ],
    },
    {
      title: 'Hoạt động & Thông báo',
      items: [
        {
          id: 'notifications',
          label: 'Thông báo',
          icon: <Activity className="h-5 w-5 text-orange-500" />,
          description: 'Tùy chỉnh các thông báo bạn nhận được',
          href: '/settings/notification-settings',
        },
        {
          id: 'activity',
          label: 'Nhật ký hoạt động',
          icon: <Activity className="h-5 w-5 text-indigo-500" />,
          description: 'Xem lại các tương tác và bài viết của bạn',
          href: '/settings/activity',
        },
        {
          id: 'moderation',
          label: 'Lịch sử kiểm duyệt',
          icon: <History className="h-5 w-5 text-rose-500" />,
          description: 'Xem các báo cáo và nội dung bị gỡ',
          href: '/settings/moderation-history',
        },
      ],
    },
    {
      title: 'Tùy chỉnh & Hỗ trợ',
      items: [
        {
          id: 'language',
          label: 'Ngôn ngữ',
          icon: <Eye className="h-5 w-5 text-slate-500" />,
          description: 'Thay đổi ngôn ngữ hiển thị của ứng dụng',
          href: '#',
          isComingSoon: true,
        },
        {
          id: 'support',
          label: 'Trợ giúp và hỗ trợ',
          icon: <History className="h-5 w-5 text-blue-500" />,
          description: 'Câu hỏi thường gặp và liên hệ hỗ trợ',
          href: '/settings/support',
        },
      ],
    },
  ];

  React.useEffect(() => {
    if (window.innerWidth >= 768) {
      router.replace('/settings/privacy');
    }
  }, [router]);

  return (
    <>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 pb-20 md:hidden">
        <h1 className="mb-8 text-3xl font-bold text-slate-800 px-1">Cài đặt</h1>

        <div className="space-y-8">
          {settingGroups.map((group) => (
            <section key={group.title} className="space-y-3">
              <h2 className="text-lg font-bold text-slate-700 px-1">
                {group.title}
              </h2>
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                {group.items.map((item, index) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-4 p-4 transition hover:bg-slate-50',
                      index !== group.items.length - 1 &&
                        'border-b border-slate-100',
                      item.isComingSoon &&
                        'cursor-default opacity-60 hover:bg-white',
                    )}
                    onClick={(e) => {
                      if (item.isComingSoon) {
                        e.preventDefault();
                        toast.info('Tính năng đang phát triển');
                      }
                    }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 truncate">
                          {item.label}
                        </p>
                        {item.isComingSoon && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
                            Sắp có
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        {item.description}
                      </p>
                    </div>
                    {!item.isComingSoon && (
                      <ChevronRight className="h-5 w-5 text-slate-300 shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      {/* Skeleton / Empty state for desktop while redirecting */}
      <div className="hidden md:block w-full h-full bg-slate-50/30" />
    </>
  );
}
