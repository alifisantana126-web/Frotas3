import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Edit2,
  Trash2,
  X,
  Car,
  FileCheck2,
  Building2,
  Mail,
  Phone,
  Shield
} from 'lucide-react';
import { Driver, Company, Vehicle, UserProfile } from '../types';

interface DriversViewProps {
  drivers?: Driver[];
  companies?: Company[];
  vehicles?: Vehicle[];
  fines?: any[];
  currentUser: UserProfile;
  onSaveDriver: (driver: Driver) => void;
  onDeleteDriver: (id: string) => void;
}

export const DriversView: React.FC<DriversViewProps> = ({
  drivers = [],
  companies = [],
  vehicles = [],
  currentUser,
  onSaveDriver,
  onDeleteDriver
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [formData, setFormData] = useState<Partial<Driver>>({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    departamento: 'Operações',
    empresa_id: companies[0]?.id || '',
    cnh: '',
    categoria_cnh: 'B',
    validade_cnh: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    observacoes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canAddOrEdit = currentUser.role === 'Administrador' || currentUser.role === 'Gestor';
  const canDelete = currentUser.role === 'Administrador';

  const now = new Date();

  const getCnhStatus = (validadeDateStr: string) => {
    const valDate = new Date(validadeDateStr);
    const diffTime = valDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return {
        label: 'CNH VENCIDA',
        status: 'expired',
        days: Math.abs(diffDays),
        badgeClass: 'bg-rose-950/80 text-rose-400 border-rose-800/80'
      };
    } else if (diffDays <= 15) {
      return {
        label: 'VENCENDO EM BREVE',
        status: 'warning',
        days: diffDays,
        badgeClass: 'bg-[#BFA170]/20 text-[#BFA170] border-[#BFA170]/40'
      };
    } else {
      return {
        label: 'REGULAR',
        status: 'regular',
        days: diffDays,
        badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
      };
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.cpf.includes(searchQuery) ||
      d.cnh.includes(searchQuery) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase());

    const cnhInfo = getCnhStatus(d.validade_cnh);
    const matchesStatus = selectedStatus === 'all' || cnhInfo.status === selectedStatus;
    const matchesCat = selectedCategory === 'all' || d.categoria_cnh === selectedCategory;

    return matchesSearch && matchesStatus && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      departamento: 'Operações',
      empresa_id: companies[0]?.id || '',
      cnh: '',
      categoria_cnh: 'B',
      validade_cnh: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      observacoes: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (d: Driver) => {
    setEditingDriver(d);
    setFormData({ ...d });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nome) errors.nome = 'Nome é obrigatório';
    if (!formData.cpf) errors.cpf = 'CPF é obrigatório';
    if (!formData.cnh) errors.cnh = 'CNH é obrigatória';
    if (!formData.validade_cnh) errors.validade_cnh = 'Data de validade é obrigatória';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newDriver: Driver = {
      id: editingDriver ? editingDriver.id : `drv-${Date.now()}`,
      nome: formData.nome || '',
      cpf: formData.cpf || '',
      telefone: formData.telefone || '',
      email: formData.email || '',
      departamento: formData.departamento || 'Operações',
      empresa_id: formData.empresa_id || companies[0]?.id || '',
      cnh: formData.cnh || '',
      categoria_cnh: formData.categoria_cnh || 'B',
      validade_cnh: formData.validade_cnh || new Date().toISOString().split('T')[0],
      status: getCnhStatus(formData.validade_cnh || '').status === 'expired' ? 'Inativo' : 'Ativo',
      observacoes: formData.observacoes || '',
      created_at: editingDriver ? editingDriver.created_at : new Date().toISOString()
    };

    onSaveDriver(newDriver);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#BFA170] font-bold mb-1">
            Gestão do Capital Humano & Conformidade CNH
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F5]">
            Condutores Habilitados
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Supervisão de motoristas, pontuação, validades regulatórias e vínculo com veículos.
          </p>
        </div>

        {canAddOrEdit ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#BFA170] hover:bg-[#a88c5d] text-[#080808] font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Condutor
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#555555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nome, CPF, CNH ou e-mail..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#BFA170]"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
          >
            <option value="all">Todas as Situações de CNH</option>
            <option value="regular">Regularizada</option>
            <option value="warning">Vencendo em 15 dias</option>
            <option value="expired">CNH Expirada</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
          >
            <option value="all">Todas as Categorias CNH</option>
            <option value="A">Cat. A (Motos)</option>
            <option value="B">Cat. B (Passeio)</option>
            <option value="C">Cat. C (Carga leve)</option>
            <option value="D">Cat. D (Passageiros)</option>
            <option value="E">Cat. E (Carga pesada/Treminhão)</option>
          </select>
        </div>
      </div>

      {/* Drivers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrivers.map((driver) => {
          const company = companies.find((c) => c.id === driver.empresa_id);
          const assignedVehicle = vehicles.find((v) => v.condutor_id === driver.id);
          const cnhInfo = getCnhStatus(driver.validade_cnh);

          return (
            <div
              key={driver.id}
              className="p-5 bg-[#0C0C0C] border border-[#1C1C1C] hover:border-[#BFA170]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1C1C1C]">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#F5F5F5]">{driver.nome}</h3>
                    <p className="text-[10px] uppercase tracking-wider text-[#888888]">
                      CPF: {driver.cpf} • {driver.departamento}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-bold border ${cnhInfo.badgeClass}`}>
                    {cnhInfo.label}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-[#888888]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#BFA170]" />
                      CNH Nº:
                    </span>
                    <span className="font-mono text-[#F5F5F5]">{driver.cnh} (Cat. {driver.categoria_cnh})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#BFA170]" />
                      Validade CNH:
                    </span>
                    <span className={`font-bold ${cnhInfo.status === 'expired' ? 'text-rose-400' : 'text-[#F5F5F5]'}`}>
                      {new Date(driver.validade_cnh).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#BFA170]" />
                      Empresa:
                    </span>
                    <span className="text-[#F5F5F5] truncate max-w-[150px]">{company?.nome || 'Grupo'}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1C1C1C] pt-2">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#BFA170]" />
                      Veículo Fixo:
                    </span>
                    {assignedVehicle ? (
                      <span className="font-mono font-bold text-[#BFA170]">
                        {assignedVehicle.placa} ({assignedVehicle.modelo})
                      </span>
                    ) : (
                      <span className="text-[#555555]">Sem veículo fixo</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-end gap-2">
                {canAddOrEdit && (
                  <button
                    onClick={() => handleOpenEdit(driver)}
                    className="p-1.5 text-[#888888] hover:text-[#F5F5F5] transition-colors"
                    title="Editar Condutor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={() => onDeleteDriver(driver.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                    title="Excluir Condutor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredDrivers.length === 0 && (
          <div className="col-span-full py-12 text-center bg-[#0C0C0C] border border-[#1C1C1C] p-6">
            <Users className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <h3 className="text-sm font-serif font-bold text-[#F5F5F5]">Nenhum condutor localizado</h3>
            <p className="text-xs text-[#888888] mt-1">Ajuste os parâmetros da pesquisa.</p>
          </div>
        )}
      </div>

      {/* Driver Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#0C0C0C] border border-[#1C1C1C] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <h3 className="text-lg font-serif font-bold text-[#F5F5F5]">
                {editingDriver ? 'Editar Condutor' : 'Novo Condutor'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-[#888888] hover:text-[#F5F5F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                  {formErrors.nome && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.nome}</p>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">CPF *</label>
                  <input
                    type="text"
                    value={formData.cpf || ''}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                  {formErrors.cpf && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.cpf}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Número CNH *</label>
                  <input
                    type="text"
                    value={formData.cnh || ''}
                    onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                  {formErrors.cnh && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.cnh}</p>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Categoria</label>
                  <select
                    value={formData.categoria_cnh || 'B'}
                    onChange={(e) => setFormData({ ...formData, categoria_cnh: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  >
                    <option value="A">Cat. A</option>
                    <option value="B">Cat. B</option>
                    <option value="C">Cat. C</option>
                    <option value="D">Cat. D</option>
                    <option value="E">Cat. E</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Validade CNH *</label>
                  <input
                    type="date"
                    value={formData.validade_cnh || ''}
                    onChange={(e) => setFormData({ ...formData, validade_cnh: e.target.value })}
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
                  Salvar Condutor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
