/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Admin Panel Comprehensive Data Export Center (Excel .xlsx & Multi-Page Unicode PDF)
 * Supports Teachers, Students, Locations, Drivers, Class Summary, Behaviour Reports, Exams & Full Bundle
 */

import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { StudentRecord } from '../data/importedStudents';
import {
  TEACHER_ACCOUNTS,
  getMentorAssignmentForTeacher,
  getMentorForClass,
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
import { LiveBusState } from '../hooks/useBusTracking';

export type AdminExportDatasetKey =
  | 'teachers'
  | 'students'
  | 'locations'
  | 'drivers'
  | 'class_summary'
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
  liveBuses: Record<string, LiveBusState>;
  classSummaries: ExportClassSummaryRow[];
  officialSubjectNames: string[];
  behaviourReports: Record<string, MonthlyBehaviourReport>;
  examRows: ExamScheduleRow[];
  schoolLogoUrl: string;
  gradeFilter?: string;
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

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
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

export function buildExportTable(
  key: AdminExportDatasetKey,
  data: AdminExportSourceData,
  forPdf = false
): ExportTableDefinition {
  const gradeFilter = data.gradeFilter && data.gradeFilter !== 'ALL' ? data.gradeFilter : null;
  const scopedStudents = gradeFilter
    ? data.students.filter((s) => s.grade === gradeFilter)
    : data.students;
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
      const summaries = gradeFilter
        ? data.classSummaries.filter((r) => r.grade === gradeFilter)
        : data.classSummaries;

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

      const rows = summaries.map((r) => {
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
        if (gradeFilter && st && st.grade !== gradeFilter) continue;

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
  }
}

function createWorksheetFromTable(table: ExportTableDefinition): XLSX.WorkSheet {
  const aoa: (string | number)[][] = [table.headers, ...table.rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = table.headers.map((header, colIdx) => {
    let maxLen = header.length;
    for (const r of table.rows) {
      const cellStr = r[colIdx] === null || r[colIdx] === undefined ? '' : String(r[colIdx]);
      if (cellStr.length > maxLen) maxLen = cellStr.length;
    }
    return { wch: Math.min(48, Math.max(10, maxLen + 3)) };
  });
  return ws;
}

export function exportDatasetToExcel(
  key: AdminExportDatasetKey,
  data: AdminExportSourceData
): void {
  const table = buildExportTable(key, data, false);
  const wb = XLSX.utils.book_new();
  const ws = createWorksheetFromTable(table);
  XLSX.utils.book_append_sheet(wb, ws, table.sheetName);
  XLSX.writeFile(wb, `Dasinya_${table.fileSlug}_${todayStamp()}.xlsx`);
}

export const ALL_EXPORT_DATASET_KEYS: AdminExportDatasetKey[] = [
  'teachers',
  'students',
  'locations',
  'drivers',
  'class_summary',
  'behaviour',
  'exams',
];

export function exportAllToExcelWorkbook(data: AdminExportSourceData): void {
  const wb = XLSX.utils.book_new();
  for (const key of ALL_EXPORT_DATASET_KEYS) {
    const table = buildExportTable(key, data, false);
    const ws = createWorksheetFromTable(table);
    XLSX.utils.book_append_sheet(wb, ws, table.sheetName);
  }
  const suffix =
    data.gradeFilter && data.gradeFilter !== 'ALL'
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
  const headerCells = table.headers
    .map(
      (h) =>
        `<th style="border:1px solid #CBD5E1;padding:5px 6px;background:#1A1D4E;color:#FFFFFF;font-size:9px;font-weight:800;text-align:left;white-space:nowrap;">${escapeHtml(
          h
        )}</th>`
    )
    .join('');

  const bodyRows =
    pageRows.length > 0
      ? pageRows
          .map((row, rIdx) => {
            const bg = (startIndex + rIdx) % 2 === 1 ? '#F8FAFC' : '#FFFFFF';
            const tds = row
              .map(
                (cell) =>
                  `<td dir="auto" style="border:1px solid #CBD5E1;padding:4px 6px;font-size:8.5px;line-height:1.25;color:#0F172A;vertical-align:middle;word-break:break-word;">${escapeHtml(
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

export async function exportDatasetToPdf(
  key: AdminExportDatasetKey,
  data: AdminExportSourceData,
  onProgress?: (progress: ExportPdfProgress) => void
): Promise<void> {
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
  const tables = ALL_EXPORT_DATASET_KEYS.map((key) => buildExportTable(key, data, true));
  const suffix =
    data.gradeFilter && data.gradeFilter !== 'ALL'
      ? `_${data.gradeFilter.replace(/\s+/g, '_')}`
      : '';
  await renderHtmlPagesToPdf(
    tables,
    data.schoolLogoUrl,
    `Dasinya_All_School_Data${suffix}_${todayStamp()}.pdf`,
    onProgress
  );
}
