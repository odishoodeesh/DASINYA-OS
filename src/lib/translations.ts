/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'ku' | 'ar';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    dir: 'ltr',
    flag: '🇬🇧',
  },
  {
    code: 'ku',
    label: 'Kurdish (Badini of Duhok)',
    nativeLabel: 'کوردی (بادینی - دهۆک)',
    dir: 'rtl',
    flag: '☀️',
  },
  {
    code: 'ar',
    label: 'Arabic',
    nativeLabel: 'العربية',
    dir: 'rtl',
    flag: '🇮🇶',
  },
];

export interface TranslationDictionary {
  // Brand & Navigation
  schoolName: string;
  schoolSubtitle: string;
  departmentName: string;
  marksheet: string;
  returnHome: string;
  back: string;
  printReport: string;
  language: string;
  officialPortal: string;
  welcomeIntro: string;
  officialRecordsSummary: string;

  // Search
  globalSearchPlaceholder: string;
  studentSearchPlaceholder: string;
  searchNoStudent: string;
  foundInOtherClasses: string;

  // Selection Steps
  stepGrade: string;
  stepClass: string;
  stepStudent: string;
  stepTerm: string;
  gradeCountLabel: string;
  sectionsCountLabel: string;
  studentsInClassLabel: string;
  termWeightLabel: string;
  termWeightExplainer: string;
  termWeightPolicy: string;

  // Grade & Class formatting
  gradePrefix: string;
  classPrefix: string;

  // Terms
  term1Name: string;
  term1FullTitle: string;

  // Student Profile Metadata
  studentName: string;
  motherName: string;
  rollNumber: string;
  idNumber: string;
  classAndSection: string;
  dob: string;
  gender: string;
  male: string;
  female: string;
  bloodGroup: string;
  academicYear: string;
  advisor: string;
  attendance: string;
  presence: string;
  conduct: string;
  standing: string;

  // Marksheet Table Headers
  subject: string;
  subjectCode: string;
  category: string;
  maxMarks: string;
  obtainedMarks: string;
  termWeightScore: string;
  letterGrade: string;
  academicRemarks: string;
  cumulativeTotal: string;
  overallPercentage: string;
  termContribution: string;
  academicStanding: string;

  // Standings
  statusPassHighDistinction: string;
  statusPassDistinction: string;
  statusPassed: string;
  statusNeedsImprovement: string;

  // Filter Categories
  categoryAll: string;
  categoryLanguage: string;
  categorySTEM: string;
  categoryTechnology: string;
  categoryHumanities: string;
  categoryApplied: string;
  categoryEthics: string;
  categoryArtsSports: string;
  curriculumFilter: string;

  // Signatures
  signaturesHeader: string;
  classTeacherSignature: string;
  principalSignature: string;
  parentSignature: string;
  schoolOfficeStamp: string;
  evaluationPolicyNote: string;
  policyG1to3: string;
  policyG4to9: string;
  passingScoreNote: string;

  // Footer
  footerCopyright: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    schoolName: 'Dasinya Private School',
    schoolSubtitle: 'Grades 1 – 9 • Official Marksheets (301 Students)',
    departmentName: 'Department of Academic Affairs • Official Marksheet',
    marksheet: 'Marksheet',
    returnHome: 'Return to School Home',
    back: 'Back',
    printReport: 'Print / Export PDF',
    language: 'Language',
    officialPortal: 'Official Academic Portal',
    welcomeIntro: 'Welcome to the official institutional portal. Select Marksheet to access student evaluations and academic records.',
    officialRecordsSummary: '301 Official Students • Grades 1 to 9 • Term 25% (G1-3) / 20% (G4-9)',

    globalSearchPlaceholder: 'Global search any of 301 students...',
    studentSearchPlaceholder: 'Search student name or roll...',
    searchNoStudent: 'No student matching',
    foundInOtherClasses: 'Found in other classes',

    stepGrade: '1. Select Grade',
    stepClass: '2. Select Class',
    stepStudent: '3. Select Student',
    stepTerm: '4. Select Term',
    gradeCountLabel: '9 Grades',
    sectionsCountLabel: 'sections',
    studentsInClassLabel: 'Students in',
    termWeightLabel: 'Term Weight',
    termWeightExplainer: 'Weight for',
    termWeightPolicy: 'Grades 1–3: 25% for Term 1 • Grades 4–9: 20% for Term 1',

