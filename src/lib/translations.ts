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
    label: 'Kurdish',
    nativeLabel: 'کوردی',
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
  downloadPdf: string;
  generatingPdf: string;
  language: string;
  officialPortal: string;
  welcomeIntro: string;
  officialRecordsSummary: string;

  // Search
  globalSearchPlaceholder: string;
  studentSearchPlaceholder: string;
  selectStudentPromptTitle: string;
  selectStudentPromptDesc: string;
  selectStudentPlaceholder: string;
  selectStudentToView: string;
  studentsAvailable: string;
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
  guardianEmail: string;
  guardianPassword: string;

  // Marksheet Table Headers
  rowNumber: string;
  subject: string;
  term1MarkOutOf25: string;
  term1MarkOutOf20: string;
  totalMarks: string;
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

  // Portal Selection & Role Logins
  portalSelectionTitle: string;
  portalSelectionSubtitle: string;
  selectPortal: string;
  portalAdmin: string;
  portalAdminDesc: string;
  portalStaff: string;
  portalStaffDesc: string;
  portalTeacher: string;
  portalTeacherDesc: string;
  portalParent: string;
  portalParentDesc: string;
  portalStudent: string;
  portalStudentDesc: string;
  backToPortals: string;
  switchPortal: string;
  authUsernamePassword: string;
  authPasswordOnly: string;
  usernameLabel: string;
  enterUsername: string;
  enterPassword: string;
  adminLoginTitle: string;
  staffLoginTitle: string;
  teacherLoginTitle: string;
  parentLoginTitle: string;
  studentLoginTitle: string;
  invalidUsernameOrPassword: string;

  // Guardian Portal
  guardianLoginTitle: string;
  guardianLoginSubtitle: string;
  emailAddressLabel: string;
  passwordLabel: string;
  loginButtonLabel: string;
  loggingInLabel: string;
  logoutButtonLabel: string;
  invalidCredentialsError: string;
  guardianAccountTitle: string;
  studentAccountDetails: string;
  studentMarksheetTitle: string;
  switchStudentLabel: string;
  registeredChildrenLabel: string;
  quickDemoTitle: string;
  quickDemoHint: string;
  staffBrowseOption: string;
  backToGuardianLogin: string;

  // Logged-in Portal Buttons & Tabs
  tabInfo: string;
  tabMarksheet: string;
  tabFoodMenu: string;
  tabClassesTimetable: string;
  tabBehaviourReport: string;
  infoSubtitle: string;
  backToPortalMenu: string;

  // Food Menu, Timetable, Behaviour labels
  foodMenuTitle: string;
  foodMenuSubtitle: string;
  timetableTitle: string;
  timetableSubtitle: string;
  behaviourTitle: string;
  behaviourSubtitle: string;
  periodLabel: string;
  timeLabel: string;
  subjectTeacherLabel: string;
  classroomLabel: string;
  morningBreakLabel: string;
  lunchBreakLabel: string;
  sundayLabel: string;
  mondayLabel: string;
  tuesdayLabel: string;
  wednesdayLabel: string;
  thursdayLabel: string;
  conductStandingLabel: string;
  attendanceRateLabel: string;
  positiveNotesLabel: string;
  disciplinaryStandingLabel: string;
  commendationsLabel: string;
  counselorSignLabel: string;

  // Footer
  footerCopyright: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    schoolName: 'Dasinya Private School',
    schoolSubtitle: 'Grades 1 – 9 • Official Marksheets',
    departmentName: 'Department of Academic Affairs • Official Marksheet',
    marksheet: 'Marksheet',
    returnHome: 'Return to School Home',
    back: 'Back',
    printReport: 'Print Report',
    downloadPdf: 'Download PDF',
    generatingPdf: 'Generating PDF...',
    language: 'Language',
    officialPortal: 'Official Academic Portal',
    welcomeIntro: 'Welcome to the official institutional portal. Select Marksheet to access student evaluations and academic records.',
    officialRecordsSummary: '',

    globalSearchPlaceholder: 'Search all students...',
    studentSearchPlaceholder: 'Search student name or roll...',
    selectStudentPromptTitle: 'Select a Student to View Marksheet',
    selectStudentPromptDesc: 'Please choose a student name from Step 3 above or use the search box to view their official Term 1 evaluation.',
    selectStudentPlaceholder: 'Click to select or search student name...',
    selectStudentToView: 'Select student from list above to display marksheet',
    studentsAvailable: 'students registered',
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
    termWeightPolicy: 'Grades 1–3: Out of 25 • Grades 4–9: Out of 20',

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
    attendance: 'Attendance',
    presence: 'Presence',
    conduct: 'Exemplary',
    standing: 'Standing',
    guardianEmail: 'Guardian Email',
    guardianPassword: 'Guardian Password',

    rowNumber: '#',
    subject: 'Subject',
    term1MarkOutOf25: 'Term 1 Mark (out of 25)',
    term1MarkOutOf20: 'Term 1 Mark (out of 20)',
    totalMarks: 'Total Marks',
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
    evaluationPolicyNote: 'Term 1 Evaluation Policy',
    policyG1to3: 'Grades 1–3: Term 1 marks are evaluated out of 25 per subject (25% weight)',
    policyG4to9: 'Grades 4–9: Term 1 marks are evaluated out of 20 per subject (20% weight)',
    passingScoreNote: 'Passing Mark: 50% • Distinction: 85%+',
    portalSelectionTitle: 'Select Your Portal',
    portalSelectionSubtitle: 'Welcome to Dasinya Private School Portal System. Please choose your portal to sign in.',
    selectPortal: 'Select Portal',
    portalAdmin: 'Admin Portal',
    portalAdminDesc: 'Governance, school-wide registry, accounts & reporting',
    portalStaff: 'Staff Portal',
    portalStaffDesc: 'Student directories, class records & administrative services',
    portalTeacher: 'Teacher Portal',
    portalTeacherDesc: 'Class rosters, subject grade evaluations & attendance',
    portalParent: 'Parent Portal',
    portalParentDesc: 'Academic progress, marksheet, meal plans & timetable',
    portalStudent: 'Student Portal',
    portalStudentDesc: 'Student schedule, term marksheets, cafeteria & records',
    backToPortals: 'Back to Portal Selection',
    switchPortal: 'Switch Portal',
    authUsernamePassword: 'Username & Password',
    authPasswordOnly: 'Password Only',
    usernameLabel: 'Username',
    enterUsername: 'Enter your username',
    enterPassword: 'Enter your password',
    adminLoginTitle: 'Admin Portal Sign In',
    staffLoginTitle: 'Staff Portal Sign In',
    teacherLoginTitle: 'Teacher Portal Sign In',
    parentLoginTitle: 'Parent Portal Sign In',
    studentLoginTitle: 'Student Portal Sign In',
    invalidUsernameOrPassword: 'Invalid username or password. Please verify your credentials.',

    guardianLoginTitle: 'Guardian Portal Login',
    guardianLoginSubtitle: 'Sign in with your registered Guardian Email and Password to view your student\'s details and marksheets.',
    emailAddressLabel: 'Guardian Email Address',
    passwordLabel: 'Password',
    loginButtonLabel: 'Sign In to Portal',
    loggingInLabel: 'Authenticating...',
    logoutButtonLabel: 'Sign Out',
    invalidCredentialsError: 'Invalid guardian email or password. Please check your credentials.',
    guardianAccountTitle: 'Guardian Account',
    studentAccountDetails: 'Student Profile & Details',
    studentMarksheetTitle: 'Official Term 1 Marksheet',
    switchStudentLabel: 'Select Student / Child',
    registeredChildrenLabel: 'Registered Children',
    quickDemoTitle: 'Quick Demo / Test Accounts',
    quickDemoHint: 'Click any sample account to populate credentials',
    staffBrowseOption: 'School Administration View (Browse All)',
    backToGuardianLogin: 'Return to Guardian Login',

    tabInfo: 'INFO',
    tabMarksheet: 'MARKSHEET',
    tabFoodMenu: 'FOOD MENU',
    tabClassesTimetable: 'CLASSES TIMETABLE',
    tabBehaviourReport: 'BEHAVIOUR REPORT',
    infoSubtitle: 'Student personal profile and registration details',
    backToPortalMenu: 'Back to Menu',

    foodMenuTitle: 'Weekly Nutrition & Cafeteria Menu',
    foodMenuSubtitle: 'Healthy, balanced, and freshly prepared hot meals and fresh fruit snacks for students.',
    timetableTitle: 'Official Weekly Classes Timetable',
    timetableSubtitle: 'Standard instructional periods and weekly schedule (Sunday – Thursday).',
    behaviourTitle: 'Student Behaviour & Conduct Report',
    behaviourSubtitle: 'Official Term 1 disciplinary standing, attendance rate, and positive commendations.',
    periodLabel: 'Period',
    timeLabel: 'Time',
    subjectTeacherLabel: 'Subject & Instructor',
    classroomLabel: 'Classroom',
    morningBreakLabel: 'Morning Nutrition Break',
    lunchBreakLabel: 'Lunch & Recreation Break',
    sundayLabel: 'Sunday',
    mondayLabel: 'Monday',
    tuesdayLabel: 'Tuesday',
    wednesdayLabel: 'Wednesday',
    thursdayLabel: 'Thursday',
    conductStandingLabel: 'Conduct Standing',
    attendanceRateLabel: 'Term 1 Attendance Rate',
    positiveNotesLabel: 'Behavioral Observations & Positive Growth',
    disciplinaryStandingLabel: 'Disciplinary Record',
    commendationsLabel: 'Special Commendations & Strengths',
    counselorSignLabel: 'School Counselor & Disciplinary Committee',

    footerCopyright: 'Dasinya Private School • Academic Evaluation System',
  },

  ku: {
    // Kurdish
    schoolName: 'قوتابخانەیا داسنیا یا تایبەت',
    schoolSubtitle: 'قۆناغێن ١ – ٩ • کەشفا فەرمی یا نمران',
    departmentName: 'پشکا کارگێری و دەستەیا خواندنێ • کەشفا فەرمی یا نمران',
    marksheet: 'کەشفا نمران',
    returnHome: 'زڤڕین بۆ پەڕێ سەرەکی',
    back: 'زڤڕین',
    printReport: 'چاپکرنا راپۆرتێ',
    downloadPdf: 'داگرتنا PDF',
    generatingPdf: 'دروستکرنا فایلا PDF...',
    language: 'زمان',
    officialPortal: 'دەوازەیا فەرمی یا ئەکادیمی',
    welcomeIntro: 'بخێربێن بۆ دەوازەیا ئەکادیمی یا قوتابخانەیا داسنیا. کرتێ ل سەر کەشفا نمران بکە بۆ دیتنا کارتا نمرێت قوتابیان و پشکنینا پێشکەفتنا خواندنێ.',
    officialRecordsSummary: '',

    globalSearchPlaceholder: 'لێگەڕیان ل دووڤ قوتابیان...',
    studentSearchPlaceholder: 'ناڤێ قوتابی یان ژمارا تۆمارێ بنڤیسە...',
    selectStudentPromptTitle: 'هیڤیە ناڤێ قوتابیەکێ هەلبژێرە ژ بۆ دیتنا کەشفا نمران',
    selectStudentPromptDesc: 'ژ بۆ دیتنا کارتا فەرمی یا نمرەیێن وەرزێ ئێکێ، ناڤێ قوتابی ژ قۆناغ ٣ یا سەری هەلبژێرە یان ل دووڤ ناڤێ وی بگەڕە.',
    selectStudentPlaceholder: 'کرتێ بکە بۆ هەلبژارتن یان لێگەڕیانا ناڤێ قوتابی...',
    selectStudentToView: 'قوتابیەکێ ژ لیستا سەری هەلبژێرە دا کارتا نمران دەربکەڤیت',
    studentsAvailable: 'قوتابیێن تۆمارکری',
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
    termWeightPolicy: 'قۆناغێن ١-٣: نمرە ژ ٢٥ • قۆناغێن ٤-٩: نمرە ژ ٢٠',

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
    attendance: 'ئامادەبوون',
    presence: 'ئامادەبوون',
    conduct: 'رەوشت باش',
    standing: 'ئاست',
    guardianEmail: 'ئیمەیڵێ بەخێوکەری',
    guardianPassword: 'تێپەڕەواژەیا بەخێوکەری',

    rowNumber: '#',
    subject: 'بابەتێ خواندنێ',
    term1MarkOutOf25: 'نمرەیا وەرزێ ئێکێ (ژ ٢٥)',
    term1MarkOutOf20: 'نمرەیا وەرزێ ئێکێ (ژ ٢٠)',
    totalMarks: 'کۆما نمران',
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
    evaluationPolicyNote: 'یاسایا هەلسەنگاندنا نمرەیێن وەرزێ ئێکێ',
    policyG1to3: 'قۆناغێن ١ هەتا ٣: نمرەیێن وەرزێ ئێکێ ژ ٢٥ نمرانە بۆ هەر بابەتەکی (٢٥٪)',
    policyG4to9: 'قۆناغێن ٤ هەتا ٩: نمرەیێن وەرزێ ئێکێ ژ ٢٠ نمرانە بۆ هەر بابەتەکی (٢٠٪)',
    passingScoreNote: 'نمرەیا دەربازبوونێ: ٥٠٪ • پلەیا نایاب: ٨٥٪+',
    portalSelectionTitle: 'دەرگەهێ خۆ هەڵبژێرە',
    portalSelectionSubtitle: 'ب خێر بێین بۆ سیستەمێ دەرگەهێن قوتابخانا داسنیا یا تایبەت. تکایە پۆرتالێ گونجای هەڵبژێرە.',
    selectPortal: 'هەڵبژارتنا دەرگەهی',
    portalAdmin: 'دەرگەهێ ئەدمینی',
    portalAdminDesc: 'بەڕێوەبردن، تۆماری گشتی یێ قوتابخانێ، هەژمار و راپۆرت',
    portalStaff: 'دەرگەهێ کارگێڕی',
    portalStaffDesc: 'تۆمارێن قوتابیان، خشتە و خزمەتگوزاریێن کارگێڕی',
    portalTeacher: 'دەرگەهێ مامۆستایان',
    portalTeacherDesc: 'لیستێن پۆلان، هەلسەنگاندنا نمرەیان و ئامادەبوون',
    portalParent: 'دەرگەهێ دایک و باوکان',
    portalParentDesc: 'پێشکەوتنا زانستی، کارتا نمرەیان، مێنیوێ خوارنێ و خشتە',
    portalStudent: 'دەرگەهێ قوتابیان',
    portalStudentDesc: 'خشتەیێ قوتابی، نمرەیێن وەرزی، خارنگەهـ و تۆمار',
    backToPortals: 'زڤرین بۆ هەڵبژارتنا دەرگەهان',
    switchPortal: 'گوهۆڕینا دەرگەهی',
    authUsernamePassword: 'ناڤێ بەکارهێنەری و وشەی تێپەڕبوون',
    authPasswordOnly: 'ب تەنێ وشەی تێپەڕبوون',
    usernameLabel: 'ناڤێ بەکارهێنەری',
    enterUsername: 'ناڤێ بەکارهێنەری بنووسە',
    enterPassword: 'وشەی تێپەڕبوون بنووسە',
    adminLoginTitle: 'چوونەژوورا ئەدمینی',
    staffLoginTitle: 'چوونەژوورا کارگێڕی',
    teacherLoginTitle: 'چوونەژوورا مامۆستایان',
    parentLoginTitle: 'چوونەژوورا دایک و باوکان',
    studentLoginTitle: 'چوونەژوورا قوتابیان',
    invalidUsernameOrPassword: 'ناڤێ بەکارهێنەری یان وشەی تێپەڕبوون هەڵەیە. تکایە دووبارە بپشکنە.',

    guardianLoginTitle: 'چوونا ژوورێ یا بێخێڤی',
    guardianLoginSubtitle: 'ب ئیمەیل و تێپەڕەواژەیا (پاسوۆردێ) بێخێڤێ قۆتابی بچە ژوور دا پێزانین و کارتا نمرەیێن قۆتابییێ خۆ ببینی.',
    emailAddressLabel: 'ئیمەیڵێ بەخێوکەری',
    passwordLabel: 'تێپەڕەواژە (پاسوۆرد)',
    loginButtonLabel: 'چوونە ژوور بۆ پۆرتالێ',
    loggingInLabel: 'پشکنینا پێزانینان...',
    logoutButtonLabel: 'دەركەفتن',
    invalidCredentialsError: 'ئیمەیل یان تێپەڕەواژە یا خەلەتە. هیڤیە پێزانینێن خۆ پشتڕاست بکە.',
    guardianAccountTitle: 'هەژمارا بەخێوکەری',
    studentAccountDetails: 'پێزانین و پڕۆفایلا قوتابی',
    studentMarksheetTitle: 'کارتا فەرمی یا نمرەیێن وەرزێ ئێکێ',
    switchStudentLabel: 'هەلبژارتنا قوتابی / زارۆکی',
    registeredChildrenLabel: 'زارۆکێن تۆمارکری',
    quickDemoTitle: 'هەژمارێن نموونەیی بۆ تاقیکردنێ',
    quickDemoHint: 'کرتێ ل هەر هەژمارەکێ بکە دا ب ساناهی بچیە ژوور',
    staffBrowseOption: 'دیتنا کارگێڕیا قوتابخانێ (پشکنینا گشتی)',
    backToGuardianLogin: 'زڤڕین بۆ چوونا ژوورێ یا بێخێڤی',

    tabInfo: 'پێزانین',
    tabMarksheet: 'کەشفا نمران',
    tabFoodMenu: 'مێنیویا خوارنێ',
    tabClassesTimetable: 'خشتەیێ دەوامێ',
    tabBehaviourReport: 'راپۆرتا سلوکی',
    infoSubtitle: 'پێزانین و پڕۆفایلا فەرمی یا قوتابی',
    backToPortalMenu: 'زڤڕین بۆ مێنیویا سەرەکی',

    foodMenuTitle: 'مێنیویا خوارنێ یا حەفتیانە',
    foodMenuSubtitle: 'خوارنێن ساخلەم و هەمەجۆر دگەل میوەیێن تەڕ و تازە بۆ قوتابیان.',
    timetableTitle: 'خشتەیێ حەفتیانە یێ وانان',
    timetableSubtitle: 'دەواما فەرمی یا وانان (ئێک شەمبی هەتا پێنج شەمبی) یا ڤێ هۆبێ.',
    behaviourTitle: 'راپۆرتا فەرمی یا سلوک و رەوشتێ قوتابی',
    behaviourSubtitle: 'هەلسەنگاندنا رەوشت، پابەندبوون ب دەوامی، و دەستخۆشیێن مامۆستایان بۆ وەرزێ ئێکێ.',
    periodLabel: 'وانە',
    timeLabel: 'دەمژمێر',
    subjectTeacherLabel: 'بابەت و مامۆستا',
    classroomLabel: 'پۆل',
    morningBreakLabel: 'بێنڤەدانا سپێدێ و خوارنا سڤک',
    lunchBreakLabel: 'بێنڤەدانا فراڤینێ',
    sundayLabel: 'ئێک شەمبی',
    mondayLabel: 'دوو شەمبی',
    tuesdayLabel: 'سێ شەمبی',
    wednesdayLabel: 'چوار شەمبی',
    thursdayLabel: 'پێنج شەمبی',
    conductStandingLabel: 'ئاستێ رەوشتی',
    attendanceRateLabel: 'رێژەیا ئامادەبوونێ یا وەرزێ ئێکێ',
    positiveNotesLabel: 'تێبینیێن ئەرێنی و پێشکەفتنا سلوکی',
    disciplinaryStandingLabel: 'تۆمارا پابەندبوونێ',
    commendationsLabel: 'دەستخۆشی و رێزلێنان',
    counselorSignLabel: 'رێبەرێ دەروونی و لژنەیا رەوشتی',

    footerCopyright: 'قوتابخانەیا داسنیا یا تایبەت • سیستەمێ هەلسەنگاندنا ئەکادیمی',
  },

  ar: {
    // Arabic
    schoolName: 'مدرسة داسنيا الأهلية',
    schoolSubtitle: 'الصفوف ١ – ٩ • كشف الدرجات الرسمي',
    departmentName: 'قسم الشؤون التعليمية والامتحانات • كشف الدرجات الرسمي',
    marksheet: 'كشف الدرجات',
    returnHome: 'العودة للصفحة الرئيسية',
    back: 'رجوع',
    printReport: 'طباعة التقرير',
    downloadPdf: 'تنزيل PDF',
    generatingPdf: 'جاري إنشاء ملف PDF...',
    language: 'اللغة',
    officialPortal: 'البوابة الأكاديمية الرسمية',
    welcomeIntro: 'مرحباً بكم في البوابة الرسمية لمدرسة داسنيا الأهلية. اضغط على كشف الدرجات للاطلاع على بطاقات التقويم الأكاديمي وسجلات الطلاب.',
    officialRecordsSummary: '',

    globalSearchPlaceholder: 'بحث في سجل الطلاب...',
    studentSearchPlaceholder: 'ابحث باسم الطالب أو رقم القيد...',
    selectStudentPromptTitle: 'يرجى اختيار اسم الطالب لعرض كشف الدرجات',
    selectStudentPromptDesc: 'يرجى اختيار اسم الطالب من الخطوة ٣ أعلاه أو استخدام مربع البحث لعرض تقييم الفصل الدراسي الأول الرسمي.',
    selectStudentPlaceholder: 'اضغط لاختيار اسم الطالب أو البحث...',
    selectStudentToView: 'اختر طالباً من القائمة أعلاه لعرض كشف الدرجات',
    studentsAvailable: 'طالب مسجل',
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
    termWeightPolicy: 'الصفوف ١-٣: الدرجة من ٢٥ • الصفوف ٤-٩: الدرجة من ٢٠',

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
    attendance: 'الحضور',
    presence: 'حضور',
    conduct: 'سلوك مثالي',
    standing: 'المرتبة',
    guardianEmail: 'بريد ولي الأمر الإلكتروني',
    guardianPassword: 'كلمة مرور ولي الأمر',

    rowNumber: '#',
    subject: 'المادة الدراسية',
    term1MarkOutOf25: 'درجة الفصل الأول (من ٢٥)',
    term1MarkOutOf20: 'درجة الفصل الأول (من ٢٠)',
    totalMarks: 'مجموع الدرجات',
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
    evaluationPolicyNote: 'نظام تقييم درجات الفصل الأول',
    policyG1to3: 'الصفوف ١ إلى ٣: درجات الفصل الأول من ٢٥ درجة لكل مادة (٢٥٪)',
    policyG4to9: 'الصفوف ٤ إلى ٩: درجات الفصل الأول من ٢٠ درجة لكل مادة (٢٠٪)',
    passingScoreNote: 'درجة النجاح: ٥٠٪ • الامتياز: ٨٥٪ فما فوق',
    portalSelectionTitle: 'اختر البوابة المناسبة',
    portalSelectionSubtitle: 'مرحباً بكم في نظام بوابات مدرسة داسنيا الأهلية. يرجى اختيار البوابة لتسجيل الدخول.',
    selectPortal: 'اختيار البوابة',
    portalAdmin: 'بوابة الإدارة',
    portalAdminDesc: 'الإدارة العامة، السجل المدرسي الشامل، الحسابات والتقارير',
    portalStaff: 'بوابة الكادر الإداري',
    portalStaffDesc: 'سجلات الطلاب، كشوف الشعب والخدمات الإدارية',
    portalTeacher: 'بوابة المعلمين',
    portalTeacherDesc: 'كشوف الحصص، تقييم درجات المواد والغيابات',
    portalParent: 'بوابة أولياء الأمور',
    portalParentDesc: 'التقدم الدراسي، كشوف الدرجات، جدول الوجبات والدوام',
    portalStudent: 'بوابة الطلاب',
    portalStudentDesc: 'الجدول المدرسي، درجات الفصل، وجبات الكافتيريا والسجلات',
    backToPortals: 'العودة لاختيار البوابة',
    switchPortal: 'تبديل البوابة',
    authUsernamePassword: 'اسم المستخدم وكلمة المرور',
    authPasswordOnly: 'بكلمة المرور فقط',
    usernameLabel: 'اسم المستخدم',
    enterUsername: 'أدخل اسم المستخدم',
    enterPassword: 'أدخل كلمة المرور',
    adminLoginTitle: 'تسجيل دخول الإدارة',
    staffLoginTitle: 'تسجيل دخول الكادر الإداري',
    teacherLoginTitle: 'تسجيل دخول المعلمين',
    parentLoginTitle: 'تسجيل دخول أولياء الأمور',
    studentLoginTitle: 'تسجيل دخول الطلاب',
    invalidUsernameOrPassword: 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مرة أخرى.',

    guardianLoginTitle: 'تسجيل دخول ولي الأمر',
    guardianLoginSubtitle: 'سجل الدخول باستخدام البريد الإلكتروني وكلمة المرور لولي الأمر لعرض بيانات الطالب وكشوف الدرجات.',
    emailAddressLabel: 'البريد الإلكتروني لولي الأمر',
    passwordLabel: 'كلمة المرور',
    loginButtonLabel: 'دخول إلى البوابة',
    loggingInLabel: 'جاري التحقق...',
    logoutButtonLabel: 'تسجيل الخروج',
    invalidCredentialsError: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات والمحاولة مجدداً.',
    guardianAccountTitle: 'حساب ولي الأمر',
    studentAccountDetails: 'ملف وبيانات الطالب',
    studentMarksheetTitle: 'كشف درجات الفصل الأول الرسمي',
    switchStudentLabel: 'اختر الطالب / الابن',
    registeredChildrenLabel: 'الطلاب المسجلون',
    quickDemoTitle: 'حسابات تجريبية سريعة',
    quickDemoHint: 'اضغط على أي حساب لتعبئة البيانات تلقائياً',
    staffBrowseOption: 'عرض إدارة المدرسة (تصفح جميع الصفوف)',
    backToGuardianLogin: 'العودة لتسجيل دخول ولي الأمر',

    tabInfo: 'المعلومات',
    tabMarksheet: 'كشف الدرجات',
    tabFoodMenu: 'قائمة الطعام',
    tabClassesTimetable: 'جدول الحصص',
    tabBehaviourReport: 'تقرير السلوك',
    infoSubtitle: 'البيانات الشخصية وسجل القيد المدرسي',
    backToPortalMenu: 'العودة للقائمة الرئيسية',

    foodMenuTitle: 'قائمة الوجبات الغذائية الأسبوعية',
    foodMenuSubtitle: 'وجبات صحية متوازنة وطازجة يومياً مع وجبات الفواكه الصحية للطلاب.',
    timetableTitle: 'جدول الحصص الأسبوعي المعتمد',
    timetableSubtitle: 'الجدول الدراسي واليومي المعتمد (من الأحد إلى الخميس) لهذا الصف.',
    behaviourTitle: 'تقرير السلوك والمواظبة الأكاديمية',
    behaviourSubtitle: 'التقييم السلوكي الرسمي للفصل الدراسي الأول ونسبة الحضور وملاحظات التميز.',
    periodLabel: 'الحصة',
    timeLabel: 'الوقت',
    subjectTeacherLabel: 'المادة والمدرس',
    classroomLabel: 'القاعة',
    morningBreakLabel: 'استراحة الصباح والوجبة الخفيفة',
    lunchBreakLabel: 'استراحة الغداء والراحة',
    sundayLabel: 'الأحد',
    mondayLabel: 'الإثنين',
    tuesdayLabel: 'الثلاثاء',
    wednesdayLabel: 'الأربعاء',
    thursdayLabel: 'الخميس',
    conductStandingLabel: 'المستوى السلوكي',
    attendanceRateLabel: 'نسبة الحضور للفصل الأول',
    positiveNotesLabel: 'الملاحظات السلوكية والتطور الإيجابي',
    disciplinaryStandingLabel: 'سجل الانضباط والمواظبة',
    commendationsLabel: 'كتب الشكر والتقدير والنقاط الإيجابية',
    counselorSignLabel: 'المرشد التربوي ولجنة الانضباط',

    footerCopyright: 'مدرسة داسنيا الأهلية • نظام التقييم الأكاديمي',
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

