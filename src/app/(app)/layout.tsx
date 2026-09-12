import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { GlobalTimer } from "@/components/layout/GlobalTimer";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative scrollbar-hide">
        {/* We add a max-width container inside each page instead of here to allow full-width pages if needed */}
        {children}
      </main>

      {/* Global Timer Overlay */}
      <GlobalTimer />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
