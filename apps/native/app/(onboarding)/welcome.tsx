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
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-4xl font-extrabold tracking-tight text-slate-950">
        Chào mừng đến với Sentimeta
      </Text>
      <Text className="mt-3 text-base leading-6 text-slate-600">
        Kết nối cộng đồng, chia sẻ cảm xúc và bắt đầu hành trình đầu tiên của bạn.
      </Text>
      <Pressable
        className="mt-8 items-center rounded-xl bg-sky-600 px-6 py-3"
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
        onPress={() => void handleContinue()}
      >
        <Text className="font-semibold text-white">Bắt đầu</Text>
      </Pressable>
    </View>
  );
}
