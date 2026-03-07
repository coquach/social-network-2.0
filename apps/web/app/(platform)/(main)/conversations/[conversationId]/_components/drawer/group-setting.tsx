'use client';

import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const GroupSettings = ({
  conversation,
  isAdmin,
  memberCount,
  onOpenMembers,
}: {
  conversation: ConversationDTO;
  isAdmin: boolean;
  memberCount: number;
  onOpenMembers: () => void;
  isUpdating: boolean;
}) => {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="text-xs text-gray-500">Tạo nhóm</div>
        <div className="text-sm text-gray-900">
          {format(new Date(conversation.createdAt), 'dd-MM-yyyy', {
            locale: vi,
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Thành viên</div>
          <div className="text-xs text-gray-500">{memberCount} người</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onOpenMembers}
        >
          <Users className="w-4 h-4" />
          Xem
        </Button>
      </div>

      {!isAdmin && (
        <div className="text-xs text-gray-500">
          Bạn không phải admin nên chỉ có thể xem thành viên và rời nhóm.
        </div>
      )}
    </div>
  );
};
