/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Official Attendance Report 2026–2027 Data Model, Calendar Rules & Aggregations
 * Implements all rules from Attendance_Report_2026-2027:
 * - Months: September 2026 through July 2027 (11 months)
 * - School start date: 20 September 2026 (1–19 Sep 2026 shaded dark grey & excluded from counts)
 * - Weekends: Friday & Saturday (shaded light grey; counts do not depend on weekend shading)
 * - Codes: A (Absent - red), L (Leave permission - yellow), P (Present - green)
 */

import { StudentRecord } from './importedStudents';
import { getMentorForClass } from './teacherPortal';
import {
  ATTENDANCE_SUPPLEMENTAL_STUDENTS,
  MonthlyBaselineCounts,
  OFFICIAL_ATTENDANCE_BASELINES,
  OFFICIAL_ENGLISH_NAMES,
} from './officialAttendance2026';

export type AttendanceCode = 'A' | 'L' | 'P';

export interface AttendanceMonthOption {
  key: string; // e.g. '2026-09'
  year: number;
  month: number; // 1-12
  shortLabel: string;
  labelEn: string;
  labelAr: string;
  labelKu: string;
  daysCount: number;
}

export const ATTENDANCE_MONTHS: AttendanceMonthOption[] = [
  { key: '2026-09', year: 2026, month: 9, shortLabel: 'Sep 26', labelEn: 'September 2026', labelAr: 'أيلول ٢٠٢٦', labelKu: 'ئەیلول ٢٠٢٦', daysCount: 30 },
  { key: '2026-10', year: 2026, month: 10, shortLabel: 'Oct 26', labelEn: 'October 2026', labelAr: 'تشرين الأول ٢٠٢٦', labelKu: 'تشرینا ئێکێ ٢٠٢٦', daysCount: 31 },
  { key: '2026-11', year: 2026, month: 11, shortLabel: 'Nov 26', labelEn: 'November 2026', labelAr: 'تشرين الثاني ٢٠٢٦', labelKu: 'تشرینا دووێ ٢٠٢٦', daysCount: 30 },
  { key: '2026-12', year: 2026, month: 12, shortLabel: 'Dec 26', labelEn: 'December 2026', labelAr: 'كانون الأول ٢٠٢٦', labelKu: 'کانوونا ئێکێ ٢٠٢٦', daysCount: 31 },
  { key: '2027-01', year: 2027, month: 1, shortLabel: 'Jan 27', labelEn: 'January 2027', labelAr: 'كانون الثاني ٢٠٢٧', labelKu: 'کانوونا دووێ ٢٠٢٧', daysCount: 31 },
  { key: '2027-02', year: 2027, month: 2, shortLabel: 'Feb 27', labelEn: 'February 2027', labelAr: 'شباط ٢٠٢٧', labelKu: 'شوبات ٢٠٢٧', daysCount: 28 },
  { key: '2027-03', year: 2027, month: 3, shortLabel: 'Mar 27', labelEn: 'March 2027', labelAr: 'آذار ٢٠٢٧', labelKu: 'ئادار ٢٠٢٧', daysCount: 31 },
  { key: '2027-04', year: 2027, month: 4, shortLabel: 'Apr 27', labelEn: 'April 2027', labelAr: 'نيسان ٢٠٢٧', labelKu: 'نیسان ٢٠٢٧', daysCount: 30 },
  { key: '2027-05', year: 2027, month: 5, shortLabel: 'May 27', labelEn: 'May 2027', labelAr: 'أيار ٢٠٢٧', labelKu: 'گولان ٢٠٢٧', daysCount: 31 },
  { key: '2027-06', year: 2027, month: 6, shortLabel: 'Jun 27', labelEn: 'June 2027', labelAr: 'حزيران ٢٠٢٧', labelKu: 'حوزەیران ٢٠٢٧', daysCount: 30 },
  { key: '2027-07', year: 2027, month: 7, shortLabel: 'Jul 27', labelEn: 'July 2027', labelAr: 'تموز ٢٠٢٧', labelKu: 'تەمموز ٢٠٢٧', daysCount: 31 },
];

export function getDefaultAttendanceMonthKey(): string {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const found = ATTENDANCE_MONTHS.find((m) => m.key === ym);
  return found ? found.key : '2026-11';
}

export interface AttendanceMonthRecord {
  id: string; // `${studentId}__${monthKey}`
  studentId: string;
  monthKey: string;
  days: Record<string, AttendanceCode>; // day number "1".."31" -> 'A'|'L'|'P'
  updatedAt: string;
  updatedBy?: string;
}

