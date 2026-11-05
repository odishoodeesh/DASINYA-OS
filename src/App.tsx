/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download,
  Loader2,
  Award, 
  GraduationCap, 
  Calendar, 
  CalendarDays,
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  User,
  School,
  FileCheck,
  Search,
  Filter,
  Users,
  Heart,
  Phone,
  FileText,
  X,
  ChevronDown,
  Globe,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Utensils,
  Clock,
  Star,
  Coffee,
  HeartHandshake,
  Building,
  BookOpen,
  UserCheck,
  Layers
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IMPORTED_STUDENTS, StudentRecord, SubjectMark } from './data/importedStudents';
import { 
  getClassTimetable, 
  OFFICIAL_TIMETABLE_PERIODS 
} from './data/classSchedules';
import { 
  Language, 
  SUPPORTED_LANGUAGES, 
  TRANSLATIONS, 
  formatGradeLabel, 
  formatClassLabel, 
  getTranslatedSubject, 
  getTranslatedCategory
} from './lib/translations';

export const SCHOOL_LOGO_URL = 'https://i.ibb.co/sdrcN4PL/logo-dasinya-2.png';

export type PortalRole = 'admin' | 'staff' | 'teacher' | 'parent' | 'student';

// Official Dasinya Private School Class Structure
export const SCHOOL_STRUCTURE: Record<string, string[]> = {
  'Grade 1': ['Class A', 'Class B', 'Class C'],
  'Grade 2': ['Class A', 'Class B', 'Class C'],
  'Grade 3': ['Class A', 'Class B', 'Class E'],
  'Grade 4': ['Class A', 'Class B'],
  'Grade 5': ['Class A', 'Class B'],
  'Grade 6': ['Class A'],
  'Grade 7': ['Class A', 'Class B'],
  'Grade 8': ['Class A', 'Class C'],
  'Grade 9': ['Class A'],
};

// Official Dasinya Private School Subjects Catalog
export const OFFICIAL_SUBJECTS = [
  { name: 'English', code: 'ENG', category: 'Language' },
  { name: 'Kurdish', code: 'KUR', category: 'Language' },
  { name: 'Arabic', code: 'ARA', category: 'Language' },
  { name: 'Math', code: 'MTH', category: 'STEM' },
  { name: 'Science', code: 'SCI', category: 'STEM' },
  { name: 'IT', code: 'ITC', category: 'Technology' },
  { name: 'Social Studies', code: 'SST', category: 'Humanities' },
  { name: 'KOMALAYETI', code: 'KOM', category: 'Humanities' },
  { name: 'KARAMAYI', code: 'KRM', category: 'Applied' },
  { name: 'Conversation', code: 'CNV', category: 'Language' },
  { name: 'Moral Values', code: 'MRV', category: 'Ethics' },
  { name: 'Religion', code: 'REL', category: 'Ethics' },
  { name: 'Art', code: 'ART', category: 'Arts & Sports' },
  { name: 'Music', code: 'MUS', category: 'Arts & Sports' },
  { name: 'PE', code: 'PED', category: 'Arts & Sports' },
];

export type PortalTab = 'info' | 'marksheet' | 'food_menu' | 'timetable' | 'behaviour' | null;

interface AuthenticatedGuardian {
  password: string;
  email?: string;
  students: StudentRecord[];
}

interface AuthenticatedStaff {
  role: 'admin' | 'staff' | 'teacher';
  username: string;
  name: string;
}

// Weekly Cafeteria Nutrition Schedule (Sunday to Thursday)
export const WEEKLY_FOOD_MENU = [
  {
    dayKey: 'sunday',
    dayEn: 'Sunday',
    dayKu: 'ئێک شەمبی',
    dayAr: 'الأحد',
    mainDishEn: 'Grilled Lemon Herb Chicken Breast with Steamed Fragrant Basmati Rice',
    mainDishKu: 'سنگێ مریشکێ یێ برژاندی ب بهاراتێن لیمۆنێ دگەل برنجێ کوردی یێ کەلاندی',
    mainDishAr: 'صدر دجاج مشوي بالليمون والأعشاب مع أرز بسمتي بالبخار',
    sideDishEn: 'Warm Yellow Lentil Soup & Fresh Kurdish Garden Salad',
    sideDishKu: 'شۆربایا نیسکێ یا زەرد و زەڵاتەیا باخچەیی یا تەڕ',
    sideDishAr: 'شوربة عدس أصفر دافئة وسلطة خضراء طازجة بزيت الزيتون',
    snackEn: 'Crisp Red Apple Slices & Whole Wheat Breadstick',
    snackKu: 'سێڤێن سۆرێن قەرمۆچک و نانێ گەنمێ تەڕ',
    snackAr: 'شرائح تفاح أحمر طازج وخبز قمح كامل مقرمش',
    beverageEn: 'Fresh Laban (Ayran) & Mineral Spring Water',
    beverageKu: 'دەوێ تەڕ و فێنک و ئاڤا کانیا یا پاقژ',
    beverageAr: 'لبن عيران بارد ومياه معدنية نقية',
    calories: '540 kcal',
    tags: ['High Protein', 'Halal', 'Nut-Free']
  },
  {
    dayKey: 'monday',
    dayEn: 'Monday',
    dayKu: 'دوو شەمبی',
    dayAr: 'الاثنين',
    mainDishEn: 'Traditional Home-style Kurdish Dolma (Stuffed Grape Leaves & Summer Squash)',
    mainDishKu: 'دۆلمەیا خۆمالی یا کوردی یا گەرم دگەل گەلایێن مێوێ و کوزیان',
    mainDishAr: 'دولمة كوردية تقليدية محشوة بأوراق العنب والكوسا الطازجة',
    sideDishEn: 'Creamy Cucumber & Mint Strained Yogurt',
    sideDishKu: 'ماست و خەیارێن هوورکری دگەل نەعناعێ و زەیتا زەیتوونێ',
    sideDishAr: 'سلطة لبن زبادي بالخيار والنعناع وزيت الزيتون',
    snackEn: 'Fresh Sweet Pears & Medjool Dates',
    snackKu: 'هرمیێن شیرین و خورمایێن مەدجوول',
    snackAr: 'إجاص حلو المذاق وتمر مجدول طبيعي',
    beverageEn: 'Natural Pomegranate & Fresh Berry Infusion',
    beverageKu: 'ئاڤا هەنارێ یا سروشتی دگەل شەربەتا تووران',
    beverageAr: 'عصير رمان وتوت طبيعي بارد ومياه نقية',
    calories: '580 kcal',
    tags: ['Traditional', 'Halal', 'Nut-Free']
  },
  {
    dayKey: 'tuesday',
    dayEn: 'Tuesday',
    dayKu: 'سێ شەمبی',
    dayAr: 'الثلاثاء',
    mainDishEn: 'Slow-Cooked Tender Beef Stew with Sweet Carrots, Green Peas & Vermicelli Rice',
    mainDishKu: 'شلانکا گۆشتێ کەڤری دگەل بەزلە و گێزەران و برنجێ شعرەیێ',
    mainDishAr: 'مرق لحم العجل الطري مع البازلاء والجزر ورز بالشعرية',
    sideDishEn: 'Fresh Mediterranean Cabbage & Lemon Salad',
    sideDishKu: 'زەڵاتەیا کەلەمی دگەل ئاڤا لیمۆنێ و زەیتا زەیتوونێ',
    sideDishAr: 'سلطة ملفوف متوسطية بزيت الزيتون والليمون',
    snackEn: 'Sweet Orange Wedges & Cavendish Banana',
    snackKu: 'پرتەقالێن شرین و مۆزێن تەڕ',
    snackAr: 'شرائح برتقال حلو وموز طازج',
    beverageEn: 'Freshly Squeezed Orange Juice & Mineral Water',
    beverageKu: 'ئاڤا پرتەقالان یا تەڕ و ئاڤا پاقژ',
    beverageAr: 'عصير برتقال طبيعي معصور طازجاً ومياه نقية',
    calories: '560 kcal',
    tags: ['Rich in Iron', 'Halal', 'Nut-Free']
  },
  {
    dayKey: 'wednesday',
    dayEn: 'Wednesday',
    dayKu: 'چوار شەمبی',
    dayAr: 'الأربعاء',
    mainDishEn: 'Baked Herb-Crusted Fish Fillet (or Chicken Escalope) with Creamy Mashed Potatoes',
    mainDishKu: 'فیلێ ماسیێ یێ برژاندی دگەل پەتاتێن پۆڕە یێن نەرم',
    mainDishAr: 'فيليه سمك مشوي بالأعشاب (أو إسكالوب دجاج) مع بطاطا بوريه كريمية',
    sideDishEn: 'Steamed Sweet Corn, Broccoli Florets & Garden Vegetable Soup',
    sideDishKu: 'گەنمەشامی و برۆکلیێ کەلاندی دگەل شۆربایا کەسکاتیێ',
    sideDishAr: 'ذرة حلوة وبروكلي على البخار مع شوربة خضار مشكلة',
    snackEn: 'Warm Oatmeal Raisin Biscuit & Mixed Dried Fruits',
    snackKu: 'بسکویتا شۆفان دگەل مێوژ و فێقیێ هشککری',
    snackAr: 'بسكويت الشوفان بالزبيب مع فواكه مجففة طبيعية',
    beverageEn: 'Calcium-Fortified Milk & Mineral Water',
    beverageKu: 'شیری ساخلەم یێ پاقژ و ئاڤا کانیا',
    beverageAr: 'حليب طازج مدعم بالكالسيوم ومياه معدنية',
    calories: '525 kcal',
    tags: ['Omega-3 Rich', 'Halal', 'Nut-Free']
  },
  {
    dayKey: 'thursday',
    dayEn: 'Thursday',
    dayKu: 'پێنج شەمبی',
    dayAr: 'الخميس',
    mainDishEn: 'Chef\'s Artisan Margherita Stone-Baked Pizza Slice with Lean Mozzarella',
    mainDishKu: 'پیتزایا مارگریتا یا تەنوورێ دگەل پەنیری مۆزارێلا یێ ساخلەم',
    mainDishAr: 'بيتزا مارغريتا مخبوزة على الحجر مع جبن موزاريلا قليل الدسم',
    sideDishEn: 'Fresh Tomato Basil Soup & Crunchy Veggie Batons',
    sideDishKu: 'شۆربایا تەماتێ دگەل ریحانێ و گێزەرێن قەرمۆچک',
    sideDishAr: 'شوربة طماطم بالريحان وأصابع خضار مقرمشة',
    snackEn: 'Mixed Berry & Fruit Medley (Strawberries, Grapes & Melon)',
    snackKu: 'فێقیێ تێکەل یێ تەڕ (شلیک، تری، گندۆر)',
    snackAr: 'سلطة فواكه مشكلة (فراولة، عنب، شمام)',
    beverageEn: 'Fresh Pomegranate Nectar & Mineral Water',
    beverageKu: 'شەربەتا هەنارێ یا خۆش و ئاڤا پاقژ',
    beverageAr: 'عصير رمان طازج ومياه معدنية نقية',
    calories: '530 kcal',
    tags: ['Student Favorite', 'Halal', 'Nut-Free']
  }
];

