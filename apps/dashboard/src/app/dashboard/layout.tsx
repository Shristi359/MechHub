import React from 'react';
import { Settings, Users, Activity, BarChart3, Wrench, ShieldAlert } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-500 font-medium">
            <Activity className="h-5 w-5" />
            Live Dispatch
          </a>
          <a href="/dashboard/jobs" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors">
            <BarChart3 className="h-5 w-5" />
            Job Feed
          </a>
          <a href="/dashboard/mechanics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors">
            <Users className="h-5 w-5" />
            Mechanic Roster
          </a>
          <a href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors">
            <Settings className="h-5 w-5" />
            Zone Settings
          </a>
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
              <ShieldAlert className="h-5 w-5 text-neutral-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Captain Admin</p>
              <p className="text-xs text-neutral-500">Zone Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-semibold text-neutral-100">Live Operations</h1>
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
