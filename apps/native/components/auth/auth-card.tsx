import React from 'react';
import { Text, View } from 'react-native';

type AuthCardProps = {
  badge: string;
  title: string;
  children: React.ReactNode;
};

export function AuthCard({ badge, title, children }: AuthCardProps) {
  return (
    <View
      className="overflow-hidden rounded-[32px] border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark"
      style={{ boxShadow: '0 18px 50px rgba(15, 23, 42, 0.10)' }}
    >
      <View className="px-5 py-6">
        <Text className="text-xs text-center font-semibold uppercase tracking-[2px] text-app-primary dark:text-app-primary-dark">
          {badge}
        </Text>
        <Text className="mt-3 text-[32px] text-center font-extrabold leading-[38px] text-app-fg dark:text-app-fg-dark">
          {title}
        </Text>
        <View className="mt-6 gap-1.5">{children}</View>
      </View>
    </View>
  );
}
