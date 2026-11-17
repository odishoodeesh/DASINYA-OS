/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Official Teacher Assignments & Daily Student Record Marksheet Data Structures
 * Matches official school templates:
 * - Grades 1 - 3: Daily Student Record (Evaluate 1st-4th out of 25 each, Total 100)
 * - Grades 4 - 9: Daily Student Record / سجل المتابعة اليومية (10% + 20% + 10% = 40% + 60% = 100%)
 */

import { StudentRecord } from './importedStudents';

export interface TeacherClassAssignment {
  grade: string;
  section: string;
  subjects: string[];
}

export interface TeacherAccount {
  id: string;
  name: string;
  workType: 'Teacher';
  phone: string;
  email: string;
  subjectLabel: string;
  assignedClasses: TeacherClassAssignment[];
}

export interface ClassMentorAssignment {
  classCode: string;
  grade: string;
  section: string;
  mentorShortName: string;
  teacherId: string;
}

/**
 * Official Class Mentors Mapping (1A - 9A)
 * Matches MENTORS_______46ec4255.pdf
 * Only each class's assigned Mentor can insert/edit Behaviour Reports for that class.
 */
export const CLASS_MENTORS: ClassMentorAssignment[] = [
  { classCode: '1A', grade: 'Grade 1', section: 'Class A', mentorShortName: 'HIBA', teacherId: 'T-16' },
  { classCode: '1B', grade: 'Grade 1', section: 'Class B', mentorShortName: 'HILBEEN', teacherId: 'T-13' },
  { classCode: '1C', grade: 'Grade 1', section: 'Class C', mentorShortName: 'DIMAN', teacherId: 'T-04' },
  { classCode: '2A', grade: 'Grade 2', section: 'Class A', mentorShortName: 'ASK', teacherId: 'T-05' },
  { classCode: '2B', grade: 'Grade 2', section: 'Class B', mentorShortName: 'VAZHEEN', teacherId: 'T-10' },
  { classCode: '2C', grade: 'Grade 2', section: 'Class C', mentorShortName: 'BHAR', teacherId: 'T-17' },
  { classCode: '3A', grade: 'Grade 3', section: 'Class A', mentorShortName: 'WARVIN', teacherId: 'T-19' },
  { classCode: '3B', grade: 'Grade 3', section: 'Class B', mentorShortName: 'DALIN', teacherId: 'T-12' },
  { classCode: '4A', grade: 'Grade 4', section: 'Class A', mentorShortName: 'AZA', teacherId: 'T-09' },
  { classCode: '4B', grade: 'Grade 4', section: 'Class B', mentorShortName: 'LARSA', teacherId: 'T-20' },
  { classCode: '5A', grade: 'Grade 5', section: 'Class A', mentorShortName: 'SIZAR', teacherId: 'T-23' },
  { classCode: '5B', grade: 'Grade 5', section: 'Class B', mentorShortName: 'HELZ', teacherId: 'T-07' },
  { classCode: '6A', grade: 'Grade 6', section: 'Class A', mentorShortName: 'MANAR', teacherId: 'T-01' },
  { classCode: '7A', grade: 'Grade 7', section: 'Class A', mentorShortName: 'SAMAH', teacherId: 'T-03' },
  { classCode: '8A', grade: 'Grade 8', section: 'Class A', mentorShortName: 'HAKAR', teacherId: 'T-18' },
  { classCode: '9A', grade: 'Grade 9', section: 'Class A', mentorShortName: 'SHARMEEN', teacherId: 'T-21' },
];

export function normalizePhone(value: string): string {
  return value.replace(/[\s\-().]+/g, '').trim();
}

export function authenticateTeacher(emailInput: string, passwordInput: string): TeacherAccount | null {
  const emailClean = emailInput.trim().toLowerCase();
  const phoneClean = normalizePhone(passwordInput);
  if (!emailClean || !phoneClean) return null;

  return (
    TEACHER_ACCOUNTS.find(
      (t) =>
        t.email.trim().toLowerCase() === emailClean &&
        normalizePhone(t.phone) === phoneClean
    ) || null
  );
}

export function getMentorAssignmentForTeacher(teacherId?: string | null): ClassMentorAssignment | null {
  if (!teacherId) return null;
  return CLASS_MENTORS.find((m) => m.teacherId === teacherId) || null;
}

export function getMentorForClass(
  grade: string,
  section: string
): { assignment: ClassMentorAssignment; teacher: TeacherAccount } | null {
  const assignment = CLASS_MENTORS.find(
    (m) => m.grade === grade && m.section === section
  );
  if (!assignment) return null;
  const teacher = TEACHER_ACCOUNTS.find((t) => t.id === assignment.teacherId);
  if (!teacher) return null;
  return { assignment, teacher };
}

