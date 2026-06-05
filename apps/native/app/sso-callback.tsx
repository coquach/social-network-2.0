import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

/**
 * SSO Callback screen
 *
 * This route exists solely to receive the deep link redirect from Clerk's
 * OAuth flow (e.g. sentimeta://sso-callback).
 *
 * With @clerk/expo v3, `startSSOFlow` uses expo-auth-session internally.
 * When the OAuth browser redirects back to the app, expo-auth-session
 * intercepts the URL and resolves the `startSSOFlow` promise — no manual
 * callback handling is needed here.
 *
 * This screen just shows a spinner while that resolution happens.
 */
export default function SSOCallbackScreen() {
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#071823' }}
    >
      <ActivityIndicator size="large" color="#22d3ee" />
      <Text style={{ color: '#8fb2c8', marginTop: 16, fontSize: 14 }}>
        Đang đăng nhập...
      </Text>
    </View>
  );
}
