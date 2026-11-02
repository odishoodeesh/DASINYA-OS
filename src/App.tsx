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
  Plus,
  BookOpen
} from 'lucide-react';
import { supabase, fetchStudentsFromSupabase, checkSupabaseConnection } from './lib/supabase';

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

// Initial cohort tailored to the school's 1-9 grades and classes
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
    subjects: [
      { subject: 'English Reading & Phonics', code: 'ENG-01', maxMarks: 100, obtainedMarks: 97, grade: 'A+', remarks: 'Fluent reading and enthusiastic participation' },
      { subject: 'Elementary Mathematics', code: 'MTH-01', maxMarks: 100, obtainedMarks: 99, grade: 'A+', remarks: 'Exceptional number counting and addition' },
      { subject: 'Environmental Studies', code: 'ENV-01', maxMarks: 100, obtainedMarks: 94, grade: 'A+', remarks: 'Keen observer of nature and science' },
      { subject: 'Arts & Creative Craft', code: 'ART-01', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Vibrant coloring and fine motor skills' },
      { subject: 'Physical Education & Play', code: 'PED-01', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Great teamwork and energy' },
    ]
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
    subjects: [
      { subject: 'English Reading & Phonics', code: 'ENG-01', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Excellent storytelling & spelling' },
      { subject: 'Elementary Mathematics', code: 'MTH-01', maxMarks: 100, obtainedMarks: 92, grade: 'A', remarks: 'Strong visual problem solving' },
      { subject: 'Environmental Studies', code: 'ENV-01', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Very inquisitive in class activities' },
      { subject: 'Arts & Creative Craft', code: 'ART-01', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Delightful drawing skills' },
      { subject: 'Physical Education & Play', code: 'PED-01', maxMarks: 100, obtainedMarks: 94, grade: 'A', remarks: 'Very active and supportive teammate' },
    ]
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
    subjects: [
      { subject: 'English Reading & Phonics', code: 'ENG-01', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Clear pronunciation and vocabulary' },
      { subject: 'Elementary Mathematics', code: 'MTH-01', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Quick mental arithmetic' },
      { subject: 'Environmental Studies', code: 'ENV-01', maxMarks: 100, obtainedMarks: 91, grade: 'A', remarks: 'Loves plant and animal topics' },
      { subject: 'Arts & Creative Craft', code: 'ART-01', maxMarks: 100, obtainedMarks: 90, grade: 'A', remarks: 'Great creativity' },
      { subject: 'Physical Education & Play', code: 'PED-01', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Active sportsmanship' },
    ]
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
    subjects: [
      { subject: 'English Reading & Phonics', code: 'ENG-01', maxMarks: 100, obtainedMarks: 99, grade: 'A+', remarks: 'Superb reader and communicator' },
      { subject: 'Elementary Mathematics', code: 'MTH-01', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Very neat arithmetic exercises' },
      { subject: 'Environmental Studies', code: 'ENV-01', maxMarks: 100, obtainedMarks: 97, grade: 'A+', remarks: 'Eager and polite participant' },
      { subject: 'Arts & Creative Craft', code: 'ART-01', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Exceptional craft and sketch work' },
      { subject: 'Physical Education & Play', code: 'PED-01', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Great agility and cooperation' },
    ]
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
    subjects: [
      { subject: 'English Grammar & Writing', code: 'ENG-02', maxMarks: 100, obtainedMarks: 94, grade: 'A+', remarks: 'Rich vocabulary and neat handwriting' },
      { subject: 'Mathematics & Geometry Basics', code: 'MTH-02', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Excellent understanding of multiplication' },
      { subject: 'General Science', code: 'SCI-02', maxMarks: 100, obtainedMarks: 93, grade: 'A', remarks: 'Understands ecosystems and weather well' },
      { subject: 'Social Studies & Civics', code: 'SOC-02', maxMarks: 100, obtainedMarks: 92, grade: 'A', remarks: 'Good grasp of community roles' },
      { subject: 'Art & Design', code: 'ART-02', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Creative expressions' },
    ]
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
    subjects: [
      { subject: 'English Grammar & Writing', code: 'ENG-02', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Expressive composition' },
      { subject: 'Mathematics & Geometry Basics', code: 'MTH-02', maxMarks: 100, obtainedMarks: 94, grade: 'A', remarks: 'Very dependable problem solver' },
      { subject: 'General Science', code: 'SCI-02', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Loves science experiments' },
      { subject: 'Social Studies & Civics', code: 'SOC-02', maxMarks: 100, obtainedMarks: 93, grade: 'A', remarks: 'Insightful thoughts' },
      { subject: 'Art & Design', code: 'ART-02', maxMarks: 100, obtainedMarks: 97, grade: 'A+', remarks: 'Talented young artist' },
    ]
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
    subjects: [
      { subject: 'English Grammar & Writing', code: 'ENG-02', maxMarks: 100, obtainedMarks: 92, grade: 'A', remarks: 'Good sentence construction' },
      { subject: 'Mathematics & Geometry Basics', code: 'MTH-02', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Great calculation speed' },
      { subject: 'General Science', code: 'SCI-02', maxMarks: 100, obtainedMarks: 90, grade: 'A', remarks: 'Keen curiosity' },
      { subject: 'Social Studies & Civics', code: 'SOC-02', maxMarks: 100, obtainedMarks: 91, grade: 'A', remarks: 'Attentive and disciplined' },
      { subject: 'Art & Design', code: 'ART-02', maxMarks: 100, obtainedMarks: 93, grade: 'A', remarks: 'Very neat projects' },
    ]
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
    subjects: [
      { subject: 'English Language & Reading', code: 'ENG-03', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Superior narrative writing' },
      { subject: 'Mathematics', code: 'MTH-03', maxMarks: 100, obtainedMarks: 97, grade: 'A+', remarks: 'High accuracy in division & fractions' },
      { subject: 'Primary Science', code: 'SCI-03', maxMarks: 100, obtainedMarks: 94, grade: 'A+', remarks: 'Thorough science fair project' },
      { subject: 'Social Studies & History', code: 'SOC-03', maxMarks: 100, obtainedMarks: 92, grade: 'A', remarks: 'Strong memory of timeline events' },
      { subject: 'Computer Basics & Logic', code: 'CMP-03', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Quick learner with computers' },
    ]
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
    subjects: [
      { subject: 'English Language & Reading', code: 'ENG-03', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Beautiful creative writing' },
      { subject: 'Mathematics', code: 'MTH-03', maxMarks: 100, obtainedMarks: 93, grade: 'A', remarks: 'Diligent problem solving' },
      { subject: 'Primary Science', code: 'SCI-03', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Insightful deductions in lab' },
      { subject: 'Social Studies & History', code: 'SOC-03', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Active leadership in group work' },
      { subject: 'Computer Basics & Logic', code: 'CMP-03', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Great typing and algorithmic skills' },
    ]
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
    subjects: [
      { subject: 'English Literature & Grammar', code: 'ENG-04', maxMarks: 100, obtainedMarks: 93, grade: 'A', remarks: 'Clear and structured paragraphs' },
      { subject: 'Intermediate Mathematics', code: 'MTH-04', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Top scores in geometry & word problems' },
      { subject: 'Natural Science', code: 'SCI-04', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Passionate about environmental biology' },
      { subject: 'World Geography & Culture', code: 'GEO-04', maxMarks: 100, obtainedMarks: 92, grade: 'A', remarks: 'Accurate map drawing and notes' },
      { subject: 'Computer Applications', code: 'CMP-04', maxMarks: 100, obtainedMarks: 97, grade: 'A+', remarks: 'Confident with digital tools' },
    ]
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
    subjects: [
      { subject: 'English Literature & Grammar', code: 'ENG-04', maxMarks: 100, obtainedMarks: 97, grade: 'A+', remarks: 'Outstanding reading comprehension' },
      { subject: 'Intermediate Mathematics', code: 'MTH-04', maxMarks: 100, obtainedMarks: 94, grade: 'A', remarks: 'Methodical and precise calculations' },
      { subject: 'Natural Science', code: 'SCI-04', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Excellent project presentation' },
      { subject: 'World Geography & Culture', code: 'GEO-04', maxMarks: 100, obtainedMarks: 94, grade: 'A', remarks: 'Knowledgeable about continents and climate' },
      { subject: 'Computer Applications', code: 'CMP-04', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Solid understanding of software basics' },
    ]
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
    subjects: [
      { subject: 'Advanced English & Rhetoric', code: 'ENG-05', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Superb argumentative essays' },
      { subject: 'Applied Mathematics', code: 'MTH-05', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Top in algebraic concepts & percentages' },
      { subject: 'Integrated Science', code: 'SCI-05', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Strong empirical reasoning' },
      { subject: 'Global Social Studies', code: 'SOC-05', maxMarks: 100, obtainedMarks: 93, grade: 'A', remarks: 'Engaged and respectful discussions' },
      { subject: 'Introductory Programming', code: 'CMP-05', maxMarks: 100, obtainedMarks: 99, grade: 'A+', remarks: 'Excellent Scratch & Python basics' },
    ]
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
    subjects: [
      { subject: 'Advanced English & Rhetoric', code: 'ENG-05', maxMarks: 100, obtainedMarks: 94, grade: 'A', remarks: 'Creative writing award recipient' },
      { subject: 'Applied Mathematics', code: 'MTH-05', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Fast and accurate calculations' },
      { subject: 'Integrated Science', code: 'SCI-05', maxMarks: 100, obtainedMarks: 92, grade: 'A', remarks: 'Very inquisitive in lab practicals' },
      { subject: 'Global Social Studies', code: 'SOC-05', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Thorough historical research' },
      { subject: 'Introductory Programming', code: 'CMP-05', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Great algorithmic thinking' },
    ]
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
    subjects: [
      { subject: 'English Literature', code: 'ENG-06', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Deep textual interpretation' },
      { subject: 'Pre-Algebra & Geometry', code: 'MTH-06', maxMarks: 100, obtainedMarks: 97, grade: 'A+', remarks: 'Outstanding logical formulations' },
      { subject: 'General Science (Physics/Chemistry)', code: 'SCI-06', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Superior experimental accuracy' },
      { subject: 'History & Civics', code: 'HIS-06', maxMarks: 100, obtainedMarks: 92, grade: 'A', remarks: 'Well-researched seminar presentation' },
      { subject: 'Computer Science', code: 'CSC-06', maxMarks: 100, obtainedMarks: 99, grade: 'A+', remarks: 'Exceptional coding prowess' },
    ]
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
    subjects: [
      { subject: 'English Literature', code: 'ENG-06', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Eloquent writing and analysis' },
      { subject: 'Pre-Algebra & Geometry', code: 'MTH-06', maxMarks: 100, obtainedMarks: 93, grade: 'A', remarks: 'Very neat proofs and algebra' },
      { subject: 'General Science (Physics/Chemistry)', code: 'SCI-06', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Accurate data logging in lab' },
      { subject: 'History & Civics', code: 'HIS-06', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Great insight into ancient governance' },
      { subject: 'Computer Science', code: 'CSC-06', maxMarks: 100, obtainedMarks: 94, grade: 'A', remarks: 'Creative project work' },
    ]
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
    subjects: [
      { subject: 'English Literature & Composition', code: 'ENG-07', maxMarks: 100, obtainedMarks: 94, grade: 'A+', remarks: 'Sharp critique and rich syntax' },
      { subject: 'Algebra I', code: 'MTH-07', maxMarks: 100, obtainedMarks: 99, grade: 'A+', remarks: 'Flawless quadratic and linear equations' },
      { subject: 'Life Science & Biology', code: 'BIO-07', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Outstanding cellular biology diagrams' },
      { subject: 'Physical Science', code: 'PHY-07', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Strong mathematical modeling' },
      { subject: 'Computer Science & Python', code: 'CSC-07', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Constructed custom math algorithms' },
    ]
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
    subjects: [
      { subject: 'English Literature & Composition', code: 'ENG-07', maxMarks: 100, obtainedMarks: 97, grade: 'A+', remarks: 'Top literary essay in grade' },
      { subject: 'Algebra I', code: 'MTH-07', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Very methodical and accurate' },
      { subject: 'Life Science & Biology', code: 'BIO-07', maxMarks: 100, obtainedMarks: 97, grade: 'A+', remarks: 'Deep understanding of genetics' },
      { subject: 'Physical Science', code: 'PHY-07', maxMarks: 100, obtainedMarks: 92, grade: 'A', remarks: 'Good grasp of thermodynamics' },
      { subject: 'Computer Science & Python', code: 'CSC-07', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Clean code conventions' },
    ]
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
    subjects: [
      { subject: 'Advanced English & Rhetoric', code: 'ENG-08', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'High literary maturity and debate' },
      { subject: 'Algebra & Coordinate Geometry', code: 'MTH-08', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Exceptional geometric derivations' },
      { subject: 'Physics & Chemistry', code: 'SCI-08', maxMarks: 100, obtainedMarks: 97, grade: 'A+', remarks: 'Superb lab deductions & reports' },
      { subject: 'World History & Modern Politics', code: 'HIS-08', maxMarks: 100, obtainedMarks: 94, grade: 'A', remarks: 'Comprehensive essay compositions' },
      { subject: 'Computer Programming & Systems', code: 'CSC-08', maxMarks: 100, obtainedMarks: 100, grade: 'A+', remarks: 'Remarkable software project' },
    ]
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
    subjects: [
      { subject: 'Advanced English & Rhetoric', code: 'ENG-08', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Top prose and thesis defense' },
      { subject: 'Algebra & Coordinate Geometry', code: 'MTH-08', maxMarks: 100, obtainedMarks: 94, grade: 'A', remarks: 'Consistently high quiz scores' },
      { subject: 'Physics & Chemistry', code: 'SCI-08', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Detailed chemical reactions analysis' },
      { subject: 'World History & Modern Politics', code: 'HIS-08', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Eloquent debate participant' },
      { subject: 'Computer Programming & Systems', code: 'CSC-08', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Strong structured coding' },
    ]
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
    subjects: [
      { subject: 'Foundation Mathematics', code: 'MTH-091', maxMarks: 100, obtainedMarks: 98, grade: 'A+', remarks: 'Superior analytical reasoning' },
      { subject: 'English Language & Literature', code: 'ENG-092', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Insightful critical reading' },
      { subject: 'Integrated Science', code: 'SCI-093', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Top laboratory investigation' },
      { subject: 'Social Studies & Civics', code: 'SOC-094', maxMarks: 100, obtainedMarks: 92, grade: 'A', remarks: 'Strong grasp of political systems' },
      { subject: 'Information Technology', code: 'ITC-095', maxMarks: 100, obtainedMarks: 99, grade: 'A+', remarks: 'Mastery of algorithms and databases' },
      { subject: 'Environmental Studies', code: 'ENV-096', maxMarks: 100, obtainedMarks: 94, grade: 'A', remarks: 'Creative sustainable solutions' },
    ]
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
    subjects: [
      { subject: 'Foundation Mathematics', code: 'MTH-091', maxMarks: 100, obtainedMarks: 94, grade: 'A', remarks: 'Very neat and logical steps' },
      { subject: 'English Language & Literature', code: 'ENG-092', maxMarks: 100, obtainedMarks: 99, grade: 'A+', remarks: 'Highest score in language composition' },
      { subject: 'Integrated Science', code: 'SCI-093', maxMarks: 100, obtainedMarks: 95, grade: 'A+', remarks: 'Outstanding physics and chemistry lab work' },
      { subject: 'Social Studies & Civics', code: 'SOC-094', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Thorough historical research papers' },
      { subject: 'Information Technology', code: 'ITC-095', maxMarks: 100, obtainedMarks: 96, grade: 'A+', remarks: 'Very methodical and clean coding' },
      { subject: 'Environmental Studies', code: 'ENV-096', maxMarks: 100, obtainedMarks: 97, grade: 'A+', remarks: 'Excellent project leadership' },
    ]
  }
];

export default function App() {
  const [view, setView] = useState<'home' | 'marksheets'>('home');
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [hasSupabaseTable, setHasSupabaseTable] = useState<boolean>(false);
  const [showDbModal, setShowDbModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);

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

  // Check Supabase on mount
  useEffect(() => {
    async function initDb() {
      setIsLoadingDb(true);
      const res = await checkSupabaseConnection();
      setIsSupabaseConnected(res.connected);
      setHasSupabaseTable(res.hasTables);

      if (res.connected && res.hasTables) {
        const rows = await fetchStudentsFromSupabase();
        if (rows && rows.length > 0) {
          const mapped: StudentRecord[] = rows.map(r => ({
            id: r.id,
            name: r.name,
            rollNumber: r.roll_number,
            grade: r.grade,
            section: r.section,
            gender: r.gender || 'Not Specified',
            attendance: r.attendance || '98%',
            classRank: r.class_rank || 'N/A',
            term: r.term || 'Second Term Assessment',
            academicYear: r.academic_year || '2025 - 2026',
            conduct: r.conduct || 'Very Good',
            classTeacher: r.class_teacher || 'Faculty Advisor',
            subjects: r.subjects || []
          }));
          setStudents(mapped);
        }
      }
      setIsLoadingDb(false);
    }
    initDb();
  }, []);

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

  // Calculate totals and percentage
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
          <div className="w-9 h-9 border border-neutral-200 rounded-md flex items-center justify-center bg-neutral-50 text-neutral-900 group-hover:border-neutral-900 transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-wider uppercase text-neutral-900 group-hover:text-neutral-700 transition-colors">
              Dasinya Private School
            </h1>
            <p className="text-[11px] text-neutral-400">Grades 1 – 9 &bull; Academic Portal</p>
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
          <div className="w-16 h-16 rounded-full border border-neutral-200 bg-neutral-50 flex items-center justify-center text-neutral-700 mb-6 shadow-xs">
            <GraduationCap className="w-8 h-8 stroke-[1.5]" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-neutral-900 mb-3">
            Dasinya Private School
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto mb-10 leading-relaxed font-normal">
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
                Choose from Grade 1 to 9 and its designated classes (A, B, or C) to display the student report card.
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
                  {selectedGrade} offers: {availableClasses.join(' & ')}
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
                <div className="inline-flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full border-2 border-neutral-900 flex items-center justify-center bg-white text-neutral-900">
                    <GraduationCap className="w-7 h-7" />
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
                    Student Academic Evaluation &bull; {activeStudent.grade} ({activeStudent.section})
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-50 p-4 sm:p-5 rounded-lg border border-neutral-200 text-xs mb-8">
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

              {/* Subjects Table */}
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
                    {activeStudent.subjects.map((sub, index) => (
                      <tr key={index} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-neutral-900">{sub.subject}</td>
                        <td className="py-3 px-3 text-neutral-500 font-mono text-xs">{sub.code}</td>
                        <td className="py-3 px-3 text-right text-neutral-600">{sub.maxMarks}</td>
                        <td className="py-3 px-3 text-right font-bold text-neutral-900">{sub.obtainedMarks}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                            sub.grade.startsWith('A') 
                              ? 'bg-neutral-900 text-white' 
                              : 'bg-neutral-200 text-neutral-800'
                          }`}>
                            {sub.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-600 text-xs">{sub.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-900 text-neutral-900 text-xs sm:text-sm">
                      <td className="py-3.5 px-4 uppercase tracking-wider">Overall Assessment</td>
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
                    A+ (90-100%) &bull; A (80-89%) &bull; B+ (70-79%)<br />
                    B (60-69%) &bull; C (50-59%) &bull; Passing Mark: 50%
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