    gradePrefix: 'Grade',
    classPrefix: 'Class',

    term1Name: 'Term 1 Examination',
    term1FullTitle: 'Term 1 Examination',

    studentName: 'Student Full Name',
    motherName: 'Mother',
    rollNumber: 'Roll / Registration ID',
    idNumber: 'ID',
    classAndSection: 'Class & Section',
    dob: 'Date of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    bloodGroup: 'Blood Group',
    academicYear: 'Academic Year',
    advisor: 'Advisor',
    attendance: 'Attendance & Standing',
    presence: 'Presence',
    conduct: 'Exemplary',
    standing: 'Standing',

    subject: 'Subject',
    subjectCode: 'Code',
    category: 'Category',
    maxMarks: 'Max Marks',
    obtainedMarks: 'Marks (100)',
    termWeightScore: 'Term Weight',
    letterGrade: 'Grade',
    academicRemarks: 'Academic Remarks',
    cumulativeTotal: 'Cumulative Total',
    overallPercentage: 'Overall Percentage',
    termContribution: 'Term 1 Contribution',
    academicStanding: 'Academic Standing',

    statusPassHighDistinction: 'Pass with High Distinction',
    statusPassDistinction: 'Pass with Distinction',
    statusPassed: 'Passed',
    statusNeedsImprovement: 'Needs Improvement',

    categoryAll: 'All',
    categoryLanguage: 'Language',
    categorySTEM: 'STEM',
    categoryTechnology: 'Technology',
    categoryHumanities: 'Humanities',
    categoryApplied: 'Applied',
    categoryEthics: 'Ethics',
    categoryArtsSports: 'Arts & Sports',
    curriculumFilter: 'Curriculum Filter',

    signaturesHeader: 'Signatures & Certifications',
    classTeacherSignature: 'Class Teacher Signature',
    principalSignature: 'Principal\'s Seal & Signature',
    parentSignature: 'Parent / Guardian Signature',
    schoolOfficeStamp: 'Dasinya Private School Office',
    evaluationPolicyNote: 'Evaluation & Weight Policy',
    policyG1to3: 'Grades 1–3: 25% weight per term (4 terms = 100%)',
    policyG4to9: 'Grades 4–9: 20% weight per term (5 terms = 100%)',
    passingScoreNote: 'Passing Mark: 50% • Distinction: 85%+',

