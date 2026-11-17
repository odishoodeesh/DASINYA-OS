/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Official Trilingual Monthly Behaviour Report Card (A4 Layout)
 * Faithfully modeled after Behaviour_Report_A4_5e6320ed.pdf
 */

import React from 'react';
import { Check } from 'lucide-react';
import {
  BEHAVIOUR_INCIDENTS,
  BEHAVIOUR_MONTHS,
  BEHAVIOUR_RUBRIC_SECTIONS,
  BEHAVIOUR_SCALE_LEGEND,
  BEHAVIOUR_SUBJECTS,
  BehaviourScore,
  MonthlyBehaviourReport,
} from '../data/behaviourReport';
import { Language } from '../lib/translations';

interface BehaviourReportCardProps {
  mode: 'view' | 'edit';
  report: MonthlyBehaviourReport;
  studentName: string;
  gradeLabel: string;
  sectionLabel: string;
  schoolLogoUrl: string;
  language: Language;
  onChangeReport?: (next: MonthlyBehaviourReport) => void;
}

const SCORES: BehaviourScore[] = [1, 2, 3, 4, 5];

export const BehaviourReportCard: React.FC<BehaviourReportCardProps> = ({
  mode,
  report,
  studentName,
  gradeLabel,
  sectionLabel,
  schoolLogoUrl,
  language,
  onChangeReport,
}) => {
  const monthObj = BEHAVIOUR_MONTHS.find((m) => m.key === report.monthKey);
  const monthDisplay = monthObj
    ? `${monthObj.labelEn} / ${monthObj.labelAr}`
    : report.monthKey;

  const isEdit = mode === 'edit' && Boolean(onChangeReport);

  const handleSetRating = (itemId: string, score: BehaviourScore) => {
    if (!onChangeReport) return;
    const current = report.ratings[itemId];
    const nextRatings = { ...report.ratings };
    if (current === score) {
      delete nextRatings[itemId];
    } else {
      nextRatings[itemId] = score;
    }
    onChangeReport({
      ...report,
      ratings: nextRatings,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSetSubjectRating = (subjectId: string, score: BehaviourScore) => {
    if (!onChangeReport) return;
    const current = report.subjectRatings[subjectId];
    const nextSub = { ...report.subjectRatings };
    if (current === score) {
      delete nextSub[subjectId];
    } else {
      nextSub[subjectId] = score;
    }
    onChangeReport({
      ...report,
      subjectRatings: nextSub,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleIncidentChange = (
    incidentId: string,
    field: 'occurrences' | 'action',
    value: string
  ) => {
    if (!onChangeReport) return;
    const existing = report.incidents[incidentId] || { occurrences: '', action: '' };
    onChangeReport({
      ...report,
      incidents: {
        ...report.incidents,
        [incidentId]: {
          ...existing,
          [field]: value,
        },
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const leftSections = BEHAVIOUR_RUBRIC_SECTIONS.filter((s) => s.column === 'left');
  const rightTopSection = BEHAVIOUR_RUBRIC_SECTIONS.find((s) => s.column === 'right_top');

  const renderScoreCells = (
    selected: BehaviourScore | undefined,
    onSelect: (score: BehaviourScore) => void
  ) =>
    SCORES.map((sc) => {
      const isSelected = selected === sc;
      return (
        <td
          key={sc}
          className={`border border-[#94A3B8] p-0 text-center align-middle w-6 sm:w-7 ${
            isEdit ? 'cursor-pointer hover:bg-[#E1F3F7]' : ''
          } ${isSelected ? 'bg-[#E6FAF6]' : ''}`}
          onClick={isEdit ? () => onSelect(sc) : undefined}
        >
          <div className="flex items-center justify-center h-6">
            {isSelected ? (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-xs bg-[#0087A5] text-[#FFFFFF]">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            ) : isEdit ? (
              <span className="w-3.5 h-3.5 rounded-xs border border-[#CBD5E1] inline-block opacity-45" />
            ) : null}
          </div>
        </td>
      );
    });

  return (
    <div
      id="printable-behaviour"
      dir="ltr"
      className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-2xl p-3 sm:p-5 text-[#111827] space-y-3 print:border-0 print:p-2"
    >
      {/* Top Trilingual Title Row */}
      <div
        data-behaviour-title-row="true"
        className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 text-center border-b-2 border-[#1A1D4E] pb-2"
      >
        <div className="text-xs sm:text-sm font-black text-[#1A1D4E] sm:text-left">
          {language === 'ku'
            ? 'Monthly Behaviour Report'
            : 'Monthly Behaviour Report'}
        </div>
        <div className="text-xs sm:text-sm font-black text-[#1A1D4E]" dir="rtl">
          بطاقة تقرير السلوك الشهري
        </div>
        <div className="text-xs sm:text-sm font-black text-[#1A1D4E] sm:text-right" dir="rtl">
          کارتا ڕاپۆرتا هەیڤانە یا ڕەوشتێ زاروکان
        </div>
      </div>

      {/* Official Header Table matching PDF */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-[#94A3B8] text-[10px] sm:text-[11px]">
          <tbody>
            <tr>
              <td
                rowSpan={2}
                className="border border-[#94A3B8] p-2 w-16 sm:w-20 text-center bg-[#F8FAFC] align-middle"
              >
                <img
                  src={schoolLogoUrl}
                  alt="DASINYA"
                  className="w-11 h-11 sm:w-12 sm:h-12 object-contain mx-auto"
                />
                <span className="block text-[8px] font-extrabold text-[#1A1D4E] mt-0.5">
                  DASINYA
                </span>
              </td>
              <td className="border border-[#94A3B8] px-2 py-1 font-bold bg-[#F8FAFC] w-24">
                Social Worker
              </td>
              <td className="border border-[#94A3B8] px-2 py-1 font-bold text-[#1A1D4E]">
                {isEdit ? (
                  <input
                    type="text"
                    value={report.socialWorker}
                    onChange={(e) =>
                      onChangeReport?.({
                        ...report,
                        socialWorker: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className="w-full bg-[#F5F6FF] border border-[#C8E5EC] rounded px-1.5 py-0.5 text-[11px] font-bold focus:outline-none"
                  />
                ) : (
                  report.socialWorker || 'Ms. Mina'
                )}
              </td>
              <td className="border border-[#94A3B8] px-2 py-1 font-bold bg-[#F8FAFC] w-24">
                Academic Year
              </td>
              <td className="border border-[#94A3B8] px-2 py-1 text-right font-bold bg-[#F8FAFC] text-[9px]" dir="rtl">
                العام الدراسي / ساڵا خواندنێ
              </td>
              <td className="border border-[#94A3B8] px-2 py-1 font-mono font-extrabold text-[#0087A5]">
                {report.academicYear || '2026-2027'}
              </td>
              <td className="border border-[#94A3B8] px-2 py-1 font-bold bg-[#F8FAFC] text-center">
                Month <span className="block text-[9px] font-normal">الشهر / هەیڤ</span>
              </td>
              <td className="border border-[#94A3B8] px-2 py-1 font-extrabold text-[#1A1D4E]">
                {monthDisplay}
              </td>
            </tr>

            <tr>
              <td className="border border-[#94A3B8] px-2 py-1 font-bold bg-[#F8FAFC]">
                Supervisor
              </td>
              <td className="border border-[#94A3B8] px-2 py-1">
                <div className="flex items-center justify-between gap-2">
                  {isEdit ? (
                    <input
                      type="text"
                      value={report.supervisor}
                      onChange={(e) =>
                        onChangeReport?.({
                          ...report,
                          supervisor: e.target.value,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      placeholder="Supervisor name..."
                      className="w-full bg-[#F5F6FF] border border-[#C8E5EC] rounded px-1.5 py-0.5 text-[11px] font-bold focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold">{report.supervisor || '—'}</span>
                  )}
                  <span className="text-[9px] text-[#64748B] shrink-0" dir="rtl">
                    المشرف / ڕابەر
                  </span>
                </div>
              </td>
              <td className="border border-[#94A3B8] px-2 py-1 font-bold bg-[#F8FAFC]">
                Day
              </td>
              <td className="border border-[#94A3B8] px-2 py-1 text-right bg-[#F8FAFC] text-[9px]" dir="rtl">
                اليوم / ڕۆژ
              </td>
              <td className="border border-[#94A3B8] px-2 py-1">
                {isEdit ? (
                  <input
                    type="text"
                    value={report.dayDate}
                    onChange={(e) =>
                      onChangeReport?.({
                        ...report,
                        dayDate: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    placeholder="e.g. 25"
                    className="w-full bg-[#F5F6FF] border border-[#C8E5EC] rounded px-1.5 py-0.5 text-[11px] font-bold focus:outline-none"
                  />
                ) : (
                  <span className="font-mono font-bold">{report.dayDate || '—'}</span>
                )}
              </td>
              <td colSpan={2} className="border border-[#94A3B8] px-2 py-1 bg-[#F0F8FA]">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                  <span>
                    <strong>Student:</strong> {studentName}
                  </span>
                  <span>
                    <strong>Grade/Class:</strong> {gradeLabel} — {sectionLabel}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Main Two-Column A4 Body Grid */}
      <div
        data-behaviour-grid="true"
        className="grid grid-cols-1 xl:grid-cols-2 gap-3 print:grid-cols-2 print:gap-2"
      >
        {/* LEFT COLUMN: 8 Behavioural Rubric Sections */}
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[#94A3B8] text-[9.5px] sm:text-[10px]">
              <tbody>
                {leftSections.map((sec) => (
                  <React.Fragment key={sec.id}>
                    {sec.groupHeader && (
                      <tr className="bg-[#1A1D4E] text-[#FFFFFF] font-black">
                        <td className="border border-[#94A3B8] px-2 py-1">{sec.groupHeader.en}</td>
                        <td className="border border-[#94A3B8] px-2 py-1 text-right" dir="rtl">
                          {sec.groupHeader.ar}
                        </td>
                        <td className="border border-[#94A3B8] px-2 py-1 text-right" dir="rtl">
                          {sec.groupHeader.ku}
                        </td>
                        <td colSpan={5} className="border border-[#94A3B8] px-1 py-1 text-center text-[9px]">
                          1 – 5
                        </td>
                      </tr>
                    )}
                    <tr className="bg-[#E6EEF8] font-extrabold text-[#1A1D4E]">
                      <td className="border border-[#94A3B8] px-1.5 py-1">{sec.title.en}</td>
                      <td className="border border-[#94A3B8] px-1.5 py-1 text-right" dir="rtl">
                        {sec.title.ar}
                      </td>
                      <td className="border border-[#94A3B8] px-1.5 py-1 text-right" dir="rtl">
                        {sec.title.ku}
                      </td>
                      {SCORES.map((sc) => (
                        <td key={sc} className="border border-[#94A3B8] px-1 py-1 text-center w-6">
                          {sc}
                        </td>
                      ))}
                    </tr>
                    {sec.items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8FAFC]">
                        <td className="border border-[#94A3B8] px-1.5 py-1 leading-tight">
                          {item.en}
                        </td>
                        <td className="border border-[#94A3B8] px-1.5 py-1 text-right leading-tight" dir="rtl">
                          {item.ar}
                        </td>
                        <td className="border border-[#94A3B8] px-1.5 py-1 text-right leading-tight" dir="rtl">
                          {item.ku}
                        </td>
                        {renderScoreCells(report.ratings[item.id], (sc) =>
                          handleSetRating(item.id, sc)
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Readiness + Scale Legend + 17 Subjects + 15 Incidents + Principal */}
        <div className="space-y-2.5">
          {/* Top-Right Readiness Block */}
          {rightTopSection && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[#94A3B8] text-[9.5px] sm:text-[10px]">
                <thead>
                  <tr className="bg-[#E6EEF8] font-extrabold text-[#1A1D4E]">
                    <th className="border border-[#94A3B8] px-1.5 py-1 text-left">
                      {rightTopSection.title.en}
                    </th>
                    <th className="border border-[#94A3B8] px-1.5 py-1 text-right" dir="rtl">
                      {rightTopSection.title.ar}
                    </th>
                    <th className="border border-[#94A3B8] px-1.5 py-1 text-right" dir="rtl">
                      {rightTopSection.title.ku}
                    </th>
                    {SCORES.map((sc) => (
                      <th key={sc} className="border border-[#94A3B8] px-1 py-1 text-center w-6">
                        {sc}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rightTopSection.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFC]">
                      <td className="border border-[#94A3B8] px-1.5 py-1 leading-tight">{item.en}</td>
                      <td className="border border-[#94A3B8] px-1.5 py-1 text-right leading-tight" dir="rtl">
                        {item.ar}
                      </td>
                      <td className="border border-[#94A3B8] px-1.5 py-1 text-right leading-tight" dir="rtl">
                        {item.ku}
                      </td>
                      {renderScoreCells(report.ratings[item.id], (sc) =>
                        handleSetRating(item.id, sc)
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Monthly Learning Scale Legend */}
          <div className="border border-[#94A3B8] bg-[#F8FAFC] p-2 rounded-sm space-y-1 text-[9px] sm:text-[9.5px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 font-extrabold text-[#1A1D4E] border-b border-[#CBD5E1] pb-1 gap-1">
              <span>Your child&apos;s monthly learning</span>
              <span className="sm:text-center" dir="rtl">
                تعلّم طفلك خلال الشهر
              </span>
              <span className="sm:text-right" dir="rtl">
                فێربوونا زاروکێ هەوە د هەیڤێدا
              </span>
            </div>
            <p className="text-[#334155] leading-snug">
              {BEHAVIOUR_SCALE_LEGEND.map((s) => `${s.score}. ${s.en}`).join('   ')}
            </p>
            <p className="text-[#334155] leading-snug text-right" dir="rtl">
              {BEHAVIOUR_SCALE_LEGEND.map((s) => `${s.score}. ${s.ar}`).join('   ')}
            </p>
            <p className="text-[#334155] leading-snug text-right" dir="rtl">
              {BEHAVIOUR_SCALE_LEGEND.map((s) => `${s.score}. ${s.ku}`).join('   ')}
            </p>
          </div>

          {/* 17 Subjects Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[#94A3B8] text-[9.5px] sm:text-[10px]">
              <thead>
                <tr className="bg-[#E6EEF8] font-extrabold text-[#1A1D4E]">
                  <th className="border border-[#94A3B8] px-1.5 py-1 text-left">Subjects</th>
                  <th className="border border-[#94A3B8] px-1.5 py-1 text-right" dir="rtl">
                    المواد الدراسية
                  </th>
                  <th className="border border-[#94A3B8] px-1.5 py-1 text-right" dir="rtl">
                    وانە
                  </th>
                  {SCORES.map((sc) => (
                    <th key={sc} className="border border-[#94A3B8] px-1 py-1 text-center w-6">
                      {sc}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BEHAVIOUR_SUBJECTS.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F8FAFC]">
                    <td className="border border-[#94A3B8] px-1.5 py-0.5 font-semibold">{sub.en}</td>
                    <td className="border border-[#94A3B8] px-1.5 py-0.5 text-right" dir="rtl">
                      {sub.ar}
                    </td>
                    <td className="border border-[#94A3B8] px-1.5 py-0.5 text-right" dir="rtl">
                      {sub.ku}
                    </td>
                    {renderScoreCells(report.subjectRatings[sub.id], (sc) =>
                      handleSetSubjectRating(sub.id, sc)
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 15 Incidents Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[#94A3B8] text-[9.5px] sm:text-[10px]">
              <thead>
                <tr className="bg-[#F9D8C6] font-extrabold text-[#1A1D4E]">
                  <th colSpan={2} className="border border-[#94A3B8] px-1.5 py-1 text-left">
                    Incidents
                  </th>
                  <th colSpan={2} className="border border-[#94A3B8] px-1.5 py-1 text-center" dir="rtl">
                    الحوادث السلوكية
                  </th>
                  <th colSpan={2} className="border border-[#94A3B8] px-1.5 py-1 text-right" dir="rtl">
                    ڕووداوێن ڕەوشتی
                  </th>
                </tr>
                <tr className="bg-[#F5F6FF] font-bold text-[#1A1D4E]">
                  <th className="border border-[#94A3B8] px-1 py-1 text-center w-8">
                    No.<span className="block text-[8px] font-normal">الرقم/ژمارە</span>
                  </th>
                  <th className="border border-[#94A3B8] px-1.5 py-1 text-left">Title</th>
                  <th className="border border-[#94A3B8] px-1.5 py-1 text-right" dir="rtl">
                    العنوان
                  </th>
                  <th className="border border-[#94A3B8] px-1.5 py-1 text-right" dir="rtl">
                    ناڤنیشان
                  </th>
                  <th className="border border-[#94A3B8] px-1.5 py-1 text-center w-20">
                    Occurrences
                    <span className="block text-[8px] font-normal">عدد المرات/هەژمار</span>
                  </th>
                  <th className="border border-[#94A3B8] px-1.5 py-1 text-center w-28">
                    Action
                    <span className="block text-[8px] font-normal">الإجراء/ڕێکار</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {BEHAVIOUR_INCIDENTS.map((inc) => {
                  const entry = report.incidents[inc.id] || { occurrences: '', action: '' };
                  return (
                    <tr key={inc.id} className="hover:bg-[#F8FAFC]">
                      <td className="border border-[#94A3B8] px-1 py-0.5 text-center font-mono font-bold">
                        {inc.no}
                      </td>
                      <td className="border border-[#94A3B8] px-1.5 py-0.5 leading-tight">{inc.en}</td>
                      <td className="border border-[#94A3B8] px-1.5 py-0.5 text-right leading-tight" dir="rtl">
                        {inc.ar}
                      </td>
                      <td className="border border-[#94A3B8] px-1.5 py-0.5 text-right leading-tight" dir="rtl">
                        {inc.ku}
                      </td>
                      <td className="border border-[#94A3B8] p-0.5 text-center">
                        {isEdit ? (
                          <input
                            type="text"
                            value={entry.occurrences}
                            onChange={(e) =>
                              handleIncidentChange(inc.id, 'occurrences', e.target.value)
                            }
                            placeholder="0"
                            className="w-full text-center bg-[#F5F6FF] border border-[#C8E5EC] rounded px-1 py-0.5 text-[10px] font-mono font-bold focus:outline-none"
                          />
                        ) : (
                          <span className="font-mono font-bold">{entry.occurrences || ''}</span>
                        )}
                      </td>
                      <td className="border border-[#94A3B8] p-0.5 text-center">
                        {isEdit ? (
                          <input
                            type="text"
                            value={entry.action}
                            onChange={(e) =>
                              handleIncidentChange(inc.id, 'action', e.target.value)
                            }
                            placeholder="Action..."
                            className="w-full bg-[#F5F6FF] border border-[#C8E5EC] rounded px-1 py-0.5 text-[10px] focus:outline-none"
                          />
                        ) : (
                          <span>{entry.action || ''}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Official Principal Signature Footer */}
          <div className="pt-2 text-center border-t border-[#CBD5E1]">
            <span className="block text-[10px] font-bold text-[#6B70A6] uppercase tracking-wider">
              Principal
            </span>
            <span className="block text-sm font-black text-[#1A1D4E]">
              {report.principal || 'Maryam Nizar Mohammed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
