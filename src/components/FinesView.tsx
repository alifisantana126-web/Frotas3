import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  DollarSign,
  AlertOctagon,
  Edit2,
  Trash2,
  X,
  Car,
  Users,
  Shield,
  Building2,
  FileCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Fine, FineStatus, Vehicle, Driver, UserProfile } from '../types';

interface FinesViewProps {
  fines?: Fine[];
  vehicles?: Vehicle[];
  drivers?: Driver[];
  currentUser: UserProfile;
  onSaveFine: (fine: Fine) => void;
  onDeleteFine: (id: string) => void;
}

export const FinesView: React.FC<FinesViewProps> = ({
  fines = [],
  vehicles = [],
  drivers = [],
  currentUser,
  onSaveFine,
  onDeleteFine
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFine, setEditingFine] = useState<Fine | null>(null);

  const [formData, setFormData] = useState<Partial<Fine>>({
    veiculo_id: vehicles[0]?.id || '',
    condutor_id: drivers[0]?.id || '',
    data_infracao: new Date().toISOString().split('T')[0],
    auto_infracao: '',
    descricao: '',
    valor: 195.23,
    pontuacao: 5,
    orgao_emissor: 'DETRAN-SP',
    status: 'Recebida'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canEdit = currentUser.role !== 'Visualizador';
  const canDelete = currentUser.role === 'Administrador';

  // Driver points accumulator
  const driverPointsMap = useMemo(() => {
    const map: Record<string, number> = {};
    fines.forEach((f) => {
      if (f.condutor_id && f.status !== 'Contestada') {
        map[f.condutor_id] = (map[f.condutor_id] || 0) + f.pontuacao;
      }
    });
    return map;
  }, [fines]);

  const filteredFines = fines.filter((f) => {
    const vehicle = vehicles.find((v) => v.id === f.veiculo_id);
    const driver = drivers.find((d) => d.id === f.condutor_id);

    const matchesSearch =
      f.auto_infracao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.orgao_emissor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehicle && vehicle.placa.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (driver && driver.nome.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || f.status === selectedStatus;
    const matchesDriver = selectedDriverId === 'all' || f.condutor_id === selectedDriverId;

    return matchesSearch && matchesStatus && matchesDriver;
  });

  const totalFinesValue = filteredFines.reduce((acc, f) => acc + f.valor, 0);

  const handleOpenAdd = () => {
    setEditingFine(null);
    setFormData({
      veiculo_id: vehicles[0]?.id || '',
      condutor_id: drivers[0]?.id || '',
      data_infracao: new Date().toISOString().split('T')[0],
      auto_infracao: '',
      descricao: '',
      valor: 195.23,
      pontuacao: 5,
      orgao_emissor: 'DETRAN-SP',
      status: 'Recebida'
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (f: Fine) => {
    setEditingFine(f);
    setFormData({ ...f });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.auto_infracao) errors.auto_infracao = 'Auto de infração é obrigatório';
    if (!formData.descricao) errors.descricao = 'Descrição da infração é obrigatória';
    if (!formData.valor || formData.valor <= 0) errors.valor = 'Informe um valor válido';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newFine: Fine = {
      id: editingFine ? editingFine.id : `fine-${Date.now()}`,
      veiculo_id: formData.veiculo_id || vehicles[0]?.id || '',
      condutor_id: formData.condutor_id || undefined,
      data_infracao: formData.data_infracao || new Date().toISOString().split('T')[0],
      auto_infracao: (formData.auto_infracao || '').toUpperCase().trim(),
      descricao: formData.descricao || '',
      valor: Number(formData.valor) || 0,
      pontuacao: Number(formData.pontuacao) || 0,
      orgao_emissor: formData.orgao_emissor || 'DETRAN',
      status: (formData.status as FineStatus) || 'Recebida',
      created_at: editingFine ? editingFine.created_at : new Date().toISOString()
    };

    onSaveFine(newFine);
    setIsFormOpen(false);
  };

  const getStatusBadge = (status: FineStatus) => {
    switch (status) {
      case 'Recebida':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'Indicada':
        return 'bg-sky-950/80 text-sky-400 border-sky-800/80';
      case 'Paga':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
      case 'Contestada':
        return 'bg-purple-950/80 text-purple-400 border-purple-800/80';
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#BFA170] font-bold mb-1">
            Gestão de Passivos & Indicação de Condutor
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F5]">
            Infrações e Multas
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Controle de autos de infração, pontuação acumulada e transferências de responsabilidade.
          </p>
        </div>

        {canEdit ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#BFA170] hover:bg-[#a88c5d] text-[#080808] font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Lançar Infração
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#1C1C1C] text-xs text-[#888888]">
            <Shield className="w-3.5 h-3.5 text-[#BFA170]" />
            Modo {currentUser.role}: Apenas Leitura
          </div>
        )}
      </div>

      {/* Summary KPI Banner */}
      <div className="p-4 bg-[#0C0C0C] border border-[#1C1C1C] flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#888888]">Passivo Total de Infrações</p>
          <p className="text-2xl font-serif font-bold text-[#BFA170] mt-0.5">
            R$ {totalFinesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#888888]">{filteredFines.length} autos registrados</span>
          <span className="text-emerald-400 font-bold">
            {filteredFines.filter((f) => f.status === 'Paga').length} liquidadas
          </span>
        </div>
      </div>

      {/* Filter controls */}
      <div className="p-4 bg-[#0C0C0C] border border-[#1C1C1C] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#555555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Auto de infração, placa, condutor..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#BFA170]"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
          >
            <option value="all">Todos os Status</option>
            <option value="Recebida">Recebida (Pendente)</option>
            <option value="Indicada">Indicada ao Condutor</option>
            <option value="Paga">Paga / Liquidada</option>
            <option value="Contestada">Em Contestação</option>
          </select>

          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
          >
            <option value="all">Todos os Condutores</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome} ({driverPointsMap[d.id] || 0} pts)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fines Table */}
      <div className="bg-[#0C0C0C] border border-[#1C1C1C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F5F5F5]">
            <thead className="bg-[#080808] text-[10px] uppercase tracking-widest text-[#888888] border-b border-[#1C1C1C]">
              <tr>
                <th className="p-3.5">Auto / Data</th>
                <th className="p-3.5">Veículo</th>
                <th className="p-3.5">Condutor Indicado</th>
                <th className="p-3.5">Descrição</th>
                <th className="p-3.5">Pontos</th>
                <th className="p-3.5">Valor (R$)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredFines.map((fine) => {
                const vehicle = vehicles.find((v) => v.id === fine.veiculo_id);
                const driver = drivers.find((d) => d.id === fine.condutor_id);

                return (
                  <tr key={fine.id} className="hover:bg-[#121212] transition-colors">
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-[#BFA170]">{fine.auto_infracao}</p>
                      <p className="text-[10px] text-[#888888]">
                        {new Date(fine.data_infracao).toLocaleDateString('pt-BR')} • {fine.orgao_emissor}
                      </p>
                    </td>
                    <td className="p-3.5">
                      {vehicle ? (
                        <div>
                          <p className="font-mono font-bold text-[#F5F5F5]">{vehicle.placa}</p>
                          <p className="text-[10px] text-[#888888]">{vehicle.modelo}</p>
                        </div>
                      ) : (
                        <span className="text-[#555555]">Veículo removido</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {driver ? (
                        <div>
                          <p className="font-semibold text-[#F5F5F5]">{driver.nome}</p>
                          <p className="text-[10px] text-[#888888]">CNH: {driver.cnh}</p>
                        </div>
                      ) : (
                        <span className="text-amber-400 font-bold text-[10px] uppercase">Não indicado</span>
                      )}
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-[#888888]" title={fine.descricao}>
                      {fine.descricao}
                    </td>
                    <td className="p-3.5 font-bold text-[#F5F5F5]">
                      {fine.pontuacao} pts
                    </td>
                    <td className="p-3.5 font-serif font-bold text-[#BFA170]">
                      R$ {fine.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold border ${getStatusBadge(fine.status)}`}>
                        {fine.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit(fine)}
                          className="p-1 text-[#888888] hover:text-[#F5F5F5]"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDeleteFine(fine.id)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredFines.length === 0 && (
          <div className="py-12 text-center p-6">
            <FileText className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <h3 className="text-sm font-serif font-bold text-[#F5F5F5]">Nenhuma infração cadastrada</h3>
            <p className="text-xs text-[#888888] mt-1">Sua frota não possui registros com os filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#0C0C0C] border border-[#1C1C1C] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <h3 className="text-lg font-serif font-bold text-[#F5F5F5]">
                {editingFine ? 'Editar Infração' : 'Lançar Infração'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-[#888888] hover:text-[#F5F5F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Veículo *</label>
                  <select
                    value={formData.veiculo_id || ''}
                    onChange={(e) => setFormData({ ...formData, veiculo_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.placa} - {v.marca} {v.modelo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Condutor Responsável</label>
                  <select
                    value={formData.condutor_id || ''}
                    onChange={(e) => setFormData({ ...formData, condutor_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  >
                    <option value="">Aguardando Indicação</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome} ({d.cpf})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Auto de Infração *</label>
                  <input
                    type="text"
                    value={formData.auto_infracao || ''}
                    onChange={(e) => setFormData({ ...formData, auto_infracao: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                  {formErrors.auto_infracao && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.auto_infracao}</p>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor || ''}
                    onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                  {formErrors.valor && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.valor}</p>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Pontos CNH</label>
                  <input
                    type="number"
                    value={formData.pontuacao || 0}
                    onChange={(e) => setFormData({ ...formData, pontuacao: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Descrição da Infração *</label>
                <textarea
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                />
                {formErrors.descricao && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.descricao}</p>}
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
