/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
 * Fetch students from Supabase
 */
export async function fetchStudentsFromSupabase(): Promise<SupabaseStudentRow[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('students').select('*');
    if (error || !data) return null;
    return data as SupabaseStudentRow[];
  } catch {
    return null;
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


