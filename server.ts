/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import http from 'node:http';
import path from 'node:path';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

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

type IncomingMessage =
  | { type: 'subscribe' }
  | {
      type: 'driver:start_trip';
      driverId: string;
      direction: TripDirection;
      lat?: number | null;
      lng?: number | null;
      gpsSource?: GpsSource | null;
    }
  | { type: 'driver:stop_trip'; driverId: string }
  | {
      type: 'driver:location';
      driverId: string;
      lat: number;
      lng: number;
      heading?: number | null;
      speedKmh?: number | null;
      accuracy?: number | null;
      gpsSource?: GpsSource;
      currentStopId?: string | null;
    }
  | {
      type: 'driver:student_status';
      driverId: string;
      stopId: string;
      status: StudentBoardingStatus;
      checkInLat?: number | null;
      checkInLng?: number | null;
    }
  | { type: 'driver:reset_statuses'; driverId: string };

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Official Dasinya Private School Location (Origin for Drop-off, Destination for Pickup)
export const SCHOOL_COORDS = {
  lat: 36.8611058,
  lng: 42.9783187,
} as const;

// Server-authoritative live state keyed by driverId
const fleetState = new Map<string, LiveBusState>();

function getOrCreateBus(driverId: string): LiveBusState {
  const existing = fleetState.get(driverId);
  if (existing) return existing;
  const fresh: LiveBusState = {
    driverId,
    active: false,
    direction: 'pickup',
    lat: null,
    lng: null,
    heading: null,
    speedKmh: null,
    accuracy: null,
    updatedAt: null,
    tripStartedAt: null,
    currentStopId: null,
    gpsSource: null,
    studentStatuses: {},
  };
  fleetState.set(driverId, fresh);
  return fresh;
}

function serializeFleet(): Record<string, LiveBusState> {
  const out: Record<string, LiveBusState> = {};
  for (const [id, state] of fleetState.entries()) {
    out[id] = state;
  }
  return out;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/config', (_req, res) => {
    res.json({
      googleMapsApiKey:
        process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
    });
  });

  app.get('/api/buses', (_req, res) => {
    res.json({ buses: serializeFleet() });
  });

  const server = http.createServer(app);

  // Explicit WebSocket endpoint so Vite HMR websocket paths are untouched
  const wss = new WebSocketServer({ server, path: '/ws/bus-tracking' });

  function broadcast(payload: unknown) {
    const serialized = JSON.stringify(payload);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serialized);
      }
    }
  }

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'snapshot', buses: serializeFleet() }));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as IncomingMessage;
        if (!msg || typeof msg !== 'object') return;

        if (msg.type === 'subscribe') {
          ws.send(JSON.stringify({ type: 'snapshot', buses: serializeFleet() }));
          return;
        }

        if (!('driverId' in msg) || typeof msg.driverId !== 'string' || !msg.driverId.trim()) {
          return;
        }

        const driverId = msg.driverId.trim();
        const bus = getOrCreateBus(driverId);
        const nowIso = new Date().toISOString();

        switch (msg.type) {
          case 'driver:start_trip': {
            bus.active = true;
            bus.direction = msg.direction === 'dropoff' ? 'dropoff' : 'pickup';
            bus.tripStartedAt = nowIso;
            bus.updatedAt = nowIso;
            if (typeof msg.lat === 'number' && typeof msg.lng === 'number') {
              bus.lat = msg.lat;
              bus.lng = msg.lng;
              bus.gpsSource = msg.gpsSource || 'device_gps';
            } else if (bus.direction === 'dropoff' && (bus.lat === null || bus.lng === null)) {
              // Leaving school on afternoon drop-off: anchor initial bus pin at school hub
              bus.lat = SCHOOL_COORDS.lat;
              bus.lng = SCHOOL_COORDS.lng;
              bus.currentStopId = 'school-hub';
              bus.gpsSource = 'stop_checkin';
            }
            fleetState.set(driverId, bus);
            broadcast({ type: 'bus_update', driverId, state: bus });
            break;
          }

          case 'driver:stop_trip': {
            bus.active = false;
            bus.updatedAt = nowIso;
            bus.speedKmh = 0;
            if (bus.direction === 'pickup') {
              // Arrived at school after morning pickup
              bus.lat = SCHOOL_COORDS.lat;
              bus.lng = SCHOOL_COORDS.lng;
              bus.currentStopId = 'school-hub';
              bus.gpsSource = 'stop_checkin';
            }
            fleetState.set(driverId, bus);
            broadcast({ type: 'bus_update', driverId, state: bus });
            break;
          }

          case 'driver:location': {
            if (typeof msg.lat !== 'number' || typeof msg.lng !== 'number') return;
            bus.lat = msg.lat;
            bus.lng = msg.lng;
            bus.heading = typeof msg.heading === 'number' ? msg.heading : bus.heading;
            bus.speedKmh = typeof msg.speedKmh === 'number' ? msg.speedKmh : bus.speedKmh;
            bus.accuracy = typeof msg.accuracy === 'number' ? msg.accuracy : bus.accuracy;
            bus.gpsSource = msg.gpsSource || 'device_gps';
            if (msg.currentStopId !== undefined) {
              bus.currentStopId = msg.currentStopId;
            }
            bus.updatedAt = nowIso;
            fleetState.set(driverId, bus);
            broadcast({ type: 'bus_update', driverId, state: bus });
            break;
          }

          case 'driver:student_status': {
            if (!msg.stopId) return;
            bus.studentStatuses[msg.stopId] = msg.status;
            bus.currentStopId = msg.stopId;
            bus.updatedAt = nowIso;
            if (
              typeof msg.checkInLat === 'number' &&
              typeof msg.checkInLng === 'number' &&
              bus.gpsSource !== 'device_gps'
            ) {
              bus.lat = msg.checkInLat;
              bus.lng = msg.checkInLng;
              bus.gpsSource = 'stop_checkin';
            }
            fleetState.set(driverId, bus);
            broadcast({ type: 'bus_update', driverId, state: bus });
            break;
          }

          case 'driver:reset_statuses': {
            bus.studentStatuses = {};
            bus.currentStopId = null;
            bus.updatedAt = nowIso;
            fleetState.set(driverId, bus);
            broadcast({ type: 'bus_update', driverId, state: bus });
            break;
          }
        }
      } catch {
        // Ignore malformed payloads
      }
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(import.meta.dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Dasinya School Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
