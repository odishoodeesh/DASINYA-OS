/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Download,
  LogOut,
  Search,
  BarChart3,
  Users,
  GraduationCap,
  CheckCircle2,
  BookOpen,
  FileSpreadsheet,
  Filter,
  Bus,
  Radio,
  MapPin,
  KeyRound,
  Copy,
  Check,
  Layers,
  ClipboardList,
  Heart,
  Printer,
  Loader2,
  AlertCircle,
  FileText,
  CalendarCheck2,
} from 'lucide-react';
import { StudentRecord } from '../data/importedStudents';
import {
  ALL_BUS_STOPS,
  BUS_DRIVER_ROUTES,
  BusDriverRoute,
  DEFAULT_SUPABASE_BUS_ID,
} from '../data/busRoutes';
import { ExamGradeKey, ExamScheduleRow } from '../data/examsSchedule';
import { LiveBusState } from '../hooks/useBusTracking';
import { LiveBusMap } from './LiveBusMap';
import { ExamsScheduleView } from './ExamsScheduleView';
import { BehaviourReportCard } from './BehaviourReportCard';
import { AttendanceReportView } from './AttendanceReportView';
import {
  AttendanceCode,
  AttendanceMonthRecord,
} from '../data/attendanceReport';
import { exportBehaviourReportPdf, printBehaviourReport } from '../lib/behaviourPdf';
import {
  AdminExportDatasetKey,
  AdminExportSourceData,
  ExportPdfProgress,
  exportAllToExcelWorkbook,
  exportAllToPdf,
  exportDatasetToExcel,
  exportDatasetToPdf,
} from '../lib/adminExport';
import {
  BEHAVIOUR_MONTHS,
  MonthlyBehaviourReport,
  createEmptyBehaviourReport,
  getDefaultBehaviourMonthKey,
  makeBehaviourReportKey,
} from '../data/behaviourReport';
import {
  TEACHER_ACCOUNTS,
  CLASS_MENTORS,
  getMentorAssignmentForTeacher,
  getMentorForClass,
  DailySubjectRecord,
  getEffectiveDailyRecord,
  isGrade13,
  calcGrade13EvalTotal,
  calcGrade49ExamsTotal,
  calcGrade49GrandTotal100,
} from '../data/teacherPortal';
import {
  Language,
  formatGradeLabel,
  formatClassLabel,
  getTranslatedSubject,
} from '../lib/translations';

interface SubjectDescriptor {
  name: string;
  code: string;
  category: string;
}

interface AdminSummaryPanelProps {
  students: StudentRecord[];
  dailyRecords: Record<string, DailySubjectRecord>;
  schoolStructure: Record<string, string[]>;
  gradeCurriculum: Record<string, SubjectDescriptor[]>;
  officialSubjects: SubjectDescriptor[];
  liveBuses: Record<string, LiveBusState>;
  wsConnected: boolean;
  language: Language;
  isRtl: boolean;
  onSelectModalStudent: (student: StudentRecord) => void;
  onUpdateStudentClass: (studentId: string, newGrade: string, newSection: string) => void;
  examRows: ExamScheduleRow[];
  onUpdateExamCell: (rowId: string, grade: ExamGradeKey, value: string) => void;
  onResetExamSchedule: () => void;
  schoolLogoUrl: string;
  behaviourReports: Record<string, MonthlyBehaviourReport>;
  attendanceRecords: Record<string, AttendanceMonthRecord>;
  attendanceHolidays: Record<string, boolean>;
  attendanceEnglishNames: Record<string, string>;
  onUpdateAttendanceDay: (
    studentId: string,
    monthKey: string,
    day: number,
    code: AttendanceCode | ''
  ) => void;
  onBulkFillAttendanceDayPresent: (
    classStudents: StudentRecord[],
    monthKey: string,
    day: number
  ) => void;
  onToggleAttendanceHoliday: (dateIso: string) => void;
  onUpdateAttendanceEnglishName: (studentId: string, nameEn: string) => void;
  onExportStudentsCsv: () => void;
  onSignOut: () => void;
}

interface SubjectClassStats {
  subjectName: string;
  inCurriculum: boolean;
  gradedCount: number;
  entryPct: number;
  avg: number | null;
  passRate: number | null;
}

interface ClassSummaryRow {
  grade: string;
  section: string;
  label: string;
  studentCount: number;
  outOf: number;
  passMark: number;
  classAvg: number | null;
  overallPassRate: number | null;
  totalGradedEntries: number;
  subjects: Record<string, SubjectClassStats>;
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

export const AdminSummaryPanel: React.FC<AdminSummaryPanelProps> = ({
  students,
  dailyRecords,
  schoolStructure,
  gradeCurriculum,
  officialSubjects,
  liveBuses,
  wsConnected,
  language,
  isRtl,
  onSelectModalStudent,
  onUpdateStudentClass,
  examRows,
  onUpdateExamCell,
  onResetExamSchedule,
  schoolLogoUrl,
  behaviourReports,
  attendanceRecords,
  attendanceHolidays,
  attendanceEnglishNames,
  onUpdateAttendanceDay,
  onBulkFillAttendanceDayPresent,
  onToggleAttendanceHoliday,
  onUpdateAttendanceEnglishName,
  onExportStudentsCsv,
  onSignOut,
}) => {
  const [adminTab, setAdminTab] = useState<'summary' | 'students' | 'teachers' | 'buses' | 'class_control' | 'exams' | 'behaviour' | 'attendance' | 'export'>('summary');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teacherSearch, setTeacherSearch] = useState<string>('');
  const [copiedPwdKey, setCopiedPwdKey] = useState<string | null>(null);

  // Export Center state
  const [exportGradeScope, setExportGradeScope] = useState<string>('ALL');
  const [exportClassScope, setExportClassScope] = useState<string>('ALL');
  const [exportBusyKey, setExportBusyKey] = useState<string | null>(null);
  const [exportPdfProgress, setExportPdfProgress] = useState<ExportPdfProgress | null>(null);
  const [exportNotice, setExportNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // Monthly Behaviour Report viewer state (read-only in Admin; Mentor-only edit in Teacher Portal)
  const [behGrade, setBehGrade] = useState<string>('Grade 1');
  const [behSection, setBehSection] = useState<string>('Class A');
  const [behMonthKey, setBehMonthKey] = useState<string>(() => getDefaultBehaviourMonthKey());
  const [behStudentId, setBehStudentId] = useState<string>(() => students[0]?.id || '');
  const [behDownloadingPdf, setBehDownloadingPdf] = useState<boolean>(false);
  const [behSaveMessage, setBehSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);


  const handleCopyPassword = (pwd: string, key: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(pwd).catch(() => {});
    }
    setCopiedPwdKey(key);
    window.setTimeout(() => {
      setCopiedPwdKey((curr) => (curr === key ? null : curr));
    }, 1500);
  };

  const gradeKeys = useMemo(() => Object.keys(schoolStructure), [schoolStructure]);

  // Compute live class summaries across all 16 sections & all official subjects
  const classSummaries = useMemo<ClassSummaryRow[]>(() => {
    const rows: ClassSummaryRow[] = [];

    for (const grade of gradeKeys) {
      const sections = schoolStructure[grade] || [];
      const currSubjects = new Set(
        (gradeCurriculum[grade] || officialSubjects).map((s) => s.name)
      );
      const primary13 = isGrade13(grade);
      const outOf = primary13 ? 25 : 20;
      const passMark = primary13 ? 12.5 : 10.0;

      for (const section of sections) {
        const classStudents = students.filter(
          (s) => s.grade === grade && s.section === section
        );
        const studentCount = classStudents.length;

        const subjectMap: Record<string, SubjectClassStats> = {};
        let totalScoreSum = 0;
        let totalGradedCount = 0;
        let totalPassedCount = 0;

        for (const sub of officialSubjects) {
          const inCurriculum = currSubjects.has(sub.name);
          const scores: number[] = [];

          for (const st of classStudents) {
            const sc = getStudentSubjectTermScore(st, sub.name, dailyRecords);
            if (typeof sc === 'number') {
              scores.push(sc);
            }
          }

          const gradedCount = scores.length;
          const entryPct =
            studentCount > 0 ? Math.round((gradedCount / studentCount) * 100) : 0;
          const avg =
            gradedCount > 0
              ? Number((scores.reduce((a, b) => a + b, 0) / gradedCount).toFixed(1))
              : null;
          const passed = scores.filter((v) => v >= passMark).length;
          const passRate =
            gradedCount > 0 ? Math.round((passed / gradedCount) * 100) : null;

          if (gradedCount > 0) {
            totalScoreSum += scores.reduce((a, b) => a + b, 0);
            totalGradedCount += gradedCount;
            totalPassedCount += passed;
          }

          subjectMap[sub.name] = {
            subjectName: sub.name,
            inCurriculum,
            gradedCount,
            entryPct,
            avg,
            passRate,
          };
        }

        const shortGrade = grade.replace(/\D/g, '');
        const shortSection = section.replace('Class ', '');

        rows.push({
          grade,
          section,
          label: `Grade ${shortGrade}${shortSection}`,
          studentCount,
          outOf,
          passMark,
          classAvg:
            totalGradedCount > 0
              ? Number((totalScoreSum / totalGradedCount).toFixed(1))
              : null,
          overallPassRate:
            totalGradedCount > 0
              ? Math.round((totalPassedCount / totalGradedCount) * 100)
              : null,
          totalGradedEntries: totalGradedCount,
          subjects: subjectMap,
        });
      }
    }

    return rows;
  }, [gradeKeys, schoolStructure, gradeCurriculum, officialSubjects, students, dailyRecords]);