export function isTeacherMentorOfClass(
  teacherId: string | undefined | null,
  grade: string,
  section: string
): boolean {
  if (!teacherId) return false;
  return CLASS_MENTORS.some(
    (m) => m.teacherId === teacherId && m.grade === grade && m.section === section
  );
}

export const TEACHER_ACCOUNTS: TeacherAccount[] = [
  {
    id: 'T-01',
    name: 'Manar Imad Sadiq',
    workType: 'Teacher',
    phone: '0750 349 8526',
    email: 'ms.manar105@gmail.com',
    subjectLabel: 'Arabic',
    assignedClasses: [
      { grade: 'Grade 4', section: 'Class A', subjects: ['Arabic'] },
      { grade: 'Grade 4', section: 'Class B', subjects: ['Arabic'] },
      { grade: 'Grade 5', section: 'Class A', subjects: ['Arabic'] },
      { grade: 'Grade 5', section: 'Class B', subjects: ['Arabic'] },
      { grade: 'Grade 6', section: 'Class A', subjects: ['Arabic'] },
    ],
  },
  {
    id: 'T-02',
    name: 'Payam Shaban Hassan',
    workType: 'Teacher',
    phone: '0750 889 4957',
    email: 'Payamshaaban@gmail.com',
    subjectLabel: 'Religion',
    assignedClasses: [
      { grade: 'Grade 1', section: 'Class A', subjects: ['Religion'] },
      { grade: 'Grade 1', section: 'Class B', subjects: ['Religion'] },
      { grade: 'Grade 1', section: 'Class C', subjects: ['Religion'] },
      { grade: 'Grade 2', section: 'Class A', subjects: ['Religion'] },
      { grade: 'Grade 2', section: 'Class B', subjects: ['Religion'] },
      { grade: 'Grade 2', section: 'Class C', subjects: ['Religion'] },
      { grade: 'Grade 3', section: 'Class A', subjects: ['Religion'] },
      { grade: 'Grade 3', section: 'Class B', subjects: ['Religion'] },
      { grade: 'Grade 4', section: 'Class A', subjects: ['Religion'] },
      { grade: 'Grade 4', section: 'Class B', subjects: ['Religion'] },
      { grade: 'Grade 5', section: 'Class A', subjects: ['Religion'] },
      { grade: 'Grade 5', section: 'Class B', subjects: ['Religion'] },
    ],
  },
  {
    id: 'T-03',
    name: 'Samah Ali Khurshid',
    workType: 'Teacher',
    phone: '0751 760 7787',
    email: 'samahmzere67@gmail.com',
    subjectLabel: 'Arabic + Religion',
    assignedClasses: [
      { grade: 'Grade 6', section: 'Class A', subjects: ['Religion'] },
      { grade: 'Grade 7', section: 'Class A', subjects: ['Arabic', 'Religion'] },
      { grade: 'Grade 8', section: 'Class A', subjects: ['Arabic', 'Religion'] },
      { grade: 'Grade 9', section: 'Class A', subjects: ['Arabic', 'Religion'] },
    ],
  },
  {
    id: 'T-04',
    name: 'Diman Hikmat Nizar',
    workType: 'Teacher',
    phone: '0751 791 4309',
    email: 'dimanhnzar5@gmail.com',
    subjectLabel: 'Kurdish',
    assignedClasses: [
      { grade: 'Grade 1', section: 'Class A', subjects: ['Kurdish'] },
      { grade: 'Grade 1', section: 'Class B', subjects: ['Kurdish'] },
      { grade: 'Grade 1', section: 'Class C', subjects: ['Kurdish'] },
    ],
  },
  {
    id: 'T-05',
    name: 'Ask Sarkar Fakhr al-Din',
    workType: 'Teacher',
    phone: '0750 839 0444',
    email: 'askdoski8@gmail.com',
    subjectLabel: 'Kurdish',
    assignedClasses: [
      { grade: 'Grade 2', section: 'Class A', subjects: ['Kurdish'] },
      { grade: 'Grade 2', section: 'Class B', subjects: ['Kurdish'] },
      { grade: 'Grade 2', section: 'Class C', subjects: ['Kurdish'] },
    ],
  },
  {
    id: 'T-06',
    name: 'Vindar Anwar Mohammed Khalid',
    workType: 'Teacher',
    phone: '0750 451 6822',
    email: 'vindamzire@gmail.com',
    subjectLabel: 'Kurdish',
    assignedClasses: [
      { grade: 'Grade 3', section: 'Class B', subjects: ['Kurdish'] },
      { grade: 'Grade 6', section: 'Class A', subjects: ['Kurdish'] },
      { grade: 'Grade 7', section: 'Class A', subjects: ['Kurdish'] },
      { grade: 'Grade 8', section: 'Class A', subjects: ['Kurdish'] },
      { grade: 'Grade 9', section: 'Class A', subjects: ['Kurdish'] },
    ],
  },
  {
    id: 'T-07',
    name: 'Helz Hussein Mohammed Tahir',
    workType: 'Teacher',
    phone: '0751 217 6538',
    email: 'doskid093@gmail.com',
    subjectLabel: 'Kurdish',
    assignedClasses: [
      { grade: 'Grade 3', section: 'Class A', subjects: ['Kurdish'] },
      { grade: 'Grade 4', section: 'Class A', subjects: ['Kurdish'] },
      { grade: 'Grade 4', section: 'Class B', subjects: ['Kurdish'] },
      { grade: 'Grade 5', section: 'Class A', subjects: ['Kurdish'] },
      { grade: 'Grade 5', section: 'Class B', subjects: ['Kurdish'] },
    ],
  },
  {
    id: 'T-08',
    name: 'Delvin Salah Jasim',
    workType: 'Teacher',
    phone: '0750 369 3656',
    email: 'dilveensalah51@gmail.com',
    subjectLabel: 'Conversation',
    assignedClasses: [
      { grade: 'Grade 1', section: 'Class A', subjects: ['Conversation'] },
      { grade: 'Grade 1', section: 'Class B', subjects: ['Conversation'] },
      { grade: 'Grade 1', section: 'Class C', subjects: ['Conversation'] },
      { grade: 'Grade 2', section: 'Class A', subjects: ['Conversation'] },
      { grade: 'Grade 2', section: 'Class B', subjects: ['Conversation'] },
      { grade: 'Grade 2', section: 'Class C', subjects: ['Conversation'] },
      { grade: 'Grade 3', section: 'Class A', subjects: ['Conversation'] },
      { grade: 'Grade 3', section: 'Class B', subjects: ['Conversation'] },
    ],
  },
  {
    id: 'T-09',
    name: 'Aza Samir Sadiq',
    workType: 'Teacher',
    phone: '0750 367 1017',
    email: 'Khaldaza99@gmail.com',
    subjectLabel: 'English',
    assignedClasses: [
      { grade: 'Grade 4', section: 'Class A', subjects: ['English'] },
      { grade: 'Grade 4', section: 'Class B', subjects: ['English'] },
      { grade: 'Grade 5', section: 'Class A', subjects: ['English'] },
      { grade: 'Grade 5', section: 'Class B', subjects: ['English'] },
    ],
  },
  {
    id: 'T-10',
    name: 'Vezhin Arshad Abdullah',
    workType: 'Teacher',
    phone: '0750 774 1715',
    email: 'vazheenn@gmail.com',
    subjectLabel: 'English',
    assignedClasses: [
      { grade: 'Grade 2', section: 'Class A', subjects: ['English'] },
      { grade: 'Grade 2', section: 'Class B', subjects: ['English'] },
      { grade: 'Grade 2', section: 'Class C', subjects: ['English'] },
    ],
  },
  {
    id: 'T-11',
    name: 'Shams al-Din Jamal al-Din Kazim',
    workType: 'Teacher',
    phone: '0750 890 0529',
    email: 'shams.abosh3eer@gmail.com',
    subjectLabel: 'English',
    assignedClasses: [
      { grade: 'Grade 6', section: 'Class A', subjects: ['English'] },
      { grade: 'Grade 7', section: 'Class A', subjects: ['English'] },
      { grade: 'Grade 8', section: 'Class A', subjects: ['English'] },
      { grade: 'Grade 9', section: 'Class A', subjects: ['English'] },
    ],
  },
  {
    id: 'T-12',
    name: 'Dalin Sarwar Saeed',
    workType: 'Teacher',
    phone: '0750 887 2312',
    email: 'dalindoski6@gmail.com',
    subjectLabel: 'English+ Conversation',
    assignedClasses: [
      { grade: 'Grade 1', section: 'Class A', subjects: ['Conversation'] },
      { grade: 'Grade 1', section: 'Class B', subjects: ['Conversation'] },
      { grade: 'Grade 1', section: 'Class C', subjects: ['Conversation'] },
      { grade: 'Grade 2', section: 'Class A', subjects: ['Conversation'] },
      { grade: 'Grade 2', section: 'Class B', subjects: ['Conversation'] },
      { grade: 'Grade 2', section: 'Class C', subjects: ['Conversation'] },
      { grade: 'Grade 3', section: 'Class A', subjects: ['English', 'Conversation'] },
      { grade: 'Grade 3', section: 'Class B', subjects: ['English', 'Conversation'] },
    ],
  },
  {
    id: 'T-13',
    name: 'Helbin Mustafa Saeed',
    workType: 'Teacher',
    phone: '0751 768 6531',
    email: 'hlbinmustafa60@gmail.com',
    subjectLabel: 'English',
    assignedClasses: [
      { grade: 'Grade 1', section: 'Class A', subjects: ['English'] },
      { grade: 'Grade 1', section: 'Class B', subjects: ['English'] },
      { grade: 'Grade 1', section: 'Class C', subjects: ['English'] },
    ],
  },
  {
    id: 'T-14',
    name: 'Fanar Sardar Ahmed',
    workType: 'Teacher',
    phone: '0751 235 7220',
    email: 'fanarmath@gmail.com',
    subjectLabel: 'Mathematics',
    assignedClasses: [
      { grade: 'Grade 2', section: 'Class A', subjects: ['Math'] },
      { grade: 'Grade 2', section: 'Class B', subjects: ['Math'] },
      { grade: 'Grade 2', section: 'Class C', subjects: ['Math'] },
      { grade: 'Grade 4', section: 'Class A', subjects: ['Math'] },
      { grade: 'Grade 4', section: 'Class B', subjects: ['Math'] },
    ],
  },
  {
    id: 'T-15',
    name: 'Zhin Nizar Yasin',
    workType: 'Teacher',
    phone: '0751 890 4046',
    email: 'zhinnizar99@gmail.com',
    subjectLabel: 'Mathematics',
    assignedClasses: [
      { grade: 'Grade 5', section: 'Class A', subjects: ['Math'] },
      { grade: 'Grade 5', section: 'Class B', subjects: ['Math'] },
      { grade: 'Grade 6', section: 'Class A', subjects: ['Math'] },
      { grade: 'Grade 7', section: 'Class A', subjects: ['Math'] },
      { grade: 'Grade 8', section: 'Class A', subjects: ['Math'] },
    ],
  },
  {
    id: 'T-16',
    name: 'Hiba Obaidullah Noor Mohammed',
    workType: 'Teacher',
    phone: '0750 758 4324',
    email: 'Hibbabrifkani@gmail.com',
    subjectLabel: 'Mathematics',
    assignedClasses: [
      { grade: 'Grade 1', section: 'Class A', subjects: ['Math'] },
      { grade: 'Grade 1', section: 'Class B', subjects: ['Math'] },
      { grade: 'Grade 1', section: 'Class C', subjects: ['Math'] },
      { grade: 'Grade 3', section: 'Class A', subjects: ['Math'] },
      { grade: 'Grade 3', section: 'Class B', subjects: ['Math'] },
    ],
  },
  {
    id: 'T-17',
    name: 'Bahar Nasih Mohammed Othman',
    workType: 'Teacher',
    phone: '0750 341 3036',
    email: 'buharnasih6@gmail.com',
    subjectLabel: 'Science',
    assignedClasses: [
      { grade: 'Grade 2', section: 'Class A', subjects: ['Science'] },
      { grade: 'Grade 2', section: 'Class B', subjects: ['Science'] },
      { grade: 'Grade 2', section: 'Class C', subjects: ['Science'] },
      { grade: 'Grade 3', section: 'Class B', subjects: ['Science'] },
    ],
  },
  {
    id: 'T-18',
    name: 'Hakar Zirvan Najm al-Din',
    workType: 'Teacher',
    phone: '0750 890 9260',
    email: 'hakarzeravan1@gmail.com',
    subjectLabel: 'Science',
    assignedClasses: [
      { grade: 'Grade 6', section: 'Class A', subjects: ['Science'] },
      { grade: 'Grade 7', section: 'Class A', subjects: ['Science'] },
      { grade: 'Grade 8', section: 'Class A', subjects: ['Science'] },
      { grade: 'Grade 9', section: 'Class A', subjects: ['Science', 'Math'] },
    ],
  },
  {
    id: 'T-19',
    name: 'Warvin Sherwan Abdullah Tahir',
    workType: 'Teacher',
    phone: '0750 247 1305',
    email: 'Warveensherwan@gmail.com',
    subjectLabel: 'Science',
    assignedClasses: [
      { grade: 'Grade 1', section: 'Class A', subjects: ['Science'] },
      { grade: 'Grade 1', section: 'Class B', subjects: ['Science'] },
      { grade: 'Grade 1', section: 'Class C', subjects: ['Science'] },
      { grade: 'Grade 3', section: 'Class A', subjects: ['Science'] },
    ],
  },
  {
    id: 'T-20',
    name: 'Larsa Sulaiman Mirkhail',
    workType: 'Teacher',
    phone: '0751 606 0143',
    email: 'larsamarkhail@gmail.com',
    subjectLabel: 'Science',
    assignedClasses: [
      { grade: 'Grade 4', section: 'Class A', subjects: ['Science'] },
      { grade: 'Grade 4', section: 'Class B', subjects: ['Science'] },
      { grade: 'Grade 5', section: 'Class A', subjects: ['Science'] },
      { grade: 'Grade 5', section: 'Class B', subjects: ['Science'] },
    ],
  },
  {
    id: 'T-21',
    name: 'Sharmin Shukri Mohammed',
    workType: 'Teacher',
    phone: '0751 794 0185',
    email: 'sherminberwary1@gmail.com',
    subjectLabel: 'Social Studies',
    assignedClasses: [
      { grade: 'Grade 5', section: 'Class A', subjects: ['Social Studies'] },
      { grade: 'Grade 5', section: 'Class B', subjects: ['Social Studies'] },
      { grade: 'Grade 6', section: 'Class A', subjects: ['Social Studies'] },
      { grade: 'Grade 7', section: 'Class A', subjects: ['Social Studies'] },
      { grade: 'Grade 8', section: 'Class A', subjects: ['Social Studies'] },
      { grade: 'Grade 9', section: 'Class A', subjects: ['Social Studies'] },
    ],
  },
  {
    id: 'T-22',
    name: 'Isra Ghanim Sadiq',
    workType: 'Teacher',
    phone: '0750 244 7624',
    email: 'israaghanimsadeq@gmail.com',
    subjectLabel: 'Social Studies + Psychology + Moral Values',
    assignedClasses: [
      { grade: 'Grade 1', section: 'Class A', subjects: ['Moral Values'] },
      { grade: 'Grade 1', section: 'Class B', subjects: ['Moral Values'] },
      { grade: 'Grade 1', section: 'Class C', subjects: ['Moral Values'] },
      { grade: 'Grade 2', section: 'Class A', subjects: ['Moral Values'] },
      { grade: 'Grade 2', section: 'Class B', subjects: ['Moral Values'] },
      { grade: 'Grade 2', section: 'Class C', subjects: ['Moral Values'] },
      { grade: 'Grade 4', section: 'Class A', subjects: ['Social Studies'] },
      { grade: 'Grade 4', section: 'Class B', subjects: ['Social Studies'] },
    ],
  },
  {
    id: 'T-23',
    name: 'Cesar Samir Sabri',
    workType: 'Teacher',
    phone: '0750 714 2312',
    email: 'cizarsamir@gmail.com',
    subjectLabel: 'Moral Values',
    assignedClasses: [
      { grade: 'Grade 3', section: 'Class A', subjects: ['Moral Values'] },
      { grade: 'Grade 3', section: 'Class B', subjects: ['Moral Values'] },
      { grade: 'Grade 4', section: 'Class A', subjects: ['Moral Values'] },
      { grade: 'Grade 4', section: 'Class B', subjects: ['Moral Values'] },
      { grade: 'Grade 5', section: 'Class A', subjects: ['Moral Values'] },
      { grade: 'Grade 5', section: 'Class B', subjects: ['Moral Values'] },
      { grade: 'Grade 6', section: 'Class A', subjects: ['Moral Values'] },
      { grade: 'Grade 7', section: 'Class A', subjects: ['Moral Values'] },
      { grade: 'Grade 8', section: 'Class A', subjects: ['Moral Values'] },
      { grade: 'Grade 9', section: 'Class A', subjects: ['Moral Values'] },
    ],
  },
  {
    id: 'T-24',
    name: 'Arin Harikar Amin',
    workType: 'Teacher',
    phone: '0750 234 6876',
    email: 'areen.balata97@gmail.com',
    subjectLabel: 'Information Technology',
    assignedClasses: [
      { grade: 'Grade 7', section: 'Class A', subjects: ['IT'] },
      { grade: 'Grade 8', section: 'Class A', subjects: ['IT'] },
    ],
  },
  {
    id: 'T-25',
    name: 'Ahmed Fuad Ahmed',
    workType: 'Teacher',
    phone: '0750 850 8560',
    email: 'Pe17.ahmed.fouad@gmail.com',
    subjectLabel: 'Physical Education',
    assignedClasses: [
      { grade: 'Grade 2', section: 'Class A', subjects: ['PE'] },
      { grade: 'Grade 2', section: 'Class B', subjects: ['PE'] },
      { grade: 'Grade 2', section: 'Class C', subjects: ['PE'] },
      { grade: 'Grade 4', section: 'Class A', subjects: ['PE'] },
      { grade: 'Grade 4', section: 'Class B', subjects: ['PE'] },
      { grade: 'Grade 5', section: 'Class A', subjects: ['PE'] },
      { grade: 'Grade 5', section: 'Class B', subjects: ['PE'] },
      { grade: 'Grade 6', section: 'Class A', subjects: ['PE'] },
    ],
  },
  {
    id: 'T-26',
    name: 'Payam Hussein Ali',
    workType: 'Teacher',
    phone: '0750 443 3692',
    email: 'payambarwary1998@gmail.com',
    subjectLabel: 'Physical Education',
    assignedClasses: [
      { grade: 'Grade 1', section: 'Class A', subjects: ['PE'] },
      { grade: 'Grade 1', section: 'Class B', subjects: ['PE'] },
      { grade: 'Grade 1', section: 'Class C', subjects: ['PE'] },
      { grade: 'Grade 3', section: 'Class A', subjects: ['PE'] },
      { grade: 'Grade 3', section: 'Class B', subjects: ['PE'] },
      { grade: 'Grade 7', section: 'Class A', subjects: ['PE'] },
      { grade: 'Grade 8', section: 'Class A', subjects: ['PE'] },
      { grade: 'Grade 9', section: 'Class A', subjects: ['PE'] },
    ],
  },
  {
    id: 'T-27',
    name: 'Sipan Sabah Rasool',
    workType: 'Teacher',
    phone: '0750 313 1575',
    email: 'sipansabah00@gmail.com',
    subjectLabel: 'Art',
    assignedClasses: [
      { grade: 'Grade 1', section: 'Class A', subjects: ['Art'] },
      { grade: 'Grade 1', section: 'Class B', subjects: ['Art'] },
      { grade: 'Grade 1', section: 'Class C', subjects: ['Art'] },
      { grade: 'Grade 2', section: 'Class A', subjects: ['Art'] },
      { grade: 'Grade 2', section: 'Class B', subjects: ['Art'] },
      { grade: 'Grade 2', section: 'Class C', subjects: ['Art'] },
      { grade: 'Grade 3', section: 'Class A', subjects: ['Art'] },
      { grade: 'Grade 3', section: 'Class B', subjects: ['Art'] },
    ],
  },
  {
    id: 'T-28',
    name: 'Saman Numan Mohammed',
    workType: 'Teacher',
    phone: '0751 207 7528',
    email: 'Samandeda@gmail.com',
    subjectLabel: 'Art',
    assignedClasses: [
      { grade: 'Grade 4', section: 'Class A', subjects: ['Art'] },
      { grade: 'Grade 4', section: 'Class B', subjects: ['Art'] },
      { grade: 'Grade 5', section: 'Class A', subjects: ['Art'] },
      { grade: 'Grade 5', section: 'Class B', subjects: ['Art'] },
      { grade: 'Grade 6', section: 'Class A', subjects: ['Art'] },
      { grade: 'Grade 7', section: 'Class A', subjects: ['Art'] },
      { grade: 'Grade 8', section: 'Class A', subjects: ['Art'] },
      { grade: 'Grade 9', section: 'Class A', subjects: ['Art'] },
    ],
  },
  {
    id: 'T-29',
    name: 'Rikar Wasfi Hassan',
    workType: 'Teacher',
    phone: '0750 795 1400',
    email: 'Rekarwasfi97@gmail.com',
    subjectLabel: 'Music',
    assignedClasses: [
      { grade: 'Grade 1', section: 'Class A', subjects: ['Music'] },
      { grade: 'Grade 1', section: 'Class B', subjects: ['Music'] },
      { grade: 'Grade 1', section: 'Class C', subjects: ['Music'] },
      { grade: 'Grade 2', section: 'Class A', subjects: ['Music'] },
      { grade: 'Grade 2', section: 'Class B', subjects: ['Music'] },
      { grade: 'Grade 2', section: 'Class C', subjects: ['Music'] },
      { grade: 'Grade 3', section: 'Class A', subjects: ['Music'] },
      { grade: 'Grade 3', section: 'Class B', subjects: ['Music'] },
      { grade: 'Grade 4', section: 'Class A', subjects: ['Music'] },
      { grade: 'Grade 4', section: 'Class B', subjects: ['Music'] },
      { grade: 'Grade 5', section: 'Class A', subjects: ['Music'] },
      { grade: 'Grade 5', section: 'Class B', subjects: ['Music'] },
      { grade: 'Grade 6', section: 'Class A', subjects: ['Music'] },
    ],
  },
];

