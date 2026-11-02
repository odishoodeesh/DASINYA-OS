/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Award, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
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
  SlidersHorizontal
} from 'lucide-react';
import { IMPORTED_STUDENTS, StudentRecord, SubjectMark } from './data/importedStudents';

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
  const [students] = useState<StudentRecord[]>(IMPORTED_STUDENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

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

  // Available Terms based on Grade weighting rule
  const availableTerms = useMemo(() => {
    if (isPrimary25) {
      return [
        { id: 'Term 1', label: 'Term 1 Examination', weight: '25%' },
        { id: 'Term 2', label: 'Term 2 Examination', weight: '25%' },
        { id: 'Term 3', label: 'Term 3 Examination', weight: '25%' },
        { id: 'Term 4', label: 'Term 4 Final Examination', weight: '25%' },
      ];
    } else {
      return [
        { id: 'Term 1', label: 'Term 1 Examination', weight: '20%' },
        { id: 'Term 2', label: 'Term 2 Examination', weight: '20%' },
        { id: 'Term 3', label: 'Term 3 Examination', weight: '20%' },
        { id: 'Term 4', label: 'Term 4 Examination', weight: '20%' },
        { id: 'Term 5', label: 'Term 5 Final Examination', weight: '20%' },
      ];
    }
  }, [isPrimary25]);

  // Selected Term state
  const [selectedTermId, setSelectedTermId] = useState<string>('Term 2');

  const selectedTermObj = useMemo(() => {
    return availableTerms.find(t => t.id === selectedTermId) || availableTerms[1] || availableTerms[0];
  }, [availableTerms, selectedTermId]);

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
      s.id.toLowerCase().includes(term) ||
      (s.motherName && s.motherName.toLowerCase().includes(term))
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

  // Global search across all 301 students
  const filteredGlobalSearchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const query = globalSearchQuery.toLowerCase().trim();
    return students.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.rollNumber.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query) ||
      (s.motherName && s.motherName.toLowerCase().includes(query))
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

  // Close dropdown on outside click
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

  // Calculate totals and percentage across all student subjects
  const reportTotals = useMemo(() => {
    if (!activeStudent || !activeStudent.subjects.length) {
      return { 
        totalMax: 0, 
        totalObtained: 0, 
        percentage: '0.0', 
        weightedTotal: '0.0',
        maxWeighted: '0.0',
        status: 'N/A' 
      };
    }
    const totalMax = activeStudent.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
    const totalObtained = activeStudent.subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0.0';
    
    // Calculate term weighted contribution (out of 25% for G1-3, out of 20% for G4-9)
    const weightedTotal = ((parseFloat(percentage) * termWeightPercentage) / 100).toFixed(2);
    const maxWeighted = termWeightPercentage.toFixed(1);

    let status = 'Pass';
    const num = parseFloat(percentage);
    if (num >= 95) status = 'Pass with High Distinction';
    else if (num >= 85) status = 'Pass with Distinction';
    else if (num >= 50) status = 'Passed';
    else status = 'Needs Improvement';

    return { totalMax, totalObtained, percentage, weightedTotal, maxWeighted, status };
  }, [activeStudent, termWeightPercentage]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-neutral-100">
      {/* Global Header */}
      <header className="w-full border-b border-neutral-100 px-6 py-5 sm:px-10 flex items-center justify-between bg-white sticky top-0 z-30">
        <button
          onClick={() => setView('home')}
          className="text-left group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Dasinya Private School Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-wider uppercase text-neutral-900 group-hover:text-neutral-700 transition-colors">
              Dasinya Private School
            </h1>
            <p className="text-[11px] text-neutral-400">Grades 1 – 9 &bull; Official Marksheets (301 Students)</p>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {view === 'home' ? (
            <button
              onClick={() => setView('marksheets')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors duration-150 rounded text-sm font-medium shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Marksheet</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print Report</span>
              </button>
              <button
                onClick={() => setView('home')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* VIEW 1: PLAIN WHITE HOME WITH MARKSHEET BUTTON */}
      {view === 'home' && (
        <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Dasinya Private School Logo" 
              className="w-full h-full object-contain drop-shadow-xs" 
            />
          </div>

          <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-neutral-900 mb-3">
            Dasinya Private School
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed font-normal">
            Welcome to the official institutional portal. Select Marksheet to access student evaluations and academic records.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setView('marksheets')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99] transition-all rounded text-sm font-medium shadow-xs cursor-pointer group"
            >
              <FileSpreadsheet className="w-4 h-4 text-neutral-300 group-hover:text-white transition-colors" />
              <span>Marksheet</span>
            </button>
          </div>

          <div className="mt-12 pt-6 border-t border-neutral-100 flex items-center gap-6 text-xs text-neutral-400">
            <span>301 Official Students</span>
            <span>&bull;</span>
            <span>Grades 1 to 9</span>
            <span>&bull;</span>
            <span>Term 25% (G1-3) / 20% (G4-9)</span>
          </div>
        </main>
      )}

      {/* VIEW 2: MARKSHEETS PORTAL (USER SELECTS GRADE, CLASS, STUDENT, AND TERM) */}
      {view === 'marksheets' && (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          
          {/* Top Bar with Quick Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={() => setView('home')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to School Home</span>
            </button>

            {/* Global Search across all 301 students */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Global search any of 301 students..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
              />
              {filteredGlobalSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl z-40 max-h-56 overflow-y-auto py-1">
                  {filteredGlobalSearchResults.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectFromSearch(s)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 flex items-center justify-between border-b border-neutral-50 last:border-b-0 cursor-pointer"
                    >
                      <span className="font-semibold text-neutral-900">{s.name}</span>
                      <span className="text-[11px] text-neutral-400">
                        {s.grade} &bull; {s.section} &bull; {s.rollNumber}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* School Structure Selection Card: Grade, Class, Student, and Term */}
          <section className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
            <div className="mb-5 pb-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-neutral-800" />
                  Select Grade, Class, Student, and Examination Term
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  Select Grade, Section, Student, and evaluation Term ({termWeightPercentage}% weight for {selectedGrade}).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                  <Percent className="w-3.5 h-3.5 text-neutral-600" />
                  <span>{termWeightPercentage}% Term Weight</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* 1. SELECT GRADE (Grades 1 to 9) */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Select Grade</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-normal">9 Grades</span>
                </label>
                
                <div className="relative">
                  <select
                    value={selectedGrade}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className="w-full appearance-none bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer shadow-xs"
                  >
                    {officialGrades.map(grade => (
                      <option key={grade} value={grade}>
                        {grade} ({SCHOOL_STRUCTURE[grade].join(', ')})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>

                {/* Grade Quick Select Buttons */}
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {officialGrades.map(grade => (
                    <button
                      key={grade}
                      onClick={() => handleGradeChange(grade)}
                      className={`text-[10px] py-1 px-1 rounded border transition-colors cursor-pointer text-center font-medium ${
                        selectedGrade === grade
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {grade.replace('Grade ', 'G')}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. SELECT CLASS (A, B, C based on selected grade) */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Select Class</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {availableClasses.length} section{availableClasses.length > 1 ? 's' : ''}
                  </span>
                </label>

                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full appearance-none bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer shadow-xs"
                  >
                    {availableClasses.map(cls => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>

                {/* Class Quick Select Pills */}
                <div className="flex gap-1 pt-1">
                  {availableClasses.map(cls => (
                    <button
                      key={cls}
                      onClick={() => handleClassChange(cls)}
                      className={`flex-1 text-[11px] py-1 px-2 rounded border transition-colors cursor-pointer text-center font-medium ${
                        selectedClass === cls
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400">
                  {availableStudents.length} Students in {selectedGrade} ({selectedClass})
                </p>
              </div>

              {/* 3. SELECT STUDENT WITH IN-PLACE NAME SEARCH */}
              <div className="space-y-2.5 relative" ref={studentDropdownRef}>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Select Student</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {filteredClassStudents.length} of {availableStudents.length}
                  </span>
                </label>

                {/* Searchable Input Combobox for Student Name */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
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
                    placeholder={activeStudent ? `${activeStudent.name.slice(0, 16)}...` : 'Search name / roll...'}
                    className="w-full pl-8 pr-12 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 focus:bg-white shadow-xs transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-0.5">
                    {studentSearchTerm && (
                      <button
                        onClick={() => {
                          setStudentSearchTerm('');
                          setIsStudentDropdownOpen(false);
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
                        title="Clear search"
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
                              className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                                isSelected ? 'bg-neutral-900 text-white font-medium' : 'hover:bg-neutral-50 text-neutral-900'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-[11px]">{student.name}</span>
                                {student.motherName && (
                                  <span className={`text-[9px] ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                                    Mother: {student.motherName}
                                  </span>
                                )}
                              </div>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-600'}`}>
                                {student.rollNumber}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-xs text-neutral-500">
                          <p>No student matching "{studentSearchTerm}"</p>
                        </div>
                      )}

                      {/* Suggestions in other classes if matching query */}
                      {crossClassMatches.length > 0 && (
                        <div className="bg-neutral-50 p-2 border-t border-neutral-200">
                          <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider block mb-1">
                            Found in other classes:
                          </span>
                          {crossClassMatches.map(cs => (
                            <button
                              key={cs.id}
                              onClick={() => handleSelectFromSearch(cs)}
                              className="w-full text-left p-1 text-[10px] hover:bg-neutral-200/60 rounded flex items-center justify-between text-neutral-700 cursor-pointer"
                            >
                              <span className="font-medium text-neutral-900">{cs.name}</span>
                              <span className="text-[9px] text-neutral-500 font-semibold bg-white px-1 py-0.5 rounded border border-neutral-200">
                                {cs.grade} - {cs.section}
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

              {/* 4. SELECT TERM (25% for G1-3, 20% for G4-9) */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>Select Term</span>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-800">
                    {termWeightPercentage}% Weight
                  </span>
                </label>

                <div className="relative">
                  <select
                    value={selectedTermId}
                    onChange={(e) => setSelectedTermId(e.target.value)}
                    className="w-full appearance-none bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer shadow-xs"
                  >
                    {availableTerms.map(term => (
                      <option key={term.id} value={term.id}>
                        {term.label} ({term.weight})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>

                {/* Term Quick Select Buttons */}
                <div className="grid grid-cols-2 gap-1 pt-1">
                  {availableTerms.slice(0, 4).map(term => (
                    <button
                      key={term.id}
                      onClick={() => setSelectedTermId(term.id)}
                      className={`text-[10px] py-1 px-1.5 rounded border transition-colors cursor-pointer text-center font-medium ${
                        selectedTermId === term.id
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {term.id} ({term.weight})
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400">
                  {isPrimary25 ? 'Grade 1–3: 25% per term' : 'Grade 4–9: 20% per term'}
                </p>
              </div>

            </div>
          </section>

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
                  <div className="text-left">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider uppercase text-neutral-900">
                      Dasinya Private School
                    </h2>
                    <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
                      Department of Academic Affairs &bull; Official Marksheet
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-600 gap-2">
                  <span className="font-bold tracking-widest uppercase text-neutral-900 bg-neutral-100 px-3 py-1 rounded">
                    {selectedTermObj.label} &bull; {activeStudent.grade} ({activeStudent.section})
                  </span>
                  <span className="font-medium">
                    Term Weight: <strong className="text-neutral-900">{termWeightPercentage}%</strong> ({isPrimary25 ? 'Grades 1–3 System' : 'Grades 4–9 System'})
                  </span>
                  <span className="font-medium">
                    Academic Year: <strong className="text-neutral-900">{activeStudent.academicYear}</strong>
                  </span>
                </div>
              </div>

              {/* Student Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-50 p-4 sm:p-5 rounded-lg border border-neutral-200 text-xs mb-6">
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-medium">Student Full Name</span>
                  <p className="text-neutral-900 text-sm font-bold mt-0.5">{activeStudent.name}</p>
                  {activeStudent.motherName && (
                    <span className="text-[11px] text-neutral-500 block">Mother: {activeStudent.motherName}</span>
                  )}
                  <span className="text-[11px] text-neutral-400">{activeStudent.gender}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-medium">Roll / Registration ID</span>
                  <p className="text-neutral-900 text-sm font-bold font-mono mt-0.5">{activeStudent.rollNumber}</p>
                  <span className="text-[11px] text-neutral-500 block">ID: {activeStudent.id.replace('DPS-', '')}</span>
                  {activeStudent.bloodGroup && (
                    <span className="text-[10px] text-neutral-400">Blood: {activeStudent.bloodGroup}</span>
                  )}
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-medium">Class & Section</span>
                  <p className="text-neutral-900 text-sm font-bold mt-0.5">{activeStudent.grade} - {activeStudent.section}</p>
                  {activeStudent.dob && (
                    <span className="text-[11px] text-neutral-500 block">DOB: {activeStudent.dob}</span>
                  )}
                  <span className="text-[11px] text-neutral-400">Advisor: {activeStudent.classTeacher}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-medium">Attendance & Standing</span>
                  <p className="text-neutral-900 text-sm font-bold mt-0.5">{activeStudent.attendance}</p>
                  <span className="text-[11px] font-semibold text-neutral-700 block">{activeStudent.classRank}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">{activeStudent.conduct} Conduct</span>
                </div>
              </div>

              {/* Subject Category Filter (Screen Only) */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Filter className="w-3.5 h-3.5" />
                  <span className="font-medium">Curriculum Filter:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['All', 'Language', 'STEM', 'Technology', 'Humanities', 'Applied', 'Ethics', 'Arts & Sports'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        selectedCategory === cat 
                          ? 'bg-neutral-900 text-white' 
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Official Subjects Table with Term Weight Points */}
              <div className="overflow-x-auto border border-neutral-200 rounded-lg mb-8">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-800 text-xs uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-3">Subject Code</th>
                      <th className="py-3 px-3 text-right">Max Marks</th>
                      <th className="py-3 px-3 text-right">Marks (100)</th>
                      <th className="py-3 px-3 text-right">
                        Term ({termWeightPercentage}%)
                      </th>
                      <th className="py-3 px-3 text-center">Letter Grade</th>
                      <th className="py-3 px-4">Academic Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
                    {displayedSubjects.map((sub, index) => {
                      const weightedMark = ((sub.obtainedMarks * termWeightPercentage) / 100).toFixed(1);
                      return (
                        <tr key={index} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="py-2.5 px-4 font-semibold text-neutral-900 flex items-center gap-2">
                            <span>{sub.subject}</span>
                            {sub.subject.includes('دەرونزانی') && (
                              <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-normal font-sans">
                                Kurdish / Regional
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-500 font-mono text-xs">{sub.code}</td>
                          <td className="py-2.5 px-3 text-right text-neutral-600">{sub.maxMarks}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-neutral-900">{sub.obtainedMarks}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-neutral-800 font-mono">
                            {weightedMark}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                              sub.grade.startsWith('A') 
                                ? 'bg-neutral-900 text-white' 
                                : 'bg-neutral-200 text-neutral-800'
                            }`}>
                              {sub.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-neutral-600 text-xs">{sub.remarks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-900 text-neutral-900 text-xs sm:text-sm">
                      <td className="py-3.5 px-4 uppercase tracking-wider">
                        Cumulative Total ({activeStudent.subjects.length} Subjects)
                      </td>
                      <td className="py-3.5 px-3"></td>
                      <td className="py-3.5 px-3 text-right">{reportTotals.totalMax}</td>
                      <td className="py-3.5 px-3 text-right text-neutral-950 font-extrabold text-base">
                        {reportTotals.totalObtained}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-neutral-950 font-extrabold">
                        {reportTotals.weightedTotal} / {reportTotals.maxWeighted}
                      </td>
                      <td className="py-3.5 px-3 text-center text-sm font-extrabold text-neutral-950">
                        {reportTotals.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-neutral-700">
                        Status: <span className="font-bold text-neutral-900">{reportTotals.status}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Summary Performance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <div className="border border-neutral-200 p-4 rounded-lg bg-neutral-50/50">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 block mb-1">Class Standing</span>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-neutral-800" />
                    <span className="text-sm font-bold text-neutral-900">{activeStudent.classRank}</span>
                  </div>
                </div>

                <div className="border border-neutral-200 p-4 rounded-lg bg-neutral-50/50">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 block mb-1">Percentage Score</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-neutral-800" />
                    <span className="text-sm font-bold text-neutral-900">{reportTotals.percentage}% (100 Scale)</span>
                  </div>
                </div>

                <div className="border border-neutral-200 p-4 rounded-lg bg-neutral-50/50">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 block mb-1">
                    Term Weight Contribution
                  </span>
                  <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-neutral-800" />
                    <span className="text-sm font-bold text-neutral-900">
                      {reportTotals.weightedTotal} / {reportTotals.maxWeighted}%
                    </span>
                  </div>
                </div>

                <div className="border border-neutral-200 p-4 rounded-lg bg-neutral-50/50">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 block mb-1">Attendance Record</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-neutral-800" />
                    <span className="text-sm font-bold text-neutral-900">{activeStudent.attendance} Presence</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Accreditation Footer */}
              <div className="pt-8 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-neutral-600">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                    Evaluation & Weight Policy
                  </span>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    <strong>Grades 1–3:</strong> 25% weight per term (4 terms = 100%)<br />
                    <strong>Grades 4–9:</strong> 20% weight per term (5 terms = 100%)<br />
                    Passing Mark: 50% &bull; Distinction: 85%+
                  </p>
                </div>

                <div className="flex flex-col items-center justify-end">
                  <div className="w-40 border-b border-neutral-400 mb-1"></div>
                  <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">Class Teacher Signature</span>
                  <span className="text-[10px] text-neutral-500">{activeStudent.classTeacher}</span>
                </div>

                <div className="flex flex-col items-center sm:items-end justify-end">
                  <div className="w-40 border-b border-neutral-400 mb-1"></div>
                  <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">Principal's Seal & Signature</span>
                  <span className="text-[10px] text-neutral-500">Dasinya Private School Office</span>
                </div>
              </div>
            </section>
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-300 rounded-xl">
              <p className="text-sm text-neutral-500">No student found for {selectedGrade} - {selectedClass}.</p>
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-neutral-100 py-6 px-6 sm:px-10 text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} Dasinya Private School &bull; Grades 1 to 9 Academic Evaluation System (301 Students)
      </footer>
    </div>
  );
}
