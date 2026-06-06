'use client';

import { useEffect, useMemo, useState } from 'react';
import { MdGroupAdd } from 'react-icons/md';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { useFriends, useUser, useInviteUserToGroup } from '@repo/shared';
import { DirectAvatar } from '@/app/(platform)/(main)/conversations/_components/direct-avatar';
import { toast } from 'sonner';

const FriendRow = ({
  userId,
  query,
  isSelected,
  disabledAll,
  onToggle,
}: {
  userId: string;
  query: string;
  isSelected: boolean;
  disabledAll: boolean;
  onToggle: (id: string) => void;
}) => {
  const { data: user, isPending } = useUser(userId);

  if (isPending) {
    return (
      <div className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-2">
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="min-w-0 space-y-1">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-3 w-56 rounded" />
          </div>
        </div>
        <Skeleton className="h-4 w-12 rounded" />
      </div>
    );
  }

  if (!user) return null;

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  const normalized = `${fullName} ${user.email ?? ''}`.toLowerCase();
  if (query && !normalized.includes(query)) return null;

  return (
    <button
      type="button"
      onClick={() => onToggle(user.id)}
      disabled={disabledAll}
      className={`w-full flex items-center justify-between gap-3 rounded-lg border p-2 transition cursor-pointer ${
        isSelected
          ? 'border-sky-500 bg-sky-50'
          : 'border-gray-200 hover:bg-gray-50'
      } ${disabledAll ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <DirectAvatar userId={user.id} className="h-10 w-10" />
        <div className="text-left min-w-0">
          <div className="text-sm font-medium truncate">{fullName}</div>
          <div className="text-xs text-gray-500 truncate">
            {user.email ?? ''}
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {isSelected ? 'Đã chọn' : 'Chọn'}
      </div>
    </button>
  );
};

export const GroupInviteDialog = () => {
  const { group, can } = useGroupPermissionContext();
  const [open, setOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const canInvite =
    (group?.groupSetting?.allowMemberInvite ?? false) ||
    can(GroupPermission.INVITE_MEMBERS);
  const { mutateAsync: inviteUser, isPending: isInviting } =
    useInviteUserToGroup();

  const {
    data,
    isPending: isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFriends(undefined, { limit: 30 });

  const friendIds = useMemo(() => {
    const ids = data?.pages.flatMap((page) => page.data) ?? [];
    return Array.from(new Set(ids));
  }, [data]);

  const normalizedQuery = q.trim().toLowerCase();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!group?.id) return;
    setInviteLink(`${window.location.origin}/groups/${group.id}`);
  }, [group?.id]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Đã copy link mời vào clipboard');
    } catch {
      toast.error('Không thể copy link, vui lòng thử lại');
    }
  };

  const submit = async () => {
    const ids = Array.from(selected);
    if (!group?.id || ids.length === 0) return;

    await Promise.all(
      ids.map((userId) => inviteUser({ groupId: group.id, userId }))
    );
    setSelected(new Set());
    setQ('');
  };

  const disabledAll = !canInvite || isInviting;

  if (!canInvite) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setQ('');
          setSelected(new Set());
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <MdGroupAdd className="mr-1.5 h-4 w-4" />
          Mời bạn bè
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[560px] p-0 overflow-hidden">
        <DialogHeader >
          <DialogTitle>Mời bạn bè vào {group?.name}</DialogTitle>
          <DialogDescription>
            Gửi link hoặc chọn bạn bè để mời tham gia nhóm.
          </DialogDescription>
        </DialogHeader>

        <div className='p-5'>
          <div className=" space-y-2">
            <label className="text-sm font-medium">Link mời</label>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly />
              <Button type="button" onClick={handleCopyLink}>
                Copy
              </Button>
            </div>
          </div>

          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Đã chọn {selected.size} người</span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="hover:text-slate-700 disabled:opacity-50"
              disabled={selected.size === 0 || disabledAll}
            >
              Bỏ chọn
            </button>
          </div>

          <div className="mt-2 h-80 overflow-y-auto rounded-lg border border-gray-200 p-2">
            {isLoading && !friendIds.length ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="min-w-0 space-y-1">
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-3 w-56 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                ))}
              </div>
            ) : friendIds.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                Hiện chưa có bạn bè nào.
              </div>
            ) : (
              <div className="space-y-2">
                {friendIds.map((id) => (
                  <FriendRow
                    key={id}
                    userId={id}
                    query={normalizedQuery}
                    isSelected={selected.has(id)}
                    disabledAll={disabledAll}
                    onToggle={toggle}
                  />
                ))}
              </div>
            )}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage || disabledAll}
              >
                {isFetchingNextPage || isFetching ? 'Đang tải...' : 'Tải thêm'}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={disabledAll}
          >
            Hủy
          </Button>
          <Button
            onClick={submit}
            disabled={disabledAll || selected.size === 0}
          >
            Mời ({selected.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
