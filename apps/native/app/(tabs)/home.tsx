import { useUser } from '@clerk/expo';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  const { user } = useUser();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-3xl font-extrabold tracking-tight text-slate-950">
        Xin chào
      </Text>
      <Text className="text-center text-base text-slate-600">
        {user?.primaryEmailAddress?.emailAddress ?? 'Bạn đã đăng nhập bằng Clerk'}
      </Text>
    </View>
  );
}
