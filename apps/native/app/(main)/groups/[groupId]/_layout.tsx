import { Stack } from "expo-router";
import { View } from "react-native";

export default function GroupsLayout() {
    return (
        // Quan trọng: View bao ngoài layout phải có flex: 1 
        // để không bị co độ cao về 0px
        <View style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'white' }
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="[groupId]/index" />
            </Stack>
        </View>
    );
}