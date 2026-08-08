import React, { useState } from 'react';
import {
  BarChart3,
  Printer,
  FileSpreadsheet,
  Users,
  Car,
  FileText,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign
} from 'lucide-react';
import {
  Vehicle,
  Driver,
  Fine,
  Contract,
  Company,
  MileageReading,
  Tag,
  UserProfile
} from '../types';

interface ReportsViewProps {
  vehicles?: Vehicle[];
  drivers?: Driver[];
  fines?: Fine[];
  contracts?: Contract[];
  companies?: Company[];
  mileageReadings?: MileageReading[];
  tags?: Tag[];
  currentUser: UserProfile;
}

type ReportType = 'frota' | 'cnh' | 'custos' | 'multas';

export const ReportsView: React.FC<ReportsViewProps> = ({
  vehicles = [],
  drivers = [],
  fines = [],
  contracts = [],
  companies = [],
  mileageReadings = [],
  tags = [],
  currentUser
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('frota');

  const handlePrint = () => {
    window.print();
  };

  const now = new Date();

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, nav, button, header, .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Header - Screen only */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#BFA170] font-bold mb-1">
            Dossiê Executivo & Auditoria
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F5]">
            Central de Relatórios Corporativos
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Exportação executiva de relatórios de frota, conformidade de CNH, custos de locação e infrações.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#BFA170] hover:bg-[#a88c5d] text-[#080808] font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
        >
          <Printer className="w-4 h-4" />
          Gerar PDF / Imprimir
        </button>
      </div>

      {/* Report Selector Tabs - Screen only */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { type: 'frota', label: 'Inventário de Frota', icon: Car },
          { type: 'cnh', label: 'Validades de CNH', icon: Users },
          { type: 'custos', label: 'Custo de Locação', icon: DollarSign },
          { type: 'multas', label: 'Resumo de Infrações', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedReport === tab.type;

          return (
            <button
              key={tab.type}
              onClick={() => setSelectedReport(tab.type as ReportType)}
              className={`p-4 border text-left transition-all flex items-center gap-3 ${
                isSelected
                  ? 'bg-[#121212] border-[#BFA170] text-[#F5F5F5]'
                  : 'bg-[#0C0C0C] border-[#1C1C1C] text-[#888888] hover:text-[#F5F5F5] hover:border-[#333333]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#BFA170]' : 'text-[#888888]'}`} />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold">{tab.label}</p>
                <p className="text-[10px] text-[#555555]">Relatório Executivo</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Printable Report Canvas */}
      <div className="print-container p-6 sm:p-8 bg-[#0C0C0C] border border-[#1C1C1C] space-y-6">
        {/* Report Document Header */}
        <div className="flex justify-between items-start border-b border-[#1C1C1C] pb-4">
          <div>
            <span className="font-serif font-bold text-lg text-[#BFA170] tracking-widest">
              GRUPO L'ELITE • GESTÃO DE FROTA
            </span>
            <h3 className="text-xl font-serif font-bold text-[#F5F5F5] mt-1">
              {selectedReport === 'frota' && 'Relatório Analítico de Inventário de Frota'}
              {selectedReport === 'cnh' && 'Dossiê de Conformidade Regulatória & Validade CNH'}
              {selectedReport === 'custos' && 'Relatório de Consolidação de Custos de Locação'}
              {selectedReport === 'multas' && 'Extrato Analítico de Passivo de Infrações'}
            </h3>
            <p className="text-[10px] text-[#888888] uppercase tracking-widest mt-0.5">
              Emitido por: {currentUser.nome} ({currentUser.role})
            </p>
          </div>
          <div className="text-right text-[10px] uppercase tracking-wider text-[#888888]">
            <p>Data de Emissão: {now.toLocaleDateString('pt-BR')}</p>
            <p>Status do Documento: Autenticado</p>
          </div>
        </div>

        {/* Report Content 1: Frota */}
        {selectedReport === 'frota' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-[#080808] border border-[#1C1C1C] text-xs">
              <div>
                <span className="text-[#888888] text-[10px] uppercase">Veículos Ativos</span>
                <p className="text-lg font-serif font-bold text-[#F5F5F5]">{vehicles.length}</p>
              </div>
              <div>
                <span className="text-[#888888] text-[10px] uppercase">Próprios / Alugados</span>
                <p className="text-lg font-serif font-bold text-[#BFA170]">
                  {vehicles.filter((v) => v.categoria === 'Próprio').length} /{' '}
                  {vehicles.filter((v) => v.categoria === 'Alugado').length}
                </p>
              </div>
              <div>
                <span className="text-[#888888] text-[10px] uppercase">Valoração Estimada</span>
                <p className="text-lg font-serif font-bold text-emerald-400">
                  R$ {(vehicles.length * 85000).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            <table className="w-full text-left text-xs text-[#F5F5F5]">
              <thead className="bg-[#080808] text-[10px] uppercase tracking-widest text-[#888888] border-b border-[#1C1C1C]">
                <tr>
                  <th className="p-3">Placa</th>
                  <th className="p-3">Marca / Modelo</th>
                  <th className="p-3">Ano / Cor</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Odômetro</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="p-3 font-mono font-bold text-[#BFA170]">{v.placa}</td>
                    <td className="p-3">{v.marca} {v.modelo}</td>
                    <td className="p-3 text-[#888888]">{v.ano} • {v.cor}</td>
                    <td className="p-3">{v.categoria}</td>
                    <td className="p-3 font-mono">{(v.odometro_atual || 0).toLocaleString('pt-BR')} km</td>
                    <td className="p-3">{v.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Content 2: CNH */}
        {selectedReport === 'cnh' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs text-[#F5F5F5]">
              <thead className="bg-[#080808] text-[10px] uppercase tracking-widest text-[#888888] border-b border-[#1C1C1C]">
                <tr>
                  <th className="p-3">Condutor</th>
                  <th className="p-3">CPF</th>
                  <th className="p-3">CNH Nº</th>
                  <th className="p-3">Cat.</th>
                  <th className="p-3">Validade CNH</th>
                  <th className="p-3">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {drivers.map((d) => {
                  const valDate = new Date(d.validade_cnh);
                  const isExpired = valDate.getTime() < now.getTime();

                  return (
                    <tr key={d.id}>
                      <td className="p-3 font-bold">{d.nome}</td>
                      <td className="p-3 text-[#888888]">{d.cpf}</td>
                      <td className="p-3 font-mono">{d.cnh}</td>
                      <td className="p-3 font-bold text-[#BFA170]">{d.categoria_cnh}</td>
                      <td className="p-3">{new Date(d.validade_cnh).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3">
                        {isExpired ? (
                          <span className="text-rose-400 font-bold uppercase text-[10px]">Expirada</span>
                        ) : (
                          <span className="text-emerald-400 font-bold uppercase text-[10px]">Regular</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Content 3: Custos */}
        {selectedReport === 'custos' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs text-[#F5F5F5]">
              <thead className="bg-[#080808] text-[10px] uppercase tracking-widest text-[#888888] border-b border-[#1C1C1C]">
                <tr>
                  <th className="p-3">Nº Contrato</th>
                  <th className="p-3">Locadora</th>
                  <th className="p-3">Vigência</th>
                  <th className="p-3">Custo Mensal (R$)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {contracts.map((c) => (
                  <tr key={c.id}>
                    <td className="p-3 font-mono font-bold text-[#BFA170]">{c.numero_contrato}</td>
                    <td className="p-3 font-semibold">{companies.find((comp) => comp.id === c.empresa_id)?.nome || 'Locadora'}</td>
                    <td className="p-3 text-[#888888]">
                      {new Date(c.data_inicio).toLocaleDateString('pt-BR')} a {new Date(c.data_fim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 font-serif font-bold text-[#F5F5F5]">
                      R$ {c.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Content 4: Multas */}
        {selectedReport === 'multas' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs text-[#F5F5F5]">
              <thead className="bg-[#080808] text-[10px] uppercase tracking-widest text-[#888888] border-b border-[#1C1C1C]">
                <tr>
                  <th className="p-3">Auto Infracao</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Veículo</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Valor (R$)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                {fines.map((f) => (
                  <tr key={f.id}>
                    <td className="p-3 font-mono font-bold text-[#BFA170]">{f.auto_infracao}</td>
                    <td className="p-3 text-[#888888]">{new Date(f.data_infracao).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3 font-mono">{vehicles.find((v) => v.id === f.veiculo_id)?.placa || 'N/A'}</td>
                    <td className="p-3 text-[#888888]">{f.descricao}</td>
                    <td className="p-3 font-serif font-bold text-[#F5F5F5]">
                      R$ {f.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3">{f.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
