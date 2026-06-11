import React from 'react';
import { Image, Text, View } from 'react-native';

export function AuthBrand() {
  return (
    <View className="items-center gap-3">
      <View className="h-14 w-14 items-center justify-center rounded-2xl border border-app-border bg-app-surface shadow-sm dark:border-app-border-dark dark:bg-app-surface-dark">
        <Image source={require('../../assets/icon.png')} className="h-9 w-9" resizeMode="contain" />
      </View>
      <Text className="text-3xl font-extrabold tracking-tight text-app-primary dark:text-app-primary-dark">
        Sentimeta
      </Text>
    </View>
  );
}
