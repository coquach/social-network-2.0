import { Stack } from 'expo-router';

export default function GroupDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Chi tiết nhóm' }} />
      <Stack.Screen name="members" options={{ title: 'Thành viên' }} />
      <Stack.Screen name="requests" options={{ title: 'Yêu cầu tham gia' }} />
      <Stack.Screen name="logs" options={{ title: 'Nhật ký hoạt động' }} />
      <Stack.Screen name="settings" options={{ title: 'Cài đặt nhóm' }} />
    </Stack>
  );
}
