import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Truck,
  Plus,
  Trash2,
  X,
  RotateCcw,
  Shield,
  FileCheck2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Company, Carrier, AuditLog, UserProfile } from '../types';

interface SettingsViewProps {
  companies?: Company[];
  carriers?: Carrier[];
  auditLogs?: AuditLog[];
  currentUser: UserProfile;
  onSaveCompany: (company: Company) => void;
  onSaveCarrier: (carrier: Carrier) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  companies = [],
  carriers = [],
  auditLogs = [],
  currentUser,
  onSaveCompany,
  onSaveCarrier,
  onResetData
}) => {
  const [activeTab, setActiveTab] = useState<'companies' | 'carriers' | 'logs'>('companies');

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyForm, setCompanyForm] = useState<Partial<Company>>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  const [isCarrierModalOpen, setIsCarrierModalOpen] = useState(false);
  const [carrierForm, setCarrierForm] = useState<Partial<Carrier>>({
    nome: '',
    cnpj: '',
    contato: '',
    telefone: ''
  });

  const canEdit = currentUser.role === 'Administrador';

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.nome || !companyForm.cnpj) return;

    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      nome: companyForm.nome,
      cnpj: companyForm.cnpj,
      email: companyForm.email,
      telefone: companyForm.telefone,
      endereco: companyForm.endereco,
      created_at: new Date().toISOString()
    };

    onSaveCompany(newCompany);
    setIsCompanyModalOpen(false);
  };

  const handleCarrierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrierForm.nome || !carrierForm.cnpj) return;

    const newCarrier: Carrier = {
      id: `loc-${Date.now()}`,
      nome: carrierForm.nome,
      cnpj: carrierForm.cnpj,
      contato: carrierForm.contato,
      telefone: carrierForm.telefone,
      created_at: new Date().toISOString()
    };

    onSaveCarrier(newCarrier);
    setIsCarrierModalOpen(false);
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#BFA170] font-bold mb-1">
            Administração de Parâmetros
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F5]">
            Configurações do Sistema
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Cadastro de filiais do grupo, locadoras parceiras e auditoria de logs operacionais.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={onResetData}
            className="inline-flex items-center gap-2 px-3 py-2 bg-rose-950/60 border border-rose-800/80 text-rose-300 font-bold text-xs uppercase tracking-widest hover:bg-rose-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Base Inicial
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1C1C1C]">
        {[
          { key: 'companies', label: 'Filiais do Grupo', icon: Building2 },
          { key: 'carriers', label: 'Locadoras Parceiras', icon: Truck },
          { key: 'logs', label: 'Logs de Auditoria', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-colors ${
                isSelected
                  ? 'border-[#BFA170] text-[#BFA170] bg-[#121212]'
                  : 'border-transparent text-[#888888] hover:text-[#F5F5F5]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Companies */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#888888]">{companies.length} filiais cadastradas</span>
            {canEdit && (
              <button
                onClick={() => setIsCompanyModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#BFA170] hover:bg-[#a88c5d] text-[#080808] text-xs uppercase tracking-widest font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Filial
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => (
              <div key={c.id} className="p-4 bg-[#0C0C0C] border border-[#1C1C1C] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold text-[#F5F5F5]">{c.nome}</h3>
                  <span className="text-[10px] font-mono text-[#BFA170]">CNPJ: {c.cnpj}</span>
                </div>
                {c.email && <p className="text-xs text-[#888888]">E-mail: {c.email}</p>}
                {c.telefone && <p className="text-xs text-[#888888]">Tel: {c.telefone}</p>}
                {c.endereco && <p className="text-xs text-[#888888]">Endereço: {c.endereco}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Carriers */}
      {activeTab === 'carriers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#888888]">{carriers.length} locadoras parceiras</span>
            {canEdit && (
              <button
                onClick={() => setIsCarrierModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#BFA170] hover:bg-[#a88c5d] text-[#080808] text-xs uppercase tracking-widest font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Locadora
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {carriers.map((car) => (
              <div key={car.id} className="p-4 bg-[#0C0C0C] border border-[#1C1C1C] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold text-[#F5F5F5]">{car.nome}</h3>
                  <span className="text-[10px] font-mono text-[#BFA170]">CNPJ: {car.cnpj}</span>
                </div>
                {car.contato && <p className="text-xs text-[#888888]">Contato: {car.contato}</p>}
                {car.telefone && <p className="text-xs text-[#888888]">Tel: {car.telefone}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] overflow-hidden">
          <div className="p-3 bg-[#080808] border-b border-[#1C1C1C] text-[10px] uppercase tracking-widest text-[#888888] font-bold">
            Trilha Auditável de Operações
          </div>
          <div className="divide-y divide-[#1C1C1C]">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 text-xs flex items-center justify-between hover:bg-[#121212]">
                <div>
                  <span className="font-bold text-[#F5F5F5]">{log.usuario}</span>{' '}
                  <span className="text-[#888888]">{log.acao}</span>{' '}
                  <span className="font-mono text-[#BFA170]">{log.detalhes}</span>
                </div>
                <span className="text-[10px] text-[#555555]">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Company */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0C0C0C] border border-[#1C1C1C] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <h3 className="text-lg font-serif font-bold text-[#F5F5F5]">Nova Filial do Grupo</h3>
              <button onClick={() => setIsCompanyModalOpen(false)} className="p-1.5 text-[#888888] hover:text-[#F5F5F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompanySubmit} className="py-4 space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Nome da Filial *</label>
                <input
                  type="text"
                  value={companyForm.nome || ''}
                  onChange={(e) => setCompanyForm({ ...companyForm, nome: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">CNPJ *</label>
                <input
                  type="text"
                  value={companyForm.cnpj || ''}
                  onChange={(e) => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-widest text-[#888888] bg-[#080808] border border-[#1C1C1C] hover:text-[#F5F5F5]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs uppercase tracking-widest font-bold text-[#080808] bg-[#BFA170] hover:bg-[#a88c5d]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Carrier */}
      {isCarrierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0C0C0C] border border-[#1C1C1C] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <h3 className="text-lg font-serif font-bold text-[#F5F5F5]">Nova Locadora Parceira</h3>
              <button onClick={() => setIsCarrierModalOpen(false)} className="p-1.5 text-[#888888] hover:text-[#F5F5F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCarrierSubmit} className="py-4 space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Nome da Locadora *</label>
                <input
                  type="text"
                  value={carrierForm.nome || ''}
                  onChange={(e) => setCarrierForm({ ...carrierForm, nome: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">CNPJ *</label>
                <input
                  type="text"
                  value={carrierForm.cnpj || ''}
                  onChange={(e) => setCarrierForm({ ...carrierForm, cnpj: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
                <button
                  type="button"
                  onClick={() => setIsCarrierModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-widest text-[#888888] bg-[#080808] border border-[#1C1C1C] hover:text-[#F5F5F5]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs uppercase tracking-widest font-bold text-[#080808] bg-[#BFA170] hover:bg-[#a88c5d]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
