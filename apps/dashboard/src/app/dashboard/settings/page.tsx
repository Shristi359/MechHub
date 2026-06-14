import React from 'react';
import { Settings2, Map, ShieldAlert, Bell, Save, Zap } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings2 className="h-8 w-8 text-blue-500" />
          Zone Settings
        </h2>
        <p className="text-neutral-400 mt-2">Configure operational parameters and escalation thresholds for Kathmandu Valley.</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="border-b border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Map className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Geofence Configuration</h3>
          </div>
          <p className="text-sm text-neutral-500 ml-11">Manage the physical boundaries for this operational zone.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Zone Name</label>
              <input 
                type="text" 
                defaultValue="Kathmandu Valley"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Status</label>
              <select className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="active">Active (Accepting Jobs)</option>
                <option value="suspended">Suspended (Emergency Only)</option>
                <option value="maintenance">Maintenance Mode</option>
              </select>
            </div>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-200">PostGIS Boundary Polygon</p>
              <p className="text-xs text-neutral-500 font-mono mt-1">POLYGON((85.28 27.67, 85.35 27.67, ...))</p>
            </div>
            <button className="text-sm text-blue-400 hover:text-blue-300 font-medium px-4 py-2 rounded-lg border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
              Edit on Map
            </button>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="border-b border-neutral-800 p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Escalation Protocol</h3>
          </div>
          <p className="text-sm text-neutral-500 ml-11">Configure timeout thresholds and search radiuses.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-800 bg-neutral-950">
              <div>
                <p className="font-medium text-neutral-200">Round 1 (Initial Dispatch)</p>
                <p className="text-xs text-neutral-500 mt-1">Ping nearest 3 mechanics</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={3} className="w-16 bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1 text-center text-sm text-white" />
                <span className="text-sm text-neutral-500">km radius</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-800 bg-neutral-950">
              <div>
                <p className="font-medium text-neutral-200">Round 2 (60s Escalation)</p>
                <p className="text-xs text-neutral-500 mt-1">Ping next 3 mechanics if no response</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={5} className="w-16 bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1 text-center text-sm text-white" />
                <span className="text-sm text-neutral-500">km radius</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-800 bg-neutral-950">
              <div>
                <p className="font-medium text-neutral-200">Round 3 (120s Escalation)</p>
                <p className="text-xs text-neutral-500 mt-1">Ping next 3 mechanics</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={8} className="w-16 bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1 text-center text-sm text-white" />
                <span className="text-sm text-neutral-500">km radius</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-rose-500/20 bg-rose-500/5">
              <div>
                <p className="font-medium text-rose-400">Round 4 (Critical Escalation)</p>
                <p className="text-xs text-rose-400/70 mt-1">Broadcast to entire zone</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500 text-white">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
          <Save className="h-5 w-5" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
