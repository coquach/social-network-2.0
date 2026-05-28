import { Stack, useSegments } from 'expo-router';
import { useEffect } from 'react';

export default function GroupsLayout() {
    const segments = useSegments();

    useEffect(() => {
        console.log('Vị trí hiện tại của Router:', segments);
    }, [segments]);
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="create" options={{ title: 'Tạo nhóm mới' }} />
            {/* Sửa lại đúng tên "[groupId]" thay vì "[groupId]/index" */}
            <Stack.Screen name="[groupId]" options={{ headerShown: false }} />
        </Stack>
    );
}