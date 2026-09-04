import React, { useMemo } from 'react';
import { AcademicYear, Student } from '../types';

interface DashboardProps {
  students: Student[];
  onNavigateToGate: () => void;
  onNavigateToRegistrations: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  onNavigateToGate,
  onNavigateToRegistrations,
}) => {
  // Top-level KPI calculations
  const totalRegistered = students.length;
  const totalPresent = students.filter(s => s.isPresent).length;
  const totalAbsent = totalRegistered - totalPresent;
  const attendancePercentage = totalRegistered > 0 ? Math.round((totalPresent / totalRegistered) * 100) : 0;

  // Year-wise attendance analytics
  const yearWiseData = useMemo(() => {
    const years: AcademicYear[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    return years.map(year => {
      const yearStudents = students.filter(s => s.year === year);
      const reg = yearStudents.length;
      const pres = yearStudents.filter(s => s.isPresent).length;
      const pct = reg > 0 ? Math.round((pres / reg) * 100) : 0;
      return {
        year,
        registered: reg,
        present: pres,
        absent: reg - pres,
        percentage: pct,
      };
    });
  }, [students]);

  // Branch-wise attendance analytics
  const branchWiseData = useMemo(() => {
    const branchMap = new Map<string, { registered: number; present: number }>();
    students.forEach(s => {
      const existing = branchMap.get(s.branch) || { registered: 0, present: 0 };
      existing.registered += 1;
      if (s.isPresent) existing.present += 1;
      branchMap.set(s.branch, existing);
    });

    return Array.from(branchMap.entries())
      .map(([branch, data]) => ({
        branch,
        registered: data.registered,
        present: data.present,
        absent: data.registered - data.present,
        percentage: data.registered > 0 ? Math.round((data.present / data.registered) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage || b.present - a.present);
  }, [students]);

  // Recent check-in activities (last 5-8 checked in students)
  const recentCheckIns = useMemo(() => {
    return students
      .filter(s => s.isPresent && s.checkInTime)
      .slice(-6)
      .reverse();
  }, [students]);

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Analytics & Metrics
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Event Attendance Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time visual monitoring of attendee turnouts, cohort engagement, and gate entry metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToGate}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/25 transition active:scale-95 flex items-center gap-2"
          >
            <span>🚪 Open Gate Desk</span>
          </button>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Registered */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-lg font-bold">
              👥
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{totalRegistered}</div>
          <p className="text-xs text-slate-400 mt-2">All pre-registered & walk-in students</p>
        </div>

        {/* Card 2: Total Present */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Present</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg font-bold">
              ✓
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">{totalPresent}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {attendancePercentage}% verified
            </span>
            <span className="text-xs text-slate-400">at entry gate</span>
          </div>
        </div>

        {/* Card 3: Total Absent */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Total Absent</span>
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg font-bold">
              ⏳
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{totalAbsent}</div>
          <p className="text-xs text-slate-400 mt-2">Awaiting check-in at gate desk</p>
        </div>

        {/* Card 4: Attendance Percentage Ring */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Turnout Rate</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-lg font-bold">
              %
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{attendancePercentage}%</div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid: Year-wise & Branch-wise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* YEAR-WISE ATTENDANCE ANALYTICS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🎓 Year-wise Attendance Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Cohort participation across 1st to 4th academic years</p>
            </div>
          </div>

          <div className="space-y-4">
            {yearWiseData.map(item => (
              <div key={item.year} className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{item.year}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      ({item.present} / {item.registered} Present)
                    </span>
                  </div>
                  <div className="font-mono font-bold text-sm text-emerald-400">
                    {item.percentage}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Registered: <strong className="text-slate-200">{item.registered}</strong></span>
                  <span>Absent: <strong className="text-amber-400">{item.absent}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BRANCH-WISE ATTENDANCE ANALYTICS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🏛️ Branch-wise Attendance Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Discipline distribution and department turnout</p>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
            {branchWiseData.map(item => (
              <div key={item.branch} className="bg-slate-800/40 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-white truncate max-w-[220px] sm:max-w-xs" title={item.branch}>
                    {item.branch}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-300">
                      {item.present}/{item.registered}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Check-in Activity Feed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-lg">⚡</span>
            <h3 className="text-base font-bold text-white">Recent Gate Check-In Stream</h3>
          </div>
          <button
            onClick={onNavigateToRegistrations}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            View Full List →
          </button>
        </div>

        {recentCheckIns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentCheckIns.map(student => (
              <div
                key={student.id}
                className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${student.avatarBg || 'bg-emerald-600'}`}>
                    {student.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{student.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{student.branch}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 block">
                    {student.checkInTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">No students checked in yet. Open Gate Desk to scan attendees.</p>
        )}
      </div>
    </div>
  );
};
