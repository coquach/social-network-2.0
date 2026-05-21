import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  message?: string;
  icon?: string;
};

export function EmptySearchState({ message = 'Không có kết quả' }: Props) {
  return (
    <View className="flex-1 items-center justify-start pt-8">
      <View className="items-center gap-3">
        <View className="h-20 w-20 rounded-full bg-app-border dark:bg-app-border-dark" />
        <Text className="text-lg font-semibold text-app-fg dark:text-app-fg-dark">
          {message}
        </Text>
      </View>
    </View>
  );
}

export default EmptySearchState;
