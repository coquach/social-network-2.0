import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { setOnboardingSeen } from '~/utils/storage';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleContinue = async () => {
    await setOnboardingSeen();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View className="flex-1 justify-center bg-app-bg px-6 dark:bg-app-bg-dark">
      <Text className="text-4xl font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
        Chào mừng đến với Sentimeta
      </Text>
      <Text className="mt-3 text-base leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
        Kết nối cộng đồng, chia sẻ cảm xúc và bắt đầu hành trình đầu tiên của bạn.
      </Text>
      <Pressable
        className="mt-8 items-center rounded-xl bg-app-primary px-6 py-3 active:opacity-80 dark:bg-app-primary-dark"
        onPress={() => void handleContinue()}
      >
        <Text className="font-semibold text-app-primary-fg dark:text-app-primary-fg-dark">Bắt đầu</Text>
      </Pressable>
    </View>
  );
}

