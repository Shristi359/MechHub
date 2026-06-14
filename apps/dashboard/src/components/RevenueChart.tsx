'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-neutral-500 text-sm">Loading chart data...</div>;
  }

  if (data.length === 0) {
    return <div className="h-full flex items-center justify-center text-neutral-500 text-sm">No revenue data available.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
        <XAxis 
          dataKey="name" 
          stroke="#525252" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          dy={10} 
        />
        <YAxis 
          stroke="#525252" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `Rs.${value}`} 
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
          itemStyle={{ color: '#10b981' }}
          formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#10b981" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
