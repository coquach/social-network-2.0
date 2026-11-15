import { Ionicons } from '@expo/vector-icons';
import { useAssistantStore, type FeedInterventionDTO } from '@repo/shared';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

/**
 * "Góc nhỏ lắng nghe" — Safe Space intervention card.
 * Renders backend-provided copy (title / description / buttonText) with a
 * gentle, non-judgmental look. Opens the AI Chatbot with a Safe Space
 * seeded context.
 */
export const SafeSpaceCard = React.memo(function SafeSpaceCard({
  data,
}: {
  data: FeedInterventionDTO;
}) {
  const openWithProactiveContext = useAssistantStore(
    (s) => s.openWithProactiveContext,
  );

  const handleChat = React.useCallback(() => {
    openWithProactiveContext({
      interventionId: data.id,
      promptContext: `${data.title}. ${data.description}`,
    });
  }, [openWithProactiveContext, data]);

  return (
    <View className="mx-2 rounded-3xl border border-violet-200/60 bg-gradient-to-br from-violet-50 via-rose-50 to-amber-50 px-5 py-7">
      <View className="items-center">
        <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-white/80">
          <Ionicons name="sparkles" size={22} color="#8b5cf6" />
        </View>

        <Text className="text-center text-[15px] font-semibold text-slate-800">
          {data.title}
        </Text>
        <Text className="mt-1.5 max-w-[280px] text-center text-[13px] leading-5 text-app-muted-fg">
          {data.description}
        </Text>

        <Pressable
          onPress={handleChat}
          className="mt-4 rounded-full bg-violet-600 px-5 py-2.5 active:opacity-80"
        >
          <Text className="text-[13px] font-medium text-white">
            {data.buttonText}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});