    footerCopyright: 'Dasinya Private School • Grades 1 to 9 Academic Evaluation System (301 Students)',
  },

  ku: {
    // Badini Kurdish (Duhok dialect)
    schoolName: 'قوتابخانەیا داسنیا یا تایبەت',
    schoolSubtitle: 'قۆناغێن ١ – ٩ • کەشفا فەرمی یا نمران (٣٠١ قوتابی)',
    departmentName: 'پشکا کارگێری و دەستەیا خواندنێ • کەشفا فەرمی یا نمران',
    marksheet: 'کەشفا نمران',
    returnHome: 'زڤڕین بۆ پەڕێ سەرەکی',
    back: 'زڤڕین',
    printReport: 'چاپکرن / دەرئێخستنا PDF',
    language: 'زمان',
    officialPortal: 'دەوازەیا فەرمی یا ئەکادیمی',
    welcomeIntro: 'بخێربێن بۆ دەوازەیا ئەکادیمی یا قوتابخانەیا داسنیا. کرتێ ل سەر کەشفا نمران بکە بۆ دیتنا کارتا نمرێت قوتابیان و پشکنینا پێشکەفتنا خواندنێ.',
    officialRecordsSummary: '٣٠١ قوتابیێن فەرمی • قۆناغێن ١ هەتا ٩ • کێشا وەرزێ ئێکێ: ٢٥٪ (١-٣) / ٢٠٪ (٤-٩)',

    globalSearchPlaceholder: 'لێگەڕیان ل دووڤ هەر قوتابیەکی ژ ٣٠١ قوتابیان...',
    studentSearchPlaceholder: 'ناڤێ قوتابی یان ژمارا تۆمارێ بنڤیسە...',
    searchNoStudent: 'چ قوتابی نەهاتە دیتن ل ژێر ناڤێ',
    foundInOtherClasses: 'هاتە دیتن د هۆبێن دی دا',

    stepGrade: '١. هلبژارتنا قۆناغێ',
    stepClass: '٢. هلبژارتنا هۆبێ',
    stepStudent: '٣. هلبژارتنا قوتابی',
    stepTerm: '٤. هلبژارتنا وەرزی',
    gradeCountLabel: '٩ قۆناغ',
    sectionsCountLabel: 'هۆبە',
    studentsInClassLabel: 'قوتابی ل قۆناغا',
    termWeightLabel: 'کێشا وەرزی',
    termWeightExplainer: 'رێژەیا قۆناغا',
    termWeightPolicy: 'قۆناغێن ١-٣: ٢٥٪ بۆ وەرزێ ئێکێ • قۆناغێن ٤-٩: ٢٠٪ بۆ وەرزێ ئێکێ',

    gradePrefix: 'قۆناغا',
    classPrefix: 'هۆبا',

    term1Name: 'تاقیکرنا وەرزێ ئێکێ',
    term1FullTitle: 'تاقیکرنا فەرمی یا وەرزێ ئێکێ',

    studentName: 'ناڤێ سیانی یێ قوتابی',
    motherName: 'ناڤێ دایکێ',
    rollNumber: 'ژمارا تۆمارێ / ناسنامە',
    idNumber: 'ناسنامە',
    classAndSection: 'قۆناغ و هۆبە',
    dob: 'مێژوویا ژدایکبوونێ',
    gender: 'رەگەز',
    male: 'نێر',
    female: 'مێ',
    bloodGroup: 'گرووپێ خوینێ',
    academicYear: 'ساڵا خواندنێ',
    advisor: 'مامۆستایێ رێبەر',
    attendance: 'ئامادەبوون و بەشداری',
    presence: 'ئامادەبوون',
    conduct: 'رەوشت باش',
    standing: 'ئاست',

    subject: 'بابەتێ خواندنێ',
    subjectCode: 'کۆدێ بابەتێ',
    category: 'پۆلێن',
    maxMarks: 'بلندترین نمرە',
    obtainedMarks: 'نمرەیا وەرگرتی (١٠٠)',
    termWeightScore: 'رێژەیا وەرزێ ئێکێ',
    letterGrade: 'پلە',
    academicRemarks: 'تێبینیێن ئەکادیمی',
    cumulativeTotal: 'کۆما گشتی یا نمران',
    overallPercentage: 'رێژەیا سەدی یا گشتی',
    termContribution: 'کێشا وەرزێ ئێکێ',
    academicStanding: 'ئاستێ ئەکادیمی یێ گشتی',

    statusPassHighDistinction: 'دەرچوو ب پلەیا بلند',
    statusPassDistinction: 'دەرچوو ب نایاب',
    statusPassed: 'دەرچوو (سەرکەفتی)',
    statusNeedsImprovement: 'پێتڤی ب بزاڤ و پێشڤەبرنێ یە',

    categoryAll: 'هەمی بابەت',
    categoryLanguage: 'زمان',
    categorySTEM: 'زانست و بیرکاری',
    categoryTechnology: 'تەکنۆلۆژیا',
    categoryHumanities: 'مرۆڤایەتی',
    categoryApplied: 'پراکتیکی',
    categoryEthics: 'رەوشت و ئایین',
    categoryArtsSports: 'هونەر و وەرزش',
    curriculumFilter: 'فلتەرکرنا بابەتان',

    signaturesHeader: 'ئیمزا و پەسەندکرنا فەرمی',
    classTeacherSignature: 'ئیمزایا مامۆستایێ هۆبێ',
    principalSignature: 'مۆر و ئیمزایا رێڤەبەرێ قوتابخانێ',
    parentSignature: 'ئیمزایا سەرپەرشتێ قوتابی',
    schoolOfficeStamp: 'نڤیسینگەها قوتابخانەیا داسنیا یا تایبەت',
    evaluationPolicyNote: 'یاسایا هەلسەنگاندن و کێشا نمران',
    policyG1to3: 'قۆناغێن ١ هەتا ٣: ٢٥٪ کێش بۆ هەر وەرزەکی (٤ وەرز = ١٠٠٪)',
    policyG4to9: 'قۆناغێن ٤ هەتا ٩: ٢٠٪ کێش بۆ هەر وەرزەکی (٥ وەرز = ١٠٠٪)',
    passingScoreNote: 'نمرەیا دەربازبوونێ: ٥٠٪ • پلەیا نایاب: ٨٥٪+',

    footerCopyright: 'قوتابخانەیا داسنیا یا تایبەت • سیستەمێ هەلسەنگاندنا ئەکادیمی یا قۆناغێن ١ هەتا ٩ (٣٠١ قوتابی)',
  },

  ar: {
    // Arabic
    schoolName: 'مدرسة داسنيا الأهلية',
    schoolSubtitle: 'الصفوف ١ – ٩ • كشف الدرجات الرسمي (٣٠١ طالب)',
    departmentName: 'قسم الشؤون التعليمية والامتحانات • كشف الدرجات الرسمي',
    marksheet: 'كشف الدرجات',
    returnHome: 'العودة للصفحة الرئيسية',
    back: 'رجوع',
    printReport: 'طباعة / تصدير PDF',
    language: 'اللغة',
    officialPortal: 'البوابة الأكاديمية الرسمية',
    welcomeIntro: 'مرحباً بكم في البوابة الرسمية لمدرسة داسنيا الأهلية. اضغط على كشف الدرجات للاطلاع على بطاقات التقويم الأكاديمي وسجلات الطلاب.',
    officialRecordsSummary: '٣٠١ طالب رسمي • الصفوف من ١ إلى ٩ • وزن الفصل الأول: ٢٥٪ (١-٣) / ٢٠٪ (٤-٩)',

    globalSearchPlaceholder: 'بحث عام في سجل ٣٠١ طالب...',
    studentSearchPlaceholder: 'ابحث باسم الطالب أو رقم القيد...',
    searchNoStudent: 'لا يوجد طالب مطابق للاسم',
    foundInOtherClasses: 'تم العثور في شعب أخرى',

    stepGrade: '١. اختر الصف',
    stepClass: '٢. اختر الشعبة',
    stepStudent: '٣. اختر الطالب',
    stepTerm: '٤. اختر الفصل',
    gradeCountLabel: '٩ صفوف',
    sectionsCountLabel: 'شعب',
    studentsInClassLabel: 'طلاب الصف',
    termWeightLabel: 'وزن الفصل',
    termWeightExplainer: 'النسبة للصف',
    termWeightPolicy: 'الصفوف ١-٣: ٢٥٪ للفصل الأول • الصفوف ٤-٩: ٢٠٪ للفصل الأول',

    gradePrefix: 'الصف',
    classPrefix: 'الشعبة',

    term1Name: 'امتحانات الفصل الدراسي الأول',
    term1FullTitle: 'امتحانات الفصل الدراسي الأول الرسمي',

    studentName: 'اسم الطالب الثلاثي',
    motherName: 'اسم الأم',
    rollNumber: 'رقم القيد / الهوية',
    idNumber: 'الهوية',
    classAndSection: 'الصف والشعبة',
    dob: 'تاريخ الولادة',
    gender: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    bloodGroup: 'فصيلة الدم',
    academicYear: 'العام الدراسي',
    advisor: 'مرشد الصف',
    attendance: 'نسبة الحضور والالتزام',
    presence: 'حضور',
    conduct: 'سلوك مثالي',
    standing: 'المرتبة',

    subject: 'المادة الدراسية',
    subjectCode: 'رمز المادة',
    category: 'التصنيف',
    maxMarks: 'الدرجة العظمى',
    obtainedMarks: 'الدرجة المحصلة (١٠٠)',
    termWeightScore: 'نسبة الفصل الأول',
    letterGrade: 'التقدير',
    academicRemarks: 'الملاحظات الأكاديمية',
    cumulativeTotal: 'المجموع الكلي',
    overallPercentage: 'المعدل العام',
    termContribution: 'محصلة الفصل الأول',
    academicStanding: 'التقدير العام',

    statusPassHighDistinction: 'ناجح بتفوق عالٍ',
    statusPassDistinction: 'ناجح بامتياز',
    statusPassed: 'ناجح',
    statusNeedsImprovement: 'بحاجة إلى متابعة وتحسين',

    categoryAll: 'جميع المواد',
    categoryLanguage: 'اللغات',
    categorySTEM: 'العلوم والرياضيات',
    categoryTechnology: 'التكنولوجيا',
    categoryHumanities: 'العلوم الإنسانية',
    categoryApplied: 'العلوم التطبيقية',
    categoryEthics: 'التربية والأخلاق',
    categoryArtsSports: 'الفنون والرياضة',
    curriculumFilter: 'تصفية المنهاج',

    signaturesHeader: 'التواقيع والاعتمادات الرسمية',
    classTeacherSignature: 'توقيع مرشد / مدرس الصف',
    principalSignature: 'ختم وتوقيع مدير المدرسة',
    parentSignature: 'توقيع ولي الأمر',
    schoolOfficeStamp: 'إدارة مدرسة داسنيا الأهلية',
    evaluationPolicyNote: 'نظام التقويم وتوزيع الأوزان النسبية',
    policyG1to3: 'الصفوف ١ إلى ٣: ٢٥٪ وزن لكل فصل دراسي (٤ فصول = ١٠٠٪)',
    policyG4to9: 'الصفوف ٤ إلى ٩: ٢٠٪ وزن لكل فصل دراسي (٥ فصول = ١٠٠٪)',
    passingScoreNote: 'درجة النجاح: ٥٠٪ • الامتياز: ٨٥٪ فما فوق',

    footerCopyright: 'مدرسة داسنيا الأهلية • نظام التقييم الأكاديمي للصفوف ١ إلى ٩ (٣٠١ طالب)',
  },
};

