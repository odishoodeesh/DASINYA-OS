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
  Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IMPORTED_STUDENTS, StudentRecord, SubjectMark } from './data/importedStudents';
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

// Quick demo test accounts for easy evaluation
const DEMO_ACCOUNTS = [
  {
    label: 'ئارا کاوار (Grade 1-A)',
    email: 'Ila.Shubasi@Dasinya.com',
    password: '123456',
    gradeDesc: 'Grade 1 • 1st in Class',
  },
  {
    label: 'ئاریاس آراز (Grade 1-A)',
    email: 'Baran.Tili@Dasinya.com',
    password: '123457',
    gradeDesc: 'Grade 1 • 2nd in Class',
  },
  {
    label: 'Farid Family (2 Children)',
    email: 'Farid.wahid1@dasinya.com',
    password: '123616',
    gradeDesc: 'Siblings: Grade 3 & 5',
  },
  {
    label: 'Shivan Family (3 Children)',
    email: 'Shivan.Sadiq2@dasinya.com',
    password: '123750',
    gradeDesc: 'Siblings: Grade 1, 4 & 8',
  },
  {
    label: 'وارشاد ھضمن (Grade 9-A)',
    email: 'Livia.Hussein@Dasinya.com',
    password: '123456',
    gradeDesc: 'Grade 9 • Marks / 20',
  },
];

interface AuthenticatedGuardian {
  email: string;
  students: StudentRecord[];
}

