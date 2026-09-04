export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';

export type Branch = 
  | 'Computer Science & Engineering'
  | 'Electronics & Communication'
  | 'Mechanical Engineering'
  | 'Information Technology'
  | 'Electrical Engineering'
  | 'Data Science & AI'
  | 'Civil Engineering';

export interface Student {
  id: string;
  prn: string;          // College Permanent Registration Number (e.g. PRN2022001)
  name: string;
  collegeId: string;    // Kept in sync with PRN
  email: string;
  phone: string;
  year: AcademicYear;
  branch: Branch;
  isPresent: boolean;
  checkInTime: string | null;
  avatarBg?: string;
}

export type TabType = 'gate' | 'registrations' | 'dashboard';

export interface FilterOptions {
  searchQuery: string;
  branch: string;
  year: string;
  status: 'all' | 'present' | 'absent';
}

export interface AttendanceStats {
  totalRegistered: number;
  totalPresent: number;
  totalAbsent: number;
  attendancePercentage: number;
  yearWise: Record<AcademicYear, { registered: number; present: number; percentage: number }>;
  branchWise: Record<string, { registered: number; present: number; percentage: number }>;
}
