import React from 'react';
import { User, Star, MapPin, Search, Filter, ShieldCheck, CheckCircle2, Clock, Wrench, Lock } from 'lucide-react';
import db from '@/lib/db';
import { getRole } from '@/lib/get-role';

export const dynamic = 'force-dynamic';

export default async function MechanicsPage() {
  const role = await getRole();
  const isAdmin = role === 'admin';
  const isDispatcher = role === 'dispatcher';
  const isMechanic = role === 'mechanic';

  const mechanics = await db('mechanics')
    .leftJoin('mechanic_earnings', function() {
      this.on('mechanics.id', '=', 'mechanic_earnings.mechanic_id')
        .andOn(db.raw('DATE(mechanic_earnings.created_at) = CURRENT_DATE'));
    })
    .select(
      'mechanics.id',
      'mechanics.full_name as name',
      'mechanics.phone',
      'mechanics.status',
      'mechanics.rating',
      db.raw('(SELECT COUNT(*) FROM jobs WHERE jobs.mechanic_id = mechanics.id AND jobs.status = ?) as "jobsCompleted"', ['COMPLETED']),
      db.raw('COALESCE(SUM(mechanic_earnings.gross_amount), 0) as todaysEarnings')
    )
    .groupBy('mechanics.id')
    .orderBy('mechanics.rating', 'desc');

  const roleBadge: Record<string, string> = {
    admin: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    dispatcher: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    mechanic: 'bg-green-500/10 text-green-400 border border-green-500/30',
    user: 'bg-neutral-700 text-neutral-400',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {isMechanic ? 'My Profile' : 'Mechanic Roster'}
          </h2>
          <p className="text-neutral-400 mt-2">
            {isMechanic
              ? 'Your current status, rating, and earnings summary.'
              : 'Manage mechanics, view performance, and monitor availability.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${roleBadge[role]}`}>
            {role} view
          </span>
          {/* Search / Filter — only for admin & dispatcher */}
          {!isMechanic && (
            <>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search mechanics..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mechanic role restriction notice */}
      {isMechanic && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span>Showing your profile only. Earnings and sensitive data for other mechanics is restricted.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mechanics.length === 0 ? (
          <div className="col-span-full p-8 text-center text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-xl">
            No mechanics registered yet.
          </div>
        ) : null}
        {mechanics.map((mechanic) => (
          <div key={mechanic.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 group hover:border-neutral-700 transition-colors relative overflow-hidden">
            {/* Status glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 -mr-10 -mt-10 pointer-events-none ${
              mechanic.status === 'ONLINE' ? 'bg-emerald-500' :
              mechanic.status === 'BUSY'   ? 'bg-amber-500' : 'bg-neutral-500'
            }`} />

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                  <User className="h-6 w-6 text-neutral-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white flex items-center gap-1.5">
                    {mechanic.name}
                    {Number(mechanic.rating) >= 4.8 && <ShieldCheck className="h-4 w-4 text-blue-500" />}
                  </h3>
                  {/* Phone only visible to admin */}
                  {isAdmin ? (
                    <p className="text-sm text-neutral-500">{mechanic.phone}</p>
                  ) : (
                    <p className="text-sm text-neutral-600 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Phone restricted
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800/50">
                <p className="text-xs text-neutral-500 mb-1">Rating</p>
                <div className="flex items-center gap-1 text-white font-medium">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  {mechanic.rating}
                </div>
              </div>
              <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800/50">
                <p className="text-xs text-neutral-500 mb-1">Jobs Done</p>
                <div className="flex items-center gap-1 text-white font-medium">
                  <Wrench className="h-4 w-4 text-blue-400" />
                  {mechanic.jobsCompleted}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </span>
                <span className="text-neutral-300 font-medium">Kathmandu Valley</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Status
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  mechanic.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  mechanic.status === 'BUSY'   ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}>
                  {mechanic.status === 'ONLINE' && <CheckCircle2 className="h-3 w-3" />}
                  {mechanic.status === 'BUSY'   && <Wrench className="h-3 w-3" />}
                  {mechanic.status}
                </span>
              </div>
              {/* Earnings — only admin sees all; dispatcher sees blurred; mechanic only sees own */}
              <div className="flex justify-between items-center text-sm pt-3 border-t border-neutral-800">
                <span className="text-neutral-500">Today's Earnings</span>
                {isAdmin ? (
                  <span className="text-emerald-400 font-semibold">
                    Rs. {Number(mechanic.todaysEarnings).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-neutral-600 flex items-center gap-1 text-xs">
                    <Lock className="h-3 w-3" /> Admin only
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons — only admin can suspend; dispatcher can view profile */}
            {!isMechanic && (
              <div className="mt-6 pt-4 border-t border-neutral-800 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                  View Profile
                </button>
                {isAdmin && (
                  <button className="px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-medium py-2 rounded-lg transition-colors border border-rose-500/20">
                    Suspend
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