/**
 * Subject Name Translations in English, Badini Kurdish, and Arabic
 */
export const SUBJECT_TRANSLATIONS: Record<string, { ku: string; ar: string }> = {
  'Psychology (دەرونزانی)': {
    ku: 'دەرونناسی (دەرونزانی)',
    ar: 'علم النفس',
  },
  'Social Studies': {
    ku: 'جڤاکناسی (خواندنا جڤاکی)',
    ar: 'الدراسات الاجتماعية',
  },
  'KOMALAYETI': {
    ku: 'کۆمەڵایەتی',
    ar: 'الاجتماعيات',
  },
  'KARAMAYI': {
    ku: 'کارامەییێن ژیانێ',
    ar: 'المهارات الحياتية',
  },
  'French': {
    ku: 'زمانێ فڕەنسی',
    ar: 'اللغة الفرنسية',
  },
  'Music': {
    ku: 'مۆسیقا و سرود',
    ar: 'الموسيقى والأناشيد',
  },
  'Math': {
    ku: 'بیرکاری (ماتماتیک)',
    ar: 'الرياضيات',
  },
  'Conversation': {
    ku: 'ئاخڤتن و گفتوگۆ',
    ar: 'المحادثة والتعبير',
  },
  'Moral Values': {
    ku: 'بەهایێن رەوشتی',
    ar: 'القيم الأخلاقية',
  },
  'IT': {
    ku: 'تەکنۆلۆژیایا زانیاریان (IT)',
    ar: 'تكنولوجيا المعلومات (IT)',
  },
  'AI': {
    ku: 'ژیرییا دەستکرد (AI)',
    ar: 'الذكاء الاصطناعي (AI)',
  },
  'Art': {
    ku: 'هونەر (پەروەردەیا هونەری)',
    ar: 'التربية الفنية',
  },
  'English': {
    ku: 'زمانێ ئینگلیزی',
    ar: 'اللغة الإنجليزية',
  },
  'PE': {
    ku: 'پەروەردەیا وەرزشی',
    ar: 'التربية الرياضية',
  },
  'Religion': {
    ku: 'ئایین (پەروەردەیا ئایینی)',
    ar: 'التربية الدينية',
  },
  'Kurdish': {
    ku: 'زمانێ کوردی (دایکێ)',
    ar: 'اللغة الكردية',
  },
  'Arabic': {
    ku: 'زمانێ عەرەبی',
    ar: 'اللغة العربية',
  },
  'Science': {
    ku: 'زانستێن گشتی',
    ar: 'العلوم العامة',
  },
};

