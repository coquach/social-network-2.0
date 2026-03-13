import { useAuth, useSSO, useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();
void AuthSession.makeRedirectUri;

const toErrorMessage = (error: unknown, fallback: string): string => {
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

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const isFinalizingRef = React.useRef(false);

  const isSubmitting = fetchStatus === 'fetching';
  const isBusy = isSubmitting || isGoogleLoading;
  const isPrimaryDisabled = !emailAddress || !password || isBusy;
  const needsEmailVerification =
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0;

  const completeSignUp = async () => {
    if (isFinalizingRef.current) {
      return;
    }

    isFinalizingRef.current = true;

    const { error } = await signUp.finalize();
    if (error) {
      isFinalizingRef.current = false;
      setLocalError(toErrorMessage(error, 'Khong the hoan tat dang ky.'));
      return;
    }

    router.replace('/(tabs)/home');
  };

  React.useEffect(() => {
    if (signUp.status === 'complete' && !isSignedIn) {
      void completeSignUp();
    }
  }, [isSignedIn, signUp.status]);

  const handleGoogleSignUp = async () => {
    if (isBusy) {
      return;
    }

    try {
      setLocalError(null);
      setIsGoogleLoading(true);

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: 'sentimeta://sso-callback',
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      setLocalError(toErrorMessage(error, 'Khong the dang ky bang Google.'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!emailAddress || !password || isBusy) {
      setLocalError('Vui long nhap day du email va mat khau.');
      return;
    }

    setLocalError(null);

    const { error } = await signUp.password({
      emailAddress,
      password,
    });

    if (error) {
      setLocalError(toErrorMessage(error, 'Dang ky that bai. Vui long thu lai.'));
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
      const sendCodeResult = await signUp.verifications.sendEmailCode();
      if (sendCodeResult.error) {
        setLocalError(toErrorMessage(sendCodeResult.error, 'Khong gui duoc ma xac minh.'));
      }
      return;
    }

    if (signUp.missingFields.length > 0) {
      setLocalError(`Can bo sung: ${signUp.missingFields.join(', ')}`);
      return;
    }

    setLocalError('Dang ky chua hoan tat. Vui long thu lai.');
  };

  const handleVerify = async () => {
    if (!code || isBusy) {
      setLocalError('Vui long nhap ma xac minh.');
      return;
    }

    setLocalError(null);

    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setLocalError(toErrorMessage(error, 'Ma xac minh khong hop le.'));
      return;
    }

    if (signUp.status === 'complete') {
      await completeSignUp();
      return;
    }

    setLocalError('Xac minh chua thanh cong. Vui long thu lai.');
  };

  if (isSignedIn) {
    return null;
  }

  if (signUp.status === 'complete') {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="small" color="#0284c7" />
        <Text className="mt-3 text-sm text-slate-500">Dang hoan tat dang ky...</Text>
      </View>
    );
  }

  if (needsEmailVerification) {
    return (
      <View className="flex-1 bg-slate-50">
        <View
          pointerEvents="none"
          className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-sky-200/60"
        />
        <View
          pointerEvents="none"
          className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-200/40"
        />
        <View className="flex-1 justify-center px-5 py-8">
          <View className="mb-5 items-center">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Image
                source={require('../../assets/icon.png')}
                className="h-9 w-9"
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-extrabold tracking-tight text-sky-500">Sentimeta</Text>
          </View>
          <View className="rounded-3xl border border-slate-200 bg-white px-5 py-6">
            <Text className="text-xs font-semibold uppercase tracking-widest text-sky-600">
              Xac thuc
            </Text>
            <Text className="mt-2 text-[32px] font-extrabold leading-[38px] text-slate-950">
              Xac minh email
            </Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">
              Nhap ma xac minh de hoan tat tao tai khoan.
            </Text>

            <TextInput
              className="mt-5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950"
              value={code}
              placeholder="Nhap ma xac minh"
              placeholderTextColor="#666666"
              onChangeText={setCode}
              keyboardType="numeric"
            />
            {errors.fields.code?.message && (
              <Text className="mt-2 text-xs text-red-600">{errors.fields.code.message}</Text>
            )}
            {localError && <Text className="mt-2 text-xs text-red-600">{localError}</Text>}

            <Pressable
              className="mt-4 items-center rounded-xl bg-sky-500 px-6 py-3"
              style={({ pressed }) => ({
                opacity: isBusy ? 0.5 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
              onPress={() => void handleVerify()}
              disabled={isBusy}
            >
              <Text className="font-semibold text-white">Xac minh</Text>
            </Pressable>
            <Pressable
              className="mt-2 items-center rounded-xl px-6 py-3"
              style={({ pressed }) => ({
                opacity: isBusy ? 0.5 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
              onPress={() => void signUp.verifications.sendEmailCode()}
              disabled={isBusy}
            >
              <Text className="font-semibold text-sky-700">Gui lai ma</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View
        pointerEvents="none"
        className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-sky-200/60"
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-indigo-200/40"
      />
      <View className="flex-1 justify-center px-5 py-8">
        <View className="mb-5 items-center">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Image
              source={require('../../assets/icon.png')}
              className="h-9 w-9"
              resizeMode="contain"
            />
          </View>
          <Text className="text-3xl font-extrabold tracking-tight text-sky-500">Sentimeta</Text>
        </View>
        <View className="rounded-3xl border border-slate-200 bg-white px-5 py-6">
          <Text className="text-xs font-semibold uppercase tracking-widest text-sky-600">
            Dang ky
          </Text>
          <Text className="mt-2 text-[32px] font-extrabold leading-[38px] text-slate-950">
            Tao tai khoan moi
          </Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">
            Tham gia Sentimeta va bat dau ket noi cung cong dong.
          </Text>

          <Pressable
            className="mt-5 flex-row items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3"
            style={({ pressed }) => ({
              opacity: isBusy ? 0.5 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
            onPress={() => void handleGoogleSignUp()}
            disabled={isBusy}
          >
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-sky-100">
              <Text className="font-bold text-sky-700">G</Text>
            </View>
            <Text className="font-semibold text-slate-800">
              {isGoogleLoading ? 'Dang ket noi Google...' : 'Tiep tuc voi Google'}
            </Text>
          </Pressable>

          <View className="my-5 flex-row items-center">
            <View className="h-px flex-1 bg-slate-200" />
            <Text className="mx-3 text-xs uppercase tracking-widest text-slate-400">hoac</Text>
            <View className="h-px flex-1 bg-slate-200" />
          </View>

          <Text className="text-sm font-semibold text-slate-800">Email</Text>
          <TextInput
            className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950"
            autoCapitalize="none"
            value={emailAddress}
            placeholder="ban@example.com"
            placeholderTextColor="#666666"
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />
          {errors.fields.emailAddress?.message && (
            <Text className="mt-2 text-xs text-red-600">{errors.fields.emailAddress.message}</Text>
          )}

          <Text className="mt-4 text-sm font-semibold text-slate-800">Mat khau</Text>
          <TextInput
            className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950"
            value={password}
            placeholder="Tao mat khau"
            placeholderTextColor="#666666"
            secureTextEntry
            onChangeText={setPassword}
          />
          {errors.fields.password?.message && (
            <Text className="mt-2 text-xs text-red-600">{errors.fields.password.message}</Text>
          )}
          {errors.global?.[0]?.message && (
            <Text className="mt-2 text-xs text-red-600">{errors.global[0].message}</Text>
          )}
          {localError && <Text className="mt-2 text-xs text-red-600">{localError}</Text>}

          <Pressable
            className="mt-5 items-center rounded-xl bg-sky-500 px-6 py-3"
            style={({ pressed }) => ({
              opacity: isPrimaryDisabled ? 0.5 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
            onPress={() => void handleSubmit()}
            disabled={isPrimaryDisabled}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="font-semibold text-white">Dang ky</Text>
            )}
          </Pressable>

          <View className="mt-4 flex-row items-center justify-center gap-1">
            <Text className="text-slate-700">Ban da co tai khoan?</Text>
            <Link href="/sign-in">
              <Text className="font-semibold text-sky-700">Dang nhap</Text>
            </Link>
          </View>

          <View nativeID="clerk-captcha" />
        </View>
      </View>
    </View>
  );
}
