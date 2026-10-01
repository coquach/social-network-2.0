import { Ionicons } from '@expo/vector-icons';
import { FieldError } from 'heroui-native/field-error';
import { Input } from 'heroui-native/input';
import { Label } from 'heroui-native/label';
import { TextField } from 'heroui-native/text-field';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { cn } from '~/lib/cn';

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  error?: string;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  autoFocus?: boolean;
};

export const AuthField = React.forwardRef<any, AuthFieldProps>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      keyboardType = 'default',
      autoCapitalize = 'none',
      secureTextEntry = false,
      error,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit,
      autoFocus,
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const isPasswordField = secureTextEntry;
    const isInvalid = Boolean(error);

    return (
      <TextField isInvalid={isInvalid} className="gap-1.5">
        <Label>
          <Label.Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">
            {label}
          </Label.Text>
        </Label>
        <View className="relative">
          <Input
            ref={ref}
            variant="secondary"
            className={cn(
              'rounded-2xl border border-app-border bg-app-bg/70 px-4 py-3.5 text-base text-app-fg focus:border-app-primary dark:border-app-border-dark dark:bg-app-bg-dark/60 dark:text-app-fg-dark dark:focus:border-app-primary-dark',
              isPasswordField && 'pr-14',
            )}
            value={value}
            autoCapitalize={autoCapitalize}
            placeholder={placeholder}
            placeholderTextColor="#64748b"
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            secureTextEntry={isPasswordField && !isPasswordVisible}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={blurOnSubmit}
            autoFocus={autoFocus}
          />
          {isPasswordField ? (
            <Pressable
              className="absolute bottom-0 right-3 top-0 items-center justify-center rounded-full px-2 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={
                isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
              }
              onPress={() => setIsPasswordVisible((current) => !current)}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#0ea5e9"
              />
            </Pressable>
          ) : null}
        </View>
        <FieldError isInvalid={isInvalid} className="min-h-5">
          {error}
        </FieldError>
      </TextField>
    );
  },
);

type AuthErrorTextProps = {
  message?: string | null;
};

export function AuthErrorText({ message }: AuthErrorTextProps) {
  if (!message) {
    return null;
  }

  return (
    <Text
      selectable
      className="text-xs leading-5 text-red-600 dark:text-red-400"
    >
      {message}
    </Text>
  );
}

type AuthAlertProps = {
  message?: string | null;
};

export function AuthAlert({ message }: AuthAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <View className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10">
      <Text
        selectable
        className="text-sm leading-6 text-red-700 dark:text-red-200"
      >
        {message}
      </Text>
    </View>
  );
}

type AuthPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function AuthPrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  className = '',
}: AuthPrimaryButtonProps) {
  return (
    <Pressable
      className={`items-center rounded-2xl bg-app-primary px-6 py-3.5 active:opacity-80 disabled:opacity-50 dark:bg-app-primary-dark ${className}`}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text className="font-semibold text-app-primary-fg dark:text-app-primary-fg-dark">
          {label}
        </Text>
      )}
    </Pressable>
  );

}

type AuthSecondaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function AuthSecondaryButton({
  label,
  onPress,
  disabled = false,
}: AuthSecondaryButtonProps) {
  return (
    <Pressable
      className="items-center rounded-2xl border border-app-border px-6 py-3.5 active:opacity-80 disabled:opacity-50 dark:border-app-border-dark"
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="font-semibold text-app-primary dark:text-app-primary-dark">
        {label}
      </Text>
    </Pressable>
  );
}

type AuthGoogleButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function AuthGoogleButton({
  onPress,
  disabled = false,
  loading = false,
}: AuthGoogleButtonProps) {
  return (
    <Pressable
      className="flex-row items-center justify-center rounded-2xl border border-app-border bg-app-bg/70 px-4 py-3.5 active:opacity-80 disabled:opacity-50 dark:border-app-border-dark dark:bg-app-bg-dark/60"
      onPress={onPress}
      disabled={disabled}
    >
      <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-app-primary/15 dark:bg-app-primary-dark/15">
        <Text className="font-bold text-app-primary dark:text-app-primary-dark">
          G
        </Text>
      </View>
      <Text className="font-semibold text-app-primary dark:text-app-primary-dark">
        {loading ? 'Đang kết nối Google...' : 'Tiếp tục với Google'}
      </Text>
    </Pressable>
  );
}

export function AuthDivider() {
  return (
    <View className="my-3 flex-row items-center">
      <View className="h-px flex-1 bg-app-border dark:bg-app-border-dark" />
      <Text className="mx-3 text-xs uppercase tracking-widest text-app-muted-fg dark:text-app-muted-fg-dark">
        hoặc
      </Text>
      <View className="h-px flex-1 bg-app-border dark:bg-app-border-dark" />
    </View>
  );
}

type AuthFooterLinkProps = {
  prompt: string;
  children: React.ReactNode;
};

export function AuthFooterLink({ prompt, children }: AuthFooterLinkProps) {
  return (
    <View className="mt-2 flex-row items-center justify-center gap-1">
      <Text className="text-md text-app-muted-fg dark:text-app-muted-fg-dark">
        {prompt}
      </Text>
      {children}
    </View>
  );
}

type AuthFeatureChipsProps = {
  items: string[];
};

export function AuthFeatureChips({ items }: AuthFeatureChipsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View className="flex-row flex-wrap justify-center gap-2">
      {items.map((item) => (
        <View
          key={item}
          className="rounded-full border border-app-border bg-app-surface px-3 py-1.5 dark:border-app-border-dark dark:bg-app-surface-dark"
        >
          <Text className="text-xs font-semibold text-app-muted-fg dark:text-app-muted-fg-dark">
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}
