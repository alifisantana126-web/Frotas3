import React from 'react';
import {
  LayoutDashboard,
  Car,
  Users,
  FileText,
  FileSpreadsheet,
  Gauge,
  CreditCard,
  Truck,
  BarChart3,
  Settings,
  Sun,
  Moon,
  X,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

export type ActiveView =
  | 'dashboard'
  | 'vehicles'
  | 'drivers'
  | 'fines'
  | 'contracts'
  | 'mileage'
  | 'tags'
  | 'decom'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentView?: string;
  activeView?: ActiveView;
  onSelectView?: (view: string) => void;
  setActiveView?: (view: ActiveView) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  theme?: 'light' | 'dark';
  darkMode?: boolean;
  onToggleTheme?: () => void;
  setDarkMode?: (dark: boolean) => void;
  currentUser: UserProfile;
  setCurrentUserRole?: (role: UserRole) => void;
  unpaidFinesCount?: number;
  urgentAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const currentView = props.currentView || props.activeView || 'dashboard';
  const handleSelectView = (v: string) => {
    if (props.onSelectView) props.onSelectView(v);
    if (props.setActiveView) props.setActiveView(v as ActiveView);
    if (props.setIsMobileOpen) props.setIsMobileOpen(false);
  };

  const isMobileOpen = props.isMobileOpen || false;
  const setIsMobileOpen = props.setIsMobileOpen || (() => {});
  const theme = props.theme || (props.darkMode ? 'dark' : 'light');
  const onToggleTheme = props.onToggleTheme || (() => props.setDarkMode?.(!props.darkMode));
  const currentUser = props.currentUser;

  const [showRoleSelector, setShowRoleSelector] = React.useState(false);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: (props.urgentAlertsCount || 0) > 0 ? props.urgentAlertsCount : null,
      badgeColor: 'bg-[#BFA170] text-[#080808]'
    },
    {
      id: 'vehicles',
      label: 'Frota de Veículos',
      icon: Car
    },
    {
      id: 'drivers',
      label: 'Condutores & CNH',
      icon: Users
    },
    {
      id: 'fines',
      label: 'Gestão de Multas',
      icon: FileText,
      badge: (props.unpaidFinesCount || 0) > 0 ? props.unpaidFinesCount : null,
      badgeColor: 'bg-[#BFA170]/20 text-[#BFA170] border border-[#BFA170]/40'
    },
    {
      id: 'contracts',
      label: 'Contratos & Locação',
      icon: FileSpreadsheet
    },
    {
      id: 'mileage',
      label: 'Telemetria / KM',
      icon: Gauge
    },
    {
      id: 'tags',
      label: 'Pedágio & Tags',
      icon: CreditCard
    },
    {
      id: 'decom',
      label: 'Desmobilização',
      icon: Truck
    },
    {
      id: 'reports',
      label: 'Relatórios Executivos',
      icon: BarChart3
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings
    }
  ];

  const rolesList: UserRole[] = ['Administrador', 'Gestor', 'Operador', 'Visualizador'];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#080808]/80 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Main Container - Sophisticated Dark Theme */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-[#0C0C0C] text-[#F5F5F5] border-r border-[#1C1C1C] flex flex-col justify-between transition-transform duration-300 shrink-0 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="p-6 border-b border-[#1C1C1C] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 border border-[#BFA170] bg-[#080808] flex items-center justify-center text-[#BFA170] font-serif text-xl font-bold shadow-[0_0_15px_rgba(191,161,112,0.15)]">
              F
            </div>
            <div>
              <h1 className="font-serif font-bold text-[#F5F5F5] text-sm tracking-[0.15em] uppercase leading-none">
                FROTAS
              </h1>
              <p className="text-[10px] text-[#BFA170] uppercase tracking-[0.2em] font-semibold mt-1">
                Gestão Corporativa
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-[#888888] hover:text-[#F5F5F5] lg:hidden rounded-lg hover:bg-[#1C1C1C]"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-6 pt-5 pb-2 text-[10px] uppercase tracking-[0.25em] font-bold text-[#888888]">
          Navegação Principal
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-thin">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-150 rounded-none border-l-2 ${
                  isActive
                    ? 'bg-[#161616] text-[#BFA170] border-[#BFA170] shadow-[0_0_15px_rgba(191,161,112,0.1)]'
                    : 'border-transparent text-[#888888] hover:bg-[#121212] hover:text-[#F5F5F5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#BFA170]' : 'text-[#666666]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Area: Theme Toggle */}
        <div className="p-5 border-t border-[#1C1C1C] bg-[#080808] shrink-0">
          {/* Theme Switcher Button */}
          <div className="flex items-center justify-between text-[11px] font-medium text-[#888888]">
            <span className="uppercase tracking-widest text-[10px]">Tema Visual</span>
            <button
              onClick={onToggleTheme}
              className="px-3 py-1.5 flex items-center gap-2 bg-[#0C0C0C] hover:bg-[#121212] text-[#F5F5F5] border border-[#1C1C1C] transition-all rounded shadow-sm"
              title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Ativar modo escuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Ativar modo claro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
