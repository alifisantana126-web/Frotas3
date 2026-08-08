import React, { useState } from 'react';
import * as XLSX from 'xlsx';
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
  DollarSign,
  Download
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

  const handleExportExcel = (type: ReportType | 'all') => {
    const wb = XLSX.utils.book_new();
    const today = new Date().toISOString().slice(0, 10);

    // Sheet 1: Frota
    if (type === 'frota' || type === 'all') {
      const frotaData = vehicles.map((v) => ({
        'Placa': v.placa,
        'Marca': v.marca,
        'Modelo': v.modelo,
        'Ano': v.ano,
        'Cor': v.cor,
        'Categoria': v.categoria,
        'Tipo': v.tipo,
        'Centro de Custo': v.centro_de_custo || 'N/A',
        'Odômetro Atual (KM)': v.odometro_atual || 0,
        'Status': v.status
      }));
      const wsFrota = XLSX.utils.json_to_sheet(frotaData);
      XLSX.utils.book_append_sheet(wb, wsFrota, 'Inventário de Frota');
    }

    // Sheet 2: CNH
    if (type === 'cnh' || type === 'all') {
      const cnhData = drivers.map((d) => {
        const valDate = new Date(d.validade_cnh).getTime();
        const isExpired = valDate < new Date().getTime();
        return {
          'Nome': d.nome,
          'CPF': d.cpf,
          'Telefone': d.telefone,
          'Email': d.email,
          'Departamento': d.departamento || 'N/A',
          'CNH Nº': d.cnh,
          'Categoria CNH': d.categoria_cnh,
          'Validade CNH': new Date(d.validade_cnh).toLocaleDateString('pt-BR'),
          'Situação': isExpired ? 'Expirada' : 'Regular'
        };
      });
      const wsCNH = XLSX.utils.json_to_sheet(cnhData);
      XLSX.utils.book_append_sheet(wb, wsCNH, 'Validades CNH');
    }

    // Sheet 3: Custos / Contratos
    if (type === 'custos' || type === 'all') {
      const custosData = contracts.map((c) => ({
        'Nº Contrato': c.numero_contrato,
        'Locadora / Empresa': companies.find((comp) => comp.id === c.empresa_id)?.nome || 'N/A',
        'Data Início': new Date(c.data_inicio).toLocaleDateString('pt-BR'),
        'Data Fim': new Date(c.data_fim).toLocaleDateString('pt-BR'),
        'Valor Mensal (R$)': c.valor_mensal,
        'Renovação Automática': c.renovacao_automatica ? 'Sim' : 'Não',
        'Status': c.status
      }));
      const wsCustos = XLSX.utils.json_to_sheet(custosData);
      XLSX.utils.book_append_sheet(wb, wsCustos, 'Custos e Contratos');
    }

    // Sheet 4: Multas / Infrações
    if (type === 'multas' || type === 'all') {
      const multasData = fines.map((f) => ({
        'Auto Infração': f.auto_infracao,
        'Data Infração': new Date(f.data_infracao).toLocaleDateString('pt-BR'),
        'Placa Veículo': vehicles.find((v) => v.id === f.veiculo_id)?.placa || 'N/A',
        'Condutor': drivers.find((d) => d.id === f.condutor_id)?.nome || 'Não Indicado',
        'Descrição': f.descricao,
        'Órgão Emissor': f.orgao_emissor,
        'Pontuação': f.pontuacao,
        'Valor (R$)': f.valor,
        'Status': f.status
      }));
      const wsMultas = XLSX.utils.json_to_sheet(multasData);
      XLSX.utils.book_append_sheet(wb, wsMultas, 'Multas e Infrações');
    }

    const fileName = type === 'all'
      ? `relatorio_frotas_completo_${today}.xlsx`
      : `relatorio_${type}_${today}.xlsx`;

    XLSX.writeFile(wb, fileName);
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
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#BFA170] font-bold mb-1">
            Dossiê Executivo & Auditoria
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F5]">
            Central de Relatórios Corporativos
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Exportação executiva de relatórios de frota, CNH, custos de locação e infrações em formato Excel (.xlsx) e PDF.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExportExcel(selectedReport)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#161616] hover:bg-[#222222] text-[#BFA170] border border-[#BFA170]/40 hover:border-[#BFA170] font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
            title="Exportar a aba atual para arquivo Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Excel ({selectedReport.toUpperCase()})
          </button>

          <button
            onClick={() => handleExportExcel('all')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-600/50 font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
            title="Exportar todas as abas em uma planilha Excel completa"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Excel Completo (.xlsx)
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#BFA170] hover:bg-[#a88c5d] text-[#080808] font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
          >
            <Printer className="w-4 h-4" />
            Gerar PDF / Imprimir
          </button>
        </div>
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
              className={`p-4 border text-left transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-[#121212] border-[#BFA170] text-[#F5F5F5]'
                  : 'bg-[#0C0C0C] border-[#1C1C1C] text-[#888888] hover:text-[#F5F5F5] hover:border-[#333333]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#BFA170]' : 'text-[#888888]'}`} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold">{tab.label}</p>
                  <p className="text-[10px] text-[#555555]">Relatório Executivo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportExcel(tab.type as ReportType);
                }}
                className="p-1.5 hover:bg-[#1C1C1C] text-[#888888] hover:text-emerald-400 rounded transition-colors"
                title={`Baixar ${tab.label} em Excel`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
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
              FROTAS • GESTÃO DE FROTAS
            </span>
            <h3 className="text-xl font-serif font-bold text-[#F5F5F5] mt-1">
              {selectedReport === 'frota' && 'Relatório Analítico de Inventário de Frota'}
              {selectedReport === 'cnh' && 'Dossiê de Conformidade Regulatória & Validade CNH'}
              {selectedReport === 'custos' && 'Relatório de Consolidação de Custos de Locação'}
              {selectedReport === 'multas' && 'Extrato Analítico de Passivo de Infrações'}
            </h3>
            <p className="text-[10px] text-[#888888] uppercase tracking-widest mt-0.5">
              Emitido por: Sistema de Gestão de Frotas
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
