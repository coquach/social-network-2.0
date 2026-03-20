import {
  ToastProvider as HeroToastProvider,
  useToast as useHeroToast,
} from 'heroui-native/toast';
import React from 'react';

import { AppToast, type AppToastData } from '~/components/ui/app-toast';

type ToastContextValue = {
  showToast: (toast: AppToastData & { durationMs?: number }) => void;
  hideToast: () => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: React.ReactNode;
};

function ToastContextBridge({ children }: ToastProviderProps) {
  const { toast } = useHeroToast();

  const hideToast = React.useCallback(() => {
    toast.hide();
  }, [toast]);

  const showToast = React.useCallback(
    (nextToast: AppToastData & { durationMs?: number }) => {
      const { durationMs = 2800, ...toastData } = nextToast;

      toast.show({
        duration: durationMs,
        component: (toastProps) => (
          <AppToast toast={toastData} toastProps={toastProps} />
        ),
      });
    },
    [toast],
  );

  const value = React.useMemo<ToastContextValue>(
    () => ({
      showToast,
      hideToast,
    }),
    [hideToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <HeroToastProvider
      defaultProps={{ placement: 'top', isSwipeable: true }}
      insets={{ top: 8, left: 16, right: 16 }}
      maxVisibleToasts={3}
    >
      <ToastContextBridge>{children}</ToastContextBridge>
    </HeroToastProvider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