// Timetable period time slots (Official 7 periods + 2 breaks from aSc Timetables)
export const TIMETABLE_SLOTS = OFFICIAL_TIMETABLE_PERIODS;

export default function App() {
  const [students] = useState<StudentRecord[]>(IMPORTED_STUDENTS);
  const [language, setLanguage] = useState<Language>('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // FIRST PAGE: Portal Selection (null = portal selection landing page)
  const [selectedPortal, setSelectedPortal] = useState<PortalRole | null>(null);

  // Authentication State for Parent & Student (Password Only)
  const [authGuardian, setAuthGuardian] = useState<AuthenticatedGuardian | null>(null);

  // Authentication State for Admin, Staff, Teacher (Username & Password)
  const [authStaff, setAuthStaff] = useState<AuthenticatedStaff | null>(null);

  // Form input states
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active student in parent/student account (when parent has multiple children)
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // The 5 Options: When logging in, user ONLY sees these 5 buttons: INFO, MARKSHEET, FOOD MENU, CLASSES TIMETABLE, BEHAVIOUR REPORT
  // Default is null so user sees ONLY the 5 buttons first!
  const [activePortalTab, setActivePortalTab] = useState<PortalTab>(null);

  // Active day selection for Timetable
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<string>('all');

  // Category filter for marksheet
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Administrative / Teacher View State
  const officialGrades = useMemo(() => Object.keys(SCHOOL_STRUCTURE), []);
  const [staffGrade, setStaffGrade] = useState<string>('Grade 1');
  const [staffClass, setStaffClass] = useState<string>('Class A');
  const [staffStudentId, setStaffStudentId] = useState<string>('');
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');

  // Sub-tabs for Teacher / Staff
  const [teacherTab, setTeacherTab] = useState<'roster' | 'timetable'>('roster');
  const [staffTab, setStaffTab] = useState<'students' | 'timetables' | 'food_menu'>('students');

  // Quick modal for inspecting student marksheet in Staff/Teacher/Admin
  const [modalStudent, setModalStudent] = useState<StudentRecord | null>(null);

  // Translations dictionary for active language
  const t = useMemo(() => TRANSLATIONS[language], [language]);
  const isRtl = language === 'ku' || language === 'ar';

  // Synchronize HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRtl, language]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Login
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    if (selectedPortal === 'parent' || selectedPortal === 'student') {
      // PARENTS & STUDENTS: LOG IN BY PASSWORD ONLY
      const pwdToVerify = loginPassword.trim();
      if (!pwdToVerify) {
        setLoginError(
          language === 'ku'
            ? 'تکایە وشەی تێپەڕبوون بنووسە'
            : language === 'ar'
            ? 'يرجى إدخال كلمة المرور'
            : 'Please enter your password'
        );
        setIsLoggingIn(false);
        return;
      }

      const matched = students.filter(s => 
        (s.guardianPassword && s.guardianPassword.trim() === pwdToVerify) ||
        (s.guardianPasswordAlt && s.guardianPasswordAlt.trim() === pwdToVerify)
      );

      if (matched.length > 0) {
        const session: AuthenticatedGuardian = {
          password: pwdToVerify,
          email: matched[0].guardianEmail || '',
          students: matched
        };
        setAuthGuardian(session);
        setSelectedChildId(matched[0].id);
        setActivePortalTab(null); // When log in, user ONLY sees the 5 buttons first!
        setLoginError('');
        setLoginPassword('');
        setSelectedCategory('All');
      } else {
        setLoginError(
          language === 'ku'
            ? 'وشەی تێپەڕبوون هەڵەیە. تکایە وشەی تێپەڕبوونەکەت بپشکنە و دووبارە هەوڵبدەوە.'
            : language === 'ar'
            ? 'كلمة المرور غير صحيحة. يرجى التأكد من كلمة المرور والمحاولة مرة أخرى.'
            : 'Invalid password. Please check your password and try again.'
        );
      }
    } else {
      // ADMIN, STAFF, TEACHER: LOG IN WITH USERNAME AND PASSWORD
      const u = loginUsername.trim().toLowerCase();
      const p = loginPassword.trim();

      if (!u || !p) {
        setLoginError(
          language === 'ku'
            ? 'تکایە ناڤێ بەکارهێنەری و وشەی تێپەڕبوون بنووسە'
            : language === 'ar'
            ? 'يرجى إدخال اسم المستخدم وكلمة المرور'
            : 'Please enter both username and password'
        );
        setIsLoggingIn(false);
        return;
      }

      if (selectedPortal === 'admin') {
        if ((u === 'admin' || u === 'dasinya.admin') && (p === 'admin123' || p === 'dasinya2025' || p === 'admin')) {
          setAuthStaff({ role: 'admin', username: u, name: 'Principal / School Administrator' });
          setLoginError('');
          setLoginUsername('');
          setLoginPassword('');
        } else {
          setLoginError(t.invalidUsernameOrPassword);
        }
      } else if (selectedPortal === 'staff') {
        if ((u === 'staff' || u === 'office' || u === 'dasinya.staff') && (p === 'staff123' || p === 'office123' || p === 'staff')) {
          setAuthStaff({ role: 'staff', username: u, name: 'Academic Affairs & Registrar' });
          setLoginError('');
          setLoginUsername('');
          setLoginPassword('');
        } else {
          setLoginError(t.invalidUsernameOrPassword);
        }
      } else if (selectedPortal === 'teacher') {
        if ((u === 'teacher' || u === 'farhad' || u === 'delsoz' || u === 'dasinya.teacher') && (p === 'teacher123' || p === 'teacher')) {
          setAuthStaff({ role: 'teacher', username: u, name: 'Mr. Farhad Harki (Faculty)' });
          setLoginError('');
          setLoginUsername('');
          setLoginPassword('');
        } else {
          setLoginError(t.invalidUsernameOrPassword);
        }
      }
    }
    setIsLoggingIn(false);
  };

  // Sign out / Back to Portal Selection
  const handleSignOut = () => {
    setAuthGuardian(null);
    setAuthStaff(null);
    setSelectedChildId('');
    setActivePortalTab(null);
    setSelectedPortal(null);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
  };

  // Switch Portal (returns to selection screen without clearing sessions)
  const handleSwitchPortal = () => {
    setSelectedPortal(null);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
  };

  // Active student in Parent/Student portal
  const activeGuardianStudent = useMemo(() => {
    if (!authGuardian || !authGuardian.students.length) return null;
    return authGuardian.students.find(s => s.id === selectedChildId) || authGuardian.students[0];
  }, [authGuardian, selectedChildId]);

  // Active student in Staff/Teacher/Admin view
  const activeStaffStudent = useMemo(() => {
    if (modalStudent) return modalStudent;
    if (!staffStudentId) {
      const firstInClass = students.find(s => s.grade === staffGrade && s.section === staffClass);
      return firstInClass || students[0];
    }
    const found = students.find(s => s.id === staffStudentId);
    if (found && found.grade === staffGrade && found.section === staffClass) {
      return found;
    }
    return null;
  }, [staffStudentId, staffGrade, staffClass, students, modalStudent]);

  // Overall active student to display marksheet for
  const currentStudent = (selectedPortal === 'parent' || selectedPortal === 'student')
    ? activeGuardianStudent 
    : activeStaffStudent;

  // Grade number for weighting calculation: 25 for 1-2-3, 20 for 4-5-6-7-8-9
  const gradeNum = useMemo(() => {
    if (!currentStudent) return 1;
    return parseInt(currentStudent.grade.replace(/\D/g, ''), 10) || 1;
  }, [currentStudent]);

  const isPrimary25 = gradeNum <= 3; // Grades 1, 2, 3 have 25% weight per term
  const maxTermMark = isPrimary25 ? 25 : 20;

  // Helper to get Term 1 mark for any subject out of 25 or 20
  const getSubjectTerm1Mark = (rawMark: number): number => {
    const scaled = (rawMark / 100) * maxTermMark;
    return Number(scaled.toFixed(1));
  };

  // Filtered subjects based on category selection
  const displayedSubjects = useMemo(() => {
    if (!currentStudent) return [];
    if (selectedCategory === 'All') return currentStudent.subjects;
    
    return currentStudent.subjects.filter(sub => {
      const match = OFFICIAL_SUBJECTS.find(o => o.name === sub.subject);
      return match ? match.category === selectedCategory : true;
    });
  }, [currentStudent, selectedCategory]);

  // Calculate totals across displayed subjects for Term 1
  const reportTotals = useMemo(() => {
    if (!currentStudent || !displayedSubjects.length) {
      return { totalMax: 0, totalObtained: 0, maxTermMark };
    }
    const totalMax = displayedSubjects.length * maxTermMark;
    const totalObtained = displayedSubjects.reduce((sum, s) => {
      const mark = Number(((s.obtainedMarks / 100) * maxTermMark).toFixed(1));
      return sum + mark;
    }, 0);

    return { 
      totalMax, 
      totalObtained: Number(totalObtained.toFixed(1)), 
      maxTermMark 
    };
  }, [currentStudent, displayedSubjects, maxTermMark]);

  // Direct client-side PDF Download using html2canvas and jsPDF
  const handleDownloadPdf = async (targetElementId = 'printable-marksheet', filenameSuffix = 'Marksheet') => {
    const element = document.getElementById(targetElementId);
    if (!element || isGeneratingPdf || !currentStudent) return;

    try {
      setIsGeneratingPdf(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printWidth = pdfWidth - margin * 2;
      const printHeight = (canvas.height * printWidth) / canvas.width;

      pdf.addImage(
        imgData, 
        'PNG', 
        margin, 
        margin, 
        printWidth, 
        Math.min(printHeight, pdfHeight - margin * 2)
      );

      const studentNameClean = (currentStudent.name || 'Student').replace(/\s+/g, '_');
      pdf.save(`${studentNameClean}_Term1_${filenameSuffix}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // CSV Export for Admin
  const handleExportCsv = () => {
    const headers = ['Serial', 'ID', 'Name', 'Grade', 'Section', 'Roll Number', 'Gender', 'Attendance', 'Conduct', 'Guardian Email', 'Guardian Password'];
    const rows = students.map(s => [
      s.serial || '',
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      s.grade,
      s.section,
      s.rollNumber,
      s.gender,
      s.attendance,
      s.conduct,
      s.guardianEmail || '',
      s.guardianPassword || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dasinya_Students_Master_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Staff & Teacher: available classes and students
  const staffClasses = useMemo(() => {
    return SCHOOL_STRUCTURE[staffGrade] || ['Class A'];
  }, [staffGrade]);

  const staffAvailableStudents = useMemo(() => {
    return students.filter(s => s.grade === staffGrade && s.section === staffClass);
  }, [students, staffGrade, staffClass]);

  const staffFilteredStudents = useMemo(() => {
    if (!staffSearchQuery.trim()) return staffAvailableStudents;
    const q = staffSearchQuery.toLowerCase().trim();
    return staffAvailableStudents.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.rollNumber.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }, [staffAvailableStudents, staffSearchQuery]);

  // Authentic Weekly Class Timetable mapped from official aSc Timetables PDF
  const timetableSchedule = useMemo(() => {
    const targetStudent = currentStudent || staffAvailableStudents[0];
    if (!targetStudent) return [];
    
    const officialDays = getClassTimetable(targetStudent.grade, targetStudent.section);
    return officialDays.map(d => {
      let dayLabel = d.dayEn;
      if (d.dayKey === 'sunday') dayLabel = t.sundayLabel;
      else if (d.dayKey === 'monday') dayLabel = t.mondayLabel;
      else if (d.dayKey === 'tuesday') dayLabel = t.tuesdayLabel;
      else if (d.dayKey === 'wednesday') dayLabel = t.wednesdayLabel;
      else if (d.dayKey === 'thursday') dayLabel = t.thursdayLabel;

      return {
        key: d.dayKey,
        label: dayLabel,
        periods: d.periods,
      };
    });
  }, [currentStudent, staffAvailableStudents, t]);

  const activeLangOption = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Helper check if current selected portal is authenticated
  const isPortalAuthenticated = useMemo(() => {
    if (!selectedPortal) return false;
    if (selectedPortal === 'parent' || selectedPortal === 'student') {
      return Boolean(authGuardian);
    }
    return Boolean(authStaff && authStaff.role === selectedPortal);
  }, [selectedPortal, authGuardian, authStaff]);

  // Portal label helper
  const getPortalLabel = (role: PortalRole) => {
    switch (role) {
      case 'admin': return t.portalAdmin;
      case 'staff': return t.portalStaff;
      case 'teacher': return t.portalTeacher;
      case 'parent': return t.portalParent;
      case 'student': return t.portalStudent;
    }
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`min-h-screen bg-[#F5F6FF] text-[#1A1D4E] flex flex-col selection:bg-[#E1E9FF] selection:text-[#4754FF] ${
        isRtl ? 'font-cairo' : 'font-sans'
      }`}
    >
      {/* Top Header Bar */}
      <header className="w-full border-b border-[#E1E9FF] px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-[0_2px_12px_rgba(71,84,255,0.04)]">
        {/* School Crest & Identity */}
        <div 
          onClick={handleSwitchPortal}
          className={`flex items-center gap-3 cursor-pointer ${isRtl ? 'text-right' : 'text-left'}`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Dasinya Private School Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#1A1D4E] leading-tight">
                {t.schoolName}
              </h1>
              {selectedPortal && (
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-[#E1E9FF] text-[#4754FF]">
                  {getPortalLabel(selectedPortal)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6B70A6] font-medium">
              {t.departmentName}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switch Portal Button (shown whenever a portal is selected) */}
          {selectedPortal && (
            <button
              onClick={handleSwitchPortal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E1E9FF] hover:border-[#4754FF] bg-white text-[#454A87] hover:text-[#4754FF] rounded-xl text-xs font-semibold transition-all shadow-[0_2px_6px_rgba(71,84,255,0.04)] cursor-pointer"
              title={t.switchPortal}
            >
              <Layers className="w-3.5 h-3.5 text-[#4754FF]" />
              <span className="hidden sm:inline">{t.switchPortal}</span>
            </button>
          )}

          {/* If Logged In, display Sign Out button */}
          {isPortalAuthenticated && (
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 hover:border-red-600 hover:bg-red-50 text-red-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title={t.logoutButtonLabel}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.logoutButtonLabel}</span>
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E1E9FF] hover:border-[#4754FF] bg-[#F5F6FF] hover:bg-white text-[#1A1D4E] rounded-xl text-xs font-semibold transition-all shadow-[0_2px_6px_rgba(71,84,255,0.04)] cursor-pointer"
              title="Select Language / هلبژارتنا زمانی / اختيار اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-[#4754FF]" />
              <span className="hidden sm:inline font-medium">{activeLangOption.nativeLabel}</span>
              <span className="sm:hidden font-mono uppercase text-[11px]">{language}</span>
              <ChevronDown className={`w-3 h-3 text-[#7C85FF] transition-transform duration-150 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangMenuOpen && (
              <div 
                className={`absolute top-full mt-1.5 bg-white border border-[#E1E9FF] rounded-2xl shadow-[0_12px_32px_rgba(71,84,255,0.12)] z-50 py-1.5 w-52 sm:w-56 overflow-hidden ${
                  isRtl ? 'left-0 sm:left-auto sm:right-0' : 'right-0'
                }`}
              >
                <div className="px-3.5 py-1.5 border-b border-[#E1E9FF] text-[10px] uppercase tracking-wider font-bold text-[#8C90C2]">
                  {t.language}
                </div>
                {SUPPORTED_LANGUAGES.map((langOpt) => {
                  const isSelected = language === langOpt.code;
                  return (
                    <button
                      key={langOpt.code}
                      onClick={() => {
                        setLanguage(langOpt.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-[#4754FF] text-white font-bold' 
                          : 'hover:bg-[#F5F6FF] text-[#1A1D4E]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{langOpt.flag}</span>
                        <div>
                          <span className="block leading-snug">{langOpt.nativeLabel}</span>
                          <span className={`text-[10px] block leading-tight ${isSelected ? 'text-white/80' : 'text-[#8C90C2]'}`}>
                            {langOpt.label}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* FIRST PAGE: PORTAL SELECTION (When selectedPortal === null) */}
      {/* ======================================================== */}
      {selectedPortal === null && (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col items-center justify-start text-center">
          {/* School Crest */}
          <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-48 md:h-48 max-w-full flex items-center justify-center mb-4 sm:mb-6">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Dasinya Private School Logo" 
              className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(71,84,255,0.15)]" 
            />
          </div>

          {/* School Title & Portal Selection Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#1A1D4E] mb-2">
            {t.schoolName}
          </h2>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1E9FF] text-[#4754FF] text-xs font-bold mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.portalSelectionTitle}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B70A6] max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            {t.portalSelectionSubtitle}
          </p>

          {/* 5 Portals Grid: Admin, Staff, Teacher, Parent, Student */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 text-left">
            {/* 1. ADMIN PORTAL */}
            <button
              onClick={() => {
                setSelectedPortal('admin');
                setLoginError('');
              }}
              className="group bg-white border-2 border-[#E1E9FF] hover:border-[#4754FF] rounded-3xl p-6 transition-all duration-200 hover:shadow-[0_16px_36px_rgba(71,84,255,0.12)] cursor-pointer flex flex-col justify-between text-left hover:-translate-y-1 shadow-[0_6px_20px_rgba(71,84,255,0.05)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4754FF] to-[#7C85FF] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(71,84,255,0.35)] group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#E1E9FF] text-[#4754FF] uppercase tracking-wider flex items-center gap-1 font-mono">
                    <User className="w-2.5 h-2.5" />
                    {t.authUsernamePassword}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1D4E] mb-1.5 group-hover:text-[#4754FF] transition-colors">
                  {t.portalAdmin}
                </h3>
                <p className="text-xs text-[#6B70A6] leading-relaxed mb-4">
                  {t.portalAdminDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#4754FF] pt-3 border-t border-[#E1E9FF]">
                <span>{language === 'ku' ? 'چوونەژوورێ' : language === 'ar' ? 'دخول' : 'Sign In'}</span>
                {isRtl ? <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform" /> : <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />}
              </div>
            </button>

            {/* 2. STAFF PORTAL */}
            <button
              onClick={() => {
                setSelectedPortal('staff');
                setLoginError('');
              }}
              className="group bg-white border-2 border-[#E1E9FF] hover:border-[#00D4AA] rounded-3xl p-6 transition-all duration-200 hover:shadow-[0_16px_36px_rgba(0,212,170,0.15)] cursor-pointer flex flex-col justify-between text-left hover:-translate-y-1 shadow-[0_6px_20px_rgba(71,84,255,0.05)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D4AA] to-[#2CC9A7] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,212,170,0.35)] group-hover:scale-105 transition-transform">
                    <Building className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#E6FAF6] text-[#00A887] uppercase tracking-wider flex items-center gap-1 font-mono">
                    <User className="w-2.5 h-2.5" />
                    {t.authUsernamePassword}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1D4E] mb-1.5 group-hover:text-[#00A887] transition-colors">
                  {t.portalStaff}
                </h3>
                <p className="text-xs text-[#6B70A6] leading-relaxed mb-4">
                  {t.portalStaffDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#00A887] pt-3 border-t border-[#E1E9FF]">
                <span>{language === 'ku' ? 'چوونەژوورێ' : language === 'ar' ? 'دخول' : 'Sign In'}</span>
                {isRtl ? <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform" /> : <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />}
              </div>
            </button>

            {/* 3. TEACHER PORTAL */}
            <button
              onClick={() => {
                setSelectedPortal('teacher');
                setLoginError('');
              }}
              className="group bg-white border-2 border-[#E1E9FF] hover:border-[#BB8FFF] rounded-3xl p-6 transition-all duration-200 hover:shadow-[0_16px_36px_rgba(187,143,255,0.18)] cursor-pointer flex flex-col justify-between text-left hover:-translate-y-1 shadow-[0_6px_20px_rgba(71,84,255,0.05)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#BB8FFF] to-[#7C85FF] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(187,143,255,0.35)] group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#F5EFFF] text-[#8C52FF] uppercase tracking-wider flex items-center gap-1 font-mono">
                    <User className="w-2.5 h-2.5" />
                    {t.authUsernamePassword}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1D4E] mb-1.5 group-hover:text-[#8C52FF] transition-colors">
                  {t.portalTeacher}
                </h3>
                <p className="text-xs text-[#6B70A6] leading-relaxed mb-4">
                  {t.portalTeacherDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C52FF] pt-3 border-t border-[#E1E9FF]">
                <span>{language === 'ku' ? 'چوونەژوورێ' : language === 'ar' ? 'دخول' : 'Sign In'}</span>
                {isRtl ? <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform" /> : <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />}
              </div>
            </button>

            {/* 4. PARENT PORTAL (PASSWORD ONLY) */}
            <button
              onClick={() => {
                setSelectedPortal('parent');
                setLoginError('');
              }}
              className="group bg-white border-2 border-[#E1E9FF] hover:border-[#FF7F2A] rounded-3xl p-6 transition-all duration-200 hover:shadow-[0_16px_36px_rgba(255,127,42,0.18)] cursor-pointer flex flex-col justify-between text-left hover:-translate-y-1 shadow-[0_6px_20px_rgba(71,84,255,0.05)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF7F2A] to-[#FF5599] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(255,127,42,0.35)] group-hover:scale-105 transition-transform">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#FFF2E8] text-[#FF6D00] uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Lock className="w-2.5 h-2.5" />
                    {t.authPasswordOnly}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1D4E] mb-1.5 group-hover:text-[#FF6D00] transition-colors">
                  {t.portalParent}
                </h3>
                <p className="text-xs text-[#6B70A6] leading-relaxed mb-4">
                  {t.portalParentDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF6D00] pt-3 border-t border-[#E1E9FF]">
                <span>{language === 'ku' ? 'چوونەژوورێ ب پاسوۆردێ' : language === 'ar' ? 'دخول بكلمة المرور' : 'Log In by Password'}</span>
                {isRtl ? <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform" /> : <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />}
              </div>
            </button>

            {/* 5. STUDENT PORTAL (PASSWORD ONLY) */}
            <button
              onClick={() => {
                setSelectedPortal('student');
                setLoginError('');
              }}
              className="group bg-white border-2 border-[#E1E9FF] hover:border-[#4754FF] rounded-3xl p-6 transition-all duration-200 hover:shadow-[0_16px_36px_rgba(71,84,255,0.18)] cursor-pointer flex flex-col justify-between text-left hover:-translate-y-1 shadow-[0_6px_20px_rgba(71,84,255,0.05)] sm:col-span-2 lg:col-span-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2AD4FF] to-[#8080FF] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(42,212,255,0.4)] group-hover:scale-105 transition-transform">
                    <Award className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#E1E9FF] text-[#4754FF] uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Lock className="w-2.5 h-2.5" />
                    {t.authPasswordOnly}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1D4E] mb-1.5 group-hover:text-[#4754FF] transition-colors">
                  {t.portalStudent}
                </h3>
                <p className="text-xs text-[#6B70A6] leading-relaxed mb-4">
                  {t.portalStudentDesc}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#4754FF] pt-3 border-t border-[#E1E9FF]">
                <span>{language === 'ku' ? 'چوونەژوورێ ب پاسوۆردێ' : language === 'ar' ? 'دخول بكلمة المرور' : 'Log In by Password'}</span>
                {isRtl ? <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform" /> : <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />}
              </div>
            </button>
          </div>
        </main>
      )}

      {/* ======================================================== */}
      {/* VIEW 1: DEDICATED LOGIN SCREEN FOR SELECTED PORTAL       */}
      {/* ======================================================== */}
      {selectedPortal !== null && !isPortalAuthenticated && (
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-start text-center">
          {/* Back button to Portal Selection */}
          <div className="w-full max-w-md flex items-center justify-start mb-6">
            <button
              onClick={handleSwitchPortal}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#454A87] hover:text-[#4754FF] transition-colors cursor-pointer"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t.backToPortals}</span>
            </button>
          </div>

          {/* School Crest */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 max-w-full flex items-center justify-center mb-3">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Dasinya Private School Logo" 
              className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(71,84,255,0.15)]" 
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1D4E] mb-1">
            {selectedPortal === 'admin' && t.adminLoginTitle}
            {selectedPortal === 'staff' && t.staffLoginTitle}
            {selectedPortal === 'teacher' && t.teacherLoginTitle}
            {selectedPortal === 'parent' && t.parentLoginTitle}
            {selectedPortal === 'student' && t.studentLoginTitle}
          </h2>

          <p className="text-xs sm:text-sm text-[#6B70A6] max-w-md mx-auto mb-6 leading-relaxed">
            {selectedPortal === 'parent' || selectedPortal === 'student'
              ? (language === 'ku' 
                  ? 'ب رێکا وشەی تێپەڕبوون (پاسوۆرد) بچۆ ژوورڤە بۆ بینینا نمرەیان و خشتەی' 
                  : language === 'ar' 
                  ? 'تسجيل الدخول بكلمة المرور فقط لعرض البيانات والدرجات الرسمية' 
                  : 'Sign in using your password to view academic records, marksheets & timetable')
              : (language === 'ku'
                  ? 'ناڤێ بەکارهێنەری و وشەی تێپەڕبوون بنووسە'
                  : language === 'ar'
                  ? 'سجل الدخول باستخدام اسم المستخدم وكلمة المرور'
                  : 'Sign in with your authorized username and password')}
          </p>

          {/* LOGIN CARD */}
          <div className="w-full max-w-md bg-white border border-[#E1E9FF] hover:border-[#4754FF]/50 rounded-3xl p-6 sm:p-8 shadow-[0_12px_32px_rgba(71,84,255,0.08)] text-left transition-all">
            {/* Header in Login Card */}
            <div className={`flex items-center gap-3 mb-5 pb-4 border-b border-[#E1E9FF] ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4754FF] to-[#7C85FF] flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_rgba(71,84,255,0.3)]">
                {selectedPortal === 'admin' && <ShieldCheck className="w-5 h-5" />}
                {selectedPortal === 'staff' && <Building className="w-5 h-5" />}
                {selectedPortal === 'teacher' && <GraduationCap className="w-5 h-5" />}
                {selectedPortal === 'parent' && <HeartHandshake className="w-5 h-5" />}
                {selectedPortal === 'student' && <Award className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1D4E]">
                  {getPortalLabel(selectedPortal)}
                </h3>
                <span className="inline-block text-[10px] font-bold text-[#4754FF] bg-[#E1E9FF] px-2.5 py-0.5 rounded-full font-mono">
                  {selectedPortal === 'parent' || selectedPortal === 'student'
                    ? t.authPasswordOnly
                    : t.authUsernamePassword}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{loginError}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* If Admin, Staff, Teacher: SHOW USERNAME FIELD */}
              {(selectedPortal === 'admin' || selectedPortal === 'staff' || selectedPortal === 'teacher') && (
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold uppercase tracking-wider text-[#454A87] ${isRtl ? 'text-right' : 'text-left'}`}>
                    {t.usernameLabel}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 flex items-center pointer-events-none text-[#7C85FF] ${isRtl ? 'right-3.5' : 'left-3.5'}`}>
                      <User className="w-4 h-4 text-[#4754FF]" />
                    </div>
                    <input 
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => {
                        setLoginUsername(e.target.value);
                        setLoginError('');
                      }}
                      placeholder={
                        selectedPortal === 'admin' 
                          ? 'admin' 
                          : selectedPortal === 'staff' 
                          ? 'staff' 
                          : 'teacher'
                      }
                      className={`w-full bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl py-3 text-xs text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4754FF] focus:border-transparent transition-all ${
                        isRtl ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* PASSWORD FIELD (FOR ALL PORTALS) */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider text-[#454A87] ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none text-[#7C85FF] ${isRtl ? 'right-3.5' : 'left-3.5'}`}>
                    <Lock className="w-4 h-4 text-[#4754FF]" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError('');
                    }}
                    placeholder={
                      selectedPortal === 'parent' || selectedPortal === 'student'
                        ? (language === 'ku' ? 'وشەی تێپەڕبوون بنووسە' : language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password')
                        : '••••••••'
                    }
                    className={`w-full bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl py-3 text-xs text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4754FF] focus:border-transparent transition-all ${
                      isRtl ? 'pr-10 pl-11 text-right' : 'pl-10 pr-11 text-left'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 flex items-center text-[#7C85FF] hover:text-[#4754FF] px-3 cursor-pointer ${
                      isRtl ? 'left-1' : 'right-1'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Credentials Helper for Admin/Staff/Teacher */}
              {(selectedPortal === 'admin' || selectedPortal === 'staff' || selectedPortal === 'teacher') && (
                <div className="p-3 bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl text-[11px] text-[#6B70A6] flex items-center justify-between">
                  <span className="font-mono">
                    {selectedPortal === 'admin' && 'Demo: admin / admin123'}
                    {selectedPortal === 'staff' && 'Demo: staff / staff123'}
                    {selectedPortal === 'teacher' && 'Demo: teacher / teacher123'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPortal === 'admin') {
                        setLoginUsername('admin');
                        setLoginPassword('admin123');
                      } else if (selectedPortal === 'staff') {
                        setLoginUsername('staff');
                        setLoginPassword('staff123');
                      } else {
                        setLoginUsername('teacher');
                        setLoginPassword('teacher123');
                      }
                    }}
                    className="text-[#4754FF] font-bold hover:underline cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#4754FF] hover:bg-[#3843D0] text-white py-3.5 px-4 rounded-2xl text-xs font-bold transition-all shadow-[0_4px_14px_rgba(71,84,255,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 active:scale-[0.99]"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.loggingInLabel}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{t.loginButtonLabel}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: PARENT & STUDENT ACCOUNT (AUTHENTICATED)         */}
      {/* ONLY SEES THE 5 BUTTONS: INFO, MARKSHEET, FOOD MENU,     */}
      {/* CLASSES TIMETABLE, BEHAVIOUR REPORT                      */}
      {/* ======================================================== */}
      {(selectedPortal === 'parent' || selectedPortal === 'student') && isPortalAuthenticated && currentStudent && (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Student Account Top Banner */}
          <div className="bg-gradient-to-r from-[#4754FF] via-[#5F6DFF] to-[#2AD4FF] text-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_24px_rgba(71,84,255,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className={`flex items-center gap-4 ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/25 shadow-xs">
                {selectedPortal === 'parent' ? <HeartHandshake className="w-7 h-7 text-white" /> : <Award className="w-7 h-7 text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-white/25 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-bold text-white">
                    {selectedPortal === 'parent' ? t.portalParent : t.portalStudent}
                  </span>
                  <span className="text-[10px] font-mono bg-white/15 px-2.5 py-0.5 rounded-full text-white/90">
                    {currentStudent.rollNumber}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  {currentStudent.name}
                </h2>
                <p className="text-xs text-white/90 font-medium">
                  {formatGradeLabel(currentStudent.grade, language)} • {formatClassLabel(currentStudent.section, language)} • ID: {currentStudent.id}
                </p>
              </div>
            </div>

            {/* Return / Switch buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handleSwitchPortal}
                className="px-3.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-xs rounded-xl text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5 border border-white/30 shadow-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t.switchPortal}</span>
              </button>
            </div>
          </div>

          {/* Sibling Switcher (if parent has multiple registered children) */}
          {selectedPortal === 'parent' && authGuardian && authGuardian.students.length > 1 && (
            <div className="bg-white border border-[#E1E9FF] rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#454A87] px-1">
                {t.registeredChildrenLabel} ({authGuardian.students.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {authGuardian.students.map((child) => {
                  const isCurrent = child.id === currentStudent.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        setSelectedChildId(child.id);
                        setActivePortalTab(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCurrent 
                          ? 'bg-[#4754FF] text-white shadow-[0_2px_8px_rgba(71,84,255,0.25)]' 
                          : 'bg-[#F5F6FF] border border-[#E1E9FF] text-[#454A87] hover:border-[#4754FF]'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{child.name}</span>
                      <span className={`text-[10px] font-mono px-1 rounded ${isCurrent ? 'bg-white/20 text-white' : 'bg-white text-[#6B70A6]'}`}>
                        {child.grade}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* THE 5 BUTTONS MENU: WHEN USER LOGS IN, USER ONLY SEES THESE: */}
          {/* 1. INFO                                                  */}
          {/* 2. MARKSHEET                                             */}
          {/* 3. FOOD MENU                                             */}
          {/* 4. CLASSES TIMETABLE                                     */}
          {/* 5. BEHAVIOUR REPORT                                      */}
          {/* ======================================================== */}
          {activePortalTab === null && (
            <div className="space-y-6 pt-2">
              <div className="text-center max-w-lg mx-auto mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-[#1A1D4E] tracking-tight mb-1">
                  {language === 'ku' ? 'هەڵبژاردنەکێ دیار بکە' : language === 'ar' ? 'اختر أحد الخيارات للفتح' : 'Select an Option to Open'}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B70A6]">
                  {language === 'ku' 
                    ? 'کلیک ل سەر ئێک ژ ڤان ٥ دوکمان بکە دا زانیاریان ببینی' 
                    : language === 'ar' 
                    ? 'اضغط على أحد الأزرار الخمسة لعرض المحتوى المطلوب' 
                    : 'Click any of the 5 options below to access details'}
                </p>
              </div>

              {/* The 5 Main Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {/* 1. INFO */}
                <button
                  onClick={() => setActivePortalTab('info')}
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#4754FF] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(71,84,255,0.12)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(71,84,255,0.05)]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2AD4FF] to-[#4754FF] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(42,212,255,0.35)] group-hover:scale-105 transition-transform">
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E1E9FF] text-[#4754FF]">
                      01
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1A1D4E] group-hover:text-[#4754FF] transition-colors mb-1">
                      {t.tabInfo}
                    </h4>
                    <p className="text-xs text-[#6B70A6] line-clamp-2">
                      {language === 'ku' ? 'پێزانینێن قوتابی، پۆل، ژمارا قەیدێ و بەخێوکەر' : language === 'ar' ? 'ملف الطالب، الشعبة، رقم القيد وتفاصيل الاتصال' : 'Student profile, grade, roll number & enrollment record'}
                    </p>
                  </div>
                </button>

                {/* 2. MARKSHEET */}
                <button
                  onClick={() => setActivePortalTab('marksheet')}
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#FF5599] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(255,85,153,0.14)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(71,84,255,0.05)]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF7F2A] to-[#FF5599] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(255,127,42,0.35)] group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FFF2E8] text-[#FF6D00]">
                      02
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1A1D4E] group-hover:text-[#FF6D00] transition-colors mb-1">
                      {t.tabMarksheet}
                    </h4>
                    <p className="text-xs text-[#6B70A6] line-clamp-2">
                      {language === 'ku' ? 'نمرەیێن فەرمی یێن وەرزێ ئێکێ و داگرتنا PDF' : language === 'ar' ? 'درجات الفصل الأول الرسمية وتنزيل كشف الدرجات PDF' : 'Official Term 1 subject evaluation & PDF download'}
                    </p>
                  </div>
                </button>

                {/* 3. FOOD MENU */}
                <button
                  onClick={() => setActivePortalTab('food_menu')}
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#00D4AA] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(0,212,170,0.14)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(71,84,255,0.05)]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D4AA] to-[#2CC9A7] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,212,170,0.35)] group-hover:scale-105 transition-transform">
                      <Utensils className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E6FAF6] text-[#00A887]">
                      03
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1A1D4E] group-hover:text-[#00A887] transition-colors mb-1">
                      {t.tabFoodMenu}
                    </h4>
                    <p className="text-xs text-[#6B70A6] line-clamp-2">
                      {language === 'ku' ? 'مێنیوێ حەفتیانە یێ خارنگەها قوتابخانێ' : language === 'ar' ? 'جدول الوجبات الغذائية الأسبوعية من الأحد إلى الخميس' : 'Weekly balanced cafeteria lunch & snack schedule'}
                    </p>
                  </div>
                </button>

                {/* 4. CLASSES TIMETABLE */}
                <button
                  onClick={() => setActivePortalTab('timetable')}
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#4754FF] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(71,84,255,0.14)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(71,84,255,0.05)]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4754FF] to-[#7C85FF] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(71,84,255,0.35)] group-hover:scale-105 transition-transform">
                      <CalendarDays className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E1E9FF] text-[#4754FF]">
                      04
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1A1D4E] group-hover:text-[#4754FF] transition-colors mb-1">
                      {t.tabClassesTimetable}
                    </h4>
                    <p className="text-xs text-[#6B70A6] line-clamp-2">
                      {language === 'ku' ? 'خشتەیێ وانان یێ حەفتیانە بۆ ڤێ پۆلێ' : language === 'ar' ? 'جدول الحصص الأسبوعي الرسمي وتوقيت الدروس' : 'Authentic weekly period timetable & room assignments'}
                    </p>
                  </div>
                </button>

                {/* 5. BEHAVIOUR REPORT */}
                <button
                  onClick={() => setActivePortalTab('behaviour')}
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#BB8FFF] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(187,143,255,0.18)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(71,84,255,0.05)] sm:col-span-2 lg:col-span-1"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#BB8FFF] to-[#FF7F2A] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(187,143,255,0.35)] group-hover:scale-105 transition-transform">
                      <Heart className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5EFFF] text-[#8C52FF]">
                      05
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1A1D4E] group-hover:text-[#8C52FF] transition-colors mb-1">
                      {t.tabBehaviourReport}
                    </h4>
                    <p className="text-xs text-[#6B70A6] line-clamp-2">
                      {language === 'ku' ? 'هەڵسەنگاندنا رەوشتی و ئامادەبوونا قوتابی' : language === 'ar' ? 'تقرير السلوك، الانضباط والمواظبة في المدرسة' : 'Conduct evaluation, disciplinary report & moral rating'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-SECTION VIEWS (WHEN ONE OF THE 5 BUTTONS IS CLICKED) */}
          {/* ======================================================== */}
          {activePortalTab !== null && (
            <div className="space-y-6">
              {/* Back to 5-buttons Hub Bar */}
              <div className="flex items-center justify-between bg-white border border-[#E1E9FF] rounded-2xl p-3.5 shadow-xs">
                <button
                  onClick={() => setActivePortalTab(null)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#4754FF] hover:underline cursor-pointer"
                >
                  {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  <span>{t.backToPortalMenu}</span>
                </button>

                {/* Sub-tabs Quick Switcher */}
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  <button
                    onClick={() => setActivePortalTab('info')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'info' ? 'bg-[#4754FF] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {t.tabInfo}
                  </button>
                  <button
                    onClick={() => setActivePortalTab('marksheet')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'marksheet' ? 'bg-[#4754FF] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {t.tabMarksheet}
                  </button>
                  <button
                    onClick={() => setActivePortalTab('food_menu')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'food_menu' ? 'bg-[#4754FF] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {t.tabFoodMenu}
                  </button>
                  <button
                    onClick={() => setActivePortalTab('timetable')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'timetable' ? 'bg-[#4754FF] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {t.tabClassesTimetable}
                  </button>
                  <button
                    onClick={() => setActivePortalTab('behaviour')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'behaviour' ? 'bg-[#4754FF] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {t.tabBehaviourReport}
                  </button>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* SECTION 1: INFO                                      */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'info' && (
                <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(71,84,255,0.05)] space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E1E9FF]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1A1D4E]">{t.tabInfo}</h3>
                      <p className="text-xs text-[#6B70A6]">{t.infoSubtitle}</p>
                    </div>
                    <span className="px-3.5 py-1 bg-[#E1E9FF] text-[#4754FF] font-mono font-bold text-xs rounded-full">
                      {currentStudent.rollNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">{t.studentName}</span>
                      <span className="font-bold text-[#1A1D4E] text-sm">{currentStudent.name}</span>
                    </div>
                    <div className="p-4 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">{t.idNumber}</span>
                      <span className="font-mono font-bold text-[#1A1D4E] text-sm">{currentStudent.id}</span>
                    </div>
                    <div className="p-4 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                        {language === 'ku' ? 'پۆل و دەستە' : language === 'ar' ? 'الصف والشعبة' : 'Grade & Class'}
                      </span>
                      <span className="font-bold text-[#1A1D4E] text-sm">{formatGradeLabel(currentStudent.grade, language)} - {formatClassLabel(currentStudent.section, language)}</span>
                    </div>
                    <div className="p-4 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">{t.gender}</span>
                      <span className="font-bold text-[#1A1D4E] text-sm">{currentStudent.gender}</span>
                    </div>
                    <div className="p-4 bg-[#E6FAF6] rounded-2xl border border-[#00D4AA]/30">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#00A887] mb-1">{t.attendance}</span>
                      <span className="font-bold text-[#00A887] text-sm">{currentStudent.attendance}</span>
                    </div>
                    <div className="p-4 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                        {language === 'ku' ? 'رێزبەندیا پۆلێ' : language === 'ar' ? 'الترتيب في الصف' : 'Class Rank'}
                      </span>
                      <span className="font-bold text-[#4754FF] text-sm">{currentStudent.classRank}</span>
                    </div>
                    {currentStudent.motherName && (
                      <div className="p-4 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">{t.motherName}</span>
                        <span className="font-bold text-[#1A1D4E] text-sm">{currentStudent.motherName}</span>
                      </div>
                    )}
                    {currentStudent.guardianEmail && (
                      <div className="p-4 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF] sm:col-span-2">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">{t.emailAddressLabel}</span>
                        <span className="font-mono text-[#1A1D4E] text-xs">{currentStudent.guardianEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SECTION 2: MARKSHEET                                 */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'marksheet' && (
                <div className="space-y-4">
                  {/* Marksheet Action Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E1E9FF] p-3.5 rounded-2xl shadow-xs print:hidden">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-[#4754FF]" />
                      <span className="text-xs font-bold text-[#1A1D4E]">
                        {isPrimary25 ? t.term1MarkOutOf25 : t.term1MarkOutOf20}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownloadPdf('printable-marksheet')}
                      disabled={isGeneratingPdf}
                      className="px-4 py-2 bg-[#4754FF] hover:bg-[#3843D0] text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(71,84,255,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      <span>{t.downloadPdf}</span>
                    </button>
                  </div>

                  {/* Printable Marksheet Container */}
                  <div id="printable-marksheet" className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_24px_rgba(71,84,255,0.06)] space-y-6">
                    {/* Marksheet Header */}
                    <div className="flex items-center justify-between border-b border-[#E1E9FF] pb-5">
                      <div className="flex items-center gap-3.5">
                        <img src={SCHOOL_LOGO_URL} alt="Logo" className="w-12 h-12 object-contain" />
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-[#1A1D4E]">{t.schoolName}</h4>
                          <p className="text-xs text-[#6B70A6]">{t.studentMarksheetTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-[#E1E9FF] text-[#4754FF] font-bold text-xs px-3.5 py-1 rounded-full font-mono">
                          {currentStudent.rollNumber}
                        </span>
                        <p className="text-[11px] text-[#8C90C2] mt-1">{currentStudent.academicYear}</p>
                      </div>
                    </div>

                    {/* Student Snapshot */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F5F6FF] p-4 rounded-2xl border border-[#E1E9FF]">
                      <div>
                        <span className="text-[#8C90C2] block">{t.studentName}:</span>
                        <span className="font-bold text-[#1A1D4E]">{currentStudent.name}</span>
                      </div>
                      <div>
                        <span className="text-[#8C90C2] block">{t.idNumber}:</span>
                        <span className="font-bold font-mono text-[#1A1D4E]">{currentStudent.id}</span>
                      </div>
                      <div>
                        <span className="text-[#8C90C2] block">
                          {language === 'ku' ? 'پۆل و دەستە' : language === 'ar' ? 'الصف والشعبة' : 'Grade & Class'}:
                        </span>
                        <span className="font-bold text-[#1A1D4E]">{currentStudent.grade} - {currentStudent.section}</span>
                      </div>
                      <div>
                        <span className="text-[#8C90C2] block">{t.termContribution}:</span>
                        <span className="font-bold text-[#4754FF]">{isPrimary25 ? '25% Weight' : '20% Weight'}</span>
                      </div>
                    </div>

                    {/* Marksheet Subject Table */}
                    <div className="border border-[#E1E9FF] rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-[#F5F6FF] border-b border-[#E1E9FF] font-bold text-[#1A1D4E]">
                          <tr>
                            <th className="py-3 px-4 text-center w-12">#</th>
                            <th className="py-3 px-4">{t.subject}</th>
                            <th className={`py-3 px-6 ${isRtl ? 'text-left' : 'text-right'}`}>
                              {isPrimary25 ? t.term1MarkOutOf25 : t.term1MarkOutOf20}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E1E9FF]">
                          {displayedSubjects.map((sub, idx) => {
                            const mark = getSubjectTerm1Mark(sub.obtainedMarks);
                            return (
                              <tr key={idx} className="hover:bg-[#F5F6FF]/60 transition-colors">
                                <td className="py-3 px-4 text-center font-mono text-[#8C90C2]">{idx + 1}</td>
                                <td className="py-3 px-4 font-semibold text-[#1A1D4E]">
                                  {getTranslatedSubject(sub.subject, language)}
                                </td>
                                <td className={`py-3 px-6 font-bold text-[#1A1D4E] font-mono ${isRtl ? 'text-left' : 'text-right'}`}>
                                  <span>{mark}</span>
                                  <span className="text-xs text-[#8C90C2] font-normal font-mono ml-1">/ {maxTermMark}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[#F5F6FF] font-bold border-t-2 border-[#1A1D4E]">
                            <td className="py-3.5 px-4 text-center">#</td>
                            <td className="py-3.5 px-4">{t.totalMarks}</td>
                            <td className={`py-3.5 px-6 font-mono font-black text-[#4754FF] ${isRtl ? 'text-left' : 'text-right'}`}>
                              {reportTotals.totalObtained} / {reportTotals.totalMax}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SECTION 3: FOOD MENU                                 */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'food_menu' && (
                <div className="space-y-4">
                  <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(71,84,255,0.05)]">
                    <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-[#E1E9FF]">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00D4AA] to-[#2CC9A7] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,212,170,0.3)]">
                        <Utensils className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-[#1A1D4E]">{t.foodMenuTitle}</h3>
                        <p className="text-xs text-[#6B70A6]">{t.foodMenuSubtitle}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {WEEKLY_FOOD_MENU.map((item) => (
                        <div key={item.dayKey} className="border border-[#E1E9FF] rounded-2xl p-4 bg-[#F5F6FF]/40 hover:bg-white hover:border-[#4754FF] transition-all hover:shadow-[0_4px_16px_rgba(71,84,255,0.08)]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[#4754FF] text-sm">
                              {language === 'ku' ? item.dayKu : language === 'ar' ? item.dayAr : item.dayEn}
                            </span>
                            <span className="text-[10px] font-mono bg-[#E1E9FF] text-[#4754FF] font-bold px-2.5 py-0.5 rounded-full">
                              {item.calories}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#1A1D4E] mb-1">
                            {language === 'ku' ? item.mainDishKu : language === 'ar' ? item.mainDishAr : item.mainDishEn}
                          </p>
                          <p className="text-xs text-[#6B70A6] mb-2">
                            {language === 'ku' ? item.sideDishKu : language === 'ar' ? item.sideDishAr : item.sideDishEn}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[10px] bg-white border border-[#E1E9FF] text-[#454A87] px-2 py-0.5 rounded-md font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SECTION 4: CLASSES TIMETABLE                         */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'timetable' && (
                <div className="space-y-4">
                  <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(71,84,255,0.05)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E1E9FF] gap-3 mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4754FF] to-[#7C85FF] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(71,84,255,0.3)]">
                          <CalendarDays className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-[#1A1D4E]">
                            {t.timetableTitle} ({currentStudent.grade} - {currentStudent.section})
                          </h3>
                          <p className="text-xs text-[#6B70A6]">{t.timetableSubtitle}</p>
                        </div>
                      </div>

                      {/* Day Filter */}
                      <div className="flex items-center gap-1.5 overflow-x-auto">
                        <button
                          onClick={() => setSelectedTimetableDay('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedTimetableDay === 'all' ? 'bg-[#4754FF] text-white shadow-xs' : 'bg-[#F5F6FF] text-[#454A87] hover:bg-[#E1E9FF]'
                          }`}
                        >
                          All
                        </button>
                        {timetableSchedule.map(d => (
                          <button
                            key={d.key}
                            onClick={() => setSelectedTimetableDay(d.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              selectedTimetableDay === d.key ? 'bg-[#4754FF] text-white shadow-xs' : 'bg-[#F5F6FF] text-[#454A87] hover:bg-[#E1E9FF]'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5">
                      {timetableSchedule
                        .filter(d => selectedTimetableDay === 'all' || selectedTimetableDay === d.key)
                        .map(day => (
                          <div key={day.key} className="border border-[#E1E9FF] rounded-2xl overflow-hidden shadow-2xs">
                            <div className="bg-[#F5F6FF] px-4 py-2.5 font-bold text-xs sm:text-sm text-[#1A1D4E] border-b border-[#E1E9FF]">
                              {day.label}
                            </div>
                            <div className="divide-y divide-[#E1E9FF]">
                              {day.periods.map(period => (
                                <div key={period.period} className="p-3 flex items-center justify-between text-xs sm:text-sm hover:bg-[#F5F6FF]/50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-[#E1E9FF] text-[#4754FF] flex items-center justify-center font-mono font-bold text-xs">
                                      {period.period}
                                    </span>
                                    <div>
                                      <span className="font-bold text-[#1A1D4E]">{getTranslatedSubject(period.subject, language)}</span>
                                      <span className="text-[11px] text-[#8C90C2] block font-mono">{period.time}</span>
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono bg-[#F5F6FF] border border-[#E1E9FF] px-2.5 py-1 rounded-lg text-[#454A87]">
                                    {period.teacher}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SECTION 5: BEHAVIOUR REPORT                          */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'behaviour' && (
                <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(71,84,255,0.05)] space-y-6">
                  <div className="flex items-center gap-3.5 pb-4 border-b border-[#E1E9FF]">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BB8FFF] to-[#FF7F2A] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(187,143,255,0.3)]">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1A1D4E]">{t.tabBehaviourReport}</h3>
                      <p className="text-xs text-[#6B70A6]">Student Conduct, Discipline & Core Values</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#E6FAF6] border border-[#00D4AA]/30 rounded-2xl text-center">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#00A887] mb-1">{t.conduct}</span>
                      <span className="text-lg font-black text-[#00A887]">{currentStudent.conduct}</span>
                    </div>
                    <div className="p-4 bg-[#E1E9FF] border border-[#7C85FF]/30 rounded-2xl text-center">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#4754FF] mb-1">{t.attendance}</span>
                      <span className="text-lg font-black text-[#4754FF]">{currentStudent.attendance}</span>
                    </div>
                    <div className="p-4 bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl text-center">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">Class Teacher</span>
                      <span className="text-sm font-bold text-[#1A1D4E]">{currentStudent.classTeacher}</span>
                    </div>
                  </div>

                  <div className="border border-[#E1E9FF] bg-[#F5F6FF] rounded-2xl p-4 text-xs leading-relaxed text-[#454A87]">
                    <span className="font-bold text-[#1A1D4E] block mb-1">Teacher's Behavioural Assessment:</span>
                    {currentStudent.name} demonstrates respectful, disciplined conduct across all classes and actively participates in classroom discussions while maintaining an exemplary attitude with peers and teachers.
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: TEACHER PORTAL (AUTHENTICATED)                   */}
      {/* ======================================================== */}
      {selectedPortal === 'teacher' && isPortalAuthenticated && authStaff && (
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Teacher Portal Top Banner */}
          <div className="bg-gradient-to-r from-[#BB8FFF] via-[#7C85FF] to-[#4754FF] text-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_24px_rgba(187,143,255,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25 shadow-xs">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider bg-white/25 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-bold text-white">
                  Teacher Faculty Portal
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  {authStaff.name}
                </h2>
                <p className="text-xs text-white/90">
                  Academic Year 2024–2025 • Official Course & Grade Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSwitchPortal}
                className="px-3.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-xs rounded-xl text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5 border border-white/30 shadow-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t.switchPortal}</span>
              </button>
            </div>
          </div>

          {/* Teacher Controls: Class Selector & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E1E9FF] p-4 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                  Select Grade
                </label>
                <select
                  value={staffGrade}
                  onChange={(e) => {
                    setStaffGrade(e.target.value);
                    const classes = SCHOOL_STRUCTURE[e.target.value] || ['Class A'];
                    setStaffClass(classes[0]);
                  }}
                  className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#4754FF]"
                >
                  {officialGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                  Select Section
                </label>
                <select
                  value={staffClass}
                  onChange={(e) => setStaffClass(e.target.value)}
                  className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#4754FF]"
                >
                  {staffClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-[#F5F6FF] p-1 rounded-xl border border-[#E1E9FF]">
              <button
                onClick={() => setTeacherTab('roster')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  teacherTab === 'roster' ? 'bg-[#4754FF] text-white shadow-xs' : 'text-[#454A87] hover:text-[#1A1D4E]'
                }`}
              >
                Class Roster & Marks
              </button>
              <button
                onClick={() => setTeacherTab('timetable')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  teacherTab === 'timetable' ? 'bg-[#4754FF] text-white shadow-xs' : 'text-[#454A87] hover:text-[#1A1D4E]'
                }`}
              >
                Class Timetable
              </button>
            </div>
          </div>

          {/* Teacher Tab 1: Class Roster & Grades */}
          {teacherTab === 'roster' && (
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(71,84,255,0.05)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E1E9FF] gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#1A1D4E]">
                    {staffGrade} - {staffClass} Student Roster ({staffAvailableStudents.length} Students)
                  </h3>
                  <p className="text-xs text-[#6B70A6]">Official Term 1 Subject Evaluations & Scores</p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8C90C2] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="Search student..."
                    className="pl-9 pr-3 py-1.5 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl text-xs w-48 text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:outline-none focus:ring-2 focus:ring-[#4754FF]"
                  />
                </div>
              </div>

              <div className="border border-[#E1E9FF] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F6FF] border-b border-[#E1E9FF] font-bold text-[#1A1D4E]">
                    <tr>
                      <th className="py-3 px-3 text-center">#</th>
                      <th className="py-3 px-3">Student Name</th>
                      <th className="py-3 px-3">Roll No</th>
                      <th className="py-3 px-3">Attendance</th>
                      <th className="py-3 px-3">English</th>
                      <th className="py-3 px-3">Kurdish</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E9FF]">
                    {staffFilteredStudents.map((s, idx) => {
                      const eng = s.subjects.find(sub => sub.subject === 'English');
                      const kur = s.subjects.find(sub => sub.subject === 'Kurdish');
                      const isG13 = parseInt(s.grade.replace(/\D/g, ''), 10) <= 3;
                      const maxMark = isG13 ? 25 : 20;

                      return (
                        <tr key={s.id} className="hover:bg-[#F5F6FF]/60 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono text-[#8C90C2]">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-[#1A1D4E]">{s.name}</td>
                          <td className="py-2.5 px-3 font-mono text-[#6B70A6]">{s.rollNumber}</td>
                          <td className="py-2.5 px-3 text-[#00A887] font-semibold">{s.attendance}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1A1D4E]">
                            {eng ? `${((eng.obtainedMarks / 100) * maxMark).toFixed(0)}/${maxMark}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1A1D4E]">
                            {kur ? `${((kur.obtainedMarks / 100) * maxMark).toFixed(0)}/${maxMark}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => setModalStudent(s)}
                              className="px-3 py-1 bg-[#4754FF] hover:bg-[#3843D0] text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-xs"
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

          {/* Teacher Tab 2: Class Timetable */}
          {teacherTab === 'timetable' && (
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(71,84,255,0.05)]">
              <h3 className="text-base font-bold text-[#1A1D4E] mb-4">
                Weekly Class Timetable ({staffGrade} - {staffClass})
              </h3>
              <div className="space-y-4">
                {timetableSchedule.map(day => (
                  <div key={day.key} className="border border-[#E1E9FF] rounded-2xl overflow-hidden shadow-2xs">
                    <div className="bg-[#F5F6FF] px-4 py-2.5 font-bold text-xs text-[#1A1D4E] border-b border-[#E1E9FF]">
                      {day.label}
                    </div>
                    <div className="divide-y divide-[#E1E9FF]">
                      {day.periods.map(period => (
                        <div key={period.period} className="p-3 flex items-center justify-between text-xs hover:bg-[#F5F6FF]/40">
                          <span className="font-bold text-[#1A1D4E]">Period {period.period}: {period.subject}</span>
                          <span className="text-[#6B70A6] font-mono">{period.time} • {period.teacher}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ======================================================== */}
      {/* VIEW 4: STAFF PORTAL (AUTHENTICATED)                     */}
      {/* ======================================================== */}
      {selectedPortal === 'staff' && isPortalAuthenticated && authStaff && (
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
          <div className="bg-gradient-to-r from-[#00D4AA] via-[#2CC9A7] to-[#4754FF] text-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,212,170,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25 shadow-xs">
                <Building className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider bg-white/25 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-bold text-white">
                  Staff & Registrar Portal
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  Academic Affairs & Student Records
                </h2>
                <p className="text-xs text-white/90">
                  Total Enrolled: {students.length} Students across Grades 1 to 9
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSwitchPortal}
                className="px-3.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-xs rounded-xl text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5 border border-white/30 shadow-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t.switchPortal}</span>
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E1E9FF] p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-1.5 bg-[#F5F6FF] p-1 rounded-xl border border-[#E1E9FF]">
              <button
                onClick={() => setStaffTab('students')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  staffTab === 'students' ? 'bg-[#4754FF] text-white shadow-xs' : 'text-[#454A87] hover:text-[#1A1D4E]'
                }`}
              >
                Student Directory
              </button>
              <button
                onClick={() => setStaffTab('timetables')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  staffTab === 'timetables' ? 'bg-[#4754FF] text-white shadow-xs' : 'text-[#454A87] hover:text-[#1A1D4E]'
                }`}
              >
                Class Timetables
              </button>
              <button
                onClick={() => setStaffTab('food_menu')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  staffTab === 'food_menu' ? 'bg-[#4754FF] text-white shadow-xs' : 'text-[#454A87] hover:text-[#1A1D4E]'
                }`}
              >
                Food Menu
              </button>
            </div>

            {staffTab === 'students' && (
              <div className="flex items-center gap-2">
                <select
                  value={staffGrade}
                  onChange={(e) => {
                    setStaffGrade(e.target.value);
                    const classes = SCHOOL_STRUCTURE[e.target.value] || ['Class A'];
                    setStaffClass(classes[0]);
                  }}
                  className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#4754FF]"
                >
                  {officialGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <select
                  value={staffClass}
                  onChange={(e) => setStaffClass(e.target.value)}
                  className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#4754FF]"
                >
                  {staffClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Staff Tab Content */}
          {staffTab === 'students' && (
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(71,84,255,0.05)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E1E9FF]">
                <h3 className="text-base font-bold text-[#1A1D4E]">
                  {staffGrade} {staffClass} Directory ({staffAvailableStudents.length} Students)
                </h3>
              </div>
              <div className="border border-[#E1E9FF] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F6FF] border-b border-[#E1E9FF] font-bold text-[#1A1D4E]">
                    <tr>
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-3">Student Name</th>
                      <th className="py-3 px-3">ID</th>
                      <th className="py-3 px-3">Guardian Email</th>
                      <th className="py-3 px-3">Password</th>
                      <th className="py-3 px-3 text-center">Marksheet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E9FF]">
                    {staffAvailableStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-[#F5F6FF]/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[#8C90C2]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-[#1A1D4E]">{s.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[#6B70A6]">{s.id}</td>
                        <td className="py-2.5 px-3 font-mono text-[#6B70A6]">{s.guardianEmail || '-'}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#4754FF]">{s.guardianPassword}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setModalStudent(s)}
                            className="px-3 py-1 bg-[#4754FF] text-white rounded-lg text-[11px] font-bold cursor-pointer hover:bg-[#3843D0] transition-colors shadow-xs"
                          >
                            Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {staffTab === 'timetables' && (
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(71,84,255,0.05)] space-y-4">
              <h3 className="text-base font-bold text-[#1A1D4E] mb-2">Class Timetable View</h3>
              <div className="space-y-4">
                {timetableSchedule.map(day => (
                  <div key={day.key} className="border border-[#E1E9FF] rounded-2xl overflow-hidden shadow-2xs">
                    <div className="bg-[#F5F6FF] px-4 py-2.5 font-bold text-xs text-[#1A1D4E] border-b border-[#E1E9FF]">{day.label}</div>
                    <div className="divide-y divide-[#E1E9FF]">
                      {day.periods.map(period => (
                        <div key={period.period} className="p-3 flex items-center justify-between text-xs hover:bg-[#F5F6FF]/40">
                          <span className="font-bold text-[#1A1D4E]">Period {period.period}: {period.subject}</span>
                          <span className="text-[#6B70A6] font-mono">{period.time} • {period.teacher}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {staffTab === 'food_menu' && (
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(71,84,255,0.05)] space-y-4">
              <h3 className="text-base font-bold text-[#1A1D4E]">Weekly Cafeteria Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WEEKLY_FOOD_MENU.map(item => (
                  <div key={item.dayKey} className="border border-[#E1E9FF] rounded-2xl p-4 bg-[#F5F6FF]/30 hover:bg-white hover:border-[#4754FF] transition-all">
                    <span className="font-bold text-[#4754FF] text-sm block mb-1">{item.dayEn}</span>
                    <p className="text-xs font-semibold text-[#1A1D4E]">{item.mainDishEn}</p>
                    <p className="text-xs text-[#6B70A6] mt-1">{item.sideDishEn}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ======================================================== */}
      {/* VIEW 5: ADMIN PORTAL (AUTHENTICATED)                     */}
      {/* ======================================================== */}
      {selectedPortal === 'admin' && isPortalAuthenticated && authStaff && (
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
          <div className="bg-gradient-to-r from-[#4754FF] via-[#5F6DFF] to-[#7C85FF] text-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_24px_rgba(71,84,255,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25 shadow-xs">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider bg-white/25 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-bold text-white">
                  Executive Admin Portal
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  School Governance & Master Registry
                </h2>
                <p className="text-xs text-white/90">
                  Full Administrative Control • Dasinya Private School
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleSwitchPortal}
                className="px-3.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-xs rounded-xl text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5 border border-white/30 shadow-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t.switchPortal}</span>
              </button>
            </div>
          </div>

          {/* Admin KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 sm:p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">Total Enrolled</span>
              <span className="text-2xl sm:text-3xl font-black text-[#1A1D4E]">{students.length}</span>
              <span className="text-[11px] text-[#00A887] block mt-1 font-semibold">100% Active</span>
            </div>
            <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 sm:p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">Grades</span>
              <span className="text-2xl sm:text-3xl font-black text-[#1A1D4E]">9</span>
              <span className="text-[11px] text-[#6B70A6] block mt-1">Grades 1 through 9</span>
            </div>
            <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 sm:p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">Class Sections</span>
              <span className="text-2xl sm:text-3xl font-black text-[#4754FF]">18</span>
              <span className="text-[11px] text-[#6B70A6] block mt-1">Classes A, B, C, E</span>
            </div>
            <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 sm:p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">Attendance Rate</span>
              <span className="text-2xl sm:text-3xl font-black text-[#00A887]">97.8%</span>
              <span className="text-[11px] text-[#00A887] block mt-1 font-semibold">Exemplary</span>
            </div>
          </div>

          {/* Admin Master Directory */}
          <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(71,84,255,0.05)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E1E9FF] gap-3">
              <div>
                <h3 className="text-base font-bold text-[#1A1D4E]">
                  Master Student Registry ({students.length} Total Records)
                </h3>
                <p className="text-xs text-[#6B70A6]">Access credentials, student information, and marksheet audit</p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8C90C2] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  placeholder="Search student or ID..."
                  className="pl-9 pr-3 py-1.5 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl text-xs w-56 text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:outline-none focus:ring-2 focus:ring-[#4754FF]"
                />
              </div>
            </div>

            <div className="border border-[#E1E9FF] rounded-2xl overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F6FF] border-b border-[#E1E9FF] font-bold text-[#1A1D4E] sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Grade & Section</th>
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Roll No</th>
                    <th className="py-3 px-3">Guardian Password</th>
                    <th className="py-3 px-3 text-center">Marksheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E9FF]">
                  {students
                    .filter(s => {
                      if (!staffSearchQuery.trim()) return true;
                      const q = staffSearchQuery.toLowerCase().trim();
                      return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q);
                    })
                    .slice(0, 50)
                    .map((s, idx) => (
                      <tr key={s.id} className="hover:bg-[#F5F6FF]/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[#8C90C2]">{s.serial || idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-[#1A1D4E]">{s.name}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#454A87]">{s.grade} - {s.section}</td>
                        <td className="py-2.5 px-3 font-mono text-[#6B70A6]">{s.id}</td>
                        <td className="py-2.5 px-3 font-mono text-[#6B70A6]">{s.rollNumber}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#4754FF]">{s.guardianPassword}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setModalStudent(s)}
                            className="px-3 py-1 bg-[#4754FF] text-white rounded-lg text-[11px] font-bold cursor-pointer hover:bg-[#3843D0] transition-colors shadow-xs"
                          >
                            Audit
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#8C90C2] text-center">
              Showing first 50 results. Use search filter or Export CSV to retrieve full database.
            </p>
          </div>
        </main>
      )}

      {/* ======================================================== */}
      {/* UNIVERSAL MARKSHEET MODAL (FOR TEACHER / STAFF / ADMIN)  */}
      {/* ======================================================== */}
      {modalStudent && (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#E1E9FF] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[0_20px_60px_rgba(71,84,255,0.25)] relative space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E1E9FF]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1D4E]">
                  {modalStudent.name} • {t.studentMarksheetTitle}
                </h3>
                <p className="text-xs text-[#6B70A6]">
                  {modalStudent.grade} - {modalStudent.section} • Roll No: {modalStudent.rollNumber}
                </p>
              </div>
              <button
                onClick={() => setModalStudent(null)}
                className="w-8 h-8 rounded-full bg-[#F5F6FF] hover:bg-[#E1E9FF] flex items-center justify-center text-[#4754FF] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Marksheet Subject List */}
            <div className="border border-[#E1E9FF] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F5F6FF] font-bold text-[#1A1D4E]">
                  <tr>
                    <th className="py-3 px-3.5">Subject</th>
                    <th className="py-3 px-3.5 text-right">Term 1 Exam Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E9FF]">
                  {modalStudent.subjects.map((sub, i) => {
                    const isG13 = parseInt(modalStudent.grade.replace(/\D/g, ''), 10) <= 3;
                    const maxM = isG13 ? 25 : 20;
                    const mark = ((sub.obtainedMarks / 100) * maxM).toFixed(1);
                    return (
                      <tr key={i} className="hover:bg-[#F5F6FF]/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-semibold text-[#1A1D4E]">
                          {getTranslatedSubject(sub.subject, language)}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono font-bold text-[#4754FF] text-right">
                          {mark} / {maxM}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E1E9FF]">
              <button
                onClick={() => setModalStudent(null)}
                className="px-4 py-2 bg-[#F5F6FF] hover:bg-[#E1E9FF] text-[#4754FF] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-[#E1E9FF] py-6 px-4 text-center text-xs text-[#8C90C2] bg-white">
        <p className="font-semibold text-[#454A87]">
          {t.schoolName} • {t.schoolSubtitle}
        </p>
        <p className="mt-1 text-[11px] text-[#A9ABD2]">
          Official Portal System: Admin • Staff • Teacher • Parent • Student
        </p>
      </footer>
    </div>
  );
}
