/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  Database,
  RefreshCw,
  Copy,
  Check,
  BookOpen,
  Filter
} from 'lucide-react';
import { supabase, fetchStudentsFromSupabase, checkSupabaseConnection } from './lib/supabase';

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

// Official Dasinya Private School Subjects
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

interface SubjectMark {
  subject: string;
  code: string;
  maxMarks: number;
  obtainedMarks: number;
  grade: string;
  remarks: string;
}

interface StudentRecord {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  section: string;
  gender: string;
  attendance: string;
  classRank: string;
  term: string;
  academicYear: string;
  conduct: string;
  classTeacher: string;
  subjects: SubjectMark[];
}

// Generate marks for any student based on their profile and official subjects
function generateOfficialSubjectsMarks(
  grade: string,
  baseScore: number,
  variance: number[]
): SubjectMark[] {
  const gradeNum = parseInt(grade.replace(/\D/g, ''), 10) || 1;

  // Primary grades (1-3) might focus on fundamental subjects, while grades 4-9 take full advanced curriculum
  const activeList = OFFICIAL_SUBJECTS.filter(s => {
    if (gradeNum <= 3) {
      // Younger grades don't take French or AI or Psychology yet
      if (s.name === 'French' || s.name === 'AI' || s.name === 'Psychology (دەرونزانی)') return false;
    } else if (gradeNum <= 5) {
      // Intermediate grades don't take Psychology yet
      if (s.name === 'Psychology (دەرونزانی)') return false;
    }
    return true;
  });

  const getRemarks = (subName: string, score: number) => {
    if (score >= 95) {
      if (subName.includes('Kurdish')) return 'Superior Kurdish language and reading skills';
      if (subName.includes('Arabic')) return 'Fluent recitation and grammar comprehension';
      if (subName.includes('English')) return 'Exceptional vocabulary and essay structure';
      if (subName.includes('Math')) return 'Outstanding mathematical logic & problem solving';
      if (subName.includes('Science')) return 'Excellent grasp of scientific experiments';
      if (subName.includes('AI')) return 'Impressive understanding of machine learning concepts';
      if (subName.includes('IT')) return 'Superb digital literacy & software acumen';
      if (subName.includes('Psychology')) return 'Deep awareness of behavioral concepts';
      if (subName.includes('KOMALAYETI')) return 'High cultural and community awareness';
      if (subName.includes('KARAMAYI')) return 'Exceptional practical skills & project initiative';
      if (subName.includes('Moral') || subName.includes('Religion')) return 'Exemplary ethics, discipline, and respect';
      if (subName.includes('Conversation')) return 'Confident and polite oral communication';
      return 'Exemplary performance across all benchmarks';
    } else if (score >= 85) {
      return 'Very consistent, thorough, and disciplined work';
    } else if (score >= 70) {
      return 'Good understanding, consistent effort demonstrated';
    }
    return 'Shows dedication, continue focused practice';
  };

  const getGrade = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C+';
    if (score >= 50) return 'C';
    return 'D';
  };

  return activeList.map((sub, idx) => {
    const shift = variance[idx % variance.length] || 0;
    const score = Math.min(100, Math.max(50, baseScore + shift));
    return {
      subject: sub.name,
      code: sub.code,
      maxMarks: 100,
      obtainedMarks: score,
      grade: getGrade(score),
      remarks: getRemarks(sub.name, score),
    };
  });
}

