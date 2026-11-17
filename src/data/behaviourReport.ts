/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Official Monthly Behaviour Report schema & trilingual template
 * Derived from Behaviour_Report_A4_5e6320ed.pdf
 */

export interface TrilingualText {
  en: string;
  ar: string;
  ku: string;
}

export interface BehaviourMonthOption {
  key: string;
  labelEn: string;
  labelAr: string;
  labelKu: string;
}

export const BEHAVIOUR_MONTHS: BehaviourMonthOption[] = [
  { key: '2026-09', labelEn: 'September 2026', labelAr: 'أيلول ٢٠٢٦', labelKu: 'ئەیلول ٢٠٢٦' },
  { key: '2026-10', labelEn: 'October 2026', labelAr: 'تشرين الأول ٢٠٢٦', labelKu: 'تشرینا ئێکێ ٢٠٢٦' },
  { key: '2026-11', labelEn: 'November 2026', labelAr: 'تشرين الثاني ٢٠٢٦', labelKu: 'تشرینا دووێ ٢٠٢٦' },
  { key: '2026-12', labelEn: 'December 2026', labelAr: 'كانون الأول ٢٠٢٦', labelKu: 'کانوونا ئێکێ ٢٠٢٦' },
  { key: '2027-01', labelEn: 'January 2027', labelAr: 'كانون الثاني ٢٠٢٧', labelKu: 'کانوونا دووێ ٢٠٢٧' },
  { key: '2027-02', labelEn: 'February 2027', labelAr: 'شباط ٢٠٢٧', labelKu: 'شوبات ٢٠٢٧' },
  { key: '2027-03', labelEn: 'March 2027', labelAr: 'آذار ٢٠٢٧', labelKu: 'ئادار ٢٠٢٧' },
  { key: '2027-04', labelEn: 'April 2027', labelAr: 'نيسان ٢٠٢٧', labelKu: 'نیسان ٢٠٢٧' },
  { key: '2027-05', labelEn: 'May 2027', labelAr: 'أيار ٢٠٢٧', labelKu: 'گولان ٢٠٢٧' },
  { key: '2027-06', labelEn: 'June 2027', labelAr: 'حزيران ٢٠٢٧', labelKu: 'حوزەیران ٢٠٢٧' },
];

export function getDefaultBehaviourMonthKey(): string {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const found = BEHAVIOUR_MONTHS.find((m) => m.key === ym);
  return found ? found.key : '2026-11';
}

export interface BehaviourCriteriaItem {
  id: string;
  en: string;
  ar: string;
  ku: string;
}

export interface BehaviourRubricSection {
  id: string;
  column: 'left' | 'right_top';
  groupHeader?: TrilingualText;
  title: TrilingualText;
  items: BehaviourCriteriaItem[];
}

