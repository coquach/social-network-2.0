'use client';
import { JoinRequestResponseDTO, InviteStatus } from "@repo/shared";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AvatarWithStatus } from "@/components/avatar";
type RowProps = {
  request: JoinRequestResponseDTO;
  canManage: boolean;
  approving: boolean;
  rejecting: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export const JoinRequestRow = ({
  request,
  canManage,
  approving,
  rejecting,
  onApprove,
  onReject,
}: RowProps) => {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const inviteStatus = request.status as InviteStatus;
  const disableActions = !canManage || approving || rejecting;

  const statusLabel = (() => {
    switch (inviteStatus) {
      case InviteStatus.PENDING:
        return 'Đang chờ duyệt';
      case InviteStatus.ACCEPTED:
        return 'Đã chấp nhận';
      case InviteStatus.DECLINED:
        return 'Đã từ chối';
      case InviteStatus.CANCELLED:
        return 'Đã huỷ';
      default:
        return inviteStatus;
    }
  })();

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow">
        {/* Người xin vào nhóm = invitee */}
        <div className="flex items-center gap-3 min-w-0">
          <AvatarWithStatus userId={request.inviteeId} />
        </div>

        <div className="flex flex-col gap-1 ml-4 items-end">
          <div className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-center">
            {statusLabel}
          </div>

          {inviteStatus === InviteStatus.PENDING && (
            <div className="flex gap-1 justify-end mt-1">
              <Button
                size="sm"
                className="bg-sky-500 hover:bg-sky-600 text-white text-xs"
                disabled={disableActions}
                onClick={() => setApproveOpen(true)}
              >
                Chấp nhận
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-red-400 text-red-600 hover:bg-red-50"
                disabled={disableActions}
                onClick={() => setRejectOpen(true)}
              >
                Từ chối
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Approve dialog */}
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600">
              Chấp nhận yêu cầu tham gia?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Thành viên sẽ được thêm vào nhóm ngay sau khi bạn xác nhận.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approving}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-sky-500 hover:bg-sky-600 text-white"
              disabled={approving}
              onClick={() => {
                onApprove();
                setApproveOpen(false);
              }}
            >
              {approving ? 'Đang xử lý...' : 'Chấp nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog */}
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600">
              Từ chối yêu cầu tham gia?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Thành viên sẽ không được thêm vào nhóm. Họ có thể gửi yêu cầu lại
              sau này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejecting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={rejecting}
              onClick={() => {
                onReject();
                setRejectOpen(false);
              }}
            >
              {rejecting ? 'Đang xử lý...' : 'Từ chối'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
