import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export const ToastContainer = Toast;

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#BFA170] shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
  };

  const bgStyles = {
    success: 'bg-[#0C0C0C] border-[#BFA170]/40 text-[#F5F5F5]',
    error: 'bg-[#0C0C0C] border-rose-800/60 text-rose-100',
    warning: 'bg-[#0C0C0C] border-amber-800/60 text-amber-100',
    info: 'bg-[#0C0C0C] border-sky-800/60 text-sky-100'
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 border shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${bgStyles[toast.type]}`}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 text-xs">
        <p className="font-bold uppercase tracking-wider text-[#F5F5F5]">{toast.title}</p>
        {(toast.message || toast.description) && (
          <p className="mt-1 text-[#888888]">{toast.message || toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#888888] hover:text-[#F5F5F5] transition-colors p-1"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
