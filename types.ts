
export enum UserRole {
  REGISTRAR = 'REGISTRAR',
  PREP_DEPT = 'PREP_DEPT',
  STUDENT = 'STUDENT'
}

export enum AcademicLevel {
  PREP = 'Prep',
  FRESHMAN = 'Freshmen'
}

export enum RegistrationStatus {
  UNDER_PROCESS = 'Under Process',
  REGISTERED = 'Registered'
}

export interface Student {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  admittedMajor: string;
  term: string;
  englishPlacement: string;
  mathPlacement: string;
  academicLevel: AcademicLevel;
  status: RegistrationStatus;
  updatedAt: string;
  englishSection?: string;
  mathSection?: string;
}

export interface ScheduleRequest {
  id: string;
  studentId: string;
  studentName: string;
  requestType: 'Section Change' | 'English Shift';
  details: string;
  courseName?: string;
  sectionNumber?: string;
  status: 'Pending' | 'Registered' | 'Needs Revision';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'Admission' | 'Placement' | 'StatusUpdate' | 'Adjustment';
  description: string;
  studentId?: string;
  studentName?: string;
  timestamp: string;
  actor: string;
}

export interface AuthState {
  role: UserRole | null;
  studentId?: string;
}
