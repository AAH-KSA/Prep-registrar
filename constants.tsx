
import React from 'react';
import { Student, AcademicLevel, RegistrationStatus } from './types';

export const MOCK_INITIAL_STUDENTS: Student[] = [
  {
    id: '20231001',
    name: 'Ahmed Al-Saud',
    gender: 'Male',
    admittedMajor: 'Computer Science',
    term: '241',
    englishPlacement: 'Took English',
    mathPlacement: 'Took Math',
    academicLevel: AcademicLevel.PREP,
    status: RegistrationStatus.UNDER_PROCESS,
    updatedAt: new Date().toISOString()
  },
  {
    id: '20231002',
    name: 'Sara Al-Ghamdi',
    gender: 'Female',
    admittedMajor: 'Electrical Engineering',
    term: '241',
    englishPlacement: 'Promoted',
    mathPlacement: 'Promoted',
    academicLevel: AcademicLevel.FRESHMAN,
    status: RegistrationStatus.REGISTERED,
    updatedAt: new Date().toISOString()
  }
];

export const COLORS = {
  primary: '#0369a1', // Sky 700
  secondary: '#0f172a', // Slate 900
  accent: '#f59e0b', // Amber 500
};