export const BEHAVIOUR_RUBRIC_SECTIONS: BehaviourRubricSection[] = [
  {
    id: 'learner',
    column: 'left',
    title: {
      en: 'Your child as a learner',
      ar: 'طفلك كمتعلّم',
      ku: 'زاروکێ هەوە وەک فێرخواز',
    },
    items: [
      { id: 'learner_interested', en: 'Interested in learning', ar: 'يهتم بالتعلم', ku: 'حەز ژ فێربوونێ دکەت' },
      { id: 'learner_listens', en: 'Listens attentively', ar: 'يستمع باهتمام', ku: 'ب ئاگەهداری گوهداریێ دکەت' },
      { id: 'learner_independently', en: 'Works well independently', ar: 'يعمل بشكل جيد باستقلالية', ku: 'ب شێوەیەکێ باش ب تنێ کار دکەت' },
      { id: 'learner_with_others', en: 'Works well with other children', ar: 'يعمل جيداً مع الأطفال الآخرين', ku: 'ب باشی دگەل زاروکێن دی کار دکەت' },
      { id: 'learner_keeps_trying', en: 'Keeps trying even when tasks are difficult', ar: 'يواصل المحاولة حتى عندما تكون المهام صعبة', ku: 'ئەگەر ئەرک زەحمەت بن ژی هەر هەول ددەت' },
      { id: 'learner_homework', en: 'Homework is of high quality', ar: 'واجباته المنزلية ذات جودة عالية', ku: 'ئەرکێن ماڵێ یێن وی ب کوالیتیەکا بلند نە' },
      { id: 'learner_presents', en: 'Presents work carefully', ar: 'يقدم عمله بعناية', ku: 'کارێ خۆ ب وردی پێشکێش دکەت' },
    ],
  },
  {
    id: 'social',
    column: 'left',
    title: {
      en: "Your child's social and personal development",
      ar: 'النمو الاجتماعي والشخصي لطفلك',
      ku: 'گەشەکرنا جڤاکی و کەسی یا زاروکێ هەوە',
    },
    items: [
      { id: 'social_happy', en: 'Happy at school', ar: 'سعيد في المدرسة', ku: 'د قوتابخانێدا یێ دلخۆشە' },
      { id: 'social_behaves_class', en: 'Behaves well in class', ar: 'يتصرف بشكل جيد في الصف', ku: 'د پۆلێدا ڕەوشتێ وی یێ باشە' },
      { id: 'social_mixes', en: 'Mixes well with other children', ar: 'يختلط جيداً بالأطفال الآخرين', ku: 'ب باشی دگەل زاروکێن دی تێکەل دبیت' },
      { id: 'social_sensitive', en: "Sensitive to others' feelings", ar: 'حساس لمشاعر الآخرين', ku: 'هەستیارە بۆ هەستێن یێن دی' },
      { id: 'social_playground', en: 'Behaves well in the playground', ar: 'يتصرف بشكل جيد في الملعب', ku: 'د یاریگەهێدا ڕەوشتێ وی یێ باشە' },
      { id: 'social_feelings', en: 'Manages and expresses own feelings well', ar: 'يدير مشاعره ويعبر عنها جيداً', ku: 'هەستێن خۆ ب باشی ڕێڤە دبەت و دەردبڕیت' },
    ],
  },
  {
    id: 'teamwork',
    column: 'left',
    title: {
      en: 'Cooperation and teamwork',
      ar: 'التعاون والعمل الجماعي',
      ku: 'هەڤکاری و کارێ گرووپی',
    },
    items: [
      { id: 'team_shares', en: 'Shares materials and toys', ar: 'يشارك الأدوات والألعاب', ku: 'ئامێر و یاریێن خۆ دگەل یێن دی دابەش دکەت' },
      { id: 'team_group', en: 'Takes part in group activities', ar: 'يشارك في الأنشطة الجماعية', ku: 'د چالاکیێن گرووپیدا بەشداری دکەت' },
      { id: 'team_helps', en: 'Helps classmates', ar: 'يساعد زملاءه', ku: 'هاریکاریا هەڤپۆلێن خۆ دکەت' },
    ],
  },
  {
    id: 'technology',
    column: 'left',
    title: {
      en: 'Use of technology (IT and AI lessons)',
      ar: 'استخدام التكنولوجيا (دروس تقنية المعلومات والذكاء الاصطناعي)',
      ku: 'بکارئینانا تەکنەلۆجیایێ (وانەیێن IT و AI)',
    },
    items: [
      { id: 'tech_handles', en: 'Handles devices carefully', ar: 'يتعامل مع الأجهزة بحذر', ku: 'دگەل ئامیران ب ئاگەهداری هەلس و کەفت دکەت' },
      { id: 'tech_rules', en: 'Follows rules for using devices', ar: 'يتبع قواعد استخدام الأجهزة', ku: 'ڕێنمایێن بکارئینانا ئامیران ب جە دئینیت' },
      { id: 'tech_asks', en: 'Asks an adult before opening or changing anything', ar: 'يسأل شخصاً بالغاً قبل فتح أي شيء أو تغييره', ku: 'بەری ڤەکرن یان گوهۆڕینا هەر تشتەکی ژ مەزنەکی دپرسیت' },
    ],
  },
  {
    id: 'classroom_respect',
    column: 'left',
    groupHeader: {
      en: 'Behaviour rubric',
      ar: 'معيار السلوك',
      ku: 'پێڤەرێ ڕەوشتی',
    },
    title: {
      en: 'Classroom behaviour and respect',
      ar: 'السلوك الصفي والاحترام',
      ku: 'ڕەوشتێ د پۆلێدا و ڕێز',
    },
    items: [
      { id: 'cr_rules', en: 'Follows classroom rules and routines', ar: 'يتبع قواعد الصف وروتينه', ku: 'ڕێسا و ڕۆتینێن پۆلێ ب جە دئینیت' },
      { id: 'cr_waits', en: 'Waits for their turn', ar: 'ينتظر دوره', ku: 'چاڤەڕێی نۆرەیا خۆ دبیت' },
      { id: 'cr_respect_staff', en: 'Shows respect to teachers and staff', ar: 'يُظهر الاحترام للمعلمين والموظفين', ku: 'ڕێزێ ل مامۆستا و ستافی دگریت' },
      { id: 'cr_respect_peers', en: 'Shows respect to classmates', ar: 'يحترم زملاءه', ku: 'ڕێزێ ل هەڤپۆلێن خۆ دگریت' },
    ],
  },
  {
    id: 'work_habits',
    column: 'left',
    title: {
      en: 'Work habits and responsibility',
      ar: 'عادات العمل والمسؤولية',
      ku: 'ڕەوشتێن کاری و بەرپرسیاریێ',
    },
    items: [
      { id: 'wh_starts', en: 'Starts tasks promptly', ar: 'يبدأ المهام فوراً', ku: 'ب زویی دەست ب ئەرکان دکەت' },
      { id: 'wh_focused', en: 'Stays focused until a task is finished', ar: 'يبقى مركزاً حتى ينهي المهمة', ku: 'ب تەرکیز دمینیت هەتا ئەرک تەمام دبیت' },
      { id: 'wh_tidies', en: 'Tidies up after activities', ar: 'يرتب بعد الأنشطة', ku: 'پشتی چالاکیان ڕێک و پێک دکەت' },
      { id: 'wh_asks_help', en: 'Asks for help when needed', ar: 'يطلب المساعدة عند الحاجة', ku: 'ئەگەر پێدڤی بیت هاریکاریێ دخوازیت' },
    ],
  },
  {
    id: 'school_system',
    column: 'left',
    title: {
      en: 'SCHOOL SYSTEM',
      ar: 'نظام مدرسي',
      ku: 'سیستەما خوێندنێ',
    },
    items: [
      { id: 'sys_ontime', en: 'Arrives at school on time', ar: 'يصل إلى المدرسة في الوقت المحدد', ku: 'د دەمێ خۆدا دگەهیتە قوتابخانێ' },
      { id: 'sys_clean', en: 'Keeps the classroom clean and tidy', ar: 'يحافظ على نظافة وترتيب الصف', ku: 'پاکی و رێک و پێکیا پۆلێ دپارێزیت' },
      { id: 'sys_property', en: 'Takes care of school property and materials', ar: 'يعتني بممتلكات المدرسة وأدواتها', ku: 'د گرنگیێ ب مال و کەرەستەیێن قوتابخانێ ددەت' },
      { id: 'sys_rules', en: 'Follows school rules and routines', ar: 'يلتزم بقوانين المدرسة ونظامها', ku: 'پەیڕەویا یاسا و رێکارێن قوتابخانێ دکەت' },
    ],
  },
  {
    id: 'safety_attendance',
    column: 'left',
    title: {
      en: 'Safety and attendance',
      ar: 'السلامة والحضور',
      ku: 'ئەمنی و ئامادەبوون',
    },
    items: [
      { id: 'sa_walks', en: 'Walks (does not run) indoors', ar: 'يمشي (لا يركض) داخل المبنى', ku: 'د ناڤ بینایێدا ب پێیان دچیت (نادەتە ڕاکرن)' },
      { id: 'sa_drill', en: 'Follows safety and drill instructions', ar: 'يتبع تعليمات السلامة والتدريبات', ku: 'ڕێنماییێن ئەمنی و ڕاهێنانان ب جە دئینیت' },
      { id: 'sa_ontime', en: 'Arrives at school on time', ar: 'يصل إلى المدرسة في الوقت المحدد', ku: 'ل دەمێ خۆ دگەهیتە قوتابخانێ' },
      { id: 'sa_regular', en: 'Attends school regularly', ar: 'يحضر المدرسة بانتظام', ku: 'ب ڕێکخستی دچیتە قوتابخانێ' },
    ],
  },
  {
    id: 'classroom_readiness',
    column: 'right_top',
    title: {
      en: 'Classroom Habits & Participation',
      ar: 'السلوك والانضباط الصفي',
      ku: 'ڕەوشت و بەشداری د پۆلێدا',
    },
    items: [
      { id: 'cr2_instructions', en: 'Follows classroom instructions', ar: 'يتبع تعليمات الصف', ku: 'فەرمانێن پۆلێ پەیڕەو دکەت' },
      { id: 'cr2_participates', en: 'Participates in classroom activities', ar: 'يشارك في الأنشطة الصفية', ku: 'بەشداریێ د چالاکیێن پۆلێ دکەت' },
      { id: 'cr2_completes', en: 'Completes classwork on time', ar: 'يُكمل العمل الصفي في الوقت المحدد', ku: 'کارێن پۆلێ د دەمێ خۆدا تەمام دکەت' },
      { id: 'cr2_organized', en: 'Keeps books and school materials organized', ar: 'يحافظ على تنظيم كتبه وأدواته المدرسية', ku: 'پەرتووک و کەرەستەیێن خوێندنگەهێ ب رێک و پێک دپارێزیت' },
      { id: 'cr2_listens', en: 'Listens carefully when the teacher or classmates speak', ar: 'يستمع بانتباه عندما يتحدث المعلم أو زملاؤه', ku: 'ب دەمێ ئاخڤتنا مامۆستا یان هەڤپۆلێن خۆ، ب باشی گوهداریێ دکەت' },
    ],
  },
];

