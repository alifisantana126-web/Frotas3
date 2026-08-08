import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  title,
  description,
  message,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const bodyText = description || message || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0C0C0C] border border-[#1C1C1C] overflow-hidden p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-rose-500/40 bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[#F5F5F5]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[#888888] hover:text-[#F5F5F5] p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-3">
          <p className="text-xs text-[#888888] leading-relaxed">
            {bodyText}
          </p>
          <div className="p-3 bg-[#121212] border border-[#BFA170]/30 text-[10px] uppercase tracking-wider text-[#BFA170]">
            Esta ação removerá o registro do ambiente ativo do grupo.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs uppercase tracking-widest text-[#888888] bg-[#080808] border border-[#1C1C1C] hover:text-[#F5F5F5] hover:border-[#333333] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-bold text-white bg-rose-700 hover:bg-rose-600 border border-rose-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
};
