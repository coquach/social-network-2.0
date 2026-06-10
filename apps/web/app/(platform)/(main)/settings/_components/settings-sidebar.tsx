'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  Lock, 
  Eye, 
  Activity, 
  History, 
  Bell, 
  HelpCircle,
  ChevronRight,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarGroups = [
  {
    title: 'Tài khoản & Riêng tư',
    items: [
      {
        id: 'account',
        label: 'Trung tâm tài khoản',
        icon: Eye,
        href: '/settings/account',
        isComingSoon: true,
      },
      {
        id: 'privacy',
        label: 'Quyền riêng tư',
        icon: Lock,
        href: '/settings/privacy',
      },
      {
        id: 'privacy-policy',
        label: 'Chính sách bảo mật',
        icon: Shield,
        href: '/settings/privacy-policy',
      },
    ]
  },
  {
    title: 'Hoạt động & Thông báo',
    items: [
      {
        id: 'notifications',
        label: 'Thông báo',
        icon: Bell,
        href: '/settings/notification-settings',
      },
      {
        id: 'activity',
        label: 'Nhật ký hoạt động',
        icon: Activity,
        href: '/settings/activity',
      },
      {
        id: 'moderation',
        label: 'Lịch sử kiểm duyệt',
        icon: History,
        href: '/settings/moderation-history',
      },
    ]
  },
  {
    title: 'Tùy chỉnh & Hỗ trợ',
    items: [
      {
        id: 'language',
        label: 'Ngôn ngữ',
        icon: Globe,
        href: '/settings/language',
        isComingSoon: true,
      },
      {
        id: 'support',
        label: 'Trợ giúp và hỗ trợ',
        icon: HelpCircle,
        href: '/settings/support',
      },
    ]
  }
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full max-w-sm">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Cài đặt</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-8 app-scroll">
        {sidebarGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h2 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {group.title}
            </h2>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (pathname === '/settings' && item.id === 'privacy');
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.id}
                    href={item.isComingSoon ? '#' : item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                      isActive 
                        ? "bg-sky-50 text-sky-600 font-semibold" 
                        : "text-slate-600 hover:bg-slate-50",
                      item.isComingSoon && "opacity-60 cursor-default"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-lg shrink-0",
                      isActive ? "bg-white shadow-sm" : "bg-slate-100 group-hover:bg-white"
                    )}>
                      <Icon className={cn("h-4 w-4", isActive ? "text-sky-600" : "text-slate-500")} />
                    </div>
                    <span className="flex-1 text-[14.5px] truncate">{item.label}</span>
                    {isActive && (
                      <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-sky-500" />
                    )}
                    {item.isComingSoon && (
                      <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400 px-1 border border-slate-200 rounded">Sắp có</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
