import { useRouter } from 'expo-router';

import { PrimaryButton } from '~/components/ui/app-button';
import { AppCard } from '~/components/ui/app-card';
import { AppScreen } from '~/components/ui/app-screen';
import { AppSubtitle, AppTitle } from '~/components/ui/app-text';
import { setOnboardingSeen } from '~/utils/storage';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleContinue = async () => {
    await setOnboardingSeen();
    router.replace('/(auth)/sign-in');
  };

  return (
    <AppScreen className="justify-center">
      <AppCard className="gap-4">
        <AppTitle>Chào mừng đến với Sentimeta</AppTitle>
        <AppSubtitle>
          Kết nối cộng đồng, chia sẻ cảm xúc và bắt đầu hành trình đầu tiên của bạn.
        </AppSubtitle>
        <PrimaryButton label="Bắt đầu" onPress={() => void handleContinue()} className="mt-4" />
      </AppCard>
    </AppScreen>
  );
}
