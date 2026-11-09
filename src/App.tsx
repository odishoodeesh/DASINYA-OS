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
  ArrowLeftRight,
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
  Layers,
  ExternalLink
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IMPORTED_STUDENTS, StudentRecord, SubjectMark } from './data/importedStudents';
import { 
  getClassTimetable, 
  OFFICIAL_TIMETABLE_PERIODS 
} from './data/classSchedules';
import { 
  SCHOOL_CALENDAR_2026_2027, 
  OFFICIAL_CALENDAR_PDF_URLS, 
  CalendarEvent 
} from './data/schoolCalendar';
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
  { name: 'Kurdish', code: 'KUR', category: 'Language' },
  { name: 'English', code: 'ENG', category: 'Language' },
  { name: 'Arabic', code: 'ARA', category: 'Language' },
  { name: 'Math', code: 'MTH', category: 'STEM' },
  { name: 'Science', code: 'SCI', category: 'STEM' },
  { name: 'IT', code: 'ITC', category: 'Technology' },
  { name: 'Social Studies', code: 'SST', category: 'Humanities' },
  { name: 'Conversation', code: 'CNV', category: 'Language' },
  { name: 'Moral Values', code: 'MRV', category: 'Ethics' },
  { name: 'Religion', code: 'REL', category: 'Ethics' },
  { name: 'Art', code: 'ART', category: 'Arts & Sports' },
  { name: 'Music', code: 'MUS', category: 'Arts & Sports' },
  { name: 'PE', code: 'PED', category: 'Arts & Sports' },
];

export interface CurriculumSubject {
  name: string;
  code: string;
  category: string;
}

export const GRADE_CURRICULUM: Record<string, CurriculumSubject[]> = {
  'Grade 1': [
    { name: 'Kurdish', code: 'KUR', category: 'Language' },
    { name: 'English', code: 'ENG', category: 'Language' },
    { name: 'Math', code: 'MTH', category: 'STEM' },
    { name: 'Science', code: 'SCI', category: 'STEM' },
    { name: 'Conversation', code: 'CNV', category: 'Language' },
    { name: 'Religion', code: 'REL', category: 'Ethics' },
    { name: 'Moral Values', code: 'MRV', category: 'Ethics' },
    { name: 'Art', code: 'ART', category: 'Arts & Sports' },
    { name: 'Music', code: 'MUS', category: 'Arts & Sports' },
    { name: 'PE', code: 'PED', category: 'Arts & Sports' },
  ],
  'Grade 2': [
    { name: 'Kurdish', code: 'KUR', category: 'Language' },
    { name: 'English', code: 'ENG', category: 'Language' },
    { name: 'Math', code: 'MTH', category: 'STEM' },
    { name: 'Science', code: 'SCI', category: 'STEM' },
    { name: 'Conversation', code: 'CNV', category: 'Language' },
    { name: 'Religion', code: 'REL', category: 'Ethics' },
    { name: 'Moral Values', code: 'MRV', category: 'Ethics' },
    { name: 'Art', code: 'ART', category: 'Arts & Sports' },
    { name: 'Music', code: 'MUS', category: 'Arts & Sports' },
    { name: 'PE', code: 'PED', category: 'Arts & Sports' },
  ],
  'Grade 3': [
    { name: 'Kurdish', code: 'KUR', category: 'Language' },
    { name: 'English', code: 'ENG', category: 'Language' },
    { name: 'Math', code: 'MTH', category: 'STEM' },
    { name: 'Science', code: 'SCI', category: 'STEM' },
    { name: 'Conversation', code: 'CNV', category: 'Language' },
    { name: 'Religion', code: 'REL', category: 'Ethics' },
    { name: 'Moral Values', code: 'MRV', category: 'Ethics' },
    { name: 'Art', code: 'ART', category: 'Arts & Sports' },
    { name: 'Music', code: 'MUS', category: 'Arts & Sports' },
    { name: 'PE', code: 'PED', category: 'Arts & Sports' },
  ],
  'Grade 4': [
    { name: 'Kurdish', code: 'KUR', category: 'Language' },
    { name: 'English', code: 'ENG', category: 'Language' },
    { name: 'Arabic', code: 'ARA', category: 'Language' },
    { name: 'Math', code: 'MTH', category: 'STEM' },
    { name: 'Science', code: 'SCI', category: 'STEM' },
    { name: 'Social Studies', code: 'SST', category: 'Humanities' },
    { name: 'Religion', code: 'REL', category: 'Ethics' },
    { name: 'Moral Values', code: 'MRV', category: 'Ethics' },
    { name: 'Art', code: 'ART', category: 'Arts & Sports' },
    { name: 'Music', code: 'MUS', category: 'Arts & Sports' },
    { name: 'PE', code: 'PED', category: 'Arts & Sports' },
  ],
  'Grade 5': [
    { name: 'Kurdish', code: 'KUR', category: 'Language' },
    { name: 'English', code: 'ENG', category: 'Language' },
    { name: 'Arabic', code: 'ARA', category: 'Language' },
    { name: 'Math', code: 'MTH', category: 'STEM' },
    { name: 'Science', code: 'SCI', category: 'STEM' },
    { name: 'Social Studies', code: 'SST', category: 'Humanities' },
    { name: 'Religion', code: 'REL', category: 'Ethics' },
    { name: 'Moral Values', code: 'MRV', category: 'Ethics' },
    { name: 'Art', code: 'ART', category: 'Arts & Sports' },
    { name: 'Music', code: 'MUS', category: 'Arts & Sports' },
    { name: 'PE', code: 'PED', category: 'Arts & Sports' },
  ],
  'Grade 6': [
    { name: 'Kurdish', code: 'KUR', category: 'Language' },
    { name: 'English', code: 'ENG', category: 'Language' },
    { name: 'Arabic', code: 'ARA', category: 'Language' },
    { name: 'Math', code: 'MTH', category: 'STEM' },
    { name: 'Science', code: 'SCI', category: 'STEM' },
    { name: 'Social Studies', code: 'SST', category: 'Humanities' },
    { name: 'Religion', code: 'REL', category: 'Ethics' },
    { name: 'Moral Values', code: 'MRV', category: 'Ethics' },
    { name: 'Art', code: 'ART', category: 'Arts & Sports' },
    { name: 'Music', code: 'MUS', category: 'Arts & Sports' },
    { name: 'PE', code: 'PED', category: 'Arts & Sports' },
  ],
  'Grade 7': [
    { name: 'Kurdish', code: 'KUR', category: 'Language' },
    { name: 'English', code: 'ENG', category: 'Language' },
    { name: 'Arabic', code: 'ARA', category: 'Language' },
    { name: 'Math', code: 'MTH', category: 'STEM' },
    { name: 'Science', code: 'SCI', category: 'STEM' },
    { name: 'Social Studies', code: 'SST', category: 'Humanities' },
    { name: 'IT', code: 'ITC', category: 'Technology' },
    { name: 'Religion', code: 'REL', category: 'Ethics' },
    { name: 'Moral Values', code: 'MRV', category: 'Ethics' },
    { name: 'Art', code: 'ART', category: 'Arts & Sports' },
    { name: 'PE', code: 'PED', category: 'Arts & Sports' },
  ],
  'Grade 8': [
    { name: 'Kurdish', code: 'KUR', category: 'Language' },
    { name: 'English', code: 'ENG', category: 'Language' },
    { name: 'Arabic', code: 'ARA', category: 'Language' },
    { name: 'Math', code: 'MTH', category: 'STEM' },
    { name: 'Science', code: 'SCI', category: 'STEM' },
    { name: 'Social Studies', code: 'SST', category: 'Humanities' },
    { name: 'IT', code: 'ITC', category: 'Technology' },
    { name: 'Religion', code: 'REL', category: 'Ethics' },
    { name: 'Moral Values', code: 'MRV', category: 'Ethics' },
    { name: 'Art', code: 'ART', category: 'Arts & Sports' },
    { name: 'PE', code: 'PED', category: 'Arts & Sports' },
  ],
  'Grade 9': [
    { name: 'Kurdish', code: 'KUR', category: 'Language' },
    { name: 'English', code: 'ENG', category: 'Language' },
    { name: 'Arabic', code: 'ARA', category: 'Language' },
    { name: 'Math', code: 'MTH', category: 'STEM' },
    { name: 'Science', code: 'SCI', category: 'STEM' },
    { name: 'Social Studies', code: 'SST', category: 'Humanities' },
    { name: 'Religion', code: 'REL', category: 'Ethics' },
    { name: 'Moral Values', code: 'MRV', category: 'Ethics' },
    { name: 'Art', code: 'ART', category: 'Arts & Sports' },
    { name: 'PE', code: 'PED', category: 'Arts & Sports' },
  ],
};

