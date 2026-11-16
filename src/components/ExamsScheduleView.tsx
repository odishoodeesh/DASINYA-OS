/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  Calendar,
  FileText,
  ExternalLink,
  Download,
  Loader2,
  Printer,
  AlertCircle,
  GraduationCap,
  Filter,
  CheckCircle2,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import {
  EXAM_GRADE_KEYS,
  EXAM_SCHEDULE_META,
  ExamGradeKey,
  ExamScheduleRow,
} from '../data/examsSchedule';
import { Language, formatGradeLabel } from '../lib/translations';

interface ExamsScheduleViewProps {
  language: Language;
  isRtl: boolean;
  schoolLogoUrl: string;
  studentName?: string;
  highlightGrade?: string;
  rows: ExamScheduleRow[];
  isAdmin?: boolean;
  onUpdateCell?: (rowId: string, grade: ExamGradeKey, value: string) => void;
  onResetSchedule?: () => void;
  onDownloadPdf?: (elementId: string, suffix: string) => void;
  isGeneratingPdf?: boolean;
}

const DAY_ACCENT: Record<string, string> = {
  Sunday: 'text-sky-700 bg-sky-50 border-sky-200',
  Monday: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  Tuesday: 'text-purple-700 bg-purple-50 border-purple-200',
  Wednesday: 'text-rose-700 bg-rose-50 border-rose-200',
  Thursday: 'text-amber-700 bg-amber-50 border-amber-200',
};

