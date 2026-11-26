/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Admin Panel Comprehensive Data Export Center (Excel .xlsx & Multi-Page Unicode PDF)
 * Supports Teachers, Students, Locations, Drivers, Class Summary, Full Classes Marks + Summary,
 * All Marks Ledger, Behaviour Reports, Exams Schedule & Full School Bundle
 */

import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { StudentRecord } from '../data/importedStudents';
import {
  TEACHER_ACCOUNTS,
  DailySubjectRecord,
  getMentorAssignmentForTeacher,
  getMentorForClass,
  getEffectiveDailyRecord,
  isGrade13,
  calcGrade13EvalTotal,
  calcGrade13GrandTotal,
  calcGrade49HalfTotal,
  calcGrade49ExamsTotal,
  calcGrade49Total40,
  calcGrade49GrandTotal100,
} from '../data/teacherPortal';
import {
  ALL_BUS_STOPS,
  BUS_DRIVER_ROUTES,
  SCHOOL_LOCATION,
  findBusForStudent,
  resolveStopCoords,
} from '../data/busRoutes';
import { ExamScheduleRow } from '../data/examsSchedule';
import { BEHAVIOUR_MONTHS, MonthlyBehaviourReport } from '../data/behaviourReport';
import {
  ATTENDANCE_MONTHS,
  AttendanceMonthRecord,
  calcAllClassesAttendanceSummary,
  calcStudentMonthCounts,
  calcStudentYearCounts,
  calcTopAbsentees,
  formatShortClassTabLabel,
  getDefaultAttendanceMonthKey,
  getStudentEnglishName,
  getWeekdayShort,
  isPreStartSeptemberDay,
  isWeekendFridayOrSaturday,
  makeAttendanceDateIso,
  makeAttendanceRecordKey,
  mergeAttendanceRoster,
  standardizeKurdishArabicLetters,
} from '../data/attendanceReport';
import { LiveBusState } from '../hooks/useBusTracking';

export type AdminExportDatasetKey =
  | 'teachers'
  | 'students'
  | 'locations'
  | 'drivers'
  | 'class_summary'
  | 'full_classes_marks'
  | 'all_marks'
  | 'attendance'
  | 'behaviour'
  | 'exams';

export interface ExportClassSummaryRow {
  grade: string;
  section: string;
  label: string;
  studentCount: number;
  outOf: number;
  passMark: number;
  classAvg: number | null;
  overallPassRate: number | null;
  totalGradedEntries: number;
  subjects: Record<
    string,
    {
      subjectName: string;
      inCurriculum: boolean;
      gradedCount: number;
      entryPct: number;
      avg: number | null;
      passRate: number | null;
    }
  >;
}

export interface AdminExportSourceData {
  students: StudentRecord[];
  dailyRecords: Record<string, DailySubjectRecord>;
  gradeCurriculum: Record<string, Array<{ name: string; code: string; category: string }>>;
  liveBuses: Record<string, LiveBusState>;
  classSummaries: ExportClassSummaryRow[];
  officialSubjectNames: string[];
  behaviourReports: Record<string, MonthlyBehaviourReport>;
  attendanceRecords?: Record<string, AttendanceMonthRecord>;
  attendanceHolidays?: Record<string, boolean>;
  attendanceEnglishNames?: Record<string, string>;
  attendanceMonthKey?: string;
  examRows: ExamScheduleRow[];
  schoolLogoUrl: string;
  gradeFilter?: string;
  classFilter?: string;
}

export interface ExportPdfProgress {
  currentPage: number;
  totalPages: number;
  sectionLabel: string;
}

interface ExportTableDefinition {
  key: AdminExportDatasetKey;
  sheetName: string;
  fileSlug: string;
  title: string;
  subtitle: string;
  headers: string[];
  rows: (string | number)[][];
  rowsPerPdfPage: number;
  /** Number of trailing rows in `rows` that are highlighted summary/footer rows on PDF */
  summaryRowCount?: number;
  /** Optional explicit row indices (0-based) to highlight as section/summary dividers */
  highlightedRowIndices?: number[];
}

