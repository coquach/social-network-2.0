import { AntDesign, Ionicons } from "@expo/vector-icons";
import type { AssistantShowCardAction } from "@repo/shared";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type AssistantCardsProps = {
  cards: AssistantShowCardAction[];
  onNavigate?: (path: string) => void;
};

export function AssistantCards({ cards, onNavigate }: AssistantCardsProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <View className="mt-2.5 gap-2 pt-1 border-t border-app-border/40">
      {cards.map((card) => {
        const { cardType, title, subtitle, imageUrl, actionUrl, actionLabel } = card.payload;
        const isMusic = cardType === "music";

        return (
          <TouchableOpacity
            key={card.id}
            activeOpacity={0.8}
            onPress={() => {
              if (actionUrl) {
                onNavigate?.(actionUrl);
              }
            }}
            className="flex-row items-center justify-between rounded-xl bg-app-surface/60 dark:bg-app-surface-dark/40 border border-app-border/70 p-2.5"
          >
            {/* Left: Thumbnail & Content */}
            <View className="flex-row items-center flex-1 mr-2">
              <View className="h-10 w-10 rounded-lg overflow-hidden bg-app-primary/10 items-center justify-center mr-2.5 border border-app-border/60">
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" />
                ) : (
                  <>
                    {cardType === "profile" && <Ionicons name="person" size={18} color="#0ea5e9" />}
                    {cardType === "group" && <Ionicons name="people" size={18} color="#6366f1" />}
                    {cardType === "music" && <Ionicons name="musical-notes" size={18} color="#ec4899" />}
                    {cardType === "post" && <Ionicons name="document-text" size={18} color="#f59e0b" />}
                    {cardType === "emotion" && <Ionicons name="heart" size={18} color="#f43f5e" />}
                  </>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-xs font-semibold text-app-fg dark:text-app-fg-dark" numberOfLines={1}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text className="text-[11px] text-app-fg/60 dark:text-app-fg-dark/60 mt-0.5" numberOfLines={1}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Right: CTA button */}
            {actionUrl && (
              <View className="flex-row items-center gap-1 rounded-lg bg-app-primary px-2.5 py-1">
                <Text className="text-xs font-medium text-white">
                  {actionLabel || (isMusic ? "Nghe thử" : "Xem")}
                </Text>
                <AntDesign name="arrow-right" size={10} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
