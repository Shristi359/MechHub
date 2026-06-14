'use client';

import React from 'react';
import { Settings, Users, Activity, BarChart3, Wrench, ShieldAlert, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

type Role = 'admin' | 'dispatcher' | 'mechanic' | 'user';

const navItems: { href: string; icon: React.ElementType; label: string; roles: Role[] }[] = [
  { href: '/dashboard', icon: Activity, label: 'Live Dispatch', roles: ['admin', 'dispatcher'] },
  { href: '/dashboard/jobs', icon: BarChart3, label: 'Job Feed', roles: ['admin', 'dispatcher', 'mechanic'] },
  { href: '/dashboard/mechanics', icon: Users, label: 'Mechanic Roster', roles: ['admin', 'dispatcher', 'mechanic'] },
  { href: '/dashboard/settings', icon: Settings, label: 'Zone Settings', roles: ['admin'] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const displayName = user?.email?.split('@')[0] ?? 'Admin';
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-xl font-bold text-blue-500">
            <Wrench className="h-6 w-6" />
            MechHub <span className="text-neutral-100">Ops</span>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems
            .filter(item => item.roles.includes((role as Role) ?? 'user'))
            .map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <a
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </a>
              );
            })
          }
        </nav>

        {/* User footer with logout */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0">
              <ShieldAlert className="h-5 w-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate capitalize">{displayName}</p>
              <p className="text-xs text-neutral-500">{displayRole}</p>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-semibold text-neutral-100">
            {navItems.find(n => n.href === pathname)?.label ?? 'Live Operations'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">Active Zone:</span>
              <select className="bg-neutral-800 border border-neutral-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="kathmandu">Kathmandu Valley</option>
                <option value="lalitpur">Lalitpur Core</option>
                <option value="bhaktapur">Bhaktapur Highway</option>
              </select>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-neutral-950">
          {children}
        </div>
      </main>
    </div>
  );
}
