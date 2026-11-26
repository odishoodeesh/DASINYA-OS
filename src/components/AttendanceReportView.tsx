/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Attendance Report 2026–2027 Interactive Workspace
 * Implements Class Tabs (1-A..9-A), Class Summary, Student Report, Top 15 Absentees,
 * September 20 start cutoff (1-19 Sep dark grey), Fri/Sat weekends, A/L/P color coding,
 * auto-transliteration & Kurdish/Arabic standardization, and Excel/PDF exports.
 */

import React, { useMemo, useState } from 'react';
import {
  CalendarCheck2,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Loader2,
  Search,
  Trophy,
  Users,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Filter,
  Sparkles,
  Umbrella,
} from 'lucide-react';
import { StudentRecord } from '../data/importedStudents';
import {
  ATTENDANCE_MONTHS,
  AttendanceCode,
  AttendanceMonthRecord,
  calcAllClassesAttendanceSummary,
  calcStudentMonthCounts,
  calcStudentYearCounts,
  calcTopAbsentees,
  formatShortClassTabLabel,
  getDefaultAttendanceMonthKey,
  getOfficialMonthBaseline,
  getStudentEnglishName,
  getWeekdayShort,
  isPreStartSeptemberDay,
  isWeekendFridayOrSaturday,
  makeAttendanceDateIso,
  makeAttendanceRecordKey,
  mergeAttendanceRoster,
  standardizeKurdishArabicLetters,
} from '../data/attendanceReport';
import { Language } from '../lib/translations';
import {
  AdminExportSourceData,
  ExportClassSummaryRow,
  ExportPdfProgress,
  exportDatasetToExcel,
  exportDatasetToPdf,
} from '../lib/adminExport';
import { DailySubjectRecord } from '../data/teacherPortal';
import { LiveBusState } from '../hooks/useBusTracking';
import { MonthlyBehaviourReport } from '../data/behaviourReport';
import { ExamScheduleRow } from '../data/examsSchedule';

interface AttendanceReportViewProps {
  mode: 'admin' | 'mentor';
  students: StudentRecord[];
  schoolStructure: Record<string, string[]>;
  attendanceRecords: Record<string, AttendanceMonthRecord>;
  attendanceHolidays: Record<string, boolean>;
  customEnglishNames: Record<string, string>;
  onUpdateDayStatus: (
    studentId: string,
    monthKey: string,
    day: number,
    code: AttendanceCode | ''
  ) => void;
  onBulkFillDayPresent: (
    classStudents: StudentRecord[],
    monthKey: string,
    day: number
  ) => void;
  onToggleHoliday: (dateIso: string) => void;
  onUpdateEnglishName: (studentId: string, nameEn: string) => void;
  /** Required in mentor mode so the teacher sees ONLY their mentored class */
  lockedClass?: { grade: string; section: string; classCode: string } | null;
  language: Language;
  /** Optional export wiring for full Excel / PDF export from Attendance toolbar */
  exportSourceBase?: {
    dailyRecords: Record<string, DailySubjectRecord>;
    gradeCurriculum: Record<string, Array<{ name: string; code: string; category: string }>>;
    liveBuses: Record<string, LiveBusState>;
    classSummaries: ExportClassSummaryRow[];
    officialSubjectNames: string[];
    behaviourReports: Record<string, MonthlyBehaviourReport>;
    examRows: ExamScheduleRow[];
    schoolLogoUrl: string;
  };
}

type AttendanceSubTab = 'sheet' | 'class_summary' | 'student_report' | 'top_absentees';

