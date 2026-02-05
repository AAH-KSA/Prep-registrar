
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
  englishPlacement: string; // e.g., ENGL001, Promoted
  mathPlacement: string;    // e.g., MATH001, Promoted
  academicLevel: AcademicLevel;
  status: RegistrationStatus;
  updatedAt: string;
}

export interface ScheduleRequest {
  id: string;
  studentId: string;
  studentName: string;
  requestType: 'Section Change' | 'English Shift' | 'Special Needs';
  details: string;
  status: 'Pending' | 'Processed';
  createdAt: string;
}

export interface AuthState {
  role: UserRole | null;
  studentId?: string;
}
