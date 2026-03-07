import type { Metadata } from 'next';
import { FriendRequests } from './friend-requests';

export const metadata: Metadata = {
  title: 'Lời mời kết bạn',
  description: 'Lời mời kết bạn đang chờ phản hồi.',
};

export default function FriendsRequestPage() {
  return <FriendRequests />;
}
