'use client';

import { Button } from '@/components/ui/button';
import { useGetUser } from '@/hooks/use-user-hook';

import { useAuth } from '@clerk/nextjs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DirectAvatar } from '../../../_components/direct-avatar';

export const MemberRow = ({
  userId,
  admins,
  isAdmin,
  disabled,
  onKick,
}: {
  userId: string;
  admins: string[];
  isAdmin: boolean;
  disabled?: boolean;
  onKick: (userId: string) => void;
}) => {
  const { userId: me } = useAuth();
  const { data: u } = useGetUser(userId);

  const isSelf = me === userId;
  const isTargetAdmin = admins.includes(userId);

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-2">
      <div className="flex items-center gap-3 min-w-0">
        <DirectAvatar userId={userId} className="h-10 w-10" />
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : userId}
            {isSelf && (
              <span className="ml-2 text-xs text-gray-500">(Bạn)</span>
            )}
            {isTargetAdmin && (
              <span className="ml-2 text-xs text-sky-600">Admin</span>
            )}
          </div>
          <div className="text-xs text-gray-500 truncate">{u?.email ?? ''}</div>
        </div>
      </div>

      {isAdmin && !isSelf && !isTargetAdmin && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={disabled}>
              Loại
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xoá thành viên?</AlertDialogTitle>
              <AlertDialogDescription>
                Thành viên này sẽ bị xoá khỏi nhóm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => onKick(userId)}
              >
                Xoá
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
