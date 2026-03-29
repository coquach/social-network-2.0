import { useAuth, useSSO, useSignUp } from '@clerk/expo';
import { Link, Redirect, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

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

const SIGN_UP_HIGHLIGHTS = [
  'Khởi tạo nhanh',
  'Xác minh email',
  'Sẵn sàng cho 2FA',
];

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useWarmUpBrowser();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const isFinalizingRef = React.useRef(false);

  const isSubmitting = fetchStatus === 'fetching';
  const isBusy = isSubmitting || isGoogleLoading;
  const isPrimaryDisabled =
    !firstName.trim() ||
    !lastName.trim() ||
    !emailAddress.trim() ||
    !password ||
    isBusy;
  const needsEmailVerification =
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0;
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

  const completeSignUp = React.useCallback(async () => {
    if (isFinalizingRef.current) {
      return;
    }

    isFinalizingRef.current = true;

    const { error } = await signUp.finalize({
      navigate: navigateAfterAuth,
    });

    if (error) {
      isFinalizingRef.current = false;
      reportError(error, 'Không thể hoàn tất đăng ký.');
      return;
    }

    isFinalizingRef.current = false;
  }, [navigateAfterAuth, reportError, signUp]);

  React.useEffect(() => {
    if (signUp.status === 'complete' && !isSignedIn) {
      void completeSignUp();
    }
  }, [completeSignUp, isSignedIn, signUp.status]);

  const requestVerificationEmail = React.useCallback(async () => {
    const sendCodeResult = await signUp.verifications.sendEmailCode();
    if (sendCodeResult.error) {
      reportError(sendCodeResult.error, 'Không gửi được mã xác minh.');
    }
  }, [reportError, signUp]);

  const handleGoogleSignUp = React.useCallback(async () => {
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
        setLocalError('Đăng ký Google chưa hoàn tất, vui lòng thử lại.');
        return;
      }

      setLocalError('Đăng ký Google chưa hoàn tất, vui lòng thử lại.');
    } catch (error) {
      reportError(error, 'Không thể đăng ký bằng Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [clearError, isBusy, navigateAfterAuth, reportError, startSSOFlow]);

  const handleSubmit = React.useCallback(async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setLocalError('Vui lòng nhập đầy đủ họ và tên.');
      return;
    }

    if (!emailAddress.trim() || !password || isBusy) {
      setLocalError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    clearError();

    const { error } = await signUp.password({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      reportError(error, 'Đăng ký thất bại. Vui lòng thử lại.');
      return;
    }

    if (signUp.status === 'complete') {
      await completeSignUp();
      return;
    }

    if (
      signUp.status === 'missing_requirements' &&
      signUp.unverifiedFields.includes('email_address')
    ) {
      await requestVerificationEmail();
      return;
    }

    if (signUp.missingFields.length > 0) {
      setLocalError(`Cần bổ sung: ${signUp.missingFields.join(', ')}`);
      return;
    }

    setLocalError('Đăng ký chưa hoàn tất. Vui lòng thử lại.');
  }, [
    clearError,
    completeSignUp,
    emailAddress,
    firstName,
    isBusy,
    lastName,
    password,
    reportError,
    requestVerificationEmail,
    signUp,
  ]);

  const handleVerify = React.useCallback(async () => {
    if (!code.trim() || isBusy) {
      setLocalError('Vui lòng nhập mã xác minh.');
      return;
    }

    clearError();

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });
    if (error) {
      reportError(error, 'Mã xác minh không hợp lệ.');
      return;
    }

    if (signUp.status === 'complete') {
      await completeSignUp();
      return;
    }

    setLocalError('Xác minh chưa thành công. Vui lòng thử lại.');
  }, [clearError, code, completeSignUp, isBusy, reportError, signUp]);

  if (isSignedIn) {
    return <Redirect href="/(main)/newfeeds" />;
  }

  if (signUp.status === 'complete' && !localError) {
    return (
      <AuthShell>
        <AuthBrand />
        <AuthCard badge="Đang xử lý" title="Hoàn tất đăng ký">
          <View className="items-center gap-4 rounded-2xl border border-app-border bg-app-bg/70 px-4 py-5 dark:border-app-border-dark dark:bg-app-bg-dark/60">
            <ActivityIndicator size="small" color="#0284c7" />
            <Text className="text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
              Đang hoàn tất đăng ký...
            </Text>
          </View>
        </AuthCard>
      </AuthShell>
    );
  }

  if (signUp.status === 'complete' && localError) {
    return (
      <AuthShell>
        <AuthBrand />
        <AuthCard badge="Xác thực" title="Hoàn tất đăng ký">
          <AuthAlert message={localError} />
          <AuthPrimaryButton
            label="Thử hoàn tất lại"
            onPress={() => void completeSignUp()}
            disabled={isSubmitting}
            loading={isSubmitting}
            className="mt-2"
          />
        </AuthCard>
      </AuthShell>
    );
  }

  if (needsEmailVerification) {
    return (
      <AuthShell>
        <AuthBrand />
        <AuthCard badge="Xác thực" title="Xác minh email">
          <AuthField
            label="Mã xác minh"
            value={code}
            placeholder="Nhập mã xác minh"
            keyboardType="numeric"
            onChangeText={setCode}
            error={errors.fields.code?.message}
          />
          <AuthAlert message={formError} />
          <AuthPrimaryButton
            label="Xác minh"
            onPress={() => void handleVerify()}
            disabled={isBusy || !code.trim()}
            loading={isSubmitting}
            className="mt-2"
          />
          <AuthSecondaryButton
            label="Gửi lại mã"
            onPress={() => void requestVerificationEmail()}
            disabled={isBusy}
          />
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthBrand />
      <AuthCard badge="Đăng ký" title="Tạo tài khoản mới">
        <AuthGoogleButton
          onPress={() => void handleGoogleSignUp()}
          disabled={isBusy}
          loading={isGoogleLoading}
        />
        <AuthDivider />
        <AuthField
          label="Họ"
          value={lastName}
          placeholder="Nguyễn"
          autoCapitalize="words"
          onChangeText={setLastName}
        
        />
        <AuthField
          label="Tên"
          value={firstName}
          placeholder="An"
          autoCapitalize="words"
          onChangeText={setFirstName}
         
        />
        <AuthField
          label="Email"
          value={emailAddress}
          placeholder="ban@example.com"
          keyboardType="email-address"
          onChangeText={setEmailAddress}
        />
        <AuthField
          label="Mật khẩu"
          value={password}
          placeholder="Tạo mật khẩu"
          secureTextEntry
          onChangeText={setPassword}
        />
        <AuthAlert message={formError} />
        <AuthPrimaryButton
          label="Đăng ký"
          onPress={() => void handleSubmit()}
          disabled={isPrimaryDisabled}
          loading={isSubmitting}
          className="mt-2"
        />
        <AuthFooterLink prompt="Bạn đã có tài khoản?">
          <Link href="/sign-in" asChild>
            <Text className="text-md font-semibold text-app-primary dark:text-app-primary-dark">
              Đăng nhập
            </Text>
          </Link>
        </AuthFooterLink>
        <View nativeID="clerk-captcha" />
      </AuthCard>
    </AuthShell>
  );
}