export const ATTENDANCE_RECORDS_STORAGE_KEY = 'dasinya_attendance_records_v1';
export const ATTENDANCE_HOLIDAYS_STORAGE_KEY = 'dasinya_attendance_holidays_v1';
export const ATTENDANCE_EN_NAMES_STORAGE_KEY = 'dasinya_attendance_en_names_v1';

export function makeAttendanceRecordKey(studentId: string, monthKey: string): string {
  return `${studentId}__${monthKey}`;
}

export function makeAttendanceDateIso(monthKey: string, day: number): string {
  return `${monthKey}-${String(day).padStart(2, '0')}`;
}

export function isPreStartSeptemberDay(monthKey: string, day: number): boolean {
  return monthKey === '2026-09' && day >= 1 && day <= 19;
}

export function getDayOfWeekIndex(monthKey: string, day: number): number {
  const [yStr, mStr] = monthKey.split('-');
  const d = new Date(Number(yStr), Number(mStr) - 1, day);
  return d.getDay(); // 0=Sun..4=Thu, 5=Fri, 6=Sat
}

export function isWeekendFridayOrSaturday(monthKey: string, day: number): boolean {
  const dow = getDayOfWeekIndex(monthKey, day);
  return dow === 5 || dow === 6;
}

const WEEKDAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export function getWeekdayShort(monthKey: string, day: number): string {
  return WEEKDAY_SHORT[getDayOfWeekIndex(monthKey, day)] || '';
}

export function isCountableAttendanceDay(
  monthKey: string,
  day: number,
  holidays: Record<string, boolean>
): boolean {
  if (isPreStartSeptemberDay(monthKey, day)) return false;
  const iso = makeAttendanceDateIso(monthKey, day);
  if (holidays[iso]) return false;
  return true;
}

/**
 * Standardizes Arabic letter forms to Kurdish/Persian presentation per spec:
 * Arabic ي ك ى → ی ک ی
 */
export function standardizeKurdishArabicLetters(name: string): string {
  return (name || '')
    .replace(/ي/g, 'ی')
    .replace(/ى/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, ' ')
    .trim();
}

const AR_KU_LATIN_DIGRAPHS: Array<[RegExp, string]> = [
  [/الله/g, 'allah'],
  [/محمد/g, 'Mohammed'],
  [/احمد|أحمد/g, 'Ahmed'],
  [/علي|علی/g, 'Ali'],
  [/حسن/g, 'Hassan'],
  [/حسين|حسین/g, 'Hussein'],
  [/عمر/g, 'Omar'],
  [/خالد/g, 'Khalid'],
  [/عبدالله|عبد الله/g, 'Abdullah'],
  [/إبراهيم|ابراهيم|ابراهیم/g, 'Ibrahim'],
  [/يوسف|یوسف/g, 'Yousif'],
  [/مريم|مریم/g, 'Maryam'],
  [/سارة|ساره/g, 'Sara'],
  [/زينة|زينه/g, 'Zina'],
  [/آية|ايه/g, 'Aya'],
];

const AR_KU_CHAR_MAP: Record<string, string> = {
  ا: 'a',
  أ: 'a',
  إ: 'i',
  آ: 'a',
  ئ: 'e',
  ء: '',
  ب: 'b',
  پ: 'p',
  ت: 't',
  ة: 'a',
  ث: 'th',
  ج: 'j',
  چ: 'ch',
  ح: 'h',
  خ: 'kh',
  د: 'd',
  ذ: 'dh',
  ر: 'r',
  ڕ: 'rr',
  ز: 'z',
  ژ: 'zh',
  س: 's',
  ش: 'sh',
  ص: 's',
  ض: 'd',
  ط: 't',
  ظ: 'z',
  ع: 'a',
  غ: 'gh',
  ف: 'f',
  ڤ: 'v',
  ق: 'q',
  ك: 'k',
  ک: 'k',
  گ: 'g',
  ل: 'l',
  ڵ: 'll',
  م: 'm',
  ن: 'n',
  ه: 'h',
  ە: 'a',
  ھ: 'h',
  و: 'o',
  ۆ: 'o',
  وو: 'u',
  ؤ: 'o',
  ي: 'i',
  ی: 'i',
  ێ: 'e',
  ى: 'a',
  '\u200c': '',
};

/**
 * Automatic Kurdish/Arabic → English transliteration (editable per student by Admin).
 */
