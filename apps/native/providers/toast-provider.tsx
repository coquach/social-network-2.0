import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppToast, type AppToastData } from '~/components/ui/app-toast';

type ToastContextValue = {
  showToast: (toast: AppToastData & { durationMs?: number }) => void;
  hideToast: () => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: React.ReactNode;
};

type ActiveToast = AppToastData & {
  durationMs: number;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = React.useState<ActiveToast | null>(null);

  React.useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = setTimeout(() => {
      setToast(null);
    }, toast.durationMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [toast]);

  const hideToast = React.useCallback(() => {
    setToast(null);
  }, []);

  const showToast = React.useCallback((nextToast: AppToastData & { durationMs?: number }) => {
    setToast({
      title: nextToast.title,
      message: nextToast.message,
      variant: nextToast.variant ?? 'info',
      durationMs: nextToast.durationMs ?? 2800,
    });
  }, []);

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
      {toast ? (
        <View
          pointerEvents="box-none"
          className="absolute left-4 right-4"
          style={{ top: Math.max(insets.top, 12) + 8 }}
        >
          <Pressable onPress={hideToast}>
            <AppToast toast={toast} />
          </Pressable>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
