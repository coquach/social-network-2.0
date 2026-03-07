import { GroupAdminPanel } from './admin-section';
import { GroupAdminGuard } from './admin-guard';

type GroupAdminPageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupAdminPage({ params }: GroupAdminPageProps) {
  const { groupId } = await params;

  return (
    <GroupAdminGuard>
      <GroupAdminPanel groupId={groupId} />
    </GroupAdminGuard>
  );
}
