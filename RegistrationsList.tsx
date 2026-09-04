import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { WalkInModal } from './WalkInModal';

interface RegistrationsListProps {
  students: Student[];
  onToggleAttendance: (studentId: string) => void;
  onAddStudent: (student: Student) => void;
  onResetData: () => void;
  onClearAttendance: () => void;
  showToast: (type: 'success' | 'warning' | 'info' | 'error', title: string, description?: string) => void;
}

export const RegistrationsList: React.FC<RegistrationsListProps> = ({
  students,
  onToggleAttendance,
  onAddStudent,
  onResetData,
  onClearAttendance,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  // Extract unique branches
  const branchOptions = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => set.add(s.branch));
    return Array.from(set).sort();
  }, [students]);

  // Extract unique years
  const yearOptions = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => set.add(s.year));
    return Array.from(set).sort();
  }, [students]);

  // Instant search filter matching Name, Email, or PRN
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter(student => {
      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        (student.prn && student.prn.toLowerCase().includes(q)) ||
        student.collegeId.toLowerCase().includes(q);

      const matchesBranch = selectedBranch === 'ALL' || student.branch === selectedBranch;
      const matchesYear = selectedYear === 'ALL' || student.year === selectedYear;
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'PRESENT' && student.isPresent) ||
        (selectedStatus === 'ABSENT' && !student.isPresent);

      return matchesSearch && matchesBranch && matchesYear && matchesStatus;
    });
  }, [students, searchQuery, selectedBranch, selectedYear, selectedStatus]);

  // Export CSV with PRN
  const handleExportCSV = () => {
    if (students.length === 0) return;

    const headers = ['ID', 'PRN', 'Name', 'Email', 'Phone', 'Year', 'Branch', 'Status', 'Check-in Time'];
    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.prn || s.collegeId}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${s.year}"`,
      `"${s.branch}"`,
      s.isPresent ? 'Present' : 'Absent',
      s.checkInTime ? `"${s.checkInTime}"` : 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `event_attendance_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'CSV Exported', `Downloaded ${filteredStudents.length} attendee records.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            All Registrations
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Displaying{' '}
            <span className="font-semibold text-white">{filteredStudents.length}</span> of{' '}
            <span className="font-semibold text-slate-300">{students.length}</span> registered students
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsWalkInOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <span>+ Add Walk-In</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5"
            title="Download table data as CSV"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Restore initial mock registration list?')) {
                onResetData();
                showToast('info', 'Data Reset', 'Mock registrations restored to original dataset.');
              }
            }}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium transition"
          >
            Reset Default
          </button>
        </div>
      </div>

      {/* Global Search & Multi-Filter Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Instant Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search instantly by student Name, Email ID, or PRN (e.g. 'PRN2022001' or 'Sharma')..."
            className="w-full pl-11 pr-10 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Filter Branch
            </label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Branches ({students.length})</option>
              {branchOptions.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Filter Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Years</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
              Attendance Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as 'ALL' | 'PRESENT' | 'ABSENT')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses ({students.length})</option>
              <option value="PRESENT">
                Present Only ({students.filter(s => s.isPresent).length})
              </option>
              <option value="ABSENT">
                Absent Only ({students.filter(s => !s.isPresent).length})
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Participant Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Participant</th>
                <th className="py-3.5 px-4">College PRN</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Branch & Year</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Check-in Time</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-800/50 transition ${
                      student.isPresent ? 'bg-emerald-950/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                            student.avatarBg || 'bg-blue-600'
                          }`}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{student.name}</div>
                          <div className="text-xs text-slate-400 truncate md:hidden">
                            {student.branch} • {student.year}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-800 text-blue-300 border border-slate-700 font-bold">
                        {student.prn || student.collegeId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="text-xs font-medium text-white truncate max-w-xs">{student.branch}</div>
                      <div className="text-xs text-slate-400">{student.year}</div>
                    </td>

                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <div className="text-xs text-slate-300 truncate max-w-[180px]">{student.email}</div>
                      <div className="text-xs text-slate-500 font-mono">+91 {student.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {student.isPresent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          Absent
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 hidden sm:table-cell text-xs text-slate-400 font-mono">
                      {student.checkInTime || '—'}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => onToggleAttendance(student.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                          student.isPresent
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {student.isPresent ? 'Mark Absent' : 'Mark Present'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="font-semibold text-slate-400">No participants match your search</div>
                    <div className="text-xs text-slate-500 mt-1">Try clearing filters or search query</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        initialQuery={searchQuery}
        onRegister={newStudent => {
          onAddStudent(newStudent);
          showToast(
            'success',
            'Registered Successfully',
            `${newStudent.name} added to registration records with PRN ${newStudent.prn}.`
          );
        }}
      />
    </div>
  );
};
