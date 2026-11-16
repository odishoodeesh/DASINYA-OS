/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bus,
  CheckCircle2,
  Compass,
  Lock,
  LogOut,
  Navigation,
  Play,
  Radio,
  ShieldCheck,
  Smartphone,
  Square,
} from 'lucide-react';
import { BUS_1_ID, upsertBusLocation } from '../lib/supabase';
import {
  authenticateDriver,
  BUS_DRIVER_ROUTES,
  BusDriverRoute,
  SCHOOL_LOCATION,
} from '../data/busRoutes';
import { GpsSource, TripDirection } from '../hooks/useBusTracking';
import { LiveBusMap } from './LiveBusMap';

interface DriverRouteTrackerPageProps {
  authenticatedDriver: BusDriverRoute | null;
  onDriverAuthenticated: (driver: BusDriverRoute) => void;
  onDriverSignOut: () => void;
  onNavigateHome: () => void;
  onStartTrip?: (
    driverId: string,
    direction: TripDirection,
    coords?: { lat: number; lng: number; gpsSource?: GpsSource }
  ) => void;
  onStopTrip?: (driverId: string) => void;
  onSendLocation?: (
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
  ) => void;
}

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
}

interface GpsTelemetry {
  lat: number;
  lng: number;
  accuracy: number | null;
  speedKmh: number | null;
  heading: number | null;
}

