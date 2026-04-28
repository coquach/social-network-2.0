import { useGroupSettings, useUpdateGroupSettings } from '@repo/shared/hooks';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function GroupSettingsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { data, isLoading, isError, error, refetch } = useGroupSettings(groupId ?? '');
  const { mutateAsync: updateSettings, isPending } = useUpdateGroupSettings();

  const [allowMemberInvite, setAllowMemberInvite] = React.useState(false);
  const [requiredPostApproval, setRequiredPostApproval] = React.useState(false);
  const [requireAdminApprovalToJoin, setRequireAdminApprovalToJoin] = React.useState(false);

  React.useEffect(() => {
    if (!data) return;
    setAllowMemberInvite(data.allowMemberInvite);
    setRequiredPostApproval(data.requiredPostApproval);
    setRequireAdminApprovalToJoin(data.requireAdminApprovalToJoin);
  }, [data]);

  const onSave = React.useCallback(async () => {
    if (!groupId) return;
    await updateSettings({
      groupId,
      input: {
        allowMemberInvite,
        requiredPostApproval,
        requireAdminApprovalToJoin,
      },
    });
  }, [allowMemberInvite, groupId, requireAdminApprovalToJoin, requiredPostApproval, updateSettings]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg dark:bg-app-bg-dark">
        <ActivityIndicator size="small" color="#0ea5e9" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg px-6 dark:bg-app-bg-dark">
        <Text className="text-center text-sm text-red-500">
          {error instanceof Error ? error.message : 'Không thể tải cài đặt nhóm.'}
        </Text>
        <TouchableOpacity onPress={() => void refetch()} className="mt-3 rounded-xl bg-app-primary px-4 py-2">
          <Text className="font-semibold text-white">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rowClass = 'mb-2 flex-row items-center justify-between rounded-2xl bg-app-surface px-4 py-3 dark:bg-app-surface-dark';

  return (
    <View className="flex-1 bg-app-bg px-4 pt-4 dark:bg-app-bg-dark">
      <View className={rowClass}>
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">Thành viên được mời người khác</Text>
        </View>
        <Switch value={allowMemberInvite} onValueChange={setAllowMemberInvite} />
      </View>

      <View className={rowClass}>
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">Bài viết cần duyệt</Text>
        </View>
        <Switch value={requiredPostApproval} onValueChange={setRequiredPostApproval} />
      </View>

      <View className={rowClass}>
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">Tham gia cần admin duyệt</Text>
        </View>
        <Switch value={requireAdminApprovalToJoin} onValueChange={setRequireAdminApprovalToJoin} />
      </View>

      <TouchableOpacity
        disabled={isPending}
        onPress={() => void onSave()}
        className="mt-4 items-center rounded-2xl bg-app-primary py-3 disabled:opacity-60"
      >
        <Text className="font-semibold text-white">{isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
      </TouchableOpacity>
    </View>
  );
}