// Initial cohorts across all 9 grades using official Dasinya subjects
const INITIAL_STUDENTS: StudentRecord[] = [
  // Grade 1 - Class A
  {
    id: 'DPS-G1A-01',
    name: 'Leo Benjamin',
    rollNumber: 'DPS-101',
    grade: 'Grade 1',
    section: 'Class A',
    gender: 'Male',
    attendance: '98%',
    classRank: '1st in Class',
    term: 'Second Term Assessment',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Mrs. Emily Robinson',
    subjects: generateOfficialSubjectsMarks('Grade 1', 95, [3, 4, 1, 2, -1, 4, 2, 3, 1, 0, 2])
  },
  {
    id: 'DPS-G1A-02',
    name: 'Amelia Rose',
    rollNumber: 'DPS-102',
    grade: 'Grade 1',
    section: 'Class A',
    gender: 'Female',
    attendance: '96%',
    classRank: '2nd in Class',
    term: 'Second Term Assessment',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Mrs. Emily Robinson',
    subjects: generateOfficialSubjectsMarks('Grade 1', 93, [4, 2, 3, -1, 2, 3, 1, 4, 0, 2])
  },

  // Grade 1 - Class B
  {
    id: 'DPS-G1B-01',
    name: 'Noah Sullivan',
    rollNumber: 'DPS-121',
    grade: 'Grade 1',
    section: 'Class B',
    gender: 'Male',
    attendance: '97%',
    classRank: '1st in Class',
    term: 'Second Term Assessment',
    academicYear: '2025 - 2026',
    conduct: 'Very Good',
    classTeacher: 'Ms. Sarah Jenkins',
    subjects: generateOfficialSubjectsMarks('Grade 1', 92, [2, 3, 1, 4, 0, -2, 3, 2, 1])
  },

  // Grade 1 - Class C
  {
    id: 'DPS-G1C-01',
    name: 'Isabella Vance',
    rollNumber: 'DPS-141',
    grade: 'Grade 1',
    section: 'Class C',
    gender: 'Female',
    attendance: '99%',
    classRank: '1st in Class',
    term: 'Second Term Assessment',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Mrs. Hannah White',
    subjects: generateOfficialSubjectsMarks('Grade 1', 96, [3, 2, 4, 1, 2, 3, 4, 1, 2])
  },

  // Grade 2 - Class A
  {
    id: 'DPS-G2A-01',
    name: 'Mason Miller',
    rollNumber: 'DPS-201',
    grade: 'Grade 2',
    section: 'Class A',
    gender: 'Male',
    attendance: '98%',
    classRank: '1st in Class',
    term: 'Second Term Assessment',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Mr. Patrick Moore',
    subjects: generateOfficialSubjectsMarks('Grade 2', 94, [3, 2, -1, 4, 1, 2, 3, 0, 2])
  },

  // Grade 2 - Class B
  {
    id: 'DPS-G2B-01',
    name: 'Charlotte Davis',
    rollNumber: 'DPS-221',
    grade: 'Grade 2',
    section: 'Class B',
    gender: 'Female',
    attendance: '97%',
    classRank: '1st in Class',
    term: 'Second Term Assessment',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Mrs. Olivia Nelson',
    subjects: generateOfficialSubjectsMarks('Grade 2', 95, [2, 3, 4, 1, 0, 2, 3, 1, 4])
  },

  // Grade 2 - Class C
  {
    id: 'DPS-G2C-01',
    name: 'Daniel Hayes',
    rollNumber: 'DPS-241',
    grade: 'Grade 2',
    section: 'Class C',
    gender: 'Male',
    attendance: '95%',
    classRank: '1st in Class',
    term: 'Second Term Assessment',
    academicYear: '2025 - 2026',
    conduct: 'Very Good',
    classTeacher: 'Ms. Rebecca Scott',
    subjects: generateOfficialSubjectsMarks('Grade 2', 90, [1, 3, 2, -2, 4, 1, 2, 0, 3])
  },

  // Grade 3 - Class A
  {
    id: 'DPS-G3A-01',
    name: 'Benjamin Carter',
    rollNumber: 'DPS-301',
    grade: 'Grade 3',
    section: 'Class A',
    gender: 'Male',
    attendance: '98%',
    classRank: '1st in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Mr. Edward Foster',
    subjects: generateOfficialSubjectsMarks('Grade 3', 95, [3, 2, 4, -1, 2, 4, 1, 3, 0])
  },

  // Grade 3 - Class B
  {
    id: 'DPS-G3B-01',
    name: 'Ava Montgomery',
    rollNumber: 'DPS-321',
    grade: 'Grade 3',
    section: 'Class B',
    gender: 'Female',
    attendance: '99%',
    classRank: '1st in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Mrs. Grace Taylor',
    subjects: generateOfficialSubjectsMarks('Grade 3', 96, [2, 4, 1, 3, 2, 0, 4, 1, 3])
  },

  // Grade 4 - Class A
  {
    id: 'DPS-G4A-01',
    name: 'Lucas Graham',
    rollNumber: 'DPS-401',
    grade: 'Grade 4',
    section: 'Class A',
    gender: 'Male',
    attendance: '97.5%',
    classRank: '1st in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Ms. Rachel Bennett',
    subjects: generateOfficialSubjectsMarks('Grade 4', 93, [3, 1, 4, -2, 3, 2, 4, 1, 2, 0])
  },

  // Grade 4 - Class B
  {
    id: 'DPS-G4B-01',
    name: 'Mia Harrison',
    rollNumber: 'DPS-421',
    grade: 'Grade 4',
    section: 'Class B',
    gender: 'Female',
    attendance: '98%',
    classRank: '1st in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Mr. David Miller',
    subjects: generateOfficialSubjectsMarks('Grade 4', 94, [2, 4, 1, 3, 0, 2, 4, 1, 3, -1])
  },

  // Grade 5 - Class A
  {
    id: 'DPS-G5A-01',
    name: 'William Sterling',
    rollNumber: 'DPS-501',
    grade: 'Grade 5',
    section: 'Class A',
    gender: 'Male',
    attendance: '99%',
    classRank: '1st in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Mrs. Catherine Hayes',
    subjects: generateOfficialSubjectsMarks('Grade 5', 96, [3, 2, 4, 1, 3, 2, 4, 0, 2, 1])
  },

  // Grade 5 - Class B
  {
    id: 'DPS-G5B-01',
    name: 'Harper Wilson',
    rollNumber: 'DPS-521',
    grade: 'Grade 5',
    section: 'Class B',
    gender: 'Female',
    attendance: '96.5%',
    classRank: '1st in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Very Good',
    classTeacher: 'Mr. James Cooper',
    subjects: generateOfficialSubjectsMarks('Grade 5', 93, [1, 4, 2, 3, -1, 4, 2, 0, 3, 2])
  },

  // Grade 6 - Class A
  {
    id: 'DPS-G6A-01',
    name: 'Ethan Foster',
    rollNumber: 'DPS-601',
    grade: 'Grade 6',
    section: 'Class A',
    gender: 'Male',
    attendance: '98%',
    classRank: '1st in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Dr. Arthur Mitchell',
    subjects: generateOfficialSubjectsMarks('Grade 6', 95, [3, 2, 4, 1, -1, 4, 2, 3, 0, 2, 3])
  },
  {
    id: 'DPS-G6A-02',
    name: 'Lily Zhang',
    rollNumber: 'DPS-602',
    grade: 'Grade 6',
    section: 'Class A',
    gender: 'Female',
    attendance: '99%',
    classRank: '2nd in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Dr. Arthur Mitchell',
    subjects: generateOfficialSubjectsMarks('Grade 6', 94, [4, 1, 3, 2, 3, 0, 4, 1, 2, -1, 3])
  },

  // Grade 7 - Class A
  {
    id: 'DPS-G7A-01',
    name: 'Sebastian Ross',
    rollNumber: 'DPS-701',
    grade: 'Grade 7',
    section: 'Class A',
    gender: 'Male',
    attendance: '97.8%',
    classRank: '1st in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Prof. Helen Clark',
    subjects: generateOfficialSubjectsMarks('Grade 7', 95, [3, 4, 1, 2, 4, 0, 3, 1, 2, 4, -1, 2])
  },
  {
    id: 'DPS-G7A-02',
    name: 'Emily Watson',
    rollNumber: 'DPS-702',
    grade: 'Grade 7',
    section: 'Class A',
    gender: 'Female',
    attendance: '98.5%',
    classRank: '2nd in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Prof. Helen Clark',
    subjects: generateOfficialSubjectsMarks('Grade 7', 94, [2, 4, 3, 1, 0, 4, 2, 3, 1, 2, 4, 0])
  },

  // Grade 8 - Class A
  {
    id: 'DPS-G8A-01',
    name: 'Gabriel Martinez',
    rollNumber: 'DPS-801',
    grade: 'Grade 8',
    section: 'Class A',
    gender: 'Male',
    attendance: '99%',
    classRank: '1st in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Mr. Jonathan Price',
    subjects: generateOfficialSubjectsMarks('Grade 8', 96, [3, 2, 4, 1, 3, 2, 4, 0, 3, 1, 2, 4])
  },
  {
    id: 'DPS-G8A-02',
    name: 'Hannah Abbott',
    rollNumber: 'DPS-802',
    grade: 'Grade 8',
    section: 'Class A',
    gender: 'Female',
    attendance: '97%',
    classRank: '2nd in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Mr. Jonathan Price',
    subjects: generateOfficialSubjectsMarks('Grade 8', 93, [2, 4, 1, 3, -1, 4, 2, 0, 3, 2, 4, 1])
  },

  // Grade 9 - Class A
  {
    id: 'DPS-G9A-01',
    name: 'Alexander Wright',
    rollNumber: 'DPS-901',
    grade: 'Grade 9',
    section: 'Class A',
    gender: 'Male',
    attendance: '98.5%',
    classRank: '1st in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Ms. Clara Thorne',
    subjects: generateOfficialSubjectsMarks('Grade 9', 96, [3, 2, 4, 1, 3, 2, 4, 0, 2, 1, 3, 4, 2])
  },
  {
    id: 'DPS-G9A-02',
    name: 'Maya Al-Hassan',
    rollNumber: 'DPS-902',
    grade: 'Grade 9',
    section: 'Class A',
    gender: 'Female',
    attendance: '99%',
    classRank: '2nd in Class',
    term: 'Second Term Examination',
    academicYear: '2025 - 2026',
    conduct: 'Exemplary',
    classTeacher: 'Ms. Clara Thorne',
    subjects: generateOfficialSubjectsMarks('Grade 9', 95, [4, 3, 2, 4, 1, 3, 2, 4, 0, 3, 1, 2, 4])
  }
];

