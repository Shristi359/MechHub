import React from 'react';
import { Users, Clock, CheckCircle, AlertTriangle, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import db from '@/lib/db';
import { getRole } from '@/lib/get-role';
import { DispatchMap, LiveFeed, RevenueChart } from '../../components/ClientComponents';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const role = await getRole();
  const isAdmin = role === 'admin';

  // Real DB metrics
  const [onlineMechanics, pendingJobs, completedToday, escalated, revenue] = await Promise.all([
    db('mechanics').where('status', 'ONLINE').count('id as count').first(),
    db('jobs').where('status', 'PENDING').count('id as count').first(),
    db('jobs').where('status', 'COMPLETED').andWhere('created_at', '>=', db.raw('CURRENT_DATE')).count('id as count').first(),
    db('jobs').where('dispatch_round', '>=', 2).andWhere('status', '!=', 'COMPLETED').count('id as count').first(),
    isAdmin
      ? db('mechanic_earnings').where('created_at', '>=', db.raw('CURRENT_DATE')).sum('gross_amount as total').first()
      : Promise.resolve(null),
  ]);

  const totalJobs = await db('jobs').count('id as count').first();
  const completedCount = await db('jobs').where('status', 'COMPLETED').count('id as count').first();
  const fulfillmentRate = totalJobs?.count
    ? ((Number(completedCount?.count) / Number(totalJobs?.count)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Online Mechanics"
          value={String(onlineMechanics?.count ?? 0)}
          change="Currently available"
          icon={<Users className="h-6 w-6 text-emerald-500" />}
          color="emerald"
        />
        <MetricCard
          title="Pending Jobs"
          value={String(pendingJobs?.count ?? 0)}
          change="Awaiting mechanic"
          icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
          color="amber"
        />
        <MetricCard
          title="Completed Today"
          value={String(completedToday?.count ?? 0)}
          change="Jobs finished"
          icon={<CheckCircle className="h-6 w-6 text-blue-500" />}
          color="blue"
        />
        <MetricCard
          title="Fulfillment Rate"
          value={`${fulfillmentRate}%`}
          change="All-time completion"
          icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
          color="purple"
        />
        <MetricCard
          title="Escalated (Round 2+)"
          value={String(escalated?.count ?? 0)}
          change="Currently active"
          icon={<Clock className="h-6 w-6 text-rose-500" />}
          color="rose"
        />
        {isAdmin ? (
          <MetricCard
            title="Today's Revenue"
            value={`Rs. ${Number(revenue?.total ?? 0).toLocaleString()}`}
            change="Gross platform fees"
            icon={<DollarSign className="h-6 w-6 text-emerald-400" />}
            color="emerald"
          />
        ) : (
          <MetricCard
            title="Platform Revenue"
            value="Restricted"
            change="Admin access only"
            icon={<DollarSign className="h-6 w-6 text-neutral-600" />}
            color="neutral"
          />
        )}
      </div>

      {/* Map + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: '520px' }}>
        {/* Map */}
        <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-neutral-800 flex justify-between items-center shrink-0">
            <h2 className="text-base font-semibold text-neutral-100">Live Dispatch Map</h2>
            <div className="flex gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />Pending</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />Dispatched</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" />Assigned</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />Done</span>
            </div>
          </div>
          <DispatchMap />
        </div>

        {/* Live Feed */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
          <LiveFeed />
        </div>
      </div>

      {/* Analytics Section (Admin Only) */}
      {isAdmin && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg mt-6">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              Platform Revenue (Last 7 Days)
            </h2>
          </div>
          <div className="p-5 h-[300px]">
            <RevenueChart />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title, value, change, icon, color,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}) {
  const glowClasses: Record<string, string> = {
    emerald: 'group-hover:border-emerald-500/40',
    amber:   'group-hover:border-amber-500/40',
    blue:    'group-hover:border-blue-500/40',
    purple:  'group-hover:border-purple-500/40',
    rose:    'group-hover:border-rose-500/40',
    neutral: 'group-hover:border-neutral-700',
  };

  return (
    <div className={`group bg-neutral-900 border border-neutral-800 ${glowClasses[color] ?? ''} rounded-xl p-5 flex flex-col justify-between transition-colors`}>
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-wide">{title}</h3>
        <div className="text-3xl font-bold text-neutral-100 mt-1">{value}</div>
        <p className="text-xs text-neutral-600 mt-1.5">{change}</p>
      </div>
    </div>
  );
}
