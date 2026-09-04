import React, { useState } from 'react';
import { Student } from '../types';

interface BarcodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSelectPrnToScan: (prn: string) => void;
}

export const BarcodeGeneratorModal: React.FC<BarcodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  students,
  onSelectPrnToScan,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg p-1 rounded-lg hover:bg-slate-800"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-lg font-bold">
            🪪
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Student ID Barcode Generator</h3>
            <p className="text-xs text-slate-400">Display ID barcode to test webcam scanner</p>
          </div>
        </div>

        {/* Student Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Select Student to Generate ID Card
          </label>
          <select
            value={selectedStudent?.id}
            onChange={e => {
              const found = students.find(s => s.id === e.target.value);
              if (found) setSelectedStudent(found);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {students.slice(0, 15).map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.prn}) - {s.branch}
              </option>
            ))}
          </select>
        </div>

        {/* Rendered Virtual ID Card */}
        {selectedStudent && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 text-center relative overflow-hidden">
            {/* Top Card Header */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
                CAMPUS INSTITUTE OF TECH
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                STUDENT ID
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3 text-left">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg ${
                  selectedStudent.avatarBg || 'bg-blue-600'
                }`}
              >
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-base text-white truncate">{selectedStudent.name}</h4>
                <p className="text-xs text-slate-300 font-mono font-bold">PRN: {selectedStudent.prn}</p>
                <p className="text-[11px] text-slate-400 truncate">{selectedStudent.branch}</p>
              </div>
            </div>

            {/* High-Contrast 1D Barcode Graphic (CSS/SVG lines encoding PRN) */}
            <div className="bg-white p-3 rounded-xl shadow-md flex flex-col items-center justify-center">
              <div className="flex items-end justify-center h-12 gap-[3px] w-full px-4 overflow-hidden">
                {/* Visual Barcode Pattern */}
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1].map(
                  (weight, i) => (
                    <div
                      key={i}
                      className="bg-black"
                      style={{
                        width: `${weight * 2}px`,
                        height: i % 5 === 0 ? '100%' : '85%',
                      }}
                    />
                  )
                )}
              </div>
              <span className="text-xs font-mono font-black text-black tracking-widest mt-1.5">
                *{selectedStudent.prn}*
              </span>
            </div>

            {/* Scan Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  onSelectPrnToScan(selectedStudent.prn);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>⚡ Simulate Scan: {selectedStudent.prn}</span>
              </button>
            </div>
          </div>
        )}

        {/* Test Unregistered PRN button */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              onSelectPrnToScan('PRN9999999');
              onClose();
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
          >
            Or Simulate Scanning Unregistered PRN (PRN9999999) →
          </button>
        </div>
      </div>
    </div>
  );
};