  // Global KPI stats
  const globalStats = useMemo(() => {
    const totalSections = classSummaries.length;
    const totalMarksEntered = classSummaries.reduce(
      (sum, r) => sum + r.totalGradedEntries,
      0
    );
    const totalPossibleCurriculumSlots = classSummaries.reduce((sum, r) => {
      const currCount = Object.values(r.subjects).filter((s) => s.inCurriculum).length;
      return sum + r.studentCount * currCount;
    }, 0);
    const entryCompletionPct =
      totalPossibleCurriculumSlots > 0
        ? Math.round((totalMarksEntered / totalPossibleCurriculumSlots) * 100)
        : 0;

    let passedAll = 0;
    for (const r of classSummaries) {
      for (const st of students.filter(
        (x) => x.grade === r.grade && x.section === r.section
      )) {
        for (const sub of officialSubjects) {
          const sc = getStudentSubjectTermScore(st, sub.name, dailyRecords);
          if (typeof sc === 'number' && sc >= r.passMark) {
            passedAll++;
          }
        }
      }
    }
    const overallPassRate =
      totalMarksEntered > 0 ? Math.round((passedAll / totalMarksEntered) * 100) : 0;

    return {
      totalSections,
      totalMarksEntered,
      entryCompletionPct,
      overallPassRate,
    };
  }, [classSummaries, students, officialSubjects, dailyRecords]);

