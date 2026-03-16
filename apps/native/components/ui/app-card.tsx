import React from 'react';
import { View } from 'react-native';

type AppCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppCard({ children, className = '' }: AppCardProps) {
  return (
    <View
      className={`rounded-2xl border border-app-border bg-app-surface p-4 dark:border-app-border-dark dark:bg-app-surface-dark ${className}`}
    >
      {children}
    </View>
  );
}
