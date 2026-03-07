'use client';

import { Shield } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateUserRole } from '@/hooks/use-admin-users';
import { getRoleFromClaims } from '@/lib/role';
import {
  SystemRole,
  SystemUserDTO,
  UserStatus,
} from '@/models/user/systemUserDTO';
import { formatDateVN, getFullName } from '@/utils/user.utils';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

const roleLabels: Record<SystemRole, string> = {
  [SystemRole.ADMIN]: 'Quản trị viên',
  [SystemRole.MODERATOR]: 'Điều hành viên',
  [SystemRole.USER]: 'Người dùng',
};

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === UserStatus.ACTIVE)
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Hoạt động
      </Badge>
    );

  if (status === UserStatus.BANNED)
    return (
      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
        Bị khóa
      </Badge>
    );

  return (
    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
      Đã xóa
    </Badge>
  );
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: {
  user: SystemUserDTO | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { sessionClaims } = useAuth();
  const myRole = getRoleFromClaims(sessionClaims);
  const canEditRole = myRole === 'admin';

  const updateRole = useUpdateUserRole();
  const [role, setRole] = React.useState<SystemRole | null>(user?.role ?? null);

  React.useEffect(() => {
    setRole(user?.role ?? null);
  }, [user]);

  if (!user) return null;

  const name = getFullName(user) || user.email || 'Người dùng';

  const handleRoleChange = async (value: SystemRole) => {
    if (!user || value === user.role) return;
    if (!canEditRole) {
      toast.error('Chỉ quản trị viên mới có thể đổi vai trò.');
      return;
    }

    setRole(value);
    try {
      await updateRole.mutateAsync({ userId: user.id, role: value });
    } catch (err) {
      setRole(user.role);
    }
  };

  const roleOptions = Object.values(SystemRole).filter((r) => {
    // tránh hạ quyền admin nếu không đủ quyền
    if (!canEditRole && r !== user.role) return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] border-sky-100 overflow-hidden p-0">
        <DialogHeader className='p-4'>
          <DialogTitle >
            Thông tin người dùng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4">
          <div className="flex flex-col gap-3 rounded-xl border border-sky-100 bg-slate-50/50 p-4  items-start sm:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-800">{name}</div>
              <div className="text-sm text-slate-500">{user.email}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-amber-700"
                >
                  {roleLabels[user.role]}
                </Badge>
                <StatusBadge status={user.status} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Shield className="h-4 w-4 text-slate-400" />
              <span>ID: {user.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-slate-100 p-3">
              <Label className="text-xs text-slate-500">Ngày tham gia</Label>
              <div className="text-sm font-semibold text-slate-800">
                {formatDateVN(user.createdAt)}
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-100 p-3">
              <Label className="text-xs text-slate-500">Trạng thái</Label>
              <StatusBadge status={user.status} />
            </div>
          </div>
          <div className="space-y-2 rounded-xl border border-slate-100 p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Họ</Label>
                <Input readOnly value={user.firstName} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Tên</Label>
                <Input readOnly value={user.lastName} />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-slate-100 px-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-500">Vai trò hệ thống</Label>
            {!canEditRole && (
              <span className="text-xs text-slate-400">
                Chỉ admin mới được thay đổi
              </span>
            )}
          </div>
          <Select
            value={role ?? undefined}
            onValueChange={(value) => handleRoleChange(value as SystemRole)}
            disabled={!canEditRole || updateRole.isPending}
          >
            <SelectTrigger className="border-slate-200 focus:ring-slate-200">
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {roleLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="mt-4 flex justify-end">
          <Button
            variant="outline"
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
