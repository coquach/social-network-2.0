import { SidebarProvider } from '@/components/ui/sidebar';

import { auth } from '@clerk/nextjs/server';
import { getRoleFromClaims } from '@/lib/role';
import { AppSidebar } from './_components/admin-app-sidebar';
import { AdminTopbar } from './_components/admin-topbar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = getRoleFromClaims(sessionClaims);

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 via-white to-sky-100">
      <SidebarProvider>
        <AppSidebar role={role} />
        <main className="w-full">
          <AdminTopbar />
          <div className="p-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
