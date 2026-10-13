import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import React from 'react';
import { useUIStore } from '../../state/uiStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        const typeStyles = {
          success: {
            bg: 'rgba(5, 150, 105, 0.1)',
            border: 'rgba(5, 150, 105, 0.3)',
            text: 'var(--text-primary)',
          },
          error: {
            bg: 'rgba(220, 38, 38, 0.1)',
            border: 'rgba(220, 38, 38, 0.3)',
            text: 'var(--text-primary)',
          },
          info: {
            bg: 'rgba(245, 158, 11, 0.1)',
            border: 'rgba(245, 158, 11, 0.3)',
            text: 'var(--text-primary)',
          },
        };

        const iconColors = {
          success: 'var(--text-success)',
          error: 'var(--text-danger)',
          info: 'var(--text-warning)',
        };

        const t = typeStyles[toast.type];

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-md border animate-slide-up transition-all"
            style={{
              backgroundColor: t.bg,
              borderColor: t.border,
              color: t.text,
            }}
          >
            <div className="flex items-start gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: iconColors.success }} />}
              {isError && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: iconColors.error }} />}
              {!isSuccess && !isError && <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: iconColors.info }} />}
              <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-raised)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
