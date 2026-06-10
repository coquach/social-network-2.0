import { useToast } from 'heroui-native/toast';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { JoinRequestResponseDTO } from '@repo/shared/types';

import { AppModal } from '~/components/ui/app-modal';
import { AppToast } from '~/components/ui/app-toast';

type JoinRequestRowProps = {
  request: JoinRequestResponseDTO;
  canManage: boolean;
  approving: boolean;
  rejecting: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export function JoinRequestRow({ request, canManage, approving, rejecting, onApprove, onReject }: JoinRequestRowProps) {
  const { toast } = useToast();
  const [confirmAction, setConfirmAction] = React.useState<'approve' | 'reject' | null>(null);

  const pending = approving || rejecting;

  const showToast = (title: string, message: string, variant: 'success' | 'error' | 'info') => {
    toast.show({      component: (toastProps) => <AppToast toast={{ title, message, variant }} toastProps={toastProps} />,
    });
  };

  const statusLabelMap: Record<string, string> = {
    PENDING: 'Đang chờ',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Đã từ chối',
    CANCELLED: 'Đã hủy',
  };

  return (
    <View className="mb-2 flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <View className="flex-1 flex-row items-center">
        <View className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
          <Image source={{ uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.inviteeId || 'unknown'}` }} className="h-full w-full" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-sm font-bold text-slate-900 dark:text-white" numberOfLines={1}>
            ID: {request.inviteeId ? `${request.inviteeId.substring(0, 8)}...` : 'N/A'}
          </Text>
          <Text className="text-[10px] uppercase text-slate-500">{statusLabelMap[request.status] ?? request.status}</Text>
        </View>
      </View>

      {request.status === 'PENDING' && canManage ? (
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setConfirmAction('approve')}
            disabled={pending}
            className="rounded-xl bg-sky-500 px-3 py-2 disabled:opacity-70"
          >
            <Text className="text-xs font-bold text-white">Duyệt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setConfirmAction('reject')}
            disabled={pending}
            className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800 disabled:opacity-70"
          >
            <Text className="text-xs font-bold text-slate-600 dark:text-slate-400">Bỏ</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <AppModal
        visible={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        variant={confirmAction === 'approve' ? 'success' : 'danger'}
        title={confirmAction === 'approve' ? 'Chấp nhận yêu cầu' : 'Từ chối yêu cầu'}
        description={
          confirmAction === 'approve'
            ? 'Bạn có chắc chắn muốn cho thành viên này vào nhóm?'
            : 'Bạn có chắc chắn muốn từ chối yêu cầu tham gia này?'
        }
        footer={
          <>
            <TouchableOpacity
              onPress={() => setConfirmAction(null)}
              className="h-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              <Text className="font-semibold text-slate-700 dark:text-slate-300">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={pending}
              onPress={() => {
                if (confirmAction === 'approve') {
                  onApprove();
                  showToast('Đã duyệt yêu cầu', 'Thành viên đã được thêm vào nhóm.', 'success');
                } else {
                  onReject();
                  showToast('Đã từ chối yêu cầu', 'Yêu cầu tham gia đã bị từ chối.', 'info');
                }
                setConfirmAction(null);
              }}
              className={`h-11 items-center justify-center rounded-xl disabled:opacity-70 ${
                confirmAction === 'approve' ? 'bg-emerald-600' : 'bg-rose-500'
              }`}
            >
              <Text className="font-semibold text-white">Xác nhận</Text>
            </TouchableOpacity>
          </>
        }
      />
    </View>
  );
}


