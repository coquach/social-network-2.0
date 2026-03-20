import { Toast, type ToastComponentProps, type ToastVariant } from 'heroui-native/toast';
import React from 'react';
import { View } from 'react-native';

export type AppToastVariant = 'info' | 'success' | 'warning' | 'error';

export type AppToastData = {
  title: string;
  message?: string;
  variant?: AppToastVariant;
};

const variantMap: Record<AppToastVariant, ToastVariant> = {
  info: 'accent',
  success: 'success',
  warning: 'warning',
  error: 'danger',
};

type AppToastProps = {
  toast: AppToastData;
  toastProps: ToastComponentProps;
};

export function AppToast({ toast, toastProps }: AppToastProps) {
  const variant = toast.variant ?? 'info';

  return (
    <Toast
      {...toastProps}
      variant={variantMap[variant]}
      className="rounded-2xl"
    >
      <View className="flex-1 gap-1">
        <Toast.Title>{toast.title}</Toast.Title>
        {toast.message ? (
          <Toast.Description>
            {toast.message}
          </Toast.Description>
        ) : null}
      </View>
      <Toast.Close />
    </Toast>
  );
}
