import React from 'react';
import { View } from 'react-native';
import { Skeleton } from 'heroui-native/skeleton';

type Props = {
  count?: number;
};

export function SearchLoading({ count = 5 }: Props) {
  return (
    <View className="gap-3 px-5 py-4">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="gap-2">
          <View className="flex-row items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <View className="flex-1 gap-1.5">
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export default React.memo(SearchLoading);
