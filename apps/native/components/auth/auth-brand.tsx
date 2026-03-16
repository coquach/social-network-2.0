import React from 'react';
import { Image, Text, View } from 'react-native';

export function AuthBrand() {
  return (
    <View className="items-center gap-3">
      
      <View className="h-16 w-16 items-center justify-center rounded-[28px] border border-app-border bg-app-surface shadow-sm dark:border-app-border-dark dark:bg-app-surface-dark">
        <Image source={require('../../assets/icon.png')} className="h-10 w-10" resizeMode="contain" />
      </View>
      <Text className="text-4xl font-extrabold tracking-tight text-app-primary dark:text-app-primary-dark">
        Sentimeta
      </Text>

    </View>
  );
}
