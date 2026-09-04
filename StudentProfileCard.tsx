import React from 'react';
import { Student } from '../types';

interface StudentProfileCardProps {
  student: Student;
  onMarkPresent: (studentId: string) => void;
  onUndoCheckIn: (studentId: string) => void;
}

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({
  student,
  onMarkPresent,
  onUndoCheckIn,
}) => {
  const initials = student.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all animate-fade-in">
      {/* Dynamic glow based on status */}
      <div
        className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -z-10 pointer-events-none opacity-20 ${
          student.isPresent ? 'bg-emerald-500' : 'bg-blue-500'
        }`}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-xl ${
              student.avatarBg || 'bg-gradient-to-tr from-blue-600 to-indigo-600'
            }`}
          >
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">{student.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-950/80 text-blue-400 border border-blue-700/50">
                PRN: {student.prn || student.collegeId}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {student.branch} • <span className="text-slate-300 font-semibold">{student.year}</span>
            </p>
          </div>
        </div>

        {/* Current status pill */}
        <div>
          {student.isPresent ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-semibold text-sm shadow-lg shadow-emerald-950/40">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified & Present</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 font-semibold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Not Yet Checked In</span>
            </div>
          )}
        </div>
      </div>

      {/* Details Grid: Name, Email, Year, Branch, PRN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-6 text-sm">
        <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-800">
          <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Email ID</span>
          <a
            href={`mailto:${student.email}`}
            className="text-white font-medium hover:text-blue-400 transition break-all"
          >
            {student.email}
          </a>
        </div>

        <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-800">
          <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Academic Year</span>
          <span className="text-white font-semibold">{student.year}</span>
        </div>

        <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-800">
          <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Department Branch</span>
          <span className="text-white font-medium truncate block" title={student.branch}>
            {student.branch}
          </span>
        </div>

        <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-800">
          <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Gate Check-in Time</span>
          <span className={`font-semibold font-mono ${student.checkInTime ? 'text-emerald-400' : 'text-slate-500'}`}>
            {student.checkInTime ? student.checkInTime : 'Not checked in yet'}
          </span>
        </div>
      </div>

      {/* Prominent Verification Action Bar */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          {student.isPresent ? (
            <span>
              Verified attendee checked in at <strong className="text-white font-mono">{student.checkInTime}</strong>
            </span>
          ) : (
            <span>Credentials verified from PRN database matrix. Click below to confirm gate entry.</span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {student.isPresent ? (
            <button
              onClick={() => onUndoCheckIn(student.id)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              Undo Check-In
            </button>
          ) : (
            <button
              onClick={() => onMarkPresent(student.id)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-600/30 transition transform active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Mark as Present</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
