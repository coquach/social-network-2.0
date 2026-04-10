import { Ionicons } from '@expo/vector-icons';
import { Button } from 'heroui-native/button';
import React from 'react';
import { View } from 'react-native';

type ImageSourceActionsProps = {
  onPick: (source: 'library' | 'camera') => void;
  onClear?: () => void;
  showClear?: boolean;
  libraryLabel?: string;
  cameraLabel?: string;
  clearLabel?: string;
};

export function ImageSourceActions({
  onPick,
  onClear,
  showClear = false,
  libraryLabel = 'Thư viện',
  cameraLabel = 'Chụp ảnh',
  clearLabel = 'Bỏ ảnh',
}: ImageSourceActionsProps) {
  return (
    <View className="flex-row flex-wrap justify-center gap-2">
      <Button
        variant="secondary"
        className="rounded-full px-4"
        onPress={() => onPick('library')}
      >
        <Ionicons name="images-outline" size={16} color="#0ea5e9" />
        <Button.Label>{libraryLabel}</Button.Label>
      </Button>
      <Button
        variant="secondary"
        className="rounded-full px-4"
        onPress={() => onPick('camera')}
      >
        <Ionicons name="camera-outline" size={16} color="#0ea5e9" />
        <Button.Label>{cameraLabel}</Button.Label>
      </Button>
      {showClear && onClear ? (
        <Button variant="ghost" className="rounded-full px-4" onPress={onClear}>
          {clearLabel}
        </Button>
      ) : null}
    </View>
  );
}