export const ExamsScheduleView: React.FC<ExamsScheduleViewProps> = ({
  language,
  isRtl,
  schoolLogoUrl,
  studentName,
  highlightGrade,
  rows,
  isAdmin = false,
  onUpdateCell,
  onResetSchedule,
  onDownloadPdf,
  isGeneratingPdf = false,
}) => {
  const validHighlightGrade = EXAM_GRADE_KEYS.includes(highlightGrade as ExamGradeKey)
    ? (highlightGrade as ExamGradeKey)
    : undefined;

  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('ALL');
  const [editMode, setEditMode] = useState<boolean>(false);

  const visibleGrades = useMemo<ExamGradeKey[]>(() => {
    if (selectedGradeFilter !== 'ALL' && EXAM_GRADE_KEYS.includes(selectedGradeFilter as ExamGradeKey)) {
      return [selectedGradeFilter as ExamGradeKey];
    }
    return EXAM_GRADE_KEYS;
  }, [selectedGradeFilter]);

  const notesList =
    language === 'ku'
      ? EXAM_SCHEDULE_META.notesKu
      : language === 'ar'
      ? EXAM_SCHEDULE_META.notesAr
      : EXAM_SCHEDULE_META.notesEn;

  const formatDayLabel = (row: ExamScheduleRow) =>
    language === 'ku' ? row.dayKu : language === 'ar' ? row.dayAr : row.dayEn;

  return (
    <div className="space-y-5">
      {/* Top Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E1E9FF] p-3.5 sm:p-4 rounded-2xl shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0087A5] to-[#1A1D4E] text-white flex items-center justify-center shrink-0">
            <ClipboardList className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-[#1A1D4E] block">
              {language === 'ku'
                ? EXAM_SCHEDULE_META.titleKu
                : language === 'ar'
                ? EXAM_SCHEDULE_META.titleAr
                : EXAM_SCHEDULE_META.titleEn}
            </span>
            <span className="text-[11px] text-[#0087A5] font-semibold">
              {language === 'ku'
                ? EXAM_SCHEDULE_META.startsOnKu
                : language === 'ar'
                ? EXAM_SCHEDULE_META.startsOnAr
                : `${EXAM_SCHEDULE_META.startsOnEn} • Academic Year ${EXAM_SCHEDULE_META.academicYear}`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Grade Filter */}
          <div className="flex items-center gap-1.5 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[#0087A5]" />
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#1A1D4E] focus:outline-none cursor-pointer"
            >
              <option value="ALL">
                {language === 'ku'
                  ? 'هەمی پۆل (١ - ٩)'
                  : language === 'ar'
                  ? 'جميع الصفوف (١ - ٩)'
                  : 'All Grades (1 - 9)'}
              </option>
              {EXAM_GRADE_KEYS.map((g) => (
                <option key={g} value={g}>
                  {formatGradeLabel(g, language)}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && onUpdateCell && (
            <>
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  editMode
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-[#F5F6FF] hover:bg-[#E1E9FF] text-[#1A1D4E] border-[#E1E9FF]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{editMode ? 'Done Editing' : 'Edit Schedule'}</span>
              </button>
              {editMode && onResetSchedule && (
                <button
                  type="button"
                  onClick={onResetSchedule}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Official PDF</span>
                </button>
              )}
            </>
          )}

          {/* Official PDF Document Link */}
          <a
            href={EXAM_SCHEDULE_META.officialPdfUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-[#F0F8FA] hover:bg-[#E1F3F7] text-[#0087A5] border border-[#C8E5EC] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'خشتەیێ فەرمی (PDF)' : language === 'ar' ? 'الجدول الرسمي (PDF)' : 'Official PDF'}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          {onDownloadPdf && (
            <button
              type="button"
              onClick={() => onDownloadPdf('printable-exams-schedule', 'Exams_Schedule')}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 bg-[#0087A5] hover:bg-[#00738D] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{language === 'ku' ? 'داگرتن' : language === 'ar' ? 'تنزيل' : 'Download PDF'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-[#1A1D4E] hover:bg-[#13163D] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'چاپ' : language === 'ar' ? 'طباعة' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Focused Highlight Card for Active Student's / Teacher's Grade */}
      {validHighlightGrade && (
        <div className="bg-gradient-to-br from-[#F0F8FA] via-white to-[#EEF0FF]/60 border-2 border-[#0087A5]/35 rounded-3xl p-5 sm:p-6 shadow-[0_6px_22px_rgba(0,135,165,0.08)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#C8E5EC]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0087A5] text-white flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-[#1A1D4E]">
                  {formatGradeLabel(validHighlightGrade, language)} —{' '}
                  {language === 'ku'
                    ? 'خشتەیێ ئەزموونێن تایبەت'
                    : language === 'ar'
                    ? 'جدول امتحانات الصف'
                    : 'Grade Exam Timetable'}
                  {studentName ? ` • ${studentName}` : ''}
                </h4>
                <p className="text-[11px] text-[#0087A5] font-semibold">
                  {EXAM_SCHEDULE_META.titleEn} ({EXAM_SCHEDULE_META.academicYear})
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{rows.length} Exam Days</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {rows.map((row, idx) => {
              const subject = row.subjectsByGrade[validHighlightGrade];
              const dayStyle = DAY_ACCENT[row.dayEn] || 'text-[#1A1D4E] bg-[#F5F6FF] border-[#E1E9FF]';
              return (
                <div
                  key={`${row.id}-card`}
                  className="bg-white border border-[#E1E9FF] rounded-2xl p-3.5 shadow-2xs hover:border-[#0087A5] transition-all flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-mono font-bold text-[#6B70A6]">
                      #{idx + 1} • {row.date}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dayStyle}`}>
                      {formatDayLabel(row)}
                    </span>
                  </div>
                  <div className="text-sm font-black text-[#1A1D4E] leading-snug">
                    {subject}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Official School Matrix Container (Printable & Exportable) */}
      <div
        id="printable-exams-schedule"
        className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-8 shadow-[0_6px_24px_rgba(0,135,165,0.06)] space-y-6"
      >
        {/* Official Document Header matching PDF */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E9FF] pb-5">
          <div className="flex items-center gap-3.5">
            <img src={schoolLogoUrl} alt="Dasinya School Logo" className="w-12 h-12 object-contain shrink-0" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1A1D4E]">
                {language === 'ku'
                  ? EXAM_SCHEDULE_META.schoolNameKu
                  : language === 'ar'
                  ? EXAM_SCHEDULE_META.schoolNameAr
                  : EXAM_SCHEDULE_META.schoolNameEn}
              </h3>
              <p className="text-xs text-[#6B70A6] font-medium">
                {language === 'ku'
                  ? `ساڵا خوێندنێ (${EXAM_SCHEDULE_META.academicYear}) • ${EXAM_SCHEDULE_META.startsOnKu}`
                  : language === 'ar'
                  ? `العام الدراسي (${EXAM_SCHEDULE_META.academicYear}) • ${EXAM_SCHEDULE_META.startsOnAr}`
                  : `Academic Year (${EXAM_SCHEDULE_META.academicYear}) • ${EXAM_SCHEDULE_META.startsOnEn}`}
              </p>
            </div>
          </div>

          <div className={`${isRtl ? 'sm:text-left' : 'sm:text-right'}`}>
            <span className="inline-block bg-[#F0F8FA] border border-[#C8E5EC] text-[#0087A5] font-extrabold text-xs px-3.5 py-1.5 rounded-xl tracking-wide">
              {language === 'ku'
                ? EXAM_SCHEDULE_META.titleKu
                : language === 'ar'
                ? EXAM_SCHEDULE_META.titleAr
                : EXAM_SCHEDULE_META.titleEn}
            </span>
          </div>
        </div>

        {/* Grades 1–9 Official Exam Matrix Table */}
        <div className="border border-[#C8E5EC] rounded-2xl overflow-x-auto touch-pan-x shadow-xs">
          <table className="w-full min-w-[920px] text-center text-xs border-collapse">
            <thead className="bg-[#F0F8FA] border-b border-[#C8E5EC] text-[#0D2D35] font-extrabold">
              <tr>
                <th className="py-3 px-2.5 whitespace-nowrap">#</th>
                <th className="py-3 px-3 whitespace-nowrap">
                  {language === 'ku' ? 'بەروار' : language === 'ar' ? 'التاريخ' : 'Date'}
                </th>
                <th className="py-3 px-3 whitespace-nowrap">
                  {language === 'ku' ? 'ڕۆژ' : language === 'ar' ? 'اليوم' : 'Day'}
                </th>
                {visibleGrades.map((grade) => {
                  const isHighlightedCol = validHighlightGrade === grade;
                  return (
                    <th
                      key={grade}
                      className={`py-3 px-2.5 whitespace-nowrap ${
                        isHighlightedCol
                          ? 'bg-[#0087A5] text-white'
                          : ''
                      }`}
                    >
                      {formatGradeLabel(grade, language)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E9FF]">
              {rows.map((row, rowIdx) => {
                const dayColor =
                  row.dayEn === 'Wednesday'
                    ? 'text-sky-700'
                    : row.dayEn === 'Thursday'
                    ? 'text-rose-700'
                    : row.dayEn === 'Sunday'
                    ? 'text-emerald-700'
                    : 'text-[#1A1D4E]';

                return (
                  <tr key={row.id} className="hover:bg-[#F5F6FF]/70 transition-colors">
                    <td className="py-3 px-2.5 font-mono font-bold text-[#6B70A6] bg-[#F5F6FF]/40">
                      {rowIdx + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1A1D4E] whitespace-nowrap bg-[#F5F6FF]/40">
                      {row.date}
                    </td>
                    <td className={`py-3 px-3 font-bold whitespace-nowrap ${dayColor}`}>
                      {formatDayLabel(row)}
                    </td>
                    {visibleGrades.map((grade) => {
                      const subjectVal = row.subjectsByGrade[grade];
                      const isHighlightedCol = validHighlightGrade === grade;
                      return (
                        <td
                          key={`${row.id}-${grade}`}
                          className={`py-2.5 px-2 font-semibold ${
                            isHighlightedCol
                              ? 'bg-[#E1F3F7]/65 text-[#006F89] font-extrabold'
                              : 'text-[#1A1D4E]'
                          }`}
                        >
                          {editMode && isAdmin && onUpdateCell ? (
                            <input
                              type="text"
                              value={subjectVal}
                              onChange={(e) => onUpdateCell(row.id, grade, e.target.value)}
                              className="w-full min-w-[90px] px-2 py-1 text-center text-xs font-bold bg-white border border-[#0087A5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
                            />
                          ) : (
                            <span className="inline-block leading-snug">{subjectVal}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Notes & Principal Signature Footer matching PDF */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end pt-2">
          <div className="md:col-span-8 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
            <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>
                {language === 'ku' ? 'تێبینییێن گرنگ:' : language === 'ar' ? 'ملاحظات هامة:' : 'Notes:'}
              </span>
            </h4>
            <ul className="space-y-1 text-xs text-amber-950 font-medium">
              {notesList.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 p-4 bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl text-center">
            <div className="w-3/4 mx-auto border-b border-[#8C90C2] pb-2 mb-2 text-xs font-mono text-[#6B70A6]">
              Dasinya Private School Office
            </div>
            <p className="text-sm font-black text-[#1A1D4E]">{EXAM_SCHEDULE_META.principalName}</p>
            <p className="text-xs font-semibold text-[#6B70A6]">
              {language === 'ku'
                ? EXAM_SCHEDULE_META.principalTitleKu
                : language === 'ar'
                ? EXAM_SCHEDULE_META.principalTitleAr
                : EXAM_SCHEDULE_META.principalTitleEn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