export function transliterateKurdishArabicToEnglish(rawName: string): string {
  const clean = standardizeKurdishArabicLetters(rawName);
  if (!clean) return '';
  if (/^[A-Za-z0-9\s.'-]+$/.test(clean)) return clean;

  const words = clean.split(' ').filter(Boolean);
  const outWords = words.map((word) => {
    for (const [rx, rep] of AR_KU_LATIN_DIGRAPHS) {
      if (rx.test(word) && word.replace(rx, '').length === 0) {
        return rep;
      }
    }
    let out = '';
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (ch === 'و' && word[i + 1] === 'و') {
        out += 'u';
        i++;
        continue;
      }
      if (ch === 'و' && i === 0) {
        out += 'w';
        continue;
      }
      if ((ch === 'ی' || ch === 'ي') && i === 0) {
        out += 'y';
        continue;
      }
      out += AR_KU_CHAR_MAP[ch] ?? ch;
    }
    const collapsed = out.replace(/(.)\1{2,}/g, '$1$1');
    return collapsed.charAt(0).toUpperCase() + collapsed.slice(1);
  });

  return outWords.join(' ');
}

export function getStudentEnglishName(
  studentId: string,
  studentName: string,
  customEnglishNames: Record<string, string> = {}
): string {
  if (customEnglishNames[studentId] !== undefined) {
    return customEnglishNames[studentId];
  }
  return OFFICIAL_ENGLISH_NAMES[studentId] || transliterateKurdishArabicToEnglish(studentName);
}

export function getOfficialMonthBaseline(
  studentId: string,
  monthKey: string
): MonthlyBaselineCounts {
  return OFFICIAL_ATTENDANCE_BASELINES[studentId]?.[monthKey] || { A: 0, L: 0 };
}

export function mergeAttendanceRoster(
  students: StudentRecord[],
  lockedClass?: { grade: string; section: string } | null
): StudentRecord[] {
  const seen = new Set(students.map((s) => s.id));
  const extras = ATTENDANCE_SUPPLEMENTAL_STUDENTS.filter((ext) => {
    if (seen.has(ext.id)) return false;
    if (lockedClass && (ext.grade !== lockedClass.grade || ext.section !== lockedClass.section)) {
      return false;
    }
    return true;
  });
  return extras.length > 0 ? [...students, ...extras] : students;
}

export function loadStoredAttendanceRecords(): Record<string, AttendanceMonthRecord> {
  try {
    const raw = localStorage.getItem(ATTENDANCE_RECORDS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStoredAttendanceRecords(records: Record<string, AttendanceMonthRecord>): void {
  try {
    localStorage.setItem(ATTENDANCE_RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Could not persist attendance records to localStorage:', err);
  }
}

export function loadStoredAttendanceHolidays(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(ATTENDANCE_HOLIDAYS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStoredAttendanceHolidays(holidays: Record<string, boolean>): void {
  try {
    localStorage.setItem(ATTENDANCE_HOLIDAYS_STORAGE_KEY, JSON.stringify(holidays));
  } catch (err) {
    console.warn('Could not persist attendance holidays to localStorage:', err);
  }
}

export function loadStoredAttendanceEnNames(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ATTENDANCE_EN_NAMES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStoredAttendanceEnNames(names: Record<string, string>): void {
  try {
    localStorage.setItem(ATTENDANCE_EN_NAMES_STORAGE_KEY, JSON.stringify(names));
  } catch (err) {
    console.warn('Could not persist transliterated names to localStorage:', err);
  }
}

export interface AttendanceCounts {
  A: number;
  L: number;
  P: number;
}

export function calcStudentMonthCounts(
  record: AttendanceMonthRecord | undefined,
  monthKey: string,
  holidays: Record<string, boolean> = {},
  studentId?: string
): AttendanceCounts {
  let A = 0;
  let L = 0;
  let P = 0;

  const effectiveId = studentId || record?.studentId;
  if (effectiveId) {
    const baseline = OFFICIAL_ATTENDANCE_BASELINES[effectiveId]?.[monthKey];
    if (baseline) {
      A += baseline.A || 0;
      L += baseline.L || 0;
    }
  }

  if (!record || !record.days) return { A, L, P };

  const monthInfo = ATTENDANCE_MONTHS.find((m) => m.key === monthKey);
  const maxDays = monthInfo?.daysCount || 31;

  for (const [dayStr, code] of Object.entries(record.days)) {
    const dayNum = Number(dayStr);
    if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > maxDays) continue;
    if (!isCountableAttendanceDay(monthKey, dayNum, holidays)) continue;
    if (code === 'A') A++;
    else if (code === 'L') L++;
    else if (code === 'P') P++;
  }
  return { A, L, P };
}

export interface StudentYearAttendanceSummary {
  totalA: number;
  totalL: number;
  totalP: number;
  recordedDays: number;
  attendanceRatePct: number | null;
  byMonth: Record<string, AttendanceCounts>;
}

export function calcStudentYearCounts(
  records: Record<string, AttendanceMonthRecord>,
  studentId: string,
  holidays: Record<string, boolean> = {}
): StudentYearAttendanceSummary {
  let totalA = 0;
  let totalL = 0;
  let totalP = 0;
  const byMonth: Record<string, AttendanceCounts> = {};

  for (const m of ATTENDANCE_MONTHS) {
    const rec = records[makeAttendanceRecordKey(studentId, m.key)];
    const c = calcStudentMonthCounts(rec, m.key, holidays, studentId);
    byMonth[m.key] = c;
    totalA += c.A;
    totalL += c.L;
    totalP += c.P;
  }

  const recordedDays = totalA + totalL + totalP;
  const attendanceRatePct =
    recordedDays > 0 && totalP > 0 ? Math.round(((totalP + totalL) / recordedDays) * 100) : null;

  return { totalA, totalL, totalP, recordedDays, attendanceRatePct, byMonth };
}

export interface ClassAttendanceSummaryRow {
  classCode: string; // e.g. '1-A'
  grade: string;
  section: string;
  studentCount: number;
  mentorName: string;
  byMonth: Record<string, AttendanceCounts>;
  totalA: number;
  totalL: number;
  totalP: number;
  attendanceRatePct: number | null;
}

export function formatShortClassTabLabel(grade: string, section: string): string {
  const g = grade.replace(/\D/g, '') || grade;
  const s = section.replace('Class ', '').trim();
  return `${g}-${s}`;
}

export function calcAllClassesAttendanceSummary(
  students: StudentRecord[],
  schoolStructure: Record<string, string[]>,
  records: Record<string, AttendanceMonthRecord>,
  holidays: Record<string, boolean> = {}
): ClassAttendanceSummaryRow[] {
  const rows: ClassAttendanceSummaryRow[] = [];

  for (const grade of Object.keys(schoolStructure)) {
    const sections = schoolStructure[grade] || [];
    for (const section of sections) {
      const classStudents = students.filter((s) => s.grade === grade && s.section === section);
      const mentor = getMentorForClass(grade, section);
      const byMonth: Record<string, AttendanceCounts> = {};
      let totalA = 0;
      let totalL = 0;
      let totalP = 0;

      for (const m of ATTENDANCE_MONTHS) {
        let mA = 0;
        let mL = 0;
        let mP = 0;
        for (const st of classStudents) {
          const c = calcStudentMonthCounts(
            records[makeAttendanceRecordKey(st.id, m.key)],
            m.key,
            holidays,
            st.id
          );
          mA += c.A;
          mL += c.L;
          mP += c.P;
        }
        byMonth[m.key] = { A: mA, L: mL, P: mP };
        totalA += mA;
        totalL += mL;
        totalP += mP;
      }

      const recorded = totalA + totalL + totalP;
      rows.push({
        classCode: formatShortClassTabLabel(grade, section),
        grade,
        section,
        studentCount: classStudents.length,
        mentorName: mentor ? `${mentor.assignment.mentorShortName} (${mentor.teacher.name})` : '—',
        byMonth,
        totalA,
        totalL,
        totalP,
        attendanceRatePct:
          recorded > 0 && totalP > 0 ? Math.round(((totalP + totalL) / recorded) * 100) : null,
      });
    }
  }

  return rows;
}

export interface TopAbsenteeEntry {
  rank: number;
  student: StudentRecord;
  standardizedName: string;
  englishName: string;
  classCode: string;
  mentorShort: string;
  summary: StudentYearAttendanceSummary;
}

export function calcTopAbsentees(
  students: StudentRecord[],
  records: Record<string, AttendanceMonthRecord>,
  holidays: Record<string, boolean> = {},
  customEnglishNames: Record<string, string> = {},
  limit = 15
): TopAbsenteeEntry[] {
  const list = students.map((student) => {
    const summary = calcStudentYearCounts(records, student.id, holidays);
    const mentor = getMentorForClass(student.grade, student.section);
    return {
      student,
      standardizedName: standardizeKurdishArabicLetters(student.name),
      englishName: getStudentEnglishName(student.id, student.name, customEnglishNames),
      classCode: formatShortClassTabLabel(student.grade, student.section),
      mentorShort: mentor?.assignment.mentorShortName || '—',
      summary,
    };
  });

  list.sort((a, b) => {
    if (b.summary.totalA !== a.summary.totalA) return b.summary.totalA - a.summary.totalA;
    if (b.summary.totalL !== a.summary.totalL) return b.summary.totalL - a.summary.totalL;
    return (a.student.serial ?? 9999) - (b.student.serial ?? 9999);
  });

  return list.slice(0, limit).map((item, idx) => ({
    rank: idx + 1,
    ...item,
  }));
}
