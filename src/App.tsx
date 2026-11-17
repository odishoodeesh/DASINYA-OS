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
  ExternalLink,
  Save,
  Bus,
  Radio,
  MapPin,
  Navigation,
  ClipboardList
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  BEHAVIOUR_REPORTS_TABLE,
  DAILY_RECORDS_TABLE,
  SupabaseBehaviourReportRow,
  SupabaseDailyRecordRow,
  fetchBehaviourReportsFromSupabase,
  fetchDailyRecordsFromSupabase,
  fetchStudentsFromSupabase,
  seedStudentsToSupabase,
  supabase,
  updateStudentClassInSupabase,
  upsertAllDailyRecordsToSupabase,
  upsertBehaviourReportToSupabase,
  upsertDailyRecordToSupabase,
} from './lib/supabase';
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
  OFFICIAL_SEMESTER_ONE_SECOND_EXAMS,
  ExamGradeKey,
  ExamScheduleRow,
} from './data/examsSchedule';
import {
  TeacherClassAssignment,
  ClassMentorAssignment,
  authenticateTeacher,
  getMentorAssignmentForTeacher,
  isTeacherMentorOfClass,
  DailySubjectRecord,
  loadStoredDailyRecords,
  saveStoredDailyRecords,
  makeDailyRecordKey,
  getEffectiveDailyRecord,
  isGrade13,
} from './data/teacherPortal';
import {
  BUS_DRIVER_ROUTES,
  BusDriverRoute,
  DEFAULT_SUPABASE_BUS_ID,
  SCHOOL_LOCATION,
  authenticateDriver,
  findBusForStudent,
} from './data/busRoutes';
import { useBusTracking } from './hooks/useBusTracking';
import {
  Grade13DailyRecordTable,
  Grade49DailyRecordTable,
  DailyRecordRowItem,
} from './components/DailyRecordTables';
import { AdminSummaryPanel } from './components/AdminSummaryPanel';
import { DriverPortal } from './components/DriverPortal';
import { DriverRouteTrackerPage } from './components/DriverRouteTrackerPage';
import { LiveBusMap } from './components/LiveBusMap';
import { ExamsScheduleView } from './components/ExamsScheduleView';
import { FoodMenuView } from './components/FoodMenuView';
import { BehaviourReportCard } from './components/BehaviourReportCard';
import { exportBehaviourReportPdf, printBehaviourReport } from './lib/behaviourPdf';
import {
  BEHAVIOUR_MONTHS,
  MonthlyBehaviourReport,
  createEmptyBehaviourReport,
  getDefaultBehaviourMonthKey,
  loadStoredBehaviourReports,
  makeBehaviourReportKey,
  saveStoredBehaviourReports,
} from './data/behaviourReport';
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

export type PortalRole = 'admin' | 'staff' | 'teacher' | 'parent' | 'student' | 'driver';

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

export type PortalTab = 'info' | 'marksheet' | 'food_menu' | 'timetable' | 'behaviour' | 'calendar' | 'bus_tracking' | 'exams_schedule' | null;

interface AuthenticatedGuardian {
  password: string;
  email?: string;
  students: StudentRecord[];
}

interface AuthenticatedStaff {
  role: 'admin' | 'staff' | 'teacher';
  username: string;
  name: string;
  email?: string;
  subjectLabel?: string;
  assignedClasses?: TeacherClassAssignment[];
  assignedGrade?: string;
  assignedSection?: string;
  mentorClass?: ClassMentorAssignment | null;
}

// Cafeteria 4-week menu is defined in ./data/foodMenu.ts and rendered via FoodMenuView

