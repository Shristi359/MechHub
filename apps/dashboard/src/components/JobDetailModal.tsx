'use client';

import { useRouter } from 'next/navigation';
import { X, MapPin, User, Phone, Clock, Wrench, FileText, Banknote } from 'lucide-react';
import { useEffect } from 'react';

export default function JobDetailModal({ job }: { job: any }) {
  const router = useRouter();

  useEffect(() => {
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Job Details
              <span className="text-xs font-mono text-neutral-500 bg-neutral-800 px-2 py-1 rounded">#{job.id.split('-')[0]}</span>
            </h2>
          </div>
          <button 
            onClick={() => router.push('/dashboard/jobs')}
            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Status & Service */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                <Clock className="h-4 w-4" /> Status
              </div>
              <p className="text-lg font-semibold text-white">{job.status}</p>
              <p className="text-xs text-neutral-500 mt-1">Round {job.dispatch_round}</p>
            </div>
            <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                <Wrench className="h-4 w-4" /> Service
              </div>
              <p className="text-lg font-semibold text-white">{job.serviceType || 'General Service'}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {job.estimated_fare ? `Est. Fare: Rs. ${Number(job.estimated_fare).toLocaleString()}` : 'Fare pending'}
              </p>
            </div>
          </div>

          {/* Location & Problem */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                <MapPin className="h-4 w-4 text-rose-400" /> Location Coordinates
              </div>
              <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800 font-mono text-sm text-neutral-300">
                {job.lat}, {job.lng}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                <FileText className="h-4 w-4 text-blue-400" /> Problem Description
              </div>
              <div className="bg-neutral-950 rounded-lg p-4 border border-neutral-800 text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                {job.problem_description || 'No description provided by driver.'}
              </div>
            </div>
          </div>

          {/* People */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" /> Driver Details
              </h3>
              <div className="space-y-2">
                <p className="text-white font-medium">{job.driverName || 'Unknown'}</p>
                <p className="text-sm text-neutral-400 flex items-center gap-2">
                  <Phone className="h-3 w-3" /> {job.driverPhone || 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Assigned Mechanic
              </h3>
              <div className="space-y-2">
                {job.mechanicName ? (
                  <>
                    <p className="text-white font-medium">{job.mechanicName}</p>
                    <p className="text-sm text-neutral-400 flex items-center gap-2">
                      <Phone className="h-3 w-3" /> {job.mechanicPhone || 'N/A'}
                    </p>
                  </>
                ) : (
                  <p className="text-neutral-500 italic text-sm">No mechanic assigned yet</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button 
            onClick={() => router.push('/dashboard/jobs')}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
