import type { Metadata } from 'next';
import { BlockedUsers } from './blocked-users';

export const metadata: Metadata = {
  title: 'Danh sách chặn',
  description: 'Danh sách người bạn đã chặn trên Sentimeta.',
};

export default function BlockedUsersPage() {
  return <BlockedUsers />;
}
