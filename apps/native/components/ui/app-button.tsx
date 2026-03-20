import { Button } from 'heroui-native/button';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { cn } from '~/lib/cn';

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
  variant,
  spinnerColor,
}: ButtonProps & {
  variant: 'primary' | 'secondary' | 'outline';
  spinnerColor: string;
}) {
  return (
    <Button variant={variant} className={className} onPress={onPress} isDisabled={disabled}>
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color={spinnerColor} />
          <Button.Label>{label}</Button.Label>
        </View>
      ) : (
        label
      )}
    </Button>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return (
    <AppButtonBase
      {...props}
      className={cn(
        'min-h-12 rounded-2xl',
        props.className,
      )}
      variant="primary"
      spinnerColor="#ffffff"
    />
  );
}

export function SecondaryButton(props: ButtonProps) {
  return (
    <AppButtonBase
      {...props}
      className={cn(
        'min-h-12 rounded-2xl',
        props.className,
      )}
      variant="secondary"
      spinnerColor="#406179"
    />
  );
}