// ============================================================================
// GRADES 1 - 3 DAILY STUDENT RECORD STRUCTURE (PDF: 1-3_44c4469a.pdf)
// ============================================================================

export interface Grade13EvalBlock {
  manners: number | null;       // max 5
  quiz: number | null;          // max 5
  oral: number | null;          // max 5
  practical: number | null;     // max 5
  participation: number | null; // max 5
  manualTotal?: number | null;  // pre-loaded authentic Term 1 mark out of 25 if no sub-breakdown
}

export interface Grade13SubjectRecord {
  kind: 'g13';
  eval1: Grade13EvalBlock;
  eval2: Grade13EvalBlock;
  eval3: Grade13EvalBlock;
  eval4: Grade13EvalBlock;
}

export const GRADE13_CRITERIA_KEYS: Array<{
  key: keyof Omit<Grade13EvalBlock, 'manualTotal'>;
  en: string;
  ku: string;
  ar: string;
  max: number;
}> = [
  { key: 'manners', en: 'Manners', ku: 'ڕەوشت', ar: 'الأدب', max: 5 },
  { key: 'quiz', en: 'Quiz', ku: 'کویز', ar: 'كويز', max: 5 },
  { key: 'oral', en: 'Oral eval.', ku: 'زارەکی', ar: 'شفهي', max: 5 },
  { key: 'practical', en: 'Practical', ku: 'پراکتیکی', ar: 'عملي', max: 5 },
  { key: 'participation', en: 'Participation', ku: 'بەشداری', ar: 'مشاركة', max: 5 },
];

