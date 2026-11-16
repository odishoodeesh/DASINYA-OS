/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Official Exam Schedule Data
 * Transcribed verbatim from Dasinya_Second_Examination_Timetable_Editable_Table_788e7116.pdf
 */

export type ExamGradeKey =
  | 'Grade 1'
  | 'Grade 2'
  | 'Grade 3'
  | 'Grade 4'
  | 'Grade 5'
  | 'Grade 6'
  | 'Grade 7'
  | 'Grade 8'
  | 'Grade 9';

export const EXAM_GRADE_KEYS: ExamGradeKey[] = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
];

export interface ExamScheduleRow {
  id: string;
  date: string;
  dayEn: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday';
  dayKu: string;
  dayAr: string;
  subjectsByGrade: Record<ExamGradeKey, string>;
}

export const EXAM_SCHEDULE_META = {
  schoolNameEn: 'DASINYA PRIVATE BASIC ENGLISH SCHOOL',
  schoolNameKu: 'قوتابخانەیا داسنیا یا تایبەت یا بنەڕەتی یا ئینگلیزی',
  schoolNameAr: 'مدرسة داسنيا الأهلية الأساسية الإنجليزية',
  titleEn: 'Second Examination Timetable (20% / 25%)',
  titleKu: 'خشتەیێ ئەزموونێن دووەم (٢٠٪ / ٢٥٪)',
  titleAr: 'جدول الامتحان الثاني (٢٠٪ / ٢٥٪)',
  academicYear: '2026–2027',
  startsOnEn: 'Exams start on Wednesday 18/11/2026',
  startsOnKu: 'تاقیکردنەوە ل رۆژا چوارشەمبی ١٨/١١/٢٠٢٦ دەستپێدکەن',
  startsOnAr: 'تبدأ الامتحانات يوم الأربعاء ١٨/١١/٢٠٢٦',
  principalName: 'Maryam Nizar Mohammed',
  principalTitleEn: 'School Principal',
  principalTitleKu: 'رێڤەبەرا قوتابخانێ',
  principalTitleAr: 'مديرة المدرسة',
  officialPdfUrl: '/assets/aistudio/Dasinya_Second_Examination_Timetable_Editable_Table_788e7116.pdf',
  notesEn: [
    'Students must bring all exam supplies (Pencils, Pen (Blue Ink), Ruler, Eraser).',
    'If there is a holiday, the exam will be postponed to the next day.',
  ],
  notesKu: [
    'قوتابی دڤێت هەمی پێداویستیێن ئەزموونێ دگەل خۆ بینن (پێنوسێ رەساس، قەلەمێ حبرێ شین، راستە، مەساحە).',
    'ئەگەر رۆژەکا بێهنڤەدانێ هەبیت، ئەزموونا وێ رۆژێ دێ بۆ رۆژا پاشتر هێتە پاشخستن.',
  ],
  notesAr: [
    'يجب على الطلاب إحضار جميع مستلزمات الامتحان (أقلام رصاص، قلم حبر أزرق، مسطرة، ممحاة).',
    'في حال وجود عطلة رسمية، يؤجل امتحان ذلك اليوم إلى اليوم التالي.',
  ],
} as const;

