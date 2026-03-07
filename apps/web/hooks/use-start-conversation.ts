'use client';

import { useRouter } from 'next/navigation';
import { useCreateConversation } from '@/hooks/use-conversation';
import type { ConversationDTO } from '@/models/conversation/conversationDTO';

export const useStartConversation = () => {
  const router = useRouter();
  const { mutate: createConversation, isPending } = useCreateConversation();

  const startConversation = (
    targetId: string,
    options?: { onSuccess?: (conversation: ConversationDTO) => void }
  ) => {
    createConversation(
      {
        dto: {
          isGroup: false,
          participants: [targetId],
        },
      },
      {
        onSuccess: (conversation) => {
          if (conversation?._id) {
            router.push(`/conversations/${conversation._id}`);
          }
          options?.onSuccess?.(conversation);
        },
      }
    );
  };

  return { startConversation, isPending };
};
