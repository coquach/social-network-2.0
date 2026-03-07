'use client';
import { GroupMemberDTO } from '@/models/group/groupMemberDTO';
import { GroupRole } from '@/models/group/enums/group-role.enum';
import { useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { roleLabel } from './admin-members-section';

type ChangeRoleFormProps = {
  member: GroupMemberDTO;
  currentUserRole: GroupRole | undefined;
  isSubmitting: boolean;
  onSubmit: (newRole: GroupRole) => void;
};

export const ChangeRoleForm = ({
  member,
  currentUserRole,
  isSubmitting,
  onSubmit,
}: ChangeRoleFormProps) => {
  const [selectedRole, setSelectedRole] = useState<GroupRole>(member.role);

  const allowedRoles = useMemo(() => {
    const base: GroupRole[] = [
      GroupRole.ADMIN,
      GroupRole.MODERATOR,
      GroupRole.MEMBER,
    ];
    if (currentUserRole === GroupRole.OWNER) {
      return [GroupRole.OWNER, ...base];
    }
    return base;
  }, [currentUserRole]);

  const options = allowedRoles.filter(
    (r) => r !== GroupRole.OWNER || member.role === GroupRole.OWNER
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Chọn vai trò mới cho thành viên <b>{member.userName}</b>.
      </p>
      <Select
        value={selectedRole}
        onValueChange={(v) => setSelectedRole(v as GroupRole)}
      >
        <SelectTrigger className="border-sky-200">
          <SelectValue placeholder="Chọn vai trò" />
        </SelectTrigger>
        <SelectContent>
          {options.map((r) => (
            <SelectItem key={r} value={r}>
              {roleLabel[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setSelectedRole(member.role)}
          disabled={isSubmitting}
        >
          Đặt lại
        </Button>
        <Button
          type="button"
          className="bg-sky-500 hover:bg-sky-600 text-white"
          disabled={isSubmitting || selectedRole === member.role}
          onClick={() => onSubmit(selectedRole)}
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </div>
  );
};
