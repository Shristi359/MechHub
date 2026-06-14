'use client';

import nextDynamic from 'next/dynamic';

const DispatchMap = nextDynamic(() => import('./DispatchMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-neutral-950 text-neutral-600 text-sm">
      Loading map...
    </div>
  ),
});

const LiveFeed = nextDynamic(() => import('./LiveFeed'), { ssr: false });
const RevenueChart = nextDynamic(() => import('./RevenueChart'), { ssr: false });

export { DispatchMap, LiveFeed, RevenueChart };
