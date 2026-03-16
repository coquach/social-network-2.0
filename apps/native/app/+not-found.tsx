import { View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';


export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Link href="/" className='text-blue-500 text-lg' >
          Go back to Home screen!
        </Link> 
      </View>
    </>
  );
}