export function createEmptyGrade13EvalBlock(manualTotal: number | null = null): Grade13EvalBlock {
  return {
    manners: null,
    quiz: null,
    oral: null,
    practical: null,
    participation: null,
    manualTotal,
  };
}

export function createEmptyGrade13Record(eval1Total: number | null = null): Grade13SubjectRecord {
  return {
    kind: 'g13',
    eval1: createEmptyGrade13EvalBlock(eval1Total),
    eval2: createEmptyGrade13EvalBlock(null),
    eval3: createEmptyGrade13EvalBlock(null),
    eval4: createEmptyGrade13EvalBlock(null),
  };
}

export function hasGrade13Breakdown(block: Grade13EvalBlock): boolean {
  return (
    typeof block.manners === 'number' ||
    typeof block.quiz === 'number' ||
    typeof block.oral === 'number' ||
    typeof block.practical === 'number' ||
    typeof block.participation === 'number'
  );
}

export function calcGrade13EvalTotal(block: Grade13EvalBlock): number | null {
  if (hasGrade13Breakdown(block)) {
    const sum =
      (block.manners ?? 0) +
      (block.quiz ?? 0) +
      (block.oral ?? 0) +
      (block.practical ?? 0) +
      (block.participation ?? 0);
    return Math.min(25, Number(sum.toFixed(1)));
  }
  if (typeof block.manualTotal === 'number') {
    return block.manualTotal;
  }
  return null;
}

