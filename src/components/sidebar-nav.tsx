"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEntity } from "@/contexts/entity-context";
import { EntitySwitcher } from "./entity-switcher";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";
import { logout } from "@/app/login/actions";
import { FounderProfileModal } from "./founder-profile-modal";
import { LayoutDashboard, Receipt, LineChart, BookOpen, Menu, X, LogOut, UserCircle } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Revenue", href: "/clients", icon: LineChart },
  { name: "Ledger", href: "/ledger", icon: BookOpen },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [optimisticPath, setOptimisticPath] = useState(pathname);
  const { entity } = useEntity();
  const { sharedConfig, updateFounderProfile } = useCompanyConfig(entity);
  const companyName = sharedConfig.companyName || "FLOWWLED";
  const [profileOpen, setProfileOpen] = useState(false);

  // Sync optimistic path when real pathname changes
  useEffect(() => {
    setOptimisticPath(pathname);
  }, [pathname]);

  // Prefetch all nav routes on mount for instant navigation
  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href));
  }, [router]);

  const handleNavClick = (href: string) => {
    setOptimisticPath(href); // Instant visual feedback
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-zinc-950 border-b border-zinc-800 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/logo-icon.png"
            alt="Flowwled"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="text-sm font-black tracking-tight text-zinc-100">Flowwled</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-zinc-400">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-zinc-950 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/logo-icon.png"
                alt="Flowwled"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-sm font-black tracking-tight text-zinc-100">Flowwled</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-zinc-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          {sharedConfig.hasPersonalBrand && (
            <div className="p-4 border-b border-zinc-800">
              <p className="text-xs font-bold text-zinc-500 uppercase mb-2 ml-2">Entity</p>
              <EntitySwitcher />
            </div>
          )}

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = optimisticPath.startsWith(item.href);
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick(item.href);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 border border-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex-col h-screen sticky top-0 hidden md:flex">
        {/* Logo Section */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo-icon.png"
              alt="Flowwled"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
            <div>
              <p className="text-base font-black tracking-tight text-zinc-100">Flowwled</p>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">AI Cockpit</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-zinc-800" />

        {/* Managed For */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2">Managed for</p>
          <div className="bg-zinc-900/60 rounded-lg px-3 py-2.5 border border-zinc-800">
            <p className="text-sm font-bold text-emerald-400 truncate">{companyName}</p>
          </div>
        </div>

        {sharedConfig.hasPersonalBrand && (
          <div className="px-5 pb-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2">Entity</p>
            <EntitySwitcher />
          </div>
        )}

        {/* Divider */}
        <div className="mx-5 mt-3 mb-2 border-t border-zinc-800" />

        {/* Navigation */}
        <nav id="tour-sidebar-nav" className={`flex-1 px-3 py-2 space-y-1 transition-opacity duration-150 ${isPending ? "opacity-60" : ""}`}>
          {navItems.map((item) => {
            const isActive = optimisticPath.startsWith(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 border border-transparent"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-5 pb-5 space-y-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Visit Website
          </Link>
          <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Founder Profile"
            >
              {sharedConfig.founderAvatar ? (
                <Image
                  src={sharedConfig.founderAvatar}
                  alt=""
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <UserCircle className="w-4 h-4" />
              )}
              {sharedConfig.founderName || "Profile"}
            </button>
            <form action={logout}>
              <button className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors">
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      <FounderProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        initialName={sharedConfig.founderName || ""}
        initialRole={sharedConfig.founderRole || ""}
        initialBio={sharedConfig.founderBio || ""}
        initialAvatar={sharedConfig.founderAvatar || ""}
        onSave={async (profile) => {
          await updateFounderProfile(profile);
        }}
      />
    </>
  );
}
