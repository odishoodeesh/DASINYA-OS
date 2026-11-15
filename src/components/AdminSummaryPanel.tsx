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
} from 'lucide-react';
import { StudentRecord } from '../data/importedStudents';
import {
  TEACHER_ACCOUNTS,
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
  language: Language;
  isRtl: boolean;
  onSelectModalStudent: (student: StudentRecord) => void;
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
  language,
  isRtl,
  onSelectModalStudent,
  onExportStudentsCsv,
  onSignOut,
}) => {
  const [adminTab, setAdminTab] = useState<'summary' | 'students' | 'teachers'>('summary');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teacherSearch, setTeacherSearch] = useState<string>('');

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
    return TEACHER_ACCOUNTS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subjectLabel.toLowerCase().includes(q) ||
        t.phone.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''))
    );
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
                ? `قوتابی و کەشف (${students.length})`
                : language === 'ar'
                ? `الطلاب وكشوف الدرجات (${students.length})`
                : `Students & Marksheets (${students.length})`}
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
        </div>

        {/* Grade Filter for Summary & Students */}
        {adminTab !== 'teachers' && (
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
                  <th className="py-3 px-3">Guardian Password</th>
                  <th className="py-3 px-3 text-center">Marksheet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E9FF]">
                {filteredStudents.map((s, idx) => {
                  const curr = gradeCurriculum[s.grade] || officialSubjects;
                  const gradedCount = curr.filter(
                    (c) => getStudentSubjectTermScore(s, c.name, dailyRecords) !== null
                  ).length;

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
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0087A5]">
                        {s.guardianPassword}
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
                Official Teachers Directory ({filteredTeachers.length} / {TEACHER_ACCOUNTS.length})
              </h3>
              <p className="text-xs text-[#6B70A6]">
                Official teacher credentials (Email + Phone Password) and assigned class mark entry progress
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C90C2] absolute left-3 top-2.5" />
              <input
                type="text"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                placeholder="Search teacher, email, or subject..."
                className="pl-9 pr-3 py-1.5 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl text-xs w-64 text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
              />
            </div>
          </div>

          <div className="border border-[#E1E9FF] rounded-2xl overflow-x-auto touch-pan-x max-h-[580px]">
            <table className="w-full min-w-[780px] text-left text-xs">
              <thead className="bg-[#F5F6FF] border-b border-[#E1E9FF] font-bold text-[#1A1D4E] sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Teacher Name</th>
                  <th className="py-3 px-3">Subject(s)</th>
                  <th className="py-3 px-3">Login Email</th>
                  <th className="py-3 px-3">Phone (Password)</th>
                  <th className="py-3 px-3">Assigned Classes & Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E9FF]">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-[#F5F6FF]/50 transition-colors align-top">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#8C90C2]">{teacher.id}</td>
                    <td className="py-2.5 px-3 font-bold text-[#1A1D4E] whitespace-nowrap">{teacher.name}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
};
