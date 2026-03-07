import { AuditLogCard } from './_components/audit-log';
import { DataGovernanceCard } from './_components/data-governance';
import { GeneralPreferencesCard } from './_components/general-preferences';
import { ModerationAutomationCard } from './_components/moderation-automation';
import { NotificationPreferencesCard } from './_components/notification-preferences';
import { SecurityControlsCard } from './_components/security-controls';
import { SettingsHeader } from './_components/settings-header';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <SettingsHeader />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <GeneralPreferencesCard />
          <SecurityControlsCard />
          <ModerationAutomationCard />
          <NotificationPreferencesCard />
          <DataGovernanceCard />
        </div>
        <div className="space-y-4">
          <AuditLogCard />
        </div>
      </div>
    </div>
  );
}
