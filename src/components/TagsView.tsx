import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  Car,
  Edit2,
  Trash2,
  X,
  Shield,
  DollarSign
} from 'lucide-react';
import { Tag, TagStatus, Vehicle, UserProfile } from '../types';

interface TagsViewProps {
  tags?: Tag[];
  vehicles?: Vehicle[];
  currentUser: UserProfile;
  onSaveTag: (tag: Tag) => void;
  onDeleteTag: (id: string) => void;
}

export const TagsView: React.FC<TagsViewProps> = ({
  tags = [],
  vehicles = [],
  currentUser,
  onSaveTag,
  onDeleteTag
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperadora, setSelectedOperadora] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const [formData, setFormData] = useState<Partial<Tag>>({
    numero_tag: '',
    operadora: 'Sem Parar',
    veiculo_id: vehicles[0]?.id || '',
    centro_de_custo: 'CC-101 Operações',
    saldo: 150.0,
    status: 'Ativo'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canEdit = currentUser.role !== 'Visualizador';
  const canDelete = currentUser.role === 'Administrador';

  const filteredTags = tags.filter((t) => {
    const vehicle = vehicles.find((v) => v.id === t.veiculo_id);
    const tagNum = t.numero_tag || t.numero || '';

    const matchesSearch =
      tagNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.operadora.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehicle && vehicle.placa.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesOperadora = selectedOperadora === 'all' || t.operadora === selectedOperadora;

    return matchesSearch && matchesOperadora;
  });

  const totalBalance = filteredTags.reduce((acc, t) => acc + (t.saldo || 0), 0);

  const handleOpenAdd = () => {
    setEditingTag(null);
    setFormData({
      numero_tag: '',
      operadora: 'Sem Parar',
      veiculo_id: vehicles[0]?.id || '',
      centro_de_custo: 'CC-101 Operações',
      saldo: 150.0,
      status: 'Ativo'
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: Tag) => {
    setEditingTag(t);
    setFormData({ ...t, numero_tag: t.numero_tag || t.numero });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.numero_tag) errors.numero_tag = 'Número da tag é obrigatório';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newTag: Tag = {
      id: editingTag ? editingTag.id : `tag-${Date.now()}`,
      numero_tag: (formData.numero_tag || '').toUpperCase().trim(),
      numero: (formData.numero_tag || '').toUpperCase().trim(),
      operadora: formData.operadora || 'Sem Parar',
      veiculo_id: formData.veiculo_id || vehicles[0]?.id || '',
      centro_de_custo: formData.centro_de_custo || 'CC-101 Operações',
      saldo: Number(formData.saldo) || 0,
      status: (formData.status as TagStatus) || 'Ativo',
      created_at: editingTag ? editingTag.created_at : new Date().toISOString()
    };

    onSaveTag(newTag);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#BFA170] font-bold mb-1">
            Gestão de Pedágios & Estacionamentos
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F5]">
            Tags de Pedágio
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Supervisão de identificadores eletrônicos (Sem Parar, ConectCar, Veloe), saldos pré-pagos e veículos.
          </p>
        </div>

        {canEdit ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#BFA170] hover:bg-[#a88c5d] text-[#080808] font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Tag
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#1C1C1C] text-xs text-[#888888]">
            <Shield className="w-3.5 h-3.5 text-[#BFA170]" />
            Modo {currentUser.role}: Apenas Leitura
          </div>
        )}
      </div>

      {/* KPI Summary */}
      <div className="p-4 bg-[#0C0C0C] border border-[#1C1C1C] flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#888888]">Saldo Total Pré-Pago Disponível</p>
          <p className="text-2xl font-serif font-bold text-[#BFA170] mt-0.5">
            R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-xs text-[#888888]">
          {filteredTags.length} dispositivo(s) cadastrado(s)
        </div>
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
              placeholder="Número da tag, operadora, placa..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#BFA170]"
            />
          </div>

          <select
            value={selectedOperadora}
            onChange={(e) => setSelectedOperadora(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
          >
            <option value="all">Todas as Operadoras</option>
            <option value="Sem Parar">Sem Parar</option>
            <option value="ConectCar">ConectCar</option>
            <option value="Veloe">Veloe</option>
            <option value="Move Mais">Move Mais</option>
            <option value="Taggy">Taggy</option>
          </select>
        </div>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTags.map((tag) => {
          const vehicle = vehicles.find((v) => v.id === tag.veiculo_id);
          const tagNum = tag.numero_tag || tag.numero || '';

          return (
            <div
              key={tag.id}
              className="p-5 bg-[#0C0C0C] border border-[#1C1C1C] hover:border-[#BFA170]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1C1C1C]">
                  <span className="font-mono text-sm font-bold bg-[#161616] text-[#BFA170] px-2.5 py-0.5 border border-[#BFA170]/30 tracking-wider">
                    {tagNum}
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                    {tag.status || 'Ativo'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-[#888888]">
                  <div className="flex items-center justify-between">
                    <span>Operadora:</span>
                    <span className="font-semibold text-[#F5F5F5]">{tag.operadora}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Veículo Atribuído:</span>
                    <span className="font-mono font-bold text-[#BFA170]">
                      {vehicle ? `${vehicle.placa} (${vehicle.modelo})` : 'Disponível'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Centro de Custo:</span>
                    <span className="text-[#F5F5F5]">{tag.centro_de_custo}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1C1C1C] pt-2">
                    <span className="text-[10px] uppercase tracking-wider">Saldo em Conta:</span>
                    <span className="text-sm font-serif font-bold text-[#BFA170]">
                      R$ {(tag.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-end gap-2">
                {canEdit && (
                  <button
                    onClick={() => handleOpenEdit(tag)}
                    className="p-1.5 text-[#888888] hover:text-[#F5F5F5] transition-colors"
                    title="Editar Tag"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDeleteTag(tag.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                    title="Excluir Tag"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredTags.length === 0 && (
          <div className="col-span-full py-12 text-center bg-[#0C0C0C] border border-[#1C1C1C] p-6">
            <CreditCard className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <h3 className="text-sm font-serif font-bold text-[#F5F5F5]">Nenhuma tag encontrada</h3>
            <p className="text-xs text-[#888888] mt-1">Sua busca não retornou identificadores registrados.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0C0C0C] border border-[#1C1C1C] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <h3 className="text-lg font-serif font-bold text-[#F5F5F5]">
                {editingTag ? 'Editar Tag' : 'Cadastrar Tag de Pedágio'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-[#888888] hover:text-[#F5F5F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Número do Dispositivo / Tag *</label>
                <input
                  type="text"
                  value={formData.numero_tag || ''}
                  onChange={(e) => setFormData({ ...formData, numero_tag: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                />
                {formErrors.numero_tag && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.numero_tag}</p>}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Operadora</label>
                <select
                  value={formData.operadora || 'Sem Parar'}
                  onChange={(e) => setFormData({ ...formData, operadora: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                >
                  <option value="Sem Parar">Sem Parar</option>
                  <option value="ConectCar">ConectCar</option>
                  <option value="Veloe">Veloe</option>
                  <option value="Move Mais">Move Mais</option>
                  <option value="Taggy">Taggy</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Veículo Vinculado</label>
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
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Saldo Atual (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.saldo || 0}
                  onChange={(e) => setFormData({ ...formData, saldo: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                />
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
                  Salvar Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
