export type UserRole = 'Administrador' | 'Gestor' | 'Operador' | 'Visualizador';
export type RoleType = UserRole;

export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  empresa_id?: string;
  created_at: string;
}

export interface Company {
  id: string;
  nome: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  created_at: string;
}

export interface Carrier {
  id: string;
  nome: string;
  cnpj: string;
  contato?: string;
  telefone?: string;
  created_at: string;
}

export type VehicleStatus = 'Ativo' | 'Reserva' | 'Manutenção' | 'Desmobilizado';

export interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  renavam: string;
  chassi: string;
  tipo: 'Passeio' | 'Utilitário' | 'SUV' | 'Caminhão' | string;
  categoria: 'Próprio' | 'Alugado' | string;
  empresa_id: string;
  centro_de_custo: string;
  locadora_id?: string;
  contrato_id?: string;
  condutor_id?: string;
  data_aquisicao: string;
  data_entrega?: string;
  status: VehicleStatus;
  observacoes?: string;
  documentos_anexos?: string[];
  fotos?: string[];
  odometro_atual?: number;
  created_at: string;
}

export interface Driver {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  departamento: string;
  empresa_id: string;
  cnh: string;
  categoria_cnh: string; // A, B, C, D, E, AB, etc.
  validade_cnh: string; // YYYY-MM-DD
  status?: 'Ativo' | 'Inativo';
  observacoes?: string;
  created_at: string;
}

export type FineStatus = 'Recebida' | 'Enviada' | 'Indicada' | 'Assinada' | 'Contestada' | 'Paga';

export interface Fine {
  id: string;
  veiculo_id: string;
  condutor_id?: string;
  data_infracao: string;
  auto_infracao: string;
  descricao: string;
  valor: number;
  pontuacao: number;
  orgao_emissor: string;
  status: FineStatus;
  documentos_anexos?: string[];
  created_at: string;
}

export type ContractStatus = 'Ativo' | 'Vencendo' | 'Vencido' | 'Suspenso';

export interface Contract {
  id: string;
  empresa_id: string;
  locadora_id: string;
  veiculo_id?: string;
  numero_contrato: string;
  valor_mensal: number;
  data_inicio: string;
  data_fim: string;
  renovacao_automatica: boolean;
  status: ContractStatus;
  created_at: string;
}

export interface MileageReading {
  id: string;
  veiculo_id: string;
  data_leitura: string;
  km_atual: number;
  km_contratado_mensal: number;
  observacoes?: string;
  created_at: string;
}

export type TagStatus = 'Ativo' | 'Inativo' | 'Bloqueado';

export interface Tag {
  id: string;
  numero?: string;
  numero_tag?: string;
  operadora: string; // Sem Parar, Veloe, ConectCar, Move Mais
  status?: TagStatus;
  ativa?: boolean;
  veiculo_id?: string;
  centro_de_custo?: string;
  saldo?: number;
  created_at: string;
}

export interface DecomChecklist {
  chave_reserva: boolean;
  manual_usuario: boolean;
  pneus_estepe: boolean;
  higienizacao_interna: boolean;
  isento_avarias: boolean;
}

export interface DecomCustos {
  avarias: number;
  quilometragem_excedente: number;
  taxas_administrativas: number;
  higienizacao: number;
}

export interface Demobilization {
  id: string;
  veiculo_id: string;
  data_entrega: string;
  km_final: number;
  status: 'Em Andamento' | 'Concluído';
  checklist: DecomChecklist;
  custos_devolucao: DecomCustos;
  custo_total?: number;
  observacoes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  usuario_nome: string;
  usuario_role: string;
  acao: string;
  modulo: string;
  detalhes: string;
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  description?: string;
}

export interface NotificationItem {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'cnh' | 'contrato' | 'manutencao' | 'km' | 'multa' | 'sistema';
  nivel: 'urgente' | 'alerta' | 'info';
  lida: boolean;
  data: string;
  link_modulo?: string;
}