export const BEHAVIOUR_SCALE_LEGEND: Array<{
  score: 1 | 2 | 3 | 4 | 5;
  en: string;
  ar: string;
  ku: string;
}> = [
  {
    score: 1,
    en: 'Experiencing significant difficulty',
    ar: 'يواجه صعوبة كبيرة',
    ku: 'دووچاری زەحمەتیەکا مەزن دبیت',
  },
  {
    score: 2,
    en: 'Experiencing some difficulty',
    ar: 'يواجه بعض الصعوبة',
    ku: 'دووچاری هندەک زەحمەتیێ دبیت',
  },
  {
    score: 3,
    en: 'Managing comfortably',
    ar: 'يتعامل براحة',
    ku: 'ب ڕاحەتی ڕێڤە دبەت',
  },
  {
    score: 4,
    en: 'Capable and competent',
    ar: 'قادر وكفؤ',
    ku: 'توانادار و شارەزایە',
  },
  {
    score: 5,
    en: 'Highly capable and competent',
    ar: 'قادر وكفؤ بدرجة عالية',
    ku: 'گەلەک توانادار و شارەزایە',
  },
];

export const BEHAVIOUR_SUBJECTS: BehaviourCriteriaItem[] = [
  { id: 'French', en: 'French', ar: 'الفرنسية', ku: 'فەرەنسی' },
  { id: 'Social Studies', en: 'Social Studies', ar: 'الدراسات الاجتماعية', ku: 'خواندنێن جڤاکی' },
  { id: 'Music', en: 'Music', ar: 'الموسيقى', ku: 'مۆزیک' },
  { id: 'Math', en: 'Math', ar: 'الرياضيات', ku: 'بیرکاری' },
  { id: 'Conversation', en: 'Conversation', ar: 'المحادثة', ku: 'گفتوگۆ' },
  { id: 'Moral Values', en: 'Moral Values', ar: 'القيم الأخلاقية', ku: 'بهایێن ئاکارێ' },
  { id: 'IT', en: 'IT', ar: 'تقنية المعلومات', ku: 'تەکنەلۆجیایا زانیاریێ' },
  { id: 'AI', en: 'AI', ar: 'الذكاء الاصطناعي', ku: 'ژیریا دەستکرد' },
  { id: 'Art', en: 'Art', ar: 'الفنون', ku: 'هونەر' },
  { id: 'English', en: 'English', ar: 'اللغة الإنجليزية', ku: 'زمانێ ئینگلیزی' },
  { id: 'PE', en: 'PE', ar: 'التربية البدنية', ku: 'پەروەردەیا وەرزشی' },
  { id: 'Religion', en: 'Religion', ar: 'التربية الدينية', ku: 'ئایین' },
  { id: 'Kurdish', en: 'Kurdish', ar: 'اللغة الكردية', ku: 'زمانێ کوردی' },
  { id: 'Arabic', en: 'Arabic', ar: 'اللغة العربية', ku: 'زمانێ عەرەبی' },
  { id: 'Science', en: 'Science', ar: 'العلوم', ku: 'زانست' },
  { id: 'KOMALAYETI', en: 'KOMALAYETI', ar: 'الاجتماعيات', ku: 'کۆمەڵایەتی' },
  { id: 'KARAMAYI', en: 'KARAMAYI', ar: 'المهارات', ku: 'کارامەیی' },
];

