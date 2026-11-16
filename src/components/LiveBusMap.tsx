/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  BusDriverRoute,
  BusStop,
  DEFAULT_SUPABASE_BUS_ID,
  DUHOK_CENTER,
  SCHOOL_LOCATION,
  resolveStopCoords,
} from '../data/busRoutes';
import { LiveBusState, StudentBoardingStatus, TripDirection } from '../hooks/useBusTracking';

export interface FleetBusMarker {
  driver: BusDriverRoute;
  state: LiveBusState;
}

interface LiveBusMapProps {
  stops?: BusStop[];
  busState?: LiveBusState | null;
  direction?: TripDirection;
  driverName?: string;
  driverCode?: string;
  highlightedStopId?: string | null;
  onSelectStop?: (stopId: string) => void;
  fleetBuses?: FleetBusMarker[];
  heightClass?: string;
  focusKey?: string;
  drawRouteLine?: boolean;
}

const VALID_STOP_COLORS = {
  highlighted: { bg: '#FF7F2A', border: '#1A1D4E' },
  boarded: { bg: '#059669', border: '#ffffff' },
  dropped_off: { bg: '#0087A5', border: '#ffffff' },
  absent: { bg: '#e11d48', border: '#ffffff' },
  waiting: { bg: '#1A1D4E', border: '#ffffff' },
} as const;

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getStopColor(
  status?: StudentBoardingStatus,
  isHighlighted?: boolean
): {
  bg: string;
  border: string;
} {
  if (isHighlighted) {
    return VALID_STOP_COLORS.highlighted;
  }
  switch (status) {
    case 'boarded':
      return VALID_STOP_COLORS.boarded;
    case 'dropped_off':
      return VALID_STOP_COLORS.dropped_off;
    case 'absent':
      return VALID_STOP_COLORS.absent;
    default:
      return VALID_STOP_COLORS.waiting;
  }
}

/**
 * Custom inline SVG student location pin icon (zero external image assets so Vite builds never break).
 */
