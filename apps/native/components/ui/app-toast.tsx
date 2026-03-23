import { Ionicons } from '@expo/vector-icons';
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

const toastStyles: Record<
  AppToastVariant,
  {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
    iconWrapClassName: string;
    rootClassName: string;
    titleClassName: string;
    descriptionClassName: string;
    closeClassName: string;
  }
> = {
  info: {
    icon: 'sparkles',
    iconColor: '#0284c7',
    iconWrapClassName: 'bg-sky-500/18',
    rootClassName:
      'rounded-[28px] border border-sky-200/90 bg-sky-50/98 shadow-overlay dark:border-sky-400/20 dark:bg-sky-950/88',
    titleClassName: 'text-sky-950 dark:text-sky-100',
    descriptionClassName: 'text-sky-800/90 dark:text-sky-200/85',
    closeClassName: 'bg-sky-500/10 dark:bg-sky-400/10',
  },
  success: {
    icon: 'checkmark-circle',
    iconColor: '#16a34a',
    iconWrapClassName: 'bg-emerald-500/18',
    rootClassName:
      'rounded-[28px] border border-emerald-200/90 bg-emerald-50/98 shadow-overlay dark:border-emerald-400/20 dark:bg-emerald-950/88',
    titleClassName: 'text-emerald-950 dark:text-emerald-100',
    descriptionClassName: 'text-emerald-800/90 dark:text-emerald-200/85',
    closeClassName: 'bg-emerald-500/10 dark:bg-emerald-400/10',
  },
  warning: {
    icon: 'sunny',
    iconColor: '#d97706',
    iconWrapClassName: 'bg-amber-500/18',
    rootClassName:
      'rounded-[28px] border border-amber-200/90 bg-amber-50/98 shadow-overlay dark:border-amber-400/20 dark:bg-amber-950/88',
    titleClassName: 'text-amber-950 dark:text-amber-100',
    descriptionClassName: 'text-amber-800/90 dark:text-amber-200/85',
    closeClassName: 'bg-amber-500/10 dark:bg-amber-400/10',
  },
  error: {
    icon: 'alert-circle',
    iconColor: '#dc2626',
    iconWrapClassName: 'bg-rose-500/18',
    rootClassName:
      'rounded-[28px] border border-rose-200/90 bg-rose-50/98 shadow-overlay dark:border-rose-400/20 dark:bg-rose-950/88',
    titleClassName: 'text-rose-950 dark:text-rose-100',
    descriptionClassName: 'text-rose-800/90 dark:text-rose-200/85',
    closeClassName: 'bg-rose-500/10 dark:bg-rose-400/10',
  },
};

type AppToastProps = {
  toast: AppToastData;
  toastProps: ToastComponentProps;
};

export function AppToast({ toast, toastProps }: AppToastProps) {
  const variant = toast.variant ?? 'info';
  const style = toastStyles[variant];

  return (
    <Toast
      {...toastProps}
      variant={variantMap[variant]}
      className={`flex-row items-start gap-3 ${style.rootClassName}`}
    >
      <View
        className={`mt-0.5 h-11 w-11 items-center justify-center rounded-2xl ${style.iconWrapClassName}`}
      >
        <Ionicons name={style.icon} size={20} color={style.iconColor} />
      </View>

      <View className="flex-1 gap-1 pr-1">
        <Toast.Title className={`text-base font-bold ${style.titleClassName}`}>
          {toast.title}
        </Toast.Title>
        {toast.message ? (
          <Toast.Description className={`text-sm leading-5 ${style.descriptionClassName}`}>
            {toast.message}
          </Toast.Description>
        ) : null}
      </View>

      <Toast.Close
        className={`mt-0.5 ${style.closeClassName}`}
        iconProps={{ color: style.iconColor, size: 16 }}
      />
    </Toast>
  );
}