export function calcGrade13GrandTotal(rec: Grade13SubjectRecord): number | null {
  const totals = [
    calcGrade13EvalTotal(rec.eval1),
    calcGrade13EvalTotal(rec.eval2),
    calcGrade13EvalTotal(rec.eval3),
    calcGrade13EvalTotal(rec.eval4),
  ].filter((v): v is number => typeof v === 'number');

  if (totals.length === 0) return null;
  const sum = totals.reduce((a, b) => a + b, 0);
  return Math.min(100, Number(sum.toFixed(1)));
}

// ============================================================================
// GRADES 4 - 9 DAILY STUDENT RECORD STRUCTURE (PDF: 4-9_28d9ee6e.pdf)
// ============================================================================

export type ScorePair = [number | null, number | null];

export interface Grade49HalfBlock {
  memorization: ScorePair; // حفظ و القاء الأنشودة ÷2 (max 2, 2 -> avg 2)
  reading: ScorePair;      // القراءة الصحيحة ÷2
  dialogue: ScorePair;     // تجسيد الحوار بالتمثيل و الاماء ÷2
  attendance: ScorePair;   // الحضور و الالتزام بالتعليمات ÷2
  appearance: ScorePair;   // الهندام و المحافظة علي البيئة ÷2
}

export interface Grade49SubjectRecord {
  kind: 'g49';
  firstHalf: Grade49HalfBlock;
  exam1: number | null;       // الامتحانات 20
  exam2: number | null;       // الامتحانات 20
  secondHalf: Grade49HalfBlock;
  finalExam60: number | null; // امتحانات نهاية الفصل 60%
}

