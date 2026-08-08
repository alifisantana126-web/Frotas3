import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  X,
  Building2,
  Car,
  AlertTriangle,
  CheckCircle2,
  Shield,
  RefreshCw,
  Truck
} from 'lucide-react';
import { Contract, ContractStatus, Company, Carrier, Vehicle, UserProfile } from '../types';

interface ContractsViewProps {
  contracts?: Contract[];
  companies?: Company[];
  carriers?: Carrier[];
  vehicles?: Vehicle[];
  currentUser: UserProfile;
  onSaveContract: (contract: Contract) => void;
  onDeleteContract: (id: string) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  contracts = [],
  companies = [],
  carriers = [],
  vehicles = [],
  currentUser,
  onSaveContract,
  onDeleteContract
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const [formData, setFormData] = useState<Partial<Contract>>({
    numero_contrato: '',
    empresa_id: companies[0]?.id || '',
    locadora_id: carriers[0]?.id || '',
    veiculo_id: '',
    valor_mensal: 2500,
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    renovacao_automatica: false,
    status: 'Ativo'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canEdit = currentUser.role === 'Administrador' || currentUser.role === 'Gestor';
  const canDelete = currentUser.role === 'Administrador';

  const now = new Date();

  const getContractStatusBadge = (contract: Contract) => {
    const end = new Date(contract.data_fim);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

    if (diffDays < 0 || contract.status === 'Vencido') {
      return {
        label: 'VENCIDO',
        badge: 'bg-rose-950/80 text-rose-400 border-rose-800/80'
      };
    } else if (diffDays <= 30 || contract.status === 'Vencendo') {
      return {
        label: `VENCENDO (${diffDays}d)`,
        badge: 'bg-[#BFA170]/20 text-[#BFA170] border-[#BFA170]/40'
      };
    } else {
      return {
        label: 'VIGENTE',
        badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
      };
    }
  };

  const filteredContracts = contracts.filter((c) => {
    const carrier = carriers.find((car) => car.id === c.locadora_id);
    const company = companies.find((comp) => comp.id === c.empresa_id);

    const matchesSearch =
      c.numero_contrato.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (carrier && carrier.nome.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company && company.nome.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingContract(null);
    setFormData({
      numero_contrato: '',
      empresa_id: companies[0]?.id || '',
      locadora_id: carriers[0]?.id || '',
      veiculo_id: '',
      valor_mensal: 2500,
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      renovacao_automatica: false,
      status: 'Ativo'
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: Contract) => {
    setEditingContract(c);
    setFormData({ ...c });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.numero_contrato) errors.numero_contrato = 'Número do contrato é obrigatório';
    if (!formData.valor_mensal || formData.valor_mensal <= 0) errors.valor_mensal = 'Valor inválido';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newContract: Contract = {
      id: editingContract ? editingContract.id : `ctr-${Date.now()}`,
      numero_contrato: (formData.numero_contrato || '').toUpperCase().trim(),
      empresa_id: formData.empresa_id || companies[0]?.id || '',
      locadora_id: formData.locadora_id || carriers[0]?.id || '',
      veiculo_id: formData.veiculo_id || undefined,
      valor_mensal: Number(formData.valor_mensal) || 0,
      data_inicio: formData.data_inicio || new Date().toISOString().split('T')[0],
      data_fim: formData.data_fim || new Date().toISOString().split('T')[0],
      renovacao_automatica: Boolean(formData.renovacao_automatica),
      status: (formData.status as ContractStatus) || 'Ativo',
      created_at: editingContract ? editingContract.created_at : new Date().toISOString()
    };

    onSaveContract(newContract);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#BFA170] font-bold mb-1">
            Gestão de Contratos & Locadoras
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F5]">
            Contratos de Locação
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Supervisão de prazos de vigência, custos mensais e renovações contratuais.
          </p>
        </div>

        {canEdit ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#BFA170] hover:bg-[#a88c5d] text-[#080808] font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Novo Contrato
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#1C1C1C] text-xs text-[#888888]">
            <Shield className="w-3.5 h-3.5 text-[#BFA170]" />
            Modo {currentUser.role}: Apenas Leitura
          </div>
        )}
      </div>

      {/* Filter controls */}
      <div className="p-4 bg-[#0C0C0C] border border-[#1C1C1C] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#555555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Número de contrato, locadora ou empresa..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#BFA170]"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
          >
            <option value="all">Todos os Status</option>
            <option value="Ativo">Vigente / Ativo</option>
            <option value="Vencendo">Vencendo em 30 dias</option>
            <option value="Vencido">Vencido</option>
            <option value="Encerrado">Encerrado</option>
          </select>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContracts.map((contract) => {
          const carrier = carriers.find((c) => c.id === contract.locadora_id);
          const company = companies.find((c) => c.id === contract.empresa_id);
          const vehicle = vehicles.find((v) => v.id === contract.veiculo_id);
          const statusBadge = getContractStatusBadge(contract);

          return (
            <div
              key={contract.id}
              className="p-5 bg-[#0C0C0C] border border-[#1C1C1C] hover:border-[#BFA170]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1C1C1C]">
                  <span className="font-mono text-sm font-bold bg-[#161616] text-[#BFA170] px-2.5 py-0.5 border border-[#BFA170]/30 tracking-wider">
                    {contract.numero_contrato}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${statusBadge.badge}`}>
                    {statusBadge.label}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-[#888888]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#BFA170]" />
                      Locadora:
                    </span>
                    <span className="font-semibold text-[#F5F5F5] truncate max-w-[150px]">{carrier?.nome || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#BFA170]" />
                      Empresa:
                    </span>
                    <span className="text-[#F5F5F5] truncate max-w-[150px]">{company?.nome || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#BFA170]" />
                      Veículo Vinculado:
                    </span>
                    <span className="font-mono font-bold text-[#BFA170]">
                      {vehicle ? `${vehicle.placa} (${vehicle.modelo})` : 'Não atribuído'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1C1C1C] pt-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#BFA170]" />
                      Vigência:
                    </span>
                    <span className="text-[#F5F5F5]">
                      {new Date(contract.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                      {new Date(contract.data_fim).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1C1C1C] pt-2">
                    <span className="text-[10px] uppercase tracking-wider">Valor Mensal:</span>
                    <span className="text-sm font-serif font-bold text-[#BFA170]">
                      R$ {contract.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-end gap-2">
                {canEdit && (
                  <button
                    onClick={() => handleOpenEdit(contract)}
                    className="p-1.5 text-[#888888] hover:text-[#F5F5F5] transition-colors"
                    title="Editar Contrato"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDeleteContract(contract.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                    title="Excluir Contrato"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredContracts.length === 0 && (
          <div className="col-span-full py-12 text-center bg-[#0C0C0C] border border-[#1C1C1C] p-6">
            <FileSpreadsheet className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <h3 className="text-sm font-serif font-bold text-[#F5F5F5]">Nenhum contrato localizado</h3>
            <p className="text-xs text-[#888888] mt-1">Sua frota não possui contratos registrados para esta consulta.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#0C0C0C] border border-[#1C1C1C] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <h3 className="text-lg font-serif font-bold text-[#F5F5F5]">
                {editingContract ? 'Editar Contrato' : 'Novo Contrato de Locação'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-[#888888] hover:text-[#F5F5F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Número do Contrato *</label>
                  <input
                    type="text"
                    value={formData.numero_contrato || ''}
                    onChange={(e) => setFormData({ ...formData, numero_contrato: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                  {formErrors.numero_contrato && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.numero_contrato}</p>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Locadora</label>
                  <select
                    value={formData.locadora_id || ''}
                    onChange={(e) => setFormData({ ...formData, locadora_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  >
                    {carriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Valor Mensal (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_mensal || ''}
                    onChange={(e) => setFormData({ ...formData, valor_mensal: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                  {formErrors.valor_mensal && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.valor_mensal}</p>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Data Início</label>
                  <input
                    type="date"
                    value={formData.data_inicio || ''}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Data Término</label>
                  <input
                    type="date"
                    value={formData.data_fim || ''}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
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
