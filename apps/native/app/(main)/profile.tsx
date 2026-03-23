import { useClerk, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '~/components/ui/app-button';
import { AppCard } from '~/components/ui/app-card';
import { AppModal } from '~/components/ui/app-modal';
import { AppScrollScreen } from '~/components/ui/app-screen';
import { AppEyebrow, AppSubtitle, AppTitle } from '~/components/ui/app-text';

const profileStats = [
  { label: 'Bài viết đã lưu', value: '48', icon: 'bookmark-outline' as const },
  { label: 'Nhóm đang theo dõi', value: '12', icon: 'people-outline' as const },
  { label: 'Thông báo mới', value: '7', icon: 'notifications-outline' as const },
  { label: 'Chuỗi đăng nhập', value: '16 ngày', icon: 'flame-outline' as const },
];

const accountSections = [
  { title: 'Bảo mật', detail: 'Đổi mật khẩu, thiết bị tin cậy và xác thực đa lớp.' },
  { title: 'Thông báo', detail: 'Chọn loại cảnh báo bạn muốn nhận theo thời gian thực.' },
  { title: 'Nội dung đã lưu', detail: 'Xem lại các bài viết, phân tích và nhóm bạn đánh dấu.' },
  { title: 'Quyền riêng tư', detail: 'Kiểm soát hồ sơ công khai và khả năng được tìm thấy.' },
  { title: 'Thiết bị', detail: 'Theo dõi nơi tài khoản đang đăng nhập và phiên còn hoạt động.' },
  { title: 'Trợ giúp', detail: 'Báo lỗi, gửi phản hồi hoặc liên hệ đội hỗ trợ sản phẩm.' },
];

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  async function handleConfirmLogout() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
      setIsLogoutModalOpen(false);
    }
  }

  return (
    <>
      <AppScrollScreen>
        <View className="gap-4 pb-28">
          <AppEyebrow>Cá nhân</AppEyebrow>
          <AppTitle className="text-3xl">Hồ sơ của bạn</AppTitle>
          <AppSubtitle>
            Quản lý phiên đăng nhập, theo dõi danh tính hiển thị và các thiết lập tài khoản
            cốt lõi.
          </AppSubtitle>

          <AppCard className="gap-4">
            <View className="flex-row items-center gap-4">
              <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-app-primary/15 dark:bg-app-primary-dark/20">
                <Ionicons name="person-outline" size={30} color="#0ea5e9" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-app-fg dark:text-app-fg-dark">
                  {user?.fullName ?? 'Sentimeta Member'}
                </Text>
                <Text className="mt-1 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  {user?.primaryEmailAddress?.emailAddress ?? 'Bạn đã đăng nhập thành công'}
                </Text>
              </View>
            </View>

            <PrimaryButton label="Chỉnh sửa hồ sơ" onPress={() => {}} />
            <SecondaryButton label="Đăng xuất" onPress={() => setIsLogoutModalOpen(true)} />
          </AppCard>

          <View className="flex-row flex-wrap gap-3">
            {profileStats.map((item) => (
              <AppCard key={item.label} className="w-[48%] gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-app-primary/10 dark:bg-app-primary-dark/15">
                  <Ionicons name={item.icon} size={20} color="#0ea5e9" />
                </View>
                <Text className="text-xl font-bold text-app-fg dark:text-app-fg-dark">
                  {item.value}
                </Text>
                <Text className="text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  {item.label}
                </Text>
              </AppCard>
            ))}
          </View>

          <AppCard className="gap-3">
            <Text className="text-lg font-bold text-app-fg dark:text-app-fg-dark">
              Khu vực tài khoản
            </Text>
            {accountSections.map((section) => (
              <View
                key={section.title}
                className="rounded-2xl border border-app-border/70 p-4 dark:border-app-border-dark/70"
              >
                <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">
                  {section.title}
                </Text>
                <Text className="mt-2 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  {section.detail}
                </Text>
              </View>
            ))}
          </AppCard>
        </View>
      </AppScrollScreen>

      <AppModal
        visible={isLogoutModalOpen}
        onClose={() => {
          if (!isSigningOut) {
            setIsLogoutModalOpen(false);
          }
        }}
        title="Xác nhận đăng xuất"
        description="Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng tài khoản này."
        dismissible={!isSigningOut}
        footer={
          <>
            <PrimaryButton
              label="Đăng xuất"
              onPress={() => void handleConfirmLogout()}
              loading={isSigningOut}
              disabled={isSigningOut}
            />
            <SecondaryButton
              label="Hủy"
              onPress={() => setIsLogoutModalOpen(false)}
              disabled={isSigningOut}
            />
          </>
        }
      />
    </>
  );
}
