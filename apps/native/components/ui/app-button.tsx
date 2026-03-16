import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

function AppButtonBase({
  label,
  onPress,
  disabled = false,
  loading = false,
  className = '',
  textClassName,
  spinnerColor,
}: ButtonProps & { textClassName: string; spinnerColor: string }) {
  return (
    <Pressable className={className} onPress={onPress} disabled={disabled}>
      {loading ? <ActivityIndicator size="small" color={spinnerColor} /> : <Text className={textClassName}>{label}</Text>}
    </Pressable>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return (
    <AppButtonBase
      {...props}
      className={`items-center rounded-2xl bg-app-primary px-6 py-3.5 active:opacity-80 disabled:opacity-50 dark:bg-app-primary-dark ${props.className ?? ''}`}
      textClassName="font-semibold text-app-primary-fg dark:text-app-primary-fg-dark"
      spinnerColor="#ffffff"
    />
  );
}

export function SecondaryButton(props: ButtonProps) {
  return (
    <AppButtonBase
      {...props}
      className={`items-center rounded-2xl border border-app-border bg-app-surface-elevated px-6 py-3.5 active:opacity-80 disabled:opacity-50 dark:border-app-border-dark dark:bg-app-surface-elevated-dark ${props.className ?? ''}`}
      textClassName="font-semibold text-app-fg dark:text-app-fg-dark"
      spinnerColor="#406179"
    />
  );
}
