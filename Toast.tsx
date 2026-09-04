import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgStyles = {
    success: 'bg-emerald-900/90 border-emerald-500 text-emerald-100',
    warning: 'bg-amber-900/90 border-amber-500 text-amber-100',
    error: 'bg-rose-900/90 border-rose-500 text-rose-100',
    info: 'bg-blue-900/90 border-blue-500 text-blue-100',
  }[toast.type];

  const icon = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ',
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all transform animate-slide-in ${bgStyles}`}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm bg-white/10 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm leading-tight text-white">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs mt-1 text-slate-200 line-clamp-2">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/60 hover:text-white text-base leading-none p-1 rounded hover:bg-white/10"
      >
        ×
      </button>
    </div>
  );
};
