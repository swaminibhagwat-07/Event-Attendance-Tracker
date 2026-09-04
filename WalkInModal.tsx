import React, { useState } from 'react';
import { AcademicYear, Branch, Student } from '../types';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (student: Student) => void;
  initialQuery?: string;
}

const BRANCH_OPTIONS: Branch[] = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Data Science & AI',
  'Civil Engineering',
];

const YEAR_OPTIONS: AcademicYear[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const WalkInModal: React.FC<WalkInModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  initialQuery = '',
}) => {
  const isPrnQuery = initialQuery.toUpperCase().startsWith('PRN') || /^\d+$/.test(initialQuery);
  const [name, setName] = useState(!isPrnQuery && !initialQuery.includes('@') ? initialQuery : '');
  const [prn, setPrn] = useState(isPrnQuery ? initialQuery.toUpperCase() : `PRN2024${Math.floor(100 + Math.random() * 900)}`);
  const [email, setEmail] = useState(initialQuery.includes('@') ? initialQuery : '');
  const [phone, setPhone] = useState(/^\d{10}$/.test(initialQuery) ? initialQuery : '9876543299');
  const [year, setYear] = useState<AcademicYear>('1st Year');
  const [branch, setBranch] = useState<Branch>('Computer Science & Engineering');
  const [markPresentImmediately, setMarkPresentImmediately] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prn.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedPrn = prn.trim().toUpperCase();

    const newStudent: Student = {
      id: `std-walkin-${Date.now()}`,
      prn: formattedPrn,
      collegeId: formattedPrn,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      year,
      branch,
      isPresent: markPresentImmediately,
      checkInTime: markPresentImmediately ? timeString : null,
      avatarBg: 'bg-indigo-600',
    };

    onRegister(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-xl p-1 rounded-lg hover:bg-slate-800 transition"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xl font-bold">
            +
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Register Walk-in Attendee</h3>
            <p className="text-sm text-slate-400">Add an attendee to the PRN database on the spot</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Priyanshu Roy"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                College PRN (Reg Number) *
              </label>
              <input
                type="text"
                required
                value={prn}
                onChange={e => setPrn(e.target.value)}
                placeholder="e.g. PRN2024999"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. student@campus.edu"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Academic Year *
              </label>
              <select
                value={year}
                onChange={e => setYear(e.target.value as AcademicYear)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {YEAR_OPTIONS.map(y => (
                  <option key={y} value={y} className="bg-slate-900">
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Branch *
              </label>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value as Branch)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {BRANCH_OPTIONS.map(b => (
                  <option key={b} value={b} className="bg-slate-900">
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition">
              <input
                type="checkbox"
                checked={markPresentImmediately}
                onChange={e => setMarkPresentImmediately(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-700 border-slate-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-sm text-slate-300 font-medium">
                Mark as <strong className="text-emerald-400">Present</strong> immediately at the gate
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition active:scale-95"
            >
              Confirm & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
