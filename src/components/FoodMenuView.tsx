/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Coffee, Utensils, CalendarDays } from 'lucide-react';
import { FOUR_WEEK_FOOD_MENU, WeekNumber } from '../data/foodMenu';
import { Language } from '../lib/translations';

interface FoodMenuViewProps {
  language: Language;
  title?: string;
  subtitle?: string;
}

export const FoodMenuView: React.FC<FoodMenuViewProps> = ({
  language,
  title,
  subtitle,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<WeekNumber | 'all'>(1);

  const todayKey = (() => {
    const dayIdx = new Date().getDay();
    const map: Record<number, string> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
    };
    return map[dayIdx] || '';
  })();

  const labels = {
    en: {
      defaultTitle: '4-Week Rotating Cafeteria Menu',
      defaultSubtitle: 'Daily Breakfast & Lunch Schedule (Week One – Week Four • Sunday to Thursday)',
      allWeeks: 'All 4 Weeks',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      today: 'Today',
      breakfastOnlyNote: 'Breakfast service only listed for this day',
      cycleBadge: '4-Week Cycle',
    },
    ku: {
      defaultTitle: 'مێنیویا خوارنا قۆتابخانێ یا ٤ حەفتیان',
      defaultSubtitle: 'خشتەیێ رۆژانە یێ تێشت و فراڤینێ (حەفتیا ئێکێ – حەفتیا چوارێ • ئێک شەمبی هەتا پێنج شەمبی)',
      allWeeks: 'هەمی ٤ حەفتی',
      breakfast: 'تێشت (بەیانی)',
      lunch: 'فراڤین (نیڤرۆ)',
      today: 'ئەڤرۆ',
      breakfastOnlyNote: 'بۆ ڤێ رۆژێ بتنێ تێشت هاتیە دیارکرن',
      cycleBadge: 'خشتەیێ ٤ حەفتیان',
    },
    ar: {
      defaultTitle: 'قائمة الطعام المدرسية الدورية (٤ أسابيع)',
      defaultSubtitle: 'جدول الإفطار والغداء اليومي (الأسبوع الأول – الأسبوع الرابع • الأحد إلى الخميس)',
      allWeeks: 'جميع الأسابيع (٤)',
      breakfast: 'الإفطار',
      lunch: 'الغداء',
      today: 'اليوم',
      breakfastOnlyNote: 'وجبة الإفطار فقط مدرجة لهذا اليوم',
      cycleBadge: 'دورة ٤ أسابيع',
    },
  }[language];

  const weeksToRender =
    selectedWeek === 'all'
      ? FOUR_WEEK_FOOD_MENU
      : FOUR_WEEK_FOOD_MENU.filter((w) => w.weekNumber === selectedWeek);

  return (
    <div className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E1E9FF]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00D4AA] to-[#0087A5] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,212,170,0.3)] shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#1A1D4E]">
                {title || labels.defaultTitle}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#E1E9FF] text-[#0087A5]">
                <CalendarDays className="w-3 h-3" />
                {labels.cycleBadge}
              </span>
            </div>
            <p className="text-xs text-[#6B70A6] mt-0.5">{subtitle || labels.defaultSubtitle}</p>
          </div>
        </div>

        {/* Week Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {FOUR_WEEK_FOOD_MENU.map((week) => {
            const weekLabel =
              language === 'ku' ? week.labelKu : language === 'ar' ? week.labelAr : week.labelEn;
            const active = selectedWeek === week.weekNumber;
            return (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(week.weekNumber)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  active
                    ? 'bg-[#0087A5] text-white border-[#0087A5] shadow-xs'
                    : 'bg-[#F5F6FF] text-[#454A87] border-[#E1E9FF] hover:bg-[#E1E9FF]/70 hover:text-[#1A1D4E]'
                }`}
              >
                {weekLabel}
              </button>
            );
          })}
          <button
            onClick={() => setSelectedWeek('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedWeek === 'all'
                ? 'bg-[#1A1D4E] text-white border-[#1A1D4E] shadow-xs'
                : 'bg-white text-[#454A87] border-[#E1E9FF] hover:bg-[#F5F6FF]'
            }`}
          >
            {labels.allWeeks}
          </button>
        </div>
      </div>

      {/* Weeks Grid */}
      <div className="space-y-8">
        {weeksToRender.map((week) => {
          const weekLabel =
            language === 'ku' ? week.labelKu : language === 'ar' ? week.labelAr : week.labelEn;

          return (
            <section key={week.weekNumber} className="space-y-4">
              {selectedWeek === 'all' && (
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#E1E9FF]">
                  <span className="w-7 h-7 rounded-lg bg-[#0087A5] text-white font-mono text-xs font-bold flex items-center justify-center">
                    W{week.weekNumber}
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#1A1D4E] tracking-tight">
                    {weekLabel}
                  </h4>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {week.days.map((item) => {
                  const dayTitle =
                    language === 'ku'
                      ? item.dayTitleKu
                      : language === 'ar'
                      ? item.dayTitleAr
                      : item.dayTitleEn;
                  const breakfastText =
                    language === 'ku'
                      ? item.breakfastKu
                      : language === 'ar'
                      ? item.breakfastAr
                      : item.breakfastEn;
                  const lunchText =
                    language === 'ku'
                      ? item.lunchKu
                      : language === 'ar'
                      ? item.lunchAr
                      : item.lunchEn;
                  const isToday = item.dayKey === todayKey;

                  return (
                    <div
                      key={`${week.weekNumber}-${item.dayKey}`}
                      className={`border rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between gap-3.5 ${
                        isToday
                          ? 'border-[#0087A5] bg-[#F5FAFC] shadow-[0_6px_18px_rgba(0,135,165,0.08)]'
                          : 'border-[#E1E9FF] bg-[#F5F6FF]/40 hover:bg-white hover:border-[#0087A5]/60 hover:shadow-[0_4px_16px_rgba(0,135,165,0.06)]'
                      }`}
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E1E9FF]/80">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-[#1A1D4E] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            0{item.dayNumber}
                          </span>
                          <span className="font-bold text-[#1A1D4E] text-sm sm:text-base">
                            {dayTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isToday && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0087A5] text-white px-2.5 py-0.5 rounded-md">
                              {labels.today}
                            </span>
                          )}
                          <span className="text-[10px] font-mono font-bold bg-[#E1E9FF] text-[#454A87] px-2.5 py-0.5 rounded-md">
                            {weekLabel}
                          </span>
                        </div>
                      </div>

                      {/* Meals: Breakfast & Lunch */}
                      <div className="space-y-3">
                        {/* Breakfast */}
                        <div className="rounded-xl bg-amber-50/70 border border-amber-200/70 p-3.5">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                              <Coffee className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
                              {labels.breakfast}
                            </span>
                          </div>
                          <p className="text-xs sm:text-[13px] leading-relaxed font-medium text-[#1A1D4E]">
                            {breakfastText}
                          </p>
                        </div>

                        {/* Lunch */}
                        {lunchText ? (
                          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/70 p-3.5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="w-6 h-6 rounded-lg bg-[#00A887] text-white flex items-center justify-center shrink-0">
                                <Utensils className="w-3.5 h-3.5" />
                              </span>
                              <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-900">
                                {labels.lunch}
                              </span>
                            </div>
                            <p className="text-xs sm:text-[13px] leading-relaxed font-medium text-[#1A1D4E]">
                              {lunchText}
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-xl bg-[#F5F6FF] border border-dashed border-[#D3DBFF] px-3.5 py-2.5 text-[11px] font-medium text-[#6B70A6]">
                            {labels.breakfastOnlyNote}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
