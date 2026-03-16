import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View className="flex-1 items-center justify-center bg-app-bg px-6 dark:bg-app-bg-dark">
        <Link href="/" asChild>
          <Text className="text-lg font-semibold text-app-primary dark:text-app-primary-dark">
            Quay lại màn hình chính
          </Text>
        </Link>
      </View>
    </>
  );
}

