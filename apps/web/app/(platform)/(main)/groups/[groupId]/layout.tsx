import { GroupHeader } from "./_components/group-header";
import { GroupTabs } from "./_components/group-tabs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/query-client";
import { ReactNode } from "react";
import { getGroupById } from "@/lib/actions/group/group-action";
import { GroupPermissionProvider } from "@/contexts/group-permission-context";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

type Props = {
  children: ReactNode;
  params: Promise<{ groupId: string }>;
};

const GroupDetailsLayout = async ({ children, params }: Props) => {
  const { getToken } = await auth();
  const { groupId } = await params;

  const token = await getToken();
  if (!token) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();

  // SSR prefetch cho query 'get-group-by-id'
  await queryClient.prefetchQuery({
    queryKey: ["get-group-by-id", groupId],
    queryFn: async () => getGroupById(token, groupId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GroupPermissionProvider groupId={groupId}>
        <div className="bg-slate-50/70">
          <div className="container mx-auto max-w-6xl space-y-6 px-4 pb-10 lg:px-8">
            <div className="overflow-hidden rounded-b-2xl border border-slate-200 bg-white shadow-sm">
              <GroupHeader />
              <GroupTabs />
            </div>
            <section className="px-4 py-4 pb-10  max-w-4xl mx-auto">
              {children}
            </section>
          </div>
        </div>
      </GroupPermissionProvider>
    </HydrationBoundary>
  );
};

export default GroupDetailsLayout;
