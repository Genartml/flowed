import { EntityProvider } from "@/contexts/entity-context";
import { SidebarNav } from "@/components/sidebar-nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EntityProvider>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-zinc-950">
        <SidebarNav />
        <main className="flex-1 overflow-y-auto relative w-full bg-zinc-950 text-zinc-100">
          {children}
        </main>
      </div>
    </EntityProvider>
  );
}
