'use client';
import { GroupMemberDTO } from '@/models/group/groupMemberDTO';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

type ChangePermissionFormProps = {
  member: GroupMemberDTO;
  isSubmitting: boolean;
  onSubmit: (permissions: GroupPermission[]) => void;
};

const PERMISSION_LABEL: Record<GroupPermission, string> = {
  MANAGE_GROUP: 'Quản lý nhóm',
  MANAGE_MEMBERS: 'Quản lý thành viên',
  UPDATE_GROUP: 'Chỉnh sửa thông tin nhóm',
  APPROVE_POST: 'Duyệt bài viết',
  DELETE_POST: 'Xoá bài viết',
  BAN_MEMBER: 'Chặn thành viên',
  VIEW_REPORTS: 'Xem báo cáo',
  VIEW_SETTINGS: 'Xem cài đặt nhóm',
  UPDATE_GROUP_SETTINGS: 'Cập nhật cài đặt nhóm',
  MANAGE_JOIN_REQUESTS: 'Quản lý yêu cầu tham gia',
  INVITE_MEMBERS: 'Mời thành viên',
  [GroupPermission.MANAGE_EVENTS]: ''
};

export const ChangePermissionForm = ({
  member,
  isSubmitting,
  onSubmit,
}: ChangePermissionFormProps) => {
  const [selected, setSelected] = useState<Set<GroupPermission>>(
    new Set(member.customPermissions ?? [])
  );

  const togglePerm = (perm: GroupPermission, checked: boolean | string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(perm);
      } else {
        next.delete(perm);
      }
      return next;
    });
  };

  const handleSave = () => {
    onSubmit(Array.from(selected));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Tuỳ chỉnh quyền riêng cho thành viên <b>{member.userName}</b>. Các quyền
        này sẽ bổ sung thêm so với role mặc định.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
        {Object.values(GroupPermission).map((perm) => (
          <label
            key={perm}
            className="flex items-start gap-2 rounded-md border px-2 py-1.5 text-xs cursor-pointer hover:bg-sky-50/60"
          >
            <Checkbox
              checked={selected.has(perm)}
              onCheckedChange={(v) => togglePerm(perm, v)}
              className="mt-0.5"
            />
            <span className="leading-snug">
              <span className="font-medium text-slate-800">
                {PERMISSION_LABEL[perm]}
              </span>
              <br />
              <span className="text-[11px] text-slate-400 wrap-break-word">
                {perm}
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => setSelected(new Set(member.customPermissions ?? []))}
        >
          Khôi phục
        </Button>
        <Button
          type="button"
          className="bg-sky-500 hover:bg-sky-600 text-white"
          disabled={isSubmitting}
          onClick={handleSave}
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu quyền'}
        </Button>
      </div>
    </div>
  );
};
