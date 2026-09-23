import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/ui/BottomNav";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile(user);

  return (
    <div className="min-h-screen bg-base text-ink">
      <Sidebar profile={profile} user={user} />
      <main className="md:ml-64">
        <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:px-6 md:py-8 md:pb-8 lg:px-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
