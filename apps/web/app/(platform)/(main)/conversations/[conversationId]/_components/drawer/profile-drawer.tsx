'use client';

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
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from '@/components/ui/sheet';

import {
  useDeleteConversation,
  useHideConversation,
  useLeaveConversation,
  useUnhideConversation,
  useUpdateConversation,
} from '@/hooks/use-conversation';

import { MediaItem } from '@/lib/types/media';
import {
  ConversationDTO,
  UpdateConversationForm,
} from '@/models/conversation/conversationDTO';
import { useAuth } from '@clerk/nextjs';
import { EyeOff, Eye, LogOut, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { GroupHeader } from './group-header';
import { GroupSettings } from './group-setting';
import { MembersDialog } from './member-dialog';
import { DirectHeader } from './direct-header';
import { useRouter } from 'next/navigation';

interface ProfileDrawerProps {
  conversation: ConversationDTO;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (conversationId: string) => void;
}

export const ProfileDrawer = ({
  conversation,
  isOpen,
  onClose,
}: ProfileDrawerProps) => {
  const router = useRouter();
  const { userId: currentUserId } = useAuth();

  const isGroup = conversation.isGroup;
  const isAdmin = isGroup && conversation.admins?.includes(currentUserId ?? '');

  const [openMembers, setOpenMembers] = useState(false);

  const { mutate: updateConversation, isPending: isUpdating } =
    useUpdateConversation(conversation._id);

  const { mutate: deleteConversation, isPending: isDeleting } =
    useDeleteConversation(conversation._id);

  const { mutate: leaveConversation, isPending: isLeaving } =
    useLeaveConversation(conversation._id);

  const { mutate: hideConversation, isPending: isHiding } = useHideConversation(
    conversation._id
  );

  const { mutate: unhideConversation, isPending: isUnhiding } =
    useUnhideConversation(conversation._id);

  const handleUpdateGroup = (
    dto: UpdateConversationForm,
    media?: MediaItem,
    publicId?: string
  ) => {
    updateConversation({ dto, media, publicId }, { onSuccess: () => {} });
  };

  const handleDelete = () => {
    deleteConversation();
    router.replace('/conversations');
  };

  const handleLeave = () => {
    leaveConversation(undefined, { onSuccess: () => onClose() });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
    else onClose(); // parent control
  };

  const memberCount = useMemo(
    () => conversation.participants?.length ?? 0,
    [conversation.participants]
  );

  // ✅ Direct: check hidden status by hideFor
  const isHidden = useMemo(() => {
    if (!currentUserId) return false;
    const arr = conversation.hiddenFor ?? [];
    return arr.includes(currentUserId);
  }, [conversation.hiddenFor, currentUserId]);

  const toggleHide = () => {
    if (!currentUserId) return;
    if (isHidden) unhideConversation();
    else hideConversation();
  };

  const hidePending = isHiding || isUnhiding;

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-[420px] flex flex-col justify-between"
      >
        <SheetHeader>
          <div className="p-4">
            {isGroup ? (
              <GroupHeader
                conversation={conversation}
                isAdmin={!!isAdmin}
                isUpdating={isUpdating}
                onUpdateGroup={handleUpdateGroup}
              />
            ) : (
              <DirectHeader conversation={conversation} />
            )}
          </div>
        </SheetHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {isGroup ? (
            <GroupSettings
              conversation={conversation}
              isAdmin={!!isAdmin}
              memberCount={memberCount}
              onOpenMembers={() => setOpenMembers(true)}
              isUpdating={isUpdating}
            />
          ) : null}
        </div>

        {/* FOOTER */}
        <SheetFooter className="flex flex-col gap-3 p-4">
          {/* DIRECT: only Hide/Unhide */}
          {!isGroup && (
            <Button
              variant="outline"
              className="w-full flex gap-2"
              disabled={hidePending}
              onClick={toggleHide}
            >
              {isHidden ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              {isHidden ? 'Hiện cuộc trò chuyện' : 'Ẩn cuộc trò chuyện'}
            </Button>
          )}

          {/* GROUP: Leave for everyone */}
          {isGroup && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex gap-2"
                  disabled={isLeaving}
                >
                  <LogOut className="w-4 h-4" />
                  Rời nhóm
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rời nhóm?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn sẽ không còn nhận tin nhắn từ nhóm này nữa.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLeave}>
                    Rời nhóm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* GROUP: Delete group admin-only */}
          {isGroup && isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full flex gap-2"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                  Xoá nhóm
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-rose-600">
                    Xác nhận xoá nhóm
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleDelete}
                  >
                    Xoá
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </SheetFooter>

        {/* Members dialog */}
        {isGroup && (
          <MembersDialog
            open={openMembers}
            onOpenChange={setOpenMembers}
            conversation={conversation}
            isAdmin={!!isAdmin}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
