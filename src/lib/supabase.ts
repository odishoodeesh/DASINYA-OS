/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { DailySubjectRecord } from '../data/teacherPortal';

const DEFAULT_PROJECT_URL = 'https://knwkwzwjhepobqxpamkd.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtud2t3endqaGVwb2JxeHBhbWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4MTM4NzAsImV4cCI6MjExMDM4OTg3MH0.UNZ8-ym7wth5BxUAcFmHeGvfjaqmv484dz8Dn14W52o';

/**
 * Validates and normalizes the Supabase URL.
 * If the environment variable was accidentally assigned a publishable key or malformed string,
 * fallback gracefully to the project URL.
 */
function resolveSupabaseUrl(): string {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    // If user provided a URL ending in /rest/v1 or /rest/v1/, strip it for createClient
    return envUrl.replace(/\/rest\/v1\/?$/, '');
  }

  // If it's just the project ref (e.g. wecjxneowqcxlmdrowmy)
  if (/^[a-z0-9]{20}$/i.test(envUrl)) {
    return `https://${envUrl}.supabase.co`;
  }

  // If it's something invalid (e.g. an API key sb_publishable_...), use the default school project URL
  return DEFAULT_PROJECT_URL;
}

function resolveSupabaseKey(): string {
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (envKey && envKey.length > 20) {
    return envKey;
  }
  return DEFAULT_ANON_KEY;
}

export const SUPABASE_URL = resolveSupabaseUrl();
export const SUPABASE_ANON_KEY = resolveSupabaseKey();

let clientInstance: SupabaseClient | null = null;
try {
  clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  console.warn('Failed to initialize Supabase client:', err);
  // Safe fallback with default URL
  try {
    clientInstance = createClient(DEFAULT_PROJECT_URL, DEFAULT_ANON_KEY);
  } catch {
    clientInstance = null;
  }
}

export const supabase = clientInstance;

export interface SupabaseStudentRow {
  id: string;
  name: string;
  roll_number: string;
  grade: string;
  section: string;
  gender?: string;
  attendance?: string;
  class_rank?: string;
  term?: string;
  academic_year?: string;
  conduct?: string;
  class_teacher?: string;
  subjects?: Array<{
    subject: string;
    code: string;
    maxMarks: number;
    obtainedMarks: number;
    grade: string;
    remarks: string;
  }>;
}

/**
 * Check if the Supabase connection is active and if the 'students' table exists.
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; hasTables: boolean; error?: string }> {
  if (!supabase) {
    return { connected: false, hasTables: false, error: 'Supabase client could not be initialized.' };
  }
  try {
    const { error } = await supabase.from('students').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        // Table does not exist yet
        return { connected: true, hasTables: false, error: 'Table "students" has not been created yet in Supabase.' };
      }
      return { connected: false, hasTables: false, error: error.message };
    }
    return { connected: true, hasTables: true };
  } catch (err: any) {
    return { connected: false, hasTables: false, error: err?.message || 'Connection error' };
  }
}

/**
 * Fetch all students from Supabase (paginated beyond 1000-row REST limit)
 */
export async function fetchStudentsFromSupabase(): Promise<SupabaseStudentRow[] | null> {
  if (!supabase) return null;
  try {
    const allRows: SupabaseStudentRow[] = [];
    const pageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .range(from, from + pageSize - 1);

      if (error || !data) {
        return allRows.length > 0 ? allRows : null;
      }

      allRows.push(...(data as SupabaseStudentRow[]));
      if (data.length < pageSize) break;
      from += pageSize;
    }

    return allRows;
  } catch {
    return null;
  }
}

/**
 * Update a student's grade & class section in Supabase `students` table
 */
export async function updateStudentClassInSupabase(
  studentId: string,
  grade: string,
  section: string
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) {
    return { ok: false, error: 'Supabase client is not initialized.' };
  }
  try {
    const { error } = await supabase
      .from('students')
      .update({ grade, section })
      .eq('id', studentId);
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to update student class' };
  }
}

/**
 * Seed all students into Supabase students table
 */
export async function seedStudentsToSupabase(students: any[]): Promise<{ success: boolean; count: number; error?: string }> {
  if (!supabase) {
    return { success: false, count: 0, error: 'Supabase client not initialized.' };
  }
  try {
    const rows = students.map(s => ({
      id: s.id,
      serial: s.serial || null,
      name: s.name,
      mother_name: s.motherName || null,
      roll_number: s.rollNumber,
      grade: s.grade,
      section: s.section,
      gender: s.gender || null,
      attendance: s.attendance || '100%',
      class_rank: s.classRank || null,
      term: s.term || 'First Term 2024-2025',
      academic_year: s.academicYear || '2024-2025',
      conduct: s.conduct || 'Excellent',
      class_teacher: s.classTeacher || null,
      phone: s.phone || null,
      dob: s.dob || null,
      blood_group: s.bloodGroup || null,
      guardian_email: s.guardianEmail || null,
      guardian_password: s.guardianPassword || null,
      guardian_password_alt: null,
      subjects: s.subjects || [],
      behaviour_report: s.behaviourReport || { uploaded: false }
    }));

    let successCount = 0;
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { error } = await supabase.from('students').upsert(batch, { onConflict: 'id' });
      if (error) {
        return { success: false, count: successCount, error: error.message };
      }
      successCount += batch.length;
    }
    return { success: true, count: successCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Seeding failed' };
  }
}

export const BUS_LOCATIONS_TABLE = 'bus_locations';
export const BUS_1_ID = 'bus-1';

export interface BusLocationRow {
  id: string;
  lat: number;
  lng: number;
  updated_at: string;
}

