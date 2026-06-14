'use client';

import { useEffect, useRef } from 'react';

interface JobLocation {
  id: string;
  status: string;
  serviceType: string | null;
  lat: number;
  lng: number;
}

interface MechanicLocation {
  id: string;
  name: string;
  status: string;
  lat: number;
  lng: number;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws';


const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#f43f5e',   // rose
  DISPATCHED: '#f59e0b',   // amber
  ASSIGNED:   '#3b82f6',   // blue
  COMPLETED:  '#10b981',   // emerald
  CANCELLED:  '#6b7280',   // gray
};

export default function DispatchMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!mapRef.current || mapInstanceRef.current || !isMounted) return;

      // Initialize map centered on Kathmandu Valley
      const map = L.map(mapRef.current, {
        center: [27.7103, 85.3222],
        zoom: 12,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Dark tile layer (Carto Dark Matter — no API key needed)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Fetch job locations & mechanic locations concurrently
      const [jobsRes, mechanicsRes] = await Promise.all([
        fetch('/api/job-locations'),
        fetch('/api/mechanic-locations')
      ]);
      const jobs: JobLocation[] = await jobsRes.json();
      const mechanics: MechanicLocation[] = await mechanicsRes.json();

      // Plot jobs
      jobs.forEach((job) => {
        if (!job.lat || !job.lng) return;
        const color = STATUS_COLORS[job.status] ?? '#6b7280';

        const markerIcon = L.divIcon({
          className: '',
          html: `<div style="width: 14px; height: 14px; border-radius: 50%; background: ${color}; border: 2px solid rgba(255,255,255,0.6); box-shadow: 0 0 8px ${color}88;"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        L.marker([job.lat, job.lng], { icon: markerIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family: sans-serif; min-width: 140px;"><p style="font-weight: 600; margin: 0 0 4px">${job.serviceType ?? 'Job'}</p><span style="display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; background: ${color}22; color: ${color}; border: 1px solid ${color}44;">${job.status}</span></div>`);
      });

      // Plot mechanics and keep references
      const mechanicMarkers = new Map<string, any>();
      mechanics.forEach((m) => {
        if (!m.lat || !m.lng) return;
        const color = '#a855f7'; // purple for mechanics
        
        const markerIcon = L.divIcon({
          className: '',
          html: `<div style="width: 16px; height: 16px; border-radius: 50%; background: ${color}; border: 2px solid white; box-shadow: 0 0 10px ${color}88;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker([m.lat, m.lng], { icon: markerIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family: sans-serif; min-width: 120px;"><p style="font-weight: 600; margin: 0 0 4px">${m.name}</p><span style="display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; background: ${color}22; color: ${color}; border: 1px solid ${color}44;">${m.status}</span></div>`);
          
        mechanicMarkers.set(m.id, marker);
      });

      // WebSocket listener for live mechanic movement
      const ws = new WebSocket(WS_URL);
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'MECHANIC_LOCATION' && mapInstanceRef.current) {
            const marker = mechanicMarkers.get(data.mechanicId);
            if (marker) {
              marker.setLatLng([data.lat, data.lng]);
            } else {
              // Create new marker if it doesn't exist
              const color = '#a855f7';
              const markerIcon = L.divIcon({
                className: '',
                html: `<div style="width: 16px; height: 16px; border-radius: 50%; background: ${color}; border: 2px solid white; box-shadow: 0 0 10px ${color}88;"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              });
              const newMarker = L.marker([data.lat, data.lng], { icon: markerIcon }).addTo(mapInstanceRef.current);
              mechanicMarkers.set(data.mechanicId, newMarker);
            }
          }
        } catch {}
      };

      // Store WS in a ref so we can close it
      (mapRef.current as any)._ws = ws;
    }

    initMap();
    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      const ws = (mapRef.current as any)?._ws;
      if (ws) ws.close();
    };
  }, []);


  return (
    <div className="relative flex-1 h-full">
      <div ref={mapRef} className="absolute inset-0 z-0 rounded-b-xl" />
    </div>
  );
}
