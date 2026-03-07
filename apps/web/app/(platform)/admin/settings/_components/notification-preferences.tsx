'use client';

import * as React from 'react';
import { BellRing, Megaphone, MessageCircle, Smartphone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const channels = [
  {
    id: 'emailAlerts',
    title: 'Email cảnh báo',
    description: 'Báo cáo P1/P2, khóa nội dung tự động, log đăng nhập lạ',
    icon: Megaphone,
    defaultChecked: true,
  },
  {
    id: 'pushAlerts',
    title: 'Thông báo đẩy',
    description: 'Thông báo realtime cho đội vận hành trên mobile app',
    icon: Smartphone,
    defaultChecked: true,
  },
  {
    id: 'chatOps',
    title: 'Kết nối ChatOps',
    description: 'Bắn cảnh báo vào kênh #moderation trên Slack/Teams',
    icon: MessageCircle,
    defaultChecked: false,
  },
];

export function NotificationPreferencesCard() {
  const [weeklyDigest, setWeeklyDigest] = React.useState(true);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Thông báo & cảnh báo</p>
          <p className="text-xs text-slate-500">Chọn kênh nhận cảnh báo và tóm tắt dành cho đội vận hành</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          <BellRing className="h-4 w-4" />
          Ưu tiên cảnh báo tức thời
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="space-y-3 rounded-xl border border-slate-100 p-4 shadow-[0_1px_0_rgba(15,23,42,0.05)]"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <channel.icon className="h-4 w-4 text-sky-500" />
              {channel.title}
            </div>
            <p className="text-sm text-slate-700">{channel.description}</p>
            <div className="flex items-center gap-3">
              <Switch
                id={channel.id}
                defaultChecked={channel.defaultChecked}
                className="data-[state=checked]:bg-sky-600"
              />
              <Label htmlFor={channel.id} className="text-sm font-medium text-slate-800">
                Bật kênh này
              </Label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Bản tin weekly digest</p>
          <p className="text-xs text-slate-500">
            Tổng hợp số liệu quan trọng mỗi thứ 2, gửi cho đội vận hành và quản trị viên cấp cao
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="weeklyDigest"
            checked={weeklyDigest}
            onCheckedChange={setWeeklyDigest}
            className="data-[state=checked]:bg-slate-800"
          />
          <Label htmlFor="weeklyDigest" className="text-sm font-medium text-slate-800">
            Gửi bản tin tuần
          </Label>
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
            Xem mẫu bản tin
          </Button>
        </div>
      </div>
    </div>
  );
}
