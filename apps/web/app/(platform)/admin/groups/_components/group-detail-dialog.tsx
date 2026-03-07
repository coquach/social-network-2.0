'use client';

import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AdminGroupDTO } from '@/models/group/adminGroupDTO';
import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';
import { GroupStatus } from '@/models/group/enums/group-status.enum';
import { formatDateVN } from '@/utils/user.utils';

const privacyLabel: Record<GroupPrivacy, string> = {
  [GroupPrivacy.PUBLIC]: 'Công khai',
  [GroupPrivacy.PRIVATE]: 'Riêng tư',
};

const statusLabel: Record<GroupStatus, { label: string; className: string }> = {
  [GroupStatus.ACTIVE]: {
    label: 'Hoạt động',
    className: 'bg-emerald-100 text-emerald-700',
  },
  [GroupStatus.INACTIVE]: {
    label: 'Tạm dừng',
    className: 'bg-amber-100 text-amber-700',
  },
  [GroupStatus.BANNED]: {
    label: 'Bị hạn chế',
    className: 'bg-rose-100 text-rose-700',
  },
  [GroupStatus.DELETED]: {
    label: 'Đã xóa',
    className: 'bg-slate-100 text-slate-700',
  }
};

type GroupDetailDialogProps = {
  group: AdminGroupDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GroupDetailDialog({
  group,
  open,
  onOpenChange,
}: GroupDetailDialogProps) {
  if (!group) return null;

  const statusMeta = group.status
    ? statusLabel[group.status]
    : statusLabel[GroupStatus.ACTIVE];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px] border-sky-100 p-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Chi tiết nhóm</DialogTitle>
          <DialogDescription className="text-slate-600">
            Thông tin tổng quan về nhóm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-700 hover:bg-slate-100"
            >
              #{group.id}
            </Badge>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-sky-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Image
                src={group.avatarUrl || '/images/placeholder.png'}
                alt={group.name}
                fill
                sizes="64px"
                loading="lazy"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-slate-800">
                {group.name}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Quyền riêng tư: {privacyLabel[group.privacy]}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-xs font-medium text-slate-500">Chủ nhóm</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-white">
                  <Image
                    src={group.owner.avatarUrl || '/images/placeholder.png'}
                    alt={group.owner.fullName}
                    fill
                    sizes="36px"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {group.owner.fullName}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-xs font-medium text-slate-500">
                Thành viên
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-800">
                {group.members.toLocaleString('vi-VN')}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-xs font-medium text-slate-500">Báo cáo</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">
                {group.reports} báo cáo
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-xs font-medium text-slate-500">Ngày tạo</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">
                {formatDateVN(group.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
