import { Card } from 'heroui-native/card';
import React from 'react';
import { Pressable, View } from 'react-native';
import { cn } from '~/lib/cn';

type AppCardProps = {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
};

export function AppCard({ children, className = '', onPress }: AppCardProps) {
  const content = (
    <Card 
      className={cn('rounded-2xl border border-app-border bg-app-surface p-4 dark:border-app-border-dark dark:bg-app-surface-dark', className)}
    >
      {children}
    </Card>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        <Card className={cn('rounded-2xl border border-app-border bg-app-surface p-4 dark:border-app-border-dark dark:bg-app-surface-dark', className)}>
          {children}
        </Card>
      </Pressable>
    );
  }

  return content;
}
