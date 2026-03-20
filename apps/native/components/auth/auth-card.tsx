import { Card } from 'heroui-native/card';
import React from 'react';
import { Text, View } from 'react-native';

type AuthCardProps = {
  badge: string;
  title: string;
  children: React.ReactNode;
};

export function AuthCard({ badge, title, children }: AuthCardProps) {
  return (
    <Card
      className="overflow-hidden rounded-[32px] border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark"
      style={{ boxShadow: '0 18px 50px rgba(15, 23, 42, 0.10)' }}
    >
      <Card.Body className="px-5 py-6">
        <Text className="text-xs text-center font-semibold uppercase tracking-[2px] text-app-primary dark:text-app-primary-dark">
          {badge}
        </Text>
        <Card.Title className="mt-3 text-center text-[32px] font-extrabold leading-[38px] text-app-fg dark:text-app-fg-dark">
          {title}
        </Card.Title>
        <View className="mt-6 gap-1.5">{children}</View>
      </Card.Body>
    </Card>
  );
}
