/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bus,
  Navigation,
  MapPin,
  LogOut,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Search,
  Radio,
  ExternalLink,
  AlertCircle,
  Home,
  School,
} from 'lucide-react';
import { BusDriverRoute, BusStop, SCHOOL_LOCATION } from '../data/busRoutes';
import {
  GpsSource,
  LiveBusState,
  StudentBoardingStatus,
  TripDirection,
} from '../hooks/useBusTracking';
import { LiveBusMap } from './LiveBusMap';
import { Language } from '../lib/translations';

interface DriverPortalProps {
  driver: BusDriverRoute;
  busState?: LiveBusState | null;
  wsConnected: boolean;
  language: Language;
  isRtl: boolean;
  onStartTrip: (
    driverId: string,
    direction: TripDirection,
    coords?: { lat: number; lng: number; gpsSource?: GpsSource }
  ) => void;
  onStopTrip: (driverId: string) => void;
  onSendLocation: (
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
  onUpdateStudentStatus: (
    driverId: string,
    stopId: string,
    status: StudentBoardingStatus,
    checkInCoords?: { lat: number; lng: number } | null
  ) => void;
  onResetStatuses: (driverId: string) => void;
  onSignOut: () => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  driver,
  busState,
  wsConnected,
  language,
  isRtl,
  onStartTrip,
  onStopTrip,
  onSendLocation,
  onUpdateStudentStatus,
  onResetStatuses,
  onSignOut,
}) => {
  const [direction, setDirection] = useState<TripDirection>(busState?.direction || 'pickup');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string>('');
  const [gpsWatching, setGpsWatching] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  const isTripActive = Boolean(busState?.active);

  const stopGpsWatch = () => {
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsWatching(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const beginLiveGpsWatch = (dir: TripDirection) => {
    setGpsError('');

    const initialCoords =
      dir === 'dropoff'
        ? { lat: SCHOOL_LOCATION.lat, lng: SCHOOL_LOCATION.lng, gpsSource: 'stop_checkin' as GpsSource }
        : undefined;

    if (!('geolocation' in navigator)) {
      onStartTrip(driver.id, dir, initialCoords);
      setGpsError(
        language === 'ku'
          ? 'ئامێرێ تە پشتگریا GPS ناکەت. دشێی ب رێکا پشکنینا خاڵێن قوتابیان جھێ باسێ نویکەیت.'
          : language === 'ar'
          ? 'المتصفح لا يدعم GPS. يمكنك تحديث موقع الحافلة يدوياً بالضغط على محطة الطالب.'
          : 'Device geolocation unavailable. Trip started — tap Check In on any stop to broadcast bus position.'
      );
      return;
    }

    onStartTrip(driver.id, dir, initialCoords);
    setGpsWatching(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsError('');
        const speedKmh =
          typeof pos.coords.speed === 'number' && !Number.isNaN(pos.coords.speed)
            ? Number((pos.coords.speed * 3.6).toFixed(1))
            : null;
        onSendLocation(driver.id, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading:
            typeof pos.coords.heading === 'number' && !Number.isNaN(pos.coords.heading)
              ? pos.coords.heading
              : null,
          speedKmh,
          accuracy: Math.round(pos.coords.accuracy),
          gpsSource: 'device_gps',
        });
      },
      (err) => {
        setGpsWatching(false);
        if (err.code === 1) {
          setGpsError(
            language === 'ku'
              ? 'رێدانا GPS هاتە رەتکرن. دشێی راستەوخۆ ل سەر هەر خاڵەکا قوتابیان پشکنینێ بکەی.'
              : language === 'ar'
              ? 'تم رفض إذن الموقع GPS. يمكنك تحديث موقع الحافلة من محطات الطلاب مباشرة.'
              : 'Location permission denied. You can broadcast location by tapping Check In at each stop.'
          );
        } else {
          setGpsError(
            language === 'ku'
              ? 'نیشانا GPS ب دەستنەکەفت. دشێی ب دەستی خاڵان نویکەیت.'
              : language === 'ar'
              ? 'تعذر الحصول على إشارة GPS. استخدم تسجيل الوصول عند المحطة.'
              : 'GPS signal unavailable indoors. Use Check In at stops to update bus position.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 4000,
        timeout: 12000,
      }
    );
  };

  const handleToggleTrip = () => {
    if (isTripActive) {
      stopGpsWatch();
      onStopTrip(driver.id);
    } else {
      beginLiveGpsWatch(direction);
    }
  };

  const handleDirectionChange = (nextDir: TripDirection) => {
    setDirection(nextDir);
    if (isTripActive) {
      onStartTrip(driver.id, nextDir);
    }
  };

  const handleCheckInStop = (stop: BusStop) => {
    setSelectedStopId(stop.id);
    if (typeof stop.lat === 'number' && typeof stop.lng === 'number') {
      onSendLocation(driver.id, {
        lat: stop.lat,
        lng: stop.lng,
        gpsSource: 'stop_checkin',
        currentStopId: stop.id,
      });
    }
  };

  const handleCheckInSchool = () => {
    setSelectedStopId(null);
    onSendLocation(driver.id, {
      lat: SCHOOL_LOCATION.lat,
      lng: SCHOOL_LOCATION.lng,
      gpsSource: 'stop_checkin',
      currentStopId: 'school-hub',
    });
  };

  const handleStatusClick = (stop: BusStop, status: StudentBoardingStatus) => {
    setSelectedStopId(stop.id);
    const coords =
      typeof stop.lat === 'number' && typeof stop.lng === 'number'
        ? { lat: stop.lat, lng: stop.lng }
        : null;
    onUpdateStudentStatus(driver.id, stop.id, status, coords);
  };

  const statuses = busState?.studentStatuses || {};

  const stats = useMemo(() => {
    let boarded = 0;
    let droppedOff = 0;
    let absent = 0;
    let waiting = 0;
    for (const s of driver.stops) {
      const st = statuses[s.id] || 'waiting';
      if (st === 'boarded') boarded++;
      else if (st === 'dropped_off') droppedOff++;
      else if (st === 'absent') absent++;
      else waiting++;
    }
    return {
      totalStops: driver.stops.length,
      totalRiders: driver.stops.reduce((sum, s) => sum + s.riders.length, 0),
      boarded,
      droppedOff,
      absent,
      waiting,
    };
  }, [driver.stops, statuses]);

  const filteredStops = useMemo(() => {
    if (!searchQuery.trim()) return driver.stops;
    const q = searchQuery.toLowerCase().trim();
    return driver.stops.filter(
      (s) =>
        s.studentNamesLabel.toLowerCase().includes(q) ||
        String(s.order).includes(q) ||
        (s.landmarkNote || '').toLowerCase().includes(q)
    );
  }, [driver.stops, searchQuery]);

  const statusBadge = (status: StudentBoardingStatus) => {
    switch (status) {
      case 'boarded':
        return {
          cls: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          label: language === 'ku' ? 'سواربوو' : language === 'ar' ? 'في الحافلة' : 'Boarded',
        };
      case 'dropped_off':
        return {
          cls: 'bg-[#E1F3F7] text-[#0087A5] border-[#C8E5EC]',
          label: language === 'ku' ? 'گەهشت' : language === 'ar' ? 'تم التوصيل' : 'Dropped Off',
        };
      case 'absent':
        return {
          cls: 'bg-rose-100 text-rose-800 border-rose-200',
          label: language === 'ku' ? 'نەهات' : language === 'ar' ? 'غائب' : 'Absent',
        };
      default:
        return {
          cls: 'bg-[#F5F6FF] text-[#454A87] border-[#E1E9FF]',
          label: language === 'ku' ? 'چاڤەڕێ' : language === 'ar' ? 'في الانتظار' : 'Waiting',
        };
    }
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Driver Top Banner */}
      <div className="bg-gradient-to-r from-[#1A1D4E] via-[#006F89] to-[#0087A5] text-white rounded-3xl p-5 sm:p-6 shadow-[0_10px_28px_rgba(0,135,165,0.28)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/25 shrink-0">
            <Bus className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                {driver.code}
              </span>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isTripActive ? 'bg-emerald-500 text-white' : 'bg-white/15 text-white/90'
                }`}
              >
                <Radio className={`w-3 h-3 ${isTripActive ? 'animate-pulse' : ''}`} />
                {isTripActive
                  ? language === 'ku'
                    ? 'ب رێکێ ڤە (زیندوو)'
                    : language === 'ar'
                    ? 'رحلة نشطة مباشر'
                    : 'LIVE ROUTE ACTIVE'
                  : language === 'ku'
                  ? 'ئامادە'
                  : language === 'ar'
                  ? 'في الانتظار'
                  : 'STANDBY'}
              </span>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full">
                {wsConnected ? 'WS Connected' : 'Connecting...'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              {driver.name} ({driver.nameEn})
            </h2>
            <p className="text-xs text-white/85">
              {stats.totalStops}{' '}
              {language === 'ku' ? 'خاڵێن مالا قوتابیان' : language === 'ar' ? 'محطة منزلية' : 'House Stops'}{' '}
              • {stats.totalRiders}{' '}
              {language === 'ku' ? 'قوتابی' : language === 'ar' ? 'طالب' : 'Assigned Students'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Direction Selector */}
          <div className="flex items-center bg-white/15 p-1 rounded-xl border border-white/20">
            <button
              type="button"
              onClick={() => handleDirectionChange('pickup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                direction === 'pickup' ? 'bg-white text-[#1A1D4E] shadow-xs' : 'text-white/90 hover:bg-white/10'
              }`}
            >
              {language === 'ku' ? 'هاتن بۆ قوتابخانێ' : language === 'ar' ? 'صباحي (للمدرسة)' : 'Morning Pickup'}
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange('dropoff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                direction === 'dropoff' ? 'bg-white text-[#1A1D4E] shadow-xs' : 'text-white/90 hover:bg-white/10'
              }`}
            >
              {language === 'ku' ? 'زڤڕین بۆ مال' : language === 'ar' ? 'مسائي (للمنازل)' : 'Home Drop-off'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleTrip}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
              isTripActive
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isTripActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>
              {isTripActive
                ? language === 'ku'
                  ? 'راوەستاندنا گەشتێ'
                  : language === 'ar'
                  ? 'إنهاء الرحلة'
                  : 'End Live Trip'
                : language === 'ku'
                ? 'دەستپێکرنا پەخشێ زیندوو'
                : language === 'ar'
                ? 'بدء التتبع المباشر'
                : 'Start Live Trip (GPS)'}
            </span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5 border border-white/25"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'دەرچوون' : language === 'ar' ? 'خروج' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* GPS Status or Error Banner */}
      {gpsError && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{gpsError}</span>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">
            {language === 'ku' ? 'چاڤەڕێ' : language === 'ar' ? 'في الانتظار' : 'Waiting'}
          </span>
          <span className="text-2xl font-black text-[#1A1D4E]">{stats.waiting}</span>
        </div>
        <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
            {language === 'ku' ? 'ل ناڤ باسێ دا' : language === 'ar' ? 'على متن الحافلة' : 'Boarded'}
          </span>
          <span className="text-2xl font-black text-emerald-600">{stats.boarded}</span>
        </div>
        <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0087A5] block mb-1">
            {language === 'ku' ? 'گەهاندی' : language === 'ar' ? 'تم التوصيل' : 'Dropped Off'}
          </span>
          <span className="text-2xl font-black text-[#0087A5]">{stats.droppedOff}</span>
        </div>
        <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
            {language === 'ku' ? 'نەهاتی' : language === 'ar' ? 'غائب' : 'Absent'}
          </span>
          <span className="text-2xl font-black text-rose-600">{stats.absent}</span>
        </div>
        <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">
            {language === 'ku' ? 'ژێدەرێ جھێ باسێ' : language === 'ar' ? 'مصدر الموقع' : 'GPS Telemetry'}
          </span>
          <span className="text-xs font-extrabold text-[#1A1D4E] block mt-1">
            {gpsWatching
              ? busState?.accuracy
                ? `Live GPS (±${busState.accuracy}m)`
                : 'GPS Active...'
              : busState?.gpsSource === 'stop_checkin'
              ? 'Stop Check-in Pin'
              : 'Ready'}
          </span>
          {busState?.updatedAt && (
            <span className="text-[10px] font-mono text-[#6B70A6] block mt-0.5">
              {new Date(busState.updatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Main Split View: Map + Student Houses Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Top: Interactive Live Map */}
        <div className="lg:col-span-7 bg-white border border-[#E1E9FF] rounded-3xl p-4 sm:p-5 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E1E9FF]">
            <div>
              <h3 className="text-base font-black text-[#1A1D4E] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0087A5]" />
                <span>
                  {language === 'ku'
                    ? 'نەخشەیا مالێن قوتابیان و جھێ باسێ'
                    : language === 'ar'
                    ? 'خريطة منازل الطلاب وموقع الحافلة المباشر'
                    : 'Live Bus & Student Houses Map (Duhok)'}
                </span>
              </h3>
              <p className="text-[11px] text-[#6B70A6]">
                {language === 'ku'
                  ? 'کلیک ل هەر خاڵەکێ بکە بۆ بینینا ناڤێ قوتابی و رێنماییا Google Maps'
                  : language === 'ar'
                  ? 'اضغط على أي رقم منزل لعرض الأسماء وفتح المسار في خرائط جوجل'
                  : 'Tap any numbered house marker to view student names or launch Google Maps navigation'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onResetStatuses(driver.id)}
              className="px-3 py-1.5 bg-[#F5F6FF] hover:bg-[#E1E9FF] text-[#454A87] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'نووکرنا لیستێ' : language === 'ar' ? 'إعادة ضبط القائمة' : 'Reset Shift'}</span>
            </button>
          </div>

          <LiveBusMap
            stops={driver.stops}
            busState={busState}
            direction={direction}
            driverName={driver.name}
            driverCode={driver.code}
            highlightedStopId={selectedStopId}
            onSelectStop={(id) => setSelectedStopId(id)}
            focusKey={`driver-${driver.id}`}
            heightClass="h-[420px] sm:h-[540px]"
          />
        </div>

        {/* Right/Bottom: Ordered House Stops Checklist */}
        <div className="lg:col-span-5 bg-white border border-[#E1E9FF] rounded-3xl p-4 sm:p-5 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E1E9FF]">
            <h3 className="text-base font-black text-[#1A1D4E]">
              {language === 'ku' ? 'لیستا قوتابیان و ناڤونیشان' : language === 'ar' ? 'قائمة الطلاب والمنازل' : 'Student Houses Checklist'}
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E1F3F7] text-[#0087A5]">
              {filteredStops.length} / {driver.stops.length}
            </span>
          </div>

          {/* Official School Hub Card (Departure / Arrival Point for All Buses) */}
          <div className="p-3.5 rounded-2xl border-2 border-[#00A887]/50 bg-gradient-to-r from-[#1A1D4E]/5 to-[#E1F3F7]/70 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1A1D4E] text-white flex items-center justify-center shrink-0 border-2 border-[#00A887]">
                <School className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0087A5] block">
                  {direction === 'dropoff'
                    ? language === 'ku'
                      ? 'خاڵا دەرکەفتنێ (ژ قوتابخانێ)'
                      : language === 'ar'
                      ? 'نقطة الانطلاق (المدرسة)'
                      : 'Origin Hub • Depart from School'
                    : language === 'ku'
                    ? 'ئارمانجا دووماهیێ (گەهشتن بۆ قوتابخانێ)'
                    : language === 'ar'
                    ? 'الوجهة النهائية (الوصول للمدرسة)'
                    : 'Destination Hub • Arrive at School'}
                </span>
                <h4 className="text-xs font-black text-[#1A1D4E]">
                  {language === 'ku'
                    ? SCHOOL_LOCATION.nameKu
                    : language === 'ar'
                    ? SCHOOL_LOCATION.nameAr
                    : SCHOOL_LOCATION.name}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCheckInSchool}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-[#1A1D4E] hover:bg-[#272B6B] text-white cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <MapPin className="w-3 h-3 text-[#00A887]" />
                <span>
                  {language === 'ku'
                    ? 'ل قوتابخانێ یە'
                    : language === 'ar'
                    ? 'في المدرسة'
                    : direction === 'dropoff'
                    ? 'At School Gate'
                    : 'Arrived School'}
                </span>
              </button>
              <a
                href={SCHOOL_LOCATION.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-[#0087A5] hover:bg-[#00738D] text-white flex items-center gap-1 shadow-2xs"
              >
                <Navigation className="w-3 h-3" />
                <span>Maps</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-80" />
              </a>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className={`w-3.5 h-3.5 text-[#8C90C2] absolute top-2.5 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ku'
                  ? 'گەڕان ل ناڤێ قوتابی...'
                  : language === 'ar'
                  ? 'ابحث عن اسم الطالب...'
                  : 'Search student name...'
              }
              className={`w-full py-2 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl text-xs text-[#1A1D4E] placeholder:text-[#8C90C2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0087A5] ${
                isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
              }`}
            />
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredStops.map((stop) => {
              const currentStatus: StudentBoardingStatus = statuses[stop.id] || 'waiting';
              const badge = statusBadge(currentStatus);
              const isSelected = selectedStopId === stop.id;

              return (
                <div
                  key={stop.id}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'border-[#0087A5] bg-[#F0F8FA]'
                      : 'border-[#E1E9FF] bg-white hover:border-[#C8E5EC]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-[#1A1D4E] text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {stop.order}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-sm font-black text-[#1A1D4E] leading-snug">
                            {stop.studentNamesLabel}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {stop.riders.map((r, rIdx) =>
                            r.gradeSectionLabel ? (
                              <span
                                key={`${stop.id}-r-${rIdx}`}
                                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#E1E9FF] text-[#1A1D4E]"
                              >
                                {r.label} ({r.gradeSectionLabel})
                              </span>
                            ) : null
                          )}
                          {stop.landmarkNote && (
                            <span className="text-[10px] text-[#6B70A6] flex items-center gap-1">
                              <Home className="w-3 h-3" />
                              {stop.landmarkNote}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Quick Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E1E9FF]/70">
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusClick(stop, 'boarded');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                          currentStatus === 'boarded'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{language === 'ku' ? 'سواربوو' : language === 'ar' ? 'صعد' : 'Boarded'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusClick(stop, 'dropped_off');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                          currentStatus === 'dropped_off'
                            ? 'bg-[#0087A5] text-white'
                            : 'bg-[#E1F3F7] text-[#0087A5] hover:bg-[#C8E5EC]'
                        }`}
                      >
                        <Home className="w-3 h-3" />
                        <span>{language === 'ku' ? 'گەهشت' : language === 'ar' ? 'نزل' : 'Dropped'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusClick(stop, 'absent');
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                          currentStatus === 'absent'
                            ? 'bg-rose-600 text-white'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        <XCircle className="w-3 h-3" />
                        <span>{language === 'ku' ? 'نەهات' : language === 'ar' ? 'غائب' : 'Absent'}</span>
                      </button>

                      {currentStatus !== 'waiting' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusClick(stop, 'waiting');
                          }}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer bg-[#F5F6FF] text-[#6B70A6] hover:bg-[#E1E9FF]"
                          title="Reset to waiting"
                        >
                          <Clock className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {typeof stop.lat === 'number' && typeof stop.lng === 'number' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckInStop(stop);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#EEF0FF] hover:bg-[#E1E9FF] text-[#1A1D4E] cursor-pointer flex items-center gap-1"
                          title="Set live bus pin to this house location"
                        >
                          <MapPin className="w-3 h-3 text-[#0087A5]" />
                          <span>{language === 'ku' ? 'نیشانکرن' : language === 'ar' ? 'تحديد هنا' : 'Check In'}</span>
                        </button>
                      )}

                      {stop.googleMapsUrl ? (
                        <a
                          href={stop.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#0087A5] hover:bg-[#00738D] text-white flex items-center gap-1 shadow-2xs"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Maps</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-mono text-[#8C90C2] px-2">No Pin</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};