/**
 * Upsert live bus GPS position into Supabase `bus_locations` table.
 */
export async function upsertBusLocation(params: {
  id?: string;
  lat: number;
  lng: number;
  updatedAt?: string;
}): Promise<{ ok: boolean; data?: BusLocationRow; error?: string }> {
  if (!supabase) {
    return { ok: false, error: 'Supabase client is not initialized.' };
  }
  const row: BusLocationRow = {
    id: (params.id || BUS_1_ID).trim() || BUS_1_ID,
    lat: params.lat,
    lng: params.lng,
    updated_at: params.updatedAt || new Date().toISOString(),
  };
  try {
    const { data, error } = await supabase
      .from(BUS_LOCATIONS_TABLE)
      .upsert(row, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true, data: (data as BusLocationRow) || row };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to update bus location' };
  }
}

/**
 * Fetch the latest coordinates for a single bus (default 'bus-1') from Supabase `bus_locations`.
 */
export async function fetchBusLocation(
  busId: string = BUS_1_ID
): Promise<BusLocationRow | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(BUS_LOCATIONS_TABLE)
      .select('id, lat, lng, updated_at')
      .eq('id', busId)
      .maybeSingle();

    if (error || !data) return null;
    const lat = Number((data as BusLocationRow).lat);
    const lng = Number((data as BusLocationRow).lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      id: data.id,
      lat,
      lng,
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Fetch all live rows from Supabase `bus_locations`.
 */
export async function fetchAllBusLocations(): Promise<BusLocationRow[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from(BUS_LOCATIONS_TABLE)
      .select('id, lat, lng, updated_at');

    if (error || !Array.isArray(data)) return [];
    return data
      .filter((r) => Number.isFinite(Number(r.lat)) && Number.isFinite(Number(r.lng)))
      .map((r) => ({
        id: String(r.id),
        lat: Number(r.lat),
        lng: Number(r.lng),
        updated_at: r.updated_at || new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export const DAILY_RECORDS_TABLE = 'daily_records';

export interface SupabaseDailyRecordRow {
  id: string;
  student_id: string;
  subject: string;
  record: DailySubjectRecord;
  updated_by?: string | null;
  updated_at?: string;
}

function parseDailyRecordKeyParts(key: string): { studentId: string; subject: string } {
  const sepIdx = key.indexOf('__');
  if (sepIdx === -1) {
    return { studentId: key, subject: 'general' };
  }
  return {
    studentId: key.slice(0, sepIdx),
    subject: key.slice(sepIdx + 2) || 'general',
  };
}

/**
 * Fetch all teacher-uploaded marks from Supabase `daily_records` table
 */
export async function fetchDailyRecordsFromSupabase(): Promise<{
  ok: boolean;
  records: Record<string, DailySubjectRecord>;
  error?: string;
}> {
  if (!supabase) {
    return { ok: false, records: {}, error: 'Supabase client is not initialized.' };
  }
  try {
    const records: Record<string, DailySubjectRecord> = {};
    const pageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from(DAILY_RECORDS_TABLE)
        .select('id, student_id, subject, record, updated_at')
        .range(from, from + pageSize - 1);

      if (error) {
        return { ok: false, records, error: error.message };
      }

      if (!data || data.length === 0) break;

      for (const row of data as SupabaseDailyRecordRow[]) {
        if (row.id && row.record && typeof row.record === 'object') {
          records[row.id] = row.record;
        }
      }

      if (data.length < pageSize) break;
      from += pageSize;
    }

    return { ok: true, records };
  } catch (err: any) {
    return {
      ok: false,
      records: {},
      error: err?.message || 'Failed to fetch marks from Supabase.',
    };
  }
}

/**
 * Upsert a single student + subject mark record into Supabase `daily_records`
 */
export async function upsertDailyRecordToSupabase(params: {
  key: string;
  studentId: string;
  subject: string;
  record: DailySubjectRecord;
  updatedBy?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) {
    return { ok: false, error: 'Supabase client is not initialized.' };
  }
  try {
    const row: SupabaseDailyRecordRow = {
      id: params.key,
      student_id: params.studentId,
      subject: params.subject,
      record: params.record,
      updated_by: params.updatedBy || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from(DAILY_RECORDS_TABLE)
      .upsert(row, { onConflict: 'id' });

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to save mark to Supabase.' };
  }
}

/**
 * Batch upsert all daily mark records into Supabase `daily_records`
 */
export async function upsertAllDailyRecordsToSupabase(
  records: Record<string, DailySubjectRecord>,
  updatedBy?: string
): Promise<{ ok: boolean; count: number; error?: string }> {
  if (!supabase) {
    return { ok: false, count: 0, error: 'Supabase client is not initialized.' };
  }

  const entries = Object.entries(records).filter(
    ([, rec]) => rec && typeof rec === 'object'
  );
  if (entries.length === 0) {
    return { ok: true, count: 0 };
  }

  const nowIso = new Date().toISOString();
  const rows: SupabaseDailyRecordRow[] = entries.map(([key, rec]) => {
    const { studentId, subject } = parseDailyRecordKeyParts(key);
    return {
      id: key,
      student_id: studentId,
      subject,
      record: rec,
      updated_by: updatedBy || null,
      updated_at: nowIso,
    };
  });

  try {
    let savedCount = 0;
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const { error } = await supabase
        .from(DAILY_RECORDS_TABLE)
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        return { ok: false, count: savedCount, error: error.message };
      }
      savedCount += batch.length;
    }
    return { ok: true, count: savedCount };
  } catch (err: any) {
    return {
      ok: false,
      count: 0,
      error: err?.message || 'Failed to save marks batch to Supabase.',
    };
  }
}
