'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ConversationDTO,
  useUpdateConversation,
} from '@repo/shared';
import { useState } from 'react';

import { MemberRow } from './member-row';
import { AddMembersDialog } from './add-members-dialog';

export const MembersDialog = ({
  open,
  onOpenChange,
  conversation,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conversation: ConversationDTO;
  isAdmin: boolean;
}) => {
  const [openAdd, setOpenAdd] = useState(false);
  const { mutate: updateConversation, isPending } = useUpdateConversation(
    conversation._id
  );

  const onKick = (userId: string) => {
    if (!isAdmin) return;
    updateConversation({ participantsToRemove: [userId] });
  };

  const onAdd = (userIds: string[]) => {
    if (!isAdmin) return;
    updateConversation(
      { participantsToAdd: userIds }, 
      { onSuccess: () => setOpenAdd(false) }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[520px] p-0 overflow-hidden">
          <DialogHeader className='p-4'>
            <DialogTitle>
              Thành viên ({conversation.participants.length})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 px-4 max-h-[420px] overflow-y-auto pr-1">
            {conversation.participants.map((uid) => (
              <MemberRow
                key={uid}
                userId={uid}
                admins={conversation.admins ?? []}
                isAdmin={isAdmin}
                disabled={isPending}
                onKick={onKick}
              />
            ))}
          </div>

          {isAdmin && (
            <DialogFooter className="pt-3 flex justify-end">
              <Button onClick={() => setOpenAdd(true)} disabled={isPending}>
                Thêm thành viên
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <AddMembersDialog
          open={openAdd}
          onOpenChange={setOpenAdd}
          existingUserIds={conversation.participants}
          onAdd={onAdd}
          isPending={isPending}
        />
      )}
    </>
  );
};
