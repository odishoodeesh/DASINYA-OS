/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Official Dasinya Private School Classes Timetable Schedule
 * Source: Official aSc Timetables (Student's Schedule PDF)
 */

export interface PeriodSlot {
  period: number;
  time: string;
  subject: string;
  teacher: string;
}

export interface DayTimetable {
  dayKey: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday';
  dayEn: string;
  periods: PeriodSlot[];
}

export const OFFICIAL_TIMETABLE_PERIODS = [
  { period: 1, time: '8:00 – 8:40', isBreak: false },
  { period: 2, time: '8:50 – 9:30', isBreak: false },
  { period: 0, time: '9:30 – 9:50', isBreak: true, breakType: 'morning' },
  { period: 3, time: '9:50 – 10:30', isBreak: false },
  { period: 4, time: '10:40 – 11:20', isBreak: false },
  { period: 5, time: '11:30 – 12:10', isBreak: false },
  { period: 0, time: '12:10 – 12:30', isBreak: true, breakType: 'lunch' },
  { period: 6, time: '12:30 – 13:10', isBreak: false },
  { period: 7, time: '13:20 – 14:00', isBreak: false },
];

export const CLASS_TIMETABLES: Record<string, DayTimetable[]> = {
  // ================= GRADE 1 =================
  'Grade 1-Class A': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Hlbin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Art', teacher: 'Sipanl' },
        { period: 3, time: '9:50 – 10:30', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Warvin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Deman' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Hlbin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Hba' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Hlbin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Math', teacher: 'Hba' },
        { period: 3, time: '9:50 – 10:30', subject: 'Conversation', teacher: 'Dalin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Art', teacher: 'Sipanl' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Warvin' },
        { period: 6, time: '12:30 – 13:10', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Deman' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Moral Values', teacher: 'Esra' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Deman' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Hba' },
        { period: 4, time: '10:40 – 11:20', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Deman' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Hlbin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Music', teacher: 'Rekar' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Warvin' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Hlbin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Moral Values', teacher: 'Esra' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Deman' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Hba' },
        { period: 6, time: '12:30 – 13:10', subject: 'Science', teacher: 'Warvin' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Hlbin' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 2, time: '8:50 – 9:30', subject: 'Conversation', teacher: 'Dlveen' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Hlbin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Deman' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Hba' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Deman' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Warvin' },
      ]
    }
  ],

  'Grade 1-Class B': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Warvin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Math', teacher: 'Hba' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Hlbin' },
        { period: 4, time: '10:40 – 11:20', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 5, time: '11:30 – 12:10', subject: 'Art', teacher: 'Sipanl' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Deman' },
        { period: 7, time: '13:20 – 14:00', subject: 'Moral Values', teacher: 'Esra' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Deman' },
        { period: 2, time: '8:50 – 9:30', subject: 'Art', teacher: 'Sipanl' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Hlbin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Warvin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Deman' },
        { period: 6, time: '12:30 – 13:10', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Hba' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Deman' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Hlbin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Moral Values', teacher: 'Esra' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Hlbin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Hba' },
        { period: 6, time: '12:30 – 13:10', subject: 'Conversation', teacher: 'Dalin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Warvin' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Conversation', teacher: 'Dlveen' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Deman' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Hlbin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Hba' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Warvin' },
        { period: 6, time: '12:30 – 13:10', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Deman' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Deman' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Warvin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Music', teacher: 'Rekar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Hlbin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Hba' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Hlbin' },
      ]
    }
  ],

  'Grade 1-Class C': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Deman' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Warvin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Hba' },
        { period: 4, time: '10:40 – 11:20', subject: 'Art', teacher: 'Sipanl' },
        { period: 5, time: '11:30 – 12:10', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 6, time: '12:30 – 13:10', subject: 'Moral Values', teacher: 'Esra' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Hlbin' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Conversation', teacher: 'Dlveen' },
        { period: 2, time: '8:50 – 9:30', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 3, time: '9:50 – 10:30', subject: 'Art', teacher: 'Sipanl' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Hlbin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Hba' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Deman' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Warvin' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Hlbin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Warvin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Deman' },
        { period: 4, time: '10:40 – 11:20', subject: 'Conversation', teacher: 'Dalin' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Hlbin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Deman' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Hba' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Hlbin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Deman' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Warvin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Deman' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Hba' },
        { period: 7, time: '13:20 – 14:00', subject: 'Moral Values', teacher: 'Esra' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Hlbin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Math', teacher: 'Hba' },
        { period: 3, time: '9:50 – 10:30', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Hlbin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Warvin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Music', teacher: 'Rekar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Deman' },
      ]
    }
  ],

  // ================= GRADE 2 =================
  'Grade 2-Class A': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Bhar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Math', teacher: 'Fanar' },
        { period: 3, time: '9:50 – 10:30', subject: 'PE', teacher: 'Ahmed' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Ask' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Vazhin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Art', teacher: 'Sipanl' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Ask' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Math', teacher: 'Fanar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Bhar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Ask' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Vazhin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Conversation', teacher: 'Dalin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Moral Values', teacher: 'Esra' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Ask' },
        { period: 2, time: '8:50 – 9:30', subject: 'Conversation', teacher: 'Dlveen' },
        { period: 3, time: '9:50 – 10:30', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Fanar' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Vazhin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Music', teacher: 'Rekar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Bhar' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Math', teacher: 'Fanar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Art', teacher: 'Sipanl' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Bhar' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Vazhin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Ask' },
        { period: 6, time: '12:30 – 13:10', subject: 'Moral Values', teacher: 'Esra' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Vazhin' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Ask' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Vazhin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Bhar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Ask' },
        { period: 5, time: '11:30 – 12:10', subject: 'PE', teacher: 'Ahmed' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Vazhin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Fanar' },
      ]
    }
  ],

  'Grade 2-Class B': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'PE', teacher: 'Ahmed' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Vazhin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Ask' },
        { period: 4, time: '10:40 – 11:20', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Bhar' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Vazhin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Fanar' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Moral Values', teacher: 'Esra' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Vazhin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Fanar' },
        { period: 4, time: '10:40 – 11:20', subject: 'PE', teacher: 'Ahmed' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Ask' },
        { period: 6, time: '12:30 – 13:10', subject: 'Science', teacher: 'Bhar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Ask' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Conversation', teacher: 'Dlveen' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Ask' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Bhar' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Vazhin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Art', teacher: 'Sipanl' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Fanar' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Vazhin' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Vazhin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Ask' },
        { period: 3, time: '9:50 – 10:30', subject: 'Art', teacher: 'Sipanl' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Ask' },
        { period: 5, time: '11:30 – 12:10', subject: 'Music', teacher: 'Rekar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Fanar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Bhar' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Vazhin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 3, time: '9:50 – 10:30', subject: 'Moral Values', teacher: 'Esra' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Fanar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Bhar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Ask' },
        { period: 7, time: '13:20 – 14:00', subject: 'Conversation', teacher: 'Dalin' },
      ]
    }
  ],

  'Grade 2-Class C': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Conversation', teacher: 'Dlveen' },
        { period: 2, time: '8:50 – 9:30', subject: 'Moral Values', teacher: 'Esra' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Bhar' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Vazhin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Ask' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Fanar' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Vazhin' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Vazhin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Music', teacher: 'Rekar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Ask' },
        { period: 4, time: '10:40 – 11:20', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 5, time: '11:30 – 12:10', subject: 'Art', teacher: 'Sipanl' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Fanar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Bhar' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Math', teacher: 'Fanar' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Vazhin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Ask' },
        { period: 4, time: '10:40 – 11:20', subject: 'PE', teacher: 'Ahmed' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Ask' },
        { period: 6, time: '12:30 – 13:10', subject: 'Science', teacher: 'Bhar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Moral Values', teacher: 'Esra' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Bhar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Math', teacher: 'Fanar' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Vazhin' },
        { period: 4, time: '10:40 – 11:20', subject: 'PE', teacher: 'Ahmed' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Vazhin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Ask' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Ask' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Math', teacher: 'Fanar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Conversation', teacher: 'Dalin' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Vazhin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Bhar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Ask' },
        { period: 6, time: '12:30 – 13:10', subject: 'Art', teacher: 'Sipanl' },
        { period: 7, time: '13:20 – 14:00', subject: 'Religion', teacher: 'Payam Shaban' },
      ]
    }
  ],

  // ================= GRADE 3 =================
  'Grade 3-Class A': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Conversation', teacher: 'Dlveen' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Warvin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Hba' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Halz' },
        { period: 6, time: '12:30 – 13:10', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Dalin' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Dalin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Warvin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Music', teacher: 'Rekar' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Dalin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Halz' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Hba' },
        { period: 7, time: '13:20 – 14:00', subject: 'Religion', teacher: 'Payam Shaban' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Dalin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Halz' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Warvin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Hba' },
        { period: 5, time: '11:30 – 12:10', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 6, time: '12:30 – 13:10', subject: 'Art', teacher: 'Sipanl' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Halz' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Math', teacher: 'Hba' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Halz' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Warvin' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Dalin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Art', teacher: 'Sipanl' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Halz' },
        { period: 7, time: '13:20 – 14:00', subject: 'Conversation', teacher: 'Dalin' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Dalin' },
        { period: 2, time: '8:50 – 9:30', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Warvin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Halz' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Dalin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Hba' },
      ]
    }
  ],

  'Grade 3-Class B': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Dalin' },
        { period: 3, time: '9:50 – 10:30', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 4, time: '10:40 – 11:20', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Hba' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Dalin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Bhar' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 2, time: '8:50 – 9:30', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Hba' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Bhar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 7, time: '13:20 – 14:00', subject: 'Art', teacher: 'Sipanl' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Math', teacher: 'Hba' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Dalin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Art', teacher: 'Sipanl' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Bhar' },
        { period: 6, time: '12:30 – 13:10', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Dalin' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Dalin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Conversation', teacher: 'Dalin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Bhar' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Dalin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Hba' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Conversation', teacher: 'Dlveen' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Hba' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Dalin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Music', teacher: 'Rekar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Science', teacher: 'Bhar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Derin Salih' },
      ]
    }
  ],

  'Grade 3-Class E': [
    // Follows Grade 3 Class B curriculum
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Dalin' },
        { period: 3, time: '9:50 – 10:30', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 4, time: '10:40 – 11:20', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Hba' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Dalin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Bhar' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 2, time: '8:50 – 9:30', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Hba' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Bhar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 7, time: '13:20 – 14:00', subject: 'Art', teacher: 'Sipanl' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Math', teacher: 'Hba' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Dalin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Art', teacher: 'Sipanl' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Bhar' },
        { period: 6, time: '12:30 – 13:10', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Dalin' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Dalin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Conversation', teacher: 'Dalin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Bhar' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Dalin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Hba' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Conversation', teacher: 'Dlveen' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Hba' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Dalin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Music', teacher: 'Rekar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Science', teacher: 'Bhar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Derin Salih' },
      ]
    }
  ],

  // ================= GRADE 4 =================
  'Grade 4-Class A': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Social Studies', teacher: 'Esra' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Aza' },
        { period: 3, time: '9:50 – 10:30', subject: 'Arabic', teacher: 'Manar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Fanar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Art', teacher: 'Saman' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Halz' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Larsa' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Aza' },
        { period: 2, time: '8:50 – 9:30', subject: 'PE', teacher: 'Ahmed' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Halz' },
        { period: 4, time: '10:40 – 11:20', subject: 'Arabic', teacher: 'Manar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Larsa' },
        { period: 6, time: '12:30 – 13:10', subject: 'Social Studies', teacher: 'Esra' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Fanar' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'PE', teacher: 'Ahmed' },
        { period: 2, time: '8:50 – 9:30', subject: 'Social Studies', teacher: 'Esra' },
        { period: 3, time: '9:50 – 10:30', subject: 'Music', teacher: 'Rekar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Larsa' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Fanar' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Aza' },
        { period: 7, time: '13:20 – 14:00', subject: 'Arabic', teacher: 'Manar' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Aza' },
        { period: 3, time: '9:50 – 10:30', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Fanar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Larsa' },
        { period: 6, time: '12:30 – 13:10', subject: 'Art', teacher: 'Saman' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Halz' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Arabic', teacher: 'Manar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Halz' },
        { period: 3, time: '9:50 – 10:30', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Larsa' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Fanar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Aza' },
      ]
    }
  ],

  'Grade 4-Class B': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Halz' },
        { period: 2, time: '8:50 – 9:30', subject: 'PE', teacher: 'Ahmed' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Fanar' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Aza' },
        { period: 5, time: '11:30 – 12:10', subject: 'Social Studies', teacher: 'Esra' },
        { period: 6, time: '12:30 – 13:10', subject: 'Science', teacher: 'Larsa' },
        { period: 7, time: '13:20 – 14:00', subject: 'Religion', teacher: 'Payam Shaban' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Music', teacher: 'Rekar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Larsa' },
        { period: 3, time: '9:50 – 10:30', subject: 'Arabic', teacher: 'Manar' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Aza' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Fanar' },
        { period: 6, time: '12:30 – 13:10', subject: 'PE', teacher: 'Ahmed' },
        { period: 7, time: '13:20 – 14:00', subject: 'Moral Values', teacher: 'Sizar' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Larsa' },
        { period: 2, time: '8:50 – 9:30', subject: 'Arabic', teacher: 'Manar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Fanar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Art', teacher: 'Saman' },
        { period: 5, time: '11:30 – 12:10', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Halz' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Aza' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Larsa' },
        { period: 2, time: '8:50 – 9:30', subject: 'Social Studies', teacher: 'Esra' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Aza' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Halz' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Fanar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Arabic', teacher: 'Manar' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Art', teacher: 'Saman' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Larsa' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Aza' },
        { period: 4, time: '10:40 – 11:20', subject: 'Social Studies', teacher: 'Esra' },
        { period: 5, time: '11:30 – 12:10', subject: 'Arabic', teacher: 'Manar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Fanar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Halz' },
      ]
    }
  ],

  // ================= GRADE 5 =================
  'Grade 5-Class A': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Larsa' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Halz' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Aza' },
        { period: 4, time: '10:40 – 11:20', subject: 'Art', teacher: 'Saman' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Zhin' },
        { period: 6, time: '12:30 – 13:10', subject: 'PE', teacher: 'Ahmed' },
        { period: 7, time: '13:20 – 14:00', subject: 'Social Studies', teacher: 'Sharmin' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Halz' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Aza' },
        { period: 3, time: '9:50 – 10:30', subject: 'Art', teacher: 'Saman' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Zhin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Arabic', teacher: 'Manar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Larsa' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Aza' },
        { period: 2, time: '8:50 – 9:30', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Arabic', teacher: 'Manar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Halz' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Zhin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Science', teacher: 'Larsa' },
        { period: 7, time: '13:20 – 14:00', subject: 'Moral Values', teacher: 'Sizar' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Arabic', teacher: 'Manar' },
        { period: 3, time: '9:50 – 10:30', subject: 'PE', teacher: 'Ahmed' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Zhin' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Aza' },
        { period: 6, time: '12:30 – 13:10', subject: 'Science', teacher: 'Larsa' },
        { period: 7, time: '13:20 – 14:00', subject: 'Religion', teacher: 'Payam Shaban' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Larsa' },
        { period: 2, time: '8:50 – 9:30', subject: 'Music', teacher: 'Rekar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Aza' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Halz' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Zhin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Arabic', teacher: 'Manar' },
      ]
    }
  ],

  'Grade 5-Class B': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Arabic', teacher: 'Manar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Art', teacher: 'Saman' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Zhin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Larsa' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Aza' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Halz' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Larsa' },
        { period: 2, time: '8:50 – 9:30', subject: 'Math', teacher: 'Zhin' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Aza' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Halz' },
        { period: 5, time: '11:30 – 12:10', subject: 'Music', teacher: 'Rekar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Arabic', teacher: 'Manar' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Math', teacher: 'Zhin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Larsa' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Halz' },
        { period: 4, time: '10:40 – 11:20', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Aza' },
        { period: 6, time: '12:30 – 13:10', subject: 'Arabic', teacher: 'Manar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Religion', teacher: 'Payam Shaban' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Aza' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Larsa' },
        { period: 3, time: '9:50 – 10:30', subject: 'Arabic', teacher: 'Manar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Religion', teacher: 'Payam Shaban' },
        { period: 5, time: '11:30 – 12:10', subject: 'PE', teacher: 'Ahmed' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Zhin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Social Studies', teacher: 'Sharmin' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Halz' },
        { period: 2, time: '8:50 – 9:30', subject: 'English', teacher: 'Aza' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Zhin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Art', teacher: 'Saman' },
        { period: 5, time: '11:30 – 12:10', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 6, time: '12:30 – 13:10', subject: 'PE', teacher: 'Ahmed' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Larsa' },
      ]
    }
  ],

  // ================= GRADE 6 =================
  'Grade 6-Class A': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Math', teacher: 'Zhin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Religion', teacher: 'Samah' },
        { period: 3, time: '9:50 – 10:30', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Hakar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Music', teacher: 'Rekar' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 7, time: '13:20 – 14:00', subject: 'Arabic', teacher: 'Manar' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Math', teacher: 'Zhin' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Hakar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Art', teacher: 'Saman' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 7, time: '13:20 – 14:00', subject: 'Religion', teacher: 'Samah' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 2, time: '8:50 – 9:30', subject: 'PE', teacher: 'Ahmed' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 4, time: '10:40 – 11:20', subject: 'Arabic', teacher: 'Manar' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 6, time: '12:30 – 13:10', subject: 'Science', teacher: 'Hakar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Zhin' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 2, time: '8:50 – 9:30', subject: 'Math', teacher: 'Zhin' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Hakar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Art', teacher: 'Saman' },
        { period: 6, time: '12:30 – 13:10', subject: 'Arabic', teacher: 'Manar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Moral Values', teacher: 'Sizar' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Hakar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Math', teacher: 'Zhin' },
        { period: 3, time: '9:50 – 10:30', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 4, time: '10:40 – 11:20', subject: 'PE', teacher: 'Ahmed' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 6, time: '12:30 – 13:10', subject: 'Arabic', teacher: 'Manar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Social Studies', teacher: 'Sharmin' },
      ]
    }
  ],

  // ================= GRADE 7 =================
  'Grade 7-Class A': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Hakar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Zhin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Religion', teacher: 'Samah' },
        { period: 5, time: '11:30 – 12:10', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Arabic', teacher: 'Samah' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Derin Salih' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Arabic', teacher: 'Samah' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Hakar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 5, time: '11:30 – 12:10', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 6, time: '12:30 – 13:10', subject: 'IT', teacher: 'Arin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Zhin' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Hakar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Arabic', teacher: 'Samah' },
        { period: 3, time: '9:50 – 10:30', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Zhin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Art', teacher: 'Saman' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Shams Al-Din' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 2, time: '8:50 – 9:30', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Zhin' },
        { period: 4, time: '10:40 – 11:20', subject: 'IT', teacher: 'Arin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Hakar' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 2, time: '8:50 – 9:30', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Art', teacher: 'Saman' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Hakar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Zhin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 7, time: '13:20 – 14:00', subject: 'Arabic', teacher: 'Samah' },
      ]
    }
  ],

  'Grade 7-Class B': [
    // Same curriculum distribution as 7 A
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Hakar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Zhin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Religion', teacher: 'Samah' },
        { period: 5, time: '11:30 – 12:10', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Arabic', teacher: 'Samah' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Derin Salih' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Arabic', teacher: 'Samah' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Hakar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 5, time: '11:30 – 12:10', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 6, time: '12:30 – 13:10', subject: 'IT', teacher: 'Arin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Math', teacher: 'Zhin' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Hakar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Arabic', teacher: 'Samah' },
        { period: 3, time: '9:50 – 10:30', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Zhin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Art', teacher: 'Saman' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Shams Al-Din' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 2, time: '8:50 – 9:30', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Zhin' },
        { period: 4, time: '10:40 – 11:20', subject: 'IT', teacher: 'Arin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 7, time: '13:20 – 14:00', subject: 'Science', teacher: 'Hakar' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 2, time: '8:50 – 9:30', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Art', teacher: 'Saman' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Hakar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Zhin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 7, time: '13:20 – 14:00', subject: 'Arabic', teacher: 'Samah' },
      ]
    }
  ],

  // ================= GRADE 8 =================
  'Grade 8-Class A': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Arabic', teacher: 'Samah' },
        { period: 2, time: '8:50 – 9:30', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Hakar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Zhin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Moral Values', teacher: 'Sizar' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 2, time: '8:50 – 9:30', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Zhin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Hakar' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 6, time: '12:30 – 13:10', subject: 'Art', teacher: 'Saman' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Derin Salih' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Arabic', teacher: 'Samah' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Hakar' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 5, time: '11:30 – 12:10', subject: 'IT', teacher: 'Arin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Zhin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Social Studies', teacher: 'Sharmin' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Hakar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Arabic', teacher: 'Samah' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Zhin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 7, time: '13:20 – 14:00', subject: 'Religion', teacher: 'Samah' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Arabic', teacher: 'Samah' },
        { period: 2, time: '8:50 – 9:30', subject: 'Art', teacher: 'Saman' },
        { period: 3, time: '9:50 – 10:30', subject: 'IT', teacher: 'Arin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Zhin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Hakar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Shams Al-Din' },
      ]
    }
  ],

  'Grade 8-Class C': [
    // Same curriculum distribution as 8 A
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Arabic', teacher: 'Samah' },
        { period: 2, time: '8:50 – 9:30', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 3, time: '9:50 – 10:30', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Hakar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Zhin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Moral Values', teacher: 'Sizar' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 2, time: '8:50 – 9:30', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Zhin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Science', teacher: 'Hakar' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 6, time: '12:30 – 13:10', subject: 'Art', teacher: 'Saman' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Derin Salih' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Arabic', teacher: 'Samah' },
        { period: 2, time: '8:50 – 9:30', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 3, time: '9:50 – 10:30', subject: 'Science', teacher: 'Hakar' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 5, time: '11:30 – 12:10', subject: 'IT', teacher: 'Arin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Zhin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Social Studies', teacher: 'Sharmin' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Hakar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Arabic', teacher: 'Samah' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 5, time: '11:30 – 12:10', subject: 'Math', teacher: 'Zhin' },
        { period: 6, time: '12:30 – 13:10', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 7, time: '13:20 – 14:00', subject: 'Religion', teacher: 'Samah' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Arabic', teacher: 'Samah' },
        { period: 2, time: '8:50 – 9:30', subject: 'Art', teacher: 'Saman' },
        { period: 3, time: '9:50 – 10:30', subject: 'IT', teacher: 'Arin' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Zhin' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Hakar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Shams Al-Din' },
      ]
    }
  ],

  // ================= GRADE 9 =================
  'Grade 9-Class A': [
    {
      dayKey: 'sunday',
      dayEn: 'Sunday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Math', teacher: 'Hakar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Art', teacher: 'Saman' },
        { period: 3, time: '9:50 – 10:30', subject: 'Moral Values', teacher: 'Sizar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 5, time: '11:30 – 12:10', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 6, time: '12:30 – 13:10', subject: 'Science', teacher: 'Hakar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Arabic', teacher: 'Samah' },
      ]
    },
    {
      dayKey: 'monday',
      dayEn: 'Monday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Science', teacher: 'Hakar' },
        { period: 2, time: '8:50 – 9:30', subject: 'Arabic', teacher: 'Samah' },
        { period: 3, time: '9:50 – 10:30', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 4, time: '10:40 – 11:20', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Hakar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Hakar' },
        { period: 7, time: '13:20 – 14:00', subject: 'English', teacher: 'Shams Al-Din' },
      ]
    },
    {
      dayKey: 'tuesday',
      dayEn: 'Tuesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Hakar' },
        { period: 3, time: '9:50 – 10:30', subject: 'PE', teacher: 'Payam Hussein' },
        { period: 4, time: '10:40 – 11:20', subject: 'Math', teacher: 'Hakar' },
        { period: 5, time: '11:30 – 12:10', subject: 'Arabic', teacher: 'Samah' },
        { period: 6, time: '12:30 – 13:10', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 7, time: '13:20 – 14:00', subject: 'Religion', teacher: 'Samah' },
      ]
    },
    {
      dayKey: 'wednesday',
      dayEn: 'Wednesday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 2, time: '8:50 – 9:30', subject: 'Arabic', teacher: 'Samah' },
        { period: 3, time: '9:50 – 10:30', subject: 'Math', teacher: 'Hakar' },
        { period: 4, time: '10:40 – 11:20', subject: 'Art', teacher: 'Saman' },
        { period: 5, time: '11:30 – 12:10', subject: 'Science', teacher: 'Hakar' },
        { period: 6, time: '12:30 – 13:10', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 7, time: '13:20 – 14:00', subject: 'Kurdish', teacher: 'Derin Salih' },
      ]
    },
    {
      dayKey: 'thursday',
      dayEn: 'Thursday',
      periods: [
        { period: 1, time: '8:00 – 8:40', subject: 'Kurdish', teacher: 'Derin Salih' },
        { period: 2, time: '8:50 – 9:30', subject: 'Science', teacher: 'Hakar' },
        { period: 3, time: '9:50 – 10:30', subject: 'Social Studies', teacher: 'Sharmin' },
        { period: 4, time: '10:40 – 11:20', subject: 'English', teacher: 'Shams Al-Din' },
        { period: 5, time: '11:30 – 12:10', subject: 'Religion', teacher: 'Samah' },
        { period: 6, time: '12:30 – 13:10', subject: 'Math', teacher: 'Hakar' },
        { period: 7, time: '13:20 – 14:00', subject: 'Moral Values', teacher: 'Sizar' },
      ]
    }
  ]
};

/**
 * Helper to fetch the official class timetable for a given grade and section.
 * Falls back to 1A if not found.
 */
export function getClassTimetable(grade: string, section: string): DayTimetable[] {
  const key = `${grade}-${section}`;
  if (CLASS_TIMETABLES[key]) {
    return CLASS_TIMETABLES[key];
  }
  // Try fallback by grade
  const altKey = `${grade}-Class A`;
  if (CLASS_TIMETABLES[altKey]) {
    return CLASS_TIMETABLES[altKey];
  }
  return CLASS_TIMETABLES['Grade 1-Class A'];
}
