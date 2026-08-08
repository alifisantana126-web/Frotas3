import React, { useState, useEffect } from 'react';
import { dbEngine, isSupabaseConfigured } from './lib/supabase';
import {
  UserProfile,
  Company,
  Carrier,
  Vehicle,
  Driver,
  Fine,
  Contract,
  MileageReading,
  Tag,
  Demobilization,
  AuditLog,
  ToastMessage
} from './types';

// Views
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog';
import { DashboardView } from './components/DashboardView';
import { VehiclesView } from './components/VehiclesView';
import { DriversView } from './components/DriversView';
import { FinesView } from './components/FinesView';
import { ContractsView } from './components/ContractsView';
import { MileageView } from './components/MileageView';
import { TagsView } from './components/TagsView';
import { DecomView } from './components/DecomView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

import { Menu, Shield, Moon, Sun, Building2, Bell, AlertTriangle } from 'lucide-react';

export default function App() {
  // Navigation & User State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('frotas_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Users for Role Switch Simulation
  const [usersList] = useState<UserProfile[]>([
    {
      id: 'u-1',
      nome: 'Carlos Silva',
      email: 'carlos.silva@frotas.corp.br',
      role: 'Administrador',
      empresa_id: 'emp-1'
    },
    {
      id: 'u-2',
      nome: 'Ana Souza',
      email: 'ana.souza@frotas.corp.br',
      role: 'Gestor',
      empresa_id: 'emp-1'
    },
    {
      id: 'u-3',
      nome: 'Roberto Lima',
      email: 'roberto.lima@frotas.corp.br',
      role: 'Operador',
      empresa_id: 'emp-2'
    },
    {
      id: 'u-4',
      nome: 'Juliana Costa',
      email: 'juliana.costa@frotas.corp.br',
      role: 'Visualizador',
      empresa_id: 'emp-1'
    }
  ]);

  const [currentUser, setCurrentUser] = useState<UserProfile>(usersList[0]);

  // Global Filters
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>('all');

  // Entity Data State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [mileageReadings, setMileageReadings] = useState<MileageReading[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [demobilizations, setDemobilizations] = useState<Demobilization[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: 'vehicle' | 'driver' | 'fine' | 'contract' | 'tag';
    title: string;
    message: string;
  } | null>(null);

  // Initial Load & Dark Mode synchronization
  useEffect(() => {
    // Sync theme with localStorage and document root
    localStorage.setItem('frotas_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load Data from LocalDbEngine & Sync from Supabase if configured
    refreshAllData();
    if (isSupabaseConfigured) {
      dbEngine.syncFromSupabase().then(() => {
        refreshAllData();
      });
    }
  }, [theme]);

  const refreshAllData = () => {
    setCompanies(dbEngine.getCompanies());
    setCarriers(dbEngine.getCarriers());
    setVehicles(dbEngine.getVehicles());
    setDrivers(dbEngine.getDrivers());
    setFines(dbEngine.getFines());
    setContracts(dbEngine.getContracts());
    setMileageReadings(dbEngine.getMileageReadings());
    setTags(dbEngine.getTags());
    setDemobilizations(dbEngine.getDemobilizations());
    setAuditLogs(dbEngine.getAuditLogs());
  };

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logAudit = (modulo: string, acao: string, detalhes: string) => {
    dbEngine.logAudit(currentUser, modulo, acao, detalhes);
    setAuditLogs(dbEngine.getAuditLogs());
  };

  // HANDLERS FOR VEHICLES
  const handleSaveVehicle = (vehicle: Vehicle) => {
    const isEdit = vehicles.some((v) => v.id === vehicle.id);
    dbEngine.saveVehicle(vehicle);
    refreshAllData();

    logAudit('Veículos', isEdit ? 'Edição' : 'Cadastro', `Veículo ${vehicle.placa} (${vehicle.modelo})`);
    showToast('success', 'Veículo Salvo', `O veículo ${vehicle.placa} foi registrado com sucesso.`);
  };

  const handleDeleteVehicle = (id: string) => {
    const v = vehicles.find((item) => item.id === id);
    if (!v) return;

    setDeleteTarget({
      id,
      type: 'vehicle',
      title: 'Excluir Veículo da Frota',
      message: `Tem certeza que deseja excluir o veículo ${v.placa} (${v.modelo})? Todos os históricos associados serão mantidos em arquivo.`
    });
  };

  // HANDLERS FOR DRIVERS
  const handleSaveDriver = (driver: Driver) => {
    const isEdit = drivers.some((d) => d.id === driver.id);
    dbEngine.saveDriver(driver);
    refreshAllData();

    logAudit('Condutores', isEdit ? 'Edição' : 'Cadastro', `Condutor ${driver.nome} (CNH ${driver.cnh})`);
    showToast('success', 'Condutor Salvo', `Dados de ${driver.nome} atualizados com sucesso.`);
  };

  const handleDeleteDriver = (id: string) => {
    const d = drivers.find((item) => item.id === id);
    if (!d) return;

    setDeleteTarget({
      id,
      type: 'driver',
      title: 'Desvincular Condutor',
      message: `Deseja desvincular o motorista ${d.nome}? Esta ação removerá a pontuação ativa no sistema.`
    });
  };

  // HANDLERS FOR FINES
  const handleSaveFine = (fine: Fine) => {
    const isEdit = fines.some((f) => f.id === fine.id);
    dbEngine.saveFine(fine);
    refreshAllData();

    logAudit('Multas', isEdit ? 'Edição' : 'Nova Infração', `Auto de infração ${fine.auto_infracao}`);
    showToast('success', 'Multa Registrada', `Infração ${fine.auto_infracao} salva com sucesso.`);
  };

  const handleDeleteFine = (id: string) => {
    const f = fines.find((item) => item.id === id);
    if (!f) return;

    setDeleteTarget({
      id,
      type: 'fine',
      title: 'Cancelar Infração',
      message: `Deseja remover o auto de infração ${f.auto_infracao}?`
    });
  };

  // HANDLERS FOR CONTRACTS
  const handleSaveContract = (contract: Contract) => {
    const isEdit = contracts.some((c) => c.id === contract.id);
    dbEngine.saveContract(contract);
    refreshAllData();

    logAudit('Contratos', isEdit ? 'Edição' : 'Novo Contrato', `Contrato ${contract.numero_contrato}`);
    showToast('success', 'Contrato Salvo', `Contrato ${contract.numero_contrato} registrado com sucesso.`);
  };

  const handleDeleteContract = (id: string) => {
    const c = contracts.find((item) => item.id === id);
    if (!c) return;

    setDeleteTarget({
      id,
      type: 'contract',
      title: 'Rescindir Contrato de Locação',
      message: `Tem certeza que deseja cancelar o contrato nº ${c.numero_contrato}?`
    });
  };

  // HANDLERS FOR MILEAGE
  const handleSaveMileage = (reading: MileageReading) => {
    dbEngine.saveMileageReading(reading);
    refreshAllData();

    const vehicle = vehicles.find((v) => v.id === reading.veiculo_id);
    logAudit(
      'Odômetro',
      'Nova Leitura',
      `Leitura de ${reading.km_atual} km para ${vehicle?.placa || 'veículo'}`
    );
    showToast(
      'success',
      'Odômetro Atualizado',
      `Leitura registrada com sucesso (${reading.km_atual.toLocaleString('pt-BR')} km).`
    );
  };

  // HANDLERS FOR TAGS
  const handleSaveTag = (tag: Tag) => {
    const isEdit = tags.some((t) => t.id === tag.id);
    dbEngine.saveTag(tag);
    refreshAllData();

    logAudit('Pedágio Tags', isEdit ? 'Edição' : 'Nova Tag', `Tag ${tag.operadora} (${tag.numero_tag})`);
    showToast('success', 'Tag Salva', `Adesivo ${tag.numero_tag} atualizado.`);
  };

  const handleDeleteTag = (id: string) => {
    const t = tags.find((item) => item.id === id);
    if (!t) return;

    setDeleteTarget({
      id,
      type: 'tag',
      title: 'Desativar Tag de Pedágio',
      message: `Deseja desativar o adesivo ${t.operadora} (${t.numero_tag})?`
    });
  };

  // HANDLERS FOR DEMOBILIZATION
  const handleSaveDecom = (decom: Demobilization) => {
    dbEngine.saveDemobilization(decom);
    refreshAllData();

    const v = vehicles.find((item) => item.id === decom.veiculo_id);
    logAudit(
      'Desmobilização',
      'Processo Concluído',
      `Desmobilização de ${v?.placa || 'veículo'} finalizada.`
    );
    showToast(
      'success',
      'Desmobilização Concluída',
      `Ficha de devolução e laudo registrados com sucesso.`
    );
  };

  // CONFIRM DELETION EXECUTION
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'vehicle') {
      dbEngine.deleteVehicle(deleteTarget.id);
      showToast('info', 'Veículo Removido', 'O veículo foi removido do catálogo ativo.');
    } else if (deleteTarget.type === 'driver') {
      dbEngine.deleteDriver(deleteTarget.id);
      showToast('info', 'Condutor Desvinculado', 'O motorista foi desativado.');
    } else if (deleteTarget.type === 'fine') {
      dbEngine.deleteFine(deleteTarget.id);
      showToast('info', 'Infração Removida', 'A multa foi cancelada.');
    } else if (deleteTarget.type === 'contract') {
      dbEngine.deleteContract(deleteTarget.id);
      showToast('info', 'Contrato Cancelado', 'O contrato foi removido.');
    } else if (deleteTarget.type === 'tag') {
      dbEngine.deleteTag(deleteTarget.id);
      showToast('info', 'Tag Desativada', 'A tag foi removida.');
    }

    refreshAllData();
    logAudit('Sistema', 'Exclusão', `Exclusão efetuada: ${deleteTarget.title}`);
    setDeleteTarget(null);
  };

  // RESET DATA
  const handleResetData = () => {
    dbEngine.resetAll();
    refreshAllData();
    showToast('info', 'Dados Restaurados', 'Ambiente de simulação reinicializado com dados padrão.');
  };

  // Count active alerts for topbar counter
  const cnhAlerts = drivers.filter((d) => {
    const diff = Math.ceil((new Date(d.validade_cnh).getTime() - Date.now()) / (1000 * 3600 * 24));
    return diff <= 15;
  }).length;

  const contractAlerts = contracts.filter((c) => {
    const diff = Math.ceil((new Date(c.data_fim).getTime() - Date.now()) / (1000 * 3600 * 24));
    return diff <= 30;
  }).length;

  const totalAlerts = cnhAlerts + contractAlerts;

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] flex flex-col font-sans antialiased">
      {/* Toast Notifications Overlay */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.title || ''}
        description={deleteTarget?.message || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation Component */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => {
            setCurrentView(v);
            setIsMobileSidebarOpen(false);
          }}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          currentUser={currentUser}
          setCurrentUserRole={(r) => {
            const u = usersList.find((usr) => usr.role === r);
            if (u) setCurrentUser(u);
          }}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          unpaidFinesCount={fines.filter((f) => f.status !== 'Paga').length}
          urgentAlertsCount={totalAlerts}
        />

        {/* Main Application Canvas */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#080808]">
          {/* Top Bar Navigation Header */}
          <header className="sticky top-0 z-30 bg-[#0C0C0C]/90 backdrop-blur-md border-b border-[#1C1C1C] px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden p-2 text-[#888888] hover:text-[#F5F5F5] hover:bg-[#1C1C1C] transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Company Context Filter */}
              <div className="hidden sm:flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#BFA170]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#888888]">Empresa:</span>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] font-semibold focus:outline-none focus:border-[#BFA170]"
                >
                  <option value="all">Todas as Filiais do Grupo</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Side Header Controls */}
            <div className="flex items-center gap-3">
              {/* Status Indicator */}
              <div className="hidden md:flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#888888]">
                <div className="flex items-center gap-1.5" title={isSupabaseConfigured ? 'Supabase configurado e sincronizado' : 'Modo local ativado. Configure VITE_SUPABASE_URL no .env'}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>Supabase: {isSupabaseConfigured ? 'Conectado' : 'Modo Local'}</span>
                </div>
              </div>

              {/* Theme Toggle Button in Header */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 text-[#888888] hover:text-[#BFA170] hover:bg-[#121212] transition-colors border border-transparent hover:border-[#1C1C1C] rounded"
                title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-slate-700" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {/* Alert Badge Indicator */}
              <button
                onClick={() => setCurrentView('dashboard')}
                className="relative p-2 text-[#888888] hover:text-[#BFA170] hover:bg-[#121212] transition-colors border border-transparent hover:border-[#1C1C1C]"
                title="Alertas Críticos da Frota"
              >
                <Bell className="w-4 h-4" />
                {totalAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#BFA170] rounded-full ring-2 ring-[#0C0C0C] animate-pulse" />
                )}
              </button>
            </div>
          </header>

          {/* View Container Content */}
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {currentView === 'dashboard' && (
              <DashboardView
                vehicles={vehicles}
                drivers={drivers}
                fines={fines}
                contracts={contracts}
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                selectedCostCenter={selectedCostCenter}
                onSelectCompany={setSelectedCompanyId}
                onSelectCostCenter={setSelectedCostCenter}
                onNavigateView={setCurrentView}
              />
            )}

            {currentView === 'vehicles' && (
              <VehiclesView
                vehicles={vehicles}
                companies={companies}
                currentUser={currentUser}
                onSaveVehicle={handleSaveVehicle}
                onDeleteVehicle={handleDeleteVehicle}
              />
            )}

            {currentView === 'drivers' && (
              <DriversView
                drivers={drivers}
                vehicles={vehicles}
                companies={companies}
                fines={fines}
                currentUser={currentUser}
                onSaveDriver={handleSaveDriver}
                onDeleteDriver={handleDeleteDriver}
              />
            )}

            {currentView === 'fines' && (
              <FinesView
                fines={fines}
                vehicles={vehicles}
                drivers={drivers}
                currentUser={currentUser}
                onSaveFine={handleSaveFine}
                onDeleteFine={handleDeleteFine}
              />
            )}

            {currentView === 'contracts' && (
              <ContractsView
                contracts={contracts}
                companies={companies}
                carriers={carriers}
                vehicles={vehicles}
                currentUser={currentUser}
                onSaveContract={handleSaveContract}
                onDeleteContract={handleDeleteContract}
              />
            )}

            {currentView === 'mileage' && (
              <MileageView
                mileageReadings={mileageReadings}
                vehicles={vehicles}
                currentUser={currentUser}
                onSaveReading={handleSaveMileage}
              />
            )}

            {currentView === 'tags' && (
              <TagsView
                tags={tags}
                vehicles={vehicles}
                currentUser={currentUser}
                onSaveTag={handleSaveTag}
                onDeleteTag={handleDeleteTag}
              />
            )}

            {currentView === 'decom' && (
              <DecomView
                demobilizations={demobilizations}
                vehicles={vehicles}
                currentUser={currentUser}
                onSaveDecom={handleSaveDecom}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView
                vehicles={vehicles}
                drivers={drivers}
                fines={fines}
                contracts={contracts}
                companies={companies}
                mileageReadings={mileageReadings}
                tags={tags}
                currentUser={currentUser}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                companies={companies}
                carriers={carriers}
                auditLogs={auditLogs}
                currentUser={currentUser}
                onSaveCompany={(c) => {
                  dbEngine.saveCompany(c);
                  refreshAllData();
                  showToast('success', 'Empresa Salva', `Empresa ${c.nome} cadastrada com sucesso.`);
                }}
                onSaveCarrier={(car) => {
                  dbEngine.saveCarrier(car);
                  refreshAllData();
                  showToast('success', 'Locadora Salva', `Locadora ${car.nome} cadastrada com sucesso.`);
                }}
                onResetData={handleResetData}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
