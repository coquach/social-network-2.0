import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { cn } from '~/lib/cn';

type Props = {
  title: string;
  onSeeAll?: () => void;
  className?: string;
};

export function SearchSectionHeader({
  title,
  onSeeAll,
  className = '',
}: Props) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between px-1 py-2',
        className,
      )}
    >
      <Text className="text-sm font-semibold text-app-muted-fg dark:text-app-muted-fg-dark">
        {title}
      </Text>

      {onSeeAll ? (
        <Pressable onPress={onSeeAll} className="rounded-full px-2 py-1">
          <Text className="text-sm font-medium text-app-primary">
            Xem tất cả
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default React.memo(SearchSectionHeader);
