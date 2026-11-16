/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BUS_1_ID,
  BUS_LOCATIONS_TABLE,
  BusLocationRow,
  fetchBusLocation,
  supabase,
  upsertBusLocation,
} from '../lib/supabase';

export type TripDirection = 'pickup' | 'dropoff';
export type StudentBoardingStatus = 'waiting' | 'boarded' | 'dropped_off' | 'absent';
export type GpsSource = 'device_gps' | 'stop_checkin' | 'supabase_realtime';

export interface LiveBusState {
  driverId: string;
  active: boolean;
  direction: TripDirection;
  lat: number | null;
  lng: number | null;
  heading: number | null;
  speedKmh: number | null;
  accuracy: number | null;
  updatedAt: string | null;
  tripStartedAt: string | null;
  currentStopId: string | null;
  gpsSource: GpsSource | null;
  studentStatuses: Record<string, StudentBoardingStatus>;
}

function toLiveBusState(row: BusLocationRow): LiveBusState {
  // Treat a row updated in the last 3 minutes as actively broadcasting
  const updatedMs = row.updated_at ? Date.parse(row.updated_at) : NaN;
  const isFresh = Number.isFinite(updatedMs) ? Date.now() - updatedMs < 3 * 60 * 1000 : true;

  return {
    driverId: row.id,
    active: isFresh,
    direction: 'pickup',
    lat: row.lat,
    lng: row.lng,
    heading: null,
    speedKmh: null,
    accuracy: null,
    updatedAt: row.updated_at || new Date().toISOString(),
    tripStartedAt: null,
    currentStopId: null,
    gpsSource: 'supabase_realtime',
    studentStatuses: {},
  };
}

export function useBusTracking() {
  const [buses, setBuses] = useState<Record<string, LiveBusState>>({});
  const [bus1Location, setBus1Location] = useState<BusLocationRow | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const mountedRef = useRef<boolean>(true);
  const lastSupabaseUpsertRef = useRef<number>(0);

  const sendMessage = useCallback((payload: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);

  // 1. WebSocket live fleet feed (/ws/bus-tracking)
  useEffect(() => {
    mountedRef.current = true;

    fetch('/api/buses')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mountedRef.current && data && data.buses) {
          setBuses((prev) => ({
            ...data.buses,
            ...(prev[BUS_1_ID] ? { [BUS_1_ID]: prev[BUS_1_ID] } : {}),
          }));
        }
      })
      .catch(() => {
        // Initial fetch failure handled by WebSocket connect
      });

    const connect = () => {
      if (!mountedRef.current) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws/bus-tracking`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setWsConnected(true);
        ws.send(JSON.stringify({ type: 'subscribe' }));
      };

      ws.onmessage = (evt) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'snapshot' && msg.buses) {
            setBuses((prev) => ({
              ...msg.buses,
              ...(prev[BUS_1_ID] ? { [BUS_1_ID]: prev[BUS_1_ID] } : {}),
            }));
          } else if (msg.type === 'bus_update' && msg.driverId && msg.state) {
            setBuses((prev) => ({
              ...prev,
              [msg.driverId]: msg.state,
            }));
          }
        } catch {
          // Ignore malformed server frame
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setWsConnected(false);
        reconnectRef.current = window.setTimeout(connect, 2500);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectRef.current !== null) {
        clearTimeout(reconnectRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 2. Supabase Realtime (postgres_changes) subscription on `bus_locations` for `id = 'bus-1'`
  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    let active = true;

    const applyBus1Row = (row: BusLocationRow) => {
      if (!active) return;
      const normalized: BusLocationRow = {
        id: row.id || BUS_1_ID,
        lat: Number(row.lat),
        lng: Number(row.lng),
        updated_at: row.updated_at || new Date().toISOString(),
      };
      if (!Number.isFinite(normalized.lat) || !Number.isFinite(normalized.lng)) return;

      setBus1Location(normalized);
      const busState = toLiveBusState(normalized);
      setBuses((prev) => ({
        ...prev,
        [BUS_1_ID]: {
          ...(prev[BUS_1_ID] || {}),
          ...busState,
        },
      }));
    };

    // Fetch initial position of 'bus-1' immediately on load
    fetchBusLocation(BUS_1_ID).then((row) => {
      if (row) applyBus1Row(row);
    });

    const channel = sb
      .channel('realtime-bus-locations-bus-1')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: BUS_LOCATIONS_TABLE,
          filter: `id=eq.${BUS_1_ID}`,
        },
        (payload) => {
          const nextRow = (payload.new || payload.old) as Partial<BusLocationRow> | undefined;
          if (!nextRow) return;
          if (payload.eventType === 'DELETE') {
            if (!active) return;
            setBus1Location(null);
            setBuses((prev) => {
              const copy = { ...prev };
              delete copy[BUS_1_ID];
              return copy;
            });
            return;
          }
          if (nextRow.lat !== undefined && nextRow.lng !== undefined) {
            applyBus1Row({
              id: nextRow.id || BUS_1_ID,
              lat: Number(nextRow.lat),
              lng: Number(nextRow.lng),
              updated_at: nextRow.updated_at || new Date().toISOString(),
            });
          }
        }
      )
      .subscribe((status) => {
        if (!active) return;
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      active = false;
      setRealtimeConnected(false);
      sb.removeChannel(channel);
    };
  }, []);

  const startTrip = useCallback(
    (
      driverId: string,
      direction: TripDirection,
      coords?: { lat: number; lng: number; gpsSource?: GpsSource }
    ) => {
      return sendMessage({
        type: 'driver:start_trip',
        driverId,
        direction,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        gpsSource: coords?.gpsSource ?? null,
      });
    },
    [sendMessage]
  );

  const stopTrip = useCallback(
    (driverId: string) => {
      return sendMessage({ type: 'driver:stop_trip', driverId });
    },
    [sendMessage]
  );

  const sendLocation = useCallback(
    (
      driverId: string,
      payload: {
        lat: number;
        lng: number;
        heading?: number | null;
        speedKmh?: number | null;
        accuracy?: number | null;
        gpsSource?: GpsSource;
        currentStopId?: string | null;
      }
    ) => {
      // Mirror Bus 1 updates into Supabase `bus_locations` (throttled every 3.5s)
      if (driverId === 'drv-mohammed-abdulfatah' || driverId === BUS_1_ID) {
        const now = Date.now();
        if (now - lastSupabaseUpsertRef.current >= 3500) {
          lastSupabaseUpsertRef.current = now;
          upsertBusLocation({
            id: BUS_1_ID,
            lat: payload.lat,
            lng: payload.lng,
          }).catch(() => {});
        }
      }

      return sendMessage({
        type: 'driver:location',
        driverId,
        ...payload,
      });
    },
    [sendMessage]
  );

  const updateStudentStatus = useCallback(
    (
      driverId: string,
      stopId: string,
      status: StudentBoardingStatus,
      checkInCoords?: { lat: number; lng: number } | null
    ) => {
      return sendMessage({
        type: 'driver:student_status',
        driverId,
        stopId,
        status,
        checkInLat: checkInCoords?.lat ?? null,
        checkInLng: checkInCoords?.lng ?? null,
      });
    },
    [sendMessage]
  );

  const resetStatuses = useCallback(
    (driverId: string) => {
      return sendMessage({ type: 'driver:reset_statuses', driverId });
    },
    [sendMessage]
  );

  return {
    buses,
    bus1Location,
    connected: wsConnected || realtimeConnected,
    wsConnected,
    realtimeConnected,
    startTrip,
    stopTrip,
    sendLocation,
    updateStudentStatus,
    resetStatuses,
  };
}