// Timetable period time slots (Official 7 periods + 2 breaks from aSc Timetables)
export const TIMETABLE_SLOTS = OFFICIAL_TIMETABLE_PERIODS;

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('dasinya_students_roster_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return IMPORTED_STUDENTS;
  });

  const handleUpdateStudentClass = (studentId: string, newGrade: string, newSection: string) => {
    setStudents((prev) => {
      const next = prev.map((s) => s.id === studentId ? { ...s, grade: newGrade, section: newSection } : s);
      try {
        localStorage.setItem('dasinya_students_roster_v3', JSON.stringify(next));
      } catch {}
      updateStudentClassInSupabase(studentId, newGrade, newSection).then((res) => {
        if (!res.ok) {
          seedStudentsToSupabase(next).catch(() => {});
        }
      }).catch(() => {});
      return next;
    });
  };

  // Official Exams Schedule (with optional Admin edits saved to localStorage)
  const [examRows, setExamRows] = useState<ExamScheduleRow[]>(() => {
    try {
      const saved = localStorage.getItem('dasinya_exam_schedule_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return OFFICIAL_SEMESTER_ONE_SECOND_EXAMS;
  });

  const handleUpdateExamCell = (rowId: string, grade: ExamGradeKey, value: string) => {
    setExamRows((prev) => {
      const next = prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              subjectsByGrade: {
                ...row.subjectsByGrade,
                [grade]: value,
              },
            }
          : row
      );
      try {
        localStorage.setItem('dasinya_exam_schedule_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleResetExamSchedule = () => {
    setExamRows(OFFICIAL_SEMESTER_ONE_SECOND_EXAMS);
    try {
      localStorage.removeItem('dasinya_exam_schedule_v2');
    } catch {}
  };

  const [language, setLanguage] = useState<Language>('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Dedicated to Parents Portal, Teacher Portal & Admin Portal
  const [selectedPortal, setSelectedPortal] = useState<PortalRole>('parent');

  // Authentication State for Parent (Password Only), Teacher (Email + Phone), Driver (Bus Code + PIN) & Admin
  const [authGuardian, setAuthGuardian] = useState<AuthenticatedGuardian | null>(null);
  const [authStaff, setAuthStaff] = useState<AuthenticatedStaff | null>(null);
  const [authDriver, setAuthDriver] = useState<BusDriverRoute | null>(null);
  const {
    buses: liveBuses,
    connected: wsConnected,
    startTrip,
    stopTrip,
    sendLocation,
    updateStudentStatus,
    resetStatuses,
  } = useBusTracking();
  const isPortalAuthenticated =
    (selectedPortal === 'parent' && Boolean(authGuardian)) ||
    (selectedPortal === 'teacher' && Boolean(authStaff && authStaff.role === 'teacher')) ||
    (selectedPortal === 'driver' && Boolean(authDriver)) ||
    (selectedPortal === 'admin' && Boolean(authStaff && authStaff.role === 'admin'));

  // Persistent Teacher-entered Daily Student Records (Supabase DB + localStorage cache)
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailySubjectRecord>>(() =>
    loadStoredDailyRecords()
  );
  const dailyRecordsRef = useRef<Record<string, DailySubjectRecord>>(dailyRecords);
  dailyRecordsRef.current = dailyRecords;
  const pendingMarkTimersRef = useRef<Record<string, number>>({});
  const [teacherSubject, setTeacherSubject] = useState<string>('Kurdish');
  const [teacherSavedNotice, setTeacherSavedNotice] = useState<boolean>(false);
  const [teacherSyncStatus, setTeacherSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [teacherSyncError, setTeacherSyncError] = useState<string>('');
  const [teacherLastDbSyncAt, setTeacherLastDbSyncAt] = useState<string | null>(null);

  // Monthly Behaviour Reports (Supabase DB + localStorage cache)
  const [behaviourReports, setBehaviourReports] = useState<Record<string, MonthlyBehaviourReport>>(() =>
    loadStoredBehaviourReports()
  );
  const [selectedBehaviourMonthKey, setSelectedBehaviourMonthKey] = useState<string>(() =>
    getDefaultBehaviourMonthKey()
  );

  // Mentor Behaviour Editor state (strictly accessible only by each class's assigned Mentor)
  const [teacherPortalView, setTeacherPortalView] = useState<'marks' | 'behaviour'>('marks');
  const [mentorBehMonthKey, setMentorBehMonthKey] = useState<string>(() =>
    getDefaultBehaviourMonthKey()
  );
  const [mentorBehStudentId, setMentorBehStudentId] = useState<string>('');
  const [mentorBehDraft, setMentorBehDraft] = useState<MonthlyBehaviourReport | null>(null);
  const [mentorBehSaving, setMentorBehSaving] = useState<boolean>(false);
  const [mentorBehDownloadingPdf, setMentorBehDownloadingPdf] = useState<boolean>(false);
  const [mentorBehMessage, setMentorBehMessage] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const handleSaveBehaviourReport = async (
    report: MonthlyBehaviourReport
  ): Promise<{ ok: boolean; error?: string }> => {
    const targetStudent = students.find((s) => s.id === report.studentId);
    if (
      !authStaff ||
      authStaff.role !== 'teacher' ||
      !authStaff.mentorClass ||
      !targetStudent ||
      !isTeacherMentorOfClass(authStaff.username, targetStudent.grade, targetStudent.section)
    ) {
      return {
        ok: false,
        error:
          language === 'ku'
            ? 'بتنێ ڕابەرێ پۆلێ دشێت راپۆرتا رەوشتی تۆمار بکەت'
            : language === 'ar'
            ? 'مرشد الصف فقط يمكنه إدخال أو تعديل تقارير السلوك لهذا الصف'
            : 'Only the designated Class Mentor can insert or edit behaviour reports for this class.',
      };
    }

    setBehaviourReports((prev) => {
      const next = { ...prev, [report.id]: report };
      saveStoredBehaviourReports(next);
      return next;
    });
    return upsertBehaviourReportToSupabase(report, authStaff.email || authStaff.name);
  };

  // Form input states
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active student in parent/student account (when parent has multiple children)
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // The Options: When logging in, user ONLY sees the portal buttons first
  const [activePortalTab, setActivePortalTab] = useState<PortalTab>(null);

  // Active day selection for Timetable
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<string>('all');

  // Calendar filter and search states
  const [calendarSemesterFilter, setCalendarSemesterFilter] = useState<'all' | 'first' | 'second' | 'exams'>('all');
  const [calendarSearchQuery, setCalendarSearchQuery] = useState<string>('');

  // Category filter for marksheet
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [behaviourPdfError, setBehaviourPdfError] = useState<string>('');

  // Administrative / Teacher View State
  const officialGrades = useMemo(() => Object.keys(SCHOOL_STRUCTURE), []);
  const [staffGrade, setStaffGrade] = useState<string>('Grade 1');
  const [staffClass, setStaffClass] = useState<string>('Class A');
  const [staffStudentId, setStaffStudentId] = useState<string>('');
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');

  // Sub-tabs for Staff
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

  // Hydrate students roster & teacher daily marks from Supabase on mount + Realtime sync
  useEffect(() => {
    let active = true;

    fetchStudentsFromSupabase().then((remoteStudents) => {
      if (!active) return;
      if (remoteStudents && remoteStudents.length > 0) {
        const classById = new Map<string, { grade: string; section: string }>();
        for (const row of remoteStudents) {
          if (row.id && row.grade && row.section) {
            classById.set(row.id, { grade: row.grade, section: row.section });
          }
        }
        setStudents((prev) => {
          const next = prev.map((s) => {
            const remote = classById.get(s.id);
            return remote ? { ...s, grade: remote.grade, section: remote.section } : s;
          });
          try {
            localStorage.setItem('dasinya_students_roster_v3', JSON.stringify(next));
          } catch {}
          return next;
        });
      } else if (remoteStudents && remoteStudents.length === 0) {
        seedStudentsToSupabase(students).catch(() => {});
      }
    });

    fetchDailyRecordsFromSupabase().then((res) => {
      if (!active || !res.ok) return;
      if (Object.keys(res.records).length > 0) {
        setDailyRecords((prev) => {
          const merged = { ...prev, ...res.records };
          saveStoredDailyRecords(merged);
          return merged;
        });
      }
    });

    fetchBehaviourReportsFromSupabase().then((res) => {
      if (!active || !res.ok) return;
      if (Object.keys(res.reports).length > 0) {
        setBehaviourReports((prev) => {
          const merged = { ...prev, ...res.reports };
          saveStoredBehaviourReports(merged);
          return merged;
        });
      }
    });

    const sb = supabase;
    if (!sb) {
      return () => {
        active = false;
      };
    }

    const channel = sb
      .channel('realtime-academic-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: DAILY_RECORDS_TABLE },
        (payload) => {
          if (!active) return;
          if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as Partial<SupabaseDailyRecordRow> | undefined)?.id;
            if (!oldId) return;
            setDailyRecords((prev) => {
              if (!(oldId in prev)) return prev;
              const copy = { ...prev };
              delete copy[oldId];
              saveStoredDailyRecords(copy);
              return copy;
            });
            return;
          }
          const row = payload.new as Partial<SupabaseDailyRecordRow> | undefined;
          if (row?.id && row.record && typeof row.record === 'object') {
            const recKey = row.id;
            const recVal = row.record;
            setDailyRecords((prev) => {
              const next = { ...prev, [recKey]: recVal };
              saveStoredDailyRecords(next);
              return next;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: BEHAVIOUR_REPORTS_TABLE },
        (payload) => {
          if (!active) return;
          if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as Partial<SupabaseBehaviourReportRow> | undefined)?.id;
            if (!oldId) return;
            setBehaviourReports((prev) => {
              if (!(oldId in prev)) return prev;
              const copy = { ...prev };
              delete copy[oldId];
              saveStoredBehaviourReports(copy);
              return copy;
            });
            return;
          }
          const row = payload.new as Partial<SupabaseBehaviourReportRow> | undefined;
          if (row?.id && row.report && typeof row.report === 'object') {
            const repKey = row.id;
            const repVal: MonthlyBehaviourReport = {
              ...row.report,
              published: row.published ?? row.report.published ?? true,
              updatedAt: row.updated_at || row.report.updatedAt || new Date().toISOString(),
            };
            setBehaviourReports((prev) => {
              const next = { ...prev, [repKey]: repVal };
              saveStoredBehaviourReports(next);
              return next;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'students' },
        (payload) => {
          if (!active) return;
          const updated = payload.new as { id?: string; grade?: string; section?: string } | undefined;
          if (!updated?.id || !updated.grade || !updated.section) return;
          setStudents((prev) => {
            const next = prev.map((s) =>
              s.id === updated.id
                ? { ...s, grade: updated.grade!, section: updated.section! }
                : s
            );
            try {
              localStorage.setItem('dasinya_students_roster_v3', JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      sb.removeChannel(channel);
    };
  }, []);

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

  // Handle Login: Teachers log in by Email + Phone Number password; Parents log in by Password only
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const pwdToVerify = loginPassword.trim();

    if (selectedPortal === 'admin') {
      const usernameToVerify = loginUsername.trim().toLowerCase();
      const normalizedAdminPwd = pwdToVerify.replace(/[\s\-().]+/g, '');
      if (usernameToVerify === 'admin' && normalizedAdminPwd === '07517340166') {
        setAuthGuardian(null);
        setAuthDriver(null);
        setAuthStaff({
          role: 'admin',
          username: 'admin',
          name: 'School Administration',
        });
        setStaffSearchQuery('');
        setLoginError('');
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginError(
          language === 'ku'
            ? 'ناڤێ بەکارهێنەری یان وشەی تێپەڕبوونا ئەدمین هەڵەیە.'
            : language === 'ar'
            ? 'اسم المستخدم أو كلمة المرور الخاصة بالإدارة غير صحيحة.'
            : 'Invalid admin username or password.'
        );
      }
      setIsLoggingIn(false);
      return;
    }

    if (selectedPortal === 'driver') {
      const driverIdentifier = loginUsername.trim();
      if (!driverIdentifier || !pwdToVerify) {
        setLoginError(
          language === 'ku'
            ? 'تکایە کۆدێ باسێ (یان ناڤێ شۆفێری) و PIN بنووسە'
            : language === 'ar'
            ? 'يرجى اختيار السائق أو رمز الحافلة وإدخال رمز الدخول PIN'
            : 'Please select driver / enter Bus Code and Driver PIN'
        );
        setIsLoggingIn(false);
        return;
      }

      const driverAcc = authenticateDriver(driverIdentifier, pwdToVerify);
      if (driverAcc) {
        setAuthGuardian(null);
        setAuthStaff(null);
        setAuthDriver(driverAcc);
        setLoginError('');
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginError(
          language === 'ku'
            ? 'کۆدێ باسێ یان PIN یێ شۆفێری خەلەتە.'
            : language === 'ar'
            ? 'رمز الحافلة أو رمز PIN غير صحيح.'
            : 'Invalid Bus Code / Driver Name or PIN.'
        );
      }
      setIsLoggingIn(false);
      return;
    }

    if (selectedPortal === 'teacher') {
      const emailToVerify = loginUsername.trim();
      if (!emailToVerify || !pwdToVerify) {
        setLoginError(
          language === 'ku'
            ? 'تکایە ئیمەیڵ و ژمارا تەلەفۆنێ (وشەی تێپەڕبوون) بنووسە'
            : language === 'ar'
            ? 'يرجى إدخال البريد الإلكتروني ورقم الهاتف (كلمة المرور)'
            : 'Please enter your email address and phone number (password)'
        );
        setIsLoggingIn(false);
        return;
      }

      const teacherAcc = authenticateTeacher(emailToVerify, pwdToVerify);

      if (teacherAcc) {
        const firstAssignment = teacherAcc.assignedClasses[0] || {
          grade: 'Grade 1',
          section: 'Class A',
          subjects: ['Kurdish'],
        };
        const mentorClass = getMentorAssignmentForTeacher(teacherAcc.id);
        setAuthGuardian(null);
        setAuthStaff({
          role: 'teacher',
          username: teacherAcc.id,
          name: teacherAcc.name,
          email: teacherAcc.email,
          subjectLabel: teacherAcc.subjectLabel,
          assignedClasses: teacherAcc.assignedClasses,
          assignedGrade: firstAssignment.grade,
          assignedSection: firstAssignment.section,
          mentorClass,
        });
        setTeacherPortalView('marks');
        setMentorBehDraft(null);
        setMentorBehMessage(null);
        if (mentorClass) {
          const firstMentorStudent = students.find(
            (s) => s.grade === mentorClass.grade && s.section === mentorClass.section
          );
          setMentorBehStudentId(firstMentorStudent?.id || '');
        } else {
          setMentorBehStudentId('');
        }
        setStaffGrade(firstAssignment.grade);
        setStaffClass(firstAssignment.section);
        setTeacherSubject(firstAssignment.subjects[0] || '');
        setStaffSearchQuery('');
        setLoginError('');
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginError(
          language === 'ku'
            ? 'ئیمەیڵ یان ژمارا تەلەفۆنێ هەڵەیە. تکایە ئیمەیڵ و ژمارا تەلەفۆنا خۆ یا فەرمی بپشکنە.'
            : language === 'ar'
            ? 'البريد الإلكتروني أو رقم الهاتف غير صحيح. يرجى التأكد من البريد الإلكتروني ورقم الهاتف المعتمد.'
            : 'Invalid email or phone number. Please check your official school email and phone number.'
        );
      }
      setIsLoggingIn(false);
      return;
    }

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
      Boolean(s.guardianPassword && s.guardianPassword.trim() === pwdToVerify)
    );

    if (matched.length > 0) {
      setAuthStaff(null);
      const session: AuthenticatedGuardian = {
        password: pwdToVerify,
        email: matched[0].guardianEmail || '',
        students: matched
      };
      setAuthGuardian(session);
      setSelectedChildId(matched[0].id);
      setActivePortalTab(null); // When log in, parent ONLY sees the portal buttons first!
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

  // Sign out: returns to login screen
  const handleSignOut = () => {
    setAuthGuardian(null);
    setAuthStaff(null);
    setAuthDriver(null);
    setTeacherPortalView('marks');
    setMentorBehDraft(null);
    setMentorBehMessage(null);
    setMentorBehStudentId('');
    setSelectedChildId('');
    setActivePortalTab(null);
    setModalStudent(null);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
  };

  // Return to portal home view
  const handleSwitchPortal = () => {
    if (selectedPortal === 'teacher' && authStaff) {
      setModalStudent(null);
      return;
    }
    setActivePortalTab(null);
  };

  // Teacher marks entry handler (updates state + localStorage + debounced Supabase database upsert)
  const handleTeacherRecordChange = (
    studentId: string,
    updated: DailySubjectRecord,
    subjectOverride?: string
  ) => {
    const subjectForKey = subjectOverride || teacherSubject;
    const key = makeDailyRecordKey(studentId, subjectForKey);
    setDailyRecords((prev) => {
      const next = { ...prev, [key]: updated };
      dailyRecordsRef.current = next;
      saveStoredDailyRecords(next);
      return next;
    });
    setTeacherSavedNotice(false);
    setTeacherSyncStatus('saving');
    setTeacherSyncError('');

    if (pendingMarkTimersRef.current[key]) {
      window.clearTimeout(pendingMarkTimersRef.current[key]);
    }
    pendingMarkTimersRef.current[key] = window.setTimeout(async () => {
      delete pendingMarkTimersRef.current[key];
      const res = await upsertDailyRecordToSupabase({
        key,
        studentId,
        subject: subjectForKey,
        record: updated,
        updatedBy: authStaff?.email,
      });
      if (res.ok) {
        setTeacherSyncStatus('saved');
        setTeacherSyncError('');
        setTeacherLastDbSyncAt(new Date().toISOString());
      } else {
        setTeacherSyncStatus('error');
        setTeacherSyncError(res.error || 'Could not save mark to database.');
      }
    }, 350);
  };

  const handleTeacherSaveAll = async () => {
    // Flush any pending per-cell debounce timers first
    for (const timerId of Object.values(pendingMarkTimersRef.current)) {
      window.clearTimeout(timerId);
    }
    pendingMarkTimersRef.current = {};

    const latest = dailyRecordsRef.current;
    saveStoredDailyRecords(latest);
    setTeacherSyncStatus('saving');
    setTeacherSyncError('');

    const res = await upsertAllDailyRecordsToSupabase(latest, authStaff?.email);
    if (res.ok) {
      setTeacherSyncStatus('saved');
      setTeacherSavedNotice(true);
      setTeacherLastDbSyncAt(new Date().toISOString());
      setTimeout(() => setTeacherSavedNotice(false), 3500);
    } else {
      setTeacherSyncStatus('error');
      setTeacherSyncError(res.error || 'Failed to save marks to Supabase database.');
    }
  };

  // Active student in Parent/Student portal (resolved against live students state so DB class updates reflect immediately)
  const activeGuardianStudent = useMemo(() => {
    if (!authGuardian || !authGuardian.students.length) return null;
    const fallback = authGuardian.students.find(s => s.id === selectedChildId) || authGuardian.students[0];
    return students.find(s => s.id === fallback.id) || fallback;
  }, [authGuardian, selectedChildId, students]);

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
  const currentStudent = selectedPortal === 'parent'
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
        orientation: targetElementId === 'printable-marksheet' ? 'landscape' : 'portrait',
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

  const handleDownloadBehaviourReportPdf = async () => {
    if (!currentStudent || isGeneratingPdf) return;
    setBehaviourPdfError('');
    setIsGeneratingPdf(true);
    try {
      await exportBehaviourReportPdf({
        elementId: 'printable-behaviour',
        studentName: currentStudent.name,
        monthKey: selectedBehaviourMonthKey,
      });
    } catch (err) {
      console.error('Error exporting behaviour PDF:', err);
      setBehaviourPdfError(
        err instanceof Error ? err.message : 'Could not generate Behaviour Report PDF.'
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // CSV Export for Admin
  const handleExportCsv = () => {
    const headers = ['Serial', 'ID', 'Name', 'Grade', 'Section', 'Roll Number', 'Gender', 'Attendance', 'Conduct', 'Guardian Email', 'Student / Guardian Password'];
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

  // Dedicated mobile-friendly /driver GPS route (only authenticated drivers can start/stop live GPS)
  if (currentPath.replace(/\/+$/, '') === '/driver') {
    return (
      <DriverRouteTrackerPage
        authenticatedDriver={authDriver}
        onDriverAuthenticated={(drv) => {
          setAuthGuardian(null);
          setAuthStaff(null);
          setAuthDriver(drv);
          setSelectedPortal('driver');
        }}
        onDriverSignOut={() => {
          setAuthDriver(null);
        }}
        onNavigateHome={() => navigateTo('/')}
        onStartTrip={startTrip}
        onStopTrip={stopTrip}
        onSendLocation={sendLocation}
      />
    );
  }

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
              <span
                className={`hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
                  selectedPortal === 'admin'
                    ? 'bg-[#EEF0FF] text-[#1A1D4E]'
                    : selectedPortal === 'teacher'
                    ? 'bg-[#E1F3F7] text-[#0087A5]'
                    : selectedPortal === 'driver'
                    ? 'bg-[#E6FAF6] text-[#00876A]'
                    : 'bg-[#FFF2E8] text-[#FF6D00]'
                }`}
              >
                {selectedPortal === 'admin'
                  ? language === 'ku'
                    ? 'پۆڕتاڵێ ئەدمین'
                    : language === 'ar'
                    ? 'بوابة الإدارة'
                    : 'Admin Portal'
                  : selectedPortal === 'teacher'
                  ? t.portalTeacher
                  : selectedPortal === 'driver'
                  ? language === 'ku'
                    ? 'پۆڕتاڵێ شۆفێران'
                    : language === 'ar'
                    ? 'بوابة السائقين'
                    : 'Driver Portal'
                  : t.portalParent}
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
      {/* PARENTS (PASSWORD ONLY) & TEACHER (EMAIL + PHONE) LOGIN  */}
      {/* ======================================================== */}
      {!isPortalAuthenticated && (
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-start text-center">
          {/* School Crest */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 max-w-full flex items-center justify-center mb-3">
            <img 
              src={SCHOOL_LOGO_URL} 
              alt="Dasinya Private School Logo" 
              className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,135,165,0.15)]" 
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1D4E] mb-1">
            {selectedPortal === 'admin'
              ? language === 'ku'
                ? 'پۆڕتاڵێ ئەدمین و پوختەیا گشتی'
                : language === 'ar'
                ? 'بوابة الإدارة والملخص الشامل'
                : 'Admin Panel Portal'
              : selectedPortal === 'driver'
              ? language === 'ku'
                ? 'پۆڕتاڵێ شۆفێران و چاڤدێریا باسان'
                : language === 'ar'
                ? 'بوابة السائقين والتتبع المباشر'
                : 'Bus Driver Portal'
              : selectedPortal === 'teacher'
              ? t.teacherLoginTitle
              : t.parentLoginTitle}
          </h2>

          <p className="text-xs sm:text-sm text-[#6B70A6] max-w-md mx-auto mb-5 leading-relaxed">
            {selectedPortal === 'admin'
              ? language === 'ku'
                ? 'ب رێکا ناڤێ بەکارهێنەری و وشەی تێپەڕبوونێ بچۆ ژوورڤە بۆ بینینا پوختەیا گشتی یا نمرە و پۆلان'
                : language === 'ar'
                ? 'سجل الدخول باسم المستخدم وكلمة المرور لعرض الملخص الشامل للدرجات والصفوف'
                : 'Sign in with administrator credentials to inspect entry progress, averages, pass rates & live fleet'
              : selectedPortal === 'driver'
              ? language === 'ku'
                ? 'شۆفێرێ خۆ هەلبژێرە و PIN بنووسە بۆ دەستپێکرنا رێڤەبرن و پەخشا زیندوو یا جھێ باسێ'
                : language === 'ar'
                ? 'اختر اسم السائق وأدخل رمز PIN لتفعيل البث المباشر لموقع الحافلة ومنازل الطلاب'
                : 'Select your driver route and enter your Driver PIN for live GPS bus tracking & student house navigation'
              : selectedPortal === 'teacher'
              ? language === 'ku'
                ? 'ب رێکا ئیمەیڵ و ژمارا تەلەفۆنا خۆ (وەکی وشەی تێپەڕبوون) بچۆ ژوورڤە بۆ تۆمارکرنا نمرێن قوتابیان'
                : language === 'ar'
                ? 'سجل الدخول بالبريد الإلكتروني ورقم الهاتف (كلمة المرور) لإدخال درجات الطلاب في سجل المتابعة اليومية'
                : 'Sign in using your official teacher email and phone number as password to enter marks'
              : language === 'ku' 
              ? 'ب رێکا وشەی تێپەڕبوون (پاسوۆرد) بچۆ ژوورڤە بۆ بینینا نمرەیان، خشتەیێ وانان و راپۆرتا رەوشتی' 
              : language === 'ar' 
              ? 'سجل الدخول بكلمة المرور فقط لعرض بيانات الطالب وكشف الدرجات والجدول الدراسي' 
              : 'Sign in using student password to access academic evaluations, marksheet, timetable & live bus'}
          </p>

          {/* Portal Switcher: Parents vs Teacher vs Driver vs Admin */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-3xl mb-5">
            <button
              type="button"
              onClick={() => {
                setSelectedPortal('parent');
                setLoginUsername('');
                setLoginPassword('');
                setLoginError('');
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                selectedPortal === 'parent'
                  ? 'bg-white border-[#FF7F2A] shadow-[0_8px_20px_rgba(255,127,42,0.16)]'
                  : 'bg-white/70 border-[#E1E9FF] hover:border-[#FF7F2A]/50 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7F2A] to-[#FF5599] text-white flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-extrabold text-[#1A1D4E] truncate">{t.portalParent}</span>
                <span className="block text-[10px] font-mono text-[#FF6D00] truncate">{t.authPasswordOnly}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPortal('teacher');
                setLoginUsername('');
                setLoginPassword('');
                setLoginError('');
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                selectedPortal === 'teacher'
                  ? 'bg-white border-[#0087A5] shadow-[0_8px_20px_rgba(0,135,165,0.18)]'
                  : 'bg-white/70 border-[#E1E9FF] hover:border-[#0087A5]/50 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0087A5] to-[#2AD4FF] text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-extrabold text-[#1A1D4E] truncate">{t.portalTeacher}</span>
                <span className="block text-[10px] font-mono text-[#0087A5] truncate">
                  {language === 'ku' ? 'ئیمەیڵ + تەلەفۆن' : language === 'ar' ? 'بريد + هاتف' : 'Email + Phone'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPortal('driver');
                setLoginUsername('BUS-01');
                setLoginPassword('');
                setLoginError('');
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                selectedPortal === 'driver'
                  ? 'bg-white border-[#00A887] shadow-[0_8px_20px_rgba(0,168,135,0.18)]'
                  : 'bg-white/70 border-[#E1E9FF] hover:border-[#00A887]/50 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A887] to-[#0087A5] text-white flex items-center justify-center shrink-0">
                <Bus className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-extrabold text-[#1A1D4E] truncate">
                  {language === 'ku' ? 'پۆڕتاڵێ شۆفێران' : language === 'ar' ? 'بوابة السائقين' : 'Driver Portal'}
                </span>
                <span className="block text-[10px] font-mono text-[#00A887] truncate">
                  {language === 'ku' ? 'پاس + PIN' : language === 'ar' ? 'حافلة + PIN' : 'Live Bus GPS'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedPortal('admin');
                setLoginUsername('');
                setLoginPassword('');
                setLoginError('');
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                selectedPortal === 'admin'
                  ? 'bg-white border-[#1A1D4E] shadow-[0_8px_20px_rgba(26,29,78,0.16)]'
                  : 'bg-white/70 border-[#E1E9FF] hover:border-[#1A1D4E]/50 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1D4E] to-[#0087A5] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-extrabold text-[#1A1D4E] truncate">
                  {language === 'ku' ? 'پۆڕتاڵێ ئەدمین' : language === 'ar' ? 'بوابة الإدارة' : 'Admin Portal'}
                </span>
                <span className="block text-[10px] font-mono text-[#454A87] truncate">
                  {language === 'ku' ? 'پوختەیا گشتی' : language === 'ar' ? 'الملخص الشامل' : 'Full Summary'}
                </span>
              </div>
            </button>
          </div>

          {/* LOGIN CARD */}
          <div
            className={`w-full max-w-md bg-white border rounded-3xl p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,135,165,0.08)] text-left transition-all ${
              selectedPortal === 'admin'
                ? 'border-[#C9D2F5] hover:border-[#1A1D4E]/50'
                : selectedPortal === 'driver'
                ? 'border-[#B6EADF] hover:border-[#00A887]/60'
                : selectedPortal === 'teacher'
                ? 'border-[#C8E5EC] hover:border-[#0087A5]/60'
                : 'border-[#E1E9FF] hover:border-[#FF7F2A]/50'
            }`}
          >
            {/* Header in Login Card */}
            <div className={`flex items-center gap-3 mb-5 pb-4 border-b border-[#E1E9FF] ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                  selectedPortal === 'admin'
                    ? 'bg-gradient-to-br from-[#1A1D4E] to-[#0087A5] shadow-[0_4px_12px_rgba(26,29,78,0.3)]'
                    : selectedPortal === 'driver'
                    ? 'bg-gradient-to-br from-[#00A887] to-[#0087A5] shadow-[0_4px_12px_rgba(0,168,135,0.35)]'
                    : selectedPortal === 'teacher'
                    ? 'bg-gradient-to-br from-[#0087A5] to-[#2AD4FF] shadow-[0_4px_12px_rgba(0,135,165,0.35)]'
                    : 'bg-gradient-to-br from-[#FF7F2A] to-[#FF5599] shadow-[0_4px_12px_rgba(255,127,42,0.35)]'
                }`}
              >
                {selectedPortal === 'admin' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : selectedPortal === 'driver' ? (
                  <Bus className="w-5 h-5" />
                ) : selectedPortal === 'teacher' ? (
                  <GraduationCap className="w-5 h-5" />
                ) : (
                  <HeartHandshake className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1D4E]">
                  {selectedPortal === 'admin'
                    ? language === 'ku'
                      ? 'پۆڕتاڵێ ئەدمین'
                      : language === 'ar'
                      ? 'بوابة الإدارة'
                      : 'Admin Panel Portal'
                    : selectedPortal === 'driver'
                    ? language === 'ku'
                      ? 'پۆڕتاڵێ شۆفێران'
                      : language === 'ar'
                      ? 'بوابة السائقين'
                      : 'Bus Driver Portal'
                    : selectedPortal === 'teacher'
                    ? t.portalTeacher
                    : t.portalParent}
                </h3>
                <span
                  className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                    selectedPortal === 'admin'
                      ? 'text-[#1A1D4E] bg-[#EEF0FF]'
                      : selectedPortal === 'driver'
                      ? 'text-[#00876A] bg-[#E6FAF6]'
                      : selectedPortal === 'teacher'
                      ? 'text-[#0087A5] bg-[#E1F3F7]'
                      : 'text-[#FF6D00] bg-[#FFF2E8]'
                  }`}
                >
                  {selectedPortal === 'admin'
                    ? language === 'ku'
                      ? 'بەکارهێنەر + وشەی تێپەڕبوون'
                      : language === 'ar'
                      ? 'اسم المستخدم + كلمة المرور'
                      : 'Username + Password'
                    : selectedPortal === 'driver'
                    ? language === 'ku'
                      ? 'کۆدێ باسێ + PIN'
                      : language === 'ar'
                      ? 'رمز الحافلة + PIN'
                      : 'Driver Route + PIN'
                    : selectedPortal === 'teacher'
                    ? language === 'ku'
                      ? 'ئیمەیڵ + ژمارا تەلەفۆنێ'
                      : language === 'ar'
                      ? 'البريد الإلكتروني + رقم الهاتف'
                      : 'Email + Phone Password'
                    : t.authPasswordOnly}
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
              {/* DRIVER SELECTOR FIELD */}
              {selectedPortal === 'driver' && (
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold uppercase tracking-wider text-[#454A87] ${isRtl ? 'text-right' : 'text-left'}`}>
                    {language === 'ku'
                      ? 'شۆفێر / کۆدێ باسێ'
                      : language === 'ar'
                      ? 'السائق / رقم الحافلة'
                      : 'Select Driver / Bus Route'}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRtl ? 'right-3.5' : 'left-3.5'}`}>
                      <Bus className="w-4 h-4 text-[#00A887]" />
                    </div>
                    <select
                      value={loginUsername}
                      onChange={(e) => {
                        setLoginUsername(e.target.value);
                        setLoginError('');
                      }}
                      className={`w-full bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl py-3 text-xs font-bold text-[#1A1D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A887] focus:border-transparent transition-all ${
                        isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                      }`}
                    >
                      {BUS_DRIVER_ROUTES.map((drv) => (
                        <option key={drv.id} value={drv.code}>
                          {drv.code} — {drv.name} ({drv.stops.length} stops)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* TEACHER EMAIL OR ADMIN USERNAME FIELD */}
              {(selectedPortal === 'teacher' || selectedPortal === 'admin') && (
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold uppercase tracking-wider text-[#454A87] ${isRtl ? 'text-right' : 'text-left'}`}>
                    {selectedPortal === 'admin'
                      ? language === 'ku'
                        ? 'ناڤێ بەکارهێنەری'
                        : language === 'ar'
                        ? 'اسم المستخدم'
                        : 'Username'
                      : t.emailAddressLabel}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRtl ? 'right-3.5' : 'left-3.5'}`}>
                      {selectedPortal === 'admin' ? (
                        <User className="w-4 h-4 text-[#1A1D4E]" />
                      ) : (
                        <Mail className="w-4 h-4 text-[#0087A5]" />
                      )}
                    </div>
                    <input
                      type={selectedPortal === 'admin' ? 'text' : 'email'}
                      required
                      value={loginUsername}
                      onChange={(e) => {
                        setLoginUsername(e.target.value);
                        setLoginError('');
                      }}
                      placeholder={
                        selectedPortal === 'admin'
                          ? 'admin'
                          : language === 'ku'
                          ? 'ئیمەیڵێ خۆ بنووسە (example@gmail.com)'
                          : language === 'ar'
                          ? 'أدخل البريد الإلكتروني (example@gmail.com)'
                          : 'Enter teacher email (example@gmail.com)'
                      }
                      className={`w-full bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl py-3 text-xs text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:bg-white focus:outline-none focus:ring-2 ${
                        selectedPortal === 'admin' ? 'focus:ring-[#1A1D4E]' : 'focus:ring-[#0087A5]'
                      } focus:border-transparent transition-all ${
                        isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* PASSWORD FIELD (ADMIN PASSWORD / TEACHER PHONE / DRIVER PIN / PARENT PASSWORD) */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider text-[#454A87] ${isRtl ? 'text-right' : 'text-left'}`}>
                  {selectedPortal === 'driver'
                    ? language === 'ku'
                      ? 'وشەی تێپەڕبوون (PIN یێ شۆفێری)'
                      : language === 'ar'
                      ? 'رمز الدخول السري للسائق (PIN)'
                      : 'Driver PIN'
                    : selectedPortal === 'teacher'
                    ? language === 'ku'
                      ? 'وشەی تێپەڕبوون (ژمارا تەلەفۆنێ)'
                      : language === 'ar'
                      ? 'كلمة المرور (رقم الهاتف)'
                      : 'Password (Phone Number)'
                    : t.passwordLabel}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRtl ? 'right-3.5' : 'left-3.5'}`}>
                    {selectedPortal === 'teacher' ? (
                      <Phone className="w-4 h-4 text-[#0087A5]" />
                    ) : selectedPortal === 'driver' ? (
                      <KeyRound className="w-4 h-4 text-[#00A887]" />
                    ) : selectedPortal === 'admin' ? (
                      <KeyRound className="w-4 h-4 text-[#1A1D4E]" />
                    ) : (
                      <Lock className="w-4 h-4 text-[#FF7F2A]" />
                    )}
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
                      selectedPortal === 'admin'
                        ? language === 'ku'
                          ? 'وشەی تێپەڕبوونا ئەدمین بنووسە'
                          : language === 'ar'
                          ? 'أدخل كلمة مرور الإدارة'
                          : 'Enter admin password'
                        : selectedPortal === 'driver'
                        ? 'PIN (123456 - 123464)'
                        : selectedPortal === 'teacher'
                        ? '0750 XXX XXXX'
                        : language === 'ku'
                        ? 'وشەی تێپەڕبوون بنووسە'
                        : language === 'ar'
                        ? 'أدخل كلمة المرور'
                        : 'Enter student password'
                    }
                    className={`w-full bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl py-3 text-xs text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:bg-white focus:outline-none focus:ring-2 border-transparent transition-all ${
                      selectedPortal === 'admin'
                        ? 'focus:ring-[#1A1D4E]'
                        : selectedPortal === 'driver'
                        ? 'focus:ring-[#00A887]'
                        : selectedPortal === 'teacher'
                        ? 'focus:ring-[#0087A5]'
                        : 'focus:ring-[#FF7F2A]'
                    } ${isRtl ? 'pr-10 pl-11 text-right' : 'pl-10 pr-11 text-left'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 flex items-center text-[#7C85FF] px-3 cursor-pointer ${
                      selectedPortal === 'admin'
                        ? 'hover:text-[#1A1D4E]'
                        : selectedPortal === 'driver'
                        ? 'hover:text-[#00A887]'
                        : selectedPortal === 'teacher'
                        ? 'hover:text-[#0087A5]'
                        : 'hover:text-[#FF7F2A]'
                    } ${isRtl ? 'left-1' : 'right-1'}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className={`w-full text-white py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 active:scale-[0.99] ${
                  selectedPortal === 'admin'
                    ? 'bg-[#1A1D4E] hover:bg-[#13163D] shadow-[0_4px_14px_rgba(26,29,78,0.3)]'
                    : selectedPortal === 'driver'
                    ? 'bg-[#00A887] hover:bg-[#008E72] shadow-[0_4px_14px_rgba(0,168,135,0.35)]'
                    : selectedPortal === 'teacher'
                    ? 'bg-[#0087A5] hover:bg-[#00738D] shadow-[0_4px_14px_rgba(0,135,165,0.35)]'
                    : 'bg-[#FF7F2A] hover:bg-[#E56E20] shadow-[0_4px_14px_rgba(255,127,42,0.35)]'
                }`}
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
      {/* ONLY SEES THE PORTAL BUTTONS FIRST                       */}
      {/* ======================================================== */}
      {selectedPortal === 'parent' && isPortalAuthenticated && authGuardian && currentStudent && (
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

                {/* 7. LIVE SCHOOL BUS TRACKING */}
                <button
                  onClick={() => setActivePortalTab('bus_tracking')}
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#00A887] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(0,168,135,0.18)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(0,135,165,0.05)]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00A887] to-[#0087A5] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,168,135,0.35)] group-hover:scale-105 transition-transform">
                      <Bus className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E6FAF6] text-[#00A887]">
                      07
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1A1D4E] group-hover:text-[#00A887] transition-colors mb-1">
                      {language === 'ku' ? 'چاڤدێریا باسێ (زیندوو)' : language === 'ar' ? 'تتبع حافلة المدرسة (مباشر)' : 'LIVE SCHOOL BUS'}
                    </h4>
                    <p className="text-xs text-[#6B70A6] line-clamp-2">
                      {language === 'ku'
                        ? 'جھێ باسێ ب شێوەیێ زیندوو، ناڤێ شۆفێری و رەوشا سواربوونا قوتابی'
                        : language === 'ar'
                        ? 'الموقع المباشر لحافلة الطالب، اسم السائق، وحالة الصعود والنزول'
                        : 'Live GPS bus location, assigned driver & real-time boarding status'}
                    </p>
                  </div>
                </button>

                {/* 8. EXAMS SCHEDULE */}
                <button
                  onClick={() => setActivePortalTab('exams_schedule')}
                  className="group bg-white border-2 border-[#E1E9FF] hover:border-[#1A1D4E] rounded-3xl p-6 text-left transition-all duration-200 hover:shadow-[0_16px_36px_rgba(26,29,78,0.16)] cursor-pointer flex flex-col justify-between min-h-[170px] hover:-translate-y-1 shadow-[0_6px_20px_rgba(0,135,165,0.05)]"
                >
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A1D4E] to-[#0087A5] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(26,29,78,0.35)] group-hover:scale-105 transition-transform">
                      <ClipboardList className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EEF0FF] text-[#1A1D4E]">
                      08
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#1A1D4E] group-hover:text-[#0087A5] transition-colors mb-1">
                      {language === 'ku' ? 'خشتەیێ ئەزموونان' : language === 'ar' ? 'جدول الامتحانات' : 'EXAMS SCHEDULE'}
                    </h4>
                    <p className="text-xs text-[#6B70A6] line-clamp-2">
                      {language === 'ku'
                        ? 'خشتەیێ ئەزموونێن دووەم (٢٠٪-٢٥٪) یێن وەرزێ ئێکێ بۆ هەمی پۆلان'
                        : language === 'ar'
                        ? 'جدول الامتحان الثاني (٢٠٪-٢٥٪) للفصل الدراسي الأول لجميع الصفوف'
                        : 'Second (20%-25%) Exam of Semester One schedule starting 18/11/2026'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-SECTION VIEWS (WHEN ONE OF THE BUTTONS IS CLICKED)   */}
          {/* ======================================================== */}
          {activePortalTab !== null && (
            <div className="space-y-6">
              {/* Back to Hub Bar */}
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
                  <button
                    onClick={() => setActivePortalTab('bus_tracking')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePortalTab === 'bus_tracking' ? 'bg-[#00A887] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {language === 'ku' ? 'باسا قوتابخانێ' : language === 'ar' ? 'حافلة المدرسة' : 'School Bus'}
                  </button>
                  <button
                    onClick={() => setActivePortalTab('exams_schedule')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activePortalTab === 'exams_schedule' ? 'bg-[#1A1D4E] text-white shadow-xs' : 'text-[#454A87] hover:bg-[#E1E9FF]/60'
                    }`}
                  >
                    {language === 'ku' ? 'خشتەیێ ئەزموونان' : language === 'ar' ? 'جدول الامتحانات' : 'Exams Schedule'}
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

                    {/* Official Daily Student Record Marksheet Table (Grades 1-3 or Grades 4-9) */}
                    {(() => {
                      const isPrimaryG13 = isGrade13(currentStudent.grade);
                      const rows: DailyRecordRowItem[] = displayedReportSubjects.map((sub) => ({
                        rowKey: sub.subject,
                        label: getTranslatedSubject(sub.subject, language),
                        record: getEffectiveDailyRecord(currentStudent, sub.subject, dailyRecords),
                      }));

                      return isPrimaryG13 ? (
                        <Grade13DailyRecordTable
                          mode="student"
                          language={language}
                          isRtl={isRtl}
                          gradeLabel={formatGradeLabel(currentStudent.grade, language)}
                          sectionLabel={formatClassLabel(currentStudent.section, language)}
                          rows={rows}
                        />
                      ) : (
                        <Grade49DailyRecordTable
                          mode="student"
                          language={language}
                          isRtl={isRtl}
                          gradeLabel={formatGradeLabel(currentStudent.grade, language)}
                          sectionLabel={formatClassLabel(currentStudent.section, language)}
                          rows={rows}
                        />
                      );
                    })()}

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
                            ? 'نمرەی فەرمی ئەو بابەتانەی لە کەشف نمرە بارکراون یان لە لایەن مامۆستایێ پۆلێ تۆمارکراون ل سەرێ خشتەی دهێنە نیشاندان. ئەو خانە و بابەتێن هێشتا نمرە تێدا نینن ب بەتاڵی دمینن.'
                            : language === 'ar'
                            ? 'الدرجات الرسمية المعتمدة والمدخلة من معلم الصف تظهر في سجل المتابعة أعلاه. الحقول والمواد التي لم تُرفع درجاتها بعد تبقى فارغة لحين اعتمادها.'
                            : 'Authentic marks uploaded from official records and entered by your class teacher appear in the Daily Student Record above. Any subjects or fields without marks remain blank until submitted.'}
                        </p>
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
                  <FoodMenuView
                    language={language}
                    title={t.foodMenuTitle}
                    subtitle={t.foodMenuSubtitle}
                  />
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
              {/* SECTION 5: MONTHLY BEHAVIOUR REPORT                  */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'behaviour' && (() => {
                const selectedReportKey = makeBehaviourReportKey(
                  currentStudent.id,
                  selectedBehaviourMonthKey
                );
                const monthlyReport = behaviourReports[selectedReportKey];
                const isPublishedMonthly = Boolean(monthlyReport && monthlyReport.published);
                const publishedMonthsForStudent = BEHAVIOUR_MONTHS.filter((m) => {
                  const rep = behaviourReports[makeBehaviourReportKey(currentStudent.id, m.key)];
                  return Boolean(rep && rep.published);
                });

                return (
                <div className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-8 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E1E9FF] gap-3 print:hidden">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BB8FFF] to-[#FF7F2A] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(187,143,255,0.3)] shrink-0">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-[#1A1D4E]">
                          {language === 'ku'
                            ? 'راپۆرتا هەیڤانە یا سلوک و رەوشتی'
                            : language === 'ar'
                            ? 'تقرير السلوك الشهري'
                            : 'Monthly Behaviour Report'}
                        </h3>
                        <p className="text-xs text-[#6B70A6]">
                          {language === 'ku'
                            ? 'کارتا فەرمی یا هەیڤانە بۆ سلوک، رەوشت و ئامادەبوونا قوتابی'
                            : language === 'ar'
                            ? 'بطاقة التقرير الشهري للسلوك والانضباط والمواد الدراسية'
                            : 'Official Monthly Student Conduct, Learning & Incidents Report'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                      {isPublishedMonthly && (
                        <>
                          <button
                            type="button"
                            disabled={isGeneratingPdf}
                            onClick={handleDownloadBehaviourReportPdf}
                            className="px-3.5 py-2 rounded-xl bg-[#0087A5] hover:bg-[#00738D] disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            {isGeneratingPdf ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {isGeneratingPdf
                                ? language === 'ku'
                                  ? 'دروستکرنا PDF...'
                                  : language === 'ar'
                                  ? 'جاري إنشاء PDF...'
                                  : 'Generating PDF...'
                                : language === 'ku'
                                ? 'داگرتنا PDF'
                                : language === 'ar'
                                ? 'حفظ PDF'
                                : 'Save PDF'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => printBehaviourReport('printable-behaviour')}
                            className="px-3.5 py-2 rounded-xl bg-[#F5F6FF] hover:bg-[#E1E9FF] border border-[#E1E9FF] text-[#1A1D4E] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#0087A5]" />
                            <span>
                              {language === 'ku'
                                ? 'چاپکرنا A4'
                                : language === 'ar'
                                ? 'طباعة A4'
                                : 'Print A4'}
                            </span>
                          </button>
                        </>
                      )}
                      <span className="px-3.5 py-1.5 bg-[#F5F6FF] border border-[#E1E9FF] text-[#454A87] font-mono text-xs rounded-xl font-bold">
                        {currentStudent.rollNumber}
                      </span>
                    </div>
                  </div>

                  {behaviourPdfError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 print:hidden">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{behaviourPdfError}</span>
                    </div>
                  )}

                  {/* Monthly Selector Strip */}
                  <div className="space-y-2 print:hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B70A6]">
                        {language === 'ku' ? 'هەیڤێ هەلبژێرە' : language === 'ar' ? 'اختر الشهر' : 'Select Month'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#00A887]">
                        {publishedMonthsForStudent.length}{' '}
                        {language === 'ku' ? 'راپۆرت بەردەستن' : language === 'ar' ? 'تقارير متاحة' : 'Published'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {BEHAVIOUR_MONTHS.map((m) => {
                        const rep = behaviourReports[makeBehaviourReportKey(currentStudent.id, m.key)];
                        const hasPublished = Boolean(rep && rep.published);
                        const isSelected = selectedBehaviourMonthKey === m.key;
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => setSelectedBehaviourMonthKey(m.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#0087A5] text-white border-[#0087A5] shadow-xs'
                                : hasPublished
                                ? 'bg-[#E6FAF6] text-[#006F59] border-[#B6EADF] hover:bg-[#D3F5EE]'
                                : 'bg-[#F5F6FF] text-[#6B70A6] border-[#E1E9FF] hover:bg-[#E1E9FF]/60'
                            }`}
                          >
                            {hasPublished && (
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isSelected ? 'bg-white' : 'bg-[#00A887]'
                                }`}
                              />
                            )}
                            <span>
                              {language === 'ku'
                                ? m.labelKu
                                : language === 'ar'
                                ? m.labelAr
                                : m.labelEn}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Full A4 Monthly Report Card when published */}
                  {isPublishedMonthly && monthlyReport ? (
                    <BehaviourReportCard
                      mode="view"
                      report={monthlyReport}
                      studentName={currentStudent.name}
                      gradeLabel={formatGradeLabel(currentStudent.grade, language)}
                      sectionLabel={formatClassLabel(currentStudent.section, language)}
                      schoolLogoUrl={SCHOOL_LOGO_URL}
                      language={language}
                    />
                  ) : currentStudent.behaviourReport?.uploaded ? (
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
                    <div className="space-y-6">
                      <div className="p-8 rounded-3xl border-2 border-dashed border-[#E1E9FF] bg-[#F5F6FF]/60 text-center flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#E1E9FF] text-[#0087A5] flex items-center justify-center shadow-xs">
                          <FileText className="w-7 h-7" />
                        </div>
                        <div className="space-y-1.5 max-w-lg">
                          <span className="inline-block px-3 py-1 rounded-full bg-[#FFF2E8] text-[#FF6D00] text-[10px] font-bold uppercase tracking-wider">
                            {language === 'ku' ? 'هێشتا نەهاتیە بارکرن' : language === 'ar' ? 'لم يتم الرفع بعد' : 'Awaiting Monthly Upload'}
                          </span>
                          <h4 className="text-base font-bold text-[#1A1D4E] pt-1">
                            {language === 'ku'
                              ? 'چ راپۆرتێن سلوکی بۆ ڤێ هەیڤێ نەهاتینە بارکرن'
                              : language === 'ar'
                              ? 'لا يوجد تقرير سلوك مرفوع لهذا الشهر حالياً'
                              : 'No Behaviour Report Published for This Month Yet'}
                          </h4>
                          <p className="text-xs text-[#6B70A6] leading-relaxed">
                            {language === 'ku'
                              ? 'راپۆرتا سلوکی یا هەیڤانە دێ ل ڤێرێ دەربکەڤیت پشتی کو ژ لایێ کارگێریا قوتابخانێ و چاڤدێرێ پەروەردەیی ڤە بهێتە پەسەندکرن و بارکرن.'
                              : language === 'ar'
                              ? 'سيتم عرض بطاقة تقرير السلوك الشهري هنا مباشرة فور اعتمادها ورفعها من إدارة المدرسة والمرشدة الاجتماعية.'
                              : 'Once the school social worker and administration publish this month’s behaviour card, the full A4 report will appear here.'}
                          </p>
                        </div>
                      </div>

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
                );
              })()}

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

              {/* ---------------------------------------------------- */}
              {/* SECTION 7: LIVE SCHOOL BUS TRACKER                   */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'bus_tracking' && (() => {
                const match = findBusForStudent(currentStudent.id, currentStudent.name);
                const driver = match?.driver || null;
                const studentStop = match?.stop || null;
                const busState = driver ? liveBuses[driver.id] : null;
                const boardingStatus = studentStop && busState?.studentStatuses?.[studentStop.id]
                  ? busState.studentStatuses[studentStop.id]
                  : 'waiting';

                return (
                  <div className="bg-white border border-[#E1E9FF] rounded-3xl p-5 sm:p-8 shadow-[0_6px_24px_rgba(0,135,165,0.06)] space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E1E9FF] gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00A887] to-[#0087A5] text-white flex items-center justify-center shrink-0">
                          <Bus className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-[#1A1D4E]">
                            {language === 'ku'
                              ? 'چاڤدێریا زیندوو یا باسا قوتابخانێ'
                              : language === 'ar'
                              ? 'التتبع المباشر لحافلة المدرسة'
                              : 'Live School Bus Tracking'}
                          </h3>
                          <p className="text-xs text-[#6B70A6]">
                            {wsConnected
                              ? language === 'ku'
                                ? 'پەیوەندیا زیندوو چالاکە'
                                : language === 'ar'
                                ? 'الاتصال المباشر نشط'
                                : 'Real-Time Connection Active'
                              : 'Connecting to live bus feed...'}
                          </p>
                        </div>
                      </div>

                      {driver && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold ${
                            busState?.active
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-[#F5F6FF] text-[#454A87] border border-[#E1E9FF]'
                          }`}
                        >
                          <Radio className={`w-3.5 h-3.5 ${busState?.active ? 'animate-pulse text-emerald-600' : ''}`} />
                          <span>
                            {busState?.active
                              ? busState.direction === 'dropoff'
                                ? language === 'ku'
                                  ? 'د ڕێکێ دا بەرەڤ مال'
                                  : language === 'ar'
                                  ? 'في الطريق إلى المنزل'
                                  : 'ACTIVE: Dropping Off Home'
                                : language === 'ku'
                                ? 'د ڕێکێ دا بەرەڤ قوتابخانێ'
                                : language === 'ar'
                                ? 'في الطريق إلى المدرسة'
                                : 'ACTIVE: Morning Pickup'
                              : language === 'ku'
                              ? 'باس د گەرێ دا نینە'
                              : language === 'ar'
                              ? 'الحافلة في وضع الاستعداد'
                              : 'Bus Standby (Not on Trip)'}
                          </span>
                        </span>
                      )}
                    </div>

                    {driver && studentStop ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                              {language === 'ku' ? 'شۆفێر و باس' : language === 'ar' ? 'السائق والحافلة' : 'Assigned Driver & Bus'}
                            </span>
                            <span className="font-black text-[#1A1D4E] text-sm block">{driver.name}</span>
                            <span className="text-xs font-mono text-[#0087A5] font-bold">{driver.code} • {driver.nameEn}</span>
                          </div>

                          <div className="p-4 bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                              {language === 'ku' ? 'رەوشا قوتابی' : language === 'ar' ? 'حالة الطالب' : 'Student Boarding Status'}
                            </span>
                            <span
                              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-black ${
                                boardingStatus === 'boarded'
                                  ? 'bg-emerald-600 text-white'
                                  : boardingStatus === 'dropped_off'
                                  ? 'bg-[#0087A5] text-white'
                                  : boardingStatus === 'absent'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-white text-[#1A1D4E] border border-[#E1E9FF]'
                              }`}
                            >
                              {boardingStatus === 'boarded'
                                ? language === 'ku'
                                  ? 'ل ناڤ باسێ دایە'
                                  : language === 'ar'
                                  ? 'تم الصعود للحافلة'
                                  : 'Boarded on Bus'
                                : boardingStatus === 'dropped_off'
                                ? language === 'ku'
                                  ? 'گەهشتە مالێ / قوتابخانێ'
                                  : language === 'ar'
                                  ? 'تم التوصيل بأمان'
                                  : 'Safely Dropped Off'
                                : boardingStatus === 'absent'
                                ? language === 'ku'
                                  ? 'نەهاتی'
                                  : language === 'ar'
                                  ? 'غائب اليوم'
                                  : 'Marked Absent'
                                : language === 'ku'
                                ? 'ل هیڤیا باسێ'
                                : language === 'ar'
                                ? 'في انتظار الحافلة'
                                : 'Waiting for Pickup'}
                            </span>
                          </div>

                          <div className="p-4 bg-[#F0F8FA] rounded-2xl border border-[#C8E5EC] flex flex-col justify-between">
                            <div>
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0087A5] mb-1">
                                {language === 'ku' ? 'ناڤونیشانا مالێ' : language === 'ar' ? 'موقع المنزل المسجل' : 'Registered House Pin'}
                              </span>
                              <span className="text-xs font-bold text-[#1A1D4E] block">
                                Stop #{studentStop.order} • {studentStop.studentNamesLabel}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              {studentStop.googleMapsUrl && (
                                <a
                                  href={studentStop.googleMapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0087A5] hover:underline"
                                >
                                  <Navigation className="w-3.5 h-3.5" />
                                  <span>House Pin</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <a
                                href={SCHOOL_LOCATION.googleMapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#1A1D4E] hover:underline"
                              >
                                <School className="w-3.5 h-3.5 text-[#00A887]" />
                                <span>School Hub</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>

                        <LiveBusMap
                          stops={[studentStop]}
                          busState={
                            busState && typeof busState.lat === 'number'
                              ? busState
                              : driver.id === 'drv-mohammed-abdulfatah'
                              ? liveBuses[DEFAULT_SUPABASE_BUS_ID] || busState
                              : busState
                          }
                          driverName={driver.name}
                          driverCode={driver.code}
                          highlightedStopId={studentStop.id}
                          focusKey={`parent-${driver.id}-${studentStop.id}`}
                          heightClass="h-[380px] sm:h-[440px]"
                        />
                      </>
                    ) : (
                      <div className="p-6 bg-[#F5F6FF] border border-[#E1E9FF] rounded-2xl text-center space-y-2">
                        <MapPin className="w-8 h-8 text-[#0087A5] mx-auto opacity-75" />
                        <h4 className="text-sm font-bold text-[#1A1D4E]">
                          {language === 'ku'
                            ? 'ئەڤ قوتابیە ل سەر خشتەیێ باسا قوتابخانێ تۆمارکری نینە'
                            : language === 'ar'
                            ? 'هذا الطالب غير مسجل في قائمة حافلات المدرسة'
                            : 'No School Bus Assignment Linked'}
                        </h4>
                        <p className="text-xs text-[#6B70A6] max-w-md mx-auto">
                          {language === 'ku'
                            ? 'ئەگەر قوتابی هاتنوچوونا قوتابخانێ بکاردهینیت، تکایە پەیوەندیێ ب کارگێڕیا قوتابخانێ بکە.'
                            : language === 'ar'
                            ? 'إذا كان الطالب يستخدم حافلة المدرسة، يرجى مراجعة الإدارة لتأكيد ربط المسار.'
                            : 'If this student rides a Dasinya school bus, please contact the school office to link their stop.'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
              {/* ---------------------------------------------------- */}
              {/* SECTION 8: EXAMS SCHEDULE                            */}
              {/* ---------------------------------------------------- */}
              {activePortalTab === 'exams_schedule' && (
                <ExamsScheduleView
                  language={language}
                  isRtl={isRtl}
                  schoolLogoUrl={SCHOOL_LOGO_URL}
                  studentName={currentStudent.name}
                  highlightGrade={currentStudent.grade}
                  rows={examRows}
                  onDownloadPdf={handleDownloadPdf}
                  isGeneratingPdf={isGeneratingPdf}
                />
              )}
            </div>
          )}
        </main>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: TEACHER PORTAL (ASSIGNED CLASSES & SUBJECT MARKS */}
      {/* + BEHAVIOUR REPORT ACCESS STRICTLY FOR CLASS MENTORS)    */}
      {/* ======================================================== */}
      {selectedPortal === 'teacher' && isPortalAuthenticated && authStaff && (() => {
        const teacherAssignments = authStaff.assignedClasses || [];
        const mentorClass = authStaff.mentorClass || null;
        const activeView: 'marks' | 'behaviour' =
          mentorClass && teacherPortalView === 'behaviour' ? 'behaviour' : 'marks';

        const activeAssignment =
          teacherAssignments.find(
            (a) => a.grade === staffGrade && a.section === staffClass
          ) || teacherAssignments[0];

        const scopedGrade = activeAssignment?.grade || staffGrade;
        const scopedClass = activeAssignment?.section || staffClass;
        const allowedSubjects = activeAssignment?.subjects || [];
        const scopedSubject = allowedSubjects.includes(teacherSubject)
          ? teacherSubject
          : allowedSubjects[0] || '';

        const scopedClassStudents = students.filter(
          (s) => s.grade === scopedGrade && s.section === scopedClass
        );
        const scopedFilteredStudents = !staffSearchQuery.trim()
          ? scopedClassStudents
          : scopedClassStudents.filter((s) => {
              const q = staffSearchQuery.toLowerCase();
              return (
                s.name.toLowerCase().includes(q) ||
                s.id.toLowerCase().includes(q) ||
                s.rollNumber.toLowerCase().includes(q)
              );
            });

        // Mentored Class Students (only populated when teacher is a designated Class Mentor)
        const mentorStudents = mentorClass
          ? students.filter(
              (s) => s.grade === mentorClass.grade && s.section === mentorClass.section
            )
          : [];
        const activeMentorStudent =
          mentorStudents.find((s) => s.id === mentorBehStudentId) || mentorStudents[0] || null;
        const activeMentorReportKey = activeMentorStudent
          ? makeBehaviourReportKey(activeMentorStudent.id, mentorBehMonthKey)
          : '';
        const storedMentorReport = activeMentorStudent
          ? behaviourReports[activeMentorReportKey] ||
            createEmptyBehaviourReport(
              activeMentorStudent.id,
              mentorBehMonthKey,
              authStaff.name
            )
          : null;
        const currentMentorReport =
          mentorBehDraft && activeMentorStudent && mentorBehDraft.id === activeMentorReportKey
            ? mentorBehDraft
            : storedMentorReport;

        const handleMentorSaveBehaviourReport = async () => {
          if (!currentMentorReport || !mentorClass) return;
          setMentorBehSaving(true);
          setMentorBehMessage(null);
          const payload: MonthlyBehaviourReport = {
            ...currentMentorReport,
            supervisor: currentMentorReport.supervisor || authStaff.name,
            updatedAt: new Date().toISOString(),
          };
          const res = await handleSaveBehaviourReport(payload);
          setMentorBehSaving(false);
          if (res.ok) {
            setMentorBehDraft(null);
            setMentorBehMessage({
              ok: true,
              text:
                language === 'ku'
                  ? 'راپۆرتا هەیڤانە یا رەوشتی ل ناڤ داتابەیسێ هاتە پاشەکەفتکرن'
                  : language === 'ar'
                  ? 'تم حفظ تقرير السلوك الشهري في قاعدة البيانات بنجاح'
                  : 'Monthly Behaviour Report Saved to Database',
            });
          } else {
            setMentorBehMessage({
              ok: false,
              text: res.error || 'Could not save behaviour report to database.',
            });
          }
        };

        const handleMentorDownloadBehaviourPdf = async () => {
          if (!activeMentorStudent || mentorBehDownloadingPdf) return;
          setMentorBehDownloadingPdf(true);
          setMentorBehMessage(null);
          try {
            await exportBehaviourReportPdf({
              elementId: 'printable-behaviour',
              studentName: activeMentorStudent.name,
              monthKey: mentorBehMonthKey,
            });
          } catch (err) {
            setMentorBehMessage({
              ok: false,
              text:
                err instanceof Error
                  ? err.message
                  : 'Could not generate Behaviour Report PDF.',
            });
          } finally {
            setMentorBehDownloadingPdf(false);
          }
        };

        return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Teacher Portal Top Banner */}
          <div className="bg-gradient-to-r from-[#0087A5] via-[#0099B8] to-[#2AD4FF] text-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_24px_rgba(0,135,165,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25 shadow-xs shrink-0">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-white/25 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-bold text-white">
                    {t.portalTeacher}
                  </span>
                  {scopedSubject && (
                    <span className="text-[10px] font-mono bg-white/20 px-2.5 py-0.5 rounded-full font-bold text-white">
                      {getTranslatedSubject(scopedSubject, language)}
                    </span>
                  )}
                  <span className="text-[10px] font-mono bg-white/20 px-2.5 py-0.5 rounded-full font-bold text-white flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {formatGradeLabel(scopedGrade, language)} • {formatClassLabel(scopedClass, language)}
                  </span>
                  {mentorClass && (
                    <span className="text-[10px] font-mono bg-[#1A1D4E] px-2.5 py-0.5 rounded-full font-black text-white flex items-center gap-1 shadow-xs">
                      <Heart className="w-3 h-3 text-[#FF7F2A]" />
                      {language === 'ku'
                        ? `ڕابەرێ پۆلا ${mentorClass.classCode}`
                        : language === 'ar'
                        ? `مرشد الصف ${mentorClass.classCode}`
                        : `Class Mentor: ${mentorClass.classCode} (${mentorClass.mentorShortName})`}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  {authStaff.name}
                </h2>
                <p className="text-xs text-white/90">
                  {mentorClass
                    ? language === 'ku'
                      ? `نمرەیێن پۆلێن تە + تۆمارکرنا رەوشتی بتنێ بۆ پۆلا ${mentorClass.classCode}`
                      : language === 'ar'
                      ? `درجات صفوفك المخصصة + إدخال تقارير السلوك للصف ${mentorClass.classCode} فقط`
                      : `Assigned Subject Marks + Class Mentor Behaviour Entry (${mentorClass.classCode} Only)`
                    : language === 'ku'
                    ? `بتنێ پۆل و بابەتێن تە یێن تۆمارکری (${teacherAssignments.length})`
                    : language === 'ar'
                    ? `فقط صفوفك وموادك المخصصة (${teacherAssignments.length})`
                    : `Assigned Classes & Subject Marks Only • ${teacherAssignments.length} Class${teacherAssignments.length === 1 ? '' : 'es'}`}
                </p>
              </div>
            </div>

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

          {/* Mode Switcher Bar (ONLY visible if this Teacher is a designated Class Mentor) */}
          {mentorClass && (
            <div className="flex flex-wrap items-center gap-2.5 print:hidden">
              <button
                type="button"
                onClick={() => setTeacherPortalView('marks')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer border ${
                  activeView === 'marks'
                    ? 'bg-[#0087A5] text-white border-[#0087A5] shadow-sm'
                    : 'bg-white text-[#1A1D4E] border-[#E1E9FF] hover:bg-[#F5F6FF]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {language === 'ku'
                    ? 'نمرەیێن بابەتان'
                    : language === 'ar'
                    ? 'إدخال درجات المواد'
                    : 'Subject Marks'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTeacherPortalView('behaviour')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer border ${
                  activeView === 'behaviour'
                    ? 'bg-[#5B35A8] text-white border-[#5B35A8] shadow-sm'
                    : 'bg-white text-[#5B35A8] border-[#D8CEFA] hover:bg-[#F3EEFF]'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>
                  {language === 'ku'
                    ? `راپۆرتا رەوشتی — پۆلا ${mentorClass.classCode}`
                    : language === 'ar'
                    ? `تقرير السلوك الشهري — صف ${mentorClass.classCode}`
                    : `Mentor Behaviour Report (${mentorClass.classCode})`}
                </span>
              </button>
            </div>
          )}

          {/* MODE A: Assigned Classes + Assigned Subjects Marks View */}
          {activeView === 'marks' && (
          <div className="bg-white border border-[#E1E9FF] rounded-3xl p-4 sm:p-6 shadow-[0_6px_20px_rgba(0,135,165,0.05)] space-y-4">
            {/* Toolbar: Assigned Class, Assigned Subject, Search, Save Marks */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 pb-4 border-b border-[#E1E9FF]">
              <div className="flex flex-wrap items-end gap-3">
                {/* Assigned Class Selector */}
                {teacherAssignments.length > 1 ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                      {language === 'ku' ? 'پۆلێن تە' : language === 'ar' ? 'صفوفك المخصصة' : 'Your Classes'}
                    </label>
                    <select
                      value={`${scopedGrade}|${scopedClass}`}
                      onChange={(e) => {
                        const [nextGrade, nextSection] = e.target.value.split('|');
                        setStaffGrade(nextGrade);
                        setStaffClass(nextSection);
                        const matchAssign = teacherAssignments.find(
                          (a) => a.grade === nextGrade && a.section === nextSection
                        );
                        if (matchAssign && !matchAssign.subjects.includes(teacherSubject)) {
                          setTeacherSubject(matchAssign.subjects[0] || '');
                        }
                        setTeacherSavedNotice(false);
                      }}
                      className="bg-[#F0F8FA] border border-[#C8E5EC] rounded-xl px-3.5 py-2 text-xs font-black text-[#0D2D35] focus:outline-none focus:ring-2 focus:ring-[#0087A5] min-w-[200px]"
                    >
                      {teacherAssignments.map((assign) => (
                        <option key={`${assign.grade}|${assign.section}`} value={`${assign.grade}|${assign.section}`}>
                          {formatGradeLabel(assign.grade, language)} — {formatClassLabel(assign.section, language)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                      {language === 'ku' ? 'پۆلا تە' : language === 'ar' ? 'صفك المخصص' : 'Assigned Class'}
                    </label>
                    <div className="inline-flex items-center gap-2 bg-[#F0F8FA] border border-[#C8E5EC] rounded-xl px-3.5 py-2 text-xs font-black text-[#0D2D35]">
                      <Lock className="w-3.5 h-3.5 text-[#0087A5]" />
                      <span>
                        {formatGradeLabel(scopedGrade, language)} — {formatClassLabel(scopedClass, language)} ({scopedClassStudents.length})
                      </span>
                    </div>
                  </div>
                )}

                {/* Assigned Subject Selector (strictly assigned subjects only) */}
                {allowedSubjects.length > 1 ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                      {t.subject}
                    </label>
                    <select
                      value={scopedSubject}
                      onChange={(e) => {
                        setTeacherSubject(e.target.value);
                        setTeacherSavedNotice(false);
                      }}
                      className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3.5 py-2 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#0087A5] min-w-[170px]"
                    >
                      {allowedSubjects.map((subName) => (
                        <option key={subName} value={subName}>
                          {getTranslatedSubject(subName, language)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                      {t.subject}
                    </label>
                    <div className="inline-flex items-center gap-2 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3.5 py-2 text-xs font-black text-[#1A1D4E]">
                      <span>{scopedSubject ? getTranslatedSubject(scopedSubject, language) : '—'}</span>
                    </div>
                  </div>
                )}

                {/* Student Search within assigned class */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                    {language === 'ku' ? 'گەڕان ل قوتابی' : language === 'ar' ? 'بحث عن طالب' : 'Search Student'}
                  </label>
                  <div className="relative">
                    <Search className={`w-3.5 h-3.5 text-[#8C90C2] absolute top-2.5 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <input
                      type="text"
                      value={staffSearchQuery}
                      onChange={(e) => setStaffSearchQuery(e.target.value)}
                      placeholder={language === 'ku' ? 'ناڤ یان کۆد...' : language === 'ar' ? 'الاسم أو الرقم...' : 'Name or ID...'}
                      className={`py-2 bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl text-xs w-44 text-[#1A1D4E] placeholder:text-[#A9ABD2] focus:outline-none focus:ring-2 focus:ring-[#0087A5] ${
                        isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {teacherSyncStatus === 'saving' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F0F8FA] border border-[#C8E5EC] text-[#0087A5] text-xs font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {language === 'ku'
                        ? 'پاشەکەفتکرن ل ناڤ داتابەیسێ...'
                        : language === 'ar'
                        ? 'جاري الحفظ في قاعدة البيانات...'
                        : 'Saving to Database...'}
                    </span>
                  </span>
                )}
                {(teacherSavedNotice || teacherSyncStatus === 'saved') && teacherSyncStatus !== 'saving' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {language === 'ku'
                        ? 'نمرە ل ناڤ داتابەیسێ هاتنە تۆمارکرن'
                        : language === 'ar'
                        ? 'تم حفظ الدرجات في قاعدة البيانات'
                        : `Saved to Database${teacherLastDbSyncAt ? ` (${new Date(teacherLastDbSyncAt).toLocaleTimeString()})` : ''}`}
                    </span>
                  </span>
                )}
                {teacherSyncStatus === 'error' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold max-w-xs truncate" title={teacherSyncError}>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {teacherSyncError || 'Database sync error'}
                    </span>
                  </span>
                )}
                <button
                  type="button"
                  disabled={teacherSyncStatus === 'saving' || !scopedSubject}
                  onClick={handleTeacherSaveAll}
                  className="px-4 py-2.5 bg-[#0087A5] hover:bg-[#00738D] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(0,135,165,0.3)] flex items-center gap-2 cursor-pointer"
                >
                  {teacherSyncStatus === 'saving' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {language === 'ku' ? 'پاشەکەفتکرنا نمران' : language === 'ar' ? 'حفظ الدرجات' : 'Save Marks'}
                  </span>
                </button>
              </div>
            </div>

            {/* Assigned Subject & Class Marks Table ONLY */}
            {scopedSubject ? (() => {
              const isPrimaryG13 = isGrade13(scopedGrade);
              const rows: DailyRecordRowItem[] = scopedFilteredStudents.map((student) => ({
                rowKey: student.id,
                label: student.name,
                subLabel: `${student.rollNumber} • ${student.id}`,
                record: getEffectiveDailyRecord(student, scopedSubject, dailyRecords),
              }));

              return isPrimaryG13 ? (
                <Grade13DailyRecordTable
                  mode="teacher"
                  language={language}
                  isRtl={isRtl}
                  gradeLabel={formatGradeLabel(scopedGrade, language)}
                  sectionLabel={formatClassLabel(scopedClass, language)}
                  subjectLabel={getTranslatedSubject(scopedSubject, language)}
                  rows={rows}
                  onChangeRecord={(studentId, updated) =>
                    handleTeacherRecordChange(studentId, updated, scopedSubject)
                  }
                />
              ) : (
                <Grade49DailyRecordTable
                  mode="teacher"
                  language={language}
                  isRtl={isRtl}
                  gradeLabel={formatGradeLabel(scopedGrade, language)}
                  sectionLabel={formatClassLabel(scopedClass, language)}
                  subjectLabel={getTranslatedSubject(scopedSubject, language)}
                  rows={rows}
                  onChangeRecord={(studentId, updated) =>
                    handleTeacherRecordChange(studentId, updated, scopedSubject)
                  }
                />
              );
            })() : (
              <div className="p-6 text-center text-xs text-[#6B70A6] bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                No assigned subject configured for this class.
              </div>
            )}
          </div>
          )}

          {/* MODE B: Class Mentor Behaviour Report Entry (ONLY for this Mentor's single assigned class) */}
          {mentorClass && activeView === 'behaviour' && (
          <div className="bg-white border border-[#E1E9FF] rounded-3xl p-4 sm:p-6 shadow-[0_6px_20px_rgba(91,53,168,0.06)] space-y-5">
            {/* Locked Mentored Class Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#E1E9FF] print:hidden">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                    {language === 'ku' ? 'پۆلا تە وەک ڕابەر' : language === 'ar' ? 'صف الإرشاد المخصص' : 'Mentored Class'}
                  </label>
                  <div className="inline-flex items-center gap-2 bg-[#F3EEFF] border border-[#BB8FFF]/50 rounded-xl px-3.5 py-2 text-xs font-black text-[#5B35A8]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {mentorClass.classCode} — {formatGradeLabel(mentorClass.grade, language)} {formatClassLabel(mentorClass.section, language)} ({mentorStudents.length})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                    {language === 'ku' ? 'قوتابی' : language === 'ar' ? 'الطالب' : 'Student'}
                  </label>
                  <select
                    value={activeMentorStudent?.id || ''}
                    onChange={(e) => {
                      setMentorBehStudentId(e.target.value);
                      setMentorBehDraft(null);
                      setMentorBehMessage(null);
                    }}
                    className="bg-[#F5F6FF] border border-[#E1E9FF] rounded-xl px-3 py-2 text-xs font-bold text-[#1A1D4E] focus:outline-none focus:ring-2 focus:ring-[#5B35A8] min-w-[220px]"
                  >
                    {mentorStudents.map((st) => {
                      const hasSaved = Boolean(
                        behaviourReports[makeBehaviourReportKey(st.id, mentorBehMonthKey)]
                      );
                      return (
                        <option key={st.id} value={st.id}>
                          {hasSaved ? '✓ ' : ''}
                          {st.name} ({st.rollNumber})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C90C2] mb-1">
                    {language === 'ku' ? 'هەیڤ' : language === 'ar' ? 'الشهر' : 'Month'}
                  </label>
                  <select
                    value={mentorBehMonthKey}
                    onChange={(e) => {
                      setMentorBehMonthKey(e.target.value);
                      setMentorBehDraft(null);
                      setMentorBehMessage(null);
                    }}
                    className="bg-[#F0F8FA] border border-[#C8E5EC] rounded-xl px-3 py-2 text-xs font-black text-[#0087A5] focus:outline-none focus:ring-2 focus:ring-[#0087A5]"
                  >
                    {BEHAVIOUR_MONTHS.map((m) => {
                      const hasSaved = activeMentorStudent
                        ? Boolean(
                            behaviourReports[makeBehaviourReportKey(activeMentorStudent.id, m.key)]
                          )
                        : false;
                      return (
                        <option key={m.key} value={m.key}>
                          {hasSaved ? '✓ ' : ''}
                          {language === 'ku'
                            ? m.labelKu
                            : language === 'ar'
                            ? m.labelAr
                            : m.labelEn}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {currentMentorReport && (
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F6FF] border border-[#E1E9FF] text-xs font-bold text-[#1A1D4E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentMentorReport.published}
                      onChange={(e) =>
                        setMentorBehDraft({
                          ...currentMentorReport,
                          published: e.target.checked,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className="rounded text-[#00A887] focus:ring-[#00A887]"
                    />
                    <span>
                      {language === 'ku'
                        ? 'بەردەستە بۆ سەرپەرشتیاران'
                        : language === 'ar'
                        ? 'منشور لأولياء الأمور'
                        : 'Visible to Parents'}
                    </span>
                  </label>
                )}

                <button
                  type="button"
                  disabled={!activeMentorStudent || mentorBehDownloadingPdf}
                  onClick={handleMentorDownloadBehaviourPdf}
                  className="px-3.5 py-2 rounded-xl bg-[#0087A5] hover:bg-[#00738D] disabled:opacity-60 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {mentorBehDownloadingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {mentorBehDownloadingPdf
                      ? language === 'ku'
                        ? 'دروستکرنا PDF...'
                        : language === 'ar'
                        ? 'جاري إنشاء PDF...'
                        : 'Generating PDF...'
                      : language === 'ku'
                      ? 'داگرتنا PDF'
                      : language === 'ar'
                      ? 'حفظ PDF'
                      : 'Save PDF'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!activeMentorStudent}
                  onClick={() => printBehaviourReport('printable-behaviour')}
                  className="px-3.5 py-2 rounded-xl bg-[#F5F6FF] hover:bg-[#E1E9FF] border border-[#E1E9FF] text-xs font-bold text-[#1A1D4E] flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#0087A5]" />
                  <span>{language === 'ku' ? 'چاپکرنا A4' : language === 'ar' ? 'طباعة A4' : 'Print A4'}</span>
                </button>

                <button
                  type="button"
                  disabled={mentorBehSaving || !currentMentorReport}
                  onClick={handleMentorSaveBehaviourReport}
                  className="px-4 py-2 rounded-xl bg-[#00A887] hover:bg-[#008E72] disabled:opacity-60 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {mentorBehSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {language === 'ku'
                      ? 'پاشەکەفتکرنا راپۆرتا هەیڤانە'
                      : language === 'ar'
                      ? 'حفظ التقرير الشهري'
                      : 'Save Monthly Report'}
                  </span>
                </button>
              </div>
            </div>

            {mentorBehMessage && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                  mentorBehMessage.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {mentorBehMessage.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{mentorBehMessage.text}</span>
              </div>
            )}

            {activeMentorStudent && currentMentorReport ? (
              <BehaviourReportCard
                mode="edit"
                report={currentMentorReport}
                studentName={activeMentorStudent.name}
                gradeLabel={formatGradeLabel(activeMentorStudent.grade, language)}
                sectionLabel={formatClassLabel(activeMentorStudent.section, language)}
                schoolLogoUrl={SCHOOL_LOGO_URL}
                language={language}
                onChangeReport={(next) => {
                  setMentorBehDraft(next);
                  setMentorBehMessage(null);
                }}
              />
            ) : (
              <div className="p-8 text-center text-xs text-[#6B70A6] bg-[#F5F6FF] rounded-2xl border border-[#E1E9FF]">
                No students found in {mentorClass.grade} — {mentorClass.section}.
              </div>
            )}
          </div>
          )}
        </main>
        );
      })()}

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
            <FoodMenuView
              language={language}
              title={t.foodMenuTitle}
              subtitle={t.foodMenuSubtitle}
            />
          )}
        </main>
      )}

      {/* ======================================================== */}
      {/* VIEW 5: ADMIN PANEL PORTAL (AUTHENTICATED)               */}
      {/* ======================================================== */}
      {selectedPortal === 'admin' && isPortalAuthenticated && authStaff && authStaff.role === 'admin' && (
        <AdminSummaryPanel
          students={students}
          dailyRecords={dailyRecords}
          schoolStructure={SCHOOL_STRUCTURE}
          gradeCurriculum={GRADE_CURRICULUM}
          officialSubjects={OFFICIAL_SUBJECTS}
          liveBuses={liveBuses}
          wsConnected={wsConnected}
          language={language}
          isRtl={isRtl}
          onSelectModalStudent={(s) => setModalStudent(s)}
          onUpdateStudentClass={handleUpdateStudentClass}
          examRows={examRows}
          onUpdateExamCell={handleUpdateExamCell}
          onResetExamSchedule={handleResetExamSchedule}
          schoolLogoUrl={SCHOOL_LOGO_URL}
          behaviourReports={behaviourReports}
          onExportStudentsCsv={handleExportCsv}
          onSignOut={handleSignOut}
        />
      )}

      {/* ======================================================== */}
      {/* VIEW 6: BUS DRIVER PORTAL (AUTHENTICATED)                */}
      {/* ======================================================== */}
      {selectedPortal === 'driver' && isPortalAuthenticated && authDriver && (
        <DriverPortal
          driver={authDriver}
          busState={liveBuses[authDriver.id] || null}
          wsConnected={wsConnected}
          language={language}
          isRtl={isRtl}
          onStartTrip={startTrip}
          onStopTrip={stopTrip}
          onSendLocation={sendLocation}
          onUpdateStudentStatus={updateStudentStatus}
          onResetStatuses={resetStatuses}
          onSignOut={handleSignOut}
          onOpenMobileRoute={() => navigateTo('/driver')}
        />
      )}

      {/* ======================================================== */}
      {/* UNIVERSAL MARKSHEET MODAL (FOR TEACHER / STAFF / ADMIN)  */}
      {/* ======================================================== */}
      {modalStudent && (() => {
        const isTeacherScope = selectedPortal === 'teacher' || authStaff?.role === 'teacher';
        const teacherClassAssignment = isTeacherScope
          ? authStaff?.assignedClasses?.find(
              (a) => a.grade === modalStudent.grade && a.section === modalStudent.section
            )
          : undefined;
        const allowedTeacherSubjects = isTeacherScope
          ? teacherClassAssignment?.subjects || []
          : [];
        const allowedSubjectLabel = allowedTeacherSubjects
          .map((sub) => getTranslatedSubject(sub, language))
          .join(', ');

        const curriculum = GRADE_CURRICULUM[modalStudent.grade] || OFFICIAL_SUBJECTS;
        const scopedCurriculum = isTeacherScope
          ? curriculum.filter((cSub) =>
              allowedTeacherSubjects.some(
                (sub) => sub.toLowerCase() === cSub.name.toLowerCase()
              )
            )
          : curriculum;

        const isG13 = isGrade13(modalStudent.grade);
        const rows: DailyRecordRowItem[] = scopedCurriculum.map((cSub) => ({
          rowKey: cSub.name,
          label: getTranslatedSubject(cSub.name, language),
          record: getEffectiveDailyRecord(modalStudent, cSub.name, dailyRecords),
        }));

        return (
        <div className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#E1E9FF] rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,135,165,0.25)] relative space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E1E9FF]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1D4E]">
                  {modalStudent.name} •{' '}
                  {isTeacherScope && allowedSubjectLabel
                    ? `${allowedSubjectLabel} ${language === 'ku' ? 'کەشف نمرە' : language === 'ar' ? 'كشف الدرجات' : 'Subject Marksheet'}`
                    : t.studentMarksheetTitle}
                </h3>
                <p className="text-xs text-[#6B70A6]">
                  {formatGradeLabel(modalStudent.grade, language)} - {formatClassLabel(modalStudent.section, language)} • Roll No: {modalStudent.rollNumber} • ID: {modalStudent.id}
                </p>
                {isTeacherScope && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#E1F3F7] text-[#006F89] text-[11px] font-bold">
                      <Lock className="w-3 h-3" />
                      <span>
                        {language === 'ku'
                          ? `بتنێ بابەت و پۆلا تە: ${allowedSubjectLabel || '-'}`
                          : language === 'ar'
                          ? `مادتك وصفك المخصص فقط: ${allowedSubjectLabel || '-'}`
                          : `Assigned Subject & Class Only: ${allowedSubjectLabel || '-'}`}
                      </span>
                    </span>
                  </div>
                )}
                {authStaff?.role === 'admin' && modalStudent.guardianPassword && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#E1F3F7] text-[#006F89] font-mono text-[11px] font-bold">
                      <KeyRound className="w-3 h-3" />
                      <span>
                        {language === 'ku' ? 'پاسوۆرد:' : language === 'ar' ? 'كلمة المرور:' : 'Password:'}{' '}
                        {modalStudent.guardianPassword}
                      </span>
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setModalStudent(null)}
                className="w-8 h-8 rounded-full bg-[#F5F6FF] hover:bg-[#E1E9FF] flex items-center justify-center text-[#0087A5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official Daily Student Record Marksheet */}
            {rows.length === 0 && isTeacherScope ? (
              <div className="p-6 text-center rounded-2xl bg-[#F5F6FF] border border-[#E1E9FF] text-xs font-bold text-[#454A87]">
                {language === 'ku'
                  ? 'ئەڤ قوتابیە نە د پۆل و بابەتێ تە یێ دیارکری دایە.'
                  : language === 'ar'
                  ? 'هذا الطالب غير مسجل ضمن صفك ومادتك المخصصة.'
                  : 'This student is not within your assigned class and subject.'}
              </div>
            ) : isG13 ? (
              <Grade13DailyRecordTable
                mode="student"
                language={language}
                isRtl={isRtl}
                gradeLabel={formatGradeLabel(modalStudent.grade, language)}
                sectionLabel={formatClassLabel(modalStudent.section, language)}
                subjectLabel={isTeacherScope ? allowedSubjectLabel : undefined}
                rows={rows}
              />
            ) : (
              <Grade49DailyRecordTable
                mode="student"
                language={language}
                isRtl={isRtl}
                gradeLabel={formatGradeLabel(modalStudent.grade, language)}
                sectionLabel={formatClassLabel(modalStudent.section, language)}
                subjectLabel={isTeacherScope ? allowedSubjectLabel : undefined}
                rows={rows}
              />
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E1E9FF]">
              <button
                onClick={() => setModalStudent(null)}
                className="px-4 py-2 bg-[#F5F6FF] hover:bg-[#E1E9FF] text-[#0087A5] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'ku' ? 'داخستن' : language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Footer */}
      <footer className="w-full border-t border-[#E1E9FF] py-6 px-4 text-center text-xs text-[#8C90C2] bg-white">
        <p className="font-semibold text-[#454A87]">
          {t.schoolName} •{' '}
          {selectedPortal === 'admin'
            ? language === 'ku'
              ? 'پۆڕتاڵێ ئەدمین'
              : language === 'ar'
              ? 'بوابة الإدارة'
              : 'Admin Portal'
            : selectedPortal === 'driver'
            ? language === 'ku'
              ? 'پۆڕتاڵێ شۆفێران'
              : language === 'ar'
              ? 'بوابة السائقين'
              : 'Driver Portal'
            : selectedPortal === 'teacher'
            ? t.portalTeacher
            : t.portalParent}
        </p>
        <p className="mt-1 text-[11px] text-[#A9ABD2]">
          {selectedPortal === 'admin'
            ? language === 'ku'
              ? 'پوختەیا گشتی و چاڤدێریا قوتابخانێ • قوتابخانەیا داسنیا یا تایبەت'
              : language === 'ar'
              ? 'لوحة الإدارة والملخص الشامل • مدرسة داسنيا الأهلية'
              : 'Official Admin Panel & Academic Summary • Dasinya Private School'
            : selectedPortal === 'driver'
            ? language === 'ku'
              ? 'سیستەمێ چاڤدێریا زیندوو یا باسێن قوتابیان • قوتابخانەیا داسنیا یا تایبەت'
              : language === 'ar'
              ? 'نظام التتبع المباشر لحافلات المدرسة • مدرسة داسنيا الأهلية'
              : 'Live School Bus Tracking Portal • Dasinya Private School'
            : selectedPortal === 'teacher'
            ? language === 'ku'
              ? 'دەروازەیا فەرمی یا مامۆستایان • قوتابخانەیا داسنیا یا تایبەت'
              : language === 'ar'
              ? 'البوابة الرسمية للمعلمين • مدرسة داسنيا الأهلية'
              : 'Official Teacher Portal System • Dasinya Private School'
            : language === 'ku'
            ? 'سیستەمێ فەرمی یێ دەوازەیا دایکوبابان • قوتابخانەیا داسنیا یا تایبەت'
            : language === 'ar'
            ? 'البوابة الرسمية لأولياء الأمور • مدرسة داسنيا الأهلية'
            : 'Official Parents Portal System • Dasinya Private School'}
        </p>
      </footer>
    </div>
  );
}