export const GRADE49_HALF_CRITERIA: Array<{
  key: keyof Grade49HalfBlock;
  ar: string;
  en: string;
  ku: string;
}> = [
  {
    key: 'memorization',
    ar: 'حفظ و القاء الأنشودة ÷2',
    en: 'Memorization & Recitation ÷2',
    ku: 'لەبەرکردن و خوێندنەوە ÷٢',
  },
  {
    key: 'reading',
    ar: 'القراءة الصحيحة ÷2',
    en: 'Correct Reading ÷2',
    ku: 'خوێندنەوەی دروست ÷٢',
  },
  {
    key: 'dialogue',
    ar: 'تجسيد الحوار بالتمثيل و الاماء ÷2',
    en: 'Dialogue & Expression ÷2',
    ku: 'گفتوگۆ و نواندن ÷٢',
  },
  {
    key: 'attendance',
    ar: 'الحضور و الالتزام بالتعليمات ÷2',
    en: 'Attendance & Discipline ÷2',
    ku: 'ئامادەبوون و پابەندبوون ÷٢',
  },
  {
    key: 'appearance',
    ar: 'الهندام و المحافظة علي البيئة ÷2',
    en: 'Appearance & Environment ÷2',
    ku: 'ڕێکوپێکی و ژینگەپارێزی ÷٢',
  },
];

