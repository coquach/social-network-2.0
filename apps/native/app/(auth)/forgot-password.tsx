import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { AuthBrand } from '~/components/auth/auth-brand';
import { AuthCard } from '~/components/auth/auth-card';
import {
  AuthAlert,
  AuthField,
  AuthFooterLink,
  AuthPrimaryButton,
  AuthSecondaryButton,
} from '~/components/auth/auth-primitives';
import { AuthShell } from '~/components/auth/auth-shell';
import {
  createAuthNavigate,
  resolveAuthError,
  toErrorMessage,
} from '~/utils/clerk-auth';

type ForgotPasswordStep = 'request' | 'verify' | 'reset';

export default function ForgotPasswordScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [code, setCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<ForgotPasswordStep>('request');

  const isBusy = fetchStatus === 'fetching';
  const formError = resolveAuthError(localError, errors);

  React.useEffect(() => {
    void signIn.reset();
  }, []);

  React.useEffect(() => {
    if (signIn.status === 'needs_new_password') {
      setStep('reset');
    }
  }, [signIn.status]);

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

  const handleSendCode = React.useCallback(async () => {
    if (!emailAddress.trim() || isBusy) {
      setLocalError('Vui lòng nhập email để khởi tạo khôi phục mật khẩu.');
      return;
    }

    clearError();

    const createResult = await signIn.create({
      identifier: emailAddress.trim(),
    });

    if (createResult.error) {
      reportError(createResult.error, 'Không thể khởi tạo khôi phục mật khẩu.');
      return;
    }

    const sendCodeResult = await signIn.resetPasswordEmailCode.sendCode();
    if (sendCodeResult.error) {
      reportError(sendCodeResult.error, 'Không gửi được mã khôi phục.');
      return;
    }

    setStep('verify');
  }, [clearError, emailAddress, isBusy, reportError, signIn]);

  const handleVerifyCode = React.useCallback(async () => {
    if (!code.trim() || isBusy) {
      setLocalError('Vui lòng nhập mã khôi phục được gửi qua email.');
      return;
    }

    clearError();

    const verifyCodeResult = await signIn.resetPasswordEmailCode.verifyCode({
      code: code.trim(),
    });

    if (verifyCodeResult.error) {
      reportError(verifyCodeResult.error, 'Mã khôi phục không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (signIn.status === 'needs_new_password') {
      setStep('reset');
      return;
    }

    setLocalError('Xác minh mã chưa thành công. Vui lòng thử lại.');
  }, [clearError, code, isBusy, reportError, signIn]);

  const handleSubmitNewPassword = React.useCallback(async () => {
    if (!newPassword || !confirmPassword || isBusy) {
      setLocalError('Vui lòng nhập đầy đủ mật khẩu mới.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp.');
      return;
    }

    clearError();

    const submitPasswordResult = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: true,
    });

    if (submitPasswordResult.error) {
      reportError(submitPasswordResult.error, 'Không thể hoàn tất đổi mật khẩu.');
      return;
    }

    if (signIn.status !== 'complete') {
      setLocalError('Khôi phục mật khẩu chưa hoàn tất. Vui lòng thử lại.');
      return;
    }

    const finalizeResult = await signIn.finalize({
      navigate: navigateAfterAuth,
    });

    if (finalizeResult.error) {
      reportError(finalizeResult.error, 'Không thể hoàn tất đăng nhập sau khi đổi mật khẩu.');
    }
  }, [clearError, confirmPassword, isBusy, navigateAfterAuth, newPassword, reportError, signIn]);

  const handleStartOver = React.useCallback(async () => {
    clearError();
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setStep('request');
    await signIn.reset();
  }, [clearError, signIn]);

  return (
    <AuthShell>
      <AuthBrand />
      <AuthCard badge="Khôi phục" title="Quên mật khẩu">
        {step === 'request' ? (
          <>
            <AuthField
              label="Email"
              value={emailAddress}
              placeholder="ban@example.com"
              keyboardType="email-address"
              onChangeText={setEmailAddress}
            />
            <AuthAlert message={formError} />
            <AuthPrimaryButton
              label="Gửi mã khôi phục"
              onPress={() => void handleSendCode()}
              disabled={isBusy || !emailAddress.trim()}
              loading={isBusy}
              className="mt-2"
            />
          </>
        ) : null}

        {step === 'verify' ? (
          <>
            <AuthField
              label="Email"
              value={emailAddress}
              placeholder="ban@example.com"
              keyboardType="email-address"
              onChangeText={setEmailAddress}
            />
            <AuthField
              label="Mã khôi phục"
              value={code}
              placeholder="Nhập mã 6 chữ số"
              keyboardType="numeric"
              onChangeText={setCode}
              error={errors.fields.code?.message}
            />
            <AuthAlert message={formError} />
            <AuthPrimaryButton
              label="Xác minh mã"
              onPress={() => void handleVerifyCode()}
              disabled={isBusy || !code.trim()}
              loading={isBusy}
              className="mt-2"
            />
            <AuthSecondaryButton
              label="Gửi lại mã"
              onPress={() => void handleSendCode()}
              disabled={isBusy || !emailAddress.trim()}
            />
          </>
        ) : null}

        {step === 'reset' ? (
          <>
            <AuthField
              label="Mật khẩu mới"
              value={newPassword}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry
              onChangeText={setNewPassword}
            />
            <AuthField
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry
              onChangeText={setConfirmPassword}
            />
            <AuthAlert message={formError} />
            <AuthPrimaryButton
              label="Đổi mật khẩu"
              onPress={() => void handleSubmitNewPassword()}
              disabled={isBusy || !newPassword || !confirmPassword}
              loading={isBusy}
              className="mt-2"
            />
          </>
        ) : null}

        <AuthSecondaryButton
          label={step === 'request' ? 'Quay lại đăng nhập' : 'Bắt đầu lại'}
          onPress={() => void (step === 'request' ? router.replace('/sign-in') : handleStartOver())}
          disabled={isBusy}
        />

        <AuthFooterLink prompt="Nhớ ra mật khẩu rồi?">
          <Link href="/sign-in" asChild>
            <Text className="text-md font-semibold text-app-primary dark:text-app-primary-dark">
              Quay lại đăng nhập
            </Text>
          </Link>
        </AuthFooterLink>
      </AuthCard>
    </AuthShell>
  );
}