function createStudentPinIcon(order: number, bg: string, border: string, isHighlighted: boolean) {
  const width = isHighlighted ? 34 : 28;
  const height = isHighlighted ? 42 : 36;
  return L.divIcon({
    className: 'dasinya-stop-pin',
    html: `<div style="position:relative;width:${width}px;height:${height}px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 6px rgba(26,29,78,0.34));cursor:pointer;">
      <svg width="${width}" height="${height}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 1C7.716 1 1 7.716 1 16C1 26.5 16 39 16 39C16 39 31 26.5 31 16C31 7.716 24.284 1 16 1Z" fill="${bg}" stroke="${border}" stroke-width="2.4"/>
      </svg>
      <span style="position:absolute;top:${isHighlighted ? '7px' : '5px'};left:0;right:0;text-align:center;color:#ffffff;font-weight:800;font-size:${isHighlighted ? '12px' : '10.5px'};font-family:Inter,sans-serif;line-height:1;">
        ${order}
      </span>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height - 2],
    popupAnchor: [0, -(height - 4)],
  });
}

/**
 * Custom inline SVG school hub pin icon.
 */
function createSchoolHubIcon() {
  return L.divIcon({
    className: 'dasinya-school-hub-pin',
    html: `<div style="
      padding:4px 10px;border-radius:9999px;
      background:#1A1D4E;color:#fff;font-size:11px;font-weight:900;white-space:nowrap;
      border:2.5px solid #00A887;box-shadow:0 4px 14px rgba(26,29,78,0.42);
      display:inline-flex;align-items:center;gap:5px;font-family:Inter,sans-serif;cursor:pointer;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M18 5v17"/><path d="m4 6 8-4 8 4"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/>
      </svg>
      <span>Dasinya School</span>
    </div>`,
    iconSize: [130, 30],
    iconAnchor: [65, 15],
    popupAnchor: [0, -14],
  });
}

/**
 * Custom inline SVG bus marker icon with smooth transition class & active pulse halo.
 */
function createBusSvgIcon(label: string, isActive: boolean, isBus1: boolean) {
  const pillBg = isActive ? (isBus1 ? '#0087A5' : '#0087A5') : '#6B70A6';
  const pulseHtml = isActive
    ? `<span class="dasinya-bus-pulse-ring" style="position:absolute;inset:-4px;border-radius:9999px;border:2px solid #00D4AA;pointer-events:none;"></span>`
    : '';

  return L.divIcon({
    className: 'dasinya-smooth-bus-marker',
    html: `<div style="position:relative;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;">
      ${pulseHtml}
      <div style="
        position:relative;padding:5px 10px;border-radius:9999px;
        background:${pillBg};color:#ffffff;font-size:11px;font-weight:900;white-space:nowrap;
        border:2.5px solid #ffffff;box-shadow:0 5px 16px rgba(0,135,165,0.48);
        display:inline-flex;align-items:center;gap:5px;font-family:Inter,sans-serif;
      ">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
        </svg>
        <span>${escapeHtml(label)}</span>
      </div>
    </div>`,
    iconSize: [86, 32],
    iconAnchor: [43, 16],
    popupAnchor: [0, -16],
  });
}

// ---------------------------------------------------------------------------
// OpenStreetMap + Leaflet Live Bus Map
// ---------------------------------------------------------------------------

const LeafletLiveBusMap: React.FC<LiveBusMapProps> = ({
  stops = [],
  busState,
  direction,
  driverName,
  driverCode,
  highlightedStopId,
  onSelectStop,
  fleetBuses,
  focusKey = 'default',
  drawRouteLine,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const stopsLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const busesLayerRef = useRef<L.LayerGroup | null>(null);
  const busMarkersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const lastFittedFocusRef = useRef<string>('');
  const lastHighlightedRef = useRef<string | null>(null);

  const effectiveDirection: TripDirection = direction || busState?.direction || 'pickup';
  const shouldDrawRouteLine =
    typeof drawRouteLine === 'boolean' ? drawRouteLine : !fleetBuses || fleetBuses.length === 0;

  // Resolve stops using parseGoogleMapsCoords (?q=lat,lng, @lat,lng, ll=lat,lng) + fallback lat/lng
  const resolvedStops = useMemo(() => {
    return stops
      .map((stop) => {
        const coords = resolveStopCoords(stop);
        if (!coords) return null;
        return {
          stop,
          lat: coords.lat,
          lng: coords.lng,
        };
      })
      .filter((item): item is { stop: BusStop; lat: number; lng: number } => Boolean(item));
  }, [stops]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [DUHOK_CENTER.lat, DUHOK_CENTER.lng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    stopsLayerRef.current = L.layerGroup().addTo(map);
    busesLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      window.clearTimeout(resizeTimer);
      busMarkersMapRef.current.clear();
      map.remove();
      mapRef.current = null;
      stopsLayerRef.current = null;
      busesLayerRef.current = null;
      routeLineRef.current = null;
    };
  }, []);

  // Static Student Pins + Official School Hub + Route Polyline
  useEffect(() => {
    const map = mapRef.current;
    const stopsLayer = stopsLayerRef.current;
    if (!map || !stopsLayer) return;

    stopsLayer.clearLayers();
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    const validCoords: [number, number][] = [];

    for (const { stop, lat, lng } of resolvedStops) {
      validCoords.push([lat, lng]);

      const status = busState?.studentStatuses?.[stop.id];
      const isHighlighted = highlightedStopId === stop.id;
      const colors = getStopColor(status, isHighlighted);

      const icon = createStudentPinIcon(stop.order, colors.bg, colors.border, isHighlighted);
      const marker = L.marker([lat, lng], {
        icon,
        zIndexOffset: isHighlighted ? 800 : 100,
      });

      const navButtonHtml = stop.googleMapsUrl
        ? `<a href="${escapeHtml(stop.googleMapsUrl)}" target="_blank" rel="noreferrer" style="
            display:inline-block;margin-top:6px;padding:4px 10px;border-radius:8px;
            background:#0087A5;color:#fff;font-size:11px;font-weight:700;text-decoration:none;
          ">Open in Google Maps</a>`
        : '';

      const statusText = status ? status.replace('_', ' ').toUpperCase() : 'STUDENT STOP';

      marker.bindPopup(
        `<div style="min-width:175px;font-family:Cairo,Inter,sans-serif;">
          <div style="font-size:10px;color:#6B70A6;font-weight:700;">Stop #${stop.order} • ${statusText}</div>
          <div style="font-size:13px;font-weight:800;color:#1A1D4E;margin-top:2px;direction:rtl;text-align:right;">
            ${escapeHtml(stop.studentNamesLabel)}
          </div>
          ${stop.landmarkNote ? `<div style="font-size:10px;color:#454A87;margin-top:2px;">${escapeHtml(stop.landmarkNote)}</div>` : ''}
          <div style="font-size:10px;font-family:monospace;color:#76A5B8;margin-top:3px;">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
          ${navButtonHtml}
        </div>`
      );

      if (onSelectStop) {
        marker.on('click', () => onSelectStop(stop.id));
      }

      marker.addTo(stopsLayer);
    }

    // Always render Official Dasinya Private School Hub Pin
    const schoolMarker = L.marker([SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng], {
      icon: createSchoolHubIcon(),
      zIndexOffset: 950,
    });
    schoolMarker.bindPopup(
      `<div style="min-width:185px;font-family:Cairo,Inter,sans-serif;">
        <div style="font-size:10px;color:#00A887;font-weight:800;">SCHOOL BUS HUB</div>
        <div style="font-size:13px;font-weight:900;color:#1A1D4E;margin-top:2px;">
          ${escapeHtml(SCHOOL_LOCATION.name)}
        </div>
        <div style="font-size:10px;color:#454A87;margin-top:2px;">
          All buses arrive here (Pickup) & depart from here (Drop-off).
        </div>
        <a href="${escapeHtml(SCHOOL_LOCATION.googleMapsUrl)}" target="_blank" rel="noreferrer" style="
          display:inline-block;margin-top:6px;padding:4px 10px;border-radius:8px;
          background:#1A1D4E;color:#fff;font-size:11px;font-weight:700;text-decoration:none;
        ">Open School in Google Maps</a>
      </div>`
    );
    schoolMarker.addTo(stopsLayer);

    if (shouldDrawRouteLine && validCoords.length >= 1) {
      const schoolPoint: [number, number] = [SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng];
      const routePoints =
        effectiveDirection === 'dropoff'
          ? [schoolPoint, ...validCoords]
          : [...validCoords, schoolPoint];

      routeLineRef.current = L.polyline(routePoints, {
        color: '#0087A5',
        weight: 3,
        opacity: 0.65,
        dashArray: '6 8',
      }).addTo(map);
    }

    if (lastFittedFocusRef.current !== focusKey) {
      const points: [number, number][] = [
        [SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng],
        ...validCoords,
      ];
      if (busState && typeof busState.lat === 'number' && typeof busState.lng === 'number') {
        points.push([busState.lat, busState.lng]);
      }
      if (fleetBuses) {
        for (const fb of fleetBuses) {
          if (typeof fb.state.lat === 'number' && typeof fb.state.lng === 'number') {
            points.push([fb.state.lat, fb.state.lng]);
          }
        }
      }
      if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 15 });
      } else {
        map.setView([SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng], 14);
      }
      lastFittedFocusRef.current = focusKey;
      lastHighlightedRef.current = highlightedStopId || null;
    } else if (highlightedStopId && lastHighlightedRef.current !== highlightedStopId) {
      lastHighlightedRef.current = highlightedStopId;
      const target = resolvedStops.find((r) => r.stop.id === highlightedStopId);
      if (target) {
        map.panTo([target.lat, target.lng], { animate: true });
      }
    }
  }, [
    resolvedStops,
    busState?.studentStatuses,
    effectiveDirection,
    highlightedStopId,
    onSelectStop,
    focusKey,
    shouldDrawRouteLine,
    fleetBuses,
    busState?.lat,
    busState?.lng,
  ]);

  // Smooth Real-Time Moving Bus Markers (updates existing L.Marker in place via setLatLng)
  useEffect(() => {
    const busesLayer = busesLayerRef.current;
    if (!busesLayer) return;

    const items: FleetBusMarker[] = [];
    if (fleetBuses && fleetBuses.length > 0) {
      items.push(...fleetBuses);
    } else if (busState && typeof busState.lat === 'number' && typeof busState.lng === 'number') {
      items.push({
        driver: {
          id: busState.driverId,
          code: driverCode || (busState.driverId === DEFAULT_SUPABASE_BUS_ID ? 'BUS-1' : 'BUS'),
          pin: '',
          name: driverName || 'School Bus',
          nameEn: driverName || 'School Bus',
          routeLabel: '',
          routeLabelArKu: '',
          stops: [],
        },
        state: busState,
      });
    }

    const activeBusKeys = new Set<string>();

    for (const item of items) {
      const { state, driver } = item;
      if (typeof state.lat !== 'number' || typeof state.lng !== 'number') continue;

      const busKey = driver.id || state.driverId;
      activeBusKeys.add(busKey);

      const isActive = state.active;
      const isBus1 = busKey === DEFAULT_SUPABASE_BUS_ID || driver.code === 'BUS-1';
      const busIcon = createBusSvgIcon(driver.code, isActive, isBus1);

      const updatedStr = state.updatedAt
        ? new Date(state.updatedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : '';

      const popupHtml = `<div style="min-width:180px;font-family:Cairo,Inter,sans-serif;">
        <div style="font-size:10px;font-weight:800;color:${isActive ? '#059669' : '#6B70A6'};">
          ${isActive ? '● LIVE GPS TRACKING ACTIVE' : '○ LAST KNOWN POSITION'}
        </div>
        <div style="font-size:13px;font-weight:900;color:#1A1D4E;margin-top:2px;">
          ${escapeHtml(driver.name)} (${escapeHtml(driver.code)})
        </div>
        <div style="font-size:10px;font-family:monospace;color:#76A5B8;margin-top:2px;">
          ${state.lat.toFixed(5)}, ${state.lng.toFixed(5)}
        </div>
        ${typeof state.speedKmh === 'number' ? `<div style="font-size:11px;color:#454A87;margin-top:2px;">Speed: ${Math.round(state.speedKmh)} km/h</div>` : ''}
        ${updatedStr ? `<div style="font-size:10px;color:#8C90C2;margin-top:2px;">Updated: ${escapeHtml(updatedStr)}</div>` : ''}
      </div>`;

      const existingMarker = busMarkersMapRef.current.get(busKey);
      if (existingMarker) {
        // Move marker smoothly in real time without destroying/recreating it
        existingMarker.setLatLng([state.lat, state.lng]);
        existingMarker.setIcon(busIcon);
        existingMarker.setPopupContent(popupHtml);
      } else {
        const marker = L.marker([state.lat, state.lng], {
          icon: busIcon,
          zIndexOffset: 1000,
        });
        marker.bindPopup(popupHtml);
        marker.addTo(busesLayer);
        busMarkersMapRef.current.set(busKey, marker);
      }
    }

    // Remove stale bus markers no longer in items
    for (const [key, marker] of busMarkersMapRef.current.entries()) {
      if (!activeBusKeys.has(key)) {
        busesLayer.removeLayer(marker);
        busMarkersMapRef.current.delete(key);
      }
    }
  }, [busState, driverName, driverCode, fleetBuses]);

  return <div ref={containerRef} className="w-full h-full z-0" />;
};

// ---------------------------------------------------------------------------
// Unified LiveBusMap Wrapper (OpenStreetMap / Leaflet)
// ---------------------------------------------------------------------------

export const LiveBusMap: React.FC<LiveBusMapProps> = (props) => {
  const { heightClass = 'h-[420px] sm:h-[480px]' } = props;

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-[#C8E5EC] bg-[#F0F8FA]`}
    >
      <LeafletLiveBusMap {...props} />
    </div>
  );
};
