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
  Percent,
  Globe
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
  getTranslatedRemark, 
  getTranslatedCategory,
  formatClassRank,
  formatConduct
} from './lib/translations';

export const SCHOOL_LOGO_URL = 'https://i.ibb.co/sdrcN4PL/logo-dasinya-2.png';

// Official Dasinya Private School Class Structure
export const SCHOOL_STRUCTURE: Record<string, string[]> = {
  'Grade 1': ['Class A', 'Class B', 'Class C'],
  'Grade 2': ['Class A', 'Class B', 'Class C'],
  'Grade 3': ['Class A', 'Class B'],
  'Grade 4': ['Class A', 'Class B'],
  'Grade 5': ['Class A', 'Class B'],
  'Grade 6': ['Class A'],
  'Grade 7': ['Class A'],
  'Grade 8': ['Class A'],
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

export default function App() {
  const [view, setView] = useState<'home' | 'marksheets'>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [students] = useState<StudentRecord[]>(IMPORTED_STUDENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Translations dictionary for active language
  const t = useMemo(() => TRANSLATIONS[language], [language]);
  const isRtl = language === 'ku' || language === 'ar';

  // Synchronize HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRtl, language]);

  // Close language menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Official school grades (Grade 1 through Grade 9)
  const officialGrades = useMemo(() => Object.keys(SCHOOL_STRUCTURE), []);

  // Selected Grade state (defaults to Grade 1)
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 1');

  // Grade number for weighting calculation: 25% for 1-2-3, 20% for 4-5-6-7-8-9
  const gradeNum = useMemo(() => {
    return parseInt(selectedGrade.replace(/\D/g, ''), 10) || 1;
  }, [selectedGrade]);

  const isPrimary25 = gradeNum <= 3; // Grades 1, 2, 3 have 25% weight per term
  const termWeightPercentage = isPrimary25 ? 25 : 20;

  // Available Terms based on Grade weighting rule - Term 1 only for now
  const availableTerms = useMemo(() => {
    return [
      { 
        id: 'Term 1', 
        label: t.term1Name, 
        weight: `${termWeightPercentage}%` 
      }
    ];
  }, [t.term1Name, termWeightPercentage]);

  // Selected Term state (Term 1 only)
  const [selectedTermId, setSelectedTermId] = useState<string>('Term 1');

  const selectedTermObj = useMemo(() => {
    return availableTerms[0];
  }, [availableTerms]);

  // Available classes for currently selected grade
  const availableClasses = useMemo(() => {
    return SCHOOL_STRUCTURE[selectedGrade] || ['Class A'];
  }, [selectedGrade]);

  // Selected Class state
  const [selectedClass, setSelectedClass] = useState<string>('Class A');

  // Available students in selected Grade and Class
  const availableStudents = useMemo(() => {
    return students.filter(
      s => s.grade === selectedGrade && s.section === selectedClass
    );
  }, [students, selectedGrade, selectedClass]);

  // Selected Student ID
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    IMPORTED_STUDENTS[0]?.id || ''
  );

  // Search input specifically for Step 3: Select Student
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState<boolean>(false);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  // Active student record
  const activeStudent = useMemo(() => {
    const found = students.find(s => s.id === selectedStudentId);
    if (found && found.grade === selectedGrade && found.section === selectedClass) {
      return found;
    }
    return availableStudents[0] || null;
  }, [selectedStudentId, selectedGrade, selectedClass, availableStudents, students]);

  // Filter students within current class by name/roll search in Step 3
  const filteredClassStudents = useMemo(() => {
    if (!studentSearchTerm.trim()) return availableStudents;
    const term = studentSearchTerm.toLowerCase().trim();
    return availableStudents.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.rollNumber.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term)
    );
  }, [availableStudents, studentSearchTerm]);

  // Check if search query in Step 3 matches any student across other grades/classes
  const crossClassMatches = useMemo(() => {
    if (!studentSearchTerm.trim()) return [];
    const term = studentSearchTerm.toLowerCase().trim();
    return students.filter(s => 
      (s.grade !== selectedGrade || s.section !== selectedClass) &&
      (s.name.toLowerCase().includes(term) || s.rollNumber.toLowerCase().includes(term))
    ).slice(0, 3);
  }, [students, selectedGrade, selectedClass, studentSearchTerm]);

  // Global search across students
  const filteredGlobalSearchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const query = globalSearchQuery.toLowerCase().trim();
    return students.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.rollNumber.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [globalSearchQuery, students]);

  // Filtered subjects if category filter is selected
  const displayedSubjects = useMemo(() => {
    if (!activeStudent) return [];
    if (selectedCategory === 'All') return activeStudent.subjects;
    
    return activeStudent.subjects.filter(sub => {
      const match = OFFICIAL_SUBJECTS.find(o => o.name === sub.subject);
      return match ? match.category === selectedCategory : true;
    });
  }, [activeStudent, selectedCategory]);

  // Close student dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle grade change and auto-set available class & student
  const handleGradeChange = (newGrade: string) => {
    setSelectedGrade(newGrade);
    const classes = SCHOOL_STRUCTURE[newGrade] || ['Class A'];
    const nextClass = classes.includes(selectedClass) ? selectedClass : classes[0];
    setSelectedClass(nextClass);
    setStudentSearchTerm('');

    const matching = students.filter(
      s => s.grade === newGrade && s.section === nextClass
    );
    if (matching.length > 0) {
      setSelectedStudentId(matching[0].id);
    }
  };

  // Handle class change and auto-set student
  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    setStudentSearchTerm('');
    const matching = students.filter(
      s => s.grade === selectedGrade && s.section === newClass
    );
    if (matching.length > 0) {
      setSelectedStudentId(matching[0].id);
    }
  };

  // Direct selection from search
  const handleSelectFromSearch = (student: StudentRecord) => {
    setSelectedGrade(student.grade);
    setSelectedClass(student.section);
    setSelectedStudentId(student.id);
    setGlobalSearchQuery('');
    setStudentSearchTerm('');
    setIsStudentDropdownOpen(false);
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Term 1 maximum mark per subject (25 for Grade 1-3, 20 for Grade 4-9)
  const maxTermMark = isPrimary25 ? 25 : 20;

  // Helper to get Term 1 mark for any subject out of 25 or 20
  const getSubjectTerm1Mark = (rawMark: number): number => {
    const scaled = (rawMark / 100) * maxTermMark;
    return Number(scaled.toFixed(1));
  };

  // Calculate totals across displayed student subjects for Term 1
  const reportTotals = useMemo(() => {
    if (!activeStudent || !displayedSubjects.length) {
      return { 
        totalMax: 0, 
        totalObtained: 0, 
        maxTermMark 
      };
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
  }, [activeStudent, displayedSubjects, maxTermMark]);

  // Direct client-side PDF Download using html2canvas and jsPDF
  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-marksheet');
    if (!element || isGeneratingPdf) return;

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

      const studentNameClean = (activeStudent?.name || 'Student').replace(/\s+/g, '_');
      const gradeClean = selectedGrade.replace(/\s+/g, '_');
      const classClean = selectedClass.replace(/\s+/g, '_');
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

  // Current language option
  const activeLangOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`min-h-screen bg-white text-neutral-900 flex flex-col selection:bg-neutral-100 ${
        isRtl ? 'font-cairo' : 'font-sans'
      }`}
    >
      {/* Global Header */}
      <header className="w-full border-b border-neutral-100 px-4 sm:px-8 py-4 flex items-center justify-between bg-white sticky top-0 z-30 shadow-2xs">
        {/* School Crest & Identity */}
        <button
          onClick={() => setView('home')}
          className={`flex items-center gap-3 cursor-pointer group ${isRtl ? 'text-right' : 'text-left'}`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Dasinya Private School Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors leading-tight">
              {t.schoolName}
            </h1>
            <p className="text-[11px] text-neutral-400 font-medium">
              {t.schoolSubtitle}
            </p>
          </div>
        </button>

        {/* Right Action Tools: Language Selector & Marksheet / Print Navigation */}
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

          {/* View Toggle */}
          {view === 'home' ? (
            <button
              onClick={() => setView('marksheets')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99] transition-colors rounded-lg text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t.marksheet}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                title={t.downloadPdf}
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isGeneratingPdf ? t.generatingPdf : t.downloadPdf}
                </span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.printReport}</span>
              </button>
              <button
                onClick={() => setView('home')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{t.back}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* VIEW 1: PLAIN WHITE INSTITUTIONAL HERO WITH MARKSHEET BUTTON */}
      {view === 'home' && (
        <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
          
          {/* Official Crest */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Dasinya Private School Logo" 
              className="w-full h-full object-contain drop-shadow-xs" 
            />
          </div>

          {/* School Titles */}
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-3">
            {t.schoolName}
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 max-w-lg mx-auto mb-8 leading-relaxed font-normal">
            {t.welcomeIntro}
          </p>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setView('marksheets')}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99] transition-all rounded-lg text-sm sm:text-base font-semibold shadow-xs cursor-pointer group"
            >
              <FileSpreadsheet className="w-4 h-4 text-neutral-300 group-hover:text-white transition-colors" />
              <span>{t.marksheet}</span>
            </button>
          </div>

          {/* Language Fast Switcher on Home */}
          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
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

        </main>
      )}

      {/* VIEW 2: MARKSHEETS PORTAL (USER SELECTS GRADE, CLASS, STUDENT, AND TERM) */}
      {view === 'marksheets' && (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          
          {/* Top Bar with Return Link and Global Quick Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={() => setView('home')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t.returnHome}</span>
            </button>

            {/* Global Search across all 301 students */}
            <div className="relative w-full sm:w-80">
              <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-neutral-400 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={t.globalSearchPlaceholder}
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className={`w-full py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors ${
                  isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                }`}
              />
              {filteredGlobalSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl z-40 max-h-56 overflow-y-auto py-1">
                  {filteredGlobalSearchResults.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectFromSearch(s)}
                      className="w-full px-3 py-2 text-xs hover:bg-neutral-50 flex items-center justify-between border-b border-neutral-50 last:border-b-0 cursor-pointer"
                    >
                      <span className="font-semibold text-neutral-900">{s.name}</span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {formatGradeLabel(s.grade, language)} &bull; {formatClassLabel(s.section, language)} &bull; {s.rollNumber}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* School Structure Selection Card: Grade, Class, Student, and Term */}
          <section className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 shadow-xs">
            <div className="mb-5 pb-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-neutral-800" />
                  <span>{t.stepGrade} &rarr; {t.stepClass} &rarr; {t.stepStudent} &rarr; {t.stepTerm}</span>
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  {t.termWeightPolicy} ({formatGradeLabel(selectedGrade, language)}: {maxTermMark} {language === 'ku' ? 'نمرە' : language === 'ar' ? 'درجة' : 'marks'}).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                  <Award className="w-3.5 h-3.5 text-neutral-600" />
                  <span>{maxTermMark} {language === 'ku' ? 'نمرە' : language === 'ar' ? 'درجة' : 'Marks'}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* 1. SELECT GRADE (Grades 1 to 9) */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>{t.stepGrade}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-normal">{t.gradeCountLabel}</span>
                </label>
                
                <div className="relative">
                  <select
                    value={selectedGrade}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className={`w-full appearance-none bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer shadow-xs ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  >
                    {officialGrades.map(grade => (
                      <option key={grade} value={grade}>
                        {formatGradeLabel(grade, language)} ({SCHOOL_STRUCTURE[grade].map(c => formatClassLabel(c, language)).join(', ')})
                      </option>
                    ))}
                  </select>
                  <div className={`pointer-events-none absolute inset-y-0 flex items-center px-3 text-neutral-500 ${isRtl ? 'left-0' : 'right-0'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Grade Quick Select Buttons */}
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {officialGrades.map(grade => {
                    const gradeNumber = grade.replace(/\D/g, '');
                    const labelShort = language === 'en' ? `G${gradeNumber}` : `${gradeNumber}`;
                    return (
                      <button
                        key={grade}
                        onClick={() => handleGradeChange(grade)}
                        className={`text-[11px] py-1 px-1 rounded border transition-colors cursor-pointer text-center font-bold ${
                          selectedGrade === grade
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {labelShort}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. SELECT CLASS (A, B, C based on selected grade) */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>{t.stepClass}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {availableClasses.length} {t.sectionsCountLabel}
                  </span>
                </label>

                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className={`w-full appearance-none bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer shadow-xs ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  >
                    {availableClasses.map(cls => (
                      <option key={cls} value={cls}>
                        {formatClassLabel(cls, language)}
                      </option>
                    ))}
                  </select>
                  <div className={`pointer-events-none absolute inset-y-0 flex items-center px-3 text-neutral-500 ${isRtl ? 'left-0' : 'right-0'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Class Quick Select Pills */}
                <div className="flex gap-1 pt-1">
                  {availableClasses.map(cls => (
                    <button
                      key={cls}
                      onClick={() => handleClassChange(cls)}
                      className={`flex-1 text-[11px] py-1 px-2 rounded border transition-colors cursor-pointer text-center font-bold ${
                        selectedClass === cls
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {formatClassLabel(cls, language)}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400">
                  {availableStudents.length} {t.studentsInClassLabel} {formatGradeLabel(selectedGrade, language)} ({formatClassLabel(selectedClass, language)})
                </p>
              </div>

              {/* 3. SELECT STUDENT WITH IN-PLACE NAME SEARCH */}
              <div className="space-y-2.5 relative" ref={studentDropdownRef}>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>{t.stepStudent}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {filteredClassStudents.length} / {availableStudents.length}
                  </span>
                </label>

                {/* Searchable Input Combobox for Student Name */}
                <div className="relative">
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none text-neutral-400 ${isRtl ? 'right-2.5' : 'left-2.5'}`}>
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onFocus={() => setIsStudentDropdownOpen(true)}
                    onChange={(e) => {
                      setStudentSearchTerm(e.target.value);
                      setIsStudentDropdownOpen(true);
                    }}
                    placeholder={activeStudent ? `${activeStudent.name.slice(0, 18)}...` : t.studentSearchPlaceholder}
                    className={`w-full py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 focus:bg-white shadow-xs transition-colors ${
                      isRtl ? 'pr-8 pl-12 text-right' : 'pl-8 pr-12 text-left'
                    }`}
                  />
                  <div className={`absolute inset-y-0 flex items-center gap-0.5 ${isRtl ? 'left-2' : 'right-2'}`}>
                    {studentSearchTerm && (
                      <button
                        onClick={() => {
                          setStudentSearchTerm('');
                          setIsStudentDropdownOpen(false);
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
                        title="Clear"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                      className="p-1 text-neutral-500 hover:text-neutral-900 rounded cursor-pointer"
                      title="Toggle student list"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isStudentDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Dropdown Menu of Filtered Students */}
                  {isStudentDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-neutral-100 min-w-[220px]">
                      {filteredClassStudents.length > 0 ? (
                        filteredClassStudents.map(student => {
                          const isSelected = activeStudent?.id === student.id;
                          return (
                            <button
                              key={student.id}
                              onClick={() => {
                                setSelectedStudentId(student.id);
                                setIsStudentDropdownOpen(false);
                                setStudentSearchTerm('');
                              }}
                              className={`w-full px-3 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                                isRtl ? 'text-right' : 'text-left'
                              } ${
                                isSelected ? 'bg-neutral-900 text-white font-medium' : 'hover:bg-neutral-50 text-neutral-900'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-[11px]">{student.name}</span>
                              </div>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-600'}`}>
                                {student.rollNumber}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-xs text-neutral-500">
                          <p>{t.searchNoStudent} "{studentSearchTerm}"</p>
                        </div>
                      )}

                      {/* Suggestions in other classes if matching query */}
                      {crossClassMatches.length > 0 && (
                        <div className="bg-neutral-50 p-2 border-t border-neutral-200">
                          <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider block mb-1">
                            {t.foundInOtherClasses}:
                          </span>
                          {crossClassMatches.map(cs => (
                            <button
                              key={cs.id}
                              onClick={() => handleSelectFromSearch(cs)}
                              className="w-full p-1 text-[10px] hover:bg-neutral-200/60 rounded flex items-center justify-between text-neutral-700 cursor-pointer"
                            >
                              <span className="font-medium text-neutral-900">{cs.name}</span>
                              <span className="text-[9px] text-neutral-500 font-semibold bg-white px-1 py-0.5 rounded border border-neutral-200">
                                {formatGradeLabel(cs.grade, language)} - {formatClassLabel(cs.section, language)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Student Pill / Info Summary */}
                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-0.5">
                  <span className="truncate">
                    <strong className="text-neutral-900 font-semibold">{activeStudent?.name}</strong>
                  </span>
                  <span className="font-mono text-neutral-600 shrink-0 ml-1">
                    {activeStudent?.rollNumber}
                  </span>
                </div>
              </div>

              {/* 4. SELECT TERM */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>{t.stepTerm}</span>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-800">
                    {maxTermMark} {language === 'ku' ? 'نمرە' : language === 'ar' ? 'درجة' : 'Marks'}
                  </span>
                </label>

                <div className="relative">
                  <select
                    value={selectedTermId}
                    onChange={(e) => setSelectedTermId(e.target.value)}
                    className={`w-full appearance-none bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer shadow-xs ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  >
                    <option value="Term 1">
                      {t.term1Name} ({isPrimary25 ? t.term1MarkOutOf25 : t.term1MarkOutOf20})
                    </option>
                  </select>
                  <div className={`pointer-events-none absolute inset-y-0 flex items-center px-3 text-neutral-500 ${isRtl ? 'left-0' : 'right-0'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Term 1 Active Option Button */}
                <div className="pt-1">
                  <button
                    onClick={() => setSelectedTermId('Term 1')}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-neutral-900 bg-neutral-900 text-white font-medium flex items-center justify-between shadow-2xs cursor-pointer"
                  >
                    <span className="font-bold">{t.term1Name}</span>
                    <span className="bg-neutral-800 text-neutral-200 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                      {isPrimary25 ? '/ 25' : '/ 20'}
                    </span>
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400">
                  {isPrimary25 
                    ? (language === 'ku' ? 'قۆناغێن ١ هەتا ٣: نمرەیێن وەرزێ ئێکێ ژ ٢٥ نمرانە' : language === 'ar' ? 'الصفوف ١ إلى ٣: درجات الفصل الأول من ٢٥ درجة' : 'Grades 1–3: Term 1 marks are out of 25')
                    : (language === 'ku' ? 'قۆناغێن ٤ هەتا ٩: نمرەیێن وەرزێ ئێکێ ژ ٢٠ نمرانە' : language === 'ar' ? 'الصفوف ٤ إلى ٩: درجات الفصل الأول من ٢٠ درجة' : 'Grades 4–9: Term 1 marks are out of 20')}
                </p>
              </div>

            </div>
          </section>

          {/* Action Toolbar above Report Card */}
          {activeStudent && (
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-800 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
                  {isPrimary25 ? t.term1MarkOutOf25 : t.term1MarkOutOf20}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
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
          )}

          {/* REPORT CARD DISPLAY */}
          {activeStudent ? (
            <section id="printable-marksheet" className="bg-white border border-neutral-300 rounded-xl p-6 sm:p-10 shadow-xs relative">
              {/* Report Card Header */}
              <div className="text-center border-b-2 border-neutral-900 pb-6 mb-8">
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
                    {t.term1Name} &bull; {formatGradeLabel(activeStudent.grade, language)} ({formatClassLabel(activeStudent.section, language)})
                  </span>
                  <span className="font-bold text-neutral-800">
                    {isPrimary25 ? t.term1MarkOutOf25 : t.term1MarkOutOf20}
                  </span>
                  <span className="font-medium">
                    {t.academicYear}: <strong className="text-neutral-900">{activeStudent.academicYear}</strong>
                  </span>
                </div>
              </div>

              {/* Student Metadata Bar (Mother Name & Attendance & Standing removed) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-50 p-4 sm:p-5 rounded-lg border border-neutral-200 text-xs mb-6">
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.studentName}</span>
                  <p className="text-neutral-900 text-sm font-bold mt-0.5">{activeStudent.name}</p>
                  <span className="text-[11px] text-neutral-400">
                    {t.gender}: {activeStudent.gender === 'Female' ? t.female : t.male}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.rollNumber}</span>
                  <p className="text-neutral-900 text-sm font-bold font-mono mt-0.5">{activeStudent.rollNumber}</p>
                  <span className="text-[11px] text-neutral-500 block">{t.idNumber}: {activeStudent.id.replace('DPS-', '')}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.classAndSection}</span>
                  <p className="text-neutral-900 text-sm font-bold mt-0.5">
                    {formatGradeLabel(activeStudent.grade, language)} - {formatClassLabel(activeStudent.section, language)}
                  </p>
                  {activeStudent.dob && (
                    <span className="text-[11px] text-neutral-500 block">{t.dob}: {activeStudent.dob}</span>
                  )}
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-bold">{t.academicYear}</span>
                  <p className="text-neutral-900 text-sm font-bold mt-0.5">{activeStudent.academicYear}</p>
                  {activeStudent.bloodGroup && (
                    <span className="text-[11px] text-neutral-500 block">{t.bloodGroup}: {activeStudent.bloodGroup}</span>
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
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
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
              {/* CODE, MAX MARKS, TERM WEIGHT, GRADE, and REMARKS removed */}
              <div className="overflow-x-auto border border-neutral-200 rounded-lg mb-8">
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

              {/* Signatures & Accreditation Footer */}
              <div className="pt-8 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-neutral-600">
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
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-300 rounded-xl">
              <p className="text-sm text-neutral-500">
                {t.searchNoStudent} {formatGradeLabel(selectedGrade, language)} - {formatClassLabel(selectedClass, language)}.
              </p>
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-neutral-100 py-6 px-6 sm:px-10 text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} {t.footerCopyright}
      </footer>
    </div>
  );
}