export function createEmptyGrade49HalfBlock(): Grade49HalfBlock {
  return {
    memorization: [null, null],
    reading: [null, null],
    dialogue: [null, null],
    attendance: [null, null],
    appearance: [null, null],
  };
}

export function createEmptyGrade49Record(exam1Value: number | null = null): Grade49SubjectRecord {
  return {
    kind: 'g49',
    firstHalf: createEmptyGrade49HalfBlock(),
    exam1: exam1Value,
    exam2: null,
    secondHalf: createEmptyGrade49HalfBlock(),
    finalExam60: null,
  };
}

export function calcScorePairValue(pair: ScorePair): number | null {
  const [a, b] = pair;
  if (typeof a === 'number' && typeof b === 'number') {
    return Number(((a + b) / 2).toFixed(1));
  }
  if (typeof a === 'number') return a;
  if (typeof b === 'number') return b;
  return null;
}

export function calcGrade49HalfTotal(half: Grade49HalfBlock): number | null {
  const vals = [
    calcScorePairValue(half.memorization),
    calcScorePairValue(half.reading),
    calcScorePairValue(half.dialogue),
    calcScorePairValue(half.attendance),
    calcScorePairValue(half.appearance),
  ].filter((v): v is number => typeof v === 'number');

  if (vals.length === 0) return null;
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.min(10, Number(sum.toFixed(1)));
}

