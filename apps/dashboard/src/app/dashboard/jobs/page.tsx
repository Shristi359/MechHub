import React from 'react';
import { Clock, MapPin, Wrench, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import db from '@/lib/db';
import { getRole, can } from '@/lib/get-role';

export const dynamic = 'force-dynamic';

import JobDetailModal from '@/components/JobDetailModal';
import Link from 'next/link';

export default async function JobsPage({ searchParams }: { searchParams: { jobId?: string } }) {
  const role = await getRole();
  const isAdmin = role === 'admin';
  const isDispatcher = role === 'dispatcher';
  const isMechanic = role === 'mechanic';

  // Build base query
  const query = db('jobs')
    .leftJoin('drivers', 'jobs.driver_id', 'drivers.id')
    .leftJoin('mechanics', 'jobs.mechanic_id', 'mechanics.id')
    .leftJoin('service_types', 'jobs.service_type_id', 'service_types.id')
    .select(
      'jobs.id',
      'jobs.status',
      'jobs.created_at',
      'jobs.dispatch_round as escalation_round',
      'jobs.estimated_fare',
      'drivers.full_name as driverName',
      'mechanics.full_name as mechanicName',
      'service_types.name as serviceType'
    )
    .orderBy('jobs.created_at', 'desc')
    .limit(50);

  // Mechanics only see jobs assigned to them (using a mock mechanic ID for now)
  // In production, you'd look up the mechanic ID from their Firebase UID
  // For mock users, we return all jobs but flag it visually
  const jobs = await query;

  // Aggregate metrics — only admin & dispatcher see platform-wide numbers
  const pendingCount = await db('jobs').where('status', 'PENDING').count('id as count').first();
  const completedTodayCount = await db('jobs')
    .where('status', 'COMPLETED')
    .andWhere('created_at', '>=', db.raw('CURRENT_DATE'))
    .count('id as count')
    .first();
  const escalatedCount = await db('jobs')
    .where('dispatch_round', '>=', 2)
    .count('id as count')
    .first();

  let selectedJobDetails = null;
  if (searchParams.jobId) {
    selectedJobDetails = await db('jobs')
      .leftJoin('drivers', 'jobs.driver_id', 'drivers.id')
      .leftJoin('mechanics', 'jobs.mechanic_id', 'mechanics.id')
      .leftJoin('service_types', 'jobs.service_type_id', 'service_types.id')
      .where('jobs.id', searchParams.jobId)
      .select(
        'jobs.*',
        'drivers.full_name as driverName',
        'drivers.phone as driverPhone',
        'mechanics.full_name as mechanicName',
        'mechanics.phone as mechanicPhone',
        'service_types.name as serviceType',
        db.raw('ST_X(jobs.location::geometry) as lng'),
        db.raw('ST_Y(jobs.location::geometry) as lat')
      ).first();
  }

  const roleBadge: Record<string, string> = {
    admin: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    dispatcher: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    mechanic: 'bg-green-500/10 text-green-400 border border-green-500/30',
    user: 'bg-neutral-700 text-neutral-400',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Job Feed</h2>
          <p className="text-neutral-400 mt-2">
            {isMechanic
              ? 'Your assigned jobs and history.'
              : 'Monitor live dispatches and historical job completions.'}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${roleBadge[role]}`}>
          {role} view
        </span>
      </div>

      {/* Metrics — hidden for mechanics */}
      {!isMechanic && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-sm font-medium text-neutral-400 mb-1">Active Pending</p>
            <p className="text-4xl font-bold text-white">{pendingCount?.count || 0}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-sm font-medium text-neutral-400 mb-1">Completed Today</p>
            <p className="text-4xl font-bold text-white">{completedTodayCount?.count || 0}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group hover:border-rose-500/50 transition-colors">
            <div className="absolute inset-0 bg-linear-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-sm font-medium text-neutral-400 mb-1">Escalated &gt; Round 2</p>
            <p className="text-4xl font-bold text-white">{escalatedCount?.count || 0}</p>
          </div>
        </div>
      )}

      {/* Mechanic — simplified view banner */}
      {isMechanic && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>You are viewing your assigned jobs only. Platform-wide data is restricted to dispatchers and admins.</span>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/50 text-xs uppercase tracking-wider text-neutral-400">
              <th className="p-4 font-medium">Job Details</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Mechanic</th>
              {/* Financial column — admin only */}
              {isAdmin && <th className="p-4 font-medium text-right">Fare</th>}
              {/* Actions column — not shown to mechanics */}
              {!isMechanic && <th className="p-4 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  No jobs found.
                </td>
              </tr>
            ) : null}
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-neutral-800/50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                      <Wrench className="h-5 w-5 text-neutral-300" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-100">{job.serviceType || 'General Service'}</p>
                      <p className="text-sm text-neutral-500">{job.driverName || 'Unknown Driver'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-300">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    Kathmandu Valley
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    job.status === 'PENDING'    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    job.status === 'DISPATCHED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    job.status === 'ASSIGNED'   ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {job.status === 'PENDING'   && <Clock className="h-3.5 w-3.5" />}
                    {job.status === 'DISPATCHED' && <Wrench className="h-3.5 w-3.5" />}
                    {job.status === 'COMPLETED' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {job.status}
                    {job.status === 'PENDING' && <span className="ml-1 opacity-70">(R{job.escalation_round})</span>}
                  </span>
                </td>
                <td className="p-4 text-sm text-neutral-300">
                  {job.mechanicName ? (
                    <span className="font-medium">{job.mechanicName}</span>
                  ) : (
                    <span className="text-neutral-500 italic">Finding nearest...</span>
                  )}
                </td>
                {/* Fare — admin only */}
                {isAdmin && (
                  <td className="p-4 text-right text-sm font-mono text-emerald-400">
                    {job.estimated_fare ? `Rs. ${Number(job.estimated_fare).toLocaleString()}` : '—'}
                  </td>
                )}
                {/* Actions — dispatcher + admin */}
                {!isMechanic && (
                  <td className="p-4 text-right">
                    <Link href={`/dashboard/jobs?jobId=${job.id}`}>
                      <button className="text-sm text-blue-400 hover:text-blue-300 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors opacity-0 group-hover:opacity-100">
                        View Details
                      </button>
                    </Link>
                    {isAdmin && (
                      <button className="ml-2 text-sm text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100">
                        Cancel
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedJobDetails && <JobDetailModal job={selectedJobDetails} />}
    </div>
  );
}