/**
 * Academic Remarks Translations - All 10 Official Subject Remarks & Performance Evaluations
 */
export const REMARKS_TRANSLATIONS: Record<string, { ku: string; ar: string }> = {
  // Official Curriculum Subject Remarks
  'Outstanding comprehension and participation': {
    ku: 'تێگەهشتن و بەشدارییا نایاب و بەرچاڤ',
    ar: 'استيعاب ومشاركة متميزة وفعالة',
  },
  'Exemplary Kurdish literacy and grammar': {
    ku: 'رێزمان و خواندنا کوردی یا نموونەیی',
    ar: 'إتقان نموذجي في القراءة وقواعد اللغة الكردية',
  },
  'Strong analytical precision and logic': {
    ku: 'هویربینی و لۆژیکەکێ شیکاری یێ ب هێز',
    ar: 'دقة تحليلية وتفكير منطقي قوي',
  },
  'Thorough scientific exploration': {
    ku: 'ڤەکۆلین و تێگەهشتنا زانستی یا هویر',
    ar: 'استكشاف وفهم علمي شامل ومتعمق',
  },
  'High digital dexterity and interest': {
    ku: 'شارەزایی و حەزا بلند یا تەکنۆلۆژی و دیجیتاڵی',
    ar: 'مهارة رقمية واهتمام تقني عالٍ',
  },
  'Active community and social engagement': {
    ku: 'پشکداریکرن و کارلێکرنا جڤاکی یا چالاک',
    ar: 'مشاركة وتفاعل مجتمعي نشط',
  },
  'Excellent applied craft and vocational skills': {
    ku: 'کارامەیی و دەستڕەنگینییا پراکتیکی یا نایاب',
    ar: 'مهارات تطبيقية ومهنية ممتازة',
  },
  'Fluent, polite and articulate speaker': {
    ku: 'ئاخڤتنکەرەکێ پاراو، رێزدار و زمانزان',
    ar: 'متحدث طلق، لبق ومتميز في التعبير',
  },
  'Exemplary conduct and values': {
    ku: 'رەوشت، بەهایێن بەرز و پابەندبوونا نموونەیی',
    ar: 'سلوك وقيم أخلاقية نموذجية',
  },
  'Deep behavioral insight': {
    ku: 'هوشیاری و تێگەهشتنا رەفتاری یا کویر',
    ar: 'فهم وبصيرة سلوكية عميقة',
  },

  // General & Grade-level Remarks
  'Excellent': { 
    ku: 'نایاب و زۆر باش', 
    ar: 'ممتاز جداً' 
  },
  'Very Good': { 
    ku: 'زۆر باش', 
    ar: 'جيد جداً' 
  },
  'Good': { 
    ku: 'باش', 
    ar: 'جيد' 
  },
  'Satisfactory': { 
    ku: 'مامناڤند و پەسەندکری', 
    ar: 'متوسط ومقبول' 
  },
  'Needs Attention': { 
    ku: 'پێتڤی ب بزاڤ و چاڤدێریێ یە', 
    ar: 'يحتاج إلى اهتمام ورعاية' 
  },
  'Needs Improvement': { 
    ku: 'پێتڤی ب بزاڤ و پێشڤەبرنێ یە', 
    ar: 'يحتاج إلى متابعة وتحسين' 
  },
};

