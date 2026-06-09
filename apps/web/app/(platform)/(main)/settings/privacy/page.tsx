'use client';

import { useUser, useUpdateProfile, PrivacyLevel, MessagePrivacy } from '@repo/shared';
import { useAuth } from '@clerk/nextjs';
import { Shield, Lock, Eye, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PrivacySettingsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const { data: user, isLoading } = useUser(userId as string);
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const [settings, setSettings] = useState({
    profileVisibility: PrivacyLevel.PUBLIC,
    friendListVisibility: PrivacyLevel.PUBLIC,
    messagePrivacy: MessagePrivacy.EVERYONE,
  });

  useEffect(() => {
    if (user?.privacySettings) {
      setSettings({
        profileVisibility: user.privacySettings.profileVisibility ?? PrivacyLevel.PUBLIC,
        friendListVisibility: user.privacySettings.friendListVisibility ?? PrivacyLevel.PUBLIC,
        messagePrivacy: user.privacySettings.messagePrivacy ?? MessagePrivacy.EVERYONE,
      });
    }
  }, [user]);

  const handleUpdate = async (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await updateProfile({
        privacySettings: newSettings,
      });
      toast.success('Đã cập nhật quyền riêng tư');
    } catch (error) {
      toast.error('Lỗi khi cập nhật quyền riêng tư');
      // Revert on error
      setSettings(settings);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 mb-8" />
        <div className="space-y-4">
          <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

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
          <Shield className="h-6 w-6 text-sky-500" />
          Quyền riêng tư
        </h1>
      </div>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
            <Eye className="h-5 w-5 text-slate-400" />
            Ai có thể xem hồ sơ của bạn?
          </h2>
          <div className="space-y-3">
            {[
              { val: PrivacyLevel.PUBLIC, label: 'Mọi người', desc: 'Bất kỳ ai cũng có thể xem bài viết và thông tin của bạn.' },
              { val: PrivacyLevel.FRIENDS, label: 'Bạn bè', desc: 'Chỉ bạn bè mới có thể xem hồ sơ của bạn.' },
              { val: PrivacyLevel.PRIVATE, label: 'Chỉ mình tôi', desc: 'Khoá bảo vệ hồ sơ. Không ai ngoài bạn có thể xem.' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleUpdate('profileVisibility', opt.val)}
                disabled={isPending}
                className={cn(
                  "w-full flex items-start gap-4 rounded-xl border p-4 text-left transition-all",
                  settings.profileVisibility === opt.val 
                    ? "border-sky-500 bg-sky-50" 
                    : "border-slate-100 bg-white hover:border-sky-200 hover:bg-slate-50"
                )}
              >
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{opt.label}</div>
                  <div className="text-sm text-slate-500 mt-1">{opt.desc}</div>
                </div>
                {settings.profileVisibility === opt.val && (
                  <CheckCircle2 className="h-5 w-5 text-sky-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Friend List Visibility */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-400" />
            Ai có thể xem danh sách bạn bè của bạn?
          </h2>
          <div className="space-y-3">
            {[
              { val: PrivacyLevel.PUBLIC, label: 'Mọi người', desc: 'Bất kỳ ai cũng có thể thấy bạn bè của bạn.' },
              { val: PrivacyLevel.FRIENDS, label: 'Bạn bè', desc: 'Chỉ bạn bè của bạn mới thấy danh sách này.' },
              { val: PrivacyLevel.PRIVATE, label: 'Chỉ mình tôi', desc: 'Chỉ bạn mới có thể xem danh sách bạn bè.' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleUpdate('friendListVisibility', opt.val)}
                disabled={isPending}
                className={cn(
                  "w-full flex items-start gap-4 rounded-xl border p-4 text-left transition-all",
                  settings.friendListVisibility === opt.val 
                    ? "border-sky-500 bg-sky-50" 
                    : "border-slate-100 bg-white hover:border-sky-200 hover:bg-slate-50"
                )}
              >
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{opt.label}</div>
                  <div className="text-sm text-slate-500 mt-1">{opt.desc}</div>
                </div>
                {settings.friendListVisibility === opt.val && (
                  <CheckCircle2 className="h-5 w-5 text-sky-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Message Privacy */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-400" />
            Ai có thể nhắn tin cho bạn?
          </h2>
          <div className="space-y-3">
            {[
              { val: MessagePrivacy.EVERYONE, label: 'Mọi người', desc: 'Bất kỳ ai cũng có thể gửi tin nhắn cho bạn.' },
              { val: MessagePrivacy.FRIENDS, label: 'Chỉ bạn bè', desc: 'Chỉ những người đã kết bạn mới có thể nhắn tin.' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleUpdate('messagePrivacy', opt.val)}
                disabled={isPending}
                className={cn(
                  "w-full flex items-start gap-4 rounded-xl border p-4 text-left transition-all",
                  settings.messagePrivacy === opt.val 
                    ? "border-sky-500 bg-sky-50" 
                    : "border-slate-100 bg-white hover:border-sky-200 hover:bg-slate-50"
                )}
              >
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{opt.label}</div>
                  <div className="text-sm text-slate-500 mt-1">{opt.desc}</div>
                </div>
                {settings.messagePrivacy === opt.val && (
                  <CheckCircle2 className="h-5 w-5 text-sky-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
