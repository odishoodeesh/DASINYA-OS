/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type TripDirection = 'pickup' | 'dropoff';
export type StudentBoardingStatus = 'waiting' | 'boarded' | 'dropped_off' | 'absent';
export type GpsSource = 'device_gps' | 'stop_checkin';

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

export function useBusTracking() {
  const [buses, setBuses] = useState<Record<string, LiveBusState>>({});
  const [connected, setConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const mountedRef = useRef<boolean>(true);

  const sendMessage = useCallback((payload: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Fetch initial REST snapshot immediately
    fetch('/api/buses')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mountedRef.current && data && data.buses) {
          setBuses(data.buses);
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
        setConnected(true);
        ws.send(JSON.stringify({ type: 'subscribe' }));
      };

      ws.onmessage = (evt) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'snapshot' && msg.buses) {
            setBuses(msg.buses);
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
        setConnected(false);
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
    connected,
    startTrip,
    stopTrip,
    sendLocation,
    updateStudentStatus,
    resetStatuses,
  };
}
