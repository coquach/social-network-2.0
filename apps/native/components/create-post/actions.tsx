import { Ionicons } from '@expo/vector-icons';
import { feelingsUI } from '@repo/shared';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { useCreatePostContext } from './context';
import { MediaUpload } from './media-upload';

const QUICK_EMOJI = ['😀', '😍', '🙏'];

export function Actions() {
  const {
    appendContent,
    feeling,
    setFeeling,
    openFeeling,
    setOpenFeeling,
    isPending,
  } = useCreatePostContext();

  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-3">
        <MediaUpload />
      </View>

      <View className="h-8 w-px bg-app-border dark:bg-app-border-dark" />

      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center gap-1.5">
          {QUICK_EMOJI.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => appendContent(emoji)}
              disabled={isPending}
              className="h-11 w-11 items-center justify-center rounded-full bg-app-surface-elevated active:opacity-70 dark:bg-app-surface-elevated-dark"
            >
              <Text className="text-base">{emoji}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => setOpenFeeling((previous) => !previous)}
          disabled={isPending}
          className="h-11 w-11 items-center justify-center rounded-full border border-app-border bg-app-surface active:opacity-70 dark:border-app-border-dark dark:bg-app-surface-dark"
        >
          <Ionicons name="happy-outline" size={20} color="#64748b" />
        </Pressable>
      </View>

      <Modal
        transparent
        visible={openFeeling}
        animationType="fade"
        onRequestClose={() => setOpenFeeling(false)}
      >
        <Pressable
          className="flex-1 bg-black/10"
          onPress={() => setOpenFeeling(false)}
        >
          <View className="mx-5 mt-[58%] rounded-3xl border border-app-border bg-app-surface p-3 dark:border-app-border-dark dark:bg-app-surface-dark">
            <View className="flex-row flex-wrap justify-between gap-y-2">
              {feelingsUI.map((item) => {
                const isSelected = feeling === item.type;

                return (
                  <Pressable
                    key={item.type}
                    onPress={() => {
                      setFeeling((previous) =>
                        previous === item.type ? undefined : item.type,
                      );
                      setOpenFeeling(false);
                    }}
                    className={`h-14 w-14 items-center justify-center rounded-2xl ${
                      isSelected
                        ? 'border border-app-primary bg-app-primary/12 dark:border-app-primary-dark dark:bg-app-primary-dark/20'
                        : 'bg-app-surface-elevated dark:bg-app-surface-elevated-dark'
                    }`}
                  >
                    <Text className="text-2xl">{item.emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
