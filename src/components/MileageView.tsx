import React, { useState } from 'react';
import {
  Gauge,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  Car,
  TrendingUp,
  X,
  Shield,
  FileCheck2
} from 'lucide-react';
import { MileageReading, Vehicle, UserProfile } from '../types';

interface MileageViewProps {
  mileageReadings?: MileageReading[];
  vehicles?: Vehicle[];
  currentUser: UserProfile;
  onSaveReading: (reading: MileageReading) => void;
}

export const MileageView: React.FC<MileageViewProps> = ({
  mileageReadings = [],
  vehicles = [],
  currentUser,
  onSaveReading
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<MileageReading>>({
    veiculo_id: vehicles[0]?.id || '',
    data_leitura: new Date().toISOString().split('T')[0],
    km_atual: 0,
    km_contratado_mensal: 3000,
    observacoes: ''
  });

  const [formError, setFormError] = useState<string>('');

  const canEdit = currentUser.role !== 'Visualizador';

  const filteredReadings = mileageReadings
    .filter((m) => selectedVehicleId === 'all' || m.veiculo_id === selectedVehicleId)
    .sort((a, b) => new Date(b.data_leitura).getTime() - new Date(a.data_leitura).getTime());

  const getConsumptionInfo = (reading: MileageReading) => {
    const vehicleReadings = mileageReadings
      .filter((m) => m.veiculo_id === reading.veiculo_id)
      .sort((a, b) => new Date(a.data_leitura).getTime() - new Date(b.data_leitura).getTime());

    const currentIndex = vehicleReadings.findIndex((m) => m.id === reading.id);
    if (currentIndex > 0) {
      const prev = vehicleReadings[currentIndex - 1];
      const consumed = reading.km_atual - prev.km_atual;
      const allowance = reading.km_contratado_mensal || 3000;
      const isExcess = consumed > allowance;
      const excessKm = isExcess ? consumed - allowance : 0;
      const estimatedFee = excessKm * 0.5;

      return {
        hasPrevious: true,
        prevKm: prev.km_atual,
        consumed,
        allowance,
        isExcess,
        excessKm,
        estimatedFee
      };
    }

    return {
      hasPrevious: false,
      prevKm: 0,
      consumed: 0,
      allowance: reading.km_contratado_mensal || 3000,
      isExcess: false,
      excessKm: 0,
      estimatedFee: 0
    };
  };

  const handleOpenAdd = () => {
    const defaultVehicle = vehicles[0];
    const lastKnownKm = defaultVehicle ? defaultVehicle.odometro_atual || 0 : 0;

    setFormData({
      veiculo_id: defaultVehicle?.id || '',
      data_leitura: new Date().toISOString().split('T')[0],
      km_atual: lastKnownKm + 500,
      km_contratado_mensal: 3000,
      observacoes: ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.km_atual || formData.km_atual <= 0) {
      setFormError('Km atual deve ser superior a zero');
      return;
    }

    const newReading: MileageReading = {
      id: `km-${Date.now()}`,
      veiculo_id: formData.veiculo_id || vehicles[0]?.id || '',
      data_leitura: formData.data_leitura || new Date().toISOString().split('T')[0],
      km_atual: Number(formData.km_atual) || 0,
      km_contratado_mensal: Number(formData.km_contratado_mensal) || 3000,
      observacoes: formData.observacoes || '',
      created_at: new Date().toISOString()
    };

    onSaveReading(newReading);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#BFA170] font-bold mb-1">
            Controle de Franquias & Telemetria
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F5]">
            Leituras de Hodômetro (KM)
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Acompanhamento de consumo mensal de quilometragem e auditoria de excedentes de franquia contratada.
          </p>
        </div>

        {canEdit ? (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#BFA170] hover:bg-[#a88c5d] text-[#080808] font-bold text-xs uppercase tracking-widest transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Registrar Leitura
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#1C1C1C] text-xs text-[#888888]">
            <Shield className="w-3.5 h-3.5 text-[#BFA170]" />
            Modo {currentUser.role}: Apenas Leitura
          </div>
        )}
      </div>

      {/* Filter controls */}
      <div className="p-4 bg-[#0C0C0C] border border-[#1C1C1C]">
        <div className="max-w-md">
          <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1.5 font-semibold">
            Filtrar por Veículo
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
          >
            <option value="all">Todos os Veículos ({vehicles.length})</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} - {v.marca} {v.modelo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Readings */}
      <div className="bg-[#0C0C0C] border border-[#1C1C1C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F5F5F5]">
            <thead className="bg-[#080808] text-[10px] uppercase tracking-widest text-[#888888] border-b border-[#1C1C1C]">
              <tr>
                <th className="p-3.5">Data Leitura</th>
                <th className="p-3.5">Veículo</th>
                <th className="p-3.5">KM Registrado</th>
                <th className="p-3.5">Consumo Período</th>
                <th className="p-3.5">Franquia Mensal</th>
                <th className="p-3.5">Análise de Excesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C]">
              {filteredReadings.map((reading) => {
                const vehicle = vehicles.find((v) => v.id === reading.veiculo_id);
                const info = getConsumptionInfo(reading);

                return (
                  <tr key={reading.id} className="hover:bg-[#121212] transition-colors">
                    <td className="p-3.5 font-bold text-[#F5F5F5]">
                      {new Date(reading.data_leitura).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3.5">
                      {vehicle ? (
                        <div>
                          <p className="font-mono font-bold text-[#BFA170]">{vehicle.placa}</p>
                          <p className="text-[10px] text-[#888888]">{vehicle.modelo}</p>
                        </div>
                      ) : (
                        <span className="text-[#555555]">Veículo removido</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[#F5F5F5]">
                      {reading.km_atual.toLocaleString('pt-BR')} km
                    </td>
                    <td className="p-3.5 font-mono text-[#888888]">
                      {info.hasPrevious ? (
                        <span>+{info.consumed.toLocaleString('pt-BR')} km</span>
                      ) : (
                        <span className="text-[#555555]">Leitura Base</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[#888888]">
                      {info.allowance.toLocaleString('pt-BR')} km/mês
                    </td>
                    <td className="p-3.5">
                      {info.isExcess ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] uppercase font-bold bg-rose-950/80 text-rose-400 border border-rose-800/80">
                          Excesso +{info.excessKm.toLocaleString('pt-BR')} km
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] uppercase font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                          Dentro da Franquia
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReadings.length === 0 && (
          <div className="py-12 text-center p-6">
            <Gauge className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <h3 className="text-sm font-serif font-bold text-[#F5F5F5]">Nenhuma leitura registrada</h3>
            <p className="text-xs text-[#888888] mt-1">Nenhum registro de hodômetro para o veículo selecionado.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080808]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0C0C0C] border border-[#1C1C1C] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <h3 className="text-lg font-serif font-bold text-[#F5F5F5]">Lançar Leitura de Hodômetro</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-[#888888] hover:text-[#F5F5F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Veículo *</label>
                <select
                  value={formData.veiculo_id || ''}
                  onChange={(e) => setFormData({ ...formData, veiculo_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.marca} {v.modelo} (Atual: {v.odometro_atual} km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Data da Leitura *</label>
                <input
                  type="date"
                  value={formData.data_leitura || ''}
                  onChange={(e) => setFormData({ ...formData, data_leitura: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">Quilometragem Atual (KM) *</label>
                <input
                  type="number"
                  value={formData.km_atual || ''}
                  onChange={(e) => setFormData({ ...formData, km_atual: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-[#080808] border border-[#1C1C1C] text-[#F5F5F5] focus:outline-none focus:border-[#BFA170]"
                />
                {formError && <p className="text-[10px] text-rose-400 mt-0.5">{formError}</p>}
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
                  Salvar Leitura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