  const filteredSummaries = useMemo(() => {
    if (gradeFilter === 'ALL') return classSummaries;
    return classSummaries.filter((r) => r.grade === gradeFilter);
  }, [classSummaries, gradeFilter]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (gradeFilter !== 'ALL' && s.grade !== gradeFilter) return false;
      if (sectionFilter !== 'ALL' && s.section !== sectionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          (s.guardianPassword || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, gradeFilter, sectionFilter, searchQuery]);

  const filteredTeachers = useMemo(() => {
    if (!teacherSearch.trim()) return TEACHER_ACCOUNTS;
    const q = teacherSearch.toLowerCase().trim();
    return TEACHER_ACCOUNTS.filter((t) => {
      const m = getMentorAssignmentForTeacher(t.id);
      return (
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subjectLabel.toLowerCase().includes(q) ||
        t.phone.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
        (m
          ? m.classCode.toLowerCase().includes(q) ||
            m.mentorShortName.toLowerCase().includes(q) ||
            'mentor'.includes(q)
          : false)
      );
    });
  }, [teacherSearch]);

  const handleExportSummaryCsv = () => {
    const subjHeaders = officialSubjects.map((s) => `${s.name} (%)`);
    const avgHeaders = officialSubjects.map((s) => `${s.name} Avg`);
    const passHeaders = officialSubjects.map((s) => `${s.name} Pass%`);
    const headers = [
      'Class',
      'Students',
      'Out Of',
      'Pass Mark',
      'Class Avg',
      'Overall Pass %',
      ...subjHeaders,
      ...avgHeaders,
      ...passHeaders,
    ];
    const csvRows = classSummaries.map((r) => [
      r.label,
      r.studentCount,
      r.outOf,
      r.passMark.toFixed(1),
      r.classAvg !== null ? r.classAvg.toFixed(1) : '',
      r.overallPassRate !== null ? `${r.overallPassRate}%` : '',
      ...officialSubjects.map((s) => {
        const st = r.subjects[s.name];
        return st?.inCurriculum ? `${st.entryPct}%` : '—';
      }),
      ...officialSubjects.map((s) => {
        const st = r.subjects[s.name];
        return st?.avg !== null && st?.avg !== undefined ? st.avg.toFixed(1) : '';
      }),
      ...officialSubjects.map((s) => {
        const st = r.subjects[s.name];
        return st?.passRate !== null && st?.passRate !== undefined
          ? `${st.passRate}%`
          : '';
      }),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `Dasinya_Admin_Full_Summary_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const entryBadgeClass = (pct: number, inCurriculum: boolean) => {
    if (!inCurriculum) return 'text-[#B8BEE0]';
    if (pct >= 100) return 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold';
    if (pct > 0) return 'bg-amber-100 text-amber-800 border border-amber-200 font-bold';
    return 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold';
  };

  const passBadgeClass = (rate: number | null) => {
    if (rate === null) return 'text-[#B8BEE0]';
    if (rate >= 85) return 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold';
    if (rate >= 65) return 'bg-amber-100 text-amber-800 border border-amber-200 font-bold';
    return 'bg-rose-100 text-rose-800 border border-rose-200 font-bold';
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Executive Admin Banner */}
      <div className="bg-gradient-to-r from-[#1A1D4E] via-[#006984] to-[#0087A5] text-white rounded-3xl p-5 sm:p-6 shadow-[0_10px_28px_rgba(0,135,165,0.28)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/25 shadow-xs shrink-0">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-bold text-white">
              {language === 'ku'
                ? 'پۆڕتاڵێ ئەدمین'
                : language === 'ar'
                ? 'بوابة الإدارة'
                : 'Executive Admin Portal'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              {language === 'ku'
                ? 'پوختەیا گشتی یا نمرە و قوتابخانێ'
                : language === 'ar'
                ? 'الملخص الشامل للدرجات والمدرسة'
                : 'School Marks & Academic Summary'}
            </h2>
            <p className="text-xs text-white/85">
              {language === 'ku'
                ? 'چاڤدێریا تۆمارکرنا نمرێن مامۆستایان، تێکڕایا پۆلان و ڕێژەیا سەرکەفتنێ'
                : language === 'ar'
                ? 'متابعة إدخال درجات المعلمين، متوسطات الصفوف، ونسب النجاح'
                : 'Live Entry Progress, Class Averages, Pass Rates & Master Directory • Dasinya Private School'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAdminTab('students')}
            className="px-3.5 py-2 bg-[#00A887] hover:bg-[#008E72] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>
              {language === 'ku'
                ? 'پاسوۆردێن قوتابیان'
                : language === 'ar'
                ? 'كلمات مرور الطلاب'
                : 'Student Passwords'}
            </span>
          </button>
          <button
            type="button"
            onClick={handleExportSummaryCsv}
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-white/25"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>
              {language === 'ku'
                ? 'پوختە (CSV)'
                : language === 'ar'
                ? 'تصدير الملخص'
                : 'Export Summary CSV'}
            </span>
          </button>
          <button
            type="button"
            onClick={onExportStudentsCsv}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {language === 'ku'
                ? 'لیستا قوتابیان (CSV)'
                : language === 'ar'
                ? 'تصدير الطلاب'
                : 'Export Roster CSV'}
            </span>
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="px-3.5 py-2 bg-red-500/85 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>
              {language === 'ku' ? 'دەرچوون' : language === 'ar' ? 'خروج' : 'Sign Out'}
            </span>
          </button>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">
            {language === 'ku' ? 'سەرجەمێ قوتابیان' : language === 'ar' ? 'إجمالي الطلاب' : 'Total Students'}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#1A1D4E]">{students.length}</span>
          <span className="text-[11px] text-[#00A887] block mt-1 font-semibold">
            {language === 'ku' ? 'تۆمارێن فەرمی' : language === 'ar' ? 'سجل رسمي نشط' : 'Official Active Roster'}
          </span>
        </div>

        <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">
            {language === 'ku' ? 'پۆل و بەش' : language === 'ar' ? 'الشعب الدراسية' : 'Active Sections'}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#0087A5]">{globalStats.totalSections}</span>
          <span className="text-[11px] text-[#6B70A6] block mt-1">
            {language === 'ku' ? 'پۆلێن ١ تا ٩' : language === 'ar' ? 'الصفوف ١ إلى ٩' : 'Grades 1 through 9'}
          </span>
        </div>

        <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">
            {language === 'ku' ? 'نمرێن تۆمارکری' : language === 'ar' ? 'الدرجات المدخلة' : 'Marks Recorded'}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#1A1D4E]">
            {globalStats.totalMarksEntered}
          </span>
          <span className="text-[11px] text-[#0087A5] block mt-1 font-semibold">
            {globalStats.entryCompletionPct}%{' '}
            {language === 'ku' ? 'تەمامبوونا گشتی' : language === 'ar' ? 'اكتمال الإدخال' : 'overall entry'}
          </span>
        </div>

        <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">
            {language === 'ku' ? 'ڕێژەیا سەرکەفتنێ' : language === 'ar' ? 'نسبة النجاح' : 'Overall Pass Rate'}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#00A887]">
            {globalStats.overallPassRate}%
          </span>
          <span className="text-[11px] text-[#6B70A6] block mt-1">
            {language === 'ku' ? 'نمرێن دەرچوونێ' : language === 'ar' ? 'من الدرجات المرصودة' : 'Of graded marks'}
          </span>
        </div>

        <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">
            {language === 'ku' ? 'مامۆستا' : language === 'ar' ? 'المعلمون' : 'Teachers'}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#1A1D4E]">
            {TEACHER_ACCOUNTS.length}
          </span>
          <span className="text-[11px] text-[#6B70A6] block mt-1">
            {language === 'ku' ? 'هەژمارێن فەرمی' : language === 'ar' ? 'حسابات المعلمين' : 'Assigned Staff'}
          </span>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E1E9FF] rounded-2xl p-2 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAdminTab('summary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'summary'
                ? 'bg-[#0087A5] text-white shadow-xs'
                : 'text-[#454A87] hover:bg-[#F5F6FF]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>
              {language === 'ku'
                ? 'پوختەیا گشتی'
                : language === 'ar'
                ? 'الملخص الشامل'
                : 'Full Summary'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'students'
                ? 'bg-[#0087A5] text-white shadow-xs'
                : 'text-[#454A87] hover:bg-[#F5F6FF]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              {language === 'ku'
                ? `قوتابی و پاسوۆرد (${students.length})`
                : language === 'ar'
                ? `الطلاب وكلمات المرور (${students.length})`
                : `Students & Passwords (${students.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('teachers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'teachers'
                ? 'bg-[#0087A5] text-white shadow-xs'
                : 'text-[#454A87] hover:bg-[#F5F6FF]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>
              {language === 'ku'
                ? `مامۆستا (${TEACHER_ACCOUNTS.length})`
                : language === 'ar'
                ? `المعلمون (${TEACHER_ACCOUNTS.length})`
                : `Teachers (${TEACHER_ACCOUNTS.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('buses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'buses'
                ? 'bg-[#0087A5] text-white shadow-xs'
                : 'text-[#454A87] hover:bg-[#F5F6FF]'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>
              {language === 'ku'
                ? `پاسێن قوتابخانێ (${BUS_DRIVER_ROUTES.length})`
                : language === 'ar'
                ? `حافلات المدرسة (${BUS_DRIVER_ROUTES.length})`
                : `Live Buses (${BUS_DRIVER_ROUTES.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('class_control')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'class_control'
                ? 'bg-[#0087A5] text-white shadow-xs'
                : 'text-[#454A87] hover:bg-[#F5F6FF]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#00A887]" />
            <span>
              {language === 'ku'
                ? 'کۆنترۆلا پۆلان'
                : language === 'ar'
                ? 'إدارة وترتيب الصفوف'
                : 'Class Control'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('exams')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'exams'
                ? 'bg-[#0087A5] text-white shadow-xs'
                : 'text-[#454A87] hover:bg-[#F5F6FF]'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>
              {language === 'ku'
                ? 'خشتەیێ ئەزموونان'
                : language === 'ar'
                ? 'جدول الامتحانات'
                : 'Exams Schedule'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('behaviour')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'behaviour'
                ? 'bg-[#0087A5] text-white shadow-xs'
                : 'text-[#454A87] hover:bg-[#F5F6FF]'
            }`}
          >
            <Heart className="w-4 h-4 text-[#FF7F2A]" />
            <span>
              {language === 'ku'
                ? 'راپۆرتا سلوکی (هەیڤانە)'
                : language === 'ar'
                ? 'تقرير السلوك الشهري'
                : 'Behaviour Reports'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'attendance'
                ? 'bg-[#0087A5] text-white shadow-xs'
                : 'text-[#454A87] hover:bg-[#F5F6FF]'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4 text-[#00A887]" />
            <span>
              {language === 'ku'
                ? 'ئامادەبوون ٢٠٢٦-٢٠٢٧'
                : language === 'ar'
                ? 'الحضور والغياب ٢٠٢٦-٢٠٢٧'
                : 'Attendance Report'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('export')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === 'export'
                ? 'bg-[#1A1D4E] text-white shadow-xs'
                : 'text-[#1A1D4E] bg-[#EEF0FF]/70 hover:bg-[#E1E9FF]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#00A887]" />
            <span>
              {language === 'ku'
                ? 'دەرئێخستن (Excel / PDF)'
                : language === 'ar'
                ? 'مركز التصدير (Excel / PDF)'
                : 'Export Center (Excel / PDF)'}
            </span>
          </button>
        </div>

        {/* Grade Filter for Summary & Students */}
        {(adminTab === 'summary' || adminTab === 'students') && (
          <div className="flex flex-wrap items-center gap-2 px-2">
            <Filter className="w-3.5 h-3.5 text-[#0087A5]" />
            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setSectionFilter('ALL');
              }}
              className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
            >
              <option value="ALL">
                {language === 'ku'
                  ? 'هەمی پۆل (١ - ٩)'
                  : language === 'ar'
                  ? 'جميع الصفوف (١ - ٩)'
                  : 'All Grades (1 - 9)'}
              </option>
              {gradeKeys.map((g) => (
                <option key={g} value={g}>
                  {formatGradeLabel(g, language)}
                </option>
              ))}
            </select>

            {adminTab === 'students' && gradeFilter !== 'ALL' && (
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
              >
                <option value="ALL">
                  {language === 'ku' ? 'هەمی بەش' : language === 'ar' ? 'جميع الشعب' : 'All Sections'}
                </option>
                {(schoolStructure[gradeFilter] || []).map((sec) => (
                  <option key={sec} value={sec}>
                    {formatClassLabel(sec, language)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* ADMIN TAB 1: FULL SUMMARY (3 LIVE TABLES)                */}
      {/* ======================================================== */}
      {adminTab === 'summary' && (
        <div className="space-y-6">
          {/* TABLE 1: ENTRY PROGRESS (%) */}
          <section className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E1E9FF]">
              <div>
                <h3 className="text-base font-black text-[#1A1D4E] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0087A5]" />
                  <span>
                    {language === 'ku'
                      ? 'پێشکەفتنا تۆمارکرنێ (% قوتابیێن نمرە بۆ هاتیە دانان)'
                      : language === 'ar'
                      ? 'نسبة إنجاز إدخال الدرجات (% من الطلاب المرصودة درجاتهم)'
                      : '1. Entry Progress (% of students with a grade entered)'}
                  </span>
                </h3>
                <p className="text-xs text-[#6B70A6] mt-0.5">
                  {language === 'ku'
                    ? 'سۆر = نەهاتیە تۆمارکرن، زەر = بەشەک تۆمارکریە، کەسک = هەمی قوتابی تۆمارکرینە'
                    : language === 'ar'
                    ? 'الأحمر = لم يتم الإدخال بعد، الأصفر = جزئي، الأخضر = تم إدخال جميع الطلاب'
                    : 'Red = 0% entered yet, Amber = partially graded, Green = 100% of students graded.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">0%</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">1–99%</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">100%</span>
              </div>
            </div>

            <div className="border border-[#E1E9FF] rounded-2xl overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[920px] text-[11px] border-collapse">
                <thead className="bg-[#1A1D4E] text-white">
                  <tr>
                    <th className={`py-2.5 px-3 font-bold sticky ${isRtl ? 'right-0' : 'left-0'} bg-[#1A1D4E] z-10 text-start whitespace-nowrap`}>
                      Class
                    </th>
                    <th className="py-2.5 px-2.5 font-bold text-center whitespace-nowrap">Students</th>
                    {officialSubjects.map((sub) => (
                      <th key={sub.name} className="py-2.5 px-2 font-bold text-center whitespace-nowrap">
                        {getTranslatedSubject(sub.name, language)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E9FF]">
                  {filteredSummaries.map((row) => (
                    <tr key={`${row.grade}-${row.section}`} className="hover:bg-[#F5F6FF]/70 transition-colors">
                      <td
                        className={`py-2 px-3 font-extrabold text-[#1A1D4E] sticky ${
                          isRtl ? 'right-0' : 'left-0'
                        } bg-white border-e border-[#E1E9FF] whitespace-nowrap`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setGradeFilter(row.grade);
                            setSectionFilter(row.section);
                            setAdminTab('students');
                          }}
                          className="hover:text-[#0087A5] underline decoration-[#0087A5]/30 cursor-pointer"
                        >
                          {row.label}
                        </button>
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-[#454A87]">
                        {row.studentCount}
                      </td>
                      {officialSubjects.map((sub) => {
                        const st = row.subjects[sub.name];
                        return (
                          <td key={sub.name} className="py-1.5 px-1.5 text-center">
                            {st.inCurriculum ? (
                              <span
                                className={`inline-block min-w-[42px] px-1.5 py-0.5 rounded-md font-mono text-[11px] ${entryBadgeClass(
                                  st.entryPct,
                                  st.inCurriculum
                                )}`}
                                title={`${st.gradedCount}/${row.studentCount} graded`}
                              >
                                {st.entryPct}%
                              </span>
                            ) : (
                              <span className="text-[#C8CEEA] font-mono">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* TABLE 2: CLASS AVERAGE PER SUBJECT */}
          <section className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
            <div className="pb-3 border-b border-[#E1E9FF]">
              <h3 className="text-base font-black text-[#1A1D4E] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0087A5]" />
                <span>
                  {language === 'ku'
                    ? 'تێکڕایا پۆلێ بۆ هەر بابەتەکێ'
                    : language === 'ar'
                    ? 'متوسط الصف لكل مادة دراسية'
                    : '2. Class Average per Subject'}
                </span>
              </h3>
              <p className="text-xs text-[#6B70A6] mt-0.5">
                {language === 'ku'
                  ? 'نمرێن گشتی بۆ پۆلێن ١-٣ ژ ٢٥ (دەرچوون ١٢.٥) و بۆ پۆلێن ٤-٩ ژ ٢٠ (دەرچوون ١٠.٠)'
                  : language === 'ar'
                  ? 'الدرجات للصفوف ١-٣ من ٢٥ (النجاح ١٢.٥) وللصفوف ٤-٩ من ٢٠ (النجاح ١٠.٠)'
                  : 'Calculated over recorded marks only. Out of 25 (Pass 12.5) for Grades 1–3; Out of 20 (Pass 10.0) for Grades 4–9.'}
              </p>
            </div>

            <div className="border border-[#E1E9FF] rounded-2xl overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[980px] text-[11px] border-collapse">
                <thead className="bg-[#0087A5] text-white">
                  <tr>
                    <th className={`py-2.5 px-3 font-bold sticky ${isRtl ? 'right-0' : 'left-0'} bg-[#0087A5] z-10 text-start whitespace-nowrap`}>
                      Class
                    </th>
                    <th className="py-2.5 px-2.5 font-bold text-center whitespace-nowrap bg-[#006F89]">
                      Class Avg
                    </th>
                    {officialSubjects.map((sub) => (
                      <th key={sub.name} className="py-2.5 px-2 font-bold text-center whitespace-nowrap">
                        {getTranslatedSubject(sub.name, language)}
                      </th>
                    ))}
                    <th className="py-2.5 px-2.5 font-bold text-center whitespace-nowrap bg-[#1A1D4E]">Out of</th>
                    <th className="py-2.5 px-2.5 font-bold text-center whitespace-nowrap bg-[#1A1D4E]">Pass Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E9FF]">
                  {filteredSummaries.map((row) => (
                    <tr key={`${row.grade}-${row.section}`} className="hover:bg-[#F5F6FF]/70 transition-colors">
                      <td
                        className={`py-2 px-3 font-extrabold text-[#1A1D4E] sticky ${
                          isRtl ? 'right-0' : 'left-0'
                        } bg-white border-e border-[#E1E9FF] whitespace-nowrap`}
                      >
                        {row.label}
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono font-black text-[#0087A5] bg-[#E1F3F7]/40">
                        {row.classAvg !== null ? row.classAvg.toFixed(1) : '—'}
                      </td>
                      {officialSubjects.map((sub) => {
                        const st = row.subjects[sub.name];
                        return (
                          <td key={sub.name} className="py-2 px-2 text-center font-mono">
                            {st.avg !== null ? (
                              <span
                                className={`font-bold ${
                                  st.avg >= row.passMark ? 'text-[#1A1D4E]' : 'text-rose-600'
                                }`}
                              >
                                {st.avg.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-[#D4D8EE]">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-[#454A87] bg-[#F5F6FF]">
                        {row.outOf}
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-[#454A87] bg-[#F5F6FF]">
                        {row.passMark.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* TABLE 3: PASS RATE PER SUBJECT (%) */}
          <section className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
            <div className="pb-3 border-b border-[#E1E9FF]">
              <h3 className="text-base font-black text-[#1A1D4E] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00A887]" />
                <span>
                  {language === 'ku'
                    ? 'ڕێژەیا دەرچوونێ بۆ هەر بابەتەکێ (% قوتابیێن دەرچووی)'
                    : language === 'ar'
                    ? 'نسبة النجاح لكل مادة (% من الطلاب الحاصلين على درجة النجاح فأكثر)'
                    : '3. Pass Rate per Subject (% of graded students at or above the pass mark)'}
                </span>
              </h3>
              <p className="text-xs text-[#6B70A6] mt-0.5">
                {language === 'ku'
                  ? 'ڕێژەیا سەرکەفتنێ = قوتابیێن دەرچووی ÷ قوتابیێن نمرە بۆ هاتیە دانان'
                  : language === 'ar'
                  ? 'نسبة النجاح = عدد الناجحين ÷ عدد الطلاب الذين تم رصد درجاتهم فقط'
                  : 'Pass rate = graded students scoring at or above the pass mark / students who have a grade.'}
              </p>
            </div>

            <div className="border border-[#E1E9FF] rounded-2xl overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[960px] text-[11px] border-collapse">
                <thead className="bg-[#007C64] text-white">
                  <tr>
                    <th className={`py-2.5 px-3 font-bold sticky ${isRtl ? 'right-0' : 'left-0'} bg-[#007C64] z-10 text-start whitespace-nowrap`}>
                      Class
                    </th>
                    <th className="py-2.5 px-2.5 font-bold text-center whitespace-nowrap bg-[#00624F]">
                      All Subjects
                    </th>
                    {officialSubjects.map((sub) => (
                      <th key={sub.name} className="py-2.5 px-2 font-bold text-center whitespace-nowrap">
                        {getTranslatedSubject(sub.name, language)}
                      </th>
                    ))}
                    <th className="py-2.5 px-2.5 font-bold text-center whitespace-nowrap bg-[#1A1D4E]">Pass Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E9FF]">
                  {filteredSummaries.map((row) => (
                    <tr key={`${row.grade}-${row.section}`} className="hover:bg-[#F5F6FF]/70 transition-colors">
                      <td
                        className={`py-2 px-3 font-extrabold text-[#1A1D4E] sticky ${
                          isRtl ? 'right-0' : 'left-0'
                        } bg-white border-e border-[#E1E9FF] whitespace-nowrap`}
                      >
                        {row.label}
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono bg-[#E6F7F4]/40">
                        {row.overallPassRate !== null ? (
                          <span
                            className={`inline-block min-w-[44px] px-1.5 py-0.5 rounded-md ${passBadgeClass(
                              row.overallPassRate
                            )}`}
                          >
                            {row.overallPassRate}%
                          </span>
                        ) : (
                          <span className="text-[#D4D8EE]">—</span>
                        )}
                      </td>
                      {officialSubjects.map((sub) => {
                        const st = row.subjects[sub.name];
                        return (
                          <td key={sub.name} className="py-1.5 px-1.5 text-center font-mono">
                            {st.passRate !== null ? (
                              <span
                                className={`inline-block min-w-[42px] px-1.5 py-0.5 rounded-md ${passBadgeClass(
                                  st.passRate
                                )}`}
                              >
                                {st.passRate}%
                              </span>
                            ) : (
                              <span className="text-[#D4D8EE]">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-[#454A87] bg-[#F5F6FF]">
                        {row.passMark.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADMIN TAB 2: MASTER STUDENT REGISTRY & AUDIT             */}
      {/* ======================================================== */}
      {adminTab === 'students' && (
        <div className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E1E9FF] gap-3">
            <div>
              <h3 className="text-base font-bold text-[#1A1D4E]">
                Master Student Registry ({filteredStudents.length} / {students.length} Records)
              </h3>
              <p className="text-xs text-[#6B70A6]">
                Inspect student credentials, recorded marks count, and open full Daily Record marksheet
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C90C2] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ID, roll or password..."
                className="pl-9 pr-3 py-1.5 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl text-xs w-64 text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
              />
            </div>
          </div>

          <div className="border border-[#E1E9FF] rounded-2xl overflow-x-auto touch-pan-x max-h-[580px]">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-[#F5F6FF] border-b border-[#E1E9FF] font-bold text-[#1A1D4E] sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Grade & Section</th>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Recorded Marks</th>
                  <th className="py-3 px-3">Student / Parent Password</th>
                  <th className="py-3 px-3 text-center">Marksheet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E9FF]">
                {filteredStudents.map((s, idx) => {
                  const curr = gradeCurriculum[s.grade] || officialSubjects;
                  const gradedCount = curr.filter(
                    (c) => getStudentSubjectTermScore(s, c.name, dailyRecords) !== null
                  ).length;
                  const primaryKey = `${s.id}-primary`;

                  return (
                    <tr key={s.id} className="hover:bg-[#F5F6FF]/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[#8C90C2]">{s.serial || idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-[#1A1D4E]">{s.name}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#454A87]">
                        {formatGradeLabel(s.grade, language)} • {formatClassLabel(s.section, language)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#6B70A6]">{s.id}</td>
                      <td className="py-2.5 px-3 font-mono text-[#6B70A6]">{s.rollNumber}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            gradedCount === curr.length
                              ? 'bg-emerald-100 text-emerald-800'
                              : gradedCount > 0
                              ? 'bg-[#E1F3F7] text-[#0087A5]'
                              : 'bg-[#F5F6FF] text-[#8C90C2]'
                          }`}
                        >
                          {gradedCount} / {curr.length}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {s.guardianPassword ? (
                            <button
                              type="button"
                              onClick={() => handleCopyPassword(s.guardianPassword!, primaryKey)}
                              title="Click to copy student password"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E1F3F7] hover:bg-[#C8E5EC] text-[#006F89] font-bold text-xs cursor-pointer transition-colors"
                            >
                              <span>{s.guardianPassword}</span>
                              {copiedPwdKey === primaryKey ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-70" />
                              )}
                            </button>
                          ) : (
                            <span className="text-[#8C90C2]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectModalStudent(s)}
                          className="px-3 py-1 bg-[#0087A5] text-white rounded-lg text-[11px] font-bold cursor-pointer hover:bg-[#00738D] transition-colors shadow-xs"
                        >
                          View Marksheet
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADMIN TAB 3: TEACHERS DIRECTORY (29 AUTHENTIC TEACHERS)  */}
      {/* ======================================================== */}
      {adminTab === 'teachers' && (
        <div className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E1E9FF] gap-3">
            <div>
              <h3 className="text-base font-bold text-[#1A1D4E]">
                Official Teachers &amp; Class Mentors Directory ({filteredTeachers.length} / {TEACHER_ACCOUNTS.length})
              </h3>
              <p className="text-xs text-[#6B70A6]">
                Official teacher credentials (Email + Phone Password), {CLASS_MENTORS.length} designated Class Mentors (Behaviour Entry), and subject progress
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C90C2] absolute left-3 top-2.5" />
              <input
                type="text"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                placeholder="Search teacher, mentor, class (1A)..."
                className="pl-9 pr-3 py-1.5 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl text-xs w-64 text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
              />
            </div>
          </div>

          <div className="border border-[#E1E9FF] rounded-2xl overflow-x-auto touch-pan-x max-h-[580px]">
            <table className="w-full min-w-[860px] text-left text-xs">
              <thead className="bg-[#F5F6FF] border-b border-[#E1E9FF] font-bold text-[#1A1D4E] sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Teacher Name</th>
                  <th className="py-3 px-3">Class Mentor</th>
                  <th className="py-3 px-3">Subject(s)</th>
                  <th className="py-3 px-3">Login Email</th>
                  <th className="py-3 px-3">Phone (Password)</th>
                  <th className="py-3 px-3">Assigned Classes &amp; Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E9FF]">
                {filteredTeachers.map((teacher) => {
                  const mentorAssign = getMentorAssignmentForTeacher(teacher.id);
                  return (
                  <tr key={teacher.id} className="hover:bg-[#F5F6FF]/50 transition-colors align-top">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#8C90C2]">{teacher.id}</td>
                    <td className="py-2.5 px-3 font-bold text-[#1A1D4E] whitespace-nowrap">{teacher.name}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {mentorAssign ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F3EEFF] border border-[#BB8FFF]/50 text-[#5B35A8] text-[10px] font-black">
                          <Heart className="w-3 h-3" />
                          <span>
                            {mentorAssign.classCode} ({mentorAssign.mentorShortName})
                          </span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#8C90C2]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#0087A5] whitespace-nowrap">
                      {teacher.subjectLabel}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#454A87]">{teacher.email}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1A1D4E] whitespace-nowrap">
                      {teacher.phone}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.assignedClasses.map((ac) => {
                          const rowSummary = classSummaries.find(
                            (r) => r.grade === ac.grade && r.section === ac.section
                          );
                          const pcts = ac.subjects.map(
                            (sub) => rowSummary?.subjects[sub]?.entryPct ?? 0
                          );
                          const avgPct =
                            pcts.length > 0
                              ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
                              : 0;
                          const shortLabel = `${ac.grade.replace(/\D/g, '')}${ac.section.replace(
                            'Class ',
                            ''
                          )}`;
                          return (
                            <span
                              key={`${ac.grade}-${ac.section}`}
                              className={`px-2 py-0.5 rounded-md font-mono text-[10px] ${entryBadgeClass(
                                avgPct,
                                true
                              )}`}
                              title={`${ac.grade} ${ac.section} (${ac.subjects.join(', ')}): ${avgPct}% graded`}
                            >
                              {shortLabel} ({avgPct}%)
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADMIN TAB 4: LIVE SCHOOL BUS FLEET & DRIVER ACCESS       */}
      {/* ======================================================== */}
      {adminTab === 'buses' && (() => {
        const selectedDriver: BusDriverRoute | null =
          selectedDriverId === 'ALL'
            ? null
            : BUS_DRIVER_ROUTES.find((d) => d.id === selectedDriverId) || null;

        const bus1Live = liveBuses[DEFAULT_SUPABASE_BUS_ID];
        const fleetMarkers = BUS_DRIVER_ROUTES.map((driver) => ({
          driver,
          state: liveBuses[driver.id],
        })).filter(
          (item): item is { driver: BusDriverRoute; state: LiveBusState } =>
            Boolean(item.state && typeof item.state.lat === 'number' && typeof item.state.lng === 'number')
        );

        if (
          bus1Live &&
          typeof bus1Live.lat === 'number' &&
          typeof bus1Live.lng === 'number'
        ) {
          fleetMarkers.push({
            driver: {
              id: DEFAULT_SUPABASE_BUS_ID,
              code: 'BUS-1',
              pin: '',
              name: BUS_DRIVER_ROUTES[0]?.name || 'Bus 1 Live GPS',
              nameEn: 'Bus 1 (Supabase Live GPS)',
              routeLabel: 'Live Supabase Realtime Tracker',
              routeLabelArKu: 'التتبع المباشر عبر Supabase',
              stops: BUS_DRIVER_ROUTES[0]?.stops || [],
            },
            state: bus1Live,
          });
        }

        const activeBusCount =
          BUS_DRIVER_ROUTES.filter((d) => liveBuses[d.id]?.active).length +
          (bus1Live?.active ? 1 : 0);

        const selectedBusState = selectedDriver
          ? liveBuses[selectedDriver.id]?.lat !== null &&
            typeof liveBuses[selectedDriver.id]?.lat === 'number'
            ? liveBuses[selectedDriver.id]
            : selectedDriver.id === 'drv-mohammed-abdulfatah'
            ? bus1Live || liveBuses[selectedDriver.id]
            : liveBuses[selectedDriver.id]
          : null;

        return (
          <div className="space-y-6">
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E1E9FF] gap-3">
                <div>
                  <h3 className="text-base font-black text-[#1A1D4E] flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${activeBusCount > 0 ? 'text-emerald-600 animate-pulse' : 'text-[#0087A5]'}`} />
                    <span>
                      {language === 'ku'
                        ? 'چاڤدێریا زیندوو یا پاسێن قوتابخانێ'
                        : language === 'ar'
                        ? 'مراقبة حافلات المدرسة المباشرة'
                        : 'Live School Bus Fleet Monitor'}
                    </span>
                  </h3>
                  <p className="text-xs text-[#6B70A6]">
                    {activeBusCount} / {BUS_DRIVER_ROUTES.length} active buses • {wsConnected ? 'Real-Time Feed Connected' : 'Connecting...'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0087A5]" />
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
                  >
                    <option value="ALL">All Buses &amp; Student Pins ({ALL_BUS_STOPS.length} stops)</option>
                    {BUS_DRIVER_ROUTES.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} — {d.name} ({d.stops.length} stops)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <LiveBusMap
                stops={selectedDriver ? selectedDriver.stops : ALL_BUS_STOPS}
                busState={selectedBusState}
                driverName={selectedDriver?.name}
                driverCode={selectedDriver?.code}
                fleetBuses={selectedDriver ? undefined : fleetMarkers}
                drawRouteLine={Boolean(selectedDriver)}
                focusKey={`admin-${selectedDriverId}`}
                heightClass="h-[420px] sm:h-[480px]"
              />
            </div>

            {/* Drivers Directory & Live Boarding Summary Table */}
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
              <div className="pb-3 border-b border-[#E1E9FF]">
                <h3 className="text-base font-bold text-[#1A1D4E]">
                  School Bus Drivers & Portal Credentials ({BUS_DRIVER_ROUTES.length} Routes)
                </h3>
                <p className="text-xs text-[#6B70A6]">
                  Drivers sign in via Driver Portal using their Bus Code (e.g. BUS-01) or Name + Driver PIN
                </p>
              </div>

              <div className="border border-[#E1E9FF] rounded-2xl overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-[#F5F6FF] border-b border-[#E1E9FF] font-bold text-[#1A1D4E]">
                    <tr>
                      <th className="py-3 px-3">Bus Code</th>
                      <th className="py-3 px-3">Driver Name</th>
                      <th className="py-3 px-3">PIN</th>
                      <th className="py-3 px-3 text-center">Stops</th>
                      <th className="py-3 px-3 text-center">Live Status</th>
                      <th className="py-3 px-3 text-center">Boarded</th>
                      <th className="py-3 px-3 text-center">Dropped</th>
                      <th className="py-3 px-3 text-center">Inspect Route</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E9FF]">
                    {BUS_DRIVER_ROUTES.map((drv) => {
                      const st = liveBuses[drv.id];
                      const statuses = st?.studentStatuses || {};
                      const boardedCount = Object.values(statuses).filter((v) => v === 'boarded').length;
                      const droppedCount = Object.values(statuses).filter((v) => v === 'dropped_off').length;

                      return (
                        <tr key={drv.id} className="hover:bg-[#F5F6FF]/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-extrabold text-[#0087A5]">{drv.code}</td>
                          <td className="py-2.5 px-3 font-bold text-[#1A1D4E]">
                            {drv.name} <span className="text-[#6B70A6] font-normal">({drv.nameEn})</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1A1D4E]">{drv.pin}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{drv.stops.length}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                st?.active
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-[#F5F6FF] text-[#6B70A6] border border-[#E1E9FF]'
                              }`}
                            >
                              {st?.active ? `LIVE (${st.direction === 'dropoff' ? 'Drop-off' : 'Pickup'})` : 'Standby'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">{boardedCount}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-[#0087A5]">{droppedCount}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedDriverId(drv.id)}
                              className="px-3 py-1 bg-[#0087A5] hover:bg-[#00738D] text-white rounded-lg text-[11px] font-bold cursor-pointer"
                            >
                              View Map
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
       })()}

      {/* ======================================================== */}
      {/* ADMIN TAB 5: CLASS CONTROL SECTION                       */}
      {/* ======================================================== */}
      {adminTab === 'class_control' && (
        <div className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E1E9FF] gap-3">
            <div>
              <h3 className="text-base font-black text-[#1A1D4E] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#00A887]" />
                <span>
                  {language === 'ku'
                    ? 'کۆنترۆلا پۆلان و ڕیزبەندی قوتابیان'
                    : language === 'ar'
                    ? 'إدارة وترتيب صفوف الطلاب'
                    : 'Class Control & Student Section Assignment'}
                </span>
              </h3>
              <p className="text-xs text-[#6B70A6] mt-0.5">
                {language === 'ku'
                  ? 'دەتوانى بە ئاسانی پۆل یان بەشی هەر قوتابیەک بگۆڕیت (پۆلی ١ تا ٩ - بەشەکانی A, B, C)'
                  : language === 'ar'
                  ? 'يمكنك بسهولة تغيير صف أو شعبة أي طالب (الصفوف 1-9، الشعب A, B, C)'
                  : 'Easily change any student\'s grade or section (Grades 1–9, Sections A, B, C) with instant auto-sync.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#8C90C2]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name or ID..."
                className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs w-56 text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
              />
            </div>
          </div>

          <div className="border border-[#E1E9FF] rounded-2xl overflow-x-auto touch-pan-x max-h-[600px]">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-[#1A1D4E] text-white sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Student ID</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Current Grade</th>
                  <th className="py-3 px-3">Current Section</th>
                  <th className="py-3 px-3 text-center">Change Class (A-B-C)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E9FF]">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-[#F5F6FF]/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#8C90C2]">{index + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-[#1A1D4E] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectModalStudent(student)}
                        className="hover:text-[#0087A5] underline decoration-[#0087A5]/30 cursor-pointer text-start"
                      >
                        {student.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0087A5]">{student.id}</td>
                    <td className="py-2.5 px-3 font-mono text-[#454A87]">{student.rollNumber}</td>
                    <td className="py-2.5 px-3 font-bold text-[#1A1D4E]">
                      <select
                        value={student.grade}
                        onChange={(e) => onUpdateStudentClass(student.id, e.target.value, student.section)}
                        className="bg-white border border-[#0087A5] rounded-xl px-2.5 py-1 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5] cursor-pointer shadow-2xs"
                      >
                        {gradeKeys.map((g) => (
                          <option key={g} value={g}>
                            {formatGradeLabel(g, language)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#1A1D4E]">
                      <select
                        value={student.section}
                        onChange={(e) => onUpdateStudentClass(student.id, student.grade, e.target.value)}
                        className="bg-white border border-[#00A887] rounded-xl px-2.5 py-1 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#00A887] cursor-pointer shadow-2xs"
                      >
                        {(schoolStructure[student.grade] || ['Class A', 'Class B', 'Class C']).map((sec) => (
                          <option key={sec} value={sec}>
                            {formatClassLabel(sec, language)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADMIN TAB 6: EXAMS SCHEDULE                              */}
      {/* ======================================================== */}
      {adminTab === 'exams' && (
        <ExamsScheduleView
          language={language}
          isRtl={isRtl}
          schoolLogoUrl={schoolLogoUrl}
          rows={examRows}
          isAdmin={true}
          onUpdateCell={onUpdateExamCell}
          onResetSchedule={onResetExamSchedule}
        />
      )}

      {/* ======================================================== */}
      {/* ADMIN TAB 7: MONTHLY BEHAVIOUR REPORTS (VIEW / PRINT)    */}
      {/* Mentor-Only Insertion Rule: Only Class Mentors insert.   */}
      {/* ======================================================== */}
      {adminTab === 'behaviour' && (() => {
        const classStudents = students.filter(
          (s) => s.grade === behGrade && s.section === behSection
        );
        const activeStudent =
          classStudents.find((s) => s.id === behStudentId) || classStudents[0] || null;
        const activeKey = activeStudent
          ? makeBehaviourReportKey(activeStudent.id, behMonthKey)
          : '';
        const classMentor = getMentorForClass(behGrade, behSection);
        const savedReport = activeKey ? behaviourReports[activeKey] : undefined;
        const currentReport = activeStudent
          ? savedReport ||
            createEmptyBehaviourReport(
              activeStudent.id,
              behMonthKey,
              classMentor?.teacher.name || ''
            )
          : null;

        const handleDownloadBehaviourPdf = async () => {
          if (!activeStudent || behDownloadingPdf) return;
          setBehDownloadingPdf(true);
          setBehSaveMessage(null);
          try {
            await exportBehaviourReportPdf({
              elementId: 'printable-behaviour',
              studentName: activeStudent.name,
              monthKey: behMonthKey,
            });
          } catch (err) {
            console.error('Behaviour PDF export error:', err);
            setBehSaveMessage({
              ok: false,
              text:
                err instanceof Error
                  ? err.message
                  : 'Could not generate Behaviour Report PDF.',
            });
          } finally {
            setBehDownloadingPdf(false);
          }
        };

        return (
          <div className="bg-white border border-[#E1E9FF] rounded-3xl p-4 sm:p-6 shadow-xs space-y-5">
            {/* Mentor-Only Notice Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F3EEFF] border border-[#BB8FFF]/45">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#5B35A8] text-white flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#1A1D4E]">
                    {language === 'ku'
                      ? 'تۆمارکرنا رەوشتی بتنێ بۆ ڕابەرێ پۆلێ یە'
                      : language === 'ar'
                      ? 'إدخال تقارير السلوك مخصص لمرشد الصف فقط'
                      : 'Mentor-Only Behaviour Entry (Admin Read-Only & Export View)'}
                  </p>
                  <p className="text-[11px] text-[#454A87]">
                    {classMentor ? (
                      <>
                        {language === 'ku'
                          ? `ڕابەرێ پۆلا ${classMentor.assignment.classCode}: `
                          : language === 'ar'
                          ? `مرشد الصف ${classMentor.assignment.classCode}: `
                          : `Assigned Class Mentor (${classMentor.assignment.classCode}): `}
                        <strong className="text-[#5B35A8]">
                          {classMentor.assignment.mentorShortName} — {classMentor.teacher.name}
                        </strong>
                        {' • '}
                        <span className="font-mono text-[10px]">{classMentor.teacher.email}</span>
                      </>
                    ) : (
                      'No mentor assigned to this class.'
                    )}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                  savedReport
                    ? savedReport.published
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-white text-[#6B70A6] border border-[#E1E9FF]'
                }`}
              >
                {savedReport
                  ? savedReport.published
                    ? language === 'ku'
                      ? 'بەردەستە بۆ سەرپەرشتیاران'
                      : language === 'ar'
                      ? 'منشور لأولياء الأمور'
                      : 'Submitted & Published by Mentor'
                    : 'Saved Draft by Mentor'
                  : language === 'ku'
                  ? 'هێشتا ژ لایێ ڕابەری نەهاتیە تۆمارکرن'
                  : language === 'ar'
                  ? 'لم يتم الإدخال من المرشد بعد'
                  : 'Not Entered by Mentor Yet'}
              </span>
            </div>

            {/* Toolbar: Grade, Section, Student, Month, Save PDF, Print A4 */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#E1E9FF]">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                    {language === 'ku' ? 'پۆل' : language === 'ar' ? 'الصف' : 'Grade'}
                  </label>
                  <select
                    value={behGrade}
                    onChange={(e) => {
                      const nextGrade = e.target.value;
                      const nextSections = schoolStructure[nextGrade] || ['Class A'];
                      const nextSec = nextSections.includes(behSection)
                        ? behSection
                        : nextSections[0];
                      setBehGrade(nextGrade);
                      setBehSection(nextSec);
                      const firstSt = students.find(
                        (s) => s.grade === nextGrade && s.section === nextSec
                      );
                      if (firstSt) setBehStudentId(firstSt.id);
                      setBehSaveMessage(null);
                    }}
                    className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
                  >
                    {gradeKeys.map((g) => (
                      <option key={g} value={g}>
                        {formatGradeLabel(g, language)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                    {language === 'ku' ? 'هۆبە' : language === 'ar' ? 'الشعبة' : 'Section'}
                  </label>
                  <select
                    value={behSection}
                    onChange={(e) => {
                      const nextSec = e.target.value;
                      setBehSection(nextSec);
                      const firstSt = students.find(
                        (s) => s.grade === behGrade && s.section === nextSec
                      );
                      if (firstSt) setBehStudentId(firstSt.id);
                      setBehSaveMessage(null);
                    }}
                    className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
                  >
                    {(schoolStructure[behGrade] || ['Class A', 'Class B', 'Class C']).map((sec) => (
                      <option key={sec} value={sec}>
                        {formatClassLabel(sec, language)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                    {language === 'ku' ? 'قوتابی' : language === 'ar' ? 'الطالب' : 'Student'}
                  </label>
                  <select
                    value={activeStudent?.id || ''}
                    onChange={(e) => {
                      setBehStudentId(e.target.value);
                      setBehSaveMessage(null);
                    }}
                    className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5] min-w-[210px]"
                  >
                    {classStudents.map((st) => {
                      const hasSaved = Boolean(
                        behaviourReports[makeBehaviourReportKey(st.id, behMonthKey)]
                      );
                      return (
                        <option key={st.id} value={st.id}>
                          {hasSaved ? '✓ ' : ''}
                          {st.name} ({st.rollNumber})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                    {language === 'ku' ? 'هەیڤ' : language === 'ar' ? 'الشهر' : 'Month'}
                  </label>
                  <select
                    value={behMonthKey}
                    onChange={(e) => {
                      setBehMonthKey(e.target.value);
                      setBehSaveMessage(null);
                    }}
                    className="bg-[#F0F8FA] border border-[#C8E5EC] rounded-xl px-3 py-2 text-xs font-black text-[#0087A5] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
                  >
                    {BEHAVIOUR_MONTHS.map((m) => {
                      const hasSaved = activeStudent
                        ? Boolean(
                            behaviourReports[makeBehaviourReportKey(activeStudent.id, m.key)]
                          )
                        : false;
                      return (
                        <option key={m.key} value={m.key}>
                          {hasSaved ? '✓ ' : ''}
                          {language === 'ku'
                            ? m.labelKu
                            : language === 'ar'
                            ? m.labelAr
                            : m.labelEn}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={!activeStudent || behDownloadingPdf}
                  onClick={handleDownloadBehaviourPdf}
                  className="px-3.5 py-2 rounded-xl bg-[#0087A5] hover:bg-[#00738D] disabled:opacity-60 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {behDownloadingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {behDownloadingPdf
                      ? language === 'ku'
                        ? 'دروستکرنا PDF...'
                        : language === 'ar'
                        ? 'جاري إنشاء PDF...'
                        : 'Generating PDF...'
                      : language === 'ku'
                      ? 'داگرتنا PDF'
                      : language === 'ar'
                      ? 'حفظ PDF'
                      : 'Save PDF'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!activeStudent}
                  onClick={() => printBehaviourReport('printable-behaviour')}
                  className="px-3.5 py-2 rounded-xl bg-[#F5F6FF] hover:bg-[#E1E9FF] border border-[#E1E9FF] text-xs font-bold text-[#1A1D4E] flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#0087A5]" />
                  <span>{language === 'ku' ? 'چاپکرنا A4' : language === 'ar' ? 'طباعة A4' : 'Print A4'}</span>
                </button>
              </div>
            </div>

            {behSaveMessage && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                  behSaveMessage.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {behSaveMessage.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{behSaveMessage.text}</span>
              </div>
            )}

            {activeStudent && currentReport ? (
              <BehaviourReportCard
                mode="view"
                report={currentReport}
                studentName={activeStudent.name}
                gradeLabel={formatGradeLabel(activeStudent.grade, language)}
                sectionLabel={formatClassLabel(activeStudent.section, language)}
                schoolLogoUrl={schoolLogoUrl}
                language={language}
              />
            ) : (
              <div className="p-8 text-center text-xs text-[#6B70A6] bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                No students found in {behGrade} — {behSection}.
              </div>
            )}
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* ADMIN TAB 8: ATTENDANCE REPORT 2026–2027                 */}
      {/* ======================================================== */}
      {adminTab === 'attendance' && (
        <AttendanceReportView
          mode="admin"
          students={students}
          schoolStructure={schoolStructure}
          attendanceRecords={attendanceRecords}
          attendanceHolidays={attendanceHolidays}
          customEnglishNames={attendanceEnglishNames}
          onUpdateDayStatus={onUpdateAttendanceDay}
          onBulkFillDayPresent={onBulkFillAttendanceDayPresent}
          onToggleHoliday={onToggleAttendanceHoliday}
          onUpdateEnglishName={onUpdateAttendanceEnglishName}
          language={language}
          exportSourceBase={{
            dailyRecords,
            gradeCurriculum,
            liveBuses,
            classSummaries,
            officialSubjectNames: officialSubjects.map((s) => s.name),
            behaviourReports,
            examRows,
            schoolLogoUrl,
          }}
        />
      )}

      {/* ======================================================== */}
      {/* ADMIN TAB 9: EXPORT CENTER (EXCEL .XLSX & PDF)           */}
      {/* ======================================================== */}
      {adminTab === 'export' && (() => {
        const exportSource: AdminExportSourceData = {
          students,
          dailyRecords,
          gradeCurriculum,
          liveBuses,
          classSummaries,
          officialSubjectNames: officialSubjects.map((s) => s.name),
          behaviourReports,
          attendanceRecords,
          attendanceHolidays,
          attendanceEnglishNames,
          examRows,
          schoolLogoUrl,
          gradeFilter: exportGradeScope,
          classFilter: exportClassScope,
        };

        const runExcel = (key: AdminExportDatasetKey | 'ALL') => {
          if (exportBusyKey) return;
          setExportNotice(null);
          try {
            if (key === 'ALL') {
              exportAllToExcelWorkbook(exportSource);
              setExportNotice({
                ok: true,
                text:
                  language === 'ku'
                    ? 'هەمی داتا ب شێوێ فایلا Excel (10 شیت) هاتنە داگرتن'
                    : language === 'ar'
                    ? 'تم تنزيل ملف Excel الشامل لجميع البيانات (10 أوراق عمل)'
                    : 'Master Excel workbook (.xlsx with all sheets including Full Classes Marks & All Marks) downloaded successfully.',
              });
            } else {
              exportDatasetToExcel(key, exportSource);
              setExportNotice({
                ok: true,
                text:
                  language === 'ku'
                    ? 'فایلا Excel هاتە داگرتن'
                    : language === 'ar'
                    ? 'تم تنزيل ملف Excel بنجاح'
                    : 'Excel (.xlsx) file downloaded successfully.',
              });
            }
          } catch (err) {
            setExportNotice({
              ok: false,
              text: err instanceof Error ? err.message : 'Excel export failed.',
            });
          }
        };

        const runPdf = async (key: AdminExportDatasetKey | 'ALL') => {
          if (exportBusyKey) return;
          const busyId = `pdf:${key}`;
          setExportBusyKey(busyId);
          setExportPdfProgress(null);
          setExportNotice(null);
          try {
            if (key === 'ALL') {
              await exportAllToPdf(exportSource, (p) => setExportPdfProgress(p));
              setExportNotice({
                ok: true,
                text:
                  language === 'ku'
                    ? 'راپۆرتا گشتی یا PDF هاتە داگرتن'
                    : language === 'ar'
                    ? 'تم تنزيل ملف PDF الشامل لجميع البيانات بنجاح'
                    : 'Complete School PDF bundle downloaded successfully.',
              });
            } else {
              await exportDatasetToPdf(key, exportSource, (p) => setExportPdfProgress(p));
              setExportNotice({
                ok: true,
                text:
                  language === 'ku'
                    ? 'فایلا PDF هاتە داگرتن'
                    : language === 'ar'
                    ? 'تم تنزيل ملف PDF بنجاح'
                    : 'PDF file downloaded successfully.',
              });
            }
          } catch (err) {
            console.error('Admin PDF export error:', err);
            setExportNotice({
              ok: false,
              text: err instanceof Error ? err.message : 'PDF export failed.',
            });
          } finally {
            setExportBusyKey(null);
            setExportPdfProgress(null);
          }
        };

        const availableExportClasses = classSummaries.filter(
          (c) => exportGradeScope === 'ALL' || c.grade === exportGradeScope
        );

        const scopedStudentCount = students.filter((s) => {
          if (exportGradeScope !== 'ALL' && s.grade !== exportGradeScope) return false;
          if (
            exportClassScope !== 'ALL' &&
            `${s.grade}::${s.section}` !== exportClassScope
          ) {
            return false;
          }
          return true;
        }).length;

        const scopedClassCount = availableExportClasses.filter(
          (c) =>
            exportClassScope === 'ALL' || `${c.grade}::${c.section}` === exportClassScope
        ).length;

        const datasetCards: Array<{
          key: AdminExportDatasetKey;
          title: string;
          titleKu: string;
          titleAr: string;
          countLabel: string;
          description: string;
          icon: React.ReactNode;
          accentBg: string;
        }> = [
          {
            key: 'full_classes_marks',
            title: 'Full Classes Marks with Summary',
            titleKu: 'نمرێن تەمام یێن هەمی پۆلان دگەل پوختە',
            titleAr: 'درجات الصفوف الكاملة مع الملخص',
            countLabel: `${scopedClassCount} Classes • ${scopedStudentCount} Students`,
            description:
              'Complete student-by-student marksheets per class with subject columns, class averages, pass rates %, and graded counts (separate Excel sheet per class + PDF per class).',
            icon: <Layers className="w-5 h-5 text-[#0087A5]" />,
            accentBg: 'bg-[#E1F3F7]',
          },
          {
            key: 'all_marks',
            title: 'All Marks (Complete Marksheet)',
            titleKu: 'هەمی نمرێن قوتابیان',
            titleAr: 'جميع الدرجات (السجل الشامل)',
            countLabel: `${scopedStudentCount} Students • ${globalStats.totalMarksEntered} Marks`,
            description:
              'Master marks matrix of all students & all subjects plus full detailed breakdown (Eval 1–4 /25, 1st & 2nd Half, Exams /20, 40% + 60% Final = /100).',
            icon: <BookOpen className="w-5 h-5 text-[#FF7F2A]" />,
            accentBg: 'bg-[#FFF2E8]',
          },
          {
            key: 'teachers',
            title: 'Teachers List & Details',
            titleKu: 'لیستا مامۆستایان و زانیاری',
            titleAr: 'قائمة المعلمين وتفاصيلهم',
            countLabel: `${TEACHER_ACCOUNTS.length} Teachers • 16 Mentors`,
            description:
              'Full name, ID, Mentor class badge, subject(s), login email, phone password, and all assigned classes.',
            icon: <GraduationCap className="w-5 h-5 text-[#0087A5]" />,
            accentBg: 'bg-[#E1F3F7]',
          },
          {
            key: 'students',
            title: 'Students & Guardians',
            titleKu: 'قوتابی و سەرپەرشتیار',
            titleAr: 'الطلاب وأولياء الأمور',
            countLabel: `${scopedStudentCount} Students`,
            description:
              'Student IDs, roll numbers, full names, grade & section, guardian phone/email, portal passwords, and bus assignments.',
            icon: <Users className="w-5 h-5 text-[#FF7F2A]" />,
            accentBg: 'bg-[#FFF2E8]',
          },
          {
            key: 'locations',
            title: 'Student Locations & Bus Stops',
            titleKu: 'جهێن قوتابیان و نەخشە',
            titleAr: 'مواقع الطلاب ومحطات الحافلات',
            countLabel: `${ALL_BUS_STOPS.length} Mapped Stops`,
            description:
              'Bus route, driver name, stop order, student names, latitude & longitude coordinates, and Google Maps links.',
            icon: <MapPin className="w-5 h-5 text-[#00A887]" />,
            accentBg: 'bg-[#E6FAF6]',
          },
          {
            key: 'drivers',
            title: 'Drivers & Bus Fleet',
            titleKu: 'شوفێر و پاسێن قوتابخانێ',
            titleAr: 'السائقون وأسطول الحافلات',
            countLabel: `${BUS_DRIVER_ROUTES.length} Bus Routes`,
            description:
              'Driver names (KU/AR & EN), bus codes, driver PINs, route coverage, total stops, and live GPS status.',
            icon: <Bus className="w-5 h-5 text-[#1A1D4E]" />,
            accentBg: 'bg-[#EEF0FF]',
          },
          {
            key: 'class_summary',
            title: 'Class Academic Summary',
            titleKu: 'پوختەیا ئەنجامێن پۆلان',
            titleAr: 'الملخص الأكاديمي للصفوف',
            countLabel: `${classSummaries.length} Classes`,
            description:
              'Class mentor, student count, average score, pass rate %, graded entries, and per-subject averages.',
            icon: <BarChart3 className="w-5 h-5 text-[#0087A5]" />,
            accentBg: 'bg-[#E1F3F7]',
          },
          {
            key: 'attendance',
            title: 'Attendance Report 2026–2027',
            titleKu: 'راپۆرتا ئامادەبوونێ ٢٠٢٦–٢٠٢٧',
            titleAr: 'تقرير الحضور والغياب ٢٠٢٦–٢٠٢٧',
            countLabel: `${scopedClassCount} Classes • Sep 2026 – Jul 2027`,
            description:
              'Class Summary, Student Report (A/L/P per month & year), Top 15 Absentees, HOW TO USE, and individual daily sheets for 1-A through 9-A.',
            icon: <CalendarCheck2 className="w-5 h-5 text-[#00A887]" />,
            accentBg: 'bg-[#E6FAF6]',
          },
          {
            key: 'behaviour',
            title: 'Monthly Behaviour Reports',
            titleKu: 'راپۆرتێن رەوشتی یێن هەیڤانە',
            titleAr: 'تقارير السلوك الشهرية',
            countLabel: `${Object.keys(behaviourReports).length} Saved Reports`,
            description:
              'Saved monthly student behaviour reports with mentor name, social worker, averages, incidents, and publish status.',
            icon: <Heart className="w-5 h-5 text-[#5B35A8]" />,
            accentBg: 'bg-[#F3EEFF]',
          },
          {
            key: 'exams',
            title: 'Exams Schedule',
            titleKu: 'خشتەیێ ئەزموونان',
            titleAr: 'جدول الامتحانات',
            countLabel: `${examRows.length} Exam Days`,
            description:
              'Official exam dates, days, time slots, and subjects scheduled across Grades 1 through 9.',
            icon: <ClipboardList className="w-5 h-5 text-[#FF7F2A]" />,
            accentBg: 'bg-[#FFF2E8]',
          },
        ];

        return (
          <div className="space-y-6">
            {/* Master Export All Banner */}
            <div className="bg-gradient-to-br from-[#1A1D4E] via-[#0F395C] to-[#0087A5] text-white rounded-3xl p-5 sm:p-7 shadow-[0_10px_28px_rgba(26,29,78,0.22)] space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#00D4AA]" />
                    <span>
                      {language === 'ku'
                        ? 'دەرئێخستنا هەمی داتایان'
                        : language === 'ar'
                        ? 'التصدير الشامل لجميع البيانات'
                        : 'Master School Data Export'}
                    </span>
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black">
                    {language === 'ku'
                      ? 'هەمی داتایان وەک Excel یان PDF داگرە'
                      : language === 'ar'
                      ? 'تصدير جميع بيانات المدرسة بصيغة Excel أو PDF'
                      : 'Export Everything as Excel (.xlsx) or PDF'}
                  </h3>
                  <p className="text-xs text-white/85 max-w-2xl">
                    {language === 'ku'
                      ? 'نمرێن تەمام یێن پۆلان دگەل پوختە، هەمی نمرە، مامۆستا، قوتابی، جە، شوفێر، رەوشت و ئەزموونان د ئێک فایلدا.'
                      : language === 'ar'
                      ? 'قم بتنزيل ملف واحد شامل لجميع درجات الصفوف مع الملخص، كل الدرجات، المعلمين، الطلاب، المواقع، السائقين، السلوك والامتحانات.'
                      : 'Download a single master Excel workbook (10 sheets including Full Classes Marks & All Marks) or a complete multi-page Arabic/Kurdish-ready PDF containing all school records, or export any section individually below.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    disabled={Boolean(exportBusyKey)}
                    onClick={() => runExcel('ALL')}
                    className="px-4 py-3 rounded-2xl bg-[#00A887] hover:bg-[#008E72] disabled:opacity-60 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>
                      {language === 'ku'
                        ? 'داگرتنا هەمی ب Excel (.xlsx)'
                        : language === 'ar'
                        ? 'تصدير الكل Excel (.xlsx)'
                        : 'Export ALL to Excel (.xlsx)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(exportBusyKey)}
                    onClick={() => runPdf('ALL')}
                    className="px-4 py-3 rounded-2xl bg-white text-[#1A1D4E] hover:bg-[#F0F8FA] disabled:opacity-60 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    {exportBusyKey === 'pdf:ALL' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0087A5]" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#FF7F2A]" />
                    )}
                    <span>
                      {exportBusyKey === 'pdf:ALL'
                        ? exportPdfProgress
                          ? `PDF ${exportPdfProgress.currentPage}/${exportPdfProgress.totalPages}...`
                          : 'Generating PDF...'
                        : language === 'ku'
                        ? 'داگرتنا هەمی ب PDF'
                        : language === 'ar'
                        ? 'تصدير الكل PDF'
                        : 'Export ALL to PDF (.pdf)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Optional Grade & Class Scope Filter inside Export Center */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/15">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-[#2AD4FF]" />
                    <span className="font-bold text-white/90">
                      {language === 'ku'
                        ? 'فلتەرێ پۆلێ:'
                        : language === 'ar'
                        ? 'الصف:'
                        : 'Grade Scope:'}
                    </span>
                    <select
                      value={exportGradeScope}
                      onChange={(e) => {
                        setExportGradeScope(e.target.value);
                        setExportClassScope('ALL');
                      }}
                      className="bg-white/15 border border-white/30 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="ALL" className="text-[#1A1D4E]">
                        All Grades (1 – 9)
                      </option>
                      {gradeKeys.map((g) => (
                        <option key={g} value={g} className="text-[#1A1D4E]">
                          {formatGradeLabel(g, language)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white/90">
                      {language === 'ku'
                        ? 'شوبە:'
                        : language === 'ar'
                        ? 'الشعبة:'
                        : 'Class:'}
                    </span>
                    <select
                      value={exportClassScope}
                      onChange={(e) => setExportClassScope(e.target.value)}
                      className="bg-white/15 border border-white/30 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="ALL" className="text-[#1A1D4E]">
                        All Classes ({availableExportClasses.length})
                      </option>
                      {availableExportClasses.map((c) => {
                        const val = `${c.grade}::${c.section}`;
                        return (
                          <option key={val} value={val} className="text-[#1A1D4E]">
                            {c.label} ({c.studentCount} students)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {exportPdfProgress && (
                  <div className="flex items-center gap-2 text-[11px] font-mono bg-white/15 px-3 py-1 rounded-xl">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00D4AA]" />
                    <span>
                      Page {exportPdfProgress.currentPage} / {exportPdfProgress.totalPages} —{' '}
                      {exportPdfProgress.sectionLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {exportNotice && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
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

            {/* Individual Dataset Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {datasetCards.map((card) => {
                const isPdfBusy = exportBusyKey === `pdf:${card.key}`;
                return (
                  <div
                    key={card.key}
                    className="bg-white border border-[#E1E9FF] rounded-3xl p-5 shadow-[0_6px_20px_rgba(0,135,165,0.05)] flex flex-col justify-between gap-4 hover:border-[#0087A5]/45 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl ${card.accentBg} flex items-center justify-center shrink-0`}
                          >
                            {card.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-[#1A1D4E]">
                              {language === 'ku'
                                ? card.titleKu
                                : language === 'ar'
                                ? card.titleAr
                                : card.title}
                            </h4>
                            <span className="inline-block text-[10px] font-mono font-bold text-[#0087A5]">
                              {card.countLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#6B70A6] leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#E1E9FF]">
                      <button
                        type="button"
                        disabled={Boolean(exportBusyKey)}
                        onClick={() => runExcel(card.key)}
                        className="px-3 py-2.5 rounded-xl bg-[#E6FAF6] hover:bg-[#D1F5EE] border border-[#B6EADF] disabled:opacity-60 text-[#006F59] text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Excel (.xlsx)</span>
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(exportBusyKey)}
                        onClick={() => runPdf(card.key)}
                        className="px-3 py-2.5 rounded-xl bg-[#F5F6FF] hover:bg-[#E1E9FF] border border-[#D8E1FF] disabled:opacity-60 text-[#1A1D4E] text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        {isPdfBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0087A5]" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-[#FF7F2A]" />
                        )}
                        <span>
                          {isPdfBusy
                            ? exportPdfProgress
                              ? `${exportPdfProgress.currentPage}/${exportPdfProgress.totalPages}`
                              : '...'
                            : 'PDF (.pdf)'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </main>
  );
};