const DASINYA_FALLBACK_CREST_SVG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="16" fill="#F0F8FA" stroke="#0087A5" stroke-width="3"/>
      <path d="M40 12 L62 22 V42 C62 55 52 64 40 69 C28 64 18 55 18 42 V22 Z" fill="#1A1D4E"/>
      <path d="M40 18 L56 26 V42 C56 51 49 58 40 62 C31 58 24 51 24 42 V26 Z" fill="#0087A5"/>
      <text x="40" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="13" fill="#FFFFFF">DS</text>
    </svg>`
  );

const SUBJECT_PDF_SHORT_LABELS: Record<string, string> = {
  Kurdish: 'Kurdish',
  English: 'English',
  Arabic: 'Arabic',
  Math: 'Math',
  Science: 'Science',
  IT: 'IT',
  'Social Studies': 'Social',
  Conversation: 'Conv.',
  'Moral Values': 'Moral V.',
  Religion: 'Religion',
  Art: 'Art',
  Music: 'Music',
  PE: 'PE',
};

function shortSubjectHeader(name: string, compact: boolean): string {
  if (!compact) return name;
  return SUBJECT_PDF_SHORT_LABELS[name] || name;
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function sanitizeSheetName(name: string, used: Set<string>): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, '_').slice(0, 31) || 'Sheet';
  if (!used.has(cleaned)) {
    used.add(cleaned);
    return cleaned;
  }
  let idx = 2;
  while (idx < 99) {
    const suffix = `_${idx}`;
    const candidate = `${cleaned.slice(0, 31 - suffix.length)}${suffix}`;
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
    idx++;
  }
  return cleaned;
}

function escapeHtml(val: unknown): string {
  const s = val === null || val === undefined ? '' : String(val);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getStudentSubjectTermScore(
  student: StudentRecord,
  subjectName: string,
  dailyRecords: Record<string, DailySubjectRecord>
): number | null {
  const rec = getEffectiveDailyRecord(student, subjectName, dailyRecords);
  if (rec.kind === 'g13') {
    const e1 = calcGrade13EvalTotal(rec.eval1);
    if (typeof e1 === 'number') return e1;
    const other = [rec.eval2, rec.eval3, rec.eval4]
      .map((b) => calcGrade13EvalTotal(b))
      .filter((v): v is number => typeof v === 'number');
    if (other.length > 0) {
      return Number((other.reduce((a, b) => a + b, 0) / other.length).toFixed(1));
    }
    return null;
  }

  const ex = calcGrade49ExamsTotal(rec);
  if (typeof ex === 'number') return ex;

  const grand100 = calcGrade49GrandTotal100(rec);
  if (typeof grand100 === 'number') {
    return Number((grand100 * 0.2).toFixed(1));
  }
  return null;
}

function matchesClassScope(
  grade: string,
  section: string,
  gradeFilter?: string,
  classFilter?: string
): boolean {
  if (gradeFilter && gradeFilter !== 'ALL' && grade !== gradeFilter) return false;
  if (classFilter && classFilter !== 'ALL' && `${grade}::${section}` !== classFilter) {
    return false;
  }
  return true;
}

function sortStudentsByClassAndRoll(students: StudentRecord[]): StudentRecord[] {
  return [...students].sort((a, b) => {
    const gA = parseInt(a.grade.replace(/\D/g, ''), 10) || 0;
    const gB = parseInt(b.grade.replace(/\D/g, ''), 10) || 0;
    if (gA !== gB) return gA - gB;
    const sCmp = a.section.localeCompare(b.section);
    if (sCmp !== 0) return sCmp;
    return (a.serial ?? 9999) - (b.serial ?? 9999) || a.rollNumber.localeCompare(b.rollNumber);
  });
}

async function resolveSafeLogoUrl(src: string): Promise<string> {
  if (!src) return DASINYA_FALLBACK_CREST_SVG;
  if (src.startsWith('data:')) return src;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(src, { mode: 'cors', cache: 'force-cache', signal: controller.signal });
    if (!res.ok) return DASINYA_FALLBACK_CREST_SVG;
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string' && reader.result.startsWith('data:')) {
          resolve(reader.result);
        } else {
          resolve(DASINYA_FALLBACK_CREST_SVG);
        }
      };
      reader.onerror = () => resolve(DASINYA_FALLBACK_CREST_SVG);
      reader.readAsDataURL(blob);
    });
  } catch {
    return DASINYA_FALLBACK_CREST_SVG;
  } finally {
    window.clearTimeout(timer);
  }
}

function stripUnsupportedColorFunctions(css: string): string {
  if (!css.includes('oklch(') && !css.includes('oklab(') && !css.includes('color-mix(')) {
    return css;
  }
  return css
    .replace(/oklch\([^()]*\)/g, '#334155')
    .replace(/oklab\([^()]*\)/g, '#334155')
    .replace(/color-mix\([^()]*\)/g, '#E6EEF8')
    .replace(/color-mix\([^()]*\)/g, '#E6EEF8');
}

function collectSanitizedProdCssFromLiveDocument(): string | null {
  try {
    const chunks: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      if (sheet.ownerNode instanceof HTMLLinkElement) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          chunks.push(rules.map((r) => r.cssText).join('\n'));
        } catch {
          // Cross-origin stylesheet (Google Fonts) left untouched
        }
      }
    }
    if (chunks.length === 0) return null;
    return stripUnsupportedColorFunctions(chunks.join('\n'));
  } catch {
    return null;
  }
}

function buildSingleClassMarksTable(
  cls: ExportClassSummaryRow,
  data: AdminExportSourceData,
  forPdf: boolean
): ExportTableDefinition {
  const mentor = getMentorForClass(cls.grade, cls.section);
  const mentorLabel = mentor ? `${mentor.assignment.mentorShortName} (${mentor.teacher.name})` : '—';
  const currSubjects = (
    data.gradeCurriculum[cls.grade] ||
    data.officialSubjectNames.map((n) => ({ name: n, code: n, category: '' }))
  ).map((s) => s.name);

  const classStudents = sortStudentsByClassAndRoll(
    data.students.filter((s) => s.grade === cls.grade && s.section === cls.section)
  );

  const headers = [
    '#',
    ...(forPdf ? [] : ['Student ID']),
    'Roll No',
    'Student Name',
    ...currSubjects.map((sub) => shortSubjectHeader(sub, forPdf)),
    'Total',
    'Avg',
    'Graded',
    'Status',
  ];

  const rows: (string | number)[][] = [];
  let sumTotalAvg = 0;
  let countStudentsWithAvg = 0;
  let passedStudentsCount = 0;

  for (let idx = 0; idx < classStudents.length; idx++) {
    const st = classStudents[idx];
    const subjectCells: (string | number)[] = [];
    let stScoreSum = 0;
    let stGradedCount = 0;

    for (const sub of currSubjects) {
      const sc = getStudentSubjectTermScore(st, sub, data.dailyRecords);
      if (typeof sc === 'number') {
        subjectCells.push(sc);
        stScoreSum += sc;
        stGradedCount++;
      } else {
        subjectCells.push('—');
      }
    }

    const stAvg = stGradedCount > 0 ? Number((stScoreSum / stGradedCount).toFixed(1)) : null;
    if (stAvg !== null) {
      sumTotalAvg += stAvg;
      countStudentsWithAvg++;
      if (stAvg >= cls.passMark) passedStudentsCount++;
    }

    const statusLabel =
      stAvg === null ? 'Pending' : stAvg >= cls.passMark ? 'Pass' : 'Needs Review';

    rows.push([
      idx + 1,
      ...(forPdf ? [] : [st.id]),
      st.rollNumber,
      st.name,
      ...subjectCells,
      stGradedCount > 0 ? Number(stScoreSum.toFixed(1)) : '—',
      stAvg !== null ? stAvg : '—',
      `${stGradedCount}/${currSubjects.length}`,
      statusLabel,
    ]);
  }

  // Class Summary Footer Rows (aligned under each curriculum subject column)
  const overallStudentAvg =
    countStudentsWithAvg > 0 ? Number((sumTotalAvg / countStudentsWithAvg).toFixed(1)) : '—';
  const studentPassPct =
    countStudentsWithAvg > 0
      ? `${Math.round((passedStudentsCount / countStudentsWithAvg) * 100)}%`
      : '—';

  const avgRow: (string | number)[] = [
    'Σ',
    ...(forPdf ? [] : ['SUMMARY']),
    'AVG',
    `CLASS AVERAGE (${cls.label})`,
    ...currSubjects.map((sub) => {
      const st = cls.subjects[sub];
      return st && st.avg !== null ? st.avg : '—';
    }),
    '—',
    cls.classAvg !== null ? cls.classAvg : overallStudentAvg,
    `${cls.totalGradedEntries}`,
    cls.overallPassRate !== null ? `Pass ${cls.overallPassRate}%` : studentPassPct,
  ];

  const passRateRow: (string | number)[] = [
    '%',
    ...(forPdf ? [] : ['SUMMARY']),
    'PASS',
    `SUBJECT PASS RATE (≥ ${cls.passMark}/${cls.outOf})`,
    ...currSubjects.map((sub) => {
      const st = cls.subjects[sub];
      return st && st.passRate !== null ? `${st.passRate}%` : '—';
    }),
    '—',
    cls.overallPassRate !== null ? `${cls.overallPassRate}%` : studentPassPct,
    `${passedStudentsCount}/${countStudentsWithAvg}`,
    `Out of ${cls.outOf}`,
  ];

  const entryRow: (string | number)[] = [
    '#',
    ...(forPdf ? [] : ['SUMMARY']),
    'ENTRY',
    `GRADED STUDENTS (${classStudents.length} Total)`,
    ...currSubjects.map((sub) => {
      const st = cls.subjects[sub];
      return st ? `${st.gradedCount}/${classStudents.length}` : '0';
    }),
    '—',
    '—',
    `${cls.totalGradedEntries}/${classStudents.length * currSubjects.length}`,
    `Mentor: ${mentor?.assignment.mentorShortName || '—'}`,
  ];

  rows.push(avgRow, passRateRow, entryRow);

  const shortSheet = `Class_${cls.grade.replace(/\D/g, '')}${cls.section.replace('Class ', '')}`;

  return {
    key: 'full_classes_marks',
    sheetName: shortSheet,
    fileSlug: shortSheet,
    title: `${cls.label} — Full Class Marks & Summary`,
    subtitle: `Mentor: ${mentorLabel} • ${cls.studentCount} Students • Scale: /${cls.outOf} (Pass ≥ ${cls.passMark}) • Class Avg: ${cls.classAvg ?? '—'} • Pass Rate: ${cls.overallPassRate !== null ? `${cls.overallPassRate}%` : '—'}`,
    headers,
    rows,
    rowsPerPdfPage: 22,
    summaryRowCount: 3,
  };
}

function buildAllMarksDetailedRows(data: AdminExportSourceData): {
  headers: string[];
  rows: (string | number)[][];
} {
  const scopedStudents = sortStudentsByClassAndRoll(
    data.students.filter((s) =>
      matchesClassScope(s.grade, s.section, data.gradeFilter, data.classFilter)
    )
  );

  const headers = [
    '#',
    'Class',
    'Student ID',
    'Roll No',
    'Student Name',
    'Subject',
    'Scale Model',
    'Term Score (Admin)',
    'Pass Mark',
    'Eval 1 (/25)',
    'Eval 2 (/25)',
    'Eval 3 (/25)',
    'Eval 4 (/25)',
    '1st Half (/10)',
    'Exam 1 (/20)',
    'Exam 2 (/20)',
    'Exams Avg (/20)',
    '2nd Half (/10)',
    '40% Total',
    'Final 60%',
    'Grand Total (/100)',
    'Status',
  ];

  const rows: (string | number)[][] = [];
  let rowNum = 0;

  for (const st of scopedStudents) {
    const classCode = `${st.grade.replace('Grade ', 'G')}${st.section.replace('Class ', '')}`;
    const currSubjects = (
      data.gradeCurriculum[st.grade] ||
      data.officialSubjectNames.map((n) => ({ name: n, code: n, category: '' }))
    ).map((s) => s.name);
    const primary13 = isGrade13(st.grade);
    const passMark = primary13 ? 12.5 : 10.0;

    for (const subName of currSubjects) {
      const rec = getEffectiveDailyRecord(st, subName, data.dailyRecords);
      const termScore = getStudentSubjectTermScore(st, subName, data.dailyRecords);

      rowNum++;
      if (rec.kind === 'g13') {
        const e1 = calcGrade13EvalTotal(rec.eval1);
        const e2 = calcGrade13EvalTotal(rec.eval2);
        const e3 = calcGrade13EvalTotal(rec.eval3);
        const e4 = calcGrade13EvalTotal(rec.eval4);
        const grand = calcGrade13GrandTotal(rec);
        const status =
          termScore === null ? 'Pending' : termScore >= passMark ? 'Pass' : 'Needs Review';

        rows.push([
          rowNum,
          classCode,
          st.id,
          st.rollNumber,
          st.name,
          subName,
          'G1–3 (4×25=100)',
          termScore ?? '—',
          passMark,
          e1 ?? '—',
          e2 ?? '—',
          e3 ?? '—',
          e4 ?? '—',
          '—',
          '—',
          '—',
          '—',
          '—',
          '—',
          '—',
          grand ?? '—',
          status,
        ]);
      } else {
        const h1 = calcGrade49HalfTotal(rec.firstHalf);
        const exAvg = calcGrade49ExamsTotal(rec);
        const h2 = calcGrade49HalfTotal(rec.secondHalf);
        const t40 = calcGrade49Total40(rec);
        const grand = calcGrade49GrandTotal100(rec);
        const status =
          termScore === null ? 'Pending' : termScore >= passMark ? 'Pass' : 'Needs Review';

        rows.push([
          rowNum,
          classCode,
          st.id,
          st.rollNumber,
          st.name,
          subName,
          'G4–9 (40%+60%=100)',
          termScore ?? '—',
          passMark,
          '—',
          '—',
          '—',
          '—',
          h1 ?? '—',
          rec.exam1 ?? '—',
          rec.exam2 ?? '—',
          exAvg ?? '—',
          h2 ?? '—',
          t40 ?? '—',
          rec.finalExam60 ?? '—',
          grand ?? '—',
          status,
        ]);
      }
    }
  }

  return { headers, rows };
}

export function buildExportTable(
  key: AdminExportDatasetKey,
  data: AdminExportSourceData,
  forPdf = false
): ExportTableDefinition {
  const gradeFilter = data.gradeFilter && data.gradeFilter !== 'ALL' ? data.gradeFilter : null;
  const classFilter = data.classFilter && data.classFilter !== 'ALL' ? data.classFilter : null;

  const scopedStudents = sortStudentsByClassAndRoll(
    data.students.filter((s) =>
      matchesClassScope(s.grade, s.section, data.gradeFilter, data.classFilter)
    )
  );
  const scopedSummaries = data.classSummaries.filter((r) =>
    matchesClassScope(r.grade, r.section, data.gradeFilter, data.classFilter)
  );
  const studentMap = new Map(data.students.map((s) => [s.id, s]));

  switch (key) {
    case 'teachers': {
      const headers = [
        'ID',
        'Teacher Name',
        'Class Mentor',
        'Subject(s)',
        'Login Email',
        'Phone (Password)',
        'Classes Count',
        'Assigned Classes & Subjects',
      ];
      const rows = TEACHER_ACCOUNTS.map((t) => {
        const mentor = getMentorAssignmentForTeacher(t.id);
        const classesDetail = t.assignedClasses
          .map(
            (ac) =>
              `${ac.grade.replace('Grade ', 'G')}${ac.section.replace('Class ', '')} (${ac.subjects.join(', ')})`
          )
          .join('; ');
        return [
          t.id,
          t.name,
          mentor ? `${mentor.classCode} (${mentor.mentorShortName})` : '—',
          t.subjectLabel,
          t.email,
          t.phone,
          t.assignedClasses.length,
          classesDetail,
        ];
      });
      return {
        key,
        sheetName: 'Teachers_Mentors',
        fileSlug: 'Teachers_List_Details',
        title: 'Official Teachers & Class Mentors Directory',
        subtitle: `${rows.length} Teachers • Credentials, Mentor Assignments & Subjects`,
        headers,
        rows,
        rowsPerPdfPage: 16,
      };
    }

    case 'students': {
      const headers = forPdf
        ? [
            '#',
            'Student ID',
            'Roll No',
            'Full Name',
            'Grade / Class',
            'Gender',
            'Phone',
            'Email',
            'Password',
            'Assigned Bus',
          ]
        : [
            'Serial',
            'Student ID',
            'Roll No',
            'Full Name',
            'Mother Name',
            'Grade',
            'Section',
            'Gender',
            'DOB',
            'Blood Group',
            'Phone',
            'Guardian Email',
            'Portal Password',
            'Assigned Bus Code',
            'Bus Driver',
            'Stop Coordinates',
            'Google Maps Link',
          ];

      const rows = scopedStudents.map((s, idx) => {
        const busMatch = findBusForStudent(s.id, s.name);
        const coords = busMatch ? resolveStopCoords(busMatch.stop) : null;
        if (forPdf) {
          return [
            s.serial ?? idx + 1,
            s.id,
            s.rollNumber,
            s.name,
            `${s.grade.replace('Grade ', 'G')}-${s.section.replace('Class ', '')}`,
            s.gender,
            s.phone || '—',
            s.guardianEmail || '—',
            s.guardianPassword || '—',
            busMatch ? `${busMatch.driver.code}` : '—',
          ];
        }
        return [
          s.serial ?? idx + 1,
          s.id,
          s.rollNumber,
          s.name,
          s.motherName || '',
          s.grade,
          s.section,
          s.gender,
          s.dob || '',
          s.bloodGroup || '',
          s.phone || '',
          s.guardianEmail || '',
          s.guardianPassword || '',
          busMatch ? busMatch.driver.code : '',
          busMatch ? busMatch.driver.nameEn : '',
          coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : '',
          busMatch?.stop.googleMapsUrl || '',
        ];
      });

      return {
        key,
        sheetName: 'Students_Roster',
        fileSlug: gradeFilter ? `Students_${gradeFilter.replace(/\s+/g, '_')}` : 'Students_Directory',
        title: gradeFilter ? `Students Directory — ${gradeFilter}` : 'Complete Students & Guardians Directory',
        subtitle: `${rows.length} Students • Passwords, Contacts & Bus Assignments`,
        headers,
        rows,
        rowsPerPdfPage: 22,
      };
    }

    case 'locations': {
      const headers = forPdf
        ? [
            'Bus',
            'Driver',
            'Stop #',
            'Student / Stop Name',
            'Class',
            'Latitude',
            'Longitude',
            'Google Maps Link',
          ]
        : [
            'Bus Code',
            'Bus ID',
            'Driver Name',
            'Stop Order',
            'Student / Stop Label',
            'Grade / Section',
            'Matched Student IDs',
            'Latitude',
            'Longitude',
            'Google Maps URL',
            'Landmark Note',
          ];

      const rows: (string | number)[][] = [];
      for (const driver of BUS_DRIVER_ROUTES) {
        for (const stop of driver.stops) {
          const coords = resolveStopCoords(stop);
          const gradeSections = stop.riders
            .map((r) => r.gradeSectionLabel)
            .filter(Boolean)
            .join(', ');
          const matchedIds = stop.riders
            .flatMap((r) => r.matchedStudentIds)
            .filter(Boolean)
            .join(', ');

          if (gradeFilter) {
            const shortG = gradeFilter.replace('Grade ', '');
            const matchesGrade =
              stop.riders.some((r) => (r.gradeSectionLabel || '').startsWith(shortG)) ||
              stop.riders.some((r) =>
                r.matchedStudentIds.some((id) => studentMap.get(id)?.grade === gradeFilter)
              );
            if (!matchesGrade) continue;
          }

          if (forPdf) {
            rows.push([
              driver.code,
              driver.nameEn,
              stop.order,
              stop.studentNamesLabel,
              gradeSections || '—',
              coords ? coords.lat.toFixed(5) : '—',
              coords ? coords.lng.toFixed(5) : '—',
              stop.googleMapsUrl || '—',
            ]);
          } else {
            rows.push([
              driver.code,
              driver.id,
              driver.nameEn,
              stop.order,
              stop.studentNamesLabel,
              gradeSections,
              matchedIds,
              coords ? Number(coords.lat.toFixed(6)) : '',
              coords ? Number(coords.lng.toFixed(6)) : '',
              stop.googleMapsUrl || '',
              stop.landmarkNote || '',
            ]);
          }
        }
      }

      return {
        key,
        sheetName: 'Student_Locations',
        fileSlug: 'Student_Locations_Bus_Stops',
        title: 'Student Home Locations & Bus Pickup Coordinates',
        subtitle: `${rows.length} Bus Stops • School Hub: ${SCHOOL_LOCATION.lat}, ${SCHOOL_LOCATION.lng}`,
        headers,
        rows,
        rowsPerPdfPage: 19,
      };
    }

    case 'drivers': {
      const headers = [
        'Bus Code',
        'Bus ID',
        'Driver Name (KU/AR)',
        'Driver Name (EN)',
        'PIN',
        'Route Label',
        'Total Stops',
        'Live GPS Status',
        'Live Lat',
        'Live Lng',
        'Last GPS Update',
      ];
      const rows = BUS_DRIVER_ROUTES.map((d) => {
        const live = data.liveBuses[d.id];
        return [
          d.code,
          d.id,
          d.name,
          d.nameEn,
          d.pin,
          d.routeLabel,
          d.stops.length,
          live ? (live.active ? `Live (${live.direction})` : 'Idle') : 'Offline',
          typeof live?.lat === 'number' ? Number(live.lat.toFixed(6)) : '—',
          typeof live?.lng === 'number' ? Number(live.lng.toFixed(6)) : '—',
          live?.updatedAt ? new Date(live.updatedAt).toLocaleString() : '—',
        ];
      });
      return {
        key,
        sheetName: 'Drivers_Routes',
        fileSlug: 'Bus_Drivers_Fleet',
        title: 'School Bus Drivers, PIN Credentials & Fleet Routes',
        subtitle: `${rows.length} Official Bus Routes • ${ALL_BUS_STOPS.length} Total Mapped Stops`,
        headers,
        rows,
        rowsPerPdfPage: 18,
      };
    }

    case 'class_summary': {
      const headers = forPdf
        ? [
            'Class',
            'Class Mentor',
            'Students',
            'Scale',
            'Pass Mark',
            'Class Avg',
            'Pass Rate %',
            'Graded Entries',
          ]
        : [
            'Class',
            'Class Mentor',
            'Students',
            'Out Of',
            'Pass Mark',
            'Class Avg',
            'Pass Rate %',
            'Graded Entries',
            ...data.officialSubjectNames.flatMap((sub) => [`${sub} Entry%`, `${sub} Avg`]),
          ];

      const rows = scopedSummaries.map((r) => {
        const mentor = getMentorForClass(r.grade, r.section);
        const mentorLabel = mentor
          ? `${mentor.assignment.mentorShortName} (${mentor.teacher.name})`
          : '—';
        if (forPdf) {
          return [
            r.label,
            mentorLabel,
            r.studentCount,
            r.outOf,
            r.passMark,
            r.classAvg !== null ? r.classAvg : '—',
            r.overallPassRate !== null ? `${r.overallPassRate}%` : '—',
            r.totalGradedEntries,
          ];
        }
        return [
          r.label,
          mentorLabel,
          r.studentCount,
          r.outOf,
          r.passMark,
          r.classAvg !== null ? r.classAvg : '',
          r.overallPassRate !== null ? r.overallPassRate : '',
          r.totalGradedEntries,
          ...data.officialSubjectNames.flatMap((sub) => {
            const st = r.subjects[sub];
            if (!st || !st.inCurriculum) return ['N/A', 'N/A'];
            return [st.entryPct, st.avg !== null ? st.avg : ''];
          }),
        ];
      });

      return {
        key,
        sheetName: 'Class_Summary',
        fileSlug: 'Class_Academic_Summary',
        title: 'Class Academic Summary & Mentor Overview',
        subtitle: `${rows.length} Class Sections • Averages, Pass Rates & Entry Progress`,
        headers,
        rows,
        rowsPerPdfPage: 20,
      };
    }

    case 'full_classes_marks': {
      // Consolidated sheet combining every class's student marks + class summary rows
      const headers = [
        'Class',
        'Roll No',
        'Student Name',
        ...data.officialSubjectNames.map((sub) => shortSubjectHeader(sub, forPdf)),
        'Scale',
        'Graded',
        'Avg',
        'Status',
      ];

      const rows: (string | number)[][] = [];
      const highlightedRowIndices: number[] = [];

      for (const cls of scopedSummaries) {
        const mentor = getMentorForClass(cls.grade, cls.section);
        const currSet = new Set(
          (
            data.gradeCurriculum[cls.grade] ||
            data.officialSubjectNames.map((n) => ({ name: n, code: n, category: '' }))
          ).map((s) => s.name)
        );
        const classStudents = sortStudentsByClassAndRoll(
          data.students.filter((s) => s.grade === cls.grade && s.section === cls.section)
        );

        // Class Section Header Banner Row
        highlightedRowIndices.push(rows.length);
        rows.push([
          cls.label,
          'MENTOR',
          `${mentor?.assignment.mentorShortName || '—'} — ${classStudents.length} Students`,
          ...data.officialSubjectNames.map((sub) => (currSet.has(sub) ? 'Active' : 'N/A')),
          `/${cls.outOf}`,
          `${cls.totalGradedEntries}`,
          cls.classAvg !== null ? cls.classAvg : '—',
          cls.overallPassRate !== null ? `${cls.overallPassRate}% Pass` : '—',
        ]);

        for (const st of classStudents) {
          let sum = 0;
          let graded = 0;
          const subCells = data.officialSubjectNames.map((sub) => {
            if (!currSet.has(sub)) return 'N/A';
            const sc = getStudentSubjectTermScore(st, sub, data.dailyRecords);
            if (typeof sc === 'number') {
              sum += sc;
              graded++;
              return sc;
            }
            return '—';
          });
          const avg = graded > 0 ? Number((sum / graded).toFixed(1)) : null;
          const status = avg === null ? 'Pending' : avg >= cls.passMark ? 'Pass' : 'Review';
          rows.push([
            cls.label,
            st.rollNumber,
            st.name,
            ...subCells,
            `/${cls.outOf}`,
            `${graded}/${currSet.size}`,
            avg !== null ? avg : '—',
            status,
          ]);
        }

        // Class Summary Average & Pass Rate Rows right after the class's students
        highlightedRowIndices.push(rows.length);
        rows.push([
          cls.label,
          'SUMMARY',
          `CLASS AVERAGE (${cls.label})`,
          ...data.officialSubjectNames.map((sub) => {
            const st = cls.subjects[sub];
            if (!st || !st.inCurriculum) return 'N/A';
            return st.avg !== null ? st.avg : '—';
          }),
          `/${cls.outOf}`,
          `${cls.totalGradedEntries}`,
          cls.classAvg !== null ? cls.classAvg : '—',
          cls.overallPassRate !== null ? `Pass ${cls.overallPassRate}%` : '—',
        ]);

        highlightedRowIndices.push(rows.length);
        rows.push([
          cls.label,
          'PASS %',
          `PASS RATE % (≥ ${cls.passMark})`,
          ...data.officialSubjectNames.map((sub) => {
            const st = cls.subjects[sub];
            if (!st || !st.inCurriculum) return 'N/A';
            return st.passRate !== null ? `${st.passRate}%` : '—';
          }),
          `≥${cls.passMark}`,
          `${cls.studentCount} Std`,
          cls.overallPassRate !== null ? `${cls.overallPassRate}%` : '—',
          mentor ? `Mentor: ${mentor.assignment.mentorShortName}` : '—',
        ]);
      }

      return {
        key,
        sheetName: 'Full_Classes_Marks',
        fileSlug: classFilter
          ? `Class_Marks_Summary_${classFilter.replace(/[^A-Za-z0-9]+/g, '_')}`
          : gradeFilter
          ? `Full_Classes_Marks_${gradeFilter.replace(/\s+/g, '_')}`
          : 'Full_Classes_Marks_With_Summary',
        title: 'Full Classes Marks with Class Summaries',
        subtitle: `${scopedSummaries.length} Classes • ${scopedStudents.length} Students • All Subjects + Per-Class Summary Rows`,
        headers,
        rows,
        rowsPerPdfPage: 22,
        highlightedRowIndices,
      };
    }

    case 'all_marks': {
      const headers = [
        '#',
        'Class',
        ...(forPdf ? [] : ['Student ID']),
        'Roll No',
        'Student Name',
        ...data.officialSubjectNames.map((sub) => shortSubjectHeader(sub, forPdf)),
        'Scale',
        'Graded',
        'Avg',
        'Status',
      ];

      const subjectSums: Record<string, number> = {};
      const subjectCounts: Record<string, number> = {};
      const subjectPasses: Record<string, number> = {};
      for (const sub of data.officialSubjectNames) {
        subjectSums[sub] = 0;
        subjectCounts[sub] = 0;
        subjectPasses[sub] = 0;
      }

      let totalGradedAll = 0;
      let totalPassedAll = 0;
      let studentAvgSum = 0;
      let studentAvgCount = 0;

      const rows: (string | number)[][] = scopedStudents.map((st, idx) => {
        const classCode = `${st.grade.replace('Grade ', 'G')}${st.section.replace('Class ', '')}`;
        const primary13 = isGrade13(st.grade);
        const outOf = primary13 ? 25 : 20;
        const passMark = primary13 ? 12.5 : 10.0;
        const currSet = new Set(
          (
            data.gradeCurriculum[st.grade] ||
            data.officialSubjectNames.map((n) => ({ name: n, code: n, category: '' }))
          ).map((s) => s.name)
        );

        let stSum = 0;
        let stGraded = 0;

        const subCells = data.officialSubjectNames.map((sub) => {
          if (!currSet.has(sub)) return 'N/A';
          const sc = getStudentSubjectTermScore(st, sub, data.dailyRecords);
          if (typeof sc === 'number') {
            stSum += sc;
            stGraded++;
            subjectSums[sub] += sc;
            subjectCounts[sub] += 1;
            totalGradedAll++;
            if (sc >= passMark) {
              subjectPasses[sub] += 1;
              totalPassedAll++;
            }
            return sc;
          }
          return '—';
        });

        const stAvg = stGraded > 0 ? Number((stSum / stGraded).toFixed(1)) : null;
        if (stAvg !== null) {
          studentAvgSum += stAvg;
          studentAvgCount++;
        }
        const status = stAvg === null ? 'Pending' : stAvg >= passMark ? 'Pass' : 'Review';

        return [
          idx + 1,
          classCode,
          ...(forPdf ? [] : [st.id]),
          st.rollNumber,
          st.name,
          ...subCells,
          `/${outOf}`,
          `${stGraded}/${currSet.size}`,
          stAvg !== null ? stAvg : '—',
          status,
        ];
      });

      // Append Overall Summary Footer Rows
      const overallAvgRow: (string | number)[] = [
        'Σ',
        'ALL',
        ...(forPdf ? [] : ['SUMMARY']),
        'AVG',
        `OVERALL SUBJECT AVERAGE (${scopedStudents.length} Students)`,
        ...data.officialSubjectNames.map((sub) =>
          subjectCounts[sub] > 0 ? Number((subjectSums[sub] / subjectCounts[sub]).toFixed(1)) : '—'
        ),
        '—',
        `${totalGradedAll}`,
        studentAvgCount > 0 ? Number((studentAvgSum / studentAvgCount).toFixed(1)) : '—',
        totalGradedAll > 0 ? `${Math.round((totalPassedAll / totalGradedAll) * 100)}% Pass` : '—',
      ];

      const overallPassRow: (string | number)[] = [
        '%',
        'ALL',
        ...(forPdf ? [] : ['SUMMARY']),
        'PASS',
        'OVERALL SUBJECT PASS RATE %',
        ...data.officialSubjectNames.map((sub) =>
          subjectCounts[sub] > 0
            ? `${Math.round((subjectPasses[sub] / subjectCounts[sub]) * 100)}%`
            : '—'
        ),
        '—',
        `${totalPassedAll}/${totalGradedAll}`,
        totalGradedAll > 0 ? `${Math.round((totalPassedAll / totalGradedAll) * 100)}%` : '—',
        'Complete',
      ];

      rows.push(overallAvgRow, overallPassRow);

      return {
        key,
        sheetName: 'All_Marks_Matrix',
        fileSlug: classFilter
          ? `All_Marks_${classFilter.replace(/[^A-Za-z0-9]+/g, '_')}`
          : gradeFilter
          ? `All_Marks_${gradeFilter.replace(/\s+/g, '_')}`
          : 'All_Marks_Master_Sheet',
        title: 'All Marks — Complete School Marksheet',
        subtitle: `${scopedStudents.length} Students • ${totalGradedAll} Recorded Marks Across All Official Subjects`,
        headers,
        rows,
        rowsPerPdfPage: 22,
        summaryRowCount: 2,
      };
    }

    case 'behaviour': {
      const headers = [
        'Student ID',
        'Student Name',
        'Class',
        'Month',
        'Mentor / Supervisor',
        'Social Worker',
        'Day',
        'Published',
        'Rubric Scored',
        'Avg Score (1-5)',
        'Subjects Scored',
        'Incidents Logged',
        'Updated At',
      ];
      const reportsList = Object.values(data.behaviourReports).sort((a, b) =>
        `${a.monthKey}_${a.studentId}`.localeCompare(`${b.monthKey}_${b.studentId}`)
      );

      const rows: (string | number)[][] = [];
      for (const rep of reportsList) {
        const st = studentMap.get(rep.studentId);
        if (st && !matchesClassScope(st.grade, st.section, data.gradeFilter, data.classFilter)) {
          continue;
        }

        const monthObj = BEHAVIOUR_MONTHS.find((m) => m.key === rep.monthKey);
        const ratingVals = Object.values(rep.ratings || {});
        const avgScore =
          ratingVals.length > 0
            ? Number((ratingVals.reduce((acc, v) => acc + v, 0) / ratingVals.length).toFixed(2))
            : '—';
        const subjCount = Object.keys(rep.subjectRatings || {}).length;
        const incCount = Object.values(rep.incidents || {}).filter(
          (i) => (i.occurrences && i.occurrences.trim()) || (i.action && i.action.trim())
        ).length;

        rows.push([
          rep.studentId,
          st?.name || rep.studentId,
          st
            ? `${st.grade.replace('Grade ', 'G')}-${st.section.replace('Class ', '')}`
            : '—',
          monthObj ? monthObj.labelEn : rep.monthKey,
          rep.supervisor || '—',
          rep.socialWorker || 'Ms. Mina',
          rep.dayDate || '—',
          rep.published ? 'Yes' : 'Draft',
          ratingVals.length,
          avgScore,
          subjCount,
          incCount,
          rep.updatedAt ? new Date(rep.updatedAt).toLocaleDateString() : '—',
        ]);
      }

      return {
        key,
        sheetName: 'Behaviour_Reports',
        fileSlug: 'Monthly_Behaviour_Reports',
        title: 'Monthly Behaviour Reports Summary',
        subtitle: `${rows.length} Saved Monthly Behaviour Reports`,
        headers,
        rows,
        rowsPerPdfPage: 19,
      };
    }

    case 'exams': {
      const headers = [
        'Day (EN)',
        'Date',
        'Day (KU)',
        'G1',
        'G2',
        'G3',
        'G4',
        'G5',
        'G6',
        'G7',
        'G8',
        'G9',
      ];
      const rows = data.examRows.map((row) => [
        row.dayEn,
        row.date,
        row.dayKu,
        row.subjectsByGrade['Grade 1'] || '—',
        row.subjectsByGrade['Grade 2'] || '—',
        row.subjectsByGrade['Grade 3'] || '—',
        row.subjectsByGrade['Grade 4'] || '—',
        row.subjectsByGrade['Grade 5'] || '—',
        row.subjectsByGrade['Grade 6'] || '—',
        row.subjectsByGrade['Grade 7'] || '—',
        row.subjectsByGrade['Grade 8'] || '—',
        row.subjectsByGrade['Grade 9'] || '—',
      ]);
      return {
        key,
        sheetName: 'Exams_Schedule',
        fileSlug: 'Exams_Schedule',
        title: 'Official School Exams Schedule (Grades 1 – 9)',
        subtitle: `${rows.length} Exam Days • Official Dates & Subjects`,
        headers,
        rows,
        rowsPerPdfPage: 20,
      };
    }

    case 'attendance': {
      return buildAttendanceClassSummaryTable(data, forPdf);
    }
  }
}

function getAttendanceInputs(data: AdminExportSourceData) {
  return {
    records: data.attendanceRecords || {},
    holidays: data.attendanceHolidays || {},
    enNames: data.attendanceEnglishNames || {},
    monthKey: data.attendanceMonthKey || getDefaultAttendanceMonthKey(),
  };
}

function buildSchoolStructureFromSummaries(
  classSummaries: ExportClassSummaryRow[],
  students: StudentRecord[]
): Record<string, string[]> {
  const struct: Record<string, string[]> = {};
  for (const row of classSummaries) {
    if (!struct[row.grade]) struct[row.grade] = [];
    if (!struct[row.grade].includes(row.section)) struct[row.grade].push(row.section);
  }
  for (const st of students) {
    if (!struct[st.grade]) struct[st.grade] = [];
    if (!struct[st.grade].includes(st.section)) struct[st.grade].push(st.section);
  }
  return struct;
}

function buildAttendanceClassSummaryTable(
  data: AdminExportSourceData,
  forPdf: boolean
): ExportTableDefinition {
  const { records, holidays } = getAttendanceInputs(data);
  const attStudents = mergeAttendanceRoster(data.students);
  const structure = buildSchoolStructureFromSummaries(data.classSummaries, attStudents);
  const summaries = calcAllClassesAttendanceSummary(attStudents, structure, records, holidays).filter(
    (r) => matchesClassScope(r.grade, r.section, data.gradeFilter, data.classFilter)
  );

  const headers = forPdf
    ? [
        'Class',
        'Students',
        ...ATTENDANCE_MONTHS.map((m) => `${m.shortLabel} (A/L)`),
        'Year A',
        'Year L',
        'Year P',
        'Rate %',
      ]
    : [
        'Class',
        'Class Mentor',
        'Students',
        ...ATTENDANCE_MONTHS.flatMap((m) => [`${m.shortLabel} A`, `${m.shortLabel} L`]),
        'Total A (Absent)',
        'Total L (Leave)',
        'Total P (Present)',
        'Attendance %',
      ];

  let sumStudents = 0;
  const sumMonthA: Record<string, number> = {};
  const sumMonthL: Record<string, number> = {};
  for (const m of ATTENDANCE_MONTHS) {
    sumMonthA[m.key] = 0;
    sumMonthL[m.key] = 0;
  }
  let grandA = 0;
  let grandL = 0;
  let grandP = 0;

  const rows: (string | number)[][] = summaries.map((cls) => {
    sumStudents += cls.studentCount;
    grandA += cls.totalA;
    grandL += cls.totalL;
    grandP += cls.totalP;
    for (const m of ATTENDANCE_MONTHS) {
      sumMonthA[m.key] += cls.byMonth[m.key]?.A || 0;
      sumMonthL[m.key] += cls.byMonth[m.key]?.L || 0;
    }

    if (forPdf) {
      return [
        cls.classCode,
        cls.studentCount,
        ...ATTENDANCE_MONTHS.map((m) => {
          const c = cls.byMonth[m.key] || { A: 0, L: 0, P: 0 };
          return `${c.A}/${c.L}`;
        }),
        cls.totalA,
        cls.totalL,
        cls.totalP,
        cls.attendanceRatePct !== null ? `${cls.attendanceRatePct}%` : '—',
      ];
    }

    return [
      cls.classCode,
      cls.mentorName,
      cls.studentCount,
      ...ATTENDANCE_MONTHS.flatMap((m) => {
        const c = cls.byMonth[m.key] || { A: 0, L: 0, P: 0 };
        return [c.A, c.L];
      }),
      cls.totalA,
      cls.totalL,
      cls.totalP,
      cls.attendanceRatePct !== null ? `${cls.attendanceRatePct}%` : '—',
    ];
  });

  const grandTotalRecorded = grandA + grandL + grandP;
  const grandRate =
    grandTotalRecorded > 0 ? `${Math.round(((grandP + grandL) / grandTotalRecorded) * 100)}%` : '—';

  if (forPdf) {
    rows.push([
      'TOTAL',
      sumStudents,
      ...ATTENDANCE_MONTHS.map((m) => `${sumMonthA[m.key]}/${sumMonthL[m.key]}`),
      grandA,
      grandL,
      grandP,
      grandRate,
    ]);
  } else {
    rows.push([
      'SCHOOL TOTAL',
      `${summaries.length} Classes`,
      sumStudents,
      ...ATTENDANCE_MONTHS.flatMap((m) => [sumMonthA[m.key], sumMonthL[m.key]]),
      grandA,
      grandL,
      grandP,
      grandRate,
    ]);
  }

  return {
    key: 'attendance',
    sheetName: 'Class_Summary',
    fileSlug: 'Attendance_Report_2026_2027',
    title: 'Attendance Report 2026–2027 — Class Summary (Sep 2026 – Jul 2027)',
    subtitle: `${summaries.length} Classes • ${sumStudents} Students • Absences (A), Leaves (L) & Present (P)`,
    headers,
    rows,
    rowsPerPdfPage: 20,
    summaryRowCount: 1,
  };
}

function buildAttendanceStudentReportTable(
  data: AdminExportSourceData,
  forPdf: boolean
): ExportTableDefinition {
  const { records, holidays, enNames } = getAttendanceInputs(data);
  const attStudents = mergeAttendanceRoster(data.students);
  const scopedStudents = sortStudentsByClassAndRoll(
    attStudents.filter((s) =>
      matchesClassScope(s.grade, s.section, data.gradeFilter, data.classFilter)
    )
  );

  const headers = forPdf
    ? [
        '#',
        'Class',
        'Student Name (KU/AR)',
        'English Name',
        ...ATTENDANCE_MONTHS.map((m) => `${m.shortLabel} A/L`),
        'Tot A',
        'Tot L',
        'Tot P',
      ]
    : [
        '#',
        'Class',
        'Student ID',
        'Roll No',
        'Student Name (KU/AR Standardized)',
        'English Name',
        ...ATTENDANCE_MONTHS.flatMap((m) => [`${m.shortLabel} A`, `${m.shortLabel} L`]),
        'Total A',
        'Total L',
        'Total P',
        'Attendance %',
      ];

  const rows: (string | number)[][] = scopedStudents.map((st, idx) => {
    const classCode = formatShortClassTabLabel(st.grade, st.section);
    const stdName = standardizeKurdishArabicLetters(st.name);
    const engName = getStudentEnglishName(st.id, st.name, enNames);
    const sum = calcStudentYearCounts(records, st.id, holidays);

    if (forPdf) {
      return [
        idx + 1,
        classCode,
        stdName,
        engName,
        ...ATTENDANCE_MONTHS.map((m) => {
          const c = sum.byMonth[m.key] || { A: 0, L: 0, P: 0 };
          return `${c.A}/${c.L}`;
        }),
        sum.totalA,
        sum.totalL,
        sum.totalP,
      ];
    }

    return [
      idx + 1,
      classCode,
      st.id,
      st.rollNumber,
      stdName,
      engName,
      ...ATTENDANCE_MONTHS.flatMap((m) => {
        const c = sum.byMonth[m.key] || { A: 0, L: 0, P: 0 };
        return [c.A, c.L];
      }),
      sum.totalA,
      sum.totalL,
      sum.totalP,
      sum.attendanceRatePct !== null ? `${sum.attendanceRatePct}%` : '—',
    ];
  });

  return {
    key: 'attendance',
    sheetName: 'Student_Report',
    fileSlug: 'Attendance_Student_Report',
    title: 'Attendance Report 2026–2027 — Student Report',
    subtitle: `${scopedStudents.length} Students • Monthly A & L + Whole-Year Totals`,
    headers,
    rows,
    rowsPerPdfPage: 22,
  };
}

function buildAttendanceTopAbsenteesTable(data: AdminExportSourceData): ExportTableDefinition {
  const { records, holidays, enNames } = getAttendanceInputs(data);
  const attStudents = mergeAttendanceRoster(data.students);
  const scopedStudents = sortStudentsByClassAndRoll(
    attStudents.filter((s) =>
      matchesClassScope(s.grade, s.section, data.gradeFilter, data.classFilter)
    )
  );
  const top15 = calcTopAbsentees(scopedStudents, records, holidays, enNames, 15);

  const headers = [
    'Rank',
    'Class',
    'Mentor',
    'Roll No',
    'Student Name (KU/AR)',
    'English Name',
    'Total A (Absent)',
    'Total L (Leave)',
    'Total P (Present)',
    'Attendance %',
  ];

  const rows: (string | number)[][] = top15.map((item) => [
    item.rank,
    item.classCode,
    item.mentorShort,
    item.student.rollNumber,
    item.standardizedName,
    item.englishName,
    item.summary.totalA,
    item.summary.totalL,
    item.summary.totalP,
    item.summary.attendanceRatePct !== null ? `${item.summary.attendanceRatePct}%` : '—',
  ]);

  return {
    key: 'attendance',
    sheetName: 'Top_Absentees',
    fileSlug: 'Attendance_Top_Absentees',
    title: 'Attendance Report 2026–2027 — Top 15 Absentees',
    subtitle: 'Top 15 students with the most absences (A) recorded so far',
    headers,
    rows,
    rowsPerPdfPage: 16,
  };
}

function buildAttendanceClassMonthSheetTable(
  grade: string,
  section: string,
  monthKey: string,
  data: AdminExportSourceData,
  forPdf: boolean
): ExportTableDefinition {
  const { records, holidays, enNames } = getAttendanceInputs(data);
  const attStudents = mergeAttendanceRoster(data.students);
  const monthOpt = ATTENDANCE_MONTHS.find((m) => m.key === monthKey) || ATTENDANCE_MONTHS[0];
  const classCode = formatShortClassTabLabel(grade, section);
  const classStudents = sortStudentsByClassAndRoll(
    attStudents.filter((s) => s.grade === grade && s.section === section)
  );
  const days = Array.from({ length: monthOpt.daysCount }, (_, i) => i + 1);

  const dayHeaders = days.map((d) => {
    const wk = getWeekdayShort(monthOpt.key, d);
    if (isPreStartSeptemberDay(monthOpt.key, d)) return `${d}*`;
    const iso = makeAttendanceDateIso(monthOpt.key, d);
    if (holidays[iso]) return `${d}H`;
    if (isWeekendFridayOrSaturday(monthOpt.key, d)) return forPdf ? `${d}` : `${d}(${wk})`;
    return forPdf ? `${d}` : `${d}(${wk})`;
  });

  const headers = [
    '#',
    ...(forPdf ? [] : ['Roll No']),
    'Student Name',
    ...(forPdf ? [] : ['English Name']),
    ...dayHeaders,
    'M-A',
    'M-L',
    'M-P',
    'Yr-A',
    'Yr-L',
    'Yr-P',
  ];

  const colA: number[] = Array(days.length).fill(0);
  const colL: number[] = Array(days.length).fill(0);
  const colP: number[] = Array(days.length).fill(0);
  let totMA = 0;
  let totML = 0;
  let totMP = 0;
  let totYA = 0;
  let totYL = 0;
  let totYP = 0;

  const rows: (string | number)[][] = classStudents.map((st, idx) => {
    const stdName = standardizeKurdishArabicLetters(st.name);
    const engName = getStudentEnglishName(st.id, st.name, enNames);
    const rec = records[makeAttendanceRecordKey(st.id, monthOpt.key)];
    const mCounts = calcStudentMonthCounts(rec, monthOpt.key, holidays, st.id);
    const yCounts = calcStudentYearCounts(records, st.id, holidays);

    totMA += mCounts.A;
    totML += mCounts.L;
    totMP += mCounts.P;
    totYA += yCounts.totalA;
    totYL += yCounts.totalL;
    totYP += yCounts.totalP;

    const dayCells = days.map((d, dIdx) => {
      if (isPreStartSeptemberDay(monthOpt.key, d)) return '—';
      const iso = makeAttendanceDateIso(monthOpt.key, d);
      if (holidays[iso]) return 'H';
      const code = rec?.days?.[String(d)] || '';
      if (code === 'A') colA[dIdx]++;
      else if (code === 'L') colL[dIdx]++;
      else if (code === 'P') colP[dIdx]++;
      return code;
    });

    return [
      idx + 1,
      ...(forPdf ? [] : [st.rollNumber]),
      stdName,
      ...(forPdf ? [] : [engName]),
      ...dayCells,
      mCounts.A,
      mCounts.L,
      mCounts.P,
      yCounts.totalA,
      yCounts.totalL,
      yCounts.totalP,
    ];
  });

  // Class totals row under the last student
  rows.push([
    'Σ',
    ...(forPdf ? [] : ['TOTAL']),
    `CLASS TOTAL (${classCode} — ${monthOpt.labelEn})`,
    ...(forPdf ? [] : [`${classStudents.length} Students`]),
    ...days.map((d, dIdx) => {
      if (isPreStartSeptemberDay(monthOpt.key, d)) return '—';
      const iso = makeAttendanceDateIso(monthOpt.key, d);
      if (holidays[iso]) return 'H';
      const sumDay = colA[dIdx] + colL[dIdx] + colP[dIdx];
      return sumDay > 0 ? `P${colP[dIdx]}/A${colA[dIdx]}` : '';
    }),
    totMA,
    totML,
    totMP,
    totYA,
    totYL,
    totYP,
  ]);

  return {
    key: 'attendance',
    sheetName: classCode,
    fileSlug: `Attendance_${classCode}_${monthOpt.key}`,
    title: `Attendance Sheet ${classCode} — ${monthOpt.labelEn}`,
    subtitle: `${classStudents.length} Students • A = Absent (Red), L = Leave (Yellow), P = Present (Green) • *Sep 1–19 Pre-Start Excluded`,
    headers,
    rows,
    rowsPerPdfPage: 24,
    summaryRowCount: 1,
  };
}

function buildAttendanceHowToUseSheet(): { headers: string[]; rows: (string | number)[][] } {
  return {
    headers: ['Section', 'Attendance Report 2026–2027 Guide & Rules'],
    rows: [
      ['Title', 'Dasinya Private School — Attendance Report 2026–2027'],
      ['HOW TO USE 1', 'Open the class tab (1-A, 1-B … 9-A). Each student has one row; each day of the month has one column.'],
      ['HOW TO USE 2', 'Absent → type A. Leave permission → type L. Present → type P. (small letters a / l / p also work.)'],
      ['HOW TO USE 3', 'A = red cell, L = yellow cell, P = green cell. Friday and Saturday columns are light grey (weekend). Days before school started (1–19 September 2026) are dark grey and not counted.'],
      ['HOW TO USE 4', 'At the end of every month there are three count columns, A, L and P, per student, and class totals under the last student.'],
      ['HOW TO USE 5', 'The last three columns of each class tab give the whole-year totals for A, L and P.'],
      ['REPORT TAB', 'Class_Summary — absences (A) and leave permissions (L) for every class, month by month (Sep 2026 – Jul 2027).'],
      ['REPORT TAB', 'Student_Report — every student with A and L per month and for the year.'],
      ['REPORT TAB', 'Top_Absentees — the 15 students with the most absences so far.'],
      ['NOTE', 'School started on 20 September 2026; months run to July 2027. Weekend = Friday & Saturday (shaded grey; counts do not depend on it).'],
      ['NOTE', 'Student names in Kurdish/Arabic standardized Arabic ي ك ى → ی ک ی; English names auto-transliterated.'],
    ],
  };
}

function createWorksheetFromAoa(headers: string[], rows: (string | number)[][]): XLSX.WorkSheet {
  const aoa: (string | number)[][] = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = headers.map((header, colIdx) => {
    let maxLen = header.length;
    for (const r of rows) {
      const cellStr = r[colIdx] === null || r[colIdx] === undefined ? '' : String(r[colIdx]);
      if (cellStr.length > maxLen) maxLen = cellStr.length;
    }
    return { wch: Math.min(48, Math.max(8, maxLen + 3)) };
  });
  return ws;
}

function createWorksheetFromTable(table: ExportTableDefinition): XLSX.WorkSheet {
  return createWorksheetFromAoa(table.headers, table.rows);
}

export function exportDatasetToExcel(
  key: AdminExportDatasetKey,
  data: AdminExportSourceData
): void {
  const wb = XLSX.utils.book_new();
  const usedSheets = new Set<string>();

  if (key === 'full_classes_marks') {
    const summaryTbl = buildExportTable('class_summary', data, false);
    XLSX.utils.book_append_sheet(
      wb,
      createWorksheetFromTable(summaryTbl),
      sanitizeSheetName('Summary_All_Classes', usedSheets)
    );

    const stackedTbl = buildExportTable('full_classes_marks', data, false);
    XLSX.utils.book_append_sheet(
      wb,
      createWorksheetFromTable(stackedTbl),
      sanitizeSheetName('All_Classes_Combined', usedSheets)
    );

    const scopedSummaries = data.classSummaries.filter((r) =>
      matchesClassScope(r.grade, r.section, data.gradeFilter, data.classFilter)
    );
    for (const cls of scopedSummaries) {
      const clsTbl = buildSingleClassMarksTable(cls, data, false);
      XLSX.utils.book_append_sheet(
        wb,
        createWorksheetFromTable(clsTbl),
        sanitizeSheetName(clsTbl.sheetName, usedSheets)
      );
    }

    const suffix =
      data.classFilter && data.classFilter !== 'ALL'
        ? `_${data.classFilter.replace(/[^A-Za-z0-9]+/g, '_')}`
        : data.gradeFilter && data.gradeFilter !== 'ALL'
        ? `_${data.gradeFilter.replace(/\s+/g, '_')}`
        : '';
    XLSX.writeFile(wb, `Dasinya_Full_Classes_Marks_Summary${suffix}_${todayStamp()}.xlsx`);
    return;
  }

  if (key === 'all_marks') {
    const matrixTbl = buildExportTable('all_marks', data, false);
    XLSX.utils.book_append_sheet(
      wb,
      createWorksheetFromTable(matrixTbl),
      sanitizeSheetName('All_Marks_Matrix', usedSheets)
    );

    const detailed = buildAllMarksDetailedRows(data);
    XLSX.utils.book_append_sheet(
      wb,
      createWorksheetFromAoa(detailed.headers, detailed.rows),
      sanitizeSheetName('All_Marks_Detailed', usedSheets)
    );

    const summaryTbl = buildExportTable('class_summary', data, false);
    XLSX.utils.book_append_sheet(
      wb,
      createWorksheetFromTable(summaryTbl),
      sanitizeSheetName('Class_Summary', usedSheets)
    );

    XLSX.writeFile(wb, `Dasinya_${matrixTbl.fileSlug}_${todayStamp()}.xlsx`);
    return;
  }

  if (key === 'attendance') {
    const howTo = buildAttendanceHowToUseSheet();
    XLSX.utils.book_append_sheet(
      wb,
      createWorksheetFromAoa(howTo.headers, howTo.rows),
      sanitizeSheetName('HOW_TO_USE', usedSheets)
    );

    const clsSumTbl = buildAttendanceClassSummaryTable(data, false);
    XLSX.utils.book_append_sheet(
      wb,
      createWorksheetFromTable(clsSumTbl),
      sanitizeSheetName('Class_Summary', usedSheets)
    );

    const stdRepTbl = buildAttendanceStudentReportTable(data, false);
    XLSX.utils.book_append_sheet(
      wb,
      createWorksheetFromTable(stdRepTbl),
      sanitizeSheetName('Student_Report', usedSheets)
    );

    const topAbsTbl = buildAttendanceTopAbsenteesTable(data);
    XLSX.utils.book_append_sheet(
      wb,
      createWorksheetFromTable(topAbsTbl),
      sanitizeSheetName('Top_Absentees', usedSheets)
    );

    const { monthKey } = getAttendanceInputs(data);
    const scopedSummaries = data.classSummaries.filter((r) =>
      matchesClassScope(r.grade, r.section, data.gradeFilter, data.classFilter)
    );
    for (const cls of scopedSummaries) {
      const sheetTbl = buildAttendanceClassMonthSheetTable(
        cls.grade,
        cls.section,
        monthKey,
        data,
        false
      );
      XLSX.utils.book_append_sheet(
        wb,
        createWorksheetFromTable(sheetTbl),
        sanitizeSheetName(sheetTbl.sheetName, usedSheets)
      );
    }

    const suffix =
      data.classFilter && data.classFilter !== 'ALL'
        ? `_${data.classFilter.replace(/[^A-Za-z0-9]+/g, '_')}`
        : data.gradeFilter && data.gradeFilter !== 'ALL'
        ? `_${data.gradeFilter.replace(/\s+/g, '_')}`
        : '';
    XLSX.writeFile(wb, `Dasinya_Attendance_Report_2026-2027${suffix}_${todayStamp()}.xlsx`);
    return;
  }

  const table = buildExportTable(key, data, false);
  XLSX.utils.book_append_sheet(
    wb,
    createWorksheetFromTable(table),
    sanitizeSheetName(table.sheetName, usedSheets)
  );
  XLSX.writeFile(wb, `Dasinya_${table.fileSlug}_${todayStamp()}.xlsx`);
}

export const ALL_EXPORT_DATASET_KEYS: AdminExportDatasetKey[] = [
  'teachers',
  'students',
  'locations',
  'drivers',
  'class_summary',
  'full_classes_marks',
  'all_marks',
  'attendance',
  'behaviour',
  'exams',
];

export function exportAllToExcelWorkbook(data: AdminExportSourceData): void {
  const wb = XLSX.utils.book_new();
  const usedSheets = new Set<string>();

  for (const key of ALL_EXPORT_DATASET_KEYS) {
    const table = buildExportTable(key, data, false);
    XLSX.utils.book_append_sheet(
      wb,
      createWorksheetFromTable(table),
      sanitizeSheetName(table.sheetName, usedSheets)
    );
  }

  // Also append the granular All Marks Detailed Breakdown + Attendance Student Report + Top Absentees
  const detailed = buildAllMarksDetailedRows(data);
  XLSX.utils.book_append_sheet(
    wb,
    createWorksheetFromAoa(detailed.headers, detailed.rows),
    sanitizeSheetName('All_Marks_Detailed', usedSheets)
  );

  const attStudents = buildAttendanceStudentReportTable(data, false);
  XLSX.utils.book_append_sheet(
    wb,
    createWorksheetFromTable(attStudents),
    sanitizeSheetName('Attendance_Students', usedSheets)
  );

  const topAbs = buildAttendanceTopAbsenteesTable(data);
  XLSX.utils.book_append_sheet(
    wb,
    createWorksheetFromTable(topAbs),
    sanitizeSheetName('Top_Absentees', usedSheets)
  );

  const suffix =
    data.classFilter && data.classFilter !== 'ALL'
      ? `_${data.classFilter.replace(/[^A-Za-z0-9]+/g, '_')}`
      : data.gradeFilter && data.gradeFilter !== 'ALL'
      ? `_${data.gradeFilter.replace(/\s+/g, '_')}`
      : '';
  XLSX.writeFile(wb, `Dasinya_All_School_Data${suffix}_${todayStamp()}.xlsx`);
}

function buildPdfPageHtml(
  table: ExportTableDefinition,
  pageRows: (string | number)[][],
  startIndex: number,
  logoDataUrl: string,
  pageNumber: number,
  totalPages: number
): string {
  const compactTable = table.headers.length >= 14;
  const thFontSize = compactTable ? '7.8px' : '9px';
  const tdFontSize = compactTable ? '7.5px' : '8.5px';
  const cellPad = compactTable ? '3px 4px' : '4px 6px';

  const summaryStartIndex =
    table.summaryRowCount && table.summaryRowCount > 0
      ? table.rows.length - table.summaryRowCount
      : Number.POSITIVE_INFINITY;
  const highlightSet = new Set(table.highlightedRowIndices || []);

  const headerCells = table.headers
    .map(
      (h) =>
        `<th style="border:1px solid #CBD5E1;padding:${cellPad};background:#1A1D4E;color:#FFFFFF;font-size:${thFontSize};font-weight:800;text-align:left;white-space:nowrap;">${escapeHtml(
          h
        )}</th>`
    )
    .join('');

  const bodyRows =
    pageRows.length > 0
      ? pageRows
          .map((row, rIdx) => {
            const globalIdx = startIndex + rIdx;
            const isSummary = globalIdx >= summaryStartIndex || highlightSet.has(globalIdx);
            const bg = isSummary
              ? '#E1F3F7'
              : globalIdx % 2 === 1
              ? '#F8FAFC'
              : '#FFFFFF';
            const fontWeight = isSummary ? '800' : '500';
            const textColor = isSummary ? '#1A1D4E' : '#0F172A';
            const tds = row
              .map(
                (cell) =>
                  `<td dir="auto" style="border:1px solid #CBD5E1;padding:${cellPad};font-size:${tdFontSize};font-weight:${fontWeight};line-height:1.22;color:${textColor};vertical-align:middle;word-break:break-word;">${escapeHtml(
                    cell
                  )}</td>`
              )
              .join('');
            return `<tr style="background:${bg};">${tds}</tr>`;
          })
          .join('')
      : `<tr><td colspan="${table.headers.length}" style="border:1px solid #CBD5E1;padding:16px;text-align:center;font-size:10px;color:#64748B;">No records available for this section.</td></tr>`;

  return `
    <div style="width:1120px;background:#FFFFFF;padding:16px 20px;font-family:'Cairo','Inter',Arial,sans-serif;color:#0F172A;box-sizing:border-box;">
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #0087A5;padding-bottom:8px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${logoDataUrl}" alt="Dasinya" style="width:38px;height:38px;object-fit:contain;" />
          <div>
            <div style="font-size:14px;font-weight:900;color:#1A1D4E;">Dasinya Private School — ${escapeHtml(
              table.title
            )}</div>
            <div style="font-size:10px;color:#475569;">${escapeHtml(table.subtitle)}</div>
          </div>
        </div>
        <div style="text-align:right;font-size:9px;color:#475569;">
          <div style="font-weight:800;color:#0087A5;">Generated: ${todayStamp()}</div>
          <div>Page ${pageNumber} of ${totalPages}</div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;table-layout:auto;">
        <thead>
          <tr>${headerCells}</tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    </div>
  `;
}

async function renderHtmlPagesToPdf(
  tables: ExportTableDefinition[],
  logoUrl: string,
  filename: string,
  onProgress?: (progress: ExportPdfProgress) => void
): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready.catch(() => {});
  }

  const safeLogoUrl = await resolveSafeLogoUrl(logoUrl);
  const sanitizedProdCss = collectSanitizedProdCssFromLiveDocument();

  interface PageJob {
    table: ExportTableDefinition;
    rows: (string | number)[][];
    startIndex: number;
  }

  const jobs: PageJob[] = [];
  for (const tbl of tables) {
    if (tbl.rows.length === 0) {
      jobs.push({ table: tbl, rows: [], startIndex: 0 });
    } else {
      for (let i = 0; i < tbl.rows.length; i += tbl.rowsPerPdfPage) {
        jobs.push({
          table: tbl,
          rows: tbl.rows.slice(i, i + tbl.rowsPerPdfPage),
          startIndex: i,
        });
      }
    }
  }

  const container = document.createElement('div');
  container.id = 'dasinya-admin-pdf-stage';
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '1120px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-1';
  document.body.appendChild(container);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 6;
  const availW = pdfWidth - margin * 2;
  const availH = pdfHeight - margin * 2;

  try {
    for (let idx = 0; idx < jobs.length; idx++) {
      const job = jobs[idx];
      onProgress?.({
        currentPage: idx + 1,
        totalPages: jobs.length,
        sectionLabel: job.table.title,
      });

      container.innerHTML = buildPdfPageHtml(
        job.table,
        job.rows,
        job.startIndex,
        safeLogoUrl,
        idx + 1,
        jobs.length
      );

      // Let layout settle cleanly
      await new Promise((r) => window.setTimeout(r, 15));

      const pageEl = container.firstElementChild as HTMLElement;
      const canvas = await html2canvas(pageEl, {
        scale: 1.75,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1120,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
          for (const st of styleTags) {
            if (st.textContent) {
              st.textContent = stripUnsupportedColorFunctions(st.textContent);
            }
          }
          if (sanitizedProdCss) {
            const links = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
            for (const lnk of links) {
              const href = lnk.getAttribute('href') || '';
              if (href.startsWith('/') || href.startsWith(window.location.origin)) {
                lnk.remove();
              }
            }
            const inlineStyle = clonedDoc.createElement('style');
            inlineStyle.textContent = sanitizedProdCss;
            clonedDoc.head.appendChild(inlineStyle);
          }
          clonedDoc.documentElement.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.backgroundColor = '#ffffff';
        },
      });

      const imgData = canvas.toDataURL('image/png', 0.95);
      if (idx > 0) {
        pdf.addPage('a4', 'landscape');
      }

      const ratio = Math.min(availW / canvas.width, availH / canvas.height);
      const drawW = canvas.width * ratio;
      const drawH = canvas.height * ratio;
      const offsetX = (pdfWidth - drawW) / 2;
      pdf.addImage(imgData, 'PNG', offsetX, margin, drawW, drawH);
    }

    pdf.save(filename);
  } finally {
    container.remove();
  }
}

function buildFullClassesPdfTables(data: AdminExportSourceData): ExportTableDefinition[] {
  const scopedSummaries = data.classSummaries.filter((r) =>
    matchesClassScope(r.grade, r.section, data.gradeFilter, data.classFilter)
  );
  const summaryOverview = buildExportTable('class_summary', data, true);
  const perClassTables = scopedSummaries.map((cls) => buildSingleClassMarksTable(cls, data, true));
  return [summaryOverview, ...perClassTables];
}

export async function exportDatasetToPdf(
  key: AdminExportDatasetKey,
  data: AdminExportSourceData,
  onProgress?: (progress: ExportPdfProgress) => void
): Promise<void> {
  if (key === 'full_classes_marks') {
    const tables = buildFullClassesPdfTables(data);
    const suffix =
      data.classFilter && data.classFilter !== 'ALL'
        ? `_${data.classFilter.replace(/[^A-Za-z0-9]+/g, '_')}`
        : data.gradeFilter && data.gradeFilter !== 'ALL'
        ? `_${data.gradeFilter.replace(/\s+/g, '_')}`
        : '';
    await renderHtmlPagesToPdf(
      tables,
      data.schoolLogoUrl,
      `Dasinya_Full_Classes_Marks_Summary${suffix}_${todayStamp()}.pdf`,
      onProgress
    );
    return;
  }

  if (key === 'attendance') {
    const { monthKey } = getAttendanceInputs(data);
    const classSumTbl = buildAttendanceClassSummaryTable(data, true);
    const topAbsTbl = buildAttendanceTopAbsenteesTable(data);
    const studentTbl = buildAttendanceStudentReportTable(data, true);
    const scopedSummaries = data.classSummaries.filter((r) =>
      matchesClassScope(r.grade, r.section, data.gradeFilter, data.classFilter)
    );
    const perClassTables = scopedSummaries.map((cls) =>
      buildAttendanceClassMonthSheetTable(cls.grade, cls.section, monthKey, data, true)
    );
    const suffix =
      data.classFilter && data.classFilter !== 'ALL'
        ? `_${data.classFilter.replace(/[^A-Za-z0-9]+/g, '_')}`
        : data.gradeFilter && data.gradeFilter !== 'ALL'
        ? `_${data.gradeFilter.replace(/\s+/g, '_')}`
        : '';
    await renderHtmlPagesToPdf(
      [classSumTbl, topAbsTbl, studentTbl, ...perClassTables],
      data.schoolLogoUrl,
      `Dasinya_Attendance_Report_2026-2027${suffix}_${todayStamp()}.pdf`,
      onProgress
    );
    return;
  }

  const table = buildExportTable(key, data, true);
  await renderHtmlPagesToPdf(
    [table],
    data.schoolLogoUrl,
    `Dasinya_${table.fileSlug}_${todayStamp()}.pdf`,
    onProgress
  );
}

export async function exportAllToPdf(
  data: AdminExportSourceData,
  onProgress?: (progress: ExportPdfProgress) => void
): Promise<void> {
  const tables: ExportTableDefinition[] = [];
  for (const key of ALL_EXPORT_DATASET_KEYS) {
    if (key === 'full_classes_marks') {
      const scopedSummaries = data.classSummaries.filter((r) =>
        matchesClassScope(r.grade, r.section, data.gradeFilter, data.classFilter)
      );
      tables.push(...scopedSummaries.map((cls) => buildSingleClassMarksTable(cls, data, true)));
    } else if (key === 'attendance') {
      tables.push(buildAttendanceClassSummaryTable(data, true));
      tables.push(buildAttendanceTopAbsenteesTable(data));
    } else {
      tables.push(buildExportTable(key, data, true));
    }
  }
  const suffix =
    data.classFilter && data.classFilter !== 'ALL'
      ? `_${data.classFilter.replace(/[^A-Za-z0-9]+/g, '_')}`
      : data.gradeFilter && data.gradeFilter !== 'ALL'
      ? `_${data.gradeFilter.replace(/\s+/g, '_')}`
      : '';
  await renderHtmlPagesToPdf(
    tables,
    data.schoolLogoUrl,
    `Dasinya_All_School_Data${suffix}_${todayStamp()}.pdf`,
    onProgress
  );
}
