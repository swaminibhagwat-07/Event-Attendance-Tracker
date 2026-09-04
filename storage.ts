import { Student } from '../types';
import { INITIAL_STUDENTS } from '../data/mockStudents';

const STORAGE_KEY = 'event_attendance_students_v2';

export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  } catch (err) {
    console.error('Error loading students from localStorage:', err);
    return INITIAL_STUDENTS;
  }
};

export const saveStoredStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (err) {
    console.error('Error saving students to localStorage:', err);
  }
};

export const resetStudentsToInitial = (): Student[] => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
    return [...INITIAL_STUDENTS];
  } catch (err) {
    console.error('Error resetting students:', err);
    return INITIAL_STUDENTS;
  }
};

export const clearAttendanceStatus = (): Student[] => {
  const current = getStoredStudents();
  const cleared = current.map(s => ({
    ...s,
    isPresent: false,
    checkInTime: null
  }));
  saveStoredStudents(cleared);
  return cleared;
};