export const DriverRouteTrackerPage: React.FC<DriverRouteTrackerPageProps> = ({
  authenticatedDriver,
  onDriverAuthenticated,
  onDriverSignOut,
  onNavigateHome,
  onStartTrip,
  onStopTrip,
  onSendLocation,
}) => {
  // Driver sign-in form state when /driver is opened directly without active driver session
  const [selectedCode, setSelectedCode] = useState<string>(BUS_DRIVER_ROUTES[0]?.code || 'BUS-01');
  const [pinInput, setPinInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'active' | 'error'>('idle');
  const [gpsError, setGpsError] = useState<string>('');
  const [telemetry, setTelemetry] = useState<GpsTelemetry | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncCount, setSyncCount] = useState<number>(0);
  const [supabaseError, setSupabaseError] = useState<string>('');
  const [wakeLockState, setWakeLockState] = useState<'inactive' | 'active' | 'unsupported'>(() =>
    typeof navigator !== 'undefined' && 'wakeLock' in navigator ? 'inactive' : 'unsupported'
  );
  const [showMapPreview, setShowMapPreview] = useState<boolean>(true);

  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const latestTelemetryRef = useRef<GpsTelemetry | null>(null);
  const lastUpsertMsRef = useRef<number>(0);
  const isTrackingRef = useRef<boolean>(false);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        if (!wakeLockRef.current.released) {
          await wakeLockRef.current.release();
        }
      } catch {
        // Ignore release errors
      }
      wakeLockRef.current = null;
    }
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      setWakeLockState('inactive');
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      setWakeLockState('unsupported');
      return;
    }
    try {
      const navWithWakeLock = navigator as unknown as {
        wakeLock: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
      };
      const sentinel = await navWithWakeLock.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      setWakeLockState('active');
      sentinel.addEventListener('release', () => {
        if (!isTrackingRef.current) {
          setWakeLockState('inactive');
        }
      });
    } catch {
      // Browser may decline wake lock (e.g. low battery saver mode); non-fatal
      setWakeLockState('inactive');
    }
  }, []);

  const pushPositionToSupabase = useCallback(
    async (coords: GpsTelemetry) => {
      if (!authenticatedDriver) return;
      const nowIso = new Date().toISOString();
      lastUpsertMsRef.current = Date.now();
      const res = await upsertBusLocation({
        id: BUS_1_ID,
        lat: coords.lat,
        lng: coords.lng,
        updatedAt: nowIso,
      });
      if (res.ok) {
        setSupabaseError('');
        setLastSyncedAt(nowIso);
        setSyncCount((c) => c + 1);
      } else if (res.error) {
        setSupabaseError(res.error);
      }
    },
    [authenticatedDriver]
  );

  const stopRoute = useCallback(() => {
    isTrackingRef.current = false;
    setIsTracking(false);
    setGpsStatus('idle');
    setGpsError('');

    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    void releaseWakeLock();
    if (authenticatedDriver) {
      onStopTrip?.(authenticatedDriver.id);
    }
  }, [authenticatedDriver, onStopTrip, releaseWakeLock]);

  const startRoute = useCallback(() => {
    if (!authenticatedDriver) return;
    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      setGpsError('Geolocation is not supported by this browser/device.');
      return;
    }

    isTrackingRef.current = true;
    setIsTracking(true);
    setGpsStatus('acquiring');
    setGpsError('');
    setSupabaseError('');
    lastUpsertMsRef.current = 0;

    onStartTrip?.(authenticatedDriver.id, 'pickup');

    // Keep phone screen awake during live GPS broadcasting
    void requestWakeLock();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (!isTrackingRef.current) return;
        const nextTelemetry: GpsTelemetry = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy:
            typeof pos.coords.accuracy === 'number' && !Number.isNaN(pos.coords.accuracy)
              ? Math.round(pos.coords.accuracy)
              : null,
          speedKmh:
            typeof pos.coords.speed === 'number' && !Number.isNaN(pos.coords.speed)
              ? Number((pos.coords.speed * 3.6).toFixed(1))
              : null,
          heading:
            typeof pos.coords.heading === 'number' && !Number.isNaN(pos.coords.heading)
              ? pos.coords.heading
              : null,
        };

        latestTelemetryRef.current = nextTelemetry;
        setTelemetry(nextTelemetry);
        setGpsStatus('active');
        setGpsError('');

        onSendLocation?.(authenticatedDriver.id, {
          lat: nextTelemetry.lat,
          lng: nextTelemetry.lng,
          heading: nextTelemetry.heading,
          speedKmh: nextTelemetry.speedKmh,
          accuracy: nextTelemetry.accuracy,
          gpsSource: 'device_gps',
        });

        // Push immediately on first fix or if >= 3.5 seconds since last upsert
        if (Date.now() - lastUpsertMsRef.current >= 3500) {
          void pushPositionToSupabase(nextTelemetry);
        }
      },
      (err) => {
        if (!isTrackingRef.current) return;
        setGpsStatus('error');
        if (err.code === 1) {
          setGpsError(
            'Location permission denied. Please enable GPS location access in your phone browser settings.'
          );
        } else if (err.code === 2) {
          setGpsError('GPS signal currently unavailable. Ensure device Location / GPS is turned on.');
        } else {
          setGpsError('GPS signal timed out while acquiring high-accuracy position. Retrying...');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      }
    );

    // Ensure regular upsert every 4 seconds (3–5s cadence) while active
    intervalIdRef.current = window.setInterval(() => {
      if (!isTrackingRef.current || !latestTelemetryRef.current) return;
      if (Date.now() - lastUpsertMsRef.current >= 3500) {
        void pushPositionToSupabase(latestTelemetryRef.current);
      }
    }, 4000);
  }, [authenticatedDriver, onSendLocation, onStartTrip, pushPositionToSupabase, requestWakeLock]);

  // Re-acquire Screen Wake Lock when driver switches back to this browser tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isTrackingRef.current) {
        void requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [requestWakeLock]);

  // Clean up GPS watcher, interval, and Wake Lock on unmount
  useEffect(() => {
    return () => {
      isTrackingRef.current = false;
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalIdRef.current !== null) {
        window.clearInterval(intervalIdRef.current);
      }
      void releaseWakeLock();
    };
  }, [releaseWakeLock]);

  const handleDriverSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCode || !pinInput.trim()) {
      setAuthError('Please select a bus driver and enter your Driver PIN.');
      return;
    }
    const matched = authenticateDriver(selectedCode, pinInput);
    if (!matched) {
      setAuthError('Invalid Bus Code or Driver PIN. Only authorized drivers can control live GPS.');
      return;
    }
    setAuthError('');
    setPinInput('');
    onDriverAuthenticated(matched);
  };

  const handleSignOutClick = () => {
    if (isTrackingRef.current) {
      stopRoute();
    }
    onDriverSignOut();
  };

  // Gate: Only authenticated drivers can start/stop live GPS
  if (!authenticatedDriver) {
    return (
      <div className="min-h-[100dvh] bg-[#F5F6FF] text-[#1A1D4E] flex flex-col">
        <header className="w-full bg-white border-b border-[#E1E9FF] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0087A5] to-[#00A887] text-white flex items-center justify-center shadow-xs shrink-0">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-[#1A1D4E] leading-tight">
                Dasinya Driver GPS
              </h1>
              <p className="text-[11px] font-bold text-[#6B70A6]">Driver Authorization Required</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="px-3 py-2 rounded-xl border border-[#E1E9FF] bg-[#F5F6FF] hover:bg-[#E1E9FF] text-xs font-bold text-[#1A1D4E] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(0,135,165,0.08)] space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E6FAF6] border border-[#B6EADF] text-[#00A887] flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-[#1A1D4E]">Driver Login Only</h2>
              <p className="text-xs text-[#6B70A6] leading-relaxed">
                Only an authorized school bus driver can start or stop live GPS location tracking.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleDriverSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#454A87]">
                  Select Driver / Bus Route
                </label>
                <div className="relative">
                  <Bus className="w-4 h-4 text-[#00A887] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedCode}
                    onChange={(e) => {
                      setSelectedCode(e.target.value);
                      setAuthError('');
                    }}
                    className="w-full bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-[#1A1D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                  >
                    {BUS_DRIVER_ROUTES.map((drv) => (
                      <option key={drv.id} value={drv.code}>
                        {drv.code} — {drv.name} ({drv.stops.length} stops)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#454A87]">
                  Driver PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#00A887] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter Driver PIN"
                    className="w-full bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-[#1A1D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A887]"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#00A887] hover:bg-[#008E72] text-white text-sm font-extrabold shadow-[0_4px_14px_rgba(0,168,135,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In as Driver</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  const liveMapBusState = telemetry
    ? {
        driverId: BUS_1_ID,
        active: isTracking,
        direction: 'pickup' as const,
        lat: telemetry.lat,
        lng: telemetry.lng,
        heading: telemetry.heading,
        speedKmh: telemetry.speedKmh,
        accuracy: telemetry.accuracy,
        updatedAt: lastSyncedAt || new Date().toISOString(),
        tripStartedAt: null,
        currentStopId: null,
        gpsSource: 'device_gps' as const,
        studentStatuses: {},
      }
    : null;

  return (
    <div className="min-h-[100dvh] bg-[#F5F6FF] text-[#1A1D4E] flex flex-col">
      {/* Compact Mobile Header */}
      <header className="w-full bg-white border-b border-[#E1E9FF] px-4 py-3 flex items-center justify-between gap-2 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0087A5] to-[#00A887] text-white flex items-center justify-center shadow-xs shrink-0">
            <Bus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black text-[#1A1D4E] leading-tight truncate">
              {authenticatedDriver.nameEn}
            </h1>
            <p className="text-[11px] font-mono font-bold text-[#0087A5] truncate">
              {authenticatedDriver.code} • Bus ID: {BUS_1_ID}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-3 py-2 rounded-xl border border-[#E1E9FF] bg-[#F5F6FF] hover:bg-[#E1E9FF] text-xs font-bold text-[#1A1D4E] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portal</span>
          </button>

          <button
            type="button"
            onClick={handleSignOutClick}
            className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Mobile Control Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Live GPS Status Indicator Card */}
        <section
          className={`rounded-3xl p-5 sm:p-6 border-2 shadow-sm transition-all ${
            gpsStatus === 'active'
              ? 'bg-emerald-50/90 border-emerald-400'
              : gpsStatus === 'acquiring'
              ? 'bg-amber-50/90 border-amber-300'
              : gpsStatus === 'error'
              ? 'bg-rose-50/90 border-rose-300'
              : 'bg-white border-[#E1E9FF]'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`relative flex h-4 w-4 shrink-0 ${
                  gpsStatus === 'active' ? 'text-emerald-500' : ''
                }`}
              >
                {gpsStatus === 'active' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-4 w-4 ${
                    gpsStatus === 'active'
                      ? 'bg-emerald-500'
                      : gpsStatus === 'acquiring'
                      ? 'bg-amber-500 animate-pulse'
                      : gpsStatus === 'error'
                      ? 'bg-rose-500'
                      : 'bg-slate-400'
                  }`}
                />
              </span>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B70A6] block">
                  Live GPS Status • Driver Control
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#1A1D4E]">
                  {gpsStatus === 'active'
                    ? 'LIVE • Broadcasting GPS'
                    : gpsStatus === 'acquiring'
                    ? 'Acquiring High-Accuracy GPS...'
                    : gpsStatus === 'error'
                    ? 'GPS Signal Attention Needed'
                    : 'Standby • Press Start to Track'}
                </h2>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-extrabold border ${
                isTracking
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-[#F5F6FF] text-[#454A87] border-[#E1E9FF]'
              }`}
            >
              {isTracking ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* Primary Large Action Button */}
          <div className="mt-5">
            <button
              type="button"
              onClick={isTracking ? stopRoute : startRoute}
              className={`w-full min-h-[72px] rounded-2xl font-black text-lg sm:text-xl text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer ${
                isTracking
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30'
                  : 'bg-[#00A887] hover:bg-[#008E72] shadow-emerald-500/30'
              }`}
            >
              {isTracking ? (
                <>
                  <Square className="w-6 h-6 fill-current" />
                  <span>Stop Route</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  <span>Start Route</span>
                </>
              )}
            </button>
          </div>

          {/* Status Badges Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border ${
                wakeLockState === 'active'
                  ? 'bg-white text-emerald-700 border-emerald-200'
                  : 'bg-[#F5F6FF] text-[#6B70A6] border-[#E1E9FF]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>
                Screen Wake Lock:{' '}
                {wakeLockState === 'active'
                  ? 'ON (Screen Stays Awake)'
                  : wakeLockState === 'unsupported'
                  ? 'Not Supported'
                  : 'Standby'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-white border border-[#E1E9FF] text-[#0087A5]">
              <Radio className={`w-3.5 h-3.5 ${isTracking ? 'animate-pulse' : ''}`} />
              <span>Updates Sent: {syncCount} (every 4s)</span>
            </span>
          </div>
        </section>

        {/* Error Banners */}
        {gpsError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{gpsError}</span>
          </div>
        )}

        {supabaseError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Supabase sync notice: {supabaseError}</span>
          </div>
        )}

        {/* Telemetry Readout Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-[#E1E9FF] rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#0087A5]" />
              Coordinates
            </span>
            <p className="text-xs font-mono font-extrabold text-[#1A1D4E] mt-1">
              {telemetry
                ? `${telemetry.lat.toFixed(5)}, ${telemetry.lng.toFixed(5)}`
                : 'Waiting for Start...'}
            </p>
          </div>

          <div className="bg-white border border-[#E1E9FF] rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#00A887]" />
              Speed & Accuracy
            </span>
            <p className="text-xs font-mono font-extrabold text-[#1A1D4E] mt-1">
              {telemetry
                ? `${telemetry.speedKmh !== null ? `${telemetry.speedKmh} km/h` : '0 km/h'} • ±${telemetry.accuracy ?? '?'}m`
                : '—'}
            </p>
          </div>

          <div className="bg-white border border-[#E1E9FF] rounded-2xl p-3.5 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Last DB Sync
            </span>
            <p className="text-xs font-mono font-extrabold text-[#1A1D4E] mt-1 flex items-center gap-1">
              {lastSyncedAt ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{new Date(lastSyncedAt).toLocaleTimeString()}</span>
                </>
              ) : (
                'Not synced yet'
              )}
            </p>
          </div>
        </section>

        {/* Live OpenStreetMap Preview for Driver */}
        <section className="bg-white border border-[#E1E9FF] rounded-3xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#1A1D4E]">Route & Student Pins Preview</h3>
              <p className="text-[11px] text-[#6B70A6]">
                {SCHOOL_LOCATION.name} • {authenticatedDriver.stops.length} student stops
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMapPreview((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-[#F5F6FF] hover:bg-[#E1E9FF] text-xs font-bold text-[#0087A5] cursor-pointer"
            >
              {showMapPreview ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          {showMapPreview && (
            <LiveBusMap
              stops={authenticatedDriver.stops}
              busState={liveMapBusState}
              driverName={authenticatedDriver.nameEn}
              driverCode={authenticatedDriver.code}
              focusKey={`driver-mobile-${authenticatedDriver.id}`}
              heightClass="h-[320px] sm:h-[380px]"
            />
          )}
        </section>
      </main>
    </div>
  );
};
