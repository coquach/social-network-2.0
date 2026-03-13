import { useAuth, useClerk, useUser } from '@clerk/expo';
import { Redirect, Tabs } from 'expo-router';
import { Pressable, Text } from 'react-native';

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
        },
        headerStyle: {
          backgroundColor: '#f8fafc',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          headerRight: () => (
            <Pressable
              className="mr-4 rounded-lg bg-sky-600 px-3 py-2"
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
              onPress={() => void signOut()}
            >
              <Text className="text-xs font-semibold text-white">
                {user ? 'Đăng xuất' : 'Tài khoản'}
              </Text>
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}
