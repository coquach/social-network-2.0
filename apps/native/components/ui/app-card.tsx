import { Card } from 'heroui-native/card';
import React from 'react';
import { cn } from '~/lib/cn';

type AppCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppCard({ children, className = '' }: AppCardProps) {
  return (
    <Card className={cn('rounded-2xl border border-app-border bg-app-surface p-4 dark:border-app-border-dark dark:bg-app-surface-dark', className)}>
      {children}
    </Card>
  );
}
