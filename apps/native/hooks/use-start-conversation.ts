import { useCreateConversation } from '@repo/shared';
import { useRouter } from 'expo-router';

export const useStartConversation = () => {
  const router = useRouter();
  const createConversation = useCreateConversation();

  const startConversation = async (
    targetId: string,
    options?: { onSuccess?: (conversation: any) => void }
  ) => {
    const conversation = await createConversation.mutateAsync({
      isGroup: false,
      participants: [targetId],
    });

    if (conversation?._id) {
      router.push(`/chat/${conversation._id}`);
      options?.onSuccess?.(conversation);
    }
    return conversation;
  };

  return { startConversation, isPending: createConversation.isPending };
};
