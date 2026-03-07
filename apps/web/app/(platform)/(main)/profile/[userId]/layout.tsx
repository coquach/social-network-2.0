import { UserProfileInfo } from "./_components/user-profile-info";
import { ProfileTabs } from "./_components/profile-tabs";
import { ProfileContentGuard } from "./_components/profile-content-guard";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/query-client";
import { getUser } from "@/lib/actions/user/user-actions";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

const ProfileLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}>) => {
  const { userId } = await params;
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["user", userId],
    queryFn: async () => getUser(token, userId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-slate-50/70">
        <div className="container mx-auto max-w-6xl space-y-6 px-4 pb-10  lg:px-8">
          <div className="overflow-hidden rounded-b-2xl border border-slate-200 bg-white shadow-sm">
            <UserProfileInfo />
            <ProfileTabs />
          </div>

          <section className="px-4 py-4 max-w-4xl mx-auto">
            <ProfileContentGuard>{children}</ProfileContentGuard>
          </section>
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default ProfileLayout;