export const OFFICIAL_SEMESTER_ONE_SECOND_EXAMS: ExamScheduleRow[] = [
  {
    id: 'exam-2026-11-18',
    date: '2026-11-18',
    dayEn: 'Wednesday',
    dayKu: 'چوار شەمبی',
    dayAr: 'الأربعاء',
    subjectsByGrade: {
      'Grade 1': 'Math',
      'Grade 2': 'Science',
      'Grade 3': 'Science',
      'Grade 4': 'Math',
      'Grade 5': 'Math',
      'Grade 6': 'Science',
      'Grade 7': 'Social Studies',
      'Grade 8': 'Science',
      'Grade 9': 'Math',
    },
  },
  {
    id: 'exam-2026-11-19',
    date: '2026-11-19',
    dayEn: 'Thursday',
    dayKu: 'پێنج شەمبی',
    dayAr: 'الخميس',
    subjectsByGrade: {
      'Grade 1': 'P.E.',
      'Grade 2': 'Art',
      'Grade 3': 'Moral V.',
      'Grade 4': 'Moral V. / P.E.',
      'Grade 5': 'Religion / P.E.',
      'Grade 6': 'Arabic',
      'Grade 7': 'Kurdish',
      'Grade 8': 'English',
      'Grade 9': 'Kurdish',
    },
  },
  {
    id: 'exam-2026-11-22',
    date: '2026-11-22',
    dayEn: 'Sunday',
    dayKu: 'ئێک شەمبی',
    dayAr: 'الأحد',
    subjectsByGrade: {
      'Grade 1': 'Science',
      'Grade 2': 'Math',
      'Grade 3': 'Math',
      'Grade 4': 'Science',
      'Grade 5': 'Science',
      'Grade 6': 'Math',
      'Grade 7': 'Science / P.E.',
      'Grade 8': 'Social Studies / Art',
      'Grade 9': 'Science',
    },
  },
  {
    id: 'exam-2026-11-23',
    date: '2026-11-23',
    dayEn: 'Monday',
    dayKu: 'دوو شەمبی',
    dayAr: 'الإثنين',
    subjectsByGrade: {
      'Grade 1': 'English',
      'Grade 2': 'Religion',
      'Grade 3': 'Art',
      'Grade 4': 'Kurdish',
      'Grade 5': 'Kurdish',
      'Grade 6': 'English',
      'Grade 7': 'English',
      'Grade 8': 'Kurdish',
      'Grade 9': 'Moral V. / Art',
    },
  },
  {
    id: 'exam-2026-11-24',
    date: '2026-11-24',
    dayEn: 'Tuesday',
    dayKu: 'سێ شەمبی',
    dayAr: 'الثلاثاء',
    subjectsByGrade: {
      'Grade 1': 'Religion',
      'Grade 2': 'Kurdish',
      'Grade 3': 'Religion',
      'Grade 4': 'Religion / Art',
      'Grade 5': 'Moral V. / Art',
      'Grade 6': 'Religion / P.E.',
      'Grade 7': 'I.T. / Art',
      'Grade 8': 'Psychology / Moral V.',
      'Grade 9': 'Arabic',
    },
  },
  {
    id: 'exam-2026-11-25',
    date: '2026-11-25',
    dayEn: 'Wednesday',
    dayKu: 'چوار شەمبی',
    dayAr: 'الأربعاء',
    subjectsByGrade: {
      'Grade 1': 'Art',
      'Grade 2': 'P.E.',
      'Grade 3': 'P.E.',
      'Grade 4': 'English',
      'Grade 5': 'English',
      'Grade 6': 'Kurdish',
      'Grade 7': 'Arabic',
      'Grade 8': 'Arabic',
      'Grade 9': 'Religion / P.E.',
    },
  },
  {
    id: 'exam-2026-11-26',
    date: '2026-11-26',
    dayEn: 'Thursday',
    dayKu: 'پێنج شەمبی',
    dayAr: 'الخميس',
    subjectsByGrade: {
      'Grade 1': 'Moral V.',
      'Grade 2': 'English',
      'Grade 3': 'Kurdish',
      'Grade 4': 'Social Studies',
      'Grade 5': 'Arabic',
      'Grade 6': 'Moral V. / Art',
      'Grade 7': 'Religion / Moral V.',
      'Grade 8': 'I.T. / Religion',
      'Grade 9': 'English',
    },
  },
  {
    id: 'exam-2026-11-29',
    date: '2026-11-29',
    dayEn: 'Sunday',
    dayKu: 'ئێک شەمبی',
    dayAr: 'الأحد',
    subjectsByGrade: {
      'Grade 1': 'Kurdish',
      'Grade 2': 'Moral V.',
      'Grade 3': 'English',
      'Grade 4': 'Arabic',
      'Grade 5': 'Social Studies',
      'Grade 6': 'Social Studies',
      'Grade 7': 'Math',
      'Grade 8': 'Math / P.E.',
      'Grade 9': 'Social Studies',
    },
  },
];