/**
 * Category Translations
 */
export const CATEGORY_TRANSLATIONS: Record<string, { ku: string; ar: string }> = {
  'All': { ku: 'هەمی', ar: 'الكل' },
  'Language': { ku: 'زمان', ar: 'اللغات' },
  'STEM': { ku: 'زانست و بیرکاری', ar: 'العلوم والرياضيات' },
  'Technology': { ku: 'تەکنۆلۆژیا', ar: 'التكنولوجيا' },
  'Humanities': { ku: 'مرۆڤایەتی', ar: 'العلوم الإنسانية' },
  'Applied': { ku: 'پراکتیکی', ar: 'العلوم التطبيقية' },
  'Communication': { ku: 'پەیوەندی', ar: 'التواصل' },
  'Ethics': { ku: 'رەوشت و ئایین', ar: 'الأخلاق والتربية' },
  'Arts & Sports': { ku: 'هونەر و وەرزش', ar: 'الفنون والرياضة' },
};

/**
 * Format Grade Label in Current Language
 */
export function formatGradeLabel(grade: string, lang: Language): string {
  const num = grade.replace(/\D/g, '');
  if (lang === 'ku') {
    return `قۆناغا ${num}`;
  }
  if (lang === 'ar') {
    return `الصف ${num}`;
  }
  return grade;
}

