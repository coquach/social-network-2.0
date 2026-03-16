import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';

import { AppCard } from '~/components/ui/app-card';
import { AppCenteredScreen } from '~/components/ui/app-screen';
import { AppSubtitle, AppTitle } from '~/components/ui/app-text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <AppCenteredScreen>
        <AppCard className="w-full max-w-sm items-center gap-4">
          <AppTitle className="text-center text-3xl">Không tìm thấy trang</AppTitle>
          <AppSubtitle className="text-center">
            Route này không tồn tại hoặc đã được thay đổi.
          </AppSubtitle>
          <Link href="/" asChild>
            <Text className="text-base font-semibold text-app-primary dark:text-app-primary-dark">
              Quay lại màn hình chính
            </Text>
          </Link>
        </AppCard>
      </AppCenteredScreen>
    </>
  );
}
