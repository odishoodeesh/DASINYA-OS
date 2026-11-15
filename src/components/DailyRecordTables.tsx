/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Official Daily Student Record Tables for Grades 1-3 and Grades 4-9.
 * Used identically for Teacher mark entry and Student/Parent marksheets.
 */

import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import {
  Grade13SubjectRecord,
  Grade13EvalBlock,
  Grade49SubjectRecord,
  Grade49HalfBlock,
  GRADE13_CRITERIA_KEYS,
  GRADE49_HALF_CRITERIA,
  calcGrade13EvalTotal,
  calcGrade13GrandTotal,
  calcGrade49HalfTotal,
  calcGrade49ExamsTotal,
  calcGrade49Total40,
  calcGrade49GrandTotal100,
  hasGrade13Breakdown,
  ScorePair,
} from '../data/teacherPortal';
import { Language } from '../lib/translations';

export interface DailyRecordRowItem {
  rowKey: string;
  label: string;
  subLabel?: string;
  record: Grade13SubjectRecord | Grade49SubjectRecord;
}

interface CommonTableProps {
  mode: 'teacher' | 'student';
  language: Language;
  isRtl: boolean;
  gradeLabel: string;
  sectionLabel?: string;
  subjectLabel?: string;
  rows: DailyRecordRowItem[];
  onChangeRecord?: (rowKey: string, updated: Grade13SubjectRecord | Grade49SubjectRecord) => void;
}

function parseNumericInput(raw: string, max: number): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  if (Number.isNaN(num)) return null;
  const clamped = Math.max(0, Math.min(max, num));
  return Number(clamped.toFixed(1));
}

function formatScore(val: number | null | undefined): string {
  if (val === null || val === undefined) return '';
  return Number.isInteger(val) ? String(val) : val.toFixed(1);
}

// ============================================================================
// GRADES 1 - 3 DAILY STUDENT RECORD TABLE (1-3_44c4469a.pdf)
// ============================================================================

