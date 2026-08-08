import React, { useState } from 'react';
import {
  Car,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  Building2,
  Gauge,
  Calendar,
  FileCheck,
  Wrench,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  Truck
} from 'lucide-react';
import {
  Vehicle,
  VehicleStatus,
  Company,
  Carrier,
  Contract,
  Driver,
  UserProfile
} from '../types';

interface VehiclesViewProps {
  vehicles?: Vehicle[];
  companies?: Company[];
  carriers?: Carrier[];
  contracts?: Contract[];
  drivers?: Driver[];
  currentUser: UserProfile;
  onSaveVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles = [],
  companies = [],
  carriers = [],
  contracts = [],
  drivers = [],
  currentUser,
  onSaveVehicle,
  onDeleteVehicle
}) => {
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    placa: '',
    modelo: '',
    marca: '',
    ano: new Date().getFullYear(),
    cor: 'Branco',
    renavam: '',
    chassi: '',
    tipo: 'Passeio',
    categoria: 'Próprio',
    empresa_id: companies[0]?.id || '',
    centro_de_custo: 'CC-101 Operações',
    locadora_id: '',
    contrato_id: '',
    condutor_id: '',
    data_aquisicao: new Date().toISOString().split('T')[0],
    data_entrega: '',
    status: 'Ativo',
    observacoes: '',
    odometro_atual: 0
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Role permissions checks
  const canAddOrEdit = currentUser.role === 'Administrador' || currentUser.role === 'Gestor';
  const canDelete = currentUser.role === 'Administrador';

  // Filter logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.placa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.renavam.includes(searchQuery) ||
      v.chassi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || v.categoria === selectedCategory;
    const matchesType = selectedType === 'all' || v.tipo === selectedType;

    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      placa: '',
      modelo: '',
      marca: '',
      ano: new Date().getFullYear(),
      cor: 'Branco',
      renavam: '',
      chassi: '',
      tipo: 'Passeio',
      categoria: 'Próprio',
      empresa_id: companies[0]?.id || '',
      centro_de_custo: 'CC-101 Operações',
      locadora_id: '',
      contrato_id: '',
      condutor_id: '',
      data_aquisicao: new Date().toISOString().split('T')[0],
      data_entrega: '',
      status: 'Ativo',
      observacoes: '',
      odometro_atual: 0
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({ ...v });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.placa) errors.placa = 'Placa é obrigatória';
    if (!formData.modelo) errors.modelo = 'Modelo é obrigatório';
    if (!formData.marca) errors.marca = 'Marca é obrigatória';
    if (!formData.renavam) errors.renavam = 'RENAVAM é obrigatório';
    if (!formData.chassi) errors.chassi = 'Chassi é obrigatório';

    if (formData.categoria === 'Alugado' && !formData.locadora_id) {
      errors.locadora_id = 'Selecione a locadora para veículos alugados';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newVehicle: Vehicle = {
      id: editingVehicle ? editingVehicle.id : `veh-${Date.now()}`,
      placa: (formData.placa || '').toUpperCase().trim(),
      modelo: formData.modelo || '',
      marca: formData.marca || '',
      ano: Number(formData.ano) || new Date().getFullYear(),
      cor: formData.cor || 'Branco',
      renavam: formData.renavam || '',
      chassi: (formData.chassi || '').toUpperCase().trim(),
      tipo: formData.tipo || 'Passeio',
      categoria: formData.categoria || 'Próprio',
      empresa_id: formData.empresa_id || companies[0]?.id || '',
      centro_de_custo: formData.centro_de_custo || 'CC-101 Operações',
      locadora_id: formData.categoria === 'Alugado' ? formData.locadora_id : undefined,
      contrato_id: formData.categoria === 'Alugado' ? formData.contrato_id : undefined,
      condutor_id: formData.condutor_id || undefined,
      data_aquisicao: formData.data_aquisicao || new Date().toISOString().split('T')[0],
      data_entrega: formData.data_entrega || undefined,
      status: (formData.status as VehicleStatus) || 'Ativo',
      observacoes: formData.observacoes || '',
      odometro_atual: Number(formData.odometro_atual) || 0,
      created_at: editingVehicle ? editingVehicle.created_at : new Date().toISOString()
    };

    onSaveVehicle(newVehicle);
    setIsFormOpen(false);
  };

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'Ativo':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
      case 'Reserva':
        return 'bg-sky-950/60 text-sky-400 border-sky-800/60';
      case 'Manutenção':
        return 'bg-[#BFA170]/15 text-[#BFA170] border-[#BFA170]/40';
      case 'Desmobilizado':
        return 'bg-[#121212] text-[#888888] border-[#222222]';
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#BFA170] font-bold mb-1">
            Catálogo & Ficha Técnica
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F5]">
            Frota de Veículos
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Controle analítico de frota própria e locada, hodômetros e condutores.
          </p>
        </div>

        {canAddOrEdit ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#BFA170] hover:bg-[#a88c5d] text-[#080808] font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Novo Veículo
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#1C1C1C] text-xs text-[#888888]">
            <Shield className="w-3.5 h-3.5 text-[#BFA170]" />
            Modo {currentUser.role}: Apenas Leitura
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-[#0C0C0C] border border-[#1C1C1C] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search text */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#555555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Placa, modelo, RENAVAM..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#BFA170]"
            />
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
          >
            <option value="all">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Reserva">Reserva</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Desmobilizado">Desmobilizado</option>
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
          >
            <option value="all">Todas as Categorias</option>
            <option value="Próprio">Próprio</option>
            <option value="Alugado">Alugado</option>
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
          >
            <option value="all">Todos os Tipos</option>
            <option value="Passeio">Passeio</option>
            <option value="Utilitário">Utilitário</option>
            <option value="SUV">SUV</option>
            <option value="Caminhão">Caminhão</option>
          </select>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVehicles.map((vehicle) => {
          const company = companies.find((c) => c.id === vehicle.empresa_id);
          const driver = drivers.find((d) => d.id === vehicle.condutor_id);
          const carrier = carriers.find((c) => c.id === vehicle.locadora_id);

          return (
            <div
              key={vehicle.id}
              className="p-5 bg-[#0C0C0C] border border-[#1C1C1C] hover:border-[#BFA170]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1C1C1C]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold bg-[#161616] text-[#BFA170] px-2.5 py-0.5 border border-[#BFA170]/30 tracking-wider">
                      {vehicle.placa}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#888888] px-2 py-0.5 bg-[#080808] border border-[#1C1C1C]">
                      {vehicle.tipo}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${getStatusBadge(
                      vehicle.status
                    )}`}
                  >
                    {vehicle.status}
                  </span>
                </div>

                {/* Main Vehicle Info */}
                <div className="mt-4">
                  <h3 className="text-base font-serif font-bold text-[#F5F5F5]">
                    {vehicle.marca} {vehicle.modelo}
                  </h3>
                  <p className="text-xs text-[#888888] mt-1">
                    Ano: {vehicle.ano} • Cor: {vehicle.cor} • <span className="text-[#BFA170]">{vehicle.categoria}</span>
                  </p>
                </div>

                {/* Additional Details */}
                <div className="mt-4 space-y-2 text-xs text-[#888888] border-t border-[#1C1C1C] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#888888]">
                      <Building2 className="w-3.5 h-3.5 text-[#BFA170]" />
                      Unidade:
                    </span>
                    <span className="font-semibold text-[#F5F5F5] truncate max-w-[150px]">{company?.nome || 'Sem filial'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#888888]">
                      <Gauge className="w-3.5 h-3.5 text-[#BFA170]" />
                      Odômetro:
                    </span>
                    <span className="font-bold text-[#BFA170]">
                      {(vehicle.odometro_atual || 0).toLocaleString('pt-BR')} km
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#888888]">
                      <FileCheck className="w-3.5 h-3.5 text-[#BFA170]" />
                      Condutor:
                    </span>
                    <span className="text-[#F5F5F5] truncate max-w-[150px]">
                      {driver ? driver.nome : 'Nenhum'}
                    </span>
                  </div>

                  {vehicle.categoria === 'Alugado' && carrier && (
                    <div className="flex items-center justify-between text-[#888888]">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#BFA170]" />
                        Locadora:
                      </span>
                      <span className="text-[#F5F5F5] truncate max-w-[150px]">{carrier.nome}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
                <button
                  onClick={() => setViewingVehicle(vehicle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#F5F5F5] bg-[#121212] hover:bg-[#1C1C1C] border border-[#1C1C1C] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#BFA170]" />
                  Ficha Técnica
                </button>

                <div className="flex items-center gap-2">
                  {canAddOrEdit && (
                    <button
                      onClick={() => handleOpenEdit(vehicle)}
                      className="p-1.5 text-[#888888] hover:text-[#F5F5F5] transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => onDeleteVehicle(vehicle.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredVehicles.length === 0 && (
          <div className="col-span-full py-12 text-center bg-[#0C0C0C] border border-[#1C1C1C] p-6">
            <Car className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <h3 className="text-sm font-serif font-bold text-[#F5F5F5]">Nenhum veículo encontrado</h3>
            <p className="text-xs text-[#888888] mt-1">Ajuste os filtros de busca para visualizar mais resultados.</p>
          </div>
        )}
      </div>

      {/* Viewing Vehicle Modal */}
      {viewingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0C0C0C] border border-[#1C1C1C] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold bg-[#161616] text-[#BFA170] px-3 py-1 border border-[#BFA170]/40">
                  {viewingVehicle.placa}
                </span>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#F5F5F5]">
                    {viewingVehicle.marca} {viewingVehicle.modelo}
                  </h3>
                  <p className="text-xs text-[#888888]">
                    Especificações Técnicas da Unidade
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingVehicle(null)}
                className="p-1.5 text-[#888888] hover:text-[#F5F5F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#080808] border border-[#1C1C1C] text-xs">
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase tracking-wider">RENAVAM</span>
                  <strong className="text-[#F5F5F5]">{viewingVehicle.renavam}</strong>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase tracking-wider">Chassi</span>
                  <strong className="text-[#F5F5F5] uppercase">{viewingVehicle.chassi}</strong>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase tracking-wider">Ano / Cor</span>
                  <strong className="text-[#F5F5F5]">{viewingVehicle.ano} • {viewingVehicle.cor}</strong>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase tracking-wider">Odômetro</span>
                  <strong className="text-[#BFA170]">{(viewingVehicle.odometro_atual || 0).toLocaleString('pt-BR')} km</strong>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase tracking-wider">Centro de Custo</span>
                  <strong className="text-[#F5F5F5]">{viewingVehicle.centro_de_custo}</strong>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase tracking-wider">Aquisição</span>
                  <strong className="text-[#F5F5F5]">{new Date(viewingVehicle.data_aquisicao).toLocaleDateString('pt-BR')}</strong>
                </div>
              </div>

              {viewingVehicle.observacoes && (
                <div className="p-4 bg-[#080808] border border-[#1C1C1C]">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#BFA170] mb-1">Observações Operacionais</p>
                  <p className="text-xs text-[#888888]">{viewingVehicle.observacoes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#1C1C1C]">
              <button
                onClick={() => setViewingVehicle(null)}
                className="px-4 py-2 text-xs uppercase tracking-widest bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] hover:border-[#BFA170]"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0C0C0C] border border-[#1C1C1C] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <h3 className="text-lg font-serif font-bold text-[#F5F5F5]">
                {editingVehicle ? 'Editar Veículo' : 'Cadastrar Veículo'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-[#888888] hover:text-[#F5F5F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Placa *</label>
                  <input
                    type="text"
                    value={formData.placa || ''}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                    placeholder="ABC1D23"
                  />
                  {formErrors.placa && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.placa}</p>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Marca *</label>
                  <input
                    type="text"
                    value={formData.marca || ''}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                    placeholder="Toyota, VW..."
                  />
                  {formErrors.marca && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.marca}</p>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Modelo *</label>
                  <input
                    type="text"
                    value={formData.modelo || ''}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                    placeholder="Corolla, Hilux..."
                  />
                  {formErrors.modelo && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.modelo}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">RENAVAM *</label>
                  <input
                    type="text"
                    value={formData.renavam || ''}
                    onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                  {formErrors.renavam && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.renavam}</p>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Chassi *</label>
                  <input
                    type="text"
                    value={formData.chassi || ''}
                    onChange={(e) => setFormData({ ...formData, chassi: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                  {formErrors.chassi && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.chassi}</p>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Ano</label>
                  <input
                    type="number"
                    value={formData.ano || ''}
                    onChange={(e) => setFormData({ ...formData, ano: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Tipo de Veículo</label>
                  <select
                    value={formData.tipo || 'Passeio'}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  >
                    <option value="Passeio">Passeio</option>
                    <option value="Utilitário">Utilitário</option>
                    <option value="SUV">SUV</option>
                    <option value="Caminhão">Caminhão</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Categoria de Posse</label>
                  <select
                    value={formData.categoria || 'Próprio'}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as 'Próprio' | 'Alugado' })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  >
                    <option value="Próprio">Próprio</option>
                    <option value="Alugado">Alugado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Status Operacional</label>
                  <select
                    value={formData.status || 'Ativo'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Reserva">Reserva</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Desmobilizado">Desmobilizado</option>
                  </select>
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
