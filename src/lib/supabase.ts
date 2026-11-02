/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_PROJECT_URL = 'https://wecjxneowqcxlmdrowmy.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlY2p4bmVvd3FjeGxtZHJvd215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MTMxOTgsImV4cCI6MjEwOTA4OTE5OH0.SC4AEL0-quBEWrKRkjxZwOoMUmaqD6mKg_0KMSvmc-Y';

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
