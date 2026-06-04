import { useSSO, useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { AuthBrand } from '~/components/auth/auth-brand';
import { AuthCard } from '~/components/auth/auth-card';
import {
  AuthAlert,
  AuthDivider,
  AuthField,
  AuthFooterLink,
  AuthGoogleButton,
  AuthPrimaryButton,
  AuthSecondaryButton,
} from '~/components/auth/auth-primitives';
import { AuthShell } from '~/components/auth/auth-shell';
import {
  createAuthNavigate,
  oauthRedirectUrl,
  resolveAuthError,
  toErrorMessage,
  useWarmUpBrowser,
} from '~/utils/clerk-auth';



export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  useWarmUpBrowser();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const passwordRef = React.useRef<TextInput>(null);

  const isSubmitting = fetchStatus === 'fetching';
  const isBusy = isSubmitting || isGoogleLoading;
  const isPrimaryDisabled = !emailAddress.trim() || !password || isBusy;
  const needsSecondFactor =
    signIn.status === 'needs_second_factor' ||
    signIn.status === 'needs_client_trust';
  const formError = resolveAuthError(localError, errors);

  const reportError = React.useCallback((error: unknown, fallback: string) => {
    setLocalError(toErrorMessage(error, fallback));
  }, []);

  const clearError = React.useCallback(() => {
    setLocalError(null);
  }, []);

  const navigateAfterAuth = React.useMemo(
    () => createAuthNavigate((href) => router.replace(href), setLocalError),
    [router],
  );

  const completeSignIn = React.useCallback(async () => {
    const { error } = await signIn.finalize({
      navigate: navigateAfterAuth,
    });

    if (error) {
      reportError(error, 'Không thể hoàn tất đăng nhập.');
    }
  }, [navigateAfterAuth, reportError, signIn]);

  const requestMfaEmailCode = React.useCallback(async () => {
    const emailCodeFactor = signIn.supportedSecondFactors?.find(
      (factor) => factor.strategy === 'email_code',
    );

    if (!emailCodeFactor) {
      setLocalError(
        'Không tìm thấy phương thức xác minh qua email cho tài khoản này.',
      );
      return;
    }

    const sendCodeResult = await signIn.mfa.sendEmailCode();
    if (sendCodeResult.error) {
      reportError(sendCodeResult.error, 'Không gửi được mã xác minh.');
    }
  }, [reportError, signIn]);

  const handleGoogleSignIn = React.useCallback(async () => {
    if (isBusy) {
      return;
    }

    try {
      clearError();
      setIsGoogleLoading(true);

      const {
        createdSessionId,
        setActive,
        signIn: ssoSignIn,
        signUp: ssoSignUp,
      } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: oauthRedirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({
          session: createdSessionId,
          navigate: navigateAfterAuth,
        });
        return;
      }

      if (
        ssoSignIn?.status === 'needs_second_factor' ||
        ssoSignIn?.status === 'needs_client_trust'
      ) {
        setLocalError(
          'Google yêu cầu xác minh bổ sung. Vui lòng thử lại bằng email và mật khẩu.',
        );
        return;
      }

      if (ssoSignUp && ssoSignUp.status !== 'complete') {
        setLocalError('Đăng nhập Google chưa hoàn tất, vui lòng thử lại.');
        return;
      }

      setLocalError('Đăng nhập Google chưa hoàn tất, vui lòng thử lại.');
    } catch (error) {
      reportError(error, 'Không thể đăng nhập bằng Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [clearError, isBusy, navigateAfterAuth, reportError, startSSOFlow]);

  const handleSubmit = React.useCallback(async () => {
    if (!emailAddress.trim() || !password || isBusy) {
      setLocalError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    clearError();

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      reportError(error, 'Đăng nhập thất bại. Vui lòng thử lại.');
      return;
    }

    if (signIn.status === 'complete') {
      await completeSignIn();
      return;
    }

    if (
      signIn.status === 'needs_second_factor' ||
      signIn.status === 'needs_client_trust'
    ) {
      await requestMfaEmailCode();
      return;
    }

    setLocalError('Đăng nhập chưa hoàn tất. Vui lòng thử lại.');
  }, [
    clearError,
    completeSignIn,
    emailAddress,
    isBusy,
    password,
    reportError,
    requestMfaEmailCode,
    signIn,
  ]);

  const handleVerify = React.useCallback(async () => {
    if (!code.trim() || isBusy) {
      setLocalError('Vui lòng nhập mã xác minh.');
      return;
    }

    clearError();

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
    if (error) {
      reportError(error, 'Mã xác minh không hợp lệ.');
      return;
    }

    if (signIn.status === 'complete') {
      await completeSignIn();
      return;
    }

    setLocalError('Xác minh chưa thành công. Vui lòng thử lại.');
  }, [clearError, code, completeSignIn, isBusy, reportError, signIn]);

  if (needsSecondFactor) {
    return (
      <AuthShell>
        <AuthBrand />
        <AuthCard badge="Xác thực" title="Xác minh tài khoản">
          <AuthField
            label="Mã xác minh"
            value={code}
            placeholder="Nhập mã xác minh"
            keyboardType="numeric"
            onChangeText={setCode}
            error={errors.fields.code?.message}
          />

          <AuthPrimaryButton
            label="Xác minh"
            onPress={() => void handleVerify()}
            disabled={isBusy || !code.trim()}
            loading={isSubmitting}
            className="mt-2"
          />
          <AuthSecondaryButton
            label="Gửi lại mã"
            onPress={() => void requestMfaEmailCode()}
            disabled={isBusy}
          />
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthBrand />
      <AuthCard badge="Đăng nhập" title="Chào mừng trở lại">
        <AuthGoogleButton
          onPress={() => void handleGoogleSignIn()}
          disabled={isBusy}
          loading={isGoogleLoading}
        />
        <AuthDivider />
        <AuthField
          label="Email"
          value={emailAddress}
          placeholder="ban@example.com"
          keyboardType="email-address"
          onChangeText={setEmailAddress}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />
        <AuthField
          ref={passwordRef}
          label="Mật khẩu"
          value={password}
          placeholder="Nhập mật khẩu"
          secureTextEntry
          onChangeText={setPassword}
          returnKeyType="done"
          onSubmitEditing={() => void handleSubmit()}
        />
        <View className="items-end">
          <Link href="/forgot-password" asChild>
            <Text className="text-sm font-semibold text-app-primary dark:text-app-primary-dark">
              Quên mật khẩu?
            </Text>
          </Link>
        </View>
        <AuthAlert message={formError} />
        <AuthPrimaryButton
          label="Đăng nhập"
          onPress={() => void handleSubmit()}
          disabled={isPrimaryDisabled}
          loading={isSubmitting}
          className="mt-2"
        />
        <AuthFooterLink prompt="Bạn chưa có tài khoản?">
          <Link href="/sign-up" asChild>
            <Text className="text-md font-semibold text-app-primary dark:text-app-primary-dark">
              Đăng kí
            </Text>
          </Link>
        </AuthFooterLink>
      </AuthCard>
    </AuthShell>
  );
}
