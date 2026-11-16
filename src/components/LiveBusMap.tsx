/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  APILoadingStatus,
  APIProvider,
  AdvancedMarker,
  AdvancedMarkerProps,
  CollisionBehavior,
  InfoWindow,
  Map as GoogleMap,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import { BusDriverRoute, BusStop, DUHOK_CENTER } from '../data/busRoutes';
import { LiveBusState, StudentBoardingStatus } from '../hooks/useBusTracking';

export interface FleetBusMarker {
  driver: BusDriverRoute;
  state: LiveBusState;
}

interface LiveBusMapProps {
  stops?: BusStop[];
  busState?: LiveBusState | null;
  driverName?: string;
  driverCode?: string;
  highlightedStopId?: string | null;
  onSelectStop?: (stopId: string) => void;
  fleetBuses?: FleetBusMarker[];
  heightClass?: string;
  focusKey?: string;
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

function normalizeConfiguredKey(raw?: string | null): string {
  const val = (raw || '').trim();
  if (!val || val === 'MY_GOOGLE_MAPS_API_KEY') return '';
  return val;
}

// ---------------------------------------------------------------------------
// Google Maps Platform (@vis.gl/react-google-maps + AdvancedMarkerElement)
// ---------------------------------------------------------------------------

interface MarkerWithRefProps extends AdvancedMarkerProps {
  onMarkerSelect: (marker: google.maps.marker.AdvancedMarkerElement) => void;
}

const AdvancedMarkerWithRef: React.FC<MarkerWithRefProps> = ({
  children,
  onMarkerSelect,
  ...advancedMarkerProps
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      ref={markerRef}
      onClick={() => {
        if (marker) {
          onMarkerSelect(marker);
        }
      }}
      {...advancedMarkerProps}
    >
      {children}
    </AdvancedMarker>
  );
};

interface GoogleFleetInnerProps extends LiveBusMapProps {
  onFallbackToLeaflet: () => void;
}

const GoogleFleetInner: React.FC<GoogleFleetInnerProps> = ({
  stops = [],
  busState,
  driverName,
  driverCode,
  highlightedStopId,
  onSelectStop,
  fleetBuses,
  focusKey = 'default',
  onFallbackToLeaflet,
}) => {
  const map = useMap();
  const apiStatus = useApiLoadingStatus();
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const lastFittedFocusRef = useRef<string>('');

  const [selectedAnchor, setSelectedAnchor] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [selectedStopInfo, setSelectedStopInfo] = useState<BusStop | null>(null);
  const [selectedBusInfo, setSelectedBusInfo] = useState<FleetBusMarker | null>(null);

  // Gracefully switch to Leaflet fallback if Maps authentication or load fails
  useEffect(() => {
    if (
      apiStatus === APILoadingStatus.AUTH_FAILURE ||
      apiStatus === APILoadingStatus.FAILED
    ) {
      onFallbackToLeaflet();
    }
  }, [apiStatus, onFallbackToLeaflet]);

  const validStops = useMemo(
    () =>
      stops.filter(
        (s): s is BusStop & { lat: number; lng: number } =>
          typeof s.lat === 'number' && typeof s.lng === 'number'
      ),
    [stops]
  );

  const busMarkers = useMemo<FleetBusMarker[]>(() => {
    if (fleetBuses && fleetBuses.length > 0) {
      return fleetBuses.filter(
        (fb) => typeof fb.state.lat === 'number' && typeof fb.state.lng === 'number'
      );
    }
    if (busState && typeof busState.lat === 'number' && typeof busState.lng === 'number') {
      return [
        {
          driver: {
            id: busState.driverId,
            code: driverCode || 'BUS',
            pin: '',
            name: driverName || 'School Bus',
            nameEn: driverName || 'School Bus',
            routeLabel: '',
            routeLabelArKu: '',
            stops: [],
          },
          state: busState,
        },
      ];
    }
    return [];
  }, [fleetBuses, busState, driverCode, driverName]);

  // Draw route path polyline via Maps JS SDK
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps?.Polyline) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    if (validStops.length >= 2) {
      const polyline = new google.maps.Polyline({
        path: validStops.map((s) => ({ lat: s.lat, lng: s.lng })),
        strokeColor: '#0087A5',
        strokeOpacity: 0.72,
        strokeWeight: 3.5,
        geodesic: true,
      });
      polyline.setMap(map);
      routePolylineRef.current = polyline;
    }

