import * as AuthSession from 'expo-auth-session';
import React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const oauthRedirectUrl = AuthSession.makeRedirectUri({
  scheme: 'sentimeta',
  path: 'sso-callback',
});

export const AUTH_PENDING_TASK_MESSAGE =
  'Tài khoản cần hoàn tất bước bảo mật bổ sung trước khi tiếp tục.';

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export const toErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (Array.isArray(error)) {
    const first = error[0] as { message?: unknown } | undefined;
    if (typeof first?.message === 'string' && first.message.length > 0) {
      return first.message;
    }
    return fallback;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.length > 0) {
      return maybeMessage;
    }
  }

  return fallback;
};

type ClerkErrorState = {
  global?: Array<{ message?: string }> | null;
};

type SessionNavigateArgs = {
  session?: { currentTask?: unknown } | null;
};

export const getClerkGlobalError = (errors?: ClerkErrorState): string | null => {
  const firstMessage = errors?.global?.[0]?.message;
  return typeof firstMessage === 'string' && firstMessage.length > 0 ? firstMessage : null;
};

export const resolveAuthError = (localError: string | null, errors?: ClerkErrorState): string | null => {
  return localError ?? getClerkGlobalError(errors);
};

export const createAuthNavigate =
  (
    replace: (href: '/(main)/newfeeds') => void,
    setError: (message: string) => void,
  ) =>
  ({ session }: SessionNavigateArgs) => {
    if (session?.currentTask) {
      setError(AUTH_PENDING_TASK_MESSAGE);
      return;
    }

    replace('/(main)/newfeeds');
  };