export default function App() {
  const [students] = useState<StudentRecord[]>(IMPORTED_STUDENTS);
  const [language, setLanguage] = useState<Language>('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Mode: 'portal' (Guardian Portal) or 'staff' (Administrative Full Roster View)
  const [mode, setMode] = useState<'portal' | 'staff'>('portal');

  // Guardian Authentication State
  const [authGuardian, setAuthGuardian] = useState<AuthenticatedGuardian | null>(null);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active student in guardian's account (when guardian has multiple children)
  const [selectedChildId, setSelectedChildId] = useState<string>('');

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
        const { email, password } = JSON.parse(stored);
        if (email && password) {
          const matched = students.filter(s => 
            s.guardianEmail && 
            s.guardianEmail.trim().toLowerCase() === email.trim().toLowerCase() &&
            s.guardianPassword &&
            s.guardianPassword.trim() === password.trim()
          );
          if (matched.length > 0) {
            setAuthGuardian({
              email: matched[0].guardianEmail || email,
              students: matched
            });
            setSelectedChildId(matched[0].id);
          }
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [students]);

  // Close language menu on outside click
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

  // Handle Guardian Login
  const handleGuardianLogin = (e?: React.FormEvent, customEmail?: string, customPwd?: string) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const emailToVerify = (customEmail !== undefined ? customEmail : loginEmail).trim();
    const pwdToVerify = (customPwd !== undefined ? customPwd : loginPassword).trim();

    if (!emailToVerify || !pwdToVerify) {
      setLoginError(t.invalidCredentialsError);
      setIsLoggingIn(false);
      return;
    }

    // Lookup matching student(s) by guardian email and password
    const matched = students.filter(s => 
      s.guardianEmail && 
      s.guardianEmail.trim().toLowerCase() === emailToVerify.toLowerCase() &&
      s.guardianPassword &&
      s.guardianPassword.trim() === pwdToVerify
    );

    if (matched.length > 0) {
      const session: AuthenticatedGuardian = {
        email: matched[0].guardianEmail || emailToVerify,
        students: matched
      };
      setAuthGuardian(session);
      setSelectedChildId(matched[0].id);
      setLoginError('');
      setSelectedCategory('All');
      try {
        localStorage.setItem('dasinya_guardian_session', JSON.stringify({
          email: emailToVerify,
          password: pwdToVerify
        }));
      } catch {
        // Ignore
      }
    } else {
      setLoginError(t.invalidCredentialsError);
    }
    setIsLoggingIn(false);
  };

  // Handle Guardian Logout
  const handleGuardianLogout = () => {
    setAuthGuardian(null);
    setSelectedChildId('');
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
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
  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-marksheet');
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
      pdf.save(`Dasinya_Marksheet_${gradeClean}_${classClean}_${studentNameClean}.pdf`);
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-neutral-200 hover:border-neutral-900 bg-neutral-50/80 hover:bg-neutral-100 text-neutral-800 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Select Language / هلبژارتنا زمانی / اختيار اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-neutral-600" />
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
                          ? 'bg-neutral-900 text-white font-bold' 
                          : 'hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{langOpt.flag}</span>
                        <div>
                          <span className="block leading-snug">{langOpt.nativeLabel}</span>
                          <span className={`text-[10px] block leading-tight ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
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

      {/* VIEW 1: GUARDIAN PORTAL LOGIN (Shown when no guardian is logged in) */}
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

          {/* GUARDIAN LOGIN CARD */}
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm text-left">
            <div className={`flex items-center gap-3 mb-5 pb-4 border-b border-neutral-100 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
                <Lock className="w-5 h-5 text-neutral-800" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {t.guardianLoginTitle}
                </h3>
                <p className="text-xs text-neutral-500">
                  {t.guardianAccountTitle}
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

            {/* Form */}
            <form onSubmit={handleGuardianLogin} className="space-y-4">
              {/* Guardian Email */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider text-neutral-700 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t.emailAddressLabel}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none text-neutral-400 ${isRtl ? 'right-3' : 'left-3'}`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. Ila.Shubasi@Dasinya.com"
                    className={`w-full py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs sm:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white shadow-2xs transition-colors ${
                      isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider text-neutral-700 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none text-neutral-400 ${isRtl ? 'right-3' : 'left-3'}`}>
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="e.g. 123456"
                    className={`w-full py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs sm:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white shadow-2xs transition-colors ${
                      isRtl ? 'pr-9 pl-10 text-right' : 'pl-9 pr-10 text-left'
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
                className="w-full py-3 px-4 bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99] font-bold text-xs sm:text-sm rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2"
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

            {/* Quick Demo Credentials Helper */}
            <div className="mt-6 pt-5 border-t border-neutral-100">
              <div className="flex items-center gap-1.5 text-neutral-500 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  {t.quickDemoTitle}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mb-2.5">
                {t.quickDemoHint}:
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {DEMO_ACCOUNTS.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLoginEmail(acc.email);
                      setLoginPassword(acc.password);
                      handleGuardianLogin(undefined, acc.email, acc.password);
                    }}
                    className={`w-full text-left p-2 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-all flex items-center justify-between text-xs cursor-pointer ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-neutral-900 block">{acc.label}</span>
                      <span className="font-mono text-[10px] text-neutral-500">{acc.email} &bull; PIN: {acc.password}</span>
                    </div>
                    <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-semibold shrink-0 ml-1">
                      {acc.gradeDesc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Staff Mode Access Link at Bottom */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              onClick={() => setMode('staff')}
              className="text-xs text-neutral-400 hover:text-neutral-700 hover:underline transition-colors cursor-pointer"
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

      {/* VIEW 2: GUARDIAN ACCOUNT (Only shows the student(s) belonging to the logged-in guardian) */}
      {mode === 'portal' && authGuardian && currentStudent && (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
          
          {/* Guardian Account Header Banner */}
          <div className="bg-neutral-900 text-white rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white shrink-0">
                <User className="w-5 h-5 text-neutral-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                    {t.guardianAccountTitle}
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-700">
                    {authGuardian.students.length} {t.registeredChildrenLabel}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold font-mono text-white">
                  {authGuardian.email}
                </h2>
              </div>
            </div>

            {/* Actions: Download PDF, Print, Sign Out */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-neutral-900 hover:bg-neutral-100 disabled:opacity-50 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isGeneratingPdf ? t.generatingPdf : t.downloadPdf}</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.printReport}</span>
              </button>
              <button
                onClick={handleGuardianLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title={t.logoutButtonLabel}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.logoutButtonLabel}</span>
              </button>
            </div>
          </div>

          {/* Child Switcher if multiple children belong to this guardian */}
          {authGuardian.students.length > 1 && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-neutral-500" />
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
                          ? 'bg-neutral-900 text-white shadow-xs' 
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{child.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {formatGradeLabel(child.grade, language)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PRINTABLE MARKSHEET & STUDENT DETAILS CARD */}
          <section id="printable-marksheet" className="bg-white border border-neutral-300 rounded-2xl p-6 sm:p-10 shadow-xs relative">
            
            {/* Official School Header */}
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
                <span className="font-bold tracking-wide uppercase text-neutral-900 bg-neutral-100 px-3 py-1 rounded">
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

            {/* Student Metadata Card (Mother name hidden everywhere) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-50 p-4 sm:p-5 rounded-xl border border-neutral-200 text-xs mb-6">
              <div>
                <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.studentName}</span>
                <p className="text-neutral-900 text-sm font-bold mt-0.5">{currentStudent.name}</p>
                <span className="text-[11px] text-neutral-400">
                  {t.gender}: {currentStudent.gender === 'Female' ? t.female : t.male}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.rollNumber}</span>
                <p className="text-neutral-900 text-sm font-bold font-mono mt-0.5">{currentStudent.rollNumber}</p>
                <span className="text-[11px] text-neutral-500 block">{t.idNumber}: {currentStudent.id.replace('DPS-', '')}</span>
              </div>
              <div>
                <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.classAndSection}</span>
                <p className="text-neutral-900 text-sm font-bold mt-0.5">
                  {formatGradeLabel(currentStudent.grade, language)} - {formatClassLabel(currentStudent.section, language)}
                </p>
                {currentStudent.dob && (
                  <span className="text-[11px] text-neutral-500 block">{t.dob}: {currentStudent.dob}</span>
                )}
              </div>
              <div>
                <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.academicYear}</span>
                <p className="text-neutral-900 text-sm font-bold mt-0.5">{currentStudent.academicYear}</p>
                {currentStudent.bloodGroup && (
                  <span className="text-[11px] text-neutral-500 block">{t.bloodGroup}: {currentStudent.bloodGroup}</span>
                )}
              </div>

              {/* Verified Guardian Details Bar */}
              <div className="col-span-2 sm:col-span-4 pt-3 mt-1 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white/80 p-2.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="text-[11px] font-bold text-neutral-500">{t.guardianEmail}:</span>
                  <span className="font-mono text-neutral-900 font-semibold text-xs select-all">{currentStudent.guardianEmail || authGuardian.email}</span>
                </div>
                {currentStudent.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className="text-[11px] font-bold text-neutral-500">Contact:</span>
                    <span className="font-mono text-neutral-900 font-semibold text-xs select-all">{currentStudent.phone}</span>
                  </div>
                )}
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
                        ? 'bg-neutral-900 text-white font-bold' 
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {getTranslatedCategory(cat, language)}
                  </button>
                ))}
              </div>
            </div>

            {/* Streamlined Official Marksheet Table */}
            {/* CODE, MAX MARKS, TERM WEIGHT, GRADE, and ACADEMIC REMARKS removed */}
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
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
