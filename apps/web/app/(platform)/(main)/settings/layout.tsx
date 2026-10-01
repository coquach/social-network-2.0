import { SettingsSidebar } from './_components/settings-sidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-full max-w-[320px] shrink-0">
        <SettingsSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto app-scroll bg-slate-50/30">
        {children}
      </main>
    </div>
  );
}
