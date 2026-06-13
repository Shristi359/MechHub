import React from 'react';
import { Users, Clock, CheckCircle, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Online Mechanics"
          value="42"
          change="+3 from last hour"
          icon={<Users className="h-6 w-6 text-green-500" />}
          trend="up"
        />
        <MetricCard
          title="Pending Jobs"
          value="15"
          change="Urgent: 2 over 5 mins"
          icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
          trend="down"
        />
        <MetricCard
          title="Avg Response Time"
          value="4.2s"
          change="-0.5s from yesterday"
          icon={<Clock className="h-6 w-6 text-blue-500" />}
          trend="up"
        />
        <MetricCard
          title="Fulfillment Rate"
          value="94.5%"
          change="Target: 95%"
          icon={<CheckCircle className="h-6 w-6 text-emerald-500" />}
          trend="up"
        />
        <MetricCard
          title="Escalation Rate"
          value="12%"
          change="Round 2+ dispatches"
          icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
          trend="down"
        />
        <MetricCard
          title="Today's Revenue"
          value="Rs. 45,200"
          change="Platform Fees Collected"
          icon={<DollarSign className="h-6 w-6 text-emerald-400" />}
          trend="up"
        />
      </div>

      {/* Main Map & Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Map Placeholder */}
        <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden relative flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900">
            <h2 className="text-lg font-medium">Live Dispatch Map</h2>
            <div className="flex gap-4 text-sm text-neutral-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Busy</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center bg-neutral-950">
            {/* We will add Leaflet map here later */}
            <div className="text-center text-neutral-500">
              <p className="mb-2">Map component will render here.</p>
              <p className="text-sm">(Requires Leaflet integration)</p>
            </div>
          </div>
        </div>

        {/* Activity Feed Placeholder */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-800">
            <h2 className="text-lg font-medium">Recent Activity</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Dummy Feed Items */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors border border-transparent hover:border-neutral-800">
                <div className="mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-200">Job #120{i} Accepted</p>
                  <p className="text-xs text-neutral-500">Mechanic Ram Kumar • 2 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon, trend }: { title: string, value: string, change: string, icon: React.ReactNode, trend: 'up' | 'down' }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col justify-between hover:border-neutral-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-neutral-400 text-sm font-medium">{title}</h3>
        <div className="text-3xl font-bold text-neutral-100 mt-1">{value}</div>
        <p className="text-xs text-neutral-500 mt-2">{change}</p>
      </div>
    </div>
  );
}
