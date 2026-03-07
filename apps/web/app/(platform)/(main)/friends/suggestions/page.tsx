import type { Metadata } from 'next';
import { FriendSuggestions } from './friend-suggestions';

export const metadata: Metadata = {
  title: 'Gợi ý kết bạn',
  description: 'Những người bạn có thể biết trên Sentimeta.',
};

export default function FriendsSuggestionsPage() {
  return <FriendSuggestions />;
}
