import React, { useState } from 'react';
import {
  Truck,
  Plus,
  CheckSquare,
  Square,
  DollarSign,
  AlertTriangle,
  X,
  Shield,
  CheckCircle2,
  Car,
  Calendar,
  FileCheck2,
  Clock
} from 'lucide-react';
import {
  Demobilization,
  DecomChecklist,
  DecomCustos,
  Vehicle,
  UserProfile
} from '../types';

interface DecomViewProps {
  demobilizations?: Demobilization[];
  vehicles?: Vehicle[];
  currentUser: UserProfile;
  onSaveDecom: (decom: Demobilization) => void;
}

export const DecomView: React.FC<DecomViewProps> = ({
  demobilizations = [],
  vehicles = [],
  currentUser,
  onSaveDecom
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingDecom, setViewingDecom] = useState<Demobilization | null>(null);

  const [formData, setFormData] = useState<{
    veiculo_id: string;
    data_entrega: string;
    km_final: number;
    status: 'Em Andamento' | 'Concluído';
    checklist: DecomChecklist;
    custos_devolucao: DecomCustos;
    observacoes: string;
  }>({
    veiculo_id: vehicles[0]?.id || '',
    data_entrega: new Date().toISOString().split('T')[0],
    km_final: vehicles[0]?.odometro_atual || 0,
    status: 'Em Andamento',
    checklist: {
      chave_reserva: true,
      manual_usuario: true,
      pneus_estepe: true,
      higienizacao_interna: true,
      isento_avarias: true
    },
    custos_devolucao: {
      avarias: 0,
      quilometragem_excedente: 0,
      taxas_administrativas: 0,
      higienizacao: 0
    },
    observacoes: ''
  });

  const canEdit = currentUser.role !== 'Visualizador';

  const handleOpenAdd = () => {
    const v = vehicles[0];
    setFormData({
      veiculo_id: v?.id || '',
      data_entrega: new Date().toISOString().split('T')[0],
      km_final: v?.odometro_atual || 0,
      status: 'Em Andamento',
      checklist: {
        chave_reserva: true,
        manual_usuario: true,
        pneus_estepe: true,
        higienizacao_interna: true,
        isento_avarias: true
      },
      custos_devolucao: {
        avarias: 0,
        quilometragem_excedente: 0,
        taxas_administrativas: 0,
        higienizacao: 0
      },
      observacoes: ''
    });
    setIsFormOpen(true);
  };

  const handleVehicleSelect = (vId: string) => {
    const v = vehicles.find((item) => item.id === vId);
    setFormData((prev) => ({
      ...prev,
      veiculo_id: vId,
      km_final: v?.odometro_atual || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalCustos =
      Number(formData.custos_devolucao.avarias || 0) +
      Number(formData.custos_devolucao.quilometragem_excedente || 0) +
      Number(formData.custos_devolucao.taxas_administrativas || 0) +
      Number(formData.custos_devolucao.higienizacao || 0);

    const newDecom: Demobilization = {
      id: `decom-${Date.now()}`,
      veiculo_id: formData.veiculo_id,
      data_entrega: formData.data_entrega,
      km_final: Number(formData.km_final),
      status: formData.status,
      checklist: formData.checklist,
      custos_devolucao: {
        avarias: Number(formData.custos_devolucao.avarias || 0),
        quilometragem_excedente: Number(formData.custos_devolucao.quilometragem_excedente || 0),
        taxas_administrativas: Number(formData.custos_devolucao.taxas_administrativas || 0),
        higienizacao: Number(formData.custos_devolucao.higienizacao || 0)
      },
      custo_total: totalCustos,
      observacoes: formData.observacoes,
      created_at: new Date().toISOString()
    };

    onSaveDecom(newDecom);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#BFA170] font-bold mb-1">
            Encerramento de Ciclo & Vistoria de Devolução
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F5]">
            Desmobilização de Veículos
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Auditoria de checklists de devolução a locadoras, avarias e encerramento administrativo.
          </p>
        </div>

        {canEdit ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#BFA170] hover:bg-[#a88c5d] text-[#080808] font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Iniciar Desmobilização
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#1C1C1C] text-xs text-[#888888]">
            <Shield className="w-3.5 h-3.5 text-[#BFA170]" />
            Modo {currentUser.role}: Apenas Leitura
          </div>
        )}
      </div>

      {/* Grid of Demobilizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {demobilizations.map((decom) => {
          const vehicle = vehicles.find((v) => v.id === decom.veiculo_id);

          return (
            <div
              key={decom.id}
              className="p-5 bg-[#0C0C0C] border border-[#1C1C1C] hover:border-[#BFA170]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1C1C1C]">
                  <span className="font-mono text-sm font-bold bg-[#161616] text-[#BFA170] px-2.5 py-0.5 border border-[#BFA170]/30 tracking-wider">
                    {vehicle?.placa || 'PLACA N/A'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${
                      decom.status === 'Concluído'
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
                        : 'bg-amber-950/80 text-amber-400 border-amber-800/80'
                    }`}
                  >
                    {decom.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-[#888888]">
                  <div className="flex items-center justify-between">
                    <span>Veículo:</span>
                    <span className="font-serif font-bold text-[#F5F5F5]">
                      {vehicle ? `${vehicle.marca} ${vehicle.modelo}` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Data de Devolução:</span>
                    <span className="text-[#F5F5F5]">{new Date(decom.data_entrega).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>KM Final:</span>
                    <span className="font-mono font-bold text-[#F5F5F5]">{decom.km_final.toLocaleString('pt-BR')} km</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1C1C1C] pt-2">
                    <span className="text-[10px] uppercase tracking-wider">Custos de Devolução:</span>
                    <span className="text-sm font-serif font-bold text-[#BFA170]">
                      R$ {(decom.custo_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
                <button
                  onClick={() => setViewingDecom(decom)}
                  className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold text-[#F5F5F5] bg-[#121212] hover:bg-[#1C1C1C] border border-[#1C1C1C]"
                >
                  Ver Checklist & Avarias
                </button>
              </div>
            </div>
          );
        })}

        {demobilizations.length === 0 && (
          <div className="col-span-full py-12 text-center bg-[#0C0C0C] border border-[#1C1C1C] p-6">
            <Truck className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <h3 className="text-sm font-serif font-bold text-[#F5F5F5]">Nenhuma desmobilização em andamento</h3>
            <p className="text-xs text-[#888888] mt-1">Todos os veículos encontram-se ativos em frota regular.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#0C0C0C] border border-[#1C1C1C] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <h3 className="text-lg font-serif font-bold text-[#F5F5F5]">Iniciar Processo de Desmobilização</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-[#888888] hover:text-[#F5F5F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Veículo a Devolver *</label>
                  <select
                    value={formData.veiculo_id}
                    onChange={(e) => handleVehicleSelect(e.target.value)}
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
                  <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Data de Devolução *</label>
                  <input
                    type="date"
                    value={formData.data_entrega}
                    onChange={(e) => setFormData({ ...formData, data_entrega: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#080808] border border-[#1C1C1C] space-y-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#BFA170]">
                  Checklist de Conformidade de Devolução
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#888888]">
                  {[
                    { key: 'chave_reserva', label: 'Chave Reserva Presente' },
                    { key: 'manual_usuario', label: 'Manual do Proprietário' },
                    { key: 'pneus_estepe', label: 'Pneus e Estepe em Conformidade' },
                    { key: 'higienizacao_interna', label: 'Higienização Interna Concluída' },
                    { key: 'isento_avarias', label: 'Isento de Avarias Estruturais' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer text-[#F5F5F5]">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.checklist[item.key as keyof DecomChecklist])}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            checklist: {
                              ...formData.checklist,
                              [item.key]: e.target.checked
                            }
                          })
                        }
                        className="accent-[#BFA170]"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
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
                  Registrar Devolução
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
