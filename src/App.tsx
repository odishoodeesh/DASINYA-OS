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
  HeartHandshake
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
  { name: 'French', code: 'FRN', category: 'Language' },
  { name: 'Math', code: 'MTH', category: 'STEM' },
  { name: 'Science', code: 'SCI', category: 'STEM' },
  { name: 'IT', code: 'ITC', category: 'Technology' },
  { name: 'AI', code: 'AIC', category: 'Technology' },
  { name: 'Social Studies', code: 'SST', category: 'Humanities' },
  { name: 'KOMALAYETI', code: 'KOM', category: 'Humanities' },
  { name: 'KARAMAYI', code: 'KRM', category: 'Applied' },
  { name: 'Psychology (دەرونزانی)', code: 'PSY', category: 'Humanities' },
  { name: 'Conversation', code: 'CNV', category: 'Communication' },
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

// Weekly Cafeteria Nutrition Schedule (Sunday to Thursday)
export const WEEKLY_FOOD_MENU = [
  {
    dayKey: 'sunday',
    dayEn: 'Sunday',
    dayKu: 'ئێک شەمبی',
    dayAr: 'الأحد',
    mainDishEn: 'Grilled Herb Chicken Breast with Saffron Basmati Rice',
    mainDishKu: 'سنگی مریشکێ برژاندی دگەل برنجێ زەعفەرانی یێ بەسمەتی',
    mainDishAr: 'صدر دجاج مشوي بالأعشاب مع رز بسمتي بالزعفران',
    sideDishEn: 'Warm Yellow Lentil Soup & Fresh Kurdish Garden Salad',
    sideDishKu: 'شۆربایا نیسکێ یا گەرم دگەل زەڵاتەیا تەڕ و تازە یا بیستانان',
    sideDishAr: 'شوربة عدس صفراء دافئة وسلطة خضراء طازجة',
    snackEn: 'Fresh Local Pomegranate & Crisp Apple Slices with Organic Honey',
    snackKu: 'هەنارێن خۆمالی و سێڤێن تەڕ دگەل هنگڤینێ سروشتی',
    snackAr: 'رمان محلي طازج وشرائح تفاح مقرمشة مع عسل طبيعي',
    beverageEn: 'Fresh Pressed Apple Juice & Pure Mineral Water',
    beverageKu: 'ئاڤا سێڤان یا تەڕ و ئاڤا کانیێ یا پاقژ',
    beverageAr: 'عصير تفاح طبيعي طازج ومياه معدنية نقية',
    calories: '540 kcal',
    tags: ['High Protein', 'Halal', 'Nut-Free']
  },
  {
    dayKey: 'monday',
    dayEn: 'Monday',
    dayKu: 'دوو شەمبی',
    dayAr: 'الإثنين',
    mainDishEn: 'Traditional Home-style Kurdish Dolma (Stuffed Grape Leaves & Summer Squash)',
    mainDishKu: 'دۆلمەیا کوردی یا تایبەت ب گۆشتێ نەرم و بەلگێ مێوان',
    mainDishAr: 'دولمة كوردية تقليدية باللحم المفروم وورق العنب والكوسا',
    sideDishEn: 'Chilled Plain Yogurt & Fresh Herb Cucumbers',
    sideDishKu: 'ماستێ سار و ترۆزی و خەیارێن تەڕ',
    sideDishAr: 'لبن زبادي بارد وخيار طازج مع النعناع',
    snackEn: 'Whole Wheat Labneh Toast with Sliced Cucumbers',
    snackKu: 'نانی تەمام دگەل مەستیکێ و خەیاران',
    snackAr: 'توست الحبوب الكاملة مع لبنة بلدية وشرائح الخيار',
    beverageEn: 'Cold Aryan (Yogurt Drink) & Pure Mineral Water',
    beverageKu: 'دەوێ سار یێ کوردی و ئاڤا پاقژ',
    beverageAr: 'لبن عيران بارد ومياه معدنية نقية',
    calories: '510 kcal',
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

  // Mode: 'portal' (Guardian Portal) or 'staff' (Administrative Full Roster View)
  const [mode, setMode] = useState<'portal' | 'staff'>('portal');

  // Guardian Authentication State
  const [authGuardian, setAuthGuardian] = useState<AuthenticatedGuardian | null>(null);
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active student in guardian's account (when guardian has multiple children)
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // The 5 Options: When logging in, user ONLY sees these 5 buttons: INFO, MARKSHEET, FOOD MENU, CLASSES TIMETABLE, BEHAVIOUR REPORT
  // Default is null so user sees ONLY the 5 buttons first!
  const [activePortalTab, setActivePortalTab] = useState<PortalTab>(null);

  // Active day selection for Timetable
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<string>('all');

  // Category filter for marksheet
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Administrative Staff View State
  const officialGrades = useMemo(() => Object.keys(SCHOOL_STRUCTURE), []);
  const [staffGrade, setStaffGrade] = useState<string>('Grade 1');
  const [staffClass, setStaffClass] = useState<string>('Class A');
  const [staffStudentId, setStaffStudentId] = useState<string>('');
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');
  const [isStaffStudentDropdownOpen, setIsStaffStudentDropdownOpen] = useState<boolean>(false);
  const staffStudentDropdownRef = useRef<HTMLDivElement>(null);

  // Translations dictionary for active language
  const t = useMemo(() => TRANSLATIONS[language], [language]);
  const isRtl = language === 'ku' || language === 'ar';

  // Synchronize HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRtl, language]);

  // Restore session from localStorage on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dasinya_guardian_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        const pwd = (parsed.password || parsed.pwd || '').trim();
        if (pwd) {
          const matched = students.filter(s => 
            (s.guardianPassword && s.guardianPassword.trim() === pwd) ||
            (s.guardianPasswordAlt && s.guardianPasswordAlt.trim() === pwd)
          );
          if (matched.length > 0) {
            setAuthGuardian({
              password: pwd,
              email: matched[0].guardianEmail || '',
              students: matched
            });
            setSelectedChildId(matched[0].id);
            setActivePortalTab(null); // Keep at the 5-buttons menu view upon session restore
          }
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [students]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (staffStudentDropdownRef.current && !staffStudentDropdownRef.current.contains(event.target as Node)) {
        setIsStaffStudentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Student / Guardian Login (Password Only)
  const handleGuardianLogin = (e?: React.FormEvent, customPwd?: string) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const pwdToVerify = (customPwd !== undefined ? customPwd : loginPassword).trim();

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

    // Lookup matching student(s) by password
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
      setSelectedCategory('All');
      try {
        localStorage.setItem('dasinya_guardian_session', JSON.stringify({
          password: pwdToVerify
        }));
      } catch {
        // Ignore
      }
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

  // Handle Guardian Logout
  const handleGuardianLogout = () => {
    setAuthGuardian(null);
    setSelectedChildId('');
    setLoginPassword('');
    setLoginError('');
    setActivePortalTab(null);
    setSelectedCategory('All');
    try {
      localStorage.removeItem('dasinya_guardian_session');
    } catch {
      // Ignore
    }
  };

  // Active student in the Guardian Account
  const activeGuardianStudent = useMemo(() => {
    if (!authGuardian || !authGuardian.students.length) return null;
    const found = authGuardian.students.find(s => s.id === selectedChildId);
    return found || authGuardian.students[0];
  }, [authGuardian, selectedChildId]);

  // Active student in Staff View
  const activeStaffStudent = useMemo(() => {
    if (!staffStudentId) return null;
    const found = students.find(s => s.id === staffStudentId);
    if (found && found.grade === staffGrade && found.section === staffClass) {
      return found;
    }
    return null;
  }, [staffStudentId, staffGrade, staffClass, students]);

  // Overall active student to display marksheet for
  const currentStudent = mode === 'portal' ? activeGuardianStudent : activeStaffStudent;

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
      const gradeClean = currentStudent.grade.replace(/\s+/g, '_');
      const classClean = currentStudent.section.replace(/\s+/g, '_');
      pdf.save(`Dasinya_${filenameSuffix}_${gradeClean}_${classClean}_${studentNameClean}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Language options
  const activeLangOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  // Staff View: available classes and students
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
    if (!currentStudent) return [];
    
    // Retrieve authentic timetable mapped directly from official aSc Timetables PDF
    const officialDays = getClassTimetable(currentStudent.grade, currentStudent.section);
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
  }, [currentStudent, t]);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`min-h-screen bg-white text-neutral-900 flex flex-col selection:bg-neutral-100 ${
        isRtl ? 'font-cairo' : 'font-sans'
      }`}
    >
      {/* Top Header Bar */}
      <header className="w-full border-b border-neutral-100 px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white sticky top-0 z-30 shadow-2xs">
        {/* School Crest & Identity */}
        <div className={`flex items-center gap-3 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Dasinya Private School Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 leading-tight">
              {t.schoolName}
            </h1>
            <p className="text-[11px] text-neutral-400 font-medium">
              {t.departmentName}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-neutral-200 hover:border-[#0087A5] bg-neutral-50/80 hover:bg-neutral-100 text-neutral-800 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Select Language / هلبژارتنا زمانی / اختيار اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-[#0087A5]" />
              <span className="hidden sm:inline">{activeLangOption.nativeLabel}</span>
              <span className="sm:hidden font-mono uppercase text-[11px]">{language}</span>
              <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-150 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangMenuOpen && (
              <div 
                className={`absolute top-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-1 w-52 sm:w-56 overflow-hidden ${
                  isRtl ? 'left-0 sm:left-auto sm:right-0' : 'right-0'
                }`}
              >
                <div className="px-3 py-1.5 border-b border-neutral-100 text-[10px] uppercase tracking-wider font-bold text-neutral-400">
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
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-[#0087A5] text-white font-bold' 
                          : 'hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{langOpt.flag}</span>
                        <div>
                          <span className="block leading-snug">{langOpt.nativeLabel}</span>
                          <span className={`text-[10px] block leading-tight ${isSelected ? 'text-white/80' : 'text-neutral-400'}`}>
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

          {/* If Guardian Logged In, display Log Out button */}
          {mode === 'portal' && authGuardian && (
            <button
              onClick={handleGuardianLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 hover:border-red-600 hover:bg-red-50 hover:text-red-600 text-neutral-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title={t.logoutButtonLabel}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.logoutButtonLabel}</span>
            </button>
          )}

          {/* Switch between Staff View and Portal */}
          {mode === 'staff' && (
            <button
              onClick={() => setMode('portal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{t.backToGuardianLogin}</span>
            </button>
          )}
        </div>
      </header>

      {/* VIEW 1: GUARDIAN PORTAL LOGIN (Clean login without hints or sample accounts) */}
      {mode === 'portal' && !authGuardian && (
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-6 pb-12 flex flex-col items-center justify-start text-center">
          
          {/* Official Crest - 4x size positioned high on the page */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 max-w-full flex items-center justify-center mb-3 sm:mb-4">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Dasinya Private School Logo" 
              className="w-full h-full object-contain drop-shadow-md" 
            />
          </div>

          {/* School Name & Portal Heading */}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1.5">
            {t.schoolName}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mb-6 leading-relaxed">
            {t.guardianLoginSubtitle}
          </p>

          {/* STUDENT / GUARDIAN LOGIN CARD (PASSWORD ONLY) */}
          <div className="w-full max-w-md bg-white border border-neutral-200 hover:border-[#0087A5]/50 rounded-2xl p-6 sm:p-8 shadow-sm text-left transition-colors">
            <div className={`flex items-center gap-3 mb-5 pb-4 border-b border-neutral-100 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-[#0087A5]/10 flex items-center justify-center text-[#0087A5] shrink-0">
                <Lock className="w-5 h-5 text-[#0087A5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {language === 'ku' ? 'چوونەژوورا دەرگەهێ قوتابی' : language === 'ar' ? 'الدخول إلى بوابة الطالب' : 'Student Portal Access'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {language === 'ku' ? 'ب رێکا وشەی تێپەڕبوون بچۆ ژوورڤە' : language === 'ar' ? 'تسجيل الدخول بكلمة المرور فقط' : 'Log in using password only'}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{loginError}</span>
              </div>
            )}

            {/* Password-Only Form */}
            <form onSubmit={handleGuardianLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider text-neutral-700 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none text-neutral-400 ${isRtl ? 'right-3' : 'left-3'}`}>
                    <KeyRound className="w-4 h-4 text-[#0087A5]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    autoFocus
                    className={`w-full py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#0087A5] focus:ring-2 focus:ring-[#0087A5]/20 focus:bg-white shadow-2xs transition-colors ${
                      isRtl ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10 text-left'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 flex items-center px-3 text-neutral-400 hover:text-neutral-700 cursor-pointer ${
                      isRtl ? 'left-0' : 'right-0'
                    }`}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-4 bg-[#0087A5] text-white hover:bg-[#00728c] active:scale-[0.99] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.loggingInLabel}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.loginButtonLabel}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Staff Mode Access Link at Bottom */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={() => setMode('staff')}
              className="text-xs text-neutral-400 hover:text-[#0087A5] hover:underline transition-colors cursor-pointer"
            >
              {t.staffBrowseOption}
            </button>

            {/* Fast Language Switcher at Bottom */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
              <span className="text-neutral-400 font-medium">{t.language}:</span>
              {SUPPORTED_LANGUAGES.map((langOpt) => (
                <button
                  key={langOpt.code}
                  onClick={() => setLanguage(langOpt.code)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                    language === langOpt.code 
                      ? 'bg-neutral-900 text-white font-bold' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {langOpt.nativeLabel}
                </button>
              ))}
            </div>
          </div>

        </main>
      )}

      {/* VIEW 2: GUARDIAN ACCOUNT */}
      {/* WHEN LOG IN, USER ONLY SEES THESE 5: INFO, MARKSHEET, FOOD MENU, CLASSES TIMETABLE, BEHAVIOUR REPORT. THEN USER SELECTS ONE TO OPEN */}
      {mode === 'portal' && authGuardian && currentStudent && (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
          
          {/* Guardian Account Top Bar */}
          <div className="bg-[#0087A5] text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-white/80 font-bold">
                    {language === 'ku' ? 'هەژمارا قوتابی' : language === 'ar' ? 'حساب الطالب' : 'Student Portal'}
                  </span>
                  {authGuardian.students.length > 1 && (
                    <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                      {authGuardian.students.length} {t.registeredChildrenLabel}
                    </span>
                  )}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {currentStudent ? currentStudent.name : 'Student Profile'}
                </h2>
              </div>
            </div>

            {/* Top Bar Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {activePortalTab !== null && (
                <button
                  onClick={() => setActivePortalTab(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                  <span>{t.backToPortalMenu}</span>
                </button>
              )}
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printReport}</span>
              </button>
              <button
                onClick={handleGuardianLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-red-500/80 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title={t.logoutButtonLabel}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.logoutButtonLabel}</span>
              </button>
            </div>
          </div>

          {/* Child Switcher if multiple children belong to this guardian */}
          {authGuardian.students.length > 1 && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0087A5]" />
                <span>{t.switchStudentLabel}:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {authGuardian.students.map((child) => {
                  const isSelected = child.id === currentStudent.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        setSelectedChildId(child.id);
                        setSelectedCategory('All');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected 
                          ? 'bg-[#0087A5] text-white shadow-xs' 
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{child.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-black/20 text-white' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {formatGradeLabel(child.grade, language)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* LANDING STATE UPON LOGIN: USER ONLY SEES THESE 5 BUTTONS */}
          {/* INFO, MARKSHEET, FOOD MENU, CLASSES TIMETABLE, BEHAVIOUR REPORT */}
          {/* ======================================================== */}
          {activePortalTab === null && (
            <div className="space-y-6 pt-2">
              
              {/* Student Identification Greeting Header */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className={`flex items-center gap-4 ${isRtl ? 'sm:flex-row-reverse text-right' : 'text-left'}`}>
                  <div className="w-14 h-14 rounded-2xl bg-[#0087A5] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-[#0087A5] block">
                      {formatGradeLabel(currentStudent.grade, language)} &bull; {formatClassLabel(currentStudent.section, language)} &bull; {currentStudent.rollNumber}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-neutral-900">
                      {currentStudent.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {currentStudent.academicYear} &bull; {t.term1Name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 shadow-2xs">
                    ID: {currentStudent.id.replace('DPS-', '')}
                  </span>
                </div>
              </div>

              {/* THE 5 PRIMARY SELECTION CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. INFO */}
                <button
                  onClick={() => setActivePortalTab('info')}
                  className="group bg-white border-2 border-neutral-200 hover:border-[#0087A5] rounded-2xl p-6 text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[160px]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-[#0087A5] text-neutral-800 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-neutral-400 group-hover:text-[#0087A5] transition-colors flex items-center gap-1">
                      <span>Open</span>
                      {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-neutral-900 group-hover:text-[#0087A5] transition-colors uppercase tracking-wide">
                      {t.tabInfo}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      {t.infoSubtitle}
                    </p>
                  </div>
                </button>

                {/* 2. MARKSHEET */}
                <button
                  onClick={() => setActivePortalTab('marksheet')}
                  className="group bg-white border-2 border-neutral-200 hover:border-[#0087A5] rounded-2xl p-6 text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[160px]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-[#0087A5] text-neutral-800 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-neutral-400 group-hover:text-[#0087A5] transition-colors flex items-center gap-1">
                      <span>Open</span>
                      {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-neutral-900 group-hover:text-[#0087A5] transition-colors uppercase tracking-wide">
                      {t.tabMarksheet}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      {language === 'ku' ? 'نمرەیێن فەرمی یێن وەرزێ ئێکێ و داگرتنا PDF' : language === 'ar' ? 'درجات الفصل الأول الرسمية وتنزيل كشف الدرجات PDF' : 'Official Term 1 subject evaluation & PDF download'}
                    </p>
                  </div>
                </button>

                {/* 3. FOOD MENU */}
                <button
                  onClick={() => setActivePortalTab('food_menu')}
                  className="group bg-white border-2 border-neutral-200 hover:border-[#0087A5] rounded-2xl p-6 text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[160px]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-[#0087A5] text-neutral-800 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-neutral-400 group-hover:text-[#0087A5] transition-colors flex items-center gap-1">
                      <span>Open</span>
                      {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-neutral-900 group-hover:text-[#0087A5] transition-colors uppercase tracking-wide">
                      {t.tabFoodMenu}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      {language === 'ku' ? 'مێنیویا خوارنێ یا حەفتیانە و خوارنا ساخلەم' : language === 'ar' ? 'قائمة الوجبات الغذائية المدرسية الأسبوعية' : 'Weekly balanced cafeteria meals & healthy fruit snacks'}
                    </p>
                  </div>
                </button>

                {/* 4. CLASSES TIMETABLE */}
                <button
                  onClick={() => setActivePortalTab('timetable')}
                  className="group bg-white border-2 border-neutral-200 hover:border-[#0087A5] rounded-2xl p-6 text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[160px]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-[#0087A5] text-neutral-800 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <CalendarDays className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-neutral-400 group-hover:text-[#0087A5] transition-colors flex items-center gap-1">
                      <span>Open</span>
                      {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-neutral-900 group-hover:text-[#0087A5] transition-colors uppercase tracking-wide">
                      {t.tabClassesTimetable}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      {language === 'ku' ? 'خشتەیێ حەفتیانە یێ وانان ژ ئێک شەمبی هەتا پێنج شەمبی' : language === 'ar' ? 'جدول الحصص الأسبوعي من الأحد إلى الخميس' : 'Instructional periods, subjects & room timetable'}
                    </p>
                  </div>
                </button>

                {/* 5. BEHAVIOUR REPORT */}
                <button
                  onClick={() => setActivePortalTab('behaviour')}
                  className="group bg-white border-2 border-neutral-200 hover:border-[#0087A5] rounded-2xl p-6 text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[160px] sm:col-span-2 lg:col-span-1"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-[#0087A5] text-neutral-800 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-neutral-400 group-hover:text-[#0087A5] transition-colors flex items-center gap-1">
                      <span>Open</span>
                      {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-neutral-900 group-hover:text-[#0087A5] transition-colors uppercase tracking-wide">
                      {t.tabBehaviourReport}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      {language === 'ku' ? 'هەلسەنگاندنا رەوشتی، ئامادەبوون، و دەستخۆشیێن مامۆستایان' : language === 'ar' ? 'تقرير السلوك والمواظبة وشهادات الشكر والتقدير' : 'Term 1 conduct evaluation, attendance & commendations'}
                    </p>
                  </div>
                </button>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* WHEN A SECTION IS SELECTED: OPEN THAT SPECIFIC SECTION    */}
          {/* WITH BACK TO MENU BUTTON AND QUICK SWITCH TABS           */}
          {/* ======================================================== */}
          {activePortalTab !== null && (
            <div className="space-y-6">
              
              {/* Active Section Quick Tab Bar with Back button */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-2.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                
                {/* Back to Menu Button */}
                <button
                  onClick={() => setActivePortalTab(null)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  <span>{t.backToPortalMenu}</span>
                </button>

                {/* 5 Tab Quick Switchers */}
                <div className="flex flex-wrap items-center gap-1.5">
                  
                  {/* INFO TAB */}
                  <button
                    onClick={() => setActivePortalTab('info')}
                    className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activePortalTab === 'info'
                        ? 'bg-[#0087A5] text-white shadow-xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 hover:text-[#0087A5] text-neutral-700 border border-neutral-200'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{t.tabInfo}</span>
                  </button>

                  {/* MARKSHEET TAB */}
                  <button
                    onClick={() => setActivePortalTab('marksheet')}
                    className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activePortalTab === 'marksheet'
                        ? 'bg-[#0087A5] text-white shadow-xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 hover:text-[#0087A5] text-neutral-700 border border-neutral-200'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{t.tabMarksheet}</span>
                  </button>

                  {/* FOOD MENU TAB */}
                  <button
                    onClick={() => setActivePortalTab('food_menu')}
                    className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activePortalTab === 'food_menu'
                        ? 'bg-[#0087A5] text-white shadow-xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 hover:text-[#0087A5] text-neutral-700 border border-neutral-200'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>{t.tabFoodMenu}</span>
                  </button>

                  {/* CLASSES TIMETABLE TAB */}
                  <button
                    onClick={() => setActivePortalTab('timetable')}
                    className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activePortalTab === 'timetable'
                        ? 'bg-[#0087A5] text-white shadow-xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 hover:text-[#0087A5] text-neutral-700 border border-neutral-200'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{t.tabClassesTimetable}</span>
                  </button>

                  {/* BEHAVIOUR REPORT TAB */}
                  <button
                    onClick={() => setActivePortalTab('behaviour')}
                    className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activePortalTab === 'behaviour'
                        ? 'bg-[#0087A5] text-white shadow-xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 hover:text-[#0087A5] text-neutral-700 border border-neutral-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.tabBehaviourReport}</span>
                  </button>

                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* SECTION 1: INFO                                      */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'info' && (
                <section id="printable-info" className="bg-white border border-neutral-300 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
                  
                  {/* Institutional Header */}
                  <div className="text-center border-b-2 border-neutral-900 pb-5 mb-5">
                    <div className="inline-flex items-center justify-center gap-3 mb-2">
                      <div className="w-14 h-14 flex items-center justify-center shrink-0">
                        <img 
                          src={SCHOOL_LOGO_URL} 
                          alt="Dasinya Private School Logo" 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">{t.schoolName}</h2>
                        <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">{t.departmentName}</p>
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 mt-2">
                      {t.studentAccountDetails} &bull; {currentStudent.academicYear}
                    </h3>
                  </div>

                  {/* Student Title Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                        {t.studentName}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                        {currentStudent.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-neutral-900 text-white text-xs font-bold rounded-lg font-mono">
                        {formatGradeLabel(currentStudent.grade, language)} &bull; {formatClassLabel(currentStudent.section, language)}
                      </span>
                      <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-lg font-mono border border-neutral-200">
                        {currentStudent.rollNumber}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Grid (Mother name hidden everywhere) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                      <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.idNumber}</span>
                      <p className="text-neutral-900 text-sm font-bold font-mono mt-0.5">{currentStudent.id.replace('DPS-', '')}</p>
                    </div>

                    <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                      <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.gender}</span>
                      <p className="text-neutral-900 text-sm font-bold mt-0.5">{currentStudent.gender === 'Female' ? t.female : t.male}</p>
                    </div>

                    <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                      <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.academicYear}</span>
                      <p className="text-neutral-900 text-sm font-bold mt-0.5">{currentStudent.academicYear}</p>
                    </div>

                    <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                      <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.bloodGroup}</span>
                      <p className="text-neutral-900 text-sm font-bold mt-0.5">{currentStudent.bloodGroup || 'O+'}</p>
                    </div>

                    {currentStudent.dob && (
                      <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                        <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.dob}</span>
                        <p className="text-neutral-900 text-sm font-bold mt-0.5">{currentStudent.dob}</p>
                      </div>
                    )}

                    {currentStudent.phone && (
                      <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                        <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">Contact Phone</span>
                        <p className="text-neutral-900 text-sm font-bold font-mono mt-0.5">{currentStudent.phone}</p>
                      </div>
                    )}

                    <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 col-span-1 sm:col-span-2">
                      <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">
                        {language === 'ku' ? 'وشەی تێپەڕبوونا دەرگەهێ قوتابی' : language === 'ar' ? 'كلمة مرور بوابة الطالب' : 'Student Access Password'}
                      </span>
                      <p className="text-neutral-900 text-sm font-bold font-mono mt-0.5">{currentStudent.guardianPassword}</p>
                    </div>
                  </div>

                  {/* Registered Academic Enrollment Bar */}
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-600 gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-neutral-800" />
                      <span>Official Ministry of Education Registered Student &bull; Dasinya Private School</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-800 hover:bg-neutral-100 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{t.printReport}</span>
                      </button>
                    </div>
                  </div>

                </section>
              )}

              {/* ---------------------------------------------------- */}
              {/* SECTION 2: MARKSHEET                                 */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'marksheet' && (
                <div className="space-y-4">
                  {/* Action Toolbar above Report Card */}
                  <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-800 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
                        {isPrimary25 ? t.term1MarkOutOf25 : t.term1MarkOutOf20}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadPdf('printable-marksheet', 'Marksheet')}
                        disabled={isGeneratingPdf}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0087A5] text-white hover:bg-[#00728c] disabled:opacity-50 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                      >
                        {isGeneratingPdf ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>{isGeneratingPdf ? t.generatingPdf : t.downloadPdf}</span>
                      </button>
                      <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-3.5 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>{t.printReport}</span>
                      </button>
                    </div>
                  </div>

                  {/* Printable Marksheet Container */}
                  <section id="printable-marksheet" className="bg-white border border-neutral-300 rounded-2xl p-6 sm:p-10 shadow-xs relative">
                    
                    {/* School Header */}
                    <div className="text-center border-b-2 border-neutral-900 pb-6 mb-7">
                      <div className="inline-flex items-center justify-center gap-4 mb-2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                          <img 
                            src={SCHOOL_LOGO_URL} 
                            alt="Dasinya Private School Logo" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                            {t.schoolName}
                          </h2>
                          <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mt-0.5">
                            {t.departmentName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-600 gap-2">
                        <span className="font-bold tracking-wide uppercase text-white bg-[#0087A5] px-3 py-1 rounded">
                          {t.term1Name} &bull; {formatGradeLabel(currentStudent.grade, language)} ({formatClassLabel(currentStudent.section, language)})
                        </span>
                        <span className="font-bold text-neutral-800">
                          {isPrimary25 ? t.term1MarkOutOf25 : t.term1MarkOutOf20}
                        </span>
                        <span className="font-medium">
                          {t.academicYear}: <strong className="text-neutral-900">{currentStudent.academicYear}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Subject Category Filter (Screen Only) */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <Filter className="w-3.5 h-3.5" />
                        <span className="font-semibold">{t.curriculumFilter}:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {['All', 'Language', 'STEM', 'Technology', 'Humanities', 'Applied', 'Ethics', 'Arts & Sports'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                              selectedCategory === cat 
                                ? 'bg-[#0087A5] text-white font-bold shadow-xs' 
                                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            {getTranslatedCategory(cat, language)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Streamlined Official Marksheet Table */}
                    {/* Strictly NO CODE, NO MAX MARKS, NO TERM WEIGHT, NO GRADE (A+), NO ACADEMIC REMARKS */}
                    <div className="overflow-x-auto border border-neutral-200 rounded-xl mb-7">
                      <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                        <thead>
                          <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-800 text-xs uppercase tracking-wider font-bold">
                            <th className="py-3.5 px-4 w-14 text-center">{t.rowNumber}</th>
                            <th className="py-3.5 px-4">{t.subject}</th>
                            <th className={`py-3.5 px-6 ${isRtl ? 'text-left' : 'text-right'}`}>
                              {isPrimary25 ? t.term1MarkOutOf25 : t.term1MarkOutOf20}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
                          {displayedSubjects.map((sub, index) => {
                            const term1Mark = getSubjectTerm1Mark(sub.obtainedMarks);
                            const translatedName = getTranslatedSubject(sub.subject, language);

                            return (
                              <tr key={index} className="hover:bg-neutral-50/70 transition-colors">
                                <td className="py-3 px-4 text-center font-mono text-xs text-neutral-400 font-semibold">
                                  {index + 1}
                                </td>
                                <td className="py-3 px-4 font-semibold text-neutral-900">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{translatedName}</span>
                                    {language !== 'en' && (
                                      <span className="text-[11px] text-neutral-400 font-normal font-sans">
                                        ({sub.subject.replace(/ \(دەرونزانی\)/, '')})
                                      </span>
                                    )}
                                    {sub.subject.includes('دەرونزانی') && language === 'en' && (
                                      <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-normal font-sans">
                                        Kurdish / Regional
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className={`py-3 px-6 font-bold text-neutral-900 font-mono text-sm sm:text-base ${isRtl ? 'text-left' : 'text-right'}`}>
                                  <span>{term1Mark}</span>
                                  <span className="text-xs text-neutral-400 font-normal font-mono ml-1">/ {maxTermMark}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-900 text-neutral-900 text-xs sm:text-sm">
                            <td className="py-3.5 px-4 text-center text-neutral-500 font-mono text-xs">
                              #
                            </td>
                            <td className="py-3.5 px-4 uppercase tracking-wider font-extrabold text-neutral-900">
                              {t.totalMarks} ({displayedSubjects.length} {t.subject})
                            </td>
                            <td className={`py-3.5 px-6 font-mono text-neutral-950 font-black text-base sm:text-lg ${isRtl ? 'text-left' : 'text-right'}`}>
                              <span>{reportTotals.totalObtained}</span>
                              <span className="text-xs text-neutral-500 font-bold ml-1">/ {reportTotals.totalMax}</span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Official Institutional Footer */}
                    <div className="pt-6 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-neutral-600">
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block mb-1">
                          {t.evaluationPolicyNote}
                        </span>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                          <strong>{formatGradeLabel('Grade 1–3', language)}:</strong> {t.policyG1to3}<br />
                          <strong>{formatGradeLabel('Grade 4–9', language)}:</strong> {t.policyG4to9}<br />
                          {t.passingScoreNote}
                        </p>
                      </div>

                      <div className="flex flex-col items-center sm:items-end justify-end">
                        <div className="w-48 border-b border-neutral-400 mb-1"></div>
                        <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                          {t.principalSignature}
                        </span>
                        <span className="text-[10px] text-neutral-500">{t.schoolOfficeStamp}</span>
                      </div>
                    </div>

                  </section>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SECTION 3: FOOD MENU                                 */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'food_menu' && (
                <div className="space-y-4">
                  {/* Header Action Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-neutral-700" />
                        <span>{t.foodMenuTitle}</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {t.foodMenuSubtitle}
                      </p>
                    </div>
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{t.printReport}</span>
                    </button>
                  </div>

                  {/* Weekly Menu Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                    {WEEKLY_FOOD_MENU.map((item) => {
                      const dayName = language === 'ku' ? item.dayKu : language === 'ar' ? item.dayAr : item.dayEn;
                      const mainDish = language === 'ku' ? item.mainDishKu : language === 'ar' ? item.mainDishAr : item.mainDishEn;
                      const sideDish = language === 'ku' ? item.sideDishKu : language === 'ar' ? item.sideDishAr : item.sideDishEn;
                      const snack = language === 'ku' ? item.snackKu : language === 'ar' ? item.snackAr : item.snackEn;
                      const beverage = language === 'ku' ? item.beverageKu : language === 'ar' ? item.beverageAr : item.beverageEn;

                      return (
                        <div 
                          key={item.dayKey} 
                          className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-[#0087A5] transition-colors"
                        >
                          <div>
                            {/* Day Header */}
                            <div className="pb-2.5 mb-3 border-b border-neutral-100 flex items-center justify-between">
                              <span className="font-extrabold text-sm text-neutral-900">
                                {dayName}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {item.calories}
                              </span>
                            </div>

                            {/* Meal Breakdown */}
                            <div className="space-y-3 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                                  {language === 'ku' ? 'خوارنا سەرەکی' : language === 'ar' ? 'الوجبة الرئيسية' : 'Main Hot Dish'}
                                </span>
                                <p className="text-neutral-900 font-semibold mt-0.5 leading-snug">
                                  {mainDish}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                                  {language === 'ku' ? 'شۆربا و زەڵاتە' : language === 'ar' ? 'الشوربة والسلطة' : 'Side & Salad'}
                                </span>
                                <p className="text-neutral-700 mt-0.5 leading-snug">
                                  {sideDish}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                                  {language === 'ku' ? 'خوارنا سڤک' : language === 'ar' ? 'الوجبة الخفيفة' : 'Healthy Snack'}
                                </span>
                                <p className="text-neutral-700 mt-0.5 leading-snug">
                                  {snack}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                                  {language === 'ku' ? 'ڤەخوارن' : language === 'ar' ? 'المشروب' : 'Beverage'}
                                </span>
                                <p className="text-neutral-700 mt-0.5 leading-snug">
                                  {beverage}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-neutral-100 flex flex-wrap gap-1">
                            {item.tags.map((tg, idx) => (
                              <span key={idx} className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-medium">
                                {tg}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cafeteria Nutrition Standards Banner */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-neutral-800 shrink-0" />
                      <span>
                        {language === 'ku' 
                          ? 'هەمی خوارن ب ستانداردێن ساخلەمی یێن نێڤدەولەتی و ل ژێر چاڤدێریا پسپۆرێن خوارنێ دهێنە بەرهەڤکرن. قوتابخانە ب تەمامی ژ باهیڤ و فستەقان یا پاقژە (Nut-Free).'
                          : language === 'ar'
                          ? 'جميع الوجبات حلال ١٠٠٪ ومجهزة يومياً بإشراف أخصائيي التغذية المدرسية وفق معايير الجودة والسلامة الصحية، ومطعم المدرسة خالٍ تماماً من مسببات الحساسية والمكسرات (Nut-Free).'
                          : 'All meals are 100% Halal certified and freshly prepared daily in our ISO-compliant school kitchen under professional pediatric nutrition supervision. Strictly Nut-Free campus.'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SECTION 4: CLASSES TIMETABLE                         */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'timetable' && (
                <div className="space-y-4">
                  {/* Action & Filter Strip */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-neutral-700" />
                        <span>{t.timetableTitle}</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {formatGradeLabel(currentStudent.grade, language)} &bull; {formatClassLabel(currentStudent.section, language)} &bull; {t.timetableSubtitle}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Day Selector */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                        {['all', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'].map((day) => {
                          const label = day === 'all' 
                            ? (language === 'ku' ? 'هەمی ڕۆژ' : language === 'ar' ? 'كامل الأسبوع' : 'Full Week')
                            : (day === 'sunday' ? t.sundayLabel : day === 'monday' ? t.mondayLabel : day === 'tuesday' ? t.tuesdayLabel : day === 'wednesday' ? t.wednesdayLabel : t.thursdayLabel);
                          return (
                            <button
                              key={day}
                              onClick={() => setSelectedTimetableDay(day)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                selectedTimetableDay === day
                                  ? 'bg-[#0087A5] text-white shadow-xs'
                                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Export & Print */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDownloadPdf('printable-timetable', 'Class_Timetable')}
                          disabled={isGeneratingPdf}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0087A5] text-white rounded-lg text-xs font-semibold hover:bg-[#00728c] cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{t.downloadPdf}</span>
                        </button>
                        <button
                          onClick={handlePrint}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t.printReport}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Printable Timetable Card */}
                  <section id="printable-timetable" className="bg-white border border-neutral-300 rounded-2xl p-5 sm:p-8 shadow-xs">
                    {/* School Header Banner for Print & Display */}
                    <div className="text-center border-b-2 border-neutral-900 pb-5 mb-5">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <img 
                          src={SCHOOL_LOGO_URL} 
                          alt="School Logo" 
                          className="w-12 h-12 object-contain" 
                        />
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950 uppercase">
                            {t.schoolName}
                          </h2>
                          <p className="text-xs font-semibold text-neutral-500">
                            {t.departmentName}
                          </p>
                        </div>
                      </div>
                      <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold text-neutral-800 mt-2">
                        <span>{currentStudent.name}</span>
                        <span>&bull;</span>
                        <span>{formatGradeLabel(currentStudent.grade, language)} ({formatClassLabel(currentStudent.section, language)})</span>
                        <span>&bull;</span>
                        <span>{t.academicYear}: 2025–2026</span>
                      </div>
                    </div>

                    {/* Table Grid */}
                    <div className="overflow-x-auto border border-neutral-200 rounded-xl mb-4">
                      <table className={`w-full text-xs sm:text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                        <thead>
                          <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-800 text-xs uppercase font-bold">
                            <th className="py-3 px-3 w-28">{t.timeLabel}</th>
                            <th className="py-3 px-3 w-20 text-center">{t.periodLabel}</th>
                            {timetableSchedule
                              .filter(d => selectedTimetableDay === 'all' || d.key === selectedTimetableDay)
                              .map(d => (
                                <th key={d.key} className="py-3 px-4 font-bold text-neutral-900">
                                  {d.label}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {TIMETABLE_SLOTS.map((slot, sIdx) => {
                            if (slot.isBreak) {
                              const colSpan = (selectedTimetableDay === 'all' ? 5 : 1) + 2;
                              const breakTitle = slot.breakType === 'morning' ? t.morningBreakLabel : t.lunchBreakLabel;
                              return (
                                <tr key={sIdx} className="bg-amber-50/70 border-y border-amber-200/70 font-bold text-amber-950">
                                  <td className="py-2.5 px-3 font-mono text-[11px] text-amber-800 whitespace-nowrap">{slot.time}</td>
                                  <td colSpan={colSpan - 1} className="py-2.5 px-4 text-center text-xs tracking-wider uppercase text-amber-900 font-bold">
                                    <div className="flex items-center justify-center gap-2">
                                      <Coffee className="w-3.5 h-3.5 text-amber-700" />
                                      <span>&bull; {breakTitle} &bull; ({slot.time})</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            return (
                              <tr key={sIdx} className="hover:bg-neutral-50/70 transition-colors">
                                <td className="py-3 px-3 font-mono text-xs font-semibold text-neutral-500 whitespace-nowrap">
                                  {slot.time}
                                </td>
                                <td className="py-3 px-3 font-bold text-neutral-900 text-center">
                                  {slot.period}
                                </td>
                                {timetableSchedule
                                  .filter(d => selectedTimetableDay === 'all' || d.key === selectedTimetableDay)
                                  .map(d => {
                                    const pData = d.periods.find(p => p.period === slot.period);
                                    const subjName = pData ? getTranslatedSubject(pData.subject, language) : '—';
                                    return (
                                      <td key={d.key} className="py-3 px-4 align-top">
                                        <div className="font-bold text-neutral-900 leading-snug">
                                          {subjName}
                                        </div>
                                        {pData?.teacher && (
                                          <div className="text-[11px] text-neutral-500 font-medium mt-1 flex items-center gap-1">
                                            <User className="w-3 h-3 text-neutral-400 shrink-0" />
                                            <span className="truncate">{pData.teacher}</span>
                                          </div>
                                        )}
                                      </td>
                                    );
                                  })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer Policy and Verification Stamp */}
                    <div className="pt-5 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600">
                      <div className={isRtl ? 'text-right' : 'text-left'}>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block mb-1">
                          {language === 'ku' ? 'تێبینییا خشتەیێ فەرمی' : language === 'ar' ? 'ملاحظة الجدول المعتمد' : 'Official Timetable Note'}
                        </span>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                          {language === 'ku'
                            ? 'هەمی وانە ٤٠ خۆلەکن. دەوام ل دەمژمێر ٠٨:٠٠ سپێدێ دەستپێدکەت و ل دەمژمێر ١٤:٠٠ نیڤرۆ ب دوماهی دهێت دگەل دوو بهێنڤەدانا.'
                            : language === 'ar'
                            ? 'مدة كل حصة دراسية ٤٠ دقيقة. يبدأ الدوام الرسمي في الساعة ٠٨:٠٠ صباحاً وينتهي في الساعة ١٤:٠٠ ظهراً متضمناً فترتي استراحة.'
                            : 'All instructional periods are 40 minutes. Classes begin at 08:00 and conclude at 14:00 (Sunday through Thursday).'}
                        </p>
                      </div>

                      <div className="flex flex-col items-center sm:items-end justify-end">
                        <div className="w-44 border-b border-neutral-400 mb-1.5"></div>
                        <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                          {t.principalSignature}
                        </span>
                        <span className="text-[10px] text-neutral-500">{t.schoolOfficeStamp}</span>
                      </div>
                    </div>

                  </section>
                </div>
              )}

          {/* ---------------------------------------------------- */}
          {/* SECTION 5: BEHAVIOUR REPORT                          */}
          {/* ---------------------------------------------------- */}
          {activePortalTab === 'behaviour' && (
            <div className="space-y-4">
              {/* Action Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-neutral-700" />
                    <span>{t.behaviourTitle}</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {t.behaviourSubtitle}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPdf('printable-behaviour', 'Behaviour_Report')}
                    disabled={isGeneratingPdf}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0087A5] text-white rounded-lg text-xs font-semibold hover:bg-[#00728c] cursor-pointer shadow-xs"
                  >
                    {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{t.downloadPdf}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.printReport}</span>
                  </button>
                </div>
              </div>

              {/* Printable Behaviour Card */}
              <section id="printable-behaviour" className="bg-white border border-neutral-300 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
                
                {/* School Header */}
                <div className="text-center border-b-2 border-neutral-900 pb-5 mb-5">
                  <div className="inline-flex items-center justify-center gap-3 mb-2">
                    <div className="w-14 h-14 flex items-center justify-center shrink-0">
                      <img 
                        src={SCHOOL_LOGO_URL} 
                        alt="Dasinya Private School Logo" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">{t.schoolName}</h2>
                      <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">{t.departmentName}</p>
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 mt-2">
                    {t.behaviourTitle} &bull; {currentStudent.academicYear} ({t.term1Name})
                  </h3>
                </div>

                {/* Overall Standing Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-center">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      {t.conductStandingLabel}
                    </span>
                    <p className="text-lg font-black text-neutral-900 mt-1">
                      {language === 'ku' ? 'سلوکێ نموونەیی (A+)' : language === 'ar' ? 'سلوك مثالي ممتاز (A+)' : 'Exemplary Standing (A+)'}
                    </p>
                    <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                      100 / 100 Score
                    </span>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-center">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      {t.attendanceRateLabel}
                    </span>
                    <p className="text-lg font-black text-neutral-900 mt-1 font-mono">
                      98.2%
                    </p>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      48 Present &bull; 0 Unexcused
                    </span>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-center">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      {t.disciplinaryStandingLabel}
                    </span>
                    <p className="text-lg font-black text-neutral-900 mt-1">
                      {language === 'ku' ? 'چ تێبینی یان سزادان نینە' : language === 'ar' ? 'سجل ناصع وخالٍ من العقوبات' : 'Clean Record'}
                    </p>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      Zero Infractions
                    </span>
                  </div>
                </div>

                {/* Behavioral Competencies Table */}
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className={`w-full text-xs sm:text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                    <thead className="bg-neutral-100 text-neutral-800 uppercase font-bold text-xs border-b border-neutral-200">
                      <tr>
                        <th className="py-3 px-4">Evaluation Criteria</th>
                        <th className="py-3 px-4 w-28 text-center">Rating</th>
                        <th className="py-3 px-4 w-36">Standing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      <tr>
                        <td className="py-3 px-4 font-semibold text-neutral-900">
                          Respect for Teachers, Staff & School Regulations
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-neutral-900">5.0 / 5.0</td>
                        <td className="py-3 px-4 text-neutral-700 font-medium">Exemplary</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-neutral-900">
                          Peer Collaboration, Kindness & Teamwork
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-neutral-900">5.0 / 5.0</td>
                        <td className="py-3 px-4 text-neutral-700 font-medium">Role Model</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-neutral-900">
                          Classroom Engagement, Active Listening & Diligence
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-neutral-900">4.9 / 5.0</td>
                        <td className="py-3 px-4 text-neutral-700 font-medium">Outstanding</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-neutral-900">
                          Punctuality, Morning Lineup & Preparedness
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-neutral-900">5.0 / 5.0</td>
                        <td className="py-3 px-4 text-neutral-700 font-medium">Always On Time</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-neutral-900">
                          Care of School Property, Cleanliness & Uniform
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-neutral-900">5.0 / 5.0</td>
                        <td className="py-3 px-4 text-neutral-700 font-medium">Fully Compliant</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Commendations Box */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider text-neutral-800">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{t.commendationsLabel}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-neutral-700 list-disc list-inside">
                    <li>
                      <strong>Term 1 Model Student Citation:</strong> Recognized for polite engagement, helpfulness toward classmates, and devotion to educational values.
                    </li>
                    <li>
                      <strong>Active Peer Helper Commendation:</strong> Regularly aids fellow students with group tasks and exhibits exemplary sportsmanship.
                    </li>
                  </ul>
                </div>

                {/* Official Signatures */}
                <div className="pt-6 border-t border-neutral-200 grid grid-cols-2 gap-6 text-xs text-neutral-600">
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <div className="w-44 border-b border-neutral-400 mb-1.5"></div>
                    <span className="font-bold text-neutral-800 block">
                      {t.counselorSignLabel}
                    </span>
                    <span className="text-[10px] text-neutral-400">Head of Student Wellbeing & Guidance</span>
                  </div>

                  <div className="flex flex-col items-end justify-end">
                    <div className="w-44 border-b border-neutral-400 mb-1.5"></div>
                    <span className="font-bold text-neutral-800 block">
                      {t.principalSignature}
                    </span>
                    <span className="text-[10px] text-neutral-400">{t.schoolOfficeStamp}</span>
                  </div>
                </div>

              </section>
            </div>
          )}

        </div>
      )}

    </main>
  )}

  {/* VIEW 3: ADMINISTRATIVE / STAFF DIRECTORY (Optional school staff view) */}
  {mode === 'staff' && (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            {t.staffBrowseOption}
          </h2>
          <p className="text-xs text-neutral-500">
            Administrative full school roster (Grades 1 to 9)
          </p>
        </div>
        <button
          onClick={() => setMode('portal')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0087A5] text-white rounded-lg text-xs font-semibold hover:bg-[#00728c] cursor-pointer"
        >
          {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{t.backToGuardianLogin}</span>
        </button>
      </div>

      {/* Step 1-2-3 selection for staff */}
      <section className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Grade */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              {t.stepGrade}
            </label>
            <select
              value={staffGrade}
              onChange={(e) => {
                setStaffGrade(e.target.value);
                const classes = SCHOOL_STRUCTURE[e.target.value] || ['Class A'];
                setStaffClass(classes[0]);
                setStaffStudentId('');
              }}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-semibold text-neutral-900 cursor-pointer"
            >
              {officialGrades.map(g => (
                <option key={g} value={g}>{formatGradeLabel(g, language)}</option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              {t.stepClass}
            </label>
            <select
              value={staffClass}
              onChange={(e) => {
                setStaffClass(e.target.value);
                setStaffStudentId('');
              }}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-semibold text-neutral-900 cursor-pointer"
            >
              {staffClasses.map(c => (
                <option key={c} value={c}>{formatClassLabel(c, language)}</option>
              ))}
            </select>
          </div>

          {/* Student */}
          <div className="space-y-2 relative" ref={staffStudentDropdownRef}>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
              <span>{t.stepStudent}</span>
              <span className="text-[10px] text-neutral-400 font-normal">
                {staffAvailableStudents.length} students
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={staffSearchQuery}
                onFocus={() => setIsStaffStudentDropdownOpen(true)}
                onChange={(e) => {
                  setStaffSearchQuery(e.target.value);
                  setIsStaffStudentDropdownOpen(true);
                }}
                placeholder={activeStaffStudent ? activeStaffStudent.name : t.selectStudentPlaceholder}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-xs font-semibold text-neutral-900 cursor-pointer"
              />
              {isStaffStudentDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto">
                  {staffFilteredStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => {
                        setStaffStudentId(student.id);
                        setIsStaffStudentDropdownOpen(false);
                        setStaffSearchQuery('');
                      }}
                      className="w-full px-3 py-2 text-xs hover:bg-neutral-50 text-left flex items-center justify-between border-b border-neutral-50 cursor-pointer"
                    >
                      <span className="font-bold text-neutral-900">{student.name}</span>
                      <span className="font-mono text-[10px] text-neutral-400">{student.rollNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Marksheet in Staff View */}
      {activeStaffStudent ? (
        <section id="printable-marksheet" className="bg-white border border-neutral-300 rounded-xl p-6 sm:p-10 shadow-xs">
          <div className="text-center border-b-2 border-neutral-900 pb-6 mb-7">
            <h2 className="text-2xl font-extrabold text-neutral-900">{t.schoolName}</h2>
            <p className="text-xs text-neutral-500 font-semibold">{t.departmentName}</p>
            <p className="text-sm font-bold text-neutral-900 mt-2">
              {activeStaffStudent.name} &bull; {formatGradeLabel(activeStaffStudent.grade, language)} ({formatClassLabel(activeStaffStudent.section, language)}) &bull; {activeStaffStudent.rollNumber}
            </p>
          </div>

          {/* Marksheet table */}
          <div className="overflow-x-auto border border-neutral-200 rounded-xl mb-6">
            <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-800 text-xs uppercase font-bold">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">{t.subject}</th>
                  <th className={`py-3 px-6 ${isRtl ? 'text-left' : 'text-right'}`}>
                    {isPrimary25 ? t.term1MarkOutOf25 : t.term1MarkOutOf20}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
                {displayedSubjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="py-3 px-4 text-center font-mono text-neutral-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">{getTranslatedSubject(sub.subject, language)}</td>
                    <td className={`py-3 px-6 font-bold text-neutral-900 font-mono ${isRtl ? 'text-left' : 'text-right'}`}>
                      {getSubjectTerm1Mark(sub.obtainedMarks)} / {maxTermMark}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-900">
                  <td className="py-3 px-4 text-center">#</td>
                  <td className="py-3 px-4">{t.totalMarks}</td>
                  <td className={`py-3 px-6 font-mono font-black ${isRtl ? 'text-left' : 'text-right'}`}>
                    {reportTotals.totalObtained} / {reportTotals.totalMax}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      ) : (
        <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-xl p-8 text-center text-neutral-500 text-xs">
          Select a student to view their marksheet in administrative mode.
        </div>
      )}

    </main>
  )}

  {/* Global Footer */}
  <footer className="w-full border-t border-neutral-100 py-6 px-6 sm:px-10 text-center text-xs text-neutral-400">
    &copy; {new Date().getFullYear()} {t.footerCopyright}
  </footer>
</div>
);
}
