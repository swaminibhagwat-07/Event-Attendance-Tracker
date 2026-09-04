import React from 'react';
import { TabType, Student } from '../types';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  students: Student[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  students,
}) => {
  const total = students.length;
  const present = students.filter(s => s.isPresent).length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-xl">
                🎟️
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Campus<span className="text-blue-500">Gate</span>
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Live Event
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Attendance Tracker & Verification Desk
              </p>
            </div>
          </div>

          {/* Tab Navigation Center */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('gate')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'gate'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Gate Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'registrations'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>👥</span>
              <span className="hidden sm:inline">All Registrations</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {total}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>📊</span>
              <span className="hidden sm:inline">Dashboard</span>
              <span className="hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-mono">
                {pct}%
              </span>
            </button>
          </nav>

          {/* Right Live Turnout Badge */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs">
                <span className="text-slate-400">Present: </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {present}/{total}
                </span>
                <span className="text-slate-400 ml-1">({pct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