export interface BehaviourIncidentDef {
  no: number;
  id: string;
  en: string;
  ar: string;
  ku: string;
}

export const BEHAVIOUR_INCIDENTS: BehaviourIncidentDef[] = [
  { no: 1, id: 'inc_talking', en: 'Talking without raising hand', ar: 'التحدث دون رفع اليد', ku: 'ئاخڤتن بێ بلندکرنا دەستی' },
  { no: 2, id: 'inc_cleaning', en: 'Cleaning the room', ar: 'تنظيف الغرفة', ku: 'پاقژکرنا پۆلێ' },
  { no: 3, id: 'inc_fighting', en: 'Fighting', ar: 'الشجار', ku: 'شەڕ' },
  { no: 4, id: 'inc_prepared', en: 'Being Prepared', ar: 'الاستعداد', ku: 'ئامادەبوون' },
  { no: 5, id: 'inc_not_caring', en: 'Not caring', ar: 'اللامبالاة', ku: 'بێ ئاگەهداری' },
  { no: 6, id: 'inc_interrupting', en: 'Interrupting the teacher or classmates', ar: 'مقاطعة المعلم أو الزملاء', ku: 'بڕینا ئاخڤتنا مامۆستای یان هەڤپۆلان' },
  { no: 7, id: 'inc_not_following', en: 'Not following instructions', ar: 'عدم اتباع التعليمات', ku: 'ب جە نەئینانا ڕێنمایان' },
  { no: 8, id: 'inc_leaving_seat', en: 'Leaving seat without permission', ar: 'ترك المقعد دون إذن', ku: 'هێلانا جهێ دانیشتنێ بێ مۆلەت' },
  { no: 9, id: 'inc_hitting', en: 'Hitting or pushing others', ar: 'ضرب الآخرين أو دفعهم', ku: 'لێدان یان هاڤێتنا یێن دی' },
  { no: 10, id: 'inc_taking', en: "Taking others' belongings", ar: 'أخذ أغراض الآخرين', ku: 'وەرگرتنا تشتێن یێن دی' },
  { no: 11, id: 'inc_not_sharing', en: 'Not sharing', ar: 'عدم المشاركة', ku: 'دابەش نەکرن' },
  { no: 12, id: 'inc_late', en: 'Being late', ar: 'التأخر', ku: 'دەرەنگ هاتن' },
  { no: 13, id: 'inc_helping', en: 'Helping a classmate', ar: 'مساعدة زميل', ku: 'هاریکاریا هەڤپۆلەکی' },
  { no: 14, id: 'inc_following_rules', en: 'Following the rules', ar: 'اتباع القواعد', ku: 'ب جە ئینانا ڕێسایان' },
  { no: 15, id: 'inc_respectful', en: 'Being respectful', ar: 'الاحترام', ku: 'ڕێزگرتن' },
];

