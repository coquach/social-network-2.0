import React from 'react';
import { Text } from 'react-native';
import { cn } from '~/lib/cn';

type TextProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppTitle({ children, className = '' }: TextProps) {
  return (
    <Text
      className={cn(
        'text-4xl font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark',
        className,
      )}
    >
      {children}
    </Text>
  );
}

export function AppSubtitle({ children, className = '' }: TextProps) {
  return (
    <Text
      className={cn(
        'text-base leading-6 text-app-muted-fg dark:text-app-muted-fg-dark',
        className,
      )}
    >
      {children}
    </Text>
  );
}

export function AppEyebrow({ children, className = '' }: TextProps) {
  return (
    <Text
      className={cn(
        'text-xs font-semibold uppercase tracking-[2px] text-app-muted-fg dark:text-app-muted-fg-dark',
        className,
      )}
    >
      {children}
    </Text>
  );
}
