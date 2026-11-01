import { AntDesign } from "@expo/vector-icons";
import {
  buildDestinationHref,
  chatbotService,
  type AssistantNavigateAction,
} from "@repo/shared";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type AssistantActionButtonsProps = {
  actions: AssistantNavigateAction[];
  onNavigate?: (path: string) => void;
};

export function AssistantActionButtons({ actions, onNavigate }: AssistantActionButtonsProps) {
  // Click telemetry is recorded once per action even if the user taps repeatedly.
  const recordedActionIds = React.useRef<Set<string>>(new Set());

  const items = actions.flatMap((action) => {
    if (action.type !== 'navigate') return [];
    const path = buildDestinationHref(
      action.payload.destinationId,
      action.payload.params,
      "native",
    );
    return path ? [{ action, path }] : [];
  });
  if (items.length === 0) return null;

  return (
    <View className="mt-2.5 flex-row flex-wrap gap-2 pt-1 border-t border-app-border/40">
      {items.map(({ action, path }) => {
        const isSearch = action.payload.destinationId === "search";
        return (
          <TouchableOpacity
            key={action.id}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Chuyển tới ${action.label}`}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={() => {
              if (!recordedActionIds.current.has(action.id)) {
                recordedActionIds.current.add(action.id);
                void chatbotService.recordActionClick(action.id, action.payload.destinationId);
              }
              onNavigate?.(path);
            }}
            className="flex-row items-center gap-1.5 rounded-full bg-app-primary/10 px-3 py-1.5 border border-app-primary/20"
          >
            <Text className="text-xs font-medium text-app-primary">{action.label}</Text>
            <AntDesign name={isSearch ? "search" : "arrow-right"} size={10} color="#0ea5e9" />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
