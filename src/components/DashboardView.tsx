import React, { useState, useMemo } from 'react';
import {
  Car,
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Gauge,
  Building2,
  Search,
  ShieldAlert
} from 'lucide-react';
import {
  Vehicle,
  Driver,
  Fine,
  Contract,
  Company,
  MileageReading,
  Tag
} from '../types';

interface DashboardViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  fines: Fine[];
  contracts: Contract[];
  companies: Company[];
  mileageReadings?: MileageReading[];
  tags?: Tag[];
  selectedCompanyId?: string;
  selectedCostCenter?: string;
  onSelectCompany?: (id: string) => void;
  onSelectCostCenter?: (cc: string) => void;
  onNavigate?: (view: string) => void;
  onNavigateView?: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = (props) => {
  const {
    vehicles = [],
    drivers = [],
    fines = [],
    contracts = [],
    companies = [],
    mileageReadings = [],
    tags = []
  } = props;

  const navigate = props.onNavigate || props.onNavigateView || (() => {});

  // Filters
  const [localCompanyId, setLocalCompanyId] = useState<string>('all');
  const [localCostCenter, setLocalCostCenter] = useState<string>('all');
  const [driverSearchQuery, setDriverSearchQuery] = useState<string>('');

  const selectedCompanyId = props.selectedCompanyId ?? localCompanyId;
  const setSelectedCompanyId = (id: string) => {
    setLocalCompanyId(id);
    if (props.onSelectCompany) props.onSelectCompany(id);
  };

  const selectedCostCenter = props.selectedCostCenter ?? localCostCenter;
  const setSelectedCostCenter = (cc: string) => {
    setLocalCostCenter(cc);
    if (props.onSelectCostCenter) props.onSelectCostCenter(cc);
  };

  // Extract unique cost centers
  const costCenters = useMemo(() => {
    const list = new Set<string>();
    vehicles.forEach((v) => {
      if (v.centro_de_custo) list.add(v.centro_de_custo);
    });
    return Array.from(list);
  }, [vehicles]);

  // Filtered vehicles base
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (selectedCompanyId !== 'all' && v.empresa_id !== selectedCompanyId) return false;
      if (selectedCostCenter !== 'all' && v.centro_de_custo !== selectedCostCenter) return false;
      return true;
    });
  }, [vehicles, selectedCompanyId, selectedCostCenter]);

  // Filtered drivers base
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      if (selectedCompanyId !== 'all' && d.empresa_id !== selectedCompanyId) return false;
      if (
        driverSearchQuery &&
        !d.nome.toLowerCase().includes(driverSearchQuery.toLowerCase()) &&
        !d.cnh.includes(driverSearchQuery)
      ) {
        return false;
      }
      return true;
    });
  }, [drivers, selectedCompanyId, driverSearchQuery]);

  // Calculations
  const totalVehiclesCount = filteredVehicles.length;
  const activeVehiclesCount = filteredVehicles.filter((v) => v.status === 'Ativo').length;
  const maintenanceVehiclesCount = filteredVehicles.filter((v) => v.status === 'Manutenção').length;

  const totalDriversCount = filteredDrivers.length;

  // CNH status logic
  const now = new Date();
  const cnhAlerts = useMemo(() => {
    return drivers.map((d) => {
      const exp = new Date(d.validade_cnh);
      const diffTime = exp.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      let status: 'expired' | 'warning' | 'regular' = 'regular';
      if (diffDays < 0) status = 'expired';
      else if (diffDays <= 15) status = 'warning';
      return { driver: d, diffDays, status };
    });
  }, [drivers, now]);

  const expiredCnhsCount = cnhAlerts.filter((a) => a.status === 'expired').length;
  const warningCnhsCount = cnhAlerts.filter((a) => a.status === 'warning').length;

  // Fines calculation
  const openFines = useMemo(() => {
    return fines.filter((f) => f.status !== 'Paga');
  }, [fines]);

  const openFinesTotalValue = useMemo(() => {
    return openFines.reduce((acc, curr) => acc + curr.valor, 0);
  }, [openFines]);

  // Contracts expiration calculation (< 30 days)
  const expiringContracts = useMemo(() => {
    return contracts.filter((c) => {
      const end = new Date(c.data_fim);
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      return diffDays <= 30 && c.status !== 'Vencido';
    });
  }, [contracts, now]);

  // Monthly lease costs
  const monthlyLeaseCost = useMemo(() => {
    return contracts
      .filter((c) => c.status === 'Ativo' || c.status === 'Vencendo')
      .reduce((acc, c) => acc + c.valor_mensal, 0);
  }, [contracts]);

  // Mileage allowance excesses
  const excessMileageAlerts = useMemo(() => {
    const alerts: { vehicle: Vehicle; consumed: number; limit: number; excess: number }[] = [];
    vehicles.forEach((v) => {
      const vReadings = mileageReadings
        .filter((m) => m.veiculo_id === v.id)
        .sort((a, b) => new Date(a.data_leitura).getTime() - new Date(b.data_leitura).getTime());

      if (vReadings.length >= 2) {
        const last = vReadings[vReadings.length - 1];
        const prev = vReadings[vReadings.length - 2];
        const consumed = last.km_atual - prev.km_atual;
        if (consumed > last.km_contratado_mensal && last.km_contratado_mensal > 0) {
          alerts.push({
            vehicle: v,
            consumed,
            limit: last.km_contratado_mensal,
            excess: consumed - last.km_contratado_mensal
          });
        }
      }
    });
    return alerts;
  }, [vehicles, mileageReadings]);

  // Category distribution
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Passeio: 0, Utilitário: 0, SUV: 0, Caminhão: 0 };
    filteredVehicles.forEach((v) => {
      if (counts[v.tipo] !== undefined) counts[v.tipo]++;
      else counts[v.tipo] = 1;
    });
    return counts;
  }, [filteredVehicles]);

  return (
    <div className="space-y-8 p-2 sm:p-4">
      {/* Top Header & Executive Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1C1C1C]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#BFA170] font-bold mb-1">
            Overview & Telemetria Executive
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#F5F5F5]">
            Consola da Frota L'Elite
          </h2>
          <p className="text-xs text-[#888888] mt-1.5 max-w-2xl">
            Painel unificado para monitoramento de conformidade de condutores (CNH), passivos de infrações, sinistros, locações e controle analítico de quilometragem.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-[#888888] mb-0.5">Valoração da Frota</p>
            <p className="text-xl font-serif text-[#BFA170] font-bold">R$ {(totalVehiclesCount * 85000).toLocaleString('pt-BR')}</p>
          </div>
          <div className="w-[1px] h-8 bg-[#1C1C1C]" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-[#888888] mb-0.5">Custo Ativo Mensal</p>
            <p className="text-xl font-serif text-[#F5F5F5] font-bold">R$ {monthlyLeaseCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Analytical Filters Bar - Sophisticated Dark */}
      <div className="p-5 bg-[#0C0C0C] border border-[#1C1C1C] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#BFA170]">
            <Filter className="w-3.5 h-3.5" />
            Filtros Analíticos Avançados
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#555555]">
            Exibindo {totalVehiclesCount} veículo(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Company Selector */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1.5 font-semibold">
              Unidade Operacional / Filial
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170] font-medium"
            >
              <option value="all">Todas as Unidades ({companies.length})</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Cost Center Selector */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1.5 font-semibold">
              Centro de Custo
            </label>
            <select
              value={selectedCostCenter}
              onChange={(e) => setSelectedCostCenter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170] font-medium"
            >
              <option value="all">Todos os Centros de Custo</option>
              {costCenters.map((cc) => (
                <option key={cc} value={cc}>
                  {cc}
                </option>
              ))}
            </select>
          </div>

          {/* Driver Quick Search */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1.5 font-semibold">
              Busca Rápida Condutor / CNH
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#555555]" />
              <input
                type="text"
                value={driverSearchQuery}
                onChange={(e) => setDriverSearchQuery(e.target.value)}
                placeholder="Nome, CPF ou CNH..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#BFA170]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Vehicles */}
        <div
          onClick={() => navigate('vehicles')}
          className="bg-[#0C0C0C] border border-[#1C1C1C] p-6 hover:border-[#BFA170]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888] font-bold">
                Total de Frota Ativa
              </span>
              <Car className="w-4 h-4 text-[#BFA170] group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-4xl font-serif font-bold text-[#F5F5F5]">{totalVehiclesCount}</h3>
              <span className="text-xs font-serif text-emerald-400">
                {activeVehiclesCount} em trânsito
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1C1C1C] flex justify-between text-[10px] uppercase tracking-widest text-[#888888]">
            <span>{maintenanceVehiclesCount} em manutenção</span>
            <span className="text-[#BFA170] font-bold group-hover:underline flex items-center">
              Detalhes <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* KPI 2: Drivers & CNH */}
        <div
          onClick={() => navigate('drivers')}
          className="bg-[#0C0C0C] border border-[#1C1C1C] p-6 hover:border-[#BFA170]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888] font-bold">
                Condutores Habilitados
              </span>
              <Users className="w-4 h-4 text-[#BFA170] group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-4xl font-serif font-bold text-[#F5F5F5]">{totalDriversCount}</h3>
              {expiredCnhsCount > 0 ? (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {expiredCnhsCount} CNH expirada
                </span>
              ) : (
                <span className="text-xs font-serif text-emerald-400">100% regulares</span>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1C1C1C] flex justify-between text-[10px] uppercase tracking-widest text-[#888888]">
            <span>{warningCnhsCount} a vencer em 15d</span>
            <span className="text-[#BFA170] font-bold group-hover:underline flex items-center">
              Ver CNHs <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* KPI 3: Open Fines */}
        <div
          onClick={() => navigate('fines')}
          className="bg-[#0C0C0C] border border-[#1C1C1C] p-6 hover:border-[#BFA170]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888] font-bold">
                Infrações Pendentes
              </span>
              <FileText className="w-4 h-4 text-[#BFA170] group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-4xl font-serif font-bold text-[#F5F5F5]">{openFines.length}</h3>
              <span className="text-xs font-serif text-[#BFA170] font-bold">
                R$ {openFinesTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1C1C1C] flex justify-between text-[10px] uppercase tracking-widest text-[#888888]">
            <span>Aguardando liquidação</span>
            <span className="text-[#BFA170] font-bold group-hover:underline flex items-center">
              Gerenciar <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* KPI 4: Monthly Leasing */}
        <div
          onClick={() => navigate('contracts')}
          className="bg-[#0C0C0C] border border-[#1C1C1C] p-6 hover:border-[#BFA170]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888] font-bold">
                Custo de Locação Mensal
              </span>
              <DollarSign className="w-4 h-4 text-[#BFA170] group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-serif font-bold text-[#F5F5F5]">
                R$ {monthlyLeaseCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1C1C1C] flex justify-between text-[10px] uppercase tracking-widest text-[#888888]">
            <span>{expiringContracts.length} contratos expiram em 30d</span>
            <span className="text-[#BFA170] font-bold group-hover:underline flex items-center">
              Contratos <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>
      </div>

      {/* Critical Operational Alerts Panel */}
      <div className="bg-[#0C0C0C] border border-[#1C1C1C] p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-rose-500/40 bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-[#F5F5F5]">
                Central de Alertas Críticos da Operação
              </h3>
              <p className="text-xs text-[#888888] mt-0.5">
                Exigências regulatórias, renovações de CNH e alertas de estouro de franquia contratada.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 bg-[#161616] border border-[#1C1C1C] text-[#BFA170]">
            Ação Prioritária
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CNH Alerts */}
          {cnhAlerts
            .filter((a) => a.status !== 'regular')
            .map(({ driver, diffDays, status }) => (
              <div
                key={driver.id}
                onClick={() => navigate('drivers')}
                className={`p-4 border transition-colors cursor-pointer flex justify-between items-start ${
                  status === 'expired'
                    ? 'bg-rose-950/20 border-rose-800/50 text-rose-200 hover:border-rose-500'
                    : 'bg-[#121212] border-[#BFA170]/40 text-[#F5F5F5] hover:border-[#BFA170]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${status === 'expired' ? 'text-rose-400' : 'text-[#BFA170]'}`} />
                  <div>
                    <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${status === 'expired' ? 'text-rose-400' : 'text-[#BFA170]'}`}>
                      {status === 'expired' ? 'CNH VENCIDA' : 'CNH VENCENDO EM BREVE'}
                    </p>
                    <p className="text-xs font-bold text-[#F5F5F5] mt-1">{driver.nome}</p>
                    <p className="text-[11px] text-[#888888] mt-0.5">
                      Cat. {driver.categoria_cnh} • Validade:{' '}
                      {new Date(driver.validade_cnh).toLocaleDateString('pt-BR')} (
                      {status === 'expired' ? `vencida há ${Math.abs(diffDays)} dias` : `faltam ${diffDays} dias`}
                      )
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[#BFA170] font-bold underline shrink-0 ml-2">
                  Regularizar
                </span>
              </div>
            ))}

          {/* Expiring Contracts */}
          {expiringContracts.map((c) => {
            const daysLeft = Math.ceil(
              (new Date(c.data_fim).getTime() - now.getTime()) / (1000 * 3600 * 24)
            );
            return (
              <div
                key={c.id}
                onClick={() => navigate('contracts')}
                className="p-4 bg-[#121212] border border-[#1C1C1C] hover:border-[#BFA170] transition-colors cursor-pointer flex justify-between items-start"
              >
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#BFA170] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#BFA170]">
                      CONTRATO A VENCER ({daysLeft} DIAS)
                    </p>
                    <p className="text-xs font-bold text-[#F5F5F5] mt-1">Nº {c.numero_contrato}</p>
                    <p className="text-[11px] text-[#888888] mt-0.5">
                      Vencimento: {new Date(c.data_fim).toLocaleDateString('pt-BR')} • Valor R${' '}
                      {c.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[#BFA170] font-bold underline shrink-0 ml-2">
                  Renovar
                </span>
              </div>
            );
          })}

          {/* Excess Mileage Alerts */}
          {excessMileageAlerts.map(({ vehicle, consumed, limit, excess }) => (
            <div
              key={vehicle.id}
              onClick={() => navigate('mileage')}
              className="p-4 bg-[#121212] border border-rose-900/40 hover:border-rose-500 transition-colors cursor-pointer flex justify-between items-start"
            >
              <div className="flex items-start gap-3">
                <Gauge className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-rose-400">
                    EXCESSO DE FRANQUIA KM
                  </p>
                  <p className="text-xs font-bold text-[#F5F5F5] mt-1">
                    {vehicle.modelo} ({vehicle.placa})
                  </p>
                  <p className="text-[11px] text-[#888888] mt-0.5">
                    Consumido: {consumed.toLocaleString('pt-BR')} km / Limite:{' '}
                    {limit.toLocaleString('pt-BR')} km (+{excess.toLocaleString('pt-BR')} km excedente)
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#BFA170] font-bold underline shrink-0 ml-2">
                Ajustar KM
              </span>
            </div>
          ))}

          {/* Fallback if clean */}
          {cnhAlerts.filter((a) => a.status !== 'regular').length === 0 &&
            expiringContracts.length === 0 &&
            excessMileageAlerts.length === 0 && (
              <div className="col-span-full p-4 bg-[#121212] border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5]">
                    Nenhuma pendência crítica detectada
                  </p>
                  <p className="text-xs text-[#888888] mt-0.5">
                    Todos os veículos e condutores encontram-se em plena conformidade operacional.
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Visual Analytics & Distribution Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-4">
            <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-[#F5F5F5]">
              Distribuição por Tipo de Veículo
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-[#888888]">
              {totalVehiclesCount} unidades
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { type: 'Passeio', label: 'Veículos de Passeio / Executivo', color: 'bg-[#BFA170]' },
              { type: 'Utilitário', label: 'Utilitários & Furgões Carga', color: 'bg-emerald-500' },
              { type: 'SUV', label: 'SUVs Crossovers Premium', color: 'bg-sky-500' },
              { type: 'Caminhão', label: 'Caminhões & Logística Pesada', color: 'bg-amber-500' }
            ].map((item) => {
              const count = categoryCounts[item.type] || 0;
              const percentage = totalVehiclesCount > 0 ? Math.round((count / totalVehiclesCount) * 100) : 0;

              return (
                <div key={item.type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#888888] font-medium">{item.label}</span>
                    <span className="text-[#F5F5F5] font-serif font-bold">
                      {count} <span className="text-[#888888] text-[10px]">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1A1A1A] rounded-none overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Status Breakdown */}
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-4">
            <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-[#F5F5F5]">
              Status Operacional de Frota
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-emerald-400">Em Tempo Real</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            {[
              {
                status: 'Ativo',
                count: filteredVehicles.filter((v) => v.status === 'Ativo').length,
                border: 'border-emerald-500/30',
                text: 'text-emerald-400'
              },
              {
                status: 'Reserva',
                count: filteredVehicles.filter((v) => v.status === 'Reserva').length,
                border: 'border-sky-500/30',
                text: 'text-sky-400'
              },
              {
                status: 'Manutenção',
                count: filteredVehicles.filter((v) => v.status === 'Manutenção').length,
                border: 'border-[#BFA170]/30',
                text: 'text-[#BFA170]'
              },
              {
                status: 'Desmobilizado',
                count: filteredVehicles.filter((v) => v.status === 'Desmobilizado').length,
                border: 'border-[#333333]',
                text: 'text-[#888888]'
              }
            ].map((s) => (
              <div key={s.status} className={`p-4 bg-[#080808] border ${s.border}`}>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#888888]">
                  {s.status}
                </p>
                <p className={`text-3xl font-serif font-bold mt-2 ${s.text}`}>{s.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
