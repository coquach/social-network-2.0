import { Button } from 'heroui-native/button';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { appThemeColors } from '~/constants/theme';
import { cn } from '~/lib/cn';

type ButtonProps = {
  label?: string;
  children?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  labelClassName?: string;
  hasShadow?: boolean;
};

const shadowStyle = {
  shadowColor: appThemeColors.dark.background,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 4,
}

function AppButtonBase({
  label,
  children,
  onPress,
  disabled = false,
  loading = false,
  className = '',
  labelClassName = '',
  variant,
  spinnerColor,
  hasShadow = false,
}: ButtonProps & {
  variant?: React.ComponentProps<typeof Button>['variant'];
  spinnerColor: string;
}) {
  return (
    <Button variant={variant} className={className} onPress={onPress} isDisabled={disabled || loading}
      style={hasShadow ? shadowStyle : undefined}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color={spinnerColor} />
          {label ? <Button.Label className={labelClassName}>{label}</Button.Label> : children}
        </View>
      ) : (
        label ? <Button.Label className={labelClassName}>{label}</Button.Label> : children
      )}
    </Button>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return (
    <AppButtonBase
      {...props}
      className={cn(
        'min-h-12 rounded-2xl bg-app-primary dark:bg-app-primary-dark',
        props.className,
      )}
      labelClassName="text-white dark:text-white"
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
        'min-h-12 rounded-2xl border border-app-border bg-app-surface-elevated dark:border-app-border-dark dark:bg-app-surface-elevated-dark',
        props.className,
      )}
      variant="secondary"
      spinnerColor="#406179"
    />
  );
}

export function OutlineButton(props: ButtonProps) {
  return (
    <AppButtonBase
      {...props}
      className={cn(
        'min-h-12 rounded-2xl border border-app-border bg-transparent dark:border-app-border-dark',
        props.className,
      )}
      variant="outline"
      spinnerColor="#406179"
    />
  );
}

export function GhostButton(props: ButtonProps) {
  return (
    <AppButtonBase
      {...props}
      className={cn(
        'min-h-10 rounded-xl px-4',
        props.className,
      )}
      variant="ghost"
      spinnerColor="#406179"
    />
  );
}
