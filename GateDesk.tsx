import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { StudentProfileCard } from './StudentProfileCard';
import { CameraScanner } from './CameraScanner';
import { BarcodeGeneratorModal } from './BarcodeGeneratorModal';
import { WalkInModal } from './WalkInModal';
import { playSuccessChime, playWarningTone } from '../utils/audio';

interface GateDeskProps {
  students: Student[];
  onMarkPresent: (studentId: string) => void;
  onUndoCheckIn: (studentId: string) => void;
  onAddStudent: (student: Student) => void;
  showToast: (type: 'success' | 'warning' | 'info' | 'error', title: string, description?: string) => void;
}

export const GateDesk: React.FC<GateDeskProps> = ({
  students,
  onMarkPresent,
  onUndoCheckIn,
  onAddStudent,
  showToast,
}) => {
  // Manual text backup PRN input
  const [manualPrn, setManualPrn] = useState('');
  // Last scanned/entered PRN string
  const [searchedPrn, setSearchedPrn] = useState<string | null>(null);
  // Matched student or not found state
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  // Camera state
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const [lastScannedPrn, setLastScannedPrn] = useState<string | null>(null);
  // Modals
  const [isIdGeneratorOpen, setIsIdGeneratorOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  // Exact PRN lookup matrix
  const lookupPrnInMatrix = (rawPrn: string) => {
    const trimmed = rawPrn.trim().toUpperCase();
    if (!trimmed) return;

    setSearchedPrn(trimmed);
    setLastScannedPrn(trimmed);

    // Search exact PRN or collegeId in database matrix
    const match = students.find(
      s => (s.prn && s.prn.toUpperCase() === trimmed) || s.collegeId.toUpperCase() === trimmed
    );

    if (match) {
      setActiveStudent(match);
      setIsNotFound(false);
      playSuccessChime();
      showToast(
        'info',
        'Student Profile Loaded',
        `PRN ${trimmed}: ${match.name} (${match.branch}) ready for verification.`
      );
    } else {
      setActiveStudent(null);
      setIsNotFound(true);
      playWarningTone();
      showToast(
        'warning',
        'PRN Not Registered',
        `No student record exists in the database for PRN: ${trimmed}.`
      );
    }
  };

  // Triggered when camera scanner successfully decodes a barcode/QR
  const handleCameraScan = (decodedText: string) => {
    setManualPrn(decodedText);
    lookupPrnInMatrix(decodedText);
  };

  // Triggered when organizer types PRN manually in the backup field
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupPrnInMatrix(manualPrn);
  };

  const handleClear = () => {
    setManualPrn('');
    setSearchedPrn(null);
    setActiveStudent(null);
    setIsNotFound(false);
    setLastScannedPrn(null);
  };

  const handleMarkPresentWithFeedback = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    onMarkPresent(studentId);
    playSuccessChime();

    // Trigger celebratory confetti
    try {
      const w = window as any;
      if (typeof w.confetti === 'function') {
        w.confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch {
      // ignore
    }

    // Refresh active student profile view with updated presence
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActiveStudent(prev => (prev && prev.id === studentId ? { ...prev, isPresent: true, checkInTime: nowStr } : prev));

    showToast(
      'success',
      'Check-in Confirmed!',
      `${student.name} (PRN: ${student.prn}) verified and marked as Present.`
    );
  };

  const handleUndoCheckInWithFeedback = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    onUndoCheckIn(studentId);
    setActiveStudent(prev => (prev && prev.id === studentId ? { ...prev, isPresent: false, checkInTime: null } : prev));
    showToast('info', 'Check-In Reverted', `${student.name} marked as Not Yet Checked In.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          Camera Barcode / QR Check-In Desk
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Gate Entry Verification Desk
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Scan the student's ID barcode or QR code with the live camera. The app instantly looks up their
          College PRN in the student database matrix for immediate check-in.
        </p>
      </div>

      {/* 1. LIVE CAMERA BARCODE/QR SCANNER WINDOW (Req 2) */}
      <CameraScanner
        onScan={handleCameraScan}
        isScanning={isCameraScanning}
        setIsScanning={setIsCameraScanning}
        lastScannedPrn={lastScannedPrn}
      />

      {/* 2. TEXT BACKUP: MANUAL PRN INPUT (Req 4) */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>⌨️ Manual PRN Text Backup</span>
            <span className="text-[11px] font-normal text-slate-400">
              (Use if card barcode is damaged or camera cannot focus)
            </span>
          </label>

          <button
            type="button"
            onClick={() => setIsIdGeneratorOpen(true)}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>🪪 Open Barcode Generator Modal</span>
          </button>
        </div>

        <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={manualPrn}
              onChange={e => setManualPrn(e.target.value)}
              placeholder="Type PRN Number (e.g. PRN2022001 or PRN2021034)..."
              className="w-full uppercase font-mono py-3 px-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {manualPrn && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 inset-y-0 flex items-center text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <span>Lookup PRN</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </form>

        {/* Quick Testing Shortcuts */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400 border-t border-slate-800">
          <span className="font-semibold text-slate-500">Quick Test PRNs:</span>
          <button
            type="button"
            onClick={() => {
              setManualPrn('PRN2022001');
              lookupPrnInMatrix('PRN2022001');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono transition"
          >
            PRN2022001 (Aarav Sharma)
          </button>
          <button
            type="button"
            onClick={() => {
              setManualPrn('PRN2021034');
              lookupPrnInMatrix('PRN2021034');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono transition"
          >
            PRN2021034 (Rohan Verma)
          </button>
          <button
            type="button"
            onClick={() => {
              setManualPrn('PRN2023015');
              lookupPrnInMatrix('PRN2023015');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono transition"
          >
            PRN2023015 (Diya Patel)
          </button>
          <button
            type="button"
            onClick={() => {
              setManualPrn('PRN9999999');
              lookupPrnInMatrix('PRN9999999');
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 font-mono transition"
          >
            PRN9999999 (Test Not Found)
          </button>
        </div>
      </div>

      {/* 3. SCANNED PRN LOOKUP WORKFLOW: VERIFICATION PANEL OR NOT FOUND (Req 3) */}
      {activeStudent ? (
        /* FOUND: AUTO-POPULATE VERIFICATION PANEL */
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Database Match Found for PRN: <strong className="font-mono text-white">{searchedPrn}</strong>
            </span>
            <button
              onClick={handleClear}
              className="text-slate-400 hover:text-white underline text-xs"
            >
              Clear & Scan Next
            </button>
          </div>

          <StudentProfileCard
            student={activeStudent}
            onMarkPresent={handleMarkPresentWithFeedback}
            onUndoCheckIn={handleUndoCheckInWithFeedback}
          />
        </div>
      ) : isNotFound && searchedPrn ? (
        /* NOT FOUND: DISTINCT "PRN NOT REGISTERED" ALERT */
        <div className="bg-gradient-to-b from-rose-950/70 to-slate-900 border-2 border-rose-500/60 rounded-2xl p-8 text-center shadow-2xl animate-shake space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center text-3xl font-bold shadow-lg shadow-rose-900/30">
            ⚠
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Access Denied • Verification Failed
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              PRN Not Registered
            </h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto mt-2 leading-relaxed">
              The scanned card PRN{' '}
              <strong className="text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800/60 font-mono text-base">
                "{searchedPrn}"
              </strong>{' '}
              is not present in the pre-registered student database matrix.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleClear}
              className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
            >
              Scan Again
            </button>
            <button
              onClick={() => setIsWalkInOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-2 active:scale-95"
            >
              <span>+ Register Walk-in Attendee</span>
            </button>
          </div>
        </div>
      ) : (
        /* Ready / Waiting indicator */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
          <div className="text-2xl text-blue-400">⚡</div>
          <h4 className="text-base font-bold text-white">Awaiting Barcode Scan</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Scan an ID card with the live camera above or enter a PRN manually. The student's full profile will auto-populate here.
          </p>
        </div>
      )}

      {/* Barcode Generator Modal for Testing */}
      <BarcodeGeneratorModal
        isOpen={isIdGeneratorOpen}
        onClose={() => setIsIdGeneratorOpen(false)}
        students={students}
        onSelectPrnToScan={prn => {
          setManualPrn(prn);
          lookupPrnInMatrix(prn);
        }}
      />

      {/* Walk-in Registration Modal */}
      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        initialQuery={searchedPrn || ''}
        onRegister={newStudent => {
          onAddStudent(newStudent);
          lookupPrnInMatrix(newStudent.prn);
          playSuccessChime();
          showToast(
            'success',
            'Walk-in Registered',
            `${newStudent.name} registered with PRN ${newStudent.prn}.`
          );
        }}
      />
    </div>
  );
};