export default function App() {
  const [view, setView] = useState<'home' | 'marksheets'>('home');
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Official school grades (Grade 1 through Grade 9)
  const officialGrades = useMemo(() => Object.keys(SCHOOL_STRUCTURE), []);

  // Selected Grade state (defaults to Grade 1)
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 1');

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
  const [selectedStudentId, setSelectedStudentId] = useState<string>('DPS-G1A-01');

  // Active student record
  const activeStudent = useMemo(() => {
    const found = students.find(s => s.id === selectedStudentId);
    if (found && found.grade === selectedGrade && found.section === selectedClass) {
      return found;
    }
    return availableStudents[0] || null;
  }, [selectedStudentId, selectedGrade, selectedClass, availableStudents, students]);

  // Filtered subjects if category filter is selected
  const displayedSubjects = useMemo(() => {
    if (!activeStudent) return [];
    if (selectedCategory === 'All') return activeStudent.subjects;
    
    return activeStudent.subjects.filter(sub => {
      const match = OFFICIAL_SUBJECTS.find(o => o.name === sub.subject);
      return match ? match.category === selectedCategory : true;
    });
  }, [activeStudent, selectedCategory]);

  // Handle grade change and auto-set available class & student
  const handleGradeChange = (newGrade: string) => {
    setSelectedGrade(newGrade);
    const classes = SCHOOL_STRUCTURE[newGrade] || ['Class A'];
    const nextClass = classes.includes(selectedClass) ? selectedClass : classes[0];
    setSelectedClass(nextClass);

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
    const matching = students.filter(
      s => s.grade === selectedGrade && s.section === newClass
    );
    if (matching.length > 0) {
      setSelectedStudentId(matching[0].id);
    }
  };

  // Calculate totals and percentage across all student subjects
  const reportTotals = useMemo(() => {
    if (!activeStudent || !activeStudent.subjects.length) {
      return { totalMax: 0, totalObtained: 0, percentage: '0.0', status: 'N/A' };
    }
    const totalMax = activeStudent.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
    const totalObtained = activeStudent.subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0.0';
    let status = 'Pass';
    const num = parseFloat(percentage);
    if (num >= 90) status = 'Pass with High Distinction';
    else if (num >= 80) status = 'Pass with Distinction';
    else if (num >= 50) status = 'Passed';
    else status = 'Needs Improvement';

    return { totalMax, totalObtained, percentage, status };
  }, [activeStudent]);

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
            <p className="text-[11px] text-neutral-400">Grades 1 – 9 &bull; Official Marksheets Portal</p>
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

          {/* Marksheet Button */}
          <button
            onClick={() => setView('marksheets')}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99] transition-all rounded text-sm font-medium shadow-xs cursor-pointer group"
          >
            <FileSpreadsheet className="w-4 h-4 text-neutral-300 group-hover:text-white transition-colors" />
            <span>Marksheet</span>
          </button>
        </main>
      )}

      {/* VIEW 2: MARKSHEETS PORTAL (USER SELECTS GRADE, CLASS, AND STUDENT) */}
      {view === 'marksheets' && (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView('home')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to School Home</span>
            </button>
            <span className="text-xs text-neutral-400 font-mono">Academic Session 2025-2026</span>
          </div>

          {/* School Structure Selection Card */}
          <section className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
            <div className="mb-5 pb-4 border-b border-neutral-100">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-neutral-800" />
                Select Grade, Class, and Student
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Choose Grade (1–9), Section (A, B, C), and Student to display their official report card.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
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
                    className="w-full appearance-none bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer shadow-xs"
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
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
                  {officialGrades.map(grade => (
                    <button
                      key={grade}
                      onClick={() => handleGradeChange(grade)}
                      className={`text-[11px] py-1 px-1.5 rounded border transition-colors cursor-pointer text-center font-medium ${
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
                    className="w-full appearance-none bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer shadow-xs"
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
                <div className="flex gap-1.5 pt-1">
                  {availableClasses.map(cls => (
                    <button
                      key={cls}
                      onClick={() => handleClassChange(cls)}
                      className={`flex-1 text-xs py-1 px-2 rounded border transition-colors cursor-pointer text-center font-medium ${
                        selectedClass === cls
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-400">
                  {selectedGrade} sections: {availableClasses.join(' & ')}
                </p>
              </div>

              {/* 3. SELECT STUDENT */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Select Student</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {availableStudents.length} student{availableStudents.length === 1 ? '' : 's'}
                  </span>
                </label>

                <div className="relative">
                  <select
                    value={activeStudent ? activeStudent.id : ''}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full appearance-none bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white cursor-pointer shadow-xs"
                  >
                    {availableStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.rollNumber})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>

                {/* Student Quick Switcher */}
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {availableStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        activeStudent?.id === student.id
                          ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {student.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
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
                    Official Student Evaluation &bull; {activeStudent.grade} ({activeStudent.section})
                  </span>
                  <span className="font-medium">
                    Academic Year: <strong className="text-neutral-900">{activeStudent.academicYear}</strong>
                  </span>
                  <span className="font-medium">
                    Term: <strong className="text-neutral-900">{activeStudent.term}</strong>
                  </span>
                </div>
              </div>

              {/* Student Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-50 p-4 sm:p-5 rounded-lg border border-neutral-200 text-xs mb-6">
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-medium">Student Name</span>
                  <p className="text-neutral-900 text-sm font-bold mt-0.5">{activeStudent.name}</p>
                  <span className="text-[11px] text-neutral-500">{activeStudent.gender}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-medium">Roll / Student ID</span>
                  <p className="text-neutral-900 text-sm font-bold font-mono mt-0.5">{activeStudent.rollNumber}</p>
                  <span className="text-[11px] text-neutral-500">{activeStudent.id}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-medium">Grade & Class</span>
                  <p className="text-neutral-900 text-sm font-bold mt-0.5">{activeStudent.grade} - {activeStudent.section}</p>
                  <span className="text-[11px] text-neutral-500">Teacher: {activeStudent.classTeacher}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px] font-medium">Attendance & Standing</span>
                  <p className="text-neutral-900 text-sm font-bold mt-0.5">{activeStudent.attendance}</p>
                  <span className="text-[11px] font-semibold text-neutral-700">{activeStudent.classRank}</span>
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

              {/* Official Subjects Table */}
              <div className="overflow-x-auto border border-neutral-200 rounded-lg mb-8">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-800 text-xs uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-3">Subject Code</th>
                      <th className="py-3 px-3 text-right">Max Marks</th>
                      <th className="py-3 px-3 text-right">Marks Obtained</th>
                      <th className="py-3 px-4 text-center">Letter Grade</th>
                      <th className="py-3 px-4">Academic Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
                    {displayedSubjects.map((sub, index) => (
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
                        <td className="py-2.5 px-4 text-center">
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
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-900 text-neutral-900 text-xs sm:text-sm">
                      <td className="py-3.5 px-4 uppercase tracking-wider">
                        Cumulative Total ({activeStudent.subjects.length} Subjects)
                      </td>
                      <td className="py-3.5 px-3"></td>
                      <td className="py-3.5 px-3 text-right">{reportTotals.totalMax}</td>
                      <td className="py-3.5 px-3 text-right text-neutral-950 font-extrabold text-base">{reportTotals.totalObtained}</td>
                      <td className="py-3.5 px-4 text-center text-sm font-extrabold text-neutral-950">
                        {reportTotals.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-neutral-700">
                        Result: <span className="font-bold text-neutral-900">{reportTotals.status}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
                    <span className="text-sm font-bold text-neutral-900">{reportTotals.percentage}% (GPA 4.0 Scale)</span>
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
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">Grading Key</span>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    A+ (95-100%) &bull; A (90-94%) &bull; B+ (80-89%)<br />
                    B (70-79%) &bull; C+ (60-69%) &bull; C (50-59%) &bull; Passing: 50%
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
        &copy; {new Date().getFullYear()} Dasinya Private School &bull; Grades 1 to 9 Academic Evaluation System
      </footer>
    </div>
  );
}