    return () => {
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
      }
    };
  }, [map, validStops]);

  // Fit bounds when focusKey changes or pan to highlighted stop
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps?.LatLngBounds) return;

    if (highlightedStopId) {
      const target = validStops.find((s) => s.id === highlightedStopId);
      if (target) {
        map.panTo({ lat: target.lat, lng: target.lng });
        if ((map.getZoom() || 0) < 14) {
          map.setZoom(15);
        }
      }
      return;
    }

    if (lastFittedFocusRef.current !== focusKey) {
      const bounds = new google.maps.LatLngBounds();
      let pointCount = 0;

      for (const s of validStops) {
        bounds.extend({ lat: s.lat, lng: s.lng });
        pointCount++;
      }
      for (const b of busMarkers) {
        if (typeof b.state.lat === 'number' && typeof b.state.lng === 'number') {
          bounds.extend({ lat: b.state.lat, lng: b.state.lng });
          pointCount++;
        }
      }

      if (pointCount === 1) {
        const single = validStops[0]
          ? { lat: validStops[0].lat, lng: validStops[0].lng }
          : {
              lat: busMarkers[0].state.lat as number,
              lng: busMarkers[0].state.lng as number,
            };
        map.setCenter(single);
        map.setZoom(15);
      } else if (pointCount > 1) {
        map.fitBounds(bounds, 44);
      } else {
        map.setCenter(DUHOK_CENTER);
        map.setZoom(13);
      }

      lastFittedFocusRef.current = focusKey;
    }
  }, [map, validStops, busMarkers, highlightedStopId, focusKey]);

  const handleCloseInfoWindow = useCallback(() => {
    setSelectedAnchor(null);
    setSelectedStopInfo(null);
    setSelectedBusInfo(null);
  }, []);

  return (
    <GoogleMap
      mapId="DEMO_MAP_ID"
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      defaultCenter={DUHOK_CENTER}
      defaultZoom={13}
      gestureHandling="greedy"
      streetViewControl={false}
      mapTypeControl={true}
      fullscreenControl={true}
      className="w-full h-full"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Numbered Student House Pins */}
      {validStops.map((stop, idx) => {
        const status = busState?.studentStatuses?.[stop.id];
        const isHighlighted = highlightedStopId === stop.id;
        const colors = getStopColor(status, isHighlighted);
        const size = isHighlighted ? 34 : 28;

        return (
          <AdvancedMarkerWithRef
            key={stop.id}
            position={{ lat: stop.lat, lng: stop.lng }}
            zIndex={isHighlighted ? 900 : 100 + idx}
            onMarkerSelect={(marker) => {
              setSelectedBusInfo(null);
              setSelectedStopInfo(stop);
              setSelectedAnchor(marker);
              if (onSelectStop) onSelectStop(stop.id);
            }}
          >
            <div
              style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '9999px',
                background: colors.bg,
                color: '#ffffff',
                border: `2.5px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '11px',
                boxShadow: '0 3px 10px rgba(26,29,78,0.32)',
                cursor: 'pointer',
              }}
            >
              {stop.order}
            </div>
          </AdvancedMarkerWithRef>
        );
      })}

      {/* Live School Bus Position Pins */}
      {busMarkers.map((item) => {
        const { driver, state } = item;
        if (typeof state.lat !== 'number' || typeof state.lng !== 'number') return null;

        return (
          <AdvancedMarkerWithRef
            key={`bus-${driver.id}`}
            position={{ lat: state.lat, lng: state.lng }}
            zIndex={1000}
            collisionBehavior={CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY}
            onMarkerSelect={(marker) => {
              setSelectedStopInfo(null);
              setSelectedBusInfo(item);
              setSelectedAnchor(marker);
            }}
          >
            <div
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: state.active ? '#0087A5' : '#6B70A6',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 900,
                whiteSpace: 'nowrap',
                border: '2px solid #ffffff',
                boxShadow: '0 4px 14px rgba(0,135,165,0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <span>🚌</span>
              <span>{driver.code}</span>
            </div>
          </AdvancedMarkerWithRef>
        );
      })}

      {/* InfoWindow anchored to clicked AdvancedMarker */}
      {selectedAnchor && (selectedStopInfo || selectedBusInfo) && (
        <InfoWindow
          anchor={selectedAnchor}
          pixelOffset={[0, -6]}
          onCloseClick={handleCloseInfoWindow}
        >
          {selectedStopInfo ? (
            <div className="min-w-[175px] font-sans p-0.5">
              <div className="text-[10px] font-bold text-[#6B70A6]">
                Stop #{selectedStopInfo.order} •{' '}
                {(busState?.studentStatuses?.[selectedStopInfo.id] || 'waiting')
                  .replace('_', ' ')
                  .toUpperCase()}
              </div>
              <div
                className="text-xs font-extrabold text-[#1A1D4E] mt-1"
                dir="rtl"
              >
                {selectedStopInfo.studentNamesLabel}
              </div>
              {selectedStopInfo.landmarkNote && (
                <div className="text-[10px] text-[#454A87] mt-0.5">
                  {selectedStopInfo.landmarkNote}
                </div>
              )}
              {selectedStopInfo.googleMapsUrl && (
                <a
                  href={selectedStopInfo.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-[#0087A5] text-white text-[11px] font-bold no-underline"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          ) : selectedBusInfo ? (
            <div className="min-w-[175px] font-sans p-0.5">
              <div
                className={`text-[10px] font-extrabold ${
                  selectedBusInfo.state.active ? 'text-emerald-600' : 'text-[#6B70A6]'
                }`}
              >
                {selectedBusInfo.state.active ? '● LIVE ROUTE ACTIVE' : '○ LAST KNOWN POSITION'}
              </div>
              <div className="text-xs font-black text-[#1A1D4E] mt-1">
                {selectedBusInfo.driver.name} ({selectedBusInfo.driver.code})
              </div>
              {typeof selectedBusInfo.state.speedKmh === 'number' && (
                <div className="text-[11px] text-[#454A87] mt-0.5">
                  Speed: {Math.round(selectedBusInfo.state.speedKmh)} km/h
                </div>
              )}
              {selectedBusInfo.state.updatedAt && (
                <div className="text-[10px] text-[#8C90C2] mt-0.5">
                  Updated:{' '}
                  {new Date(selectedBusInfo.state.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
              )}
            </div>
          ) : null}
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

// ---------------------------------------------------------------------------
// Interactive Leaflet Fallback (used automatically when API key is not set)
// ---------------------------------------------------------------------------

const LeafletLiveBusMap: React.FC<LiveBusMapProps> = ({
  stops = [],
  busState,
  driverName,
  driverCode,
  highlightedStopId,
  onSelectStop,
  fleetBuses,
  focusKey = 'default',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const stopsLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const busesLayerRef = useRef<L.LayerGroup | null>(null);
  const lastFittedFocusRef = useRef<string>('');

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
      map.remove();
      mapRef.current = null;
      stopsLayerRef.current = null;
      busesLayerRef.current = null;
      routeLineRef.current = null;
    };
  }, []);

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

    for (const stop of stops) {
      if (typeof stop.lat !== 'number' || typeof stop.lng !== 'number') continue;
      validCoords.push([stop.lat, stop.lng]);

      const status = busState?.studentStatuses?.[stop.id];
      const isHighlighted = highlightedStopId === stop.id;
      const colors = getStopColor(status, isHighlighted);
      const size = isHighlighted ? 34 : 28;

      const icon = L.divIcon({
        className: 'dasinya-stop-pin',
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:9999px;
          background:${colors.bg};color:#fff;border:2.5px solid ${colors.border};
          display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:11px;box-shadow:0 3px 10px rgba(26,29,78,0.32);
          font-family:Inter,sans-serif;
        ">${stop.order}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon });

      const navButtonHtml = stop.googleMapsUrl
        ? `<a href="${escapeHtml(stop.googleMapsUrl)}" target="_blank" rel="noreferrer" style="
            display:inline-block;margin-top:6px;padding:4px 10px;border-radius:8px;
            background:#0087A5;color:#fff;font-size:11px;font-weight:700;text-decoration:none;
          ">Open in Google Maps</a>`
        : '';

      const statusText = status ? status.replace('_', ' ').toUpperCase() : 'WAITING';

      marker.bindPopup(
        `<div style="min-width:170px;font-family:Cairo,Inter,sans-serif;">
          <div style="font-size:10px;color:#6B70A6;font-weight:700;">Stop #${stop.order} • ${statusText}</div>
          <div style="font-size:13px;font-weight:800;color:#1A1D4E;margin-top:2px;direction:rtl;text-align:right;">
            ${escapeHtml(stop.studentNamesLabel)}
          </div>
          ${stop.landmarkNote ? `<div style="font-size:10px;color:#454A87;margin-top:2px;">${escapeHtml(stop.landmarkNote)}</div>` : ''}
          ${navButtonHtml}
        </div>`
      );

      if (onSelectStop) {
        marker.on('click', () => onSelectStop(stop.id));
      }

      marker.addTo(stopsLayer);
    }

    if (validCoords.length >= 2) {
      routeLineRef.current = L.polyline(validCoords, {
        color: '#0087A5',
        weight: 3,
        opacity: 0.6,
        dashArray: '6 8',
      }).addTo(map);
    }

    if (highlightedStopId) {
      const target = stops.find((s) => s.id === highlightedStopId);
      if (target && typeof target.lat === 'number' && typeof target.lng === 'number') {
        map.panTo([target.lat, target.lng], { animate: true });
      }
    } else if (lastFittedFocusRef.current !== focusKey) {
      const points: [number, number][] = [...validCoords];
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
      if (points.length > 0) {
        map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 15 });
        lastFittedFocusRef.current = focusKey;
      } else {
        map.setView([DUHOK_CENTER.lat, DUHOK_CENTER.lng], 13);
        lastFittedFocusRef.current = focusKey;
      }
    }
  }, [
    stops,
    busState?.studentStatuses,
    highlightedStopId,
    onSelectStop,
    focusKey,
    fleetBuses,
    busState?.lat,
    busState?.lng,
  ]);

  useEffect(() => {
    const busesLayer = busesLayerRef.current;
    if (!busesLayer) return;
    busesLayer.clearLayers();

    const items: FleetBusMarker[] = [];
    if (fleetBuses && fleetBuses.length > 0) {
      items.push(...fleetBuses);
    } else if (busState && typeof busState.lat === 'number' && typeof busState.lng === 'number') {
      items.push({
        driver: {
          id: busState.driverId,
          code: driverCode || 'BUS',
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

    for (const item of items) {
      const { state, driver } = item;
      if (typeof state.lat !== 'number' || typeof state.lng !== 'number') continue;

      const isActive = state.active;
      const busIcon = L.divIcon({
        className: 'dasinya-live-bus-pin',
        html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
          <div style="
            padding:4px 9px;border-radius:9999px;
            background:${isActive ? '#0087A5' : '#6B70A6'};
            color:#fff;font-size:11px;font-weight:900;white-space:nowrap;
            border:2px solid #ffffff;box-shadow:0 4px 14px rgba(0,135,165,0.45);
            display:flex;align-items:center;gap:4px;
          ">
            <span>🚌</span>
            <span>${escapeHtml(driver.code)}</span>
          </div>
        </div>`,
        iconSize: [74, 30],
        iconAnchor: [37, 15],
      });

      const updatedStr = state.updatedAt
        ? new Date(state.updatedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : '';

      const marker = L.marker([state.lat, state.lng], { icon: busIcon, zIndexOffset: 1000 });
      marker.bindPopup(
        `<div style="min-width:170px;font-family:Cairo,Inter,sans-serif;">
          <div style="font-size:10px;font-weight:800;color:${isActive ? '#059669' : '#6B70A6'};">
            ${isActive ? '● LIVE ROUTE ACTIVE' : '○ LAST KNOWN POSITION'}
          </div>
          <div style="font-size:13px;font-weight:900;color:#1A1D4E;margin-top:2px;">
            ${escapeHtml(driver.name)} (${escapeHtml(driver.code)})
          </div>
          ${typeof state.speedKmh === 'number' ? `<div style="font-size:11px;color:#454A87;margin-top:2px;">Speed: ${Math.round(state.speedKmh)} km/h</div>` : ''}
          ${updatedStr ? `<div style="font-size:10px;color:#8C90C2;margin-top:2px;">Updated: ${escapeHtml(updatedStr)}</div>` : ''}
        </div>`
      );
      marker.addTo(busesLayer);
    }
  }, [busState, driverName, driverCode, fleetBuses]);

  return <div ref={containerRef} className="w-full h-full z-0" />;
};

// ---------------------------------------------------------------------------
// Unified LiveBusMap Wrapper
// ---------------------------------------------------------------------------

export const LiveBusMap: React.FC<LiveBusMapProps> = (props) => {
  const { heightClass = 'h-[420px] sm:h-[480px]' } = props;
  const envKey = normalizeConfiguredKey(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  const [runtimeKey, setRuntimeKey] = useState<string>(envKey);
  const [googleFailed, setGoogleFailed] = useState<boolean>(false);

  // Check server /api/config once if build-time key is unset
  useEffect(() => {
    if (envKey) return;
    let active = true;
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const serverKey = normalizeConfiguredKey(data.googleMapsApiKey);
        if (serverKey) {
          setRuntimeKey(serverKey);
        }
      })
      .catch(() => {
        // Ignore config lookup failure and stay on Leaflet fallback
      });
    return () => {
      active = false;
    };
  }, [envKey]);

  // Listen for runtime Maps auth failures (gm_authFailure) so we switch cleanly to fallback
  useEffect(() => {
    if (!runtimeKey) return;
    const prevAuthFailure = (window as unknown as { gm_authFailure?: () => void }).gm_authFailure;
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
      setGoogleFailed(true);
      if (typeof prevAuthFailure === 'function') prevAuthFailure();
    };
    return () => {
      (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = prevAuthFailure;
    };
  }, [runtimeKey]);

  const useGoogleMaps = Boolean(runtimeKey) && !googleFailed;

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-[#C8E5EC] bg-[#F0F8FA]`}
    >
      {useGoogleMaps ? (
        <APIProvider
          apiKey={runtimeKey}
          libraries={['marker']}
          language="en"
          region="IQ"
          onError={() => setGoogleFailed(true)}
        >
          <GoogleFleetInner
            {...props}
            onFallbackToLeaflet={() => setGoogleFailed(true)}
          />
        </APIProvider>
      ) : (
        <LeafletLiveBusMap {...props} />
      )}
    </div>
  );
};