export function calcGrade49ExamsTotal(rec: Grade49SubjectRecord): number | null {
  if (typeof rec.exam1 === 'number' && typeof rec.exam2 === 'number') {
    return Number(((rec.exam1 + rec.exam2) / 2).toFixed(1));
  }
  if (typeof rec.exam1 === 'number') return rec.exam1;
  if (typeof rec.exam2 === 'number') return rec.exam2;
  return null;
}

export function calcGrade49Total40(rec: Grade49SubjectRecord): number | null {
  const h1 = calcGrade49HalfTotal(rec.firstHalf);
  const ex = calcGrade49ExamsTotal(rec);
  const h2 = calcGrade49HalfTotal(rec.secondHalf);

  if (h1 === null && ex === null && h2 === null) return null;
  const sum = (h1 ?? 0) + (ex ?? 0) + (h2 ?? 0);
  return Math.min(40, Number(sum.toFixed(1)));
}

export function calcGrade49GrandTotal100(rec: Grade49SubjectRecord): number | null {
  const t40 = calcGrade49Total40(rec);
  const f60 = rec.finalExam60;
  if (t40 === null && f60 === null) return null;
  const sum = (t40 ?? 0) + (f60 ?? 0);
  return Math.min(100, Number(sum.toFixed(1)));
}

export type DailySubjectRecord = Grade13SubjectRecord | Grade49SubjectRecord;

export const DAILY_RECORDS_STORAGE_KEY = 'dasinya_daily_records_v1';

export function makeDailyRecordKey(studentId: string, subjectName: string): string {
  return `${studentId}__${subjectName.trim().toLowerCase()}`;
}

export function loadStoredDailyRecords(): Record<string, DailySubjectRecord> {
  try {
    const raw = localStorage.getItem(DAILY_RECORDS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStoredDailyRecords(records: Record<string, DailySubjectRecord>): void {
  try {
    localStorage.setItem(DAILY_RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Could not persist daily records to localStorage:', err);
  }
}

export function isGrade13(grade: string): boolean {
  const num = parseInt(grade.replace(/\D/g, ''), 10) || 1;
  return num <= 3;
}

/**
 * Resolves the effective Daily Subject Record for a student + subject:
 * 1. If a teacher has entered/saved a Daily Student Record, use it.
 * 2. Otherwise pre-fill from authentic uploaded Term 1 mark if present.
 * 3. Otherwise return an empty record (so un-uploaded subjects stay blank).
 */
export function getEffectiveDailyRecord(
  student: StudentRecord,
  subjectName: string,
  storedRecords: Record<string, DailySubjectRecord>
): DailySubjectRecord {
  const key = makeDailyRecordKey(student.id, subjectName);
  const existing = storedRecords[key];
  const primary13 = isGrade13(student.grade);

  if (existing) {
    if (primary13 && existing.kind === 'g13') return existing;
    if (!primary13 && existing.kind === 'g49') return existing;
  }

  const uploaded = (student.subjects || []).find(
    (s) => s.subject.toLowerCase() === subjectName.toLowerCase()
  );
  const authenticMark =
    uploaded && typeof uploaded.obtainedMarks === 'number' ? uploaded.obtainedMarks : null;

  if (primary13) {
    return createEmptyGrade13Record(authenticMark);
  }
  return createEmptyGrade49Record(authenticMark);
}
