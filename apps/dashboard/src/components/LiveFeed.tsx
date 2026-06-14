'use client';

import { useEffect, useRef, useState } from 'react';
import { Radio, Zap, Wrench, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface FeedEvent {
  id: string;
  type: string;
  jobId?: string;
  status?: string;
  mechanicsNotified?: number;
  estimatedFare?: number;
  message?: string;
  timestamp: string;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws';

const EVENT_ICONS: Record<string, React.ReactNode> = {
  JOB_CREATED:    <Clock className="h-4 w-4 text-rose-400" />,
  JOB_DISPATCHED: <Zap className="h-4 w-4 text-amber-400" />,
  JOB_ASSIGNED:   <Wrench className="h-4 w-4 text-blue-400" />,
  JOB_COMPLETED:  <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  CONNECTED:      <Radio className="h-4 w-4 text-green-400" />,
};

function eventLabel(event: FeedEvent): string {
  switch (event.type) {
    case 'JOB_CREATED':    return `New job created`;
    case 'JOB_DISPATCHED': return `Job dispatched to ${event.mechanicsNotified ?? '?'} mechanic(s)`;
    case 'JOB_ASSIGNED':   return `Mechanic accepted job`;
    case 'JOB_COMPLETED':  return `Job completed — Rs. ${event.estimatedFare?.toLocaleString() ?? '?'}`;
    case 'CONNECTED':      return event.message ?? 'Connected to real-time feed';
    default:               return event.type;
  }
}

export default function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    function connect() {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);
        ws.onclose = () => {
          setConnected(false);
          // Auto-reconnect after 3s
          setTimeout(connect, 3000);
        };
        ws.onerror = () => ws.close();

        ws.onmessage = (e) => {
          try {
            const payload = JSON.parse(e.data) as Omit<FeedEvent, 'id'>;
            const event: FeedEvent = {
              ...payload,
              id: Math.random().toString(36).slice(2),
            };
            setEvents(prev => [event, ...prev].slice(0, 30));
          } catch {}
        };
      } catch {
        setTimeout(connect, 3000);
      }
    }

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const timeAgo = (ts: string) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <h2 className="text-base font-semibold text-neutral-100">Live Activity</h2>
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
          connected
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
          {connected ? 'Live' : 'Reconnecting...'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600 text-sm gap-2 py-8">
            <AlertCircle className="h-8 w-8" />
            <p>Waiting for events...</p>
            <p className="text-xs">Start the Fastify backend to see live data</p>
          </div>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className="flex gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800/50 transition-colors border border-transparent hover:border-neutral-800 animate-in slide-in-from-top-2 duration-200"
          >
            <div className="mt-0.5 shrink-0">
              {EVENT_ICONS[event.type] ?? <Radio className="h-4 w-4 text-neutral-500" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-200 truncate">{eventLabel(event)}</p>
              {event.jobId && (
                <p className="text-xs text-neutral-500 font-mono truncate">#{event.jobId.slice(0, 8)}</p>
              )}
              <p className="text-xs text-neutral-600">{timeAgo(event.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