export const AttendanceReportView: React.FC<AttendanceReportViewProps> = ({
  mode,
  students,
  schoolStructure,
  attendanceRecords,
  attendanceHolidays,
  customEnglishNames,
  onUpdateDayStatus,
  onBulkFillDayPresent,
  onToggleHoliday,
  onUpdateEnglishName,
  lockedClass,
  language,
  exportSourceBase,
}) => {
  const allClassOptions = useMemo(() => {
    const list: Array<{ grade: string; section: string; classCode: string }> = [];
    for (const grade of Object.keys(schoolStructure)) {
      for (const section of schoolStructure[grade] || []) {
        list.push({
          grade,
          section,
          classCode: formatShortClassTabLabel(grade, section),
        });
      }
    }
    return list;
  }, [schoolStructure]);

  const [subTab, setSubTab] = useState<AttendanceSubTab>('sheet');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() =>
    getDefaultAttendanceMonthKey()
  );
  const [selectedClassKey, setSelectedClassKey] = useState<string>(() =>
    lockedClass
      ? `${lockedClass.grade}::${lockedClass.section}`
      : allClassOptions[0]
      ? `${allClassOptions[0].grade}::${allClassOptions[0].section}`
      : 'Grade 1::Class A'
  );
  const [showHowToUse, setShowHowToUse] = useState<boolean>(false);

  // Student Report Filters
  const [srClassFilter, setSrClassFilter] = useState<string>('ALL');
  const [srFilterMode, setSrFilterMode] = useState<'ALL' | 'A_GT_0' | 'L_GT_0' | 'A_GE_3'>('ALL');
  const [srSearch, setSrSearch] = useState<string>('');

  // Export state
  const [exportBusy, setExportBusy] = useState<'excel' | 'pdf' | null>(null);
  const [exportProgress, setExportProgress] = useState<ExportPdfProgress | null>(null);
  const [exportNotice, setExportNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const activeClass = useMemo(() => {
    if (lockedClass) return lockedClass;
    const found = allClassOptions.find((c) => `${c.grade}::${c.section}` === selectedClassKey);
    return found || allClassOptions[0] || { grade: 'Grade 1', section: 'Class A', classCode: '1-A' };
  }, [lockedClass, allClassOptions, selectedClassKey]);

  const activeMonth = useMemo(
    () => ATTENDANCE_MONTHS.find((m) => m.key === selectedMonthKey) || ATTENDANCE_MONTHS[0],
    [selectedMonthKey]
  );

  const monthDays = useMemo(
    () => Array.from({ length: activeMonth.daysCount }, (_, i) => i + 1),
    [activeMonth.daysCount]
  );

  const scopedAllStudents = useMemo(() => {
    const merged = mergeAttendanceRoster(
      students,
      mode === 'mentor' && lockedClass ? lockedClass : null
    );
    if (mode === 'mentor' && lockedClass) {
      return merged.filter(
        (s) => s.grade === lockedClass.grade && s.section === lockedClass.section
      );
    }
    return merged;
  }, [mode, lockedClass, students]);

  const activeClassStudents = useMemo(() => {
    return scopedAllStudents
      .filter((s) => s.grade === activeClass.grade && s.section === activeClass.section)
      .sort((a, b) => (a.serial ?? 9999) - (b.serial ?? 9999) || a.rollNumber.localeCompare(b.rollNumber));
  }, [scopedAllStudents, activeClass]);

  const classSummaries = useMemo(
    () =>
      calcAllClassesAttendanceSummary(
        scopedAllStudents,
        mode === 'mentor' && lockedClass
          ? { [lockedClass.grade]: [lockedClass.section] }
          : schoolStructure,
        attendanceRecords,
        attendanceHolidays
      ),
    [scopedAllStudents, mode, lockedClass, schoolStructure, attendanceRecords, attendanceHolidays]
  );

  const topAbsentees = useMemo(
    () =>
      calcTopAbsentees(
        scopedAllStudents,
        attendanceRecords,
        attendanceHolidays,
        customEnglishNames,
        15
      ),
    [scopedAllStudents, attendanceRecords, attendanceHolidays, customEnglishNames]
  );

  const studentReportRows = useMemo(() => {
    const q = srSearch.trim().toLowerCase();
    return scopedAllStudents
      .filter((st) => {
        if (srClassFilter !== 'ALL' && `${st.grade}::${st.section}` !== srClassFilter) {
          return false;
        }
        return true;
      })
      .map((st) => {
        const stdName = standardizeKurdishArabicLetters(st.name);
        const engName = getStudentEnglishName(st.id, st.name, customEnglishNames);
        const summary = calcStudentYearCounts(attendanceRecords, st.id, attendanceHolidays);
        return {
          student: st,
          classCode: formatShortClassTabLabel(st.grade, st.section),
          stdName,
          engName,
          summary,
        };
      })
      .filter((row) => {
        if (srFilterMode === 'A_GT_0' && row.summary.totalA <= 0) return false;
        if (srFilterMode === 'L_GT_0' && row.summary.totalL <= 0) return false;
        if (srFilterMode === 'A_GE_3' && row.summary.totalA < 3) return false;
        if (q) {
          return (
            row.stdName.toLowerCase().includes(q) ||
            row.engName.toLowerCase().includes(q) ||
            row.student.rollNumber.toLowerCase().includes(q) ||
            row.student.id.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [
    scopedAllStudents,
    srClassFilter,
    srFilterMode,
    srSearch,
    customEnglishNames,
    attendanceRecords,
    attendanceHolidays,
  ]);

  // Precompute active class day-by-day column totals & student counts
  const activeClassGridData = useMemo(() => {
    const colTotals: Record<number, { A: number; L: number; P: number }> = {};
    for (const d of monthDays) {
      colTotals[d] = { A: 0, L: 0, P: 0 };
    }
    let classMonthA = 0;
    let classMonthL = 0;
    let classMonthP = 0;
    let classYearA = 0;
    let classYearL = 0;
    let classYearP = 0;

    const rows = activeClassStudents.map((st, rowIdx) => {
      const rec = attendanceRecords[makeAttendanceRecordKey(st.id, activeMonth.key)];
      const mCounts = calcStudentMonthCounts(rec, activeMonth.key, attendanceHolidays, st.id);
      const yCounts = calcStudentYearCounts(attendanceRecords, st.id, attendanceHolidays);
      const mBaseline = getOfficialMonthBaseline(st.id, activeMonth.key);

      classMonthA += mCounts.A;
      classMonthL += mCounts.L;
      classMonthP += mCounts.P;
      classYearA += yCounts.totalA;
      classYearL += yCounts.totalL;
      classYearP += yCounts.totalP;

      for (const d of monthDays) {
        if (isPreStartSeptemberDay(activeMonth.key, d)) continue;
        const iso = makeAttendanceDateIso(activeMonth.key, d);
        if (attendanceHolidays[iso]) continue;
        const c = rec?.days?.[String(d)];
        if (c === 'A') colTotals[d].A++;
        else if (c === 'L') colTotals[d].L++;
        else if (c === 'P') colTotals[d].P++;
      }

      return {
        index: rowIdx + 1,
        student: st,
        stdName: standardizeKurdishArabicLetters(st.name),
        engName: getStudentEnglishName(st.id, st.name, customEnglishNames),
        days: rec?.days || {},
        mCounts,
        yCounts,
        mBaseline,
      };
    });

    return {
      rows,
      colTotals,
      classMonthA,
      classMonthL,
      classMonthP,
      classYearA,
      classYearL,
      classYearP,
    };
  }, [
    activeClassStudents,
    attendanceRecords,
    activeMonth.key,
    attendanceHolidays,
    customEnglishNames,
    monthDays,
  ]);

  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    day: number,
    studentId: string
  ) => {
    const key = e.key;
    const upper = key.toUpperCase();

    if (upper === 'A' || upper === 'L' || upper === 'P') {
      e.preventDefault();
      onUpdateDayStatus(studentId, activeMonth.key, day, upper as AttendanceCode);
      // Advance smoothly to next student row or next day
      const nextRowInput = document.querySelector<HTMLInputElement>(
        `input[data-att-cell="${rowIdx + 1}-${day}"]`
      );
      if (nextRowInput) {
        nextRowInput.focus();
        nextRowInput.select();
      }
      return;
    }

    if (key === 'Backspace' || key === 'Delete' || key === ' ') {
      e.preventDefault();
      onUpdateDayStatus(studentId, activeMonth.key, day, '');
      return;
    }

    if (key === 'ArrowDown') {
      e.preventDefault();
      document
        .querySelector<HTMLInputElement>(`input[data-att-cell="${rowIdx + 1}-${day}"]`)
        ?.focus();
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      document
        .querySelector<HTMLInputElement>(`input[data-att-cell="${rowIdx - 1}-${day}"]`)
        ?.focus();
    } else if (key === 'ArrowRight') {
      e.preventDefault();
      for (let nextD = day + 1; nextD <= activeMonth.daysCount; nextD++) {
        const el = document.querySelector<HTMLInputElement>(
          `input[data-att-cell="${rowIdx}-${nextD}"]`
        );
        if (el && !el.disabled) {
          el.focus();
          break;
        }
      }
    } else if (key === 'ArrowLeft') {
      e.preventDefault();
      for (let prevD = day - 1; prevD >= 1; prevD--) {
        const el = document.querySelector<HTMLInputElement>(
          `input[data-att-cell="${rowIdx}-${prevD}"]`
        );
        if (el && !el.disabled) {
          el.focus();
          break;
        }
      }
    }
  };

  const buildExportSource = (): AdminExportSourceData => ({
    students: scopedAllStudents,
    dailyRecords: exportSourceBase?.dailyRecords || {},
    gradeCurriculum: exportSourceBase?.gradeCurriculum || {},
    liveBuses: exportSourceBase?.liveBuses || {},
    classSummaries: exportSourceBase?.classSummaries || [],
    officialSubjectNames: exportSourceBase?.officialSubjectNames || [],
    behaviourReports: exportSourceBase?.behaviourReports || {},
    attendanceRecords,
    attendanceHolidays,
    attendanceEnglishNames: customEnglishNames,
    attendanceMonthKey: selectedMonthKey,
    examRows: exportSourceBase?.examRows || [],
    schoolLogoUrl: exportSourceBase?.schoolLogoUrl || '',
    classFilter:
      mode === 'mentor' && lockedClass ? `${lockedClass.grade}::${lockedClass.section}` : 'ALL',
  });

  const handleExportExcel = () => {
    if (exportBusy) return;
    setExportNotice(null);
    setExportBusy('excel');
    try {
      exportDatasetToExcel('attendance', buildExportSource());
      setExportNotice({
        ok: true,
        text:
          language === 'ku'
            ? 'فایلا Attendance Report (Excel .xlsx) ب سەرکەفتیانە هاتە داگرتن'
            : language === 'ar'
            ? 'تم تنزيل ملف تقرير الحضور (Excel .xlsx) بنجاح'
            : 'Attendance Report 2026–2027 (.xlsx workbook) downloaded successfully.',
      });
    } catch (err) {
      setExportNotice({
        ok: false,
        text: err instanceof Error ? err.message : 'Attendance Excel export failed.',
      });
    } finally {
      setExportBusy(null);
    }
  };

  const handleExportPdf = async () => {
    if (exportBusy) return;
    setExportNotice(null);
    setExportBusy('pdf');
    setExportProgress(null);
    try {
      await exportDatasetToPdf('attendance', buildExportSource(), (p) => setExportProgress(p));
      setExportNotice({
        ok: true,
        text:
          language === 'ku'
            ? 'فایلا Attendance Report (PDF) ب سەرکەفتیانە هاتە داگرتن'
            : language === 'ar'
            ? 'تم تنزيل تقرير الحضور (PDF) بنجاح'
            : 'Attendance Report 2026–2027 (.pdf) downloaded successfully.',
      });
    } catch (err) {
      setExportNotice({
        ok: false,
        text: err instanceof Error ? err.message : 'Attendance PDF export failed.',
      });
    } finally {
      setExportBusy(null);
      setExportProgress(null);
    }
  };

  const cycleCellValue = (studentId: string, day: number, current?: AttendanceCode) => {
    const next: AttendanceCode | '' =
      !current ? 'P' : current === 'P' ? 'A' : current === 'A' ? 'L' : '';
    onUpdateDayStatus(studentId, activeMonth.key, day, next);
  };

  return (
    <div className="space-y-5">
      {/* Top Attendance Control Banner */}
      <div className="bg-white border border-[#E1E9FF] rounded-3xl p-4 sm:p-5 shadow-[0_6px_20px_rgba(0,135,165,0.06)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0087A5] to-[#00A887] text-white flex items-center justify-center shrink-0 shadow-sm">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#1A1D4E]">
                  {language === 'ku'
                    ? 'راپۆرتا ئامادەبوونێ ٢٠٢٦–٢٠٢٧'
                    : language === 'ar'
                    ? 'تقرير الحضور والغياب ٢٠٢٦–٢٠٢٧'
                    : 'Attendance Report 2026–2027'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E1F3F7] text-[#0087A5] text-[10px] font-mono font-black">
                  Sep 20, 2026 – Jul 2027
                </span>
                {mode === 'mentor' && lockedClass && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1A1D4E] text-white text-[10px] font-mono font-bold">
                    Mentor Scope: {lockedClass.classCode} Only
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B70A6]">
                {language === 'ku'
                  ? 'A = نەهاتی (سوور) • L = مۆلەت (زەر) • P = ئامادە (کەسک) • ئەینی/شەمبی و پێش ٢٠/٩ ناهێنە هژمارتن'
                  : language === 'ar'
                  ? 'A = غياب (أحمر) • L = إجازة (أصفر) • P = حضور (أخضر) • الجمعة/السبت وما قبل 20 سبتمبر مظللة'
                  : 'Type A (Absent), L (Leave), P (Present) • Automatic monthly & whole-year counts + live Top 15 Absentees.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHowToUse((v) => !v)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                showHowToUse
                  ? 'bg-[#1A1D4E] text-white border-[#1A1D4E]'
                  : 'bg-[#F5F6FF] hover:bg-[#E1E9FF] text-[#1A1D4E] border-[#E1E9FF]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>HOW TO USE</span>
            </button>

            <button
              type="button"
              disabled={Boolean(exportBusy)}
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-[#00A887] hover:bg-[#008E72] disabled:opacity-60 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {exportBusy === 'excel' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              <span>Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              disabled={Boolean(exportBusy)}
              onClick={handleExportPdf}
              className="px-3.5 py-2 rounded-xl bg-[#1A1D4E] hover:bg-[#2A2F72] disabled:opacity-60 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {exportBusy === 'pdf' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-[#FF7F2A]" />
              )}
              <span>
                {exportBusy === 'pdf'
                  ? exportProgress
                    ? `PDF ${exportProgress.currentPage}/${exportProgress.totalPages}`
                    : 'PDF...'
                  : 'PDF (.pdf)'}
              </span>
            </button>
          </div>
        </div>

        {/* Collapsible HOW TO USE & NOTES matching the official sheet */}
        {showHowToUse && (
          <div className="bg-[#F8FAFF] border border-[#D8E2FF] rounded-2xl p-4 text-xs text-[#1A1D4E] space-y-2.5">
            <div className="font-black text-sm text-[#0087A5]">
              Attendance Report 2026–2027 — HOW TO USE & NOTES
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[#334155]">
              <li>
                <strong>1.</strong> Open a class tab (<strong>1-A</strong>, <strong>1-B</strong> …{' '}
                <strong>9-A</strong>). Each student has one row; each day of the month has one column.
              </li>
              <li>
                <strong>2.</strong> Absent → type <strong className="text-rose-700">A</strong>. Leave
                permission → type <strong className="text-amber-700">L</strong>. Present → type{' '}
                <strong className="text-emerald-700">P</strong>. (Small letters a / l / p or clicking cells also works.)
              </li>
              <li>
                <strong>3.</strong> <strong>A = Red</strong>, <strong>L = Yellow</strong>,{' '}
                <strong>P = Green</strong>. Friday & Saturday columns are shaded <strong>light grey</strong>{' '}
                (weekend). Days before school started (<strong>1–19 September 2026</strong>) are{' '}
                <strong>dark grey</strong> and automatically excluded from counts.
              </li>
              <li>
                <strong>4.</strong> Click the small holiday icon on any day column header to shade/unshade an official school holiday.
              </li>
              <li>
                <strong>5.</strong> Monthly <strong>A, L, P</strong> and whole-year{' '}
                <strong>Year A, L, P</strong> columns plus bottom <strong>Class Totals</strong> update automatically.
              </li>
              <li>
                <strong>6.</strong> Student names preserve standardized Kurdish/Arabic letter forms (ي ك ى → ی ک ی) with editable auto-transliterated English names.
              </li>
            </ul>
          </div>
        )}

        {exportNotice && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
              exportNotice.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {exportNotice.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{exportNotice.text}</span>
          </div>
        )}

        {/* Attendance Sub-Tabs Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E1E9FF]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSubTab('sheet')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                subTab === 'sheet'
                  ? 'bg-[#0087A5] text-white shadow-xs'
                  : 'bg-[#F5F6FF] text-[#454A87] hover:bg-[#E1E9FF]'
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>
                {mode === 'mentor' && lockedClass
                  ? `Class Sheet (${lockedClass.classCode})`
                  : `Class Tabs (${activeClass.classCode})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('class_summary')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                subTab === 'class_summary'
                  ? 'bg-[#0087A5] text-white shadow-xs'
                  : 'bg-[#F5F6FF] text-[#454A87] hover:bg-[#E1E9FF]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Class Summary ({classSummaries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('student_report')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                subTab === 'student_report'
                  ? 'bg-[#0087A5] text-white shadow-xs'
                  : 'bg-[#F5F6FF] text-[#454A87] hover:bg-[#E1E9FF]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Report ({scopedAllStudents.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('top_absentees')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                subTab === 'top_absentees'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Top Absentees (Top 15)</span>
            </button>
          </div>

          {/* Quick Color Key */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
              P = Present
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
              A = Absent
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
              L = Leave
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 border border-slate-300">
              Fri/Sat = Weekend
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-100">
              Sep 1–19 = Pre-Start
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUB-TAB 1: INTERACTIVE CLASS SHEET (1-A .. 9-A)              */}
      {/* ============================================================ */}
      {subTab === 'sheet' && (
        <div className="bg-white border border-[#E1E9FF] rounded-3xl p-4 sm:p-5 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
          {/* Class Tabs (1-A .. 9-A) + Month Selector */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            {mode === 'admin' ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {allClassOptions.map((opt) => {
                  const key = `${opt.grade}::${opt.section}`;
                  const active = key === `${activeClass.grade}::${activeClass.section}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedClassKey(key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                        active
                          ? 'bg-[#1A1D4E] text-white border-[#1A1D4E] shadow-xs'
                          : 'bg-[#F5F6FF] text-[#454A87] border-[#E1E9FF] hover:bg-[#E1E9FF]'
                      }`}
                    >
                      {opt.classCode}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EEF0FF] text-[#1A1D4E] text-xs font-black">
                <span>Class Tab: {activeClass.classCode}</span>
                <span>•</span>
                <span>{activeClassStudents.length} Students</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {(activeMonth.key === '2026-10' || activeMonth.key === '2026-11') && (
                <span className="px-2.5 py-1 rounded-xl bg-[#E1F3F7] text-[#0087A5] text-[10px] font-extrabold border border-[#BBE5EE]">
                  Oct &amp; Nov PDF Counts Loaded
                </span>
              )}
              <span className="text-[11px] font-bold text-[#6B70A6]">Month:</span>
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
              >
                {ATTENDANCE_MONTHS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Spreadsheet Table */}
          <div className="overflow-x-auto border border-[#E1E9FF] rounded-2xl">
            <table className="w-max min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#1A1D4E] text-white">
                  <th className="sticky left-0 z-20 bg-[#1A1D4E] px-2.5 py-2 border-r border-white/15 text-center font-bold w-9">
                    #
                  </th>
                  <th className="sticky left-9 z-20 bg-[#1A1D4E] px-3 py-2 border-r border-white/15 text-left font-bold min-w-[200px]">
                    Student Name (KU/AR)
                  </th>
                  <th className="px-2.5 py-2 border-r border-white/15 text-left font-bold min-w-[165px]">
                    English Name (Editable)
                  </th>

                  {monthDays.map((d) => {
                    const preStart = isPreStartSeptemberDay(activeMonth.key, d);
                    const wknd = isWeekendFridayOrSaturday(activeMonth.key, d);
                    const iso = makeAttendanceDateIso(activeMonth.key, d);
                    const isHoliday = Boolean(attendanceHolidays[iso]);
                    const wkLabel = getWeekdayShort(activeMonth.key, d);

                    let thBg = 'bg-[#1A1D4E]';
                    if (preStart) thBg = 'bg-slate-700 text-slate-300';
                    else if (isHoliday) thBg = 'bg-sky-800 text-sky-100';
                    else if (wknd) thBg = 'bg-slate-500 text-slate-100';

                    return (
                      <th
                        key={d}
                        className={`${thBg} px-1 py-1.5 border-r border-white/15 text-center min-w-[36px]`}
                      >
                        <div className="text-[10px] font-black leading-tight">{d}</div>
                        <div className="text-[9px] opacity-80 leading-tight">{wkLabel}</div>
                        {!preStart && (
                          <div className="mt-1 flex items-center justify-center gap-0.5">
                            <button
                              type="button"
                              title="Mark all empty students Present (P) for this day"
                              onClick={() =>
                                onBulkFillDayPresent(activeClassStudents, activeMonth.key, d)
                              }
                              className="px-1 py-0.2 rounded bg-emerald-500/30 hover:bg-emerald-500 text-[8px] font-black text-white cursor-pointer"
                            >
                              <Sparkles className="w-2.5 h-2.5 inline" />
                            </button>
                            <button
                              type="button"
                              title={
                                isHoliday
                                  ? 'Unmark Holiday shade'
                                  : 'Shade column as School Holiday'
                              }
                              onClick={() => onToggleHoliday(iso)}
                              className={`px-1 py-0.2 rounded text-[8px] cursor-pointer ${
                                isHoliday
                                  ? 'bg-sky-400 text-[#1A1D4E]'
                                  : 'bg-white/15 hover:bg-white/30 text-white'
                              }`}
                            >
                              <Umbrella className="w-2.5 h-2.5 inline" />
                            </button>
                          </div>
                        )}
                      </th>
                    );
                  })}

                  {/* Automatic Monthly Count Columns */}
                  <th className="px-2 py-2 bg-rose-700 text-white text-center font-black border-r border-white/15 min-w-[42px]">
                    M-A
                  </th>
                  <th className="px-2 py-2 bg-amber-600 text-white text-center font-black border-r border-white/15 min-w-[42px]">
                    M-L
                  </th>
                  <th className="px-2 py-2 bg-emerald-700 text-white text-center font-black border-r border-white/15 min-w-[42px]">
                    M-P
                  </th>

                  {/* Automatic Whole-Year Total Columns */}
                  <th className="px-2 py-2 bg-rose-900 text-white text-center font-black border-r border-white/15 min-w-[46px]">
                    Yr-A
                  </th>
                  <th className="px-2 py-2 bg-amber-800 text-white text-center font-black border-r border-white/15 min-w-[46px]">
                    Yr-L
                  </th>
                  <th className="px-2 py-2 bg-emerald-900 text-white text-center font-black min-w-[46px]">
                    Yr-P
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E1E9FF]">
                {activeClassGridData.rows.map((row, rIdx) => (
                  <tr key={row.student.id} className="hover:bg-[#F8FAFF] transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-2.5 py-1.5 border-r border-[#E1E9FF] text-center font-mono text-[11px] font-bold text-[#6B70A6]">
                      {row.index}
                    </td>
                    <td
                      dir="auto"
                      className="sticky left-9 z-10 bg-white px-3 py-1.5 border-r border-[#E1E9FF] font-bold text-[#1A1D4E] whitespace-nowrap"
                    >
                      <div>{row.stdName}</div>
                      <div className="text-[10px] font-mono text-[#8C90C2]">
                        {row.student.rollNumber}
                      </div>
                    </td>
                    <td className="px-2 py-1 border-r border-[#E1E9FF]">
                      <input
                        type="text"
                        value={row.engName}
                        onChange={(e) => onUpdateEnglishName(row.student.id, e.target.value)}
                        className="w-full bg-transparent hover:bg-[#F5F6FF] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0087A5] rounded px-1.5 py-1 text-[11px] font-semibold text-[#334155]"
                        aria-label={`English name for ${row.stdName}`}
                      />
                    </td>

                    {monthDays.map((d) => {
                      const preStart = isPreStartSeptemberDay(activeMonth.key, d);
                      const wknd = isWeekendFridayOrSaturday(activeMonth.key, d);
                      const iso = makeAttendanceDateIso(activeMonth.key, d);
                      const isHoliday = Boolean(attendanceHolidays[iso]);
                      const val = row.days[String(d)] || '';

                      let cellClass = 'bg-white text-[#1A1D4E]';
                      if (preStart) {
                        cellClass = 'bg-slate-600 text-slate-300 cursor-not-allowed';
                      } else if (isHoliday) {
                        cellClass = 'bg-sky-100 text-sky-700';
                      } else if (val === 'A') {
                        cellClass = 'bg-rose-200 text-rose-900 font-black';
                      } else if (val === 'L') {
                        cellClass = 'bg-amber-200 text-amber-900 font-black';
                      } else if (val === 'P') {
                        cellClass = 'bg-emerald-200 text-emerald-900 font-black';
                      } else if (wknd) {
                        cellClass = 'bg-slate-200/80 text-slate-600';
                      }

                      return (
                        <td
                          key={d}
                          className={`border-r border-[#E1E9FF] p-0 text-center ${cellClass}`}
                        >
                          {preStart ? (
                            <div className="w-9 h-8 flex items-center justify-center text-[10px] opacity-60">
                              —
                            </div>
                          ) : (
                            <input
                              type="text"
                              maxLength={1}
                              data-att-cell={`${rIdx}-${d}`}
                              value={val}
                              onChange={(e) => {
                                const ch = e.target.value.trim().toUpperCase();
                                if (ch === 'A' || ch === 'L' || ch === 'P') {
                                  onUpdateDayStatus(
                                    row.student.id,
                                    activeMonth.key,
                                    d,
                                    ch as AttendanceCode
                                  );
                                } else if (ch === '') {
                                  onUpdateDayStatus(row.student.id, activeMonth.key, d, '');
                                }
                              }}
                              onKeyDown={(e) => handleCellKeyDown(e, rIdx, d, row.student.id)}
                              onDoubleClick={() => cycleCellValue(row.student.id, d, val || undefined)}
                              title="Type A, L, or P (double-click to cycle)"
                              className="w-9 h-8 text-center text-xs font-black uppercase bg-transparent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0087A5] cursor-pointer"
                            />
                          )}
                        </td>
                      );
                    })}

                    {/* Automatic Monthly A / L / P */}
                    <td
                      title={
                        row.mBaseline.A > 0
                          ? `Includes ${row.mBaseline.A} recorded in ${activeMonth.shortLabel} PDF report`
                          : undefined
                      }
                      className="px-2 py-1.5 border-r border-[#E1E9FF] text-center font-mono font-black bg-rose-50 text-rose-800"
                    >
                      {row.mCounts.A}
                    </td>
                    <td
                      title={
                        row.mBaseline.L > 0
                          ? `Includes ${row.mBaseline.L} recorded in ${activeMonth.shortLabel} PDF report`
                          : undefined
                      }
                      className="px-2 py-1.5 border-r border-[#E1E9FF] text-center font-mono font-black bg-amber-50 text-amber-800"
                    >
                      {row.mCounts.L}
                    </td>
                    <td className="px-2 py-1.5 border-r border-[#E1E9FF] text-center font-mono font-black bg-emerald-50 text-emerald-800">
                      {row.mCounts.P}
                    </td>

                    {/* Automatic Whole-Year A / L / P */}
                    <td className="px-2 py-1.5 border-r border-[#E1E9FF] text-center font-mono font-black bg-rose-100/70 text-rose-900">
                      {row.yCounts.totalA}
                    </td>
                    <td className="px-2 py-1.5 border-r border-[#E1E9FF] text-center font-mono font-black bg-amber-100/70 text-amber-900">
                      {row.yCounts.totalL}
                    </td>
                    <td className="px-2 py-1.5 text-center font-mono font-black bg-emerald-100/70 text-emerald-900">
                      {row.yCounts.totalP}
                    </td>
                  </tr>
                ))}

                {/* Class Totals Row under the last student */}
                <tr className="bg-[#EEF3FF] font-black text-[#1A1D4E] border-t-2 border-[#0087A5]">
                  <td className="sticky left-0 z-10 bg-[#EEF3FF] px-2.5 py-2.5 border-r border-[#CBD5E1] text-center">
                    Σ
                  </td>
                  <td className="sticky left-9 z-10 bg-[#EEF3FF] px-3 py-2.5 border-r border-[#CBD5E1]">
                    CLASS TOTALS ({activeClass.classCode})
                  </td>
                  <td className="px-2.5 py-2.5 border-r border-[#CBD5E1] text-[11px] text-[#454A87]">
                    {activeClassStudents.length} Students
                  </td>
                  {monthDays.map((d) => {
                    const preStart = isPreStartSeptemberDay(activeMonth.key, d);
                    const c = activeClassGridData.colTotals[d];
                    const hasAny = c && c.A + c.L + c.P > 0;
                    return (
                      <td
                        key={d}
                        className={`px-0.5 py-1.5 border-r border-[#CBD5E1] text-center text-[9px] font-mono leading-tight ${
                          preStart ? 'bg-slate-600 text-slate-300' : ''
                        }`}
                      >
                        {preStart ? (
                          '—'
                        ) : hasAny ? (
                          <div>
                            <div className="text-emerald-700">{c.P}</div>
                            {c.A > 0 && <div className="text-rose-700">-{c.A}</div>}
                          </div>
                        ) : (
                          '·'
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2.5 border-r border-[#CBD5E1] text-center font-mono bg-rose-100 text-rose-900">
                    {activeClassGridData.classMonthA}
                  </td>
                  <td className="px-2 py-2.5 border-r border-[#CBD5E1] text-center font-mono bg-amber-100 text-amber-900">
                    {activeClassGridData.classMonthL}
                  </td>
                  <td className="px-2 py-2.5 border-r border-[#CBD5E1] text-center font-mono bg-emerald-100 text-emerald-900">
                    {activeClassGridData.classMonthP}
                  </td>
                  <td className="px-2 py-2.5 border-r border-[#CBD5E1] text-center font-mono bg-rose-200 text-rose-950">
                    {activeClassGridData.classYearA}
                  </td>
                  <td className="px-2 py-2.5 border-r border-[#CBD5E1] text-center font-mono bg-amber-200 text-amber-950">
                    {activeClassGridData.classYearL}
                  </td>
                  <td className="px-2 py-2.5 text-center font-mono bg-emerald-200 text-emerald-950">
                    {activeClassGridData.classYearP}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 2: CLASS SUMMARY (MONTH-BY-MONTH A & L FOR ALL)      */}
      {/* ============================================================ */}
      {subTab === 'class_summary' && (
        <div className="bg-white border border-[#E1E9FF] rounded-3xl p-4 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
          <div>
            <h4 className="text-base font-black text-[#1A1D4E]">
              Class Summary — Absences (A) & Leave Permissions (L) by Month
            </h4>
            <p className="text-xs text-[#6B70A6]">
              Every class section from September 2026 to July 2027, plus whole-year A, L, P totals and attendance rate.
            </p>
          </div>

          <div className="overflow-x-auto border border-[#E1E9FF] rounded-2xl">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#1A1D4E] text-white">
                  <th className="px-3 py-2.5 text-left border-r border-white/15">Class</th>
                  <th className="px-3 py-2.5 text-left border-r border-white/15">Mentor</th>
                  <th className="px-2.5 py-2.5 text-center border-r border-white/15">Students</th>
                  {ATTENDANCE_MONTHS.map((m) => (
                    <th
                      key={m.key}
                      className="px-2 py-2 text-center border-r border-white/15 whitespace-nowrap"
                    >
                      <div>{m.shortLabel}</div>
                      <div className="text-[9px] text-white/75 font-mono">A / L</div>
                    </th>
                  ))}
                  <th className="px-2.5 py-2 bg-rose-700 text-center border-r border-white/15">
                    Year A
                  </th>
                  <th className="px-2.5 py-2 bg-amber-600 text-center border-r border-white/15">
                    Year L
                  </th>
                  <th className="px-2.5 py-2 bg-emerald-700 text-center border-r border-white/15">
                    Year P
                  </th>
                  <th className="px-2.5 py-2 bg-[#0087A5] text-center">Rate %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E9FF]">
                {classSummaries.map((cls) => (
                  <tr key={cls.classCode} className="hover:bg-[#F8FAFF]">
                    <td className="px-3 py-2 font-black text-[#1A1D4E] border-r border-[#E1E9FF]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClassKey(`${cls.grade}::${cls.section}`);
                          setSubTab('sheet');
                        }}
                        className="text-[#0087A5] hover:underline cursor-pointer"
                      >
                        {cls.classCode}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-[#454A87] border-r border-[#E1E9FF] whitespace-nowrap">
                      {cls.mentorName}
                    </td>
                    <td className="px-2.5 py-2 text-center font-mono font-bold border-r border-[#E1E9FF]">
                      {cls.studentCount}
                    </td>
                    {ATTENDANCE_MONTHS.map((m) => {
                      const c = cls.byMonth[m.key] || { A: 0, L: 0, P: 0 };
                      return (
                        <td
                          key={m.key}
                          className="px-2 py-2 text-center font-mono text-[11px] border-r border-[#E1E9FF]"
                        >
                          <span className={c.A > 0 ? 'text-rose-700 font-black' : 'text-[#8C90C2]'}>
                            {c.A}
                          </span>
                          <span className="text-[#CBD5E1] mx-0.5">/</span>
                          <span className={c.L > 0 ? 'text-amber-700 font-black' : 'text-[#8C90C2]'}>
                            {c.L}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-2.5 py-2 text-center font-mono font-black bg-rose-50 text-rose-800 border-r border-[#E1E9FF]">
                      {cls.totalA}
                    </td>
                    <td className="px-2.5 py-2 text-center font-mono font-black bg-amber-50 text-amber-800 border-r border-[#E1E9FF]">
                      {cls.totalL}
                    </td>
                    <td className="px-2.5 py-2 text-center font-mono font-black bg-emerald-50 text-emerald-800 border-r border-[#E1E9FF]">
                      {cls.totalP}
                    </td>
                    <td className="px-2.5 py-2 text-center font-mono font-black text-[#1A1D4E]">
                      {cls.attendanceRatePct !== null ? `${cls.attendanceRatePct}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 3: STUDENT REPORT WITH FILTERS (e.g. Total A > 0)    */}
      {/* ============================================================ */}
      {subTab === 'student_report' && (
        <div className="bg-white border border-[#E1E9FF] rounded-3xl p-4 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-black text-[#1A1D4E]">
                Student Report — Monthly & Whole-Year Attendance
              </h4>
              <p className="text-xs text-[#6B70A6]">
                Filter by class or absence count (e.g. Total A &gt; 0) across all 11 months.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {mode === 'admin' && (
                <select
                  value={srClassFilter}
                  onChange={(e) => setSrClassFilter(e.target.value)}
                  className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D4E]"
                >
                  <option value="ALL">All Classes ({allClassOptions.length})</option>
                  {allClassOptions.map((c) => (
                    <option key={`${c.grade}::${c.section}`} value={`${c.grade}::${c.section}`}>
                      {c.classCode}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-1.5 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-[#0087A5]" />
                <select
                  value={srFilterMode}
                  onChange={(e) =>
                    setSrFilterMode(e.target.value as 'ALL' | 'A_GT_0' | 'L_GT_0' | 'A_GE_3')
                  }
                  className="bg-transparent text-xs font-bold text-[#1A1D4E] focus:outline-none"
                >
                  <option value="ALL">All Students</option>
                  <option value="A_GT_0">Total A &gt; 0 (Has Absences)</option>
                  <option value="A_GE_3">Total A ≥ 3 (Frequent Absence)</option>
                  <option value="L_GT_0">Total L &gt; 0 (Has Leave)</option>
                </select>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8C90C2] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={srSearch}
                  onChange={(e) => setSrSearch(e.target.value)}
                  placeholder="Search student or roll..."
                  className="pl-8 pr-3 py-2 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl text-xs font-semibold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#E1E9FF] rounded-2xl">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#1A1D4E] text-white">
                  <th className="px-2.5 py-2.5 text-center border-r border-white/15">#</th>
                  <th className="px-2.5 py-2.5 text-center border-r border-white/15">Class</th>
                  <th className="px-3 py-2.5 text-left border-r border-white/15">Student (KU/AR)</th>
                  <th className="px-3 py-2.5 text-left border-r border-white/15">English Name</th>
                  {ATTENDANCE_MONTHS.map((m) => (
                    <th
                      key={m.key}
                      className="px-1.5 py-2 text-center border-r border-white/15 whitespace-nowrap"
                    >
                      <div>{m.shortLabel}</div>
                      <div className="text-[9px] text-white/75 font-mono">A/L</div>
                    </th>
                  ))}
                  <th className="px-2.5 py-2 bg-rose-700 text-center border-r border-white/15">
                    Tot A
                  </th>
                  <th className="px-2.5 py-2 bg-amber-600 text-center border-r border-white/15">
                    Tot L
                  </th>
                  <th className="px-2.5 py-2 bg-emerald-700 text-center border-r border-white/15">
                    Tot P
                  </th>
                  <th className="px-2.5 py-2 bg-[#0087A5] text-center">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E9FF]">
                {studentReportRows.length === 0 ? (
                  <tr>
                    <td colSpan={18} className="p-8 text-center text-xs text-[#6B70A6]">
                      No students match the selected attendance filter.
                    </td>
                  </tr>
                ) : (
                  studentReportRows.map((row, idx) => (
                    <tr key={row.student.id} className="hover:bg-[#F8FAFF]">
                      <td className="px-2.5 py-2 text-center font-mono text-[#6B70A6] border-r border-[#E1E9FF]">
                        {idx + 1}
                      </td>
                      <td className="px-2.5 py-2 text-center font-black text-[#0087A5] border-r border-[#E1E9FF]">
                        {row.classCode}
                      </td>
                      <td
                        dir="auto"
                        className="px-3 py-2 font-bold text-[#1A1D4E] border-r border-[#E1E9FF] whitespace-nowrap"
                      >
                        {row.stdName}
                      </td>
                      <td className="px-3 py-2 text-[#454A87] font-semibold border-r border-[#E1E9FF] whitespace-nowrap">
                        {row.engName}
                      </td>
                      {ATTENDANCE_MONTHS.map((m) => {
                        const c = row.summary.byMonth[m.key] || { A: 0, L: 0, P: 0 };
                        return (
                          <td
                            key={m.key}
                            className="px-1.5 py-2 text-center font-mono text-[11px] border-r border-[#E1E9FF]"
                          >
                            <span className={c.A > 0 ? 'text-rose-700 font-black' : 'text-[#8C90C2]'}>
                              {c.A}
                            </span>
                            <span className="text-[#CBD5E1]">/</span>
                            <span className={c.L > 0 ? 'text-amber-700 font-black' : 'text-[#8C90C2]'}>
                              {c.L}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-2.5 py-2 text-center font-mono font-black bg-rose-50 text-rose-800 border-r border-[#E1E9FF]">
                        {row.summary.totalA}
                      </td>
                      <td className="px-2.5 py-2 text-center font-mono font-black bg-amber-50 text-amber-800 border-r border-[#E1E9FF]">
                        {row.summary.totalL}
                      </td>
                      <td className="px-2.5 py-2 text-center font-mono font-black bg-emerald-50 text-emerald-800 border-r border-[#E1E9FF]">
                        {row.summary.totalP}
                      </td>
                      <td className="px-2.5 py-2 text-center font-mono font-black text-[#1A1D4E]">
                        {row.summary.attendanceRatePct !== null
                          ? `${row.summary.attendanceRatePct}%`
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 4: TOP 15 ABSENTEES (LIVE AUTO-UPDATING)             */}
      {/* ============================================================ */}
      {subTab === 'top_absentees' && (
        <div className="bg-white border border-[#E1E9FF] rounded-3xl p-4 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-black text-[#1A1D4E] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-rose-600" />
                <span>Top Absentees — Top 15 Students with Most Absences</span>
              </h4>
              <p className="text-xs text-[#6B70A6]">
                Updates automatically whenever any daily absence (A) cell is recorded or edited.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#E1E9FF] rounded-2xl">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-rose-700 text-white">
                  <th className="px-3 py-2.5 text-center border-r border-white/15">Rank</th>
                  <th className="px-3 py-2.5 text-center border-r border-white/15">Class</th>
                  <th className="px-3 py-2.5 text-center border-r border-white/15">Mentor</th>
                  <th className="px-3 py-2.5 text-left border-r border-white/15">Roll No</th>
                  <th className="px-3 py-2.5 text-left border-r border-white/15">Student (KU/AR)</th>
                  <th className="px-3 py-2.5 text-left border-r border-white/15">English Name</th>
                  <th className="px-3 py-2.5 text-center border-r border-white/15 bg-rose-900">
                    Total A
                  </th>
                  <th className="px-3 py-2.5 text-center border-r border-white/15 bg-amber-700">
                    Total L
                  </th>
                  <th className="px-3 py-2.5 text-center border-r border-white/15 bg-emerald-700">
                    Total P
                  </th>
                  <th className="px-3 py-2.5 text-center">Rate %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E9FF]">
                {topAbsentees.map((item) => (
                  <tr key={item.student.id} className="hover:bg-rose-50/40">
                    <td className="px-3 py-2.5 text-center font-mono font-black text-rose-700 border-r border-[#E1E9FF]">
                      #{item.rank}
                    </td>
                    <td className="px-3 py-2.5 text-center font-black text-[#1A1D4E] border-r border-[#E1E9FF]">
                      {item.classCode}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-[11px] text-[#0087A5] font-bold border-r border-[#E1E9FF]">
                      {item.mentorShort}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[#6B70A6] border-r border-[#E1E9FF]">
                      {item.student.rollNumber}
                    </td>
                    <td
                      dir="auto"
                      className="px-3 py-2.5 font-bold text-[#1A1D4E] border-r border-[#E1E9FF] whitespace-nowrap"
                    >
                      {item.standardizedName}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-[#454A87] border-r border-[#E1E9FF] whitespace-nowrap">
                      {item.englishName}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-black bg-rose-50 text-rose-800 border-r border-[#E1E9FF]">
                      {item.summary.totalA}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-black bg-amber-50 text-amber-800 border-r border-[#E1E9FF]">
                      {item.summary.totalL}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-black bg-emerald-50 text-emerald-800 border-r border-[#E1E9FF]">
                      {item.summary.totalP}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-black text-[#1A1D4E]">
                      {item.summary.attendanceRatePct !== null
                        ? `${item.summary.attendanceRatePct}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