export interface ReportSubjectRow {
  index: number;
  subject: string;
  code: string;
  category: string;
  hasMark: boolean;
  obtainedMarks: number | null;
  maxMarks: number;
  remarks?: string;
}

export type PortalTab = 'info' | 'marksheet' | 'food_menu' | 'timetable' | 'behaviour' | 'calendar' | null;

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

  // Dedicated to Parents Portal ONLY (other portals hidden)
  const [selectedPortal, setSelectedPortal] = useState<PortalRole>('parent');

  // Authentication State for Parent & Student (Password Only)
  const [authGuardian, setAuthGuardian] = useState<AuthenticatedGuardian | null>(null);
  const isPortalAuthenticated = Boolean(authGuardian);

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

  // Calendar filter and search states
  const [calendarSemesterFilter, setCalendarSemesterFilter] = useState<'all' | 'first' | 'second' | 'exams'>('all');
  const [calendarSearchQuery, setCalendarSearchQuery] = useState<string>('');

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

  // Helper to ensure user always sees the top of the page
  const scrollToTop = (smooth = true) => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const root = document.getElementById('root');
      if (root) root.scrollTop = 0;
    } catch {
      window.scrollTo(0, 0);
    }
  };

  // Scroll to top on portal tab, active student, or authentication changes
  useEffect(() => {
    scrollToTop(true);
  }, [activePortalTab, selectedChildId, isPortalAuthenticated]);

  // Global listener: WHEN CLICKING ON ANY BUTTON, USER SHOULD SEE THE TOP OF THE PAGE, NOT BOTTOM.
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const button = target?.closest('button');
      if (button) {
        scrollToTop(true);
        setTimeout(() => scrollToTop(true), 40);
        setTimeout(() => scrollToTop(false), 140);
      }
    };
    document.addEventListener('click', handleButtonClick, true);
    return () => document.removeEventListener('click', handleButtonClick, true);
  }, []);

  // Handle Login: Parents log in by password only
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

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
      setActivePortalTab(null); // When log in, parent ONLY sees the 5 buttons first!
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
    setIsLoggingIn(false);
  };

  // Sign out: returns to Parent login screen
  const handleSignOut = () => {
    setAuthGuardian(null);
    setAuthStaff(null);
    setSelectedChildId('');
    setActivePortalTab(null);
    setSelectedPortal('parent');
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
  };

  // Return to Parent Hub
  const handleSwitchPortal = () => {
    setActivePortalTab(null);
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

  // Helper to get Term 1 mark for any subject (obtainedMarks represents authentic mark from official uploaded marksheets)
  const getSubjectTerm1Mark = (subOrMark: SubjectMark | number): number => {
    if (typeof subOrMark === 'number') {
      return subOrMark;
    }
    return subOrMark.obtainedMarks;
  };

  // Complete curriculum subject rows for the student's grade:
  // Subjects with authentic uploaded marks show their mark.
  // Subjects without marks are kept on the report with NO mark, just empty.
  const reportSubjects = useMemo<ReportSubjectRow[]>(() => {
    if (!currentStudent) return [];
    const curriculum = GRADE_CURRICULUM[currentStudent.grade] || OFFICIAL_SUBJECTS;
    
    return curriculum.map((currSubject, idx) => {
      const uploaded = currentStudent.subjects?.find(
        s => s.subject.toLowerCase() === currSubject.name.toLowerCase()
      );
      const hasMark = Boolean(uploaded && typeof uploaded.obtainedMarks === 'number');

      return {
        index: idx + 1,
        subject: currSubject.name,
        code: currSubject.code,
        category: currSubject.category,
        hasMark,
        obtainedMarks: hasMark ? uploaded!.obtainedMarks : null,
        maxMarks: uploaded?.maxMarks || maxTermMark,
        remarks: uploaded?.remarks || '',
      };
    });
  }, [currentStudent, maxTermMark]);

  // Filtered report subjects based on category selection
  const displayedReportSubjects = useMemo(() => {
    if (selectedCategory === 'All') return reportSubjects;
    return reportSubjects.filter(sub => sub.category === selectedCategory);
  }, [reportSubjects, selectedCategory]);

  const displayedSubjects = currentStudent?.subjects || [];

  // Calculate totals across displayed subjects for Term 1 (only authentic recorded marks)
  const reportTotals = useMemo(() => {
    if (!currentStudent || !reportSubjects.length) {
      return { totalMax: 0, totalObtained: 0, totalRecordedMax: 0, hasAnyMark: false, maxTermMark };
    }
    const uploadedList = reportSubjects.filter(s => s.hasMark && typeof s.obtainedMarks === 'number');
    const totalObtained = uploadedList.reduce((sum, s) => sum + (s.obtainedMarks || 0), 0);
    const totalRecordedMax = uploadedList.reduce((sum, s) => sum + s.maxMarks, 0);

    return { 
      totalMax: reportSubjects.length * maxTermMark,
      totalRecordedMax,
      totalObtained: Number(totalObtained.toFixed(1)), 
      hasAnyMark: uploadedList.length > 0,
      maxTermMark 
    };
  }, [currentStudent, reportSubjects, maxTermMark]);

  // Filtered academic calendar events
  const filteredCalendarEvents = useMemo(() => {
    return SCHOOL_CALENDAR_2026_2027.filter((event) => {
      if (calendarSemesterFilter === 'first' && event.semester !== 'first') return false;
      if (calendarSemesterFilter === 'second' && event.semester !== 'second') return false;
      if (calendarSemesterFilter === 'exams' && event.type !== 'exam' && event.type !== 'assessment' && event.type !== 'break') return false;

      if (calendarSearchQuery.trim()) {
        const q = calendarSearchQuery.toLowerCase().trim();
        const matchesDate = event.dateRange.toLowerCase().includes(q);
        const matchesEn = event.activityEn.toLowerCase().includes(q);
        const matchesKu = event.activityKu.toLowerCase().includes(q);
        const matchesAr = event.activityAr.toLowerCase().includes(q);
        const matchesWeek = (event.weekEn || '').toLowerCase().includes(q) || (event.weekKu || '').toLowerCase().includes(q);
        return matchesDate || matchesEn || matchesKu || matchesAr || matchesWeek;
      }
      return true;
    });
  }, [calendarSemesterFilter, calendarSearchQuery]);

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

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`min-h-screen bg-[#F5F6FF] text-[#1A1D4E] flex flex-col selection:bg-[#E1E9FF] selection:text-[#0087A5] ${
        isRtl ? 'font-cairo' : 'font-sans'
      }`}
    >
      {/* Top Header Bar */}
      <header className="w-full border-b border-[#E1E9FF] px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-[0_2px_12px_rgba(0,135,165,0.04)]">
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
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-[#FFF2E8] text-[#FF6D00]">
                {t.portalParent}
              </span>
            </div>
            <p className="text-[11px] text-[#6B70A6] font-medium">
              {t.departmentName}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">

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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E1E9FF] hover:border-[#0087A5] bg-[#F5F6FF] hover:bg-white text-[#1A1D4E] rounded-xl text-xs font-semibold transition-all shadow-[0_2px_6px_rgba(0,135,165,0.04)] cursor-pointer"
              title="Select Language / هلبژارتنا زمانی / اختيار اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-[#0087A5]" />
              <span className="hidden sm:inline font-medium">{activeLangOption.nativeLabel}</span>
              <span className="sm:hidden font-mono uppercase text-[11px]">{language}</span>
              <ChevronDown className={`w-3 h-3 text-[#7C85FF] transition-transform duration-150 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangMenuOpen && (
              <div 
                className={`absolute top-full mt-1.5 bg-white border border-[#E1E9FF] rounded-2xl shadow-[0_12px_32px_rgba(0,135,165,0.12)] z-50 py-1.5 w-52 sm:w-56 overflow-hidden ${
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
                          ? 'bg-[#0087A5] text-white font-bold' 
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
      {/* PARENTS PORTAL LOGIN (PASSWORD ONLY)                     */}
      {/* ======================================================== */}
      {!isPortalAuthenticated && (
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-start text-center">
          {/* School Crest */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 max-w-full flex items-center justify-center mb-3">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Dasinya Private School Logo" 
              className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,135,165,0.15)]" 
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1D4E] mb-1">
            {t.parentLoginTitle}
          </h2>

          <p className="text-xs sm:text-sm text-[#6B70A6] max-w-md mx-auto mb-6 leading-relaxed">
            {language === 'ku' 
              ? 'ب رێکا وشەی تێپەڕبوون (پاسوۆرد) بچۆ ژوورڤە بۆ بینینا نمرەیان، خشتەیێ وانان و راپۆرتا رەوشتی' 
              : language === 'ar' 
              ? 'سجل الدخول بكلمة المرور فقط لعرض بيانات الطالب وكشف الدرجات والجدول الدراسي' 
              : 'Sign in using student password to access academic evaluations, marksheet & timetable'}
          </p>

          {/* LOGIN CARD */}
          <div className="w-full max-w-md bg-white border border-[#E1E9FF] hover:border-[#FF7F2A]/50 rounded-3xl p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,135,165,0.08)] text-left transition-all">
            {/* Header in Login Card */}
            <div className={`flex items-center gap-3 mb-5 pb-4 border-b border-[#E1E9FF] ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF7F2A] to-[#FF5599] flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_rgba(255,127,42,0.35)]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1D4E]">
                  {t.portalParent}
                </h3>
                <span className="inline-block text-[10px] font-bold text-[#FF6D00] bg-[#FFF2E8] px-2.5 py-0.5 rounded-full font-mono">
                  {t.authPasswordOnly}
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
              {/* PASSWORD FIELD (PASSWORD ONLY) */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider text-[#454A87] ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none text-[#7C85FF] ${isRtl ? 'right-3.5' : 'left-3.5'}`}>
                    <Lock className="w-4 h-4 text-[#FF7F2A]" />
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
                      language === 'ku' ? 'وشەی تێپەڕبوون بنووسە' : language === 'ar' ? 'أدخل كلمة المرور' : 'Enter student password'
                    }
                    className={`w-full bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl py-3 text-xs text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7F2A] focus:border-transparent transition-all ${
                      isRtl ? 'pr-10 pl-11 text-right' : 'pl-10 pr-11 text-left'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 flex items-center text-[#7C85FF] hover:text-[#FF7F2A] px-3 cursor-pointer ${
                      isRtl ? 'left-1' : 'right-1'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#FF7F2A] hover:bg-[#E56E20] text-white py-3.5 px-4 rounded-2xl text-xs font-bold transition-all shadow-[0_4px_14px_rgba(255,127,42,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 active:scale-[0.99]"
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
      {/* VIEW: PARENT ACCOUNT (AUTHENTICATED)                     */}
      {/* ONLY SEES THE 5 BUTTONS: INFO, MARKSHEET, FOOD MENU,     */}
      {/* CLASSES TIMETABLE, BEHAVIOUR REPORT                      */}
      {/* ======================================================== */}
      {isPortalAuthenticated && currentStudent && (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Student Account Top Banner */}
          <div className="bg-gradient-to-r from-[#FF7F2A] via-[#FF5599] to-[#0087A5] text-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_24px_rgba(255,127,42,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className={`flex items-center gap-4 ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/25 shadow-xs">
                <HeartHandshake className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-white/25 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-bold text-white">
                    {t.portalParent}
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

            {/* Sign Out Button in Banner */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handleSignOut}
                className="px-3.5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-xs rounded-xl text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5 border border-white/30 shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.logoutButtonLabel}</span>
              </button>
            </div>
          </div>



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
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#0087A5] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(0,135,165,0.12)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(0,135,165,0.05)]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2AD4FF] to-[#0087A5] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(42,212,255,0.35)] group-hover:scale-105 transition-transform">
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E1E9FF] text-[#0087A5]">
                      01
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1A1D4E] group-hover:text-[#0087A5] transition-colors mb-1">
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
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#FF5599] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(255,85,153,0.14)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(0,135,165,0.05)]"
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
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#00D4AA] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(0,212,170,0.14)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(0,135,165,0.05)]"
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
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#0087A5] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(0,135,165,0.14)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(0,135,165,0.05)]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0087A5] to-[#7C85FF] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,135,165,0.35)] group-hover:scale-105 transition-transform">
                      <CalendarDays className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E1E9FF] text-[#0087A5]">
                      04
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1A1D4E] group-hover:text-[#0087A5] transition-colors mb-1">
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
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#BB8FFF] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(187,143,255,0.18)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(0,135,165,0.05)]"
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
                      {language === 'ku' ? 'راپۆرتا فەرمی یا سلوک و دەوامی (د دەمێ بارکرنێ دا)' : language === 'ar' ? 'السجل الرسمي للسلوك والمواظبة (يُعرض فور رفعه)' : 'Official conduct & attendance records (published when uploaded)'}
                    </p>
                  </div>
                </button>

                {/* 6. ACADEMIC CALENDAR */}
                <button
                  onClick={() => setActivePortalTab('calendar')}
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#0087A5] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(0,135,165,0.18)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(0,135,165,0.05)]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0087A5] to-[#2AD4FF] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,135,165,0.35)] group-hover:scale-105 transition-transform">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E1E9FF] text-[#0087A5]">
                      06
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1A1D4E] group-hover:text-[#0087A5] transition-colors mb-1">
                      {t.tabCalendar}
                    </h4>
                    <p className="text-xs text-[#6B70A6] line-clamp-2">
                      {language === 'ku' ? 'ساڵنامەی فەرمی یێ وانان، ئەزموون و پشوویێن ٢٠٢٦-٢٠٢٧ ب کوردی و ئینگلیزی' : language === 'ar' ? 'التقويم السنوي المعتمد للامتحانات، مواعيد الحصص والعطلات الرسمية' : 'Official 2026-2027 calendar of classes, exam dates & school breaks'}
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
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0087A5] hover:underline cursor-pointer"
                >
                  {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  <span>{t.backToPortalMenu}</span>
                </button>

                {/* Sub-tabs Quick Switcher */}
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  <button
                    onClick={() => setActivePortalTab('info')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'info' ? 'bg-[#0087A5] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {t.tabInfo}
                  </button>
                  <button
                    onClick={() => setActivePortalTab('marksheet')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'marksheet' ? 'bg-[#0087A5] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {t.tabMarksheet}
                  </button>
                  <button
                    onClick={() => setActivePortalTab('food_menu')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'food_menu' ? 'bg-[#0087A5] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {t.tabFoodMenu}
                  </button>
                  <button
                    onClick={() => setActivePortalTab('timetable')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'timetable' ? 'bg-[#0087A5] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {t.tabClassesTimetable}
                  </button>
                  <button
                    onClick={() => setActivePortalTab('behaviour')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'behaviour' ? 'bg-[#0087A5] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {t.tabBehaviourReport}
                  </button>
                  <button
                    onClick={() => setActivePortalTab('calendar')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'calendar' ? 'bg-[#0087A5] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {t.tabCalendar}
                  </button>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* SECTION 1: INFO                                      */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'info' && (
                <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E1E9FF]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1A1D4E]">{t.tabInfo}</h3>
                      <p className="text-xs text-[#6B70A6]">{t.infoSubtitle}</p>
                    </div>
                    <span className="px-3.5 py-1 bg-[#E1E9FF] text-[#0087A5] font-mono font-bold text-xs rounded-full">
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
                      <span className="font-bold text-[#0087A5] text-sm">{currentStudent.classRank}</span>
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
                      <FileSpreadsheet className="w-5 h-5 text-[#0087A5]" />
                      <span className="text-xs font-bold text-[#1A1D4E]">
                        {isPrimary25 ? t.term1MarkOutOf25 : t.term1MarkOutOf20}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownloadPdf('printable-marksheet')}
                      disabled={isGeneratingPdf}
                      className="px-4 py-2 bg-[#0087A5] hover:bg-[#00738D] text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(0,135,165,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      <span>{t.downloadPdf}</span>
                    </button>
                  </div>

                  {/* Printable Marksheet Container */}
                  <div id="printable-marksheet" className="bg-white border border-[#E1E9FF] rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-[0_6px_24px_rgba(0,135,165,0.06)] space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">
                    {/* Marksheet Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E1E9FF] pb-4 sm:pb-5 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={SCHOOL_LOGO_URL} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-lg font-black text-[#1A1D4E] truncate">{t.schoolName}</h4>
                          <p className="text-[11px] sm:text-xs text-[#6B70A6]">{t.studentMarksheetTitle}</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E1E9FF]/60">
                        <span className="inline-block bg-[#E1E9FF] text-[#0087A5] font-bold text-xs px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full font-mono">
                          {currentStudent.rollNumber}
                        </span>
                        <p className="text-[10px] sm:text-[11px] text-[#8C90C2] sm:mt-1">{currentStudent.academicYear}</p>
                      </div>
                    </div>

                    {/* Student Snapshot */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs bg-[#F5F6FF] p-3 sm:p-4 rounded-2xl border border-[#E1E9FF]">
                      <div className="min-w-0">
                        <span className="text-[#8C90C2] text-[10px] sm:text-xs block">{t.studentName}:</span>
                        <span className="font-bold text-[#1A1D4E] block truncate">{currentStudent.name}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[#8C90C2] text-[10px] sm:text-xs block">{t.idNumber}:</span>
                        <span className="font-bold font-mono text-[#1A1D4E] block truncate">{currentStudent.id}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[#8C90C2] text-[10px] sm:text-xs block">
                          {language === 'ku' ? 'پۆل و دەستە' : language === 'ar' ? 'الصف والشعبة' : 'Grade & Class'}:
                        </span>
                        <span className="font-bold text-[#1A1D4E] block truncate">{currentStudent.grade} - {currentStudent.section}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[#8C90C2] text-[10px] sm:text-xs block">{t.termContribution}:</span>
                        <span className="font-bold text-[#0087A5] block truncate">{isPrimary25 ? '25% Weight' : '20% Weight'}</span>
                      </div>
                    </div>

                    {/* Marksheet Subject Table - Keeps all subjects on report with no mark (empty) for un-uploaded ones */}
                    <div className="space-y-3">
                      {/* Mobile Scroll Indicator Helper */}
                      <div className="sm:hidden flex items-center justify-between text-[11px] text-[#0087A5] bg-[#F0F8FA] px-3 py-2 rounded-xl border border-[#C8E5EC]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {language === 'ku' 
                              ? 'بۆ بینینا هەمی خانە و نمران، خشتەی بۆ لای ڕاست و چەپ ڕابکێشە' 
                              : language === 'ar' 
                              ? 'اسحب الجدول يميناً ويساراً لعرض كافة الدرجات' 
                              : 'Swipe table horizontally to view all marks'}
                          </span>
                        </span>
                      </div>

                      <div className="border border-[#C8E5EC] rounded-2xl overflow-x-auto shadow-xs w-full max-w-full touch-pan-x">
                        <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
                          <thead className="bg-[#F0F8FA] border-b border-[#C8E5EC] font-bold text-[#0D2D35]">
                            <tr>
                              <th className="py-3 px-3 text-center w-10">#</th>
                              <th className="py-3 px-4 min-w-[150px]">{t.subject}</th>
                              <th className="py-3 px-3 text-center min-w-[130px]">{language === 'ku' ? 'پشکنین' : language === 'ar' ? 'التوثيق' : 'Status'}</th>
                              <th className={`py-3 px-5 min-w-[140px] whitespace-nowrap ${isRtl ? 'text-left' : 'text-right'}`}>
                                {isPrimary25 ? t.term1MarkOutOf25 : t.term1MarkOutOf20}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#C8E5EC]">
                            {displayedReportSubjects.map((sub, idx) => (
                              <tr key={idx} className="hover:bg-[#F0F8FA]/60 transition-colors">
                                <td className="py-2.5 sm:py-3 px-3 text-center font-mono text-[#76A5B8]">{idx + 1}</td>
                                <td className="py-2.5 sm:py-3 px-4 font-bold text-[#0D2D35]">
                                  {getTranslatedSubject(sub.subject, language)}
                                </td>
                                <td className="py-2.5 sm:py-3 px-3 text-center">
                                  {sub.hasMark ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>{language === 'ku' ? 'فەرمی و پشتڕاستکراو' : language === 'ar' ? 'رسمي ومعتمد' : 'Verified'}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-[#8C90C2] font-medium whitespace-nowrap">
                                      {language === 'ku' ? 'چاوەڕوانی بارکردنە' : language === 'ar' ? 'بانتظار الرفع' : 'Awaiting upload'}
                                    </span>
                                  )}
                                </td>
                                <td className={`py-2.5 sm:py-3 px-5 font-mono ${isRtl ? 'text-left' : 'text-right'}`}>
                                  {sub.hasMark ? (
                                    <span className="font-bold whitespace-nowrap">
                                      <span className="text-sm sm:text-base font-black text-[#0087A5]">{sub.obtainedMarks}</span>
                                      <span className="text-xs text-[#76A5B8] font-normal font-mono ml-1">/ {sub.maxMarks}</span>
                                    </span>
                                  ) : (
                                    /* Subjects without marks: keep on report with NO mark, just empty */
                                    <span className="inline-block min-h-[1.25rem]"></span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-[#F0F8FA] font-bold border-t-2 border-[#0087A5]">
                              <td className="py-3 px-3 text-center">#</td>
                              <td className="py-3 px-4" colSpan={2}>{t.totalMarks}</td>
                              <td className={`py-3 px-5 font-mono font-black text-[#0087A5] text-sm sm:text-base whitespace-nowrap ${isRtl ? 'text-left' : 'text-right'}`}>
                                {reportTotals.hasAnyMark ? (
                                  <span>
                                    {reportTotals.totalObtained}
                                    <span className="text-xs text-[#76A5B8] font-normal font-mono ml-1">
                                      / {reportTotals.totalRecordedMax}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="inline-block min-h-[1.25rem]"></span>
                                )}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Official Marksheet Verification Notice */}
                      <div className="p-4 bg-[#F0F8FA] border border-[#C8E5EC] rounded-2xl flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#0087A5] shrink-0 mt-0.5" />
                        <div className="text-xs text-[#0D2D35] leading-relaxed">
                          <p className="font-bold mb-1">
                            {language === 'ku' 
                              ? 'پشتڕاستکردنەوەی فەرمی: نمرە ڕاستەقینەکانی تاقیکردنەوە' 
                              : language === 'ar' 
                              ? 'توثيق رسمي: درجات الامتحانات المعتمدة فقط' 
                              : 'Official Evaluation Record: Authentic Marks Only'}
                          </p>
                          <p className="text-[#355B66]">
                            {language === 'ku'
                              ? 'نمرەی فەرمی ئەو بابەتانەی لە کەشف نمرە بارکراون تۆمار کراون. ئەو بابەتانەی هێشتا نمرەکانیان بارنەکراون بە بەتاڵی لە کەشف نمرە دەمێننەوە هەتا لە لایەن مامۆستایانەوە بە فەرمی پەسەند دەکرێن.'
                              : language === 'ar'
                              ? 'الدرجات المرفوعة من كشوف الامتحانات الرسمية مسجلة ومعتمدة. المواد التي لم تُرفع درجاتها بعد تظهر في التقرير بدون علامة (فارغة) لحين اعتمادها رسمياً من المدرسة.'
                              : 'Authentic examination marks uploaded from official school marksheets are recorded above. Subjects without uploaded marks are kept on the report with no mark (blank) until officially submitted by the school.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SECTION 3: FOOD MENU                                 */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'food_menu' && (
                <div className="space-y-4">
                  <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)]">
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
                        <div key={item.dayKey} className="border border-[#E1E9FF] rounded-2xl p-4 bg-[#F5F6FF]/40 hover:bg-white hover:border-[#0087A5] transition-all hover:shadow-[0_4px_16px_rgba(0,135,165,0.08)]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[#0087A5] text-sm">
                              {language === 'ku' ? item.dayKu : language === 'ar' ? item.dayAr : item.dayEn}
                            </span>
                            <span className="text-[10px] font-mono bg-[#E1E9FF] text-[#0087A5] font-bold px-2.5 py-0.5 rounded-full">
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
                  <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E1E9FF] gap-3 mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0087A5] to-[#7C85FF] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,135,165,0.3)]">
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
                            selectedTimetableDay === 'all' ? 'bg-[#0087A5] text-white shadow-xs' : 'bg-[#F5F6FF] text-[#454A87] hover:bg-[#E1E9FF]'
                          }`}
                        >
                          All
                        </button>
                        {timetableSchedule.map(d => (
                          <button
                            key={d.key}
                            onClick={() => setSelectedTimetableDay(d.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              selectedTimetableDay === d.key ? 'bg-[#0087A5] text-white shadow-xs' : 'bg-[#F5F6FF] text-[#454A87] hover:bg-[#E1E9FF]'
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
                                    <span className="w-7 h-7 rounded-lg bg-[#E1E9FF] text-[#0087A5] flex items-center justify-center font-mono font-bold text-xs">
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
                <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E1E9FF] gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BB8FFF] to-[#FF7F2A] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(187,143,255,0.3)] shrink-0">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-[#1A1D4E]">{t.tabBehaviourReport}</h3>
                        <p className="text-xs text-[#6B70A6]">
                          {language === 'ku' 
                            ? 'راپۆرتا فەرمی یا سلوک، رەوشت و ئامادەبوونا قوتابی' 
                            : language === 'ar' 
                            ? 'سجل السلوك والمواظبة والانضباط المدرسي الرسمي' 
                            : 'Official Student Conduct, Discipline & Attendance Record'}
                        </p>
                      </div>
                    </div>
                    <span className="self-start sm:self-center px-3.5 py-1 bg-[#F5F6FF] border border-[#E1E9FF] text-[#454A87] font-mono text-xs rounded-xl font-bold">
                      {currentStudent.rollNumber}
                    </span>
                  </div>

                  {/* Real uploaded behaviour data check */}
                  {currentStudent.behaviourReport?.uploaded ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {currentStudent.behaviourReport.conductStanding && (
                          <div className="p-4 bg-[#E6FAF6] border border-[#00D4AA]/30 rounded-2xl text-center">
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#00A887] mb-1">{t.conduct}</span>
                            <span className="text-lg font-black text-[#00A887]">{currentStudent.behaviourReport.conductStanding}</span>
                          </div>
                        )}
                        {currentStudent.behaviourReport.attendanceRate && (
                          <div className="p-4 bg-[#E1E9FF] border border-[#7C85FF]/30 rounded-2xl text-center">
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#0087A5] mb-1">{t.attendance}</span>
                            <span className="text-lg font-black text-[#0087A5]">{currentStudent.behaviourReport.attendanceRate}</span>
                          </div>
                        )}
                        {currentStudent.behaviourReport.counselorName && (
                          <div className="p-4 bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl text-center">
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                              {language === 'ku' ? 'چاڤدێرێ پەروەردەیی' : language === 'ar' ? 'المرشد التربوي' : 'Counselor'}
                            </span>
                            <span className="text-sm font-bold text-[#1A1D4E]">{currentStudent.behaviourReport.counselorName}</span>
                          </div>
                        )}
                      </div>

                      {currentStudent.behaviourReport.remarks && (
                        <div className="border border-[#E1E9FF] bg-[#F5F6FF] rounded-2xl p-4 text-xs leading-relaxed text-[#454A87]">
                          <span className="font-bold text-[#1A1D4E] block mb-1">
                            {language === 'ku' ? 'تێبینیا فەرمی یا سلوکی:' : language === 'ar' ? 'الملاحظة السلوكية المعتمدة:' : 'Official Behavioural Evaluation:'}
                          </span>
                          {currentStudent.behaviourReport.remarks}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Clean authentic state when no behaviour report has been uploaded yet */
                    <div className="space-y-6">
                      <div className="p-8 rounded-3xl border-2 border-dashed border-[#E1E9FF] bg-[#F5F6FF]/60 text-center flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#E1E9FF] text-[#0087A5] flex items-center justify-center shadow-xs">
                          <FileText className="w-7 h-7" />
                        </div>
                        <div className="space-y-1.5 max-w-lg">
                          <span className="inline-block px-3 py-1 rounded-full bg-[#FFF2E8] text-[#FF6D00] text-[10px] font-bold uppercase tracking-wider">
                            {language === 'ku' ? 'هێشتا نەهاتیە بارکرن' : language === 'ar' ? 'لم يتم الرفع بعد' : 'Awaiting Official Upload'}
                          </span>
                          <h4 className="text-base font-bold text-[#1A1D4E] pt-1">
                            {language === 'ku' 
                              ? 'چ راپۆرتێن سلوکی بۆ ڤی قوتابی نەهاتینە بارکرن' 
                              : language === 'ar' 
                              ? 'لا يوجد تقرير سلوك مرفوع لهذا الطالب حالياً' 
                              : 'No Official Behaviour Report Uploaded Yet'}
                          </h4>
                          <p className="text-xs text-[#6B70A6] leading-relaxed">
                            {language === 'ku' 
                              ? 'راپۆرتا سلوکی، ئامادەبوون و رەوشتێ قوتابی دێ ل ڤێرێ دەربکەڤیت پشتی کو ژ لایێ کارگێریا قوتابخانێ و چاڤدێرێ پەروەردەیی ڤە بهێتە پەسەندکرن و بارکرن.' 
                              : language === 'ar' 
                              ? 'سيتم عرض تقرير السلوك والمواظبة والملاحظات التربوية المعتمدة هنا مباشرة فور اعتمادها ورفعها من إدارة المدرسة.' 
                              : 'Official student conduct records, counselor evaluations, and attendance summaries will be published here directly once officially approved and uploaded by the school administration.'}
                          </p>
                        </div>
                      </div>

                      {/* Authentic Student Record Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3.5 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">{t.studentName}</span>
                          <span className="text-xs font-bold text-[#1A1D4E]">{currentStudent.name}</span>
                        </div>
                        <div className="p-3.5 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                            {language === 'ku' ? 'پۆل و هۆبە' : language === 'ar' ? 'الصف والشعبة' : 'Grade & Section'}
                          </span>
                          <span className="text-xs font-bold text-[#1A1D4E]">{formatGradeLabel(currentStudent.grade, language)} - {formatClassLabel(currentStudent.section, language)}</span>
                        </div>
                        <div className="p-3.5 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">{t.idNumber}</span>
                          <span className="text-xs font-mono font-bold text-[#0087A5]">{currentStudent.id}</span>
                        </div>
                        <div className="p-3.5 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                            {language === 'ku' ? 'بارێ پەروەردەیی' : language === 'ar' ? 'الحالة الانضباطية' : 'Disciplinary Record'}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {language === 'ku' ? 'چ سەرپێچی تۆمار نینن' : language === 'ar' ? 'لا توجد مخالفات مسجلة' : 'No Incidents on Record'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SECTION 6: ACADEMIC CALENDAR                         */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'calendar' && (
                <div className="space-y-5">
                  {/* Calendar Top Action Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E1E9FF] p-3.5 rounded-2xl shadow-xs print:hidden">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#F0F8FA] text-[#0087A5] flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#1A1D4E] block">
                          {t.calendarTitle}
                        </span>
                        <span className="text-[11px] text-[#6B70A6]">
                          {language === 'ku' ? 'ساڵنامەی فەرمی ب زمانێن کوردی و ئینگلیزی' : language === 'ar' ? 'التقويم السنوي المعتمد باللغتين الكردية والإنجليزية' : 'Official Ministry Schedule in Kurdish & English'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Original PDF links */}
                      <a
                        href={OFFICIAL_CALENDAR_PDF_URLS.english}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#F0F8FA] hover:bg-[#E6F4F7] text-[#0087A5] border border-[#C8E5EC] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                        title="Open English Calendar PDF"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>English PDF</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      <a
                        href={OFFICIAL_CALENDAR_PDF_URLS.kurdish}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#F0F8FA] hover:bg-[#E6F4F7] text-[#0087A5] border border-[#C8E5EC] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                        title="Open Kurdish Calendar PDF"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>کوردی PDF</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      {/* PDF Download Button */}
                      <button
                        onClick={() => handleDownloadPdf('printable-calendar', 'Academic_Calendar_2026-2027')}
                        disabled={isGeneratingPdf}
                        className="px-3.5 py-1.5 bg-[#0087A5] hover:bg-[#00738D] text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(0,135,165,0.3)] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        <span>{t.downloadPdf}</span>
                      </button>
                    </div>
                  </div>

                  {/* Highlights Summary Cards (Key Academic Milestones) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
                    <div className="p-3 bg-white border border-[#E1E9FF] rounded-2xl shadow-2xs">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0087A5] mb-0.5">
                        {language === 'ku' ? 'دەستپێکی خوێندن' : language === 'ar' ? 'بداية العام' : 'School Starts'}
                      </span>
                      <span className="font-mono text-xs font-black text-[#1A1D4E] block">2026-09-20</span>
                      <span className="text-[10px] text-[#6B70A6]">{language === 'ku' ? 'هەفتەی ١' : 'Week 1'}</span>
                    </div>

                    <div className="p-3 bg-white border border-[#E1E9FF] rounded-2xl shadow-2xs">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-0.5">
                        {language === 'ku' ? 'خولی ١ هەڵسەنگاندن' : language === 'ar' ? 'تقييم جولة ١' : 'Assessment 1'}
                      </span>
                      <span className="font-mono text-xs font-black text-[#1A1D4E] block">Dec 9–12, 2026</span>
                      <span className="text-[10px] text-[#6B70A6]">{language === 'ku' ? '٣ ڕۆژ' : '3 days'}</span>
                    </div>

                    <div className="p-3 bg-white border border-[#E1E9FF] rounded-2xl shadow-2xs">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-0.5">
                        {language === 'ku' ? 'تاقیکردنەوەی وەرزی ١' : language === 'ar' ? 'امتحانات الفصل ١' : 'Term 1 Finals'}
                      </span>
                      <span className="font-mono text-xs font-black text-[#1A1D4E] block">Dec 15–24, 2026</span>
                      <span className="text-[10px] text-[#6B70A6]">{language === 'ku' ? '٩ ڕۆژ' : '9 days'}</span>
                    </div>

                    <div className="p-3 bg-white border border-[#E1E9FF] rounded-2xl shadow-2xs">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-0.5">
                        {language === 'ku' ? 'پشووی نەورۆز' : language === 'ar' ? 'عطلة نوروز' : 'Newroz Break'}
                      </span>
                      <span className="font-mono text-xs font-black text-[#1A1D4E] block">Mar 9–23, 2027</span>
                      <span className="text-[10px] text-[#6B70A6]">{language === 'ku' ? '١٥ ڕۆژ' : '15 days'}</span>
                    </div>

                    <div className="p-3 bg-white border border-[#E1E9FF] rounded-2xl shadow-2xs">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0087A5] mb-0.5">
                        {language === 'ku' ? 'تاقیکردنەوەی وەرزی ٢' : language === 'ar' ? 'امتحانات الفصل ٢' : 'Term 2 Finals'}
                      </span>
                      <span className="font-mono text-xs font-black text-[#1A1D4E] block">May 2–12, 2027</span>
                      <span className="text-[10px] text-[#6B70A6]">{language === 'ku' ? '٩ ڕۆژ' : '9 days'}</span>
                    </div>

                    <div className="p-3 bg-white border border-[#E1E9FF] rounded-2xl shadow-2xs">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-0.5">
                        {language === 'ku' ? 'پۆلی ١٢ وەزاری' : language === 'ar' ? 'بكالوريا الصف ١٢' : 'Grade 12 Finals'}
                      </span>
                      <span className="font-mono text-xs font-black text-[#1A1D4E] block">May 21–24, 2027</span>
                      <span className="text-[10px] text-[#6B70A6]">{language === 'ku' ? 'خولی یەکەم' : 'Round 1'}</span>
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E1E9FF] p-3 rounded-2xl shadow-xs print:hidden">
                    {/* Semester Switcher Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                      <button
                        onClick={() => setCalendarSemesterFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          calendarSemesterFilter === 'all'
                            ? 'bg-[#0087A5] text-white shadow-xs'
                            : 'bg-[#F5F6FF] text-[#454A87] hover:bg-[#E1E9FF]'
                        }`}
                      >
                        {language === 'ku' ? 'هەموو بەروارەکان' : language === 'ar' ? 'جميع المواعيد' : 'All Events'}
                        <span className="ml-1.5 text-[10px] opacity-80 font-mono">({SCHOOL_CALENDAR_2026_2027.length})</span>
                      </button>

                      <button
                        onClick={() => setCalendarSemesterFilter('first')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          calendarSemesterFilter === 'first'
                            ? 'bg-[#0087A5] text-white shadow-xs'
                            : 'bg-[#F5F6FF] text-[#454A87] hover:bg-[#E1E9FF]'
                        }`}
                      >
                        {language === 'ku' ? 'وەرزی یەکەم' : language === 'ar' ? 'الفصل الأول' : 'First Semester'}
                      </button>

                      <button
                        onClick={() => setCalendarSemesterFilter('second')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          calendarSemesterFilter === 'second'
                            ? 'bg-[#0087A5] text-white shadow-xs'
                            : 'bg-[#F5F6FF] text-[#454A87] hover:bg-[#E1E9FF]'
                        }`}
                      >
                        {language === 'ku' ? 'وەرزی دووەم' : language === 'ar' ? 'الفصل الثاني' : 'Second Semester'}
                      </button>

                      <button
                        onClick={() => setCalendarSemesterFilter('exams')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          calendarSemesterFilter === 'exams'
                            ? 'bg-[#0087A5] text-white shadow-xs'
                            : 'bg-[#F5F6FF] text-[#454A87] hover:bg-[#E1E9FF]'
                        }`}
                      >
                        {language === 'ku' ? 'ئەزموون و پشوویەکان' : language === 'ar' ? 'الامتحانات والعطلات' : 'Exams & Breaks'}
                      </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full sm:w-64">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#8C90C2]">
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={calendarSearchQuery}
                        onChange={(e) => setCalendarSearchQuery(e.target.value)}
                        placeholder={
                          language === 'ku' ? 'گەڕان بەپێی بەروار یان چالاکی...' : language === 'ar' ? 'بحث بالتاريخ أو الحدث...' : 'Search dates or events...'
                        }
                        className="w-full pl-9 pr-3 py-1.5 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl text-xs text-[#1A1D4E] placeholder:text-[#8C90C2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
                      />
                    </div>
                  </div>

                  {/* Printable Calendar Container */}
                  <div id="printable-calendar" className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_24px_rgba(0,135,165,0.06)] space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#E1E9FF] pb-5">
                      <div className="flex items-center gap-3.5">
                        <img src={SCHOOL_LOGO_URL} alt="Logo" className="w-12 h-12 object-contain" />
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-[#1A1D4E]">{t.schoolName}</h4>
                          <p className="text-xs text-[#6B70A6] font-medium">{t.calendarTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-[#F0F8FA] border border-[#C8E5EC] text-[#0087A5] font-bold text-xs px-3.5 py-1 rounded-full font-mono">
                          2026 – 2027
                        </span>
                        <p className="text-[11px] text-[#8C90C2] mt-1">
                          {language === 'ku' ? 'ساڵنامەی فەرمی خوێندن' : language === 'ar' ? 'التقويم السنوي المعتمد' : 'Official Academic Year'}
                        </p>
                      </div>
                    </div>

                    {/* Official Table with Both Kurdish and English Following Official PDFs */}
                    <div className="border border-[#C8E5EC] rounded-2xl overflow-x-auto shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F0F8FA] border-b border-[#C8E5EC] font-bold text-[#0D2D35]">
                          <tr>
                            <th className="py-3 px-3 text-center w-10">#</th>
                            <th className="py-3 px-3 whitespace-nowrap">
                              {language === 'ku' ? 'وەرز' : language === 'ar' ? 'الفصل' : 'Semester'}
                            </th>
                            <th className="py-3 px-3 whitespace-nowrap">
                              {language === 'ku' ? 'بەروار' : language === 'ar' ? 'التاريخ' : 'Date / Date Range'}
                            </th>
                            <th className="py-3 px-3 whitespace-nowrap">
                              {language === 'ku' ? 'هەفتە' : language === 'ar' ? 'الأسبوع' : 'Week'}
                            </th>
                            <th className="py-3 px-4">
                              <span className="text-[#0087A5] font-black">چالاکی ب کوردی</span>
                              <span className="text-[11px] font-normal text-[#6B70A6] ml-1">(Kurdish Description)</span>
                            </th>
                            <th className="py-3 px-4">
                              <span className="text-[#1A1D4E] font-black">Activity / Description</span>
                              <span className="text-[11px] font-normal text-[#6B70A6] ml-1">(English)</span>
                            </th>
                            <th className="py-3 px-3 text-center whitespace-nowrap">
                              {language === 'ku' ? 'ماوە' : language === 'ar' ? 'المدة' : 'Duration'}
                            </th>
                            <th className="py-3 px-3 text-center whitespace-nowrap">
                              {language === 'ku' ? 'جۆر' : language === 'ar' ? 'النوع' : 'Type'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C8E5EC]">
                          {filteredCalendarEvents.map((evt, idx) => {
                            const isFirstSem = evt.semester === 'first';
                            return (
                              <tr 
                                key={evt.id} 
                                className={`transition-colors ${
                                  evt.type === 'exam' 
                                    ? 'bg-purple-50/40 hover:bg-purple-50/70' 
                                    : evt.type === 'break' 
                                    ? 'bg-rose-50/40 hover:bg-rose-50/70' 
                                    : evt.type === 'assessment'
                                    ? 'bg-amber-50/40 hover:bg-amber-50/70'
                                    : evt.type === 'start'
                                    ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                                    : 'hover:bg-[#F0F8FA]/60'
                                }`}
                              >
                                <td className="py-2.5 px-3 text-center font-mono text-[#76A5B8]">{idx + 1}</td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    isFirstSem 
                                      ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  }`}>
                                    {language === 'ku' ? evt.semesterLabelKu : language === 'ar' ? evt.semesterLabelAr : evt.semesterLabelEn}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-[#0D2D35] whitespace-nowrap">
                                  {evt.dateRange}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-[#454A87] whitespace-nowrap">
                                  {evt.weekEn ? (
                                    <span>{language === 'ku' ? evt.weekKu : language === 'ar' ? evt.weekAr : evt.weekEn}</span>
                                  ) : (
                                    <span className="text-[#8C90C2]">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4 font-bold text-[#0087A5] text-right" dir="rtl">
                                  {evt.activityKu}
                                  {evt.notesKu && (
                                    <span className="block text-[10px] text-purple-700 font-normal mt-0.5">
                                      * {evt.notesKu}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4 font-semibold text-[#1A1D4E]" dir="ltr">
                                  {evt.activityEn}
                                  {evt.notesEn && (
                                    <span className="block text-[10px] text-purple-700 font-normal mt-0.5">
                                      * {evt.notesEn}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono font-semibold text-[#454A87] whitespace-nowrap">
                                  {language === 'ku' ? evt.durationKu : language === 'ar' ? evt.durationAr : evt.durationEn}
                                </td>
                                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                  {evt.type === 'exam' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                      {language === 'ku' ? 'تاقیکردنەوە' : language === 'ar' ? 'امتحان' : 'Exam'}
                                    </span>
                                  )}
                                  {evt.type === 'break' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                      {language === 'ku' ? 'پشوو' : language === 'ar' ? 'عطلة' : 'Break'}
                                    </span>
                                  )}
                                  {evt.type === 'assessment' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                      {language === 'ku' ? 'هەڵسەنگاندن' : language === 'ar' ? 'تقييم' : 'Assessment'}
                                    </span>
                                  )}
                                  {evt.type === 'start' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      {language === 'ku' ? 'دەستپێک' : language === 'ar' ? 'بداية' : 'Start'}
                                    </span>
                                  )}
                                  {evt.type === 'classes' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                                      {language === 'ku' ? 'خوێندن' : language === 'ar' ? 'دوام' : 'Classes'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Official Notes from Kurdish & English Ministry PDFs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-[#F0F8FA] border border-[#C8E5EC] rounded-2xl flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#0087A5] shrink-0 mt-0.5" />
                        <div className="text-xs text-[#0D2D35] leading-relaxed space-y-1">
                          <p className="font-bold text-[#0087A5]">
                            {language === 'ku' ? 'تێبینییا فەرمی یا ئەزموونێن شەمبیێ' : language === 'ar' ? 'ملاحظة امتحانات أيام السبت' : 'Saturday Examination Schedule Note'}
                          </p>
                          <p className="text-[#355B66]">
                            {language === 'ku'
                              ? 'ڕۆژانی شەممەش تاقیکردنەوەکانی تیادا ئەنجام دەدرێت لە ماوەی تاقیکردنەوە فەرمییەکاندا (کۆتایی وەرزی یەکەم و دووەم).'
                              : language === 'ar'
                              ? 'تُجرى الامتحانات في أيام السبت أيضاً خلال فترات الامتحانات النهائية للفصلين الأول والثاني.'
                              : 'Saturday sessions are included for examination schedules during official first and second semester finals.'}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-[#F0F8FA] border border-[#C8E5EC] rounded-2xl flex items-start gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-[#0087A5] shrink-0 mt-0.5" />
                        <div className="text-xs text-[#0D2D35] leading-relaxed space-y-1">
                          <p className="font-bold text-[#0087A5]">
                            {language === 'ku' ? 'تەواوکەری ساڵنامەی فەرمی' : language === 'ar' ? 'التوثيق الرسمي للتقويم' : 'Official Ministry Alignment'}
                          </p>
                          <p className="text-[#355B66]">
                            {language === 'ku'
                              ? 'ئەم ساڵنامەیە تەواو بەپێی بەڵگەنامەی فەرمی وەزارەت و قوتابخانەیە، وەرگێڕدراو و پەسەندکراو بە هەردوو زمانی کوردی و ئینگلیزی.'
                              : language === 'ar'
                              ? 'هذا التقويم متطابق تماماً مع الوثائق الرسمية الصادرة عن إدارة المدرسة ووزارة التربية، باللغتين الكردية والإنجليزية.'
                              : 'This schedule follows the official Kurdish ministry calendar and verified English translation documents for academic year 2026–2027.'}
                          </p>
                        </div>
                      </div>
                    </div>
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
          <div className="bg-gradient-to-r from-[#BB8FFF] via-[#7C85FF] to-[#0087A5] text-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_24px_rgba(187,143,255,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
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
                  className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
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
                  teacherTab === 'roster' ? 'bg-[#0087A5] text-white shadow-xs' : 'text-[#454A87] hover:text-[#1A1D4E]'
                }`}
              >
                Class Roster & Marks
              </button>
              <button
                onClick={() => setTeacherTab('timetable')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  teacherTab === 'timetable' ? 'bg-[#0087A5] text-white shadow-xs' : 'text-[#454A87] hover:text-[#1A1D4E]'
                }`}
              >
                Class Timetable
              </button>
            </div>
          </div>

          {/* Teacher Tab 1: Class Roster & Grades */}
          {teacherTab === 'roster' && (
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
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
                    className="pl-9 pr-3 py-1.5 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl text-xs w-48 text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
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
                      <th className="py-3 px-3">Kurdish (Term 1)</th>
                      <th className="py-3 px-3">Other Subjects</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E9FF]">
                    {staffFilteredStudents.map((s, idx) => {
                      const kur = s.subjects.find(sub => sub.subject === 'Kurdish');

                      return (
                        <tr key={s.id} className="hover:bg-[#F5F6FF]/60 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono text-[#8C90C2]">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-[#1A1D4E]">{s.name}</td>
                          <td className="py-2.5 px-3 font-mono text-[#6B70A6]">{s.rollNumber}</td>
                          <td className="py-2.5 px-3 text-[#00A887] font-semibold">{s.attendance}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#0087A5]">
                            {kur ? `${kur.obtainedMarks} / ${kur.maxMarks}` : <span className="text-[#8C90C2] font-normal">Pending</span>}
                          </td>
                          <td className="py-2.5 px-3 text-[#8C90C2] text-xs">
                            Awaiting upload
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => setModalStudent(s)}
                              className="px-3 py-1 bg-[#0087A5] hover:bg-[#00738D] text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-xs"
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
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)]">
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
          <div className="bg-gradient-to-r from-[#00D4AA] via-[#2CC9A7] to-[#0087A5] text-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,212,170,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  staffTab === 'students' ? 'bg-[#0087A5] text-white shadow-xs' : 'text-[#454A87] hover:text-[#1A1D4E]'
                }`}
              >
                Student Directory
              </button>
              <button
                onClick={() => setStaffTab('timetables')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  staffTab === 'timetables' ? 'bg-[#0087A5] text-white shadow-xs' : 'text-[#454A87] hover:text-[#1A1D4E]'
                }`}
              >
                Class Timetables
              </button>
              <button
                onClick={() => setStaffTab('food_menu')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  staffTab === 'food_menu' ? 'bg-[#0087A5] text-white shadow-xs' : 'text-[#454A87] hover:text-[#1A1D4E]'
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
                  className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
                >
                  {officialGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <select
                  value={staffClass}
                  onChange={(e) => setStaffClass(e.target.value)}
                  className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
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
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
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
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0087A5]">{s.guardianPassword}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setModalStudent(s)}
                            className="px-3 py-1 bg-[#0087A5] text-white rounded-lg text-[11px] font-bold cursor-pointer hover:bg-[#00738D] transition-colors shadow-xs"
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
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
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
            <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
              <h3 className="text-base font-bold text-[#1A1D4E]">Weekly Cafeteria Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WEEKLY_FOOD_MENU.map(item => (
                  <div key={item.dayKey} className="border border-[#E1E9FF] rounded-2xl p-4 bg-[#F5F6FF]/30 hover:bg-white hover:border-[#0087A5] transition-all">
                    <span className="font-bold text-[#0087A5] text-sm block mb-1">{item.dayEn}</span>
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
          <div className="bg-gradient-to-r from-[#0087A5] via-[#5F6DFF] to-[#7C85FF] text-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,135,165,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <span className="text-2xl sm:text-3xl font-black text-[#0087A5]">18</span>
              <span className="text-[11px] text-[#6B70A6] block mt-1">Classes A, B, C, E</span>
            </div>
            <div className="bg-white border border-[#E1E9FF] rounded-2xl p-4 sm:p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C90C2] block mb-1">Attendance Rate</span>
              <span className="text-2xl sm:text-3xl font-black text-[#00A887]">97.8%</span>
              <span className="text-[11px] text-[#00A887] block mt-1 font-semibold">Exemplary</span>
            </div>
          </div>

          {/* Admin Master Directory */}
          <div className="bg-white border border-[#E1E9FF] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
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
                  className="pl-9 pr-3 py-1.5 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl text-xs w-56 text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
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
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0087A5]">{s.guardianPassword}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setModalStudent(s)}
                            className="px-3 py-1 bg-[#0087A5] text-white rounded-lg text-[11px] font-bold cursor-pointer hover:bg-[#00738D] transition-colors shadow-xs"
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
          <div className="bg-white border border-[#E1E9FF] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,135,165,0.25)] relative space-y-5">
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
                className="w-8 h-8 rounded-full bg-[#F5F6FF] hover:bg-[#E1E9FF] flex items-center justify-center text-[#0087A5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Marksheet Subject List */}
            {(() => {
              const curriculum = GRADE_CURRICULUM[modalStudent.grade] || OFFICIAL_SUBJECTS;
              const isG13 = parseInt(modalStudent.grade.replace(/\D/g, ''), 10) <= 3;
              const defaultMax = isG13 ? 25 : 20;

              return (
                <div className="border border-[#C8E5EC] rounded-2xl overflow-x-auto shadow-xs w-full max-w-full touch-pan-x">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[480px]">
                    <thead className="bg-[#F0F8FA] font-bold text-[#0D2D35]">
                      <tr>
                        <th className="py-3 px-3.5">#</th>
                        <th className="py-3 px-3.5 min-w-[140px]">Subject</th>
                        <th className="py-3 px-3.5 text-center min-w-[120px]">Status</th>
                        <th className="py-3 px-3.5 text-right min-w-[130px]">Term 1 Exam Mark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C8E5EC]">
                      {curriculum.map((cSub, i) => {
                        const uploaded = modalStudent.subjects?.find(
                          s => s.subject.toLowerCase() === cSub.name.toLowerCase()
                        );
                        const hasMark = Boolean(uploaded && typeof uploaded.obtainedMarks === 'number');

                        return (
                          <tr key={i} className="hover:bg-[#F0F8FA]/50 transition-colors">
                            <td className="py-2.5 px-3.5 font-mono text-[#76A5B8]">{i + 1}</td>
                            <td className="py-2.5 px-3.5 font-semibold text-[#0D2D35]">
                              {getTranslatedSubject(cSub.name, language)}
                            </td>
                            <td className="py-2.5 px-3.5 text-center">
                              {hasMark ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Verified
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#8C90C2]">
                                  Awaiting upload
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3.5 font-mono font-bold text-[#0087A5] text-right">
                              {hasMark ? `${uploaded!.obtainedMarks} / ${uploaded!.maxMarks || defaultMax}` : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E1E9FF]">
              <button
                onClick={() => setModalStudent(null)}
                className="px-4 py-2 bg-[#F5F6FF] hover:bg-[#E1E9FF] text-[#0087A5] rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
          {t.schoolName} • {t.portalParent}
        </p>
        <p className="mt-1 text-[11px] text-[#A9ABD2]">
          {language === 'ku'
            ? 'سیستەمێ فەرمی یێ دەوازەیا دایکوبابان • قوتابخانەیا داسنیا یا تایبەت'
            : language === 'ar'
            ? 'البوابة الرسمية لأولياء الأمور • مدرسة داسنيا الأهلية'
            : 'Official Parents Portal System • Dasinya Private School'}
        </p>
      </footer>
    </div>
  );
}
