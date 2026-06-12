'use client';

import { useNotificationPreferences, useUpdateNotificationPreferences } from '@repo/shared';
import { Loader2, MessageCircle, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type ChatSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ChatSettingsDialog = ({ open, onOpenChange }: ChatSettingsDialogProps) => {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const { mutate: updatePrefs, isPending } = useUpdateNotificationPreferences();

  const handleToggle = (key: string, value: boolean) => {
    updatePrefs({
      settings: {
        [key]: value,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cài đặt thông báo Chat</DialogTitle>
          <DialogDescription>
            Tuỳ chỉnh nhanh thông báo cho tin nhắn cá nhân và tin nhắn nhóm.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="flex h-[160px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden mt-2">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-500 dark:bg-sky-500/10 dark:text-sky-400">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 pr-2">
                    <Label className="text-base font-semibold">Tin nhắn cá nhân</Label>
                    <p className="text-[13px] text-muted-foreground leading-none">
                      Nhận thông báo khi có tin nhắn mới.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={prefs?.settings?.pushMessages ?? true}
                  onCheckedChange={(val) => handleToggle('pushMessages', val)}
                  disabled={isPending}
                />
              </div>

              <div className="h-[1px] bg-border mx-4" />

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-500 dark:bg-sky-500/10 dark:text-sky-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 pr-2">
                    <Label className="text-base font-semibold">Tin nhắn nhóm</Label>
                    <p className="text-[13px] text-muted-foreground leading-none">
                      Nhận thông báo từ các nhóm chat.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={prefs?.settings?.pushGroupMessages ?? true}
                  onCheckedChange={(val) => handleToggle('pushGroupMessages', val)}
                  disabled={isPending}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