export const Grade13DailyRecordTable: React.FC<CommonTableProps> = ({
  mode,
  language,
  isRtl,
  gradeLabel,
  sectionLabel,
  subjectLabel,
  rows,
  onChangeRecord,
}) => {
  const evalKeys: Array<{
    key: 'eval1' | 'eval2' | 'eval3' | 'eval4';
    en: string;
    ku: string;
    ar: string;
  }> = [
    { key: 'eval1', en: 'Evaluate 1st', ku: 'هەڵسەنگاندنی ١', ar: 'التقييم الأول' },
    { key: 'eval2', en: 'Evaluate 2nd', ku: 'هەڵسەنگاندنی ٢', ar: 'التقييم الثاني' },
    { key: 'eval3', en: 'Evaluate 3rd', ku: 'هەڵسەنگاندنی ٣', ar: 'التقييم الثالث' },
    { key: 'eval4', en: 'Evaluate 4th', ku: 'هەڵسەنگاندنی ٤', ar: 'التقييم الرابع' },
  ];

  const handleCriterionChange = (
    rowKey: string,
    rec: Grade13SubjectRecord,
    evalKey: 'eval1' | 'eval2' | 'eval3' | 'eval4',
    criterionKey: keyof Omit<Grade13EvalBlock, 'manualTotal'>,
    rawValue: string
  ) => {
    if (!onChangeRecord) return;
    const val = parseNumericInput(rawValue, 5);
    const updatedBlock: Grade13EvalBlock = {
      ...rec[evalKey],
      [criterionKey]: val,
      manualTotal: null,
    };
    onChangeRecord(rowKey, {
      ...rec,
      [evalKey]: updatedBlock,
    });
  };

  const handleManualTotalChange = (
    rowKey: string,
    rec: Grade13SubjectRecord,
    evalKey: 'eval1' | 'eval2' | 'eval3' | 'eval4',
    rawValue: string
  ) => {
    if (!onChangeRecord) return;
    const val = parseNumericInput(rawValue, 25);
    onChangeRecord(rowKey, {
      ...rec,
      [evalKey]: {
        manners: null,
        quiz: null,
        oral: null,
        practical: null,
        participation: null,
        manualTotal: val,
      },
    });
  };

  const nameHeader =
    mode === 'teacher'
      ? language === 'ku'
        ? 'ناڤێ قوتابی'
        : language === 'ar'
        ? 'اسم الطالب'
        : 'Student Names'
      : language === 'ku'
      ? 'بابەت'
      : language === 'ar'
      ? 'المادة الدراسية'
      : 'Subjects';

  return (
    <div className="space-y-3 w-full max-w-full">
      {/* Official Document Header matching 1-3 PDF */}
      <div className="bg-[#F0F8FA] border border-[#C8E5EC] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <p className="font-black text-[#0D2D35] text-sm">
            Dasinya Non – Governmental Basic School Management
          </p>
          <p className="text-[#355B66] font-semibold">
            Academic Year 2026 – 2027 / First Semester • Daily Student Record
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {subjectLabel && (
            <span className="px-3 py-1 rounded-full bg-white border border-[#C8E5EC] text-[#0087A5] font-bold">
              {language === 'ku' ? 'بابەت' : language === 'ar' ? 'المادة' : 'Subject'}: {subjectLabel}
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-[#0087A5] text-white font-bold">
            {gradeLabel}
            {sectionLabel ? ` (${sectionLabel})` : ''} • Grades 1–3
          </span>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="flex items-center justify-between text-[11px] text-[#0087A5] bg-[#F0F8FA] px-3 py-2 rounded-xl border border-[#C8E5EC] print:hidden">
        <span className="flex items-center gap-1.5 font-medium">
          <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
          <span>
            {language === 'ku'
              ? 'بۆ بینین و تۆمارکرنا هەمی هەڵسەنگاندنان (١-٤)، خشتەی بۆ لای ڕاست و چەپ ڕابکێشە'
              : language === 'ar'
              ? 'اسحب الجدول يميناً ويساراً لعرض وإدخال كافة التقييمات الأربعة والمجموع'
              : 'Scroll table horizontally to view all 4 evaluations (Evaluate 1st – 4th) & Total (100)'}
          </span>
        </span>
      </div>

      {/* Scrollable Official Table */}
      <div className="border-2 border-[#0D2D35]/80 rounded-2xl overflow-x-auto shadow-xs w-full max-w-full touch-pan-x bg-white">
        <table className="w-full border-collapse text-[11px] sm:text-xs min-w-[1380px]">
          <thead>
            {/* Row 1: Title Banner */}
            <tr className="bg-[#0087A5] text-white">
              <th
                colSpan={27}
                className="py-2 px-3 text-center font-black text-sm tracking-wide border-b border-[#0D2D35]/40"
              >
                Daily Student Record — Grades 1 – 3
              </th>
            </tr>

            {/* Row 2: Evaluation Group Headers */}
            <tr className="bg-[#F0F8FA] text-[#0D2D35] font-bold border-b border-[#C8E5EC]">
              <th
                rowSpan={2}
                className={`py-2 px-2 text-center w-9 border-r border-[#C8E5EC] bg-[#E8F4F7] sticky z-20 ${
                  isRtl ? 'right-0' : 'left-0'
                }`}
              >
                #
              </th>
              <th
                rowSpan={2}
                className={`py-2 px-3 min-w-[180px] max-w-[220px] border-r-2 border-[#0087A5] bg-[#E8F4F7] sticky z-20 ${
                  isRtl ? 'right-9 text-right' : 'left-9 text-left'
                }`}
              >
                {nameHeader}
              </th>
              {evalKeys.map((ev) => (
                <th
                  key={ev.key}
                  colSpan={6}
                  className="py-1.5 px-2 text-center border-r-2 border-[#0087A5] bg-[#F5F9FB]"
                >
                  {language === 'ku' ? ev.ku : language === 'ar' ? ev.ar : ev.en}
                </th>
              ))}
              <th
                rowSpan={2}
                className="py-2 px-2.5 text-center bg-[#FFF3CD] text-[#0D2D35] font-black min-w-[58px]"
              >
                <div>{language === 'ku' ? 'کۆی گشتی' : language === 'ar' ? 'المجموع' : 'Total'}</div>
                <div className="text-[10px] font-mono text-[#0087A5] mt-0.5">100</div>
              </th>
            </tr>

            {/* Row 3: Criteria Sub-Headers + Max Marks */}
            <tr className="bg-white text-[#0D2D35] font-semibold border-b-2 border-[#0087A5]">
              {evalKeys.map((ev) => (
                <React.Fragment key={ev.key}>
                  {GRADE13_CRITERIA_KEYS.map((crit) => (
                    <th
                      key={`${ev.key}-${crit.key}`}
                      className="py-1.5 px-1 text-center border-r border-[#C8E5EC] min-w-[46px]"
                    >
                      <div className="text-[10px] leading-tight">
                        {language === 'ku' ? crit.ku : language === 'ar' ? crit.ar : crit.en}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-[#0087A5] mt-0.5">
                        {crit.max}
                      </div>
                    </th>
                  ))}
                  <th className="py-1.5 px-1.5 text-center border-r-2 border-[#0087A5] bg-[#FEF08A]/70 min-w-[50px]">
                    <div className="text-[10px] font-black">
                      {language === 'ku' ? 'کۆ' : language === 'ar' ? 'المجموع' : 'Total'}
                    </div>
                    <div className="text-[10px] font-mono font-black text-[#0D2D35] mt-0.5">25</div>
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#C8E5EC]">
            {rows.map((row, idx) => {
              const rec = row.record as Grade13SubjectRecord;
              const grandTotal = calcGrade13GrandTotal(rec);

              return (
                <tr key={row.rowKey} className="hover:bg-[#F0F8FA]/50 transition-colors">
                  <td
                    className={`py-2 px-2 text-center font-mono text-[#76A5B8] border-r border-[#C8E5EC] bg-[#F8FCFD] sticky z-10 ${
                      isRtl ? 'right-0' : 'left-0'
                    }`}
                  >
                    {idx + 1}
                  </td>
                  <td
                    className={`py-2 px-3 font-bold text-[#0D2D35] border-r-2 border-[#0087A5] bg-[#F8FCFD] sticky z-10 ${
                      isRtl ? 'right-9 text-right' : 'left-9 text-left'
                    }`}
                  >
                    <div className="truncate max-w-[190px]" title={row.label}>
                      {row.label}
                    </div>
                    {row.subLabel && (
                      <div className="text-[10px] font-mono font-normal text-[#76A5B8]">
                        {row.subLabel}
                      </div>
                    )}
                  </td>

                  {evalKeys.map((ev) => {
                    const block = rec[ev.key];
                    const blockTotal = calcGrade13EvalTotal(block);
                    const hasBreakdown = hasGrade13Breakdown(block);

                    return (
                      <React.Fragment key={`${row.rowKey}-${ev.key}`}>
                        {GRADE13_CRITERIA_KEYS.map((crit) => {
                          const val = block[crit.key];
                          return (
                            <td
                              key={`${row.rowKey}-${ev.key}-${crit.key}`}
                              className="p-1 text-center border-r border-[#C8E5EC]"
                            >
                              {mode === 'teacher' ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={5}
                                  step={0.5}
                                  value={formatScore(val)}
                                  onChange={(e) =>
                                    handleCriterionChange(
                                      row.rowKey,
                                      rec,
                                      ev.key,
                                      crit.key,
                                      e.target.value
                                    )
                                  }
                                  placeholder=""
                                  aria-label={`${row.label} ${ev.en} ${crit.en}`}
                                  className="w-11 h-7 text-center font-mono text-xs font-semibold bg-[#F8FCFD] border border-[#C8E5EC] rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0087A5] text-[#0D2D35]"
                                />
                              ) : (
                                <span className="font-mono font-semibold text-[#0D2D35]">
                                  {formatScore(val)}
                                </span>
                              )}
                            </td>
                          );
                        })}

                        {/* Yellow Total (25) column */}
                        <td className="p-1 text-center border-r-2 border-[#0087A5] bg-[#FEF9C3]/80 font-mono font-black text-[#0D2D35]">
                          {mode === 'teacher' && !hasBreakdown ? (
                            <input
                              type="number"
                              min={0}
                              max={25}
                              step={0.5}
                              value={formatScore(blockTotal)}
                              onChange={(e) =>
                                handleManualTotalChange(row.rowKey, rec, ev.key, e.target.value)
                              }
                              title="Auto-sums criteria above, or enter total out of 25 directly"
                              className="w-12 h-7 text-center font-mono text-xs font-black bg-[#FEF08A]/70 border border-[#EAB308]/50 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0087A5] text-[#0D2D35]"
                            />
                          ) : (
                            <span className="text-xs font-black text-[#0087A5]">
                              {formatScore(blockTotal)}
                            </span>
                          )}
                        </td>
                      </React.Fragment>
                    );
                  })}

                  {/* Grand Total (100) */}
                  <td className="py-2 px-2 text-center bg-[#FFF8DB] font-mono font-black text-sm text-[#0087A5]">
                    {formatScore(grandTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// GRADES 4 - 9 DAILY STUDENT RECORD TABLE (4-9_28d9ee6e.pdf)
// ============================================================================

export const Grade49DailyRecordTable: React.FC<CommonTableProps> = ({
  mode,
  language,
  isRtl,
  gradeLabel,
  sectionLabel,
  subjectLabel,
  rows,
  onChangeRecord,
}) => {
  const handleHalfCriterionChange = (
    rowKey: string,
    rec: Grade49SubjectRecord,
    halfKey: 'firstHalf' | 'secondHalf',
    critKey: keyof Grade49HalfBlock,
    slotIndex: 0 | 1,
    rawValue: string
  ) => {
    if (!onChangeRecord) return;
    const val = parseNumericInput(rawValue, 2);
    const currentPair: ScorePair = [...rec[halfKey][critKey]] as ScorePair;
    currentPair[slotIndex] = val;
    onChangeRecord(rowKey, {
      ...rec,
      [halfKey]: {
        ...rec[halfKey],
        [critKey]: currentPair,
      },
    });
  };

  const handleExamChange = (
    rowKey: string,
    rec: Grade49SubjectRecord,
    field: 'exam1' | 'exam2' | 'finalExam60',
    max: number,
    rawValue: string
  ) => {
    if (!onChangeRecord) return;
    const val = parseNumericInput(rawValue, max);
    onChangeRecord(rowKey, {
      ...rec,
      [field]: val,
    });
  };

  const nameHeader =
    mode === 'teacher'
      ? language === 'ku'
        ? 'ناڤێ قوتابی'
        : language === 'ar'
        ? 'أسم طالب'
        : 'Student Name'
      : language === 'ku'
      ? 'بابەت'
      : language === 'ar'
      ? 'المادة الدراسية'
      : 'Subject';

  const renderHalfHeaders = (halfKey: 'firstHalf' | 'secondHalf') => (
    <>
      {GRADE49_HALF_CRITERIA.map((crit) => (
        <th
          key={`${halfKey}-${crit.key}`}
          colSpan={2}
          className="py-1.5 px-1 text-center border-r border-[#C8E5EC] min-w-[78px]"
        >
          <div className="text-[10px] leading-snug font-bold text-[#0D2D35]">
            {language === 'ar' ? crit.ar : language === 'ku' ? crit.ku : crit.en}
          </div>
          <div className="grid grid-cols-2 border-t border-[#C8E5EC] mt-1 pt-0.5 text-[10px] font-mono text-[#0087A5]">
            <span className="border-r border-[#C8E5EC]">2</span>
            <span>2</span>
          </div>
        </th>
      ))}
      <th className="py-1.5 px-1.5 text-center border-r-2 border-[#0087A5] bg-[#FEF08A]/70 min-w-[54px]">
        <div className="text-[10px] font-black leading-tight">
          {language === 'ar' ? 'المجموع الكلي' : language === 'ku' ? 'کۆی گشتی' : 'Total'}
        </div>
        <div className="text-[10px] font-mono font-black text-[#B45309] mt-0.5">10%</div>
      </th>
    </>
  );

  const renderHalfCells = (
    row: DailyRecordRowItem,
    rec: Grade49SubjectRecord,
    halfKey: 'firstHalf' | 'secondHalf'
  ) => {
    const halfBlock = rec[halfKey];
    const halfTotal = calcGrade49HalfTotal(halfBlock);

    return (
      <>
        {GRADE49_HALF_CRITERIA.map((crit) => {
          const pair = halfBlock[crit.key];
          return (
            <React.Fragment key={`${row.rowKey}-${halfKey}-${crit.key}`}>
              {([0, 1] as const).map((slotIdx) => (
                <td
                  key={`${row.rowKey}-${halfKey}-${crit.key}-${slotIdx}`}
                  className="p-0.5 text-center border-r border-[#C8E5EC]"
                >
                  {mode === 'teacher' ? (
                    <input
                      type="number"
                      min={0}
                      max={2}
                      step={0.5}
                      value={formatScore(pair[slotIdx])}
                      onChange={(e) =>
                        handleHalfCriterionChange(
                          row.rowKey,
                          rec,
                          halfKey,
                          crit.key,
                          slotIdx,
                          e.target.value
                        )
                      }
                      aria-label={`${row.label} ${halfKey} ${crit.en} ${slotIdx + 1}`}
                      className="w-9 h-7 text-center font-mono text-[11px] font-semibold bg-[#F8FCFD] border border-[#C8E5EC] rounded-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0087A5] text-[#0D2D35]"
                    />
                  ) : (
                    <span className="font-mono text-[11px] font-semibold text-[#0D2D35]">
                      {formatScore(pair[slotIdx])}
                    </span>
                  )}
                </td>
              ))}
            </React.Fragment>
          );
        })}

        <td className="py-2 px-1.5 text-center border-r-2 border-[#0087A5] bg-[#FEF9C3]/80 font-mono font-black text-[#0D2D35]">
          {formatScore(halfTotal)}
        </td>
      </>
    );
  };

  return (
    <div className="space-y-3 w-full max-w-full">
      {/* Official Document Header matching 4-9 PDF */}
      <div className="bg-[#F0F8FA] border border-[#C8E5EC] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <p className="font-black text-[#0D2D35] text-sm">
            {language === 'ar'
              ? 'مدرسة داسنيا غير الحكومية الأساسية الإنكليزية • سجل المتابعة اليومية'
              : language === 'ku'
              ? 'قوتابخانەیا داسنیا یا تایبەت • تۆمارا بەدواداچوونا رۆژانە'
              : 'Dasinya Non-Governmental Basic School • Daily Student Record'}
          </p>
          <p className="text-[#355B66] font-semibold">
            {language === 'ar'
              ? 'السنة الدراسية ( 2026 - 2027 ) (الفصل الأول)'
              : language === 'ku'
              ? 'ساڵا خوێندنێ ( ٢٠٢٦ - ٢٠٢٧ ) • وەرزێ ئێکێ'
              : 'Academic Year 2026 – 2027 / First Semester'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {subjectLabel && (
            <span className="px-3 py-1 rounded-full bg-white border border-[#C8E5EC] text-[#0087A5] font-bold">
              {language === 'ar' ? 'المادة' : language === 'ku' ? 'بابەت' : 'Subject'}: {subjectLabel}
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-[#0087A5] text-white font-bold">
            {gradeLabel}
            {sectionLabel ? ` (${sectionLabel})` : ''} • Grades 4–9
          </span>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="flex items-center justify-between text-[11px] text-[#0087A5] bg-[#F0F8FA] px-3 py-2 rounded-xl border border-[#C8E5EC] print:hidden">
        <span className="flex items-center gap-1.5 font-medium">
          <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
          <span>
            {language === 'ku'
              ? 'بۆ بینین و تۆمارکرنا هەمی ستوونان (١٠٪ + ٢٠٪ + ١٠٪ = ٤٠٪ + ٦٠٪ = ١٠٠٪)، خشتەی بۆ لای ڕاست و چەپ ڕابکێشە'
              : language === 'ar'
              ? 'اسحب الجدول يميناً ويساراً لعرض كافة التقييمات (10% + 20% + 10% = 40% + 60% = 100%)'
              : 'Scroll table horizontally to view First Half (10%), Exams (20%), Second Half (10%), 40% Total, 60% Final & 100% Total'}
          </span>
        </span>
      </div>

      {/* Scrollable Official Table */}
      <div className="border-2 border-[#0D2D35]/80 rounded-2xl overflow-x-auto shadow-xs w-full max-w-full touch-pan-x bg-white">
        <table className="w-full border-collapse text-[11px] sm:text-xs min-w-[1620px]">
          <thead>
            {/* Row 1: Group Banners */}
            <tr className="bg-[#F0F8FA] text-[#0D2D35] font-black border-b border-[#C8E5EC]">
              <th
                rowSpan={2}
                className={`py-2 px-2 text-center w-9 border-r border-[#C8E5EC] bg-[#E8F4F7] sticky z-20 ${
                  isRtl ? 'right-0' : 'left-0'
                }`}
              >
                {language === 'ar' ? 'ت' : '#'}
              </th>
              <th
                rowSpan={2}
                className={`py-2 px-3 min-w-[175px] max-w-[215px] border-r-2 border-[#0087A5] bg-[#E8F4F7] sticky z-20 ${
                  isRtl ? 'right-9 text-right' : 'left-9 text-left'
                }`}
              >
                {nameHeader}
              </th>

              {/* First Half 10% */}
              <th
                colSpan={11}
                className="py-2 px-2 text-center bg-[#FDE68A] text-[#78350F] border-r-2 border-[#0087A5]"
              >
                {language === 'ar'
                  ? 'تقييم النصف الأول ( 10 درجة )'
                  : language === 'ku'
                  ? 'هەڵسەنگاندنی نیڤا ئێکێ ( ١٠ نمرە )'
                  : 'First Half Evaluation (10 Marks)'}
              </th>

              {/* Exams 20 */}
              <th
                colSpan={3}
                className="py-2 px-2 text-center bg-[#E0F2FE] text-[#0C4A6E] border-r-2 border-[#0087A5]"
              >
                {language === 'ar'
                  ? 'الأمتحانات ( 20 نمره )'
                  : language === 'ku'
                  ? 'تاقیکردنەوەکان ( ٢٠ نمرە )'
                  : 'Exams (20 Marks)'}
              </th>

              {/* Second Half 10% */}
              <th
                colSpan={11}
                className="py-2 px-2 text-center bg-[#FDE68A] text-[#78350F] border-r-2 border-[#0087A5]"
              >
                {language === 'ar'
                  ? 'تقييم النصف الثاني ( 10 درجة )'
                  : language === 'ku'
                  ? 'هەڵسەنگاندنی نیڤا دووێ ( ١٠ نمرە )'
                  : 'Second Half Evaluation (10 Marks)'}
              </th>

              {/* 40%, 60%, 100% */}
              <th
                rowSpan={2}
                className="py-2 px-2 text-center bg-[#F3E8FF] text-[#581C87] border-r border-[#C8E5EC] min-w-[60px]"
              >
                <div className="text-[10px] leading-tight">
                  {language === 'ar' ? 'مجموع الكلي' : language === 'ku' ? 'کۆی ٤٠٪' : 'Total 40%'}
                </div>
                <div className="text-[11px] font-mono font-black mt-0.5">40</div>
              </th>
              <th
                rowSpan={2}
                className="py-2 px-2 text-center bg-[#ECFDF5] text-[#065F46] border-r border-[#C8E5EC] min-w-[68px]"
              >
                <div className="text-[10px] leading-tight">
                  {language === 'ar'
                    ? 'امتحانات نهاية الفصل'
                    : language === 'ku'
                    ? 'تاقیکردنەوا دووماهیێ'
                    : 'Final Exam'}
                </div>
                <div className="text-[11px] font-mono font-black mt-0.5">60%</div>
              </th>
              <th
                rowSpan={2}
                className="py-2 px-2 text-center bg-[#FFF3CD] text-[#0D2D35] min-w-[64px]"
              >
                <div className="text-[10px] leading-tight">
                  {language === 'ar' ? 'مجموع الكلي' : language === 'ku' ? 'کۆی گشتی' : 'Grand Total'}
                </div>
                <div className="text-[11px] font-mono font-black text-[#0087A5] mt-0.5">100%</div>
              </th>
            </tr>

            {/* Row 2: Sub-headers */}
            <tr className="bg-white text-[#0D2D35] font-semibold border-b-2 border-[#0087A5]">
              {renderHalfHeaders('firstHalf')}

              <th className="py-1.5 px-1.5 text-center border-r border-[#C8E5EC] min-w-[54px]">
                <div className="text-[10px]">
                  {language === 'ar' ? 'امتحان ١' : language === 'ku' ? 'تاقیکردن ١' : 'Exam 1'}
                </div>
                <div className="text-[10px] font-mono font-bold text-[#0087A5] mt-0.5">20</div>
              </th>
              <th className="py-1.5 px-1.5 text-center border-r border-[#C8E5EC] min-w-[54px]">
                <div className="text-[10px]">
                  {language === 'ar' ? 'امتحان ٢' : language === 'ku' ? 'تاقیکردن ٢' : 'Exam 2'}
                </div>
                <div className="text-[10px] font-mono font-bold text-[#0087A5] mt-0.5">20</div>
              </th>
              <th className="py-1.5 px-1.5 text-center border-r-2 border-[#0087A5] bg-[#E0F2FE]/80 min-w-[56px]">
                <div className="text-[10px] font-black">
                  {language === 'ar' ? 'مجموع الكلي' : language === 'ku' ? 'کۆ' : 'Total'}
                </div>
                <div className="text-[10px] font-mono font-black text-[#0369A1] mt-0.5">20%</div>
              </th>

              {renderHalfHeaders('secondHalf')}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#C8E5EC]">
            {rows.map((row, idx) => {
              const rec = row.record as Grade49SubjectRecord;
              const examsTotal = calcGrade49ExamsTotal(rec);
              const total40 = calcGrade49Total40(rec);
              const grand100 = calcGrade49GrandTotal100(rec);

              return (
                <tr key={row.rowKey} className="hover:bg-[#F0F8FA]/50 transition-colors">
                  <td
                    className={`py-2 px-2 text-center font-mono text-[#76A5B8] border-r border-[#C8E5EC] bg-[#F8FCFD] sticky z-10 ${
                      isRtl ? 'right-0' : 'left-0'
                    }`}
                  >
                    {idx + 1}
                  </td>
                  <td
                    className={`py-2 px-3 font-bold text-[#0D2D35] border-r-2 border-[#0087A5] bg-[#F8FCFD] sticky z-10 ${
                      isRtl ? 'right-9 text-right' : 'left-9 text-left'
                    }`}
                  >
                    <div className="truncate max-w-[185px]" title={row.label}>
                      {row.label}
                    </div>
                    {row.subLabel && (
                      <div className="text-[10px] font-mono font-normal text-[#76A5B8]">
                        {row.subLabel}
                      </div>
                    )}
                  </td>

                  {/* First Half 10% */}
                  {renderHalfCells(row, rec, 'firstHalf')}

                  {/* Exams 20 */}
                  <td className="p-1 text-center border-r border-[#C8E5EC]">
                    {mode === 'teacher' ? (
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        value={formatScore(rec.exam1)}
                        onChange={(e) =>
                          handleExamChange(row.rowKey, rec, 'exam1', 20, e.target.value)
                        }
                        aria-label={`${row.label} Exam 1`}
                        className="w-12 h-7 text-center font-mono text-xs font-semibold bg-[#F8FCFD] border border-[#C8E5EC] rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0087A5] text-[#0D2D35]"
                      />
                    ) : (
                      <span className="font-mono font-semibold text-[#0D2D35]">
                        {formatScore(rec.exam1)}
                      </span>
                    )}
                  </td>
                  <td className="p-1 text-center border-r border-[#C8E5EC]">
                    {mode === 'teacher' ? (
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        value={formatScore(rec.exam2)}
                        onChange={(e) =>
                          handleExamChange(row.rowKey, rec, 'exam2', 20, e.target.value)
                        }
                        aria-label={`${row.label} Exam 2`}
                        className="w-12 h-7 text-center font-mono text-xs font-semibold bg-[#F8FCFD] border border-[#C8E5EC] rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0087A5] text-[#0D2D35]"
                      />
                    ) : (
                      <span className="font-mono font-semibold text-[#0D2D35]">
                        {formatScore(rec.exam2)}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-1.5 text-center border-r-2 border-[#0087A5] bg-[#E0F2FE]/60 font-mono font-black text-[#0369A1]">
                    {formatScore(examsTotal)}
                  </td>

                  {/* Second Half 10% */}
                  {renderHalfCells(row, rec, 'secondHalf')}

                  {/* 40% Total */}
                  <td className="py-2 px-1.5 text-center border-r border-[#C8E5EC] bg-[#FAF5FF] font-mono font-black text-[#6B21A8]">
                    {formatScore(total40)}
                  </td>

                  {/* 60% Final Exam */}
                  <td className="p-1 text-center border-r border-[#C8E5EC] bg-[#F0FDF4]">
                    {mode === 'teacher' ? (
                      <input
                        type="number"
                        min={0}
                        max={60}
                        step={0.5}
                        value={formatScore(rec.finalExam60)}
                        onChange={(e) =>
                          handleExamChange(row.rowKey, rec, 'finalExam60', 60, e.target.value)
                        }
                        aria-label={`${row.label} Final Exam 60%`}
                        className="w-14 h-7 text-center font-mono text-xs font-bold bg-white border border-[#86EFAC] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0087A5] text-[#065F46]"
                      />
                    ) : (
                      <span className="font-mono font-bold text-[#065F46]">
                        {formatScore(rec.finalExam60)}
                      </span>
                    )}
                  </td>

                  {/* 100% Grand Total */}
                  <td className="py-2 px-2 text-center bg-[#FFF8DB] font-mono font-black text-sm text-[#0087A5]">
                    {formatScore(grand100)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
