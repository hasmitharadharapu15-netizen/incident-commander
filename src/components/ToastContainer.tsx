import React from 'react';
import { Flame, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { NotificationItem } from '../types/incident';

interface ToastContainerProps {
  toasts: NotificationItem[];
  onDismiss: (id: string) => void;
  onSelectToastIncident?: (incidentId: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onSelectToastIncident,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.slice(-3).map((toast) => {
        const isCritical = toast.type === 'critical';

        return (
          <div
            key={toast.id}
            onClick={() => {
              if (toast.incidentId && onSelectToastIncident) {
                onSelectToastIncident(toast.incidentId);
              }
            }}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-300 cursor-pointer ${
              isCritical
                ? 'bg-rose-950/90 border-rose-600/80 text-white shadow-rose-950/50'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-600/80 text-white'
                : 'bg-slate-900/95 border-slate-700 text-slate-100'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isCritical ? (
                <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="font-bold text-xs truncate font-mono">{toast.title}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(toast.id);
                    }}
                    className="text-slate-400 hover:text-white p-0.5 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-200/90 leading-snug line-clamp-2">
                  {toast.message}
                </p>
                {toast.incidentId && (
                  <span className="text-[10px] text-cyan-300 mt-1 inline-block font-mono underline">
                    Click to inspect {toast.incidentId} →
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