/**
 * Format Class/Section Label in Current Language
 */
export function formatClassLabel(cls: string, lang: Language): string {
  const sectionLetter = cls.replace(/Class\s*/i, '').trim();
  if (lang === 'ku') {
    return `هۆبا ${sectionLetter}`;
  }
  if (lang === 'ar') {
    return `الشعبة ${sectionLetter}`;
  }
  return cls;
}

/**
 * Format Subject Name in Current Language
 */
export function getTranslatedSubject(subjectName: string, lang: Language): string {
  if (lang === 'en') return subjectName;
  const match = SUBJECT_TRANSLATIONS[subjectName];
  if (!match) return subjectName;
  return match[lang] || subjectName;
}

/**
 * Format Academic Remark in Current Language
 */
export function getTranslatedRemark(remark: string, lang: Language): string {
  if (lang === 'en') return remark;
  if (!remark) return '';

  const clean = remark.trim();
  
  // 1. Direct match
  if (REMARKS_TRANSLATIONS[clean]) {
    return REMARKS_TRANSLATIONS[clean][lang] || clean;
  }

  // 2. Case-insensitive or trimmed match
  const lower = clean.toLowerCase();
  for (const [key, val] of Object.entries(REMARKS_TRANSLATIONS)) {
    if (key.toLowerCase() === lower) {
      return val[lang] || clean;
    }
  }

  // 3. Keyword / partial match
  if (lower.includes('outstanding') || lower.includes('comprehension')) {
    return REMARKS_TRANSLATIONS['Outstanding comprehension and participation'][lang];
  }
  if (lower.includes('kurdish literacy') || lower.includes('grammar')) {
    return REMARKS_TRANSLATIONS['Exemplary Kurdish literacy and grammar'][lang];
  }
  if (lower.includes('analytical') || lower.includes('logic')) {
    return REMARKS_TRANSLATIONS['Strong analytical precision and logic'][lang];
  }
  if (lower.includes('scientific')) {
    return REMARKS_TRANSLATIONS['Thorough scientific exploration'][lang];
  }
  if (lower.includes('digital') || lower.includes('dexterity')) {
    return REMARKS_TRANSLATIONS['High digital dexterity and interest'][lang];
  }
  if (lower.includes('community') || lower.includes('engagement') || lower.includes('social')) {
    return REMARKS_TRANSLATIONS['Active community and social engagement'][lang];
  }
  if (lower.includes('applied') || lower.includes('vocational') || lower.includes('craft')) {
    return REMARKS_TRANSLATIONS['Excellent applied craft and vocational skills'][lang];
  }
  if (lower.includes('fluent') || lower.includes('speaker') || lower.includes('articulate')) {
    return REMARKS_TRANSLATIONS['Fluent, polite and articulate speaker'][lang];
  }
  if (lower.includes('conduct') || lower.includes('values')) {
    return REMARKS_TRANSLATIONS['Exemplary conduct and values'][lang];
  }
  if (lower.includes('behavioral') || lower.includes('insight')) {
    return REMARKS_TRANSLATIONS['Deep behavioral insight'][lang];
  }

  return clean;
}

/**
 * Format Class Standing / Rank in Current Language
 */
export function formatClassRank(rank: string, lang: Language): string {
  if (lang === 'en') return rank;
  const numMatch = rank.match(/\d+/);
  const num = numMatch ? numMatch[0] : '';
  if (lang === 'ku') {
    return num ? `رێزبەندییا ${num} د هۆبێ دا` : rank;
  }
  if (lang === 'ar') {
    return num ? `المرتبة ${num} في الشعبة` : rank;
  }
  return rank;
}

/**
 * Format Conduct in Current Language
 */
export function formatConduct(conduct: string, lang: Language): string {
  if (lang === 'en') return `${conduct} Conduct`;
  if (lang === 'ku') return 'رەوشت نموونەیی و بەرز';
  if (lang === 'ar') return 'سلوك مثالي وأخلاق عالية';
  return conduct;
}

/**
 * Format Category in Current Language
 */
export function getTranslatedCategory(category: string, lang: Language): string {
  if (lang === 'en') return category;
  const match = CATEGORY_TRANSLATIONS[category];
  if (!match) return category;
  return match[lang] || category;
}

