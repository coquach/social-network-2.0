import { Dialog } from 'heroui-native/dialog';
import React from 'react';
import { View } from 'react-native';
import { cn } from '~/lib/cn';

type AppModalVariant = 'default' | 'warning' | 'danger' | 'success';

type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  dismissible?: boolean;
  variant?: AppModalVariant;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  footerClassName?: string;
};

const modalVariantStyles: Record<
  AppModalVariant,
  {
    content: string;
    title: string;
    description: string;
  }
> = {
  default: {
    content: 'border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark',
    title: 'text-app-fg dark:text-app-fg-dark',
    description: 'text-app-muted-fg dark:text-app-muted-fg-dark',
  },
  warning: {
    content: 'border-amber-200 bg-app-surface dark:border-amber-500/30 dark:bg-app-surface-dark',
    title: 'text-amber-700 dark:text-amber-300',
    description: 'text-app-muted-fg dark:text-app-muted-fg-dark',
  },
  danger: {
    content: 'border-rose-200 bg-app-surface dark:border-rose-500/30 dark:bg-app-surface-dark',
    title: 'text-rose-600 dark:text-rose-300',
    description: 'text-app-muted-fg dark:text-app-muted-fg-dark',
  },
  success: {
    content: 'border-emerald-200 bg-app-surface dark:border-emerald-500/30 dark:bg-app-surface-dark',
    title: 'text-emerald-700 dark:text-emerald-300',
    description: 'text-app-muted-fg dark:text-app-muted-fg-dark',
  },
};

export function AppModal({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
  variant = 'default',
  contentClassName,
  titleClassName,
  descriptionClassName,
  footerClassName,
}: AppModalProps) {
  const styles = modalVariantStyles[variant];

  return (
    <Dialog isOpen={visible} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="bg-slate-950/40"
          isCloseOnPress={dismissible}
        />
        <Dialog.Content
          className={cn(
            'self-center w-full max-w-md rounded-[28px] border p-5',
            styles.content,
            contentClassName,
          )}
          isSwipeable={false}
        >
          {title ? (
            <Dialog.Title
              className={cn(
                'text-2xl font-extrabold tracking-tight text-center',
                styles.title,
                titleClassName,
              )}
            >
              {title}
            </Dialog.Title>
          ) : null}
          {description ? (
            <Dialog.Description
              className={cn(
                'mt-2 text-sm leading-6',
                styles.description,
                descriptionClassName,
              )}
            >
              {description}
            </Dialog.Description>
          ) : null}
          {children ? <View className="mt-5">{children}</View> : null}
          {footer ? <View className={cn('mt-5 gap-3', footerClassName)}>{footer}</View> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