export type BehaviourScore = 1 | 2 | 3 | 4 | 5;

export interface BehaviourIncidentEntry {
  occurrences: string;
  action: string;
}

export interface MonthlyBehaviourReport {
  id: string;
  studentId: string;
  monthKey: string;
  academicYear: string;
  socialWorker: string;
  supervisor: string;
  dayDate: string;
  principal: string;
  ratings: Record<string, BehaviourScore>;
  subjectRatings: Record<string, BehaviourScore>;
  incidents: Record<string, BehaviourIncidentEntry>;
  published: boolean;
  updatedAt: string;
}

export const BEHAVIOUR_REPORTS_STORAGE_KEY = 'dasinya_behaviour_reports_v1';

export function makeBehaviourReportKey(studentId: string, monthKey: string): string {
  return `${studentId}__${monthKey}`;
}

export function createEmptyBehaviourReport(
  studentId: string,
  monthKey: string,
  defaultSupervisor = ''
): MonthlyBehaviourReport {
  return {
    id: makeBehaviourReportKey(studentId, monthKey),
    studentId,
    monthKey,
    academicYear: '2026-2027',
    socialWorker: 'Ms. Mina',
    supervisor: defaultSupervisor,
    dayDate: '',
    principal: 'Maryam Nizar Mohammed',
    ratings: {},
    subjectRatings: {},
    incidents: {},
    published: true,
    updatedAt: new Date().toISOString(),
  };
}

export function loadStoredBehaviourReports(): Record<string, MonthlyBehaviourReport> {
  try {
    const raw = localStorage.getItem(BEHAVIOUR_REPORTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStoredBehaviourReports(
  reports: Record<string, MonthlyBehaviourReport>
): void {
  try {
    localStorage.setItem(BEHAVIOUR_REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.warn('Could not persist behaviour reports to localStorage:', err);
  }
}
