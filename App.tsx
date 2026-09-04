import React, { useState, useEffect, useCallback } from 'react';
import { Student, TabType } from './types';
import { getStoredStudents, saveStoredStudents, resetStudentsToInitial, clearAttendanceStatus } from './utils/storage';
import { Navbar } from './components/Navbar';
import { GateDesk } from './components/GateDesk';
import { RegistrationsList } from './components/RegistrationsList';
import { Dashboard } from './components/Dashboard';
import { ToastContainer, ToastMessage } from './components/Toast';

export const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('gate');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize students from localStorage on initial render
  useEffect(() => {
    const loaded = getStoredStudents();
    setStudents(loaded);
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever students state updates
  useEffect(() => {
    if (isLoaded) {
      saveStoredStudents(students);
    }
  }, [students, isLoaded]);

  // Toast helper
  const showToast = useCallback(
    (type: 'success' | 'warning' | 'info' | 'error', title: string, description?: string) => {
      const newToast: ToastMessage = {
        id: `toast-${Date.now()}-${Math.random()}`,
        type,
        title,
        description,
      };
      setToasts(prev => [...prev, newToast]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Mark student as present
  const handleMarkPresent = useCallback(
    (studentId: string) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setStudents(prev => {
        const next = prev.map(s => {
          if (s.id === studentId) {
            return {
              ...s,
              isPresent: true,
              checkInTime: timeString,
            };
          }
          return s;
        });
        saveStoredStudents(next);
        return next;
      });
    },
    []
  );

  // Undo student check-in
  const handleUndoCheckIn = useCallback((studentId: string) => {
    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            isPresent: false,
            checkInTime: null,
          };
        }
        return s;
      });
      saveStoredStudents(next);
      return next;
    });
  }, []);

  // Toggle attendance from table row
  const handleToggleAttendance = useCallback(
    (studentId: string) => {
      const target = students.find(s => s.id === studentId);
      if (!target) return;

      if (target.isPresent) {
        handleUndoCheckIn(studentId);
        showToast('info', 'Status Updated', `${target.name} marked as Absent.`);
      } else {
        handleMarkPresent(studentId);
        showToast('success', 'Status Updated', `${target.name} marked as Present.`);
      }
    },
    [students, handleMarkPresent, handleUndoCheckIn, showToast]
  );

  // Add new student (e.g. walk-in)
  const handleAddStudent = useCallback((newStudent: Student) => {
    setStudents(prev => {
      const next = [newStudent, ...prev];
      saveStoredStudents(next);
      return next;
    });
  }, []);

  // Reset to default mock dataset
  const handleResetData = useCallback(() => {
    const reset = resetStudentsToInitial();
    setStudents(reset);
  }, []);

  // Clear all attendance (mark everyone absent)
  const handleClearAttendance = useCallback(() => {
    const cleared = clearAttendanceStatus();
    setStudents(cleared);
    showToast('info', 'Attendance Cleared', 'All students set to Not Yet Checked In.');
  }, [showToast]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        students={students}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'gate' && (
          <GateDesk
            students={students}
            onMarkPresent={handleMarkPresent}
            onUndoCheckIn={handleUndoCheckIn}
            onAddStudent={handleAddStudent}
            showToast={showToast}
          />
        )}

        {activeTab === 'registrations' && (
          <RegistrationsList
            students={students}
            onToggleAttendance={handleToggleAttendance}
            onAddStudent={handleAddStudent}
            onResetData={handleResetData}
            onClearAttendance={handleClearAttendance}
            showToast={showToast}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            students={students}
            onNavigateToGate={() => setActiveTab('gate')}
            onNavigateToRegistrations={() => setActiveTab('registrations')}
          />
        )}
      </main>

      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Event Attendance & Verification Desk • Local Storage Synchronized • Built with React & Tailwind CSS
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleClearAttendance}
              className="text-slate-400 hover:text-rose-400 transition"
              title="Reset all check-in statuses to absent"
            >
              Clear All Check-ins
            </button>
            <span>•</span>
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-blue-400 transition"
              title="Restore initial dataset"
            >
              Restore Mock Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
