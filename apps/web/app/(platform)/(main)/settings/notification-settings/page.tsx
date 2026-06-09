'use client';

import { 
  useNotificationPreferences, 
  useUpdateNotificationPreferences 
} from '@repo/shared';
import { 
  Bell, 
  MessageSquare, 
  Users, 
  AtSign, 
  UserPlus, 
  Moon, 
  Clock, 
  ChevronLeft,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { data: prefs, isLoading } = useNotificationPreferences();
  const { mutate: updatePrefs, isPending } = useUpdateNotificationPreferences();

  const handleToggle = (key: string, value: boolean) => {
    updatePrefs({
      settings: {
        [key]: value,
      },
    });
    toast.success('Đã cập nhật cài đặt thông báo');
  };

  const handleDndToggle = (enabled: boolean) => {
    updatePrefs({
      settings: {
        doNotDisturb: {
          ...prefs?.settings?.doNotDisturb,
          enabled,
        }
      }
    });
    toast.success('Đã cập nhật chế độ không làm phiền');
  };

  const handleDndTimeSelect = (from: string, to: string) => {
    updatePrefs({
      settings: {
        doNotDisturb: {
          ...prefs?.settings?.doNotDisturb,
          from,
          to,
        },
      },
    });
    toast.success('Đã cập nhật khung giờ không làm phiền');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 w-full animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const dndFrom = prefs?.settings?.doNotDisturb?.from ?? '22:00';
  const dndTo = prefs?.settings?.doNotDisturb?.to ?? '07:00';
  const dndEnabled = prefs?.settings?.doNotDisturb?.enabled ?? false;

  const dndOptions = [
    { label: 'Giờ ngủ đêm (22:00 - 07:00)', from: '22:00', to: '07:00' },
    { label: 'Giờ làm việc (08:00 - 17:00)', from: '08:00', to: '17:00' },
    { label: 'Giờ nghỉ trưa (12:00 - 13:30)', from: '12:00', to: '13:30' },
    { label: 'Buổi tối (20:00 - 00:00)', from: '20:00', to: '00:00' },
  ];

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="md:hidden shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Bell className="h-6 w-6 text-orange-500" />
          Cài đặt thông báo
        </h1>
      </div>

      <div className="space-y-8">
        {/* Trò chuyện & Cuộc gọi */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
            Trò chuyện & Cuộc gọi
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <SettingToggle
              icon={<MessageSquare className="h-5 w-5 text-sky-500" />}
              title="Tin nhắn cá nhân"
              description="Thông báo tin nhắn từ bạn bè"
              checked={prefs?.settings?.pushMessages ?? true}
              onCheckedChange={(val) => handleToggle('pushMessages', val)}
              disabled={isPending}
            />
            <div className="h-px bg-slate-100 ml-14" />
            <SettingToggle
              icon={<Users className="h-5 w-5 text-indigo-500" />}
              title="Tin nhắn nhóm"
              description="Thông báo từ các cuộc trò chuyện nhóm"
              checked={prefs?.settings?.pushGroupMessages ?? true}
              onCheckedChange={(val) => handleToggle('pushGroupMessages', val)}
              disabled={isPending}
            />
          </div>
        </section>

        {/* Tương tác xã hội */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
            Tương tác xã hội
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <SettingToggle
              icon={<AtSign className="h-5 w-5 text-purple-500" />}
              title="Lượt nhắc đến"
              description="Khi ai đó nhắc đến bạn (@)"
              checked={prefs?.settings?.pushMentions ?? true}
              onCheckedChange={(val) => handleToggle('pushMentions', val)}
              disabled={isPending}
            />
            <div className="h-px bg-slate-100 ml-14" />
            <SettingToggle
              icon={<UserPlus className="h-5 w-5 text-emerald-500" />}
              title="Lời mời kết bạn"
              description="Khi có người muốn kết bạn"
              checked={prefs?.settings?.pushFriendRequests ?? true}
              onCheckedChange={(val) => handleToggle('pushFriendRequests', val)}
              disabled={isPending}
            />
          </div>
        </section>

        {/* Chế độ không làm phiền */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
            Chế độ không làm phiền
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <SettingToggle
              icon={<Moon className="h-5 w-5 text-rose-500" />}
              title="Không làm phiền"
              description="Tạm dừng thông báo đẩy (trừ cuộc gọi)"
              checked={dndEnabled}
              onCheckedChange={handleDndToggle}
              disabled={isPending}
            />
            
            {dndEnabled && (
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-600">Khung giờ áp dụng</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dndOptions.map((opt) => {
                    const isSelected = dndFrom === opt.from && dndTo === opt.to;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleDndTimeSelect(opt.from, opt.to)}
                        disabled={isPending}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border text-sm transition-all",
                          isSelected 
                            ? "border-sky-500 bg-white text-sky-600 shadow-sm" 
                            : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-white"
                        )}
                      >
                        <span className="font-medium">{opt.label}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingToggle({ 
  icon, 
  title, 
  description, 
  checked, 
  onCheckedChange, 
  disabled 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <Label className="text-[15px] font-semibold text-slate-800 cursor-pointer" onClick={() => !disabled && onCheckedChange(!checked)}>
          {title}
        </Label>
        <p className="text-sm text-slate-500 truncate">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
