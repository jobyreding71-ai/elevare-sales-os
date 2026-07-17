"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Kanban,
  DollarSign,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Avatar, Badge } from "@/components/ui";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Pipeline", href: "/pipeline", icon: Kanban },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Commissions", href: "/commissions", icon: DollarSign },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-surface border-r border-border transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-text-primary">Elevare</span>
                <span className="text-xs text-emerald-400 block -mt-1">Sales OS</span>
              </div>
            </Link>
            <button
              className="lg:hidden p-2 text-text-muted hover:text-text-primary"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "text-text-secondary hover:text-text-primary hover:bg-card"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-transform group-hover:scale-110",
                      isActive ? "text-emerald-400" : "text-text-muted"
                    )}
                  />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Navigation */}
          <div className="px-4 pb-6 space-y-1 border-t border-border pt-4">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-text-secondary hover:text-text-primary hover:bg-card"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-card transition-colors cursor-pointer">
              <Avatar name={user?.user_metadata?.full_name || "User"} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.user_metadata?.full_name || "User"}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 text-text-muted hover:text-text-primary"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search */}
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search leads, tasks..."
                  className="w-64 pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-text-muted hover:text-text-primary hover:bg-card rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-card transition-colors"
                >
                  <Avatar name={user?.user_metadata?.full_name || "User"} size="sm" />
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 py-2">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-text-primary">
                          {user?.user_metadata?.full_name}
                        </p>
                        <p className="text-xs text-text-muted">{user?.email}</p>
                      </div>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-surface transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
