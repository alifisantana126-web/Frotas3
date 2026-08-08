import { createClient } from '@supabase/supabase-js';
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
  NotificationItem,
  UserRole
} from '../types';

// Check if Supabase keys exist in env
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || metaEnv.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial deterministic seed data
const SEED_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    nome: 'TechFrota Soluções S/A',
    cnpj: '12.345.678/0001-90',
    email: 'contato@techfrota.com.br',
    telefone: '(11) 3456-7890',
    endereco: 'Av. Paulista, 1000 - São Paulo, SP',
    created_at: '2025-01-10T10:00:00Z'
  },
  {
    id: 'comp-2',
    nome: 'Logística Express LTDA',
    cnpj: '98.765.432/0001-10',
    email: 'operacoes@logisticaexpress.com.br',
    telefone: '(11) 4002-8922',
    endereco: 'Rua do Comercio, 450 - Campinas, SP',
    created_at: '2025-01-15T11:00:00Z'
  },
  {
    id: 'comp-3',
    nome: 'Filial Sul Serviços EIRELI',
    cnpj: '45.678.901/0001-22',
    email: 'sul@filialservicos.com.br',
    telefone: '(41) 3322-1100',
    endereco: 'Av. das Indústrias, 800 - Curitiba, PR',
    created_at: '2025-02-01T09:00:00Z'
  }
];

const SEED_CARRIERS: Carrier[] = [
  {
    id: 'loc-1',
    nome: 'Localiza Fleet S/A',
    cnpj: '16.670.085/0001-55',
    contato: 'Marcos Aurelio (Gerente de Conta)',
    telefone: '0800 979 2020',
    created_at: '2025-01-05T08:00:00Z'
  },
  {
    id: 'loc-2',
    nome: 'Movida Gestão de Frotas',
    cnpj: '07.976.147/0001-60',
    contato: 'Fernanda Rocha',
    telefone: '0800 702 8787',
    created_at: '2025-01-06T08:00:00Z'
  },
  {
    id: 'loc-3',
    nome: 'Unidas Terceirização e Frota',
    cnpj: '04.437.534/0001-30',
    contato: 'Atendimento Corporativo',
    telefone: '0800 771 5151',
    created_at: '2025-01-07T08:00:00Z'
  }
];

const SEED_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    nome: 'Ana Júlia Martins',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    email: 'ana.martins@techfrota.com.br',
    departamento: 'Operações e Entregas',
    empresa_id: 'comp-1',
    cnh: '00987654321',
    categoria_cnh: 'B',
    validade_cnh: '2026-08-15', // Expirando em 7 dias (Alerta Laranja)
    observacoes: 'Condutora principal do veículo utilitário Fiorino.',
    created_at: '2025-01-20T10:00:00Z'
  },
  {
    id: 'drv-2',
    nome: 'Carlos Eduardo Silva',
    cpf: '234.567.890-11',
    telefone: '(11) 97654-3210',
    email: 'carlos.silva@techfrota.com.br',
    departamento: 'Diretoria Executiva',
    empresa_id: 'comp-1',
    cnh: '00123456789',
    categoria_cnh: 'AB',
    validade_cnh: '2028-05-20', // Regular (Verde)
    observacoes: 'Diretor de Operações. Utiliza veículo sedan passeio.',
    created_at: '2025-01-21T10:00:00Z'
  },
  {
    id: 'drv-3',
    nome: 'Mariana Lima Santos',
    cpf: '345.678.901-22',
    telefone: '(19) 96543-2109',
    email: 'mariana.lima@logisticaexpress.com.br',
    departamento: 'Logística Regional',
    empresa_id: 'comp-2',
    cnh: '00456789123',
    categoria_cnh: 'D',
    validade_cnh: '2026-07-28', // Expirada há 11 dias (Alerta Vermelho Urgente)
    observacoes: 'Habilitada para transporte de passageiros e carga pesada.',
    created_at: '2025-01-22T10:00:00Z'
  }
];

const SEED_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    placa: 'BRA2E19',
    modelo: 'Corolla XEi 2.0 Flex',
    marca: 'Toyota',
    ano: 2023,
    cor: 'Prata Nevoa',
    renavam: '00129384756',
    chassi: '9BRBL3HE2P0129384',
    tipo: 'Passeio',
    categoria: 'Alugado',
    empresa_id: 'comp-1',
    centro_de_custo: 'CC-101 Diretoria',
    locadora_id: 'loc-1',
    contrato_id: 'ctr-1',
    condutor_id: 'drv-2',
    data_aquisicao: '2024-01-15',
    data_entrega: '2024-01-16',
    status: 'Ativo',
    observacoes: 'Veículo executivo cedido à diretoria corporativa.',
    odometro_atual: 42500,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'veh-2',
    placa: 'LOG8A99',
    modelo: 'Fiorino Endurance 1.4 EVO',
    marca: 'Fiat',
    ano: 2022,
    cor: 'Branco Banchisa',
    renavam: '00982374102',
    chassi: '9BD265322N1098237',
    tipo: 'Utilitário',
    categoria: 'Alugado',
    empresa_id: 'comp-2',
    centro_de_custo: 'CC-202 Operações',
    locadora_id: 'loc-2',
    contrato_id: 'ctr-2',
    condutor_id: 'drv-1',
    data_aquisicao: '2023-09-01',
    data_entrega: '2023-09-02',
    status: 'Ativo',
    observacoes: 'Frota operacional para entregas urbanas rápidas.',
    odometro_atual: 88200,
    created_at: '2023-09-01T10:00:00Z'
  },
  {
    id: 'veh-3',
    placa: 'KGM-4156',
    modelo: 'Compass Limited 1.3 T270',
    marca: 'Jeep',
    ano: 2024,
    cor: 'Preto Carbon',
    renavam: '00543216789',
    chassi: '98D654321P0054321',
    tipo: 'SUV',
    categoria: 'Próprio',
    empresa_id: 'comp-1',
    centro_de_custo: 'CC-101 Diretoria',
    condutor_id: 'drv-3',
    data_aquisicao: '2024-03-10',
    status: 'Ativo',
    observacoes: 'Veículo próprio da frota corporativa.',
    odometro_atual: 18900,
    created_at: '2024-03-10T10:00:00Z'
  },
  {
    id: 'veh-4',
    placa: 'TRK-8080',
    modelo: 'Constellation 24.280 6x2',
    marca: 'Volkswagen',
    ano: 2021,
    cor: 'Azul Boreal',
    renavam: '00776655443',
    chassi: '9BW321654M0077665',
    tipo: 'Caminhão',
    categoria: 'Próprio',
    empresa_id: 'comp-3',
    centro_de_custo: 'CC-303 Transporte Heavy',
    data_aquisicao: '2021-06-20',
    status: 'Manutenção',
    observacoes: 'Caminhão pesado em revisão de suspensão e freios.',
    odometro_atual: 165400,
    created_at: '2021-06-20T10:00:00Z'
  }
];

const SEED_CONTRACTS: Contract[] = [
  {
    id: 'ctr-1',
    empresa_id: 'comp-1',
    locadora_id: 'loc-1',
    veiculo_id: 'veh-1',
    numero_contrato: 'LOC-2024-8841',
    valor_mensal: 3850.00,
    data_inicio: '2024-01-15',
    data_fim: '2026-08-25', // Vencendo em 17 dias (Alerta)
    renovacao_automatica: false,
    status: 'Vencendo',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'ctr-2',
    empresa_id: 'comp-2',
    locadora_id: 'loc-2',
    veiculo_id: 'veh-2',
    numero_contrato: 'MOV-2023-1102',
    valor_mensal: 2400.00,
    data_inicio: '2023-09-01',
    data_fim: '2026-09-01', // Vencendo em 24 dias
    renovacao_automatica: true,
    status: 'Vencendo',
    created_at: '2023-09-01T10:00:00Z'
  }
];

const SEED_FINES: Fine[] = [
  {
    id: 'fine-1',
    veiculo_id: 'veh-1',
    condutor_id: 'drv-2',
    data_infracao: '2026-07-10',
    auto_infracao: 'M-98412',
    descricao: 'Transitar em velocidade superior à máxima permitida em até 20%',
    valor: 130.16,
    pontuacao: 4,
    orgao_emissor: 'DER-SP',
    status: 'Recebida',
    created_at: '2026-07-12T10:00:00Z'
  },
  {
    id: 'fine-2',
    veiculo_id: 'veh-2',
    condutor_id: 'drv-1',
    data_infracao: '2026-07-22',
    auto_infracao: 'CT-4401',
    descricao: 'Avançar o sinal vermelho do semáforo ou de parada obrigatória',
    valor: 293.47,
    pontuacao: 7,
    orgao_emissor: 'DSV-SP',
    status: 'Enviada',
    created_at: '2026-07-24T10:00:00Z'
  },
  {
    id: 'fine-3',
    veiculo_id: 'veh-3',
    condutor_id: 'drv-3',
    data_infracao: '2026-06-15',
    auto_infracao: 'PRF-8821',
    descricao: 'Transitar com o veículo em acostamentos ou rodovias sem autorização',
    valor: 880.41,
    pontuacao: 7,
    orgao_emissor: 'PRF-BR',
    status: 'Contestada',
    created_at: '2026-06-18T10:00:00Z'
  }
];

const SEED_MILEAGE: MileageReading[] = [
  {
    id: 'mil-1',
    veiculo_id: 'veh-1',
    data_leitura: '2026-07-01',
    km_atual: 40100,
    km_contratado_mensal: 3000,
    observacoes: 'Leitura de início de mês',
    created_at: '2026-07-01T08:00:00Z'
  },
  {
    id: 'mil-2',
    veiculo_id: 'veh-1',
    data_leitura: '2026-08-01',
    km_atual: 42500,
    km_contratado_mensal: 3000,
    observacoes: 'Consumo do mês: 2.400 km (Dentro da franquia)',
    created_at: '2026-08-01T08:00:00Z'
  },
  {
    id: 'mil-3',
    veiculo_id: 'veh-2',
    data_leitura: '2026-07-01',
    km_atual: 84350,
    km_contratado_mensal: 3000,
    observacoes: 'Leitura inicial de julho',
    created_at: '2026-07-01T08:00:00Z'
  },
  {
    id: 'mil-4',
    veiculo_id: 'veh-2',
    data_leitura: '2026-08-01',
    km_atual: 88200,
    km_contratado_mensal: 3000,
    observacoes: 'Consumo do mês: 3.850 km (EXCEDEU A FRANQUIA EM 850 KM!)',
    created_at: '2026-08-01T08:00:00Z'
  }
];

const SEED_TAGS: Tag[] = [
  {
    id: 'tag-1',
    numero: '0149982341',
    numero_tag: '0149982341',
    operadora: 'Sem Parar',
    status: 'Ativo',
    ativa: true,
    veiculo_id: 'veh-1',
    centro_de_custo: 'CC-101 Diretoria',
    saldo: 245.50,
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'tag-2',
    numero: '0882104921',
    numero_tag: '0882104921',
    operadora: 'Veloe',
    status: 'Ativo',
    ativa: true,
    veiculo_id: 'veh-2',
    centro_de_custo: 'CC-202 Operações',
    saldo: 112.00,
    created_at: '2023-09-10T10:00:00Z'
  },
  {
    id: 'tag-3',
    numero: '0991204855',
    numero_tag: '0991204855',
    operadora: 'ConectCar',
    status: 'Ativo',
    ativa: true,
    veiculo_id: 'veh-3',
    centro_de_custo: 'CC-101 Diretoria',
    saldo: 15.00,
    created_at: '2024-03-15T10:00:00Z'
  }
];

const SEED_DECOM: Demobilization[] = [
  {
    id: 'decom-1',
    veiculo_id: 'veh-2',
    data_entrega: '2026-08-28',
    km_final: 88200,
    status: 'Em Andamento',
    checklist: {
      chave_reserva: true,
      manual_usuario: true,
      pneus_estepe: true,
      higienizacao_interna: false,
      isento_avarias: false
    },
    custos_devolucao: {
      avarias: 650.00,
      quilometragem_excedente: 425.00,
      taxas_administrativas: 150.00,
      higienizacao: 180.00
    },
    observacoes: 'Veículo com pequenos riscos no para-choque traseiro e excesso de km contratado no mês.',
    created_at: '2026-08-01T10:00:00Z'
  }
];

const SEED_USERS: UserProfile[] = [
  {
    id: 'usr-admin',
    email: 'admin@frotas.com.br',
    nome: 'Rodrigo Alcantara (Admin)',
    role: 'Administrador',
    empresa_id: 'comp-1',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'usr-gestor',
    email: 'gestor@frotas.com.br',
    nome: 'Camila Albuquerque (Gestora)',
    role: 'Gestor',
    empresa_id: 'comp-1',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'usr-operador',
    email: 'operador@frotas.com.br',
    nome: 'Lucas Vasconcelos (Operador)',
    role: 'Operador',
    empresa_id: 'comp-2',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'usr-auditor',
    email: 'auditor@frotas.com.br',
    nome: 'Fernanda Auditoria (Visualizadora)',
    role: 'Visualizador',
    empresa_id: 'comp-1',
    created_at: '2025-01-01T00:00:00Z'
  }
];

// LocalStorage Helper Engine
class LocalDbEngine {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(`frotas_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`frotas_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  public init() {
    if (!localStorage.getItem('frotas_initialized')) {
      this.setStorage('companies', SEED_COMPANIES);
      this.setStorage('carriers', SEED_CARRIERS);
      this.setStorage('drivers', SEED_DRIVERS);
      this.setStorage('vehicles', SEED_VEHICLES);
      this.setStorage('contracts', SEED_CONTRACTS);
      this.setStorage('fines', SEED_FINES);
      this.setStorage('mileage', SEED_MILEAGE);
      this.setStorage('tags', SEED_TAGS);
      this.setStorage('decom', SEED_DECOM);
      this.setStorage('users', SEED_USERS);
      this.setStorage('logs', [
        {
          id: 'log-1',
          usuario_nome: 'Sistema Automático',
          usuario_role: 'Sistema',
          acao: 'Inicialização de Dados',
          modulo: 'Core',
          detalhes: 'Base de dados de simulação carregada com sucesso.',
          timestamp: new Date().toISOString()
        }
      ]);
      localStorage.setItem('frotas_initialized', 'true');
    }
  }

  // Generic Getters
  public getCompanies(): Company[] { return this.getStorage('companies', SEED_COMPANIES); }
  public getCarriers(): Carrier[] { return this.getStorage('carriers', SEED_CARRIERS); }
  public getDrivers(): Driver[] { return this.getStorage('drivers', SEED_DRIVERS); }
  public getVehicles(): Vehicle[] { return this.getStorage('vehicles', SEED_VEHICLES); }
  public getContracts(): Contract[] { return this.getStorage('contracts', SEED_CONTRACTS); }
  public getFines(): Fine[] { return this.getStorage('fines', SEED_FINES); }
  public getMileage(): MileageReading[] { return this.getStorage('mileage', SEED_MILEAGE); }
  public getMileageReadings(): MileageReading[] { return this.getMileage(); }
  public getTags(): Tag[] { return this.getStorage('tags', SEED_TAGS); }
  public getDecom(): Demobilization[] { return this.getStorage('decom', SEED_DECOM); }
  public getDemobilizations(): Demobilization[] { return this.getDecom(); }
  public getUsers(): UserProfile[] { return this.getStorage('users', SEED_USERS); }
  public getLogs(): AuditLog[] { return this.getStorage('logs', []); }
  public getAuditLogs(): AuditLog[] { return this.getLogs(); }

  // Setters / Updaters with Supabase Synchronization
  public saveCompanies(data: Company[]) { this.setStorage('companies', data); }
  public async saveCompany(company: Company) {
    const list = this.getCompanies();
    const idx = list.findIndex((c) => c.id === company.id);
    if (idx >= 0) list[idx] = company;
    else list.push(company);
    this.saveCompanies(list);

    if (supabase) {
      try {
        await supabase.from('companies').upsert(company);
      } catch (err) {
        console.error('Error saving company to Supabase:', err);
      }
    }
  }

  public saveCarriers(data: Carrier[]) { this.setStorage('carriers', data); }
  public async saveCarrier(carrier: Carrier) {
    const list = this.getCarriers();
    const idx = list.findIndex((c) => c.id === carrier.id);
    if (idx >= 0) list[idx] = carrier;
    else list.push(carrier);
    this.saveCarriers(list);

    if (supabase) {
      try {
        await supabase.from('carriers').upsert(carrier);
      } catch (err) {
        console.error('Error saving carrier to Supabase:', err);
      }
    }
  }

  public saveDrivers(data: Driver[]) { this.setStorage('drivers', data); }
  public async saveDriver(driver: Driver) {
    const list = this.getDrivers();
    const idx = list.findIndex((d) => d.id === driver.id);
    if (idx >= 0) list[idx] = driver;
    else list.push(driver);
    this.saveDrivers(list);

    if (supabase) {
      try {
        await supabase.from('drivers').upsert(driver);
      } catch (err) {
        console.error('Error saving driver to Supabase:', err);
      }
    }
  }
  public async deleteDriver(id: string) {
    this.saveDrivers(this.getDrivers().filter((d) => d.id !== id));
    if (supabase) {
      try {
        await supabase.from('drivers').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting driver from Supabase:', err);
      }
    }
  }

  public saveVehicles(data: Vehicle[]) { this.setStorage('vehicles', data); }
  public async saveVehicle(vehicle: Vehicle) {
    const list = this.getVehicles();
    const idx = list.findIndex((v) => v.id === vehicle.id);
    if (idx >= 0) list[idx] = vehicle;
    else list.push(vehicle);
    this.saveVehicles(list);

    if (supabase) {
      try {
        await supabase.from('vehicles').upsert(vehicle);
      } catch (err) {
        console.error('Error saving vehicle to Supabase:', err);
      }
    }
  }
  public async deleteVehicle(id: string) {
    this.saveVehicles(this.getVehicles().filter((v) => v.id !== id));
    if (supabase) {
      try {
        await supabase.from('vehicles').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting vehicle from Supabase:', err);
      }
    }
  }

  public saveContracts(data: Contract[]) { this.setStorage('contracts', data); }
  public async saveContract(contract: Contract) {
    const list = this.getContracts();
    const idx = list.findIndex((c) => c.id === contract.id);
    if (idx >= 0) list[idx] = contract;
    else list.push(contract);
    this.saveContracts(list);

    if (supabase) {
      try {
        await supabase.from('contracts').upsert(contract);
      } catch (err) {
        console.error('Error saving contract to Supabase:', err);
      }
    }
  }
  public async deleteContract(id: string) {
    this.saveContracts(this.getContracts().filter((c) => c.id !== id));
    if (supabase) {
      try {
        await supabase.from('contracts').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting contract from Supabase:', err);
      }
    }
  }

  public saveFines(data: Fine[]) { this.setStorage('fines', data); }
  public async saveFine(fine: Fine) {
    const list = this.getFines();
    const idx = list.findIndex((f) => f.id === fine.id);
    if (idx >= 0) list[idx] = fine;
    else list.push(fine);
    this.saveFines(list);

    if (supabase) {
      try {
        await supabase.from('fines').upsert(fine);
      } catch (err) {
        console.error('Error saving fine to Supabase:', err);
      }
    }
  }
  public async deleteFine(id: string) {
    this.saveFines(this.getFines().filter((f) => f.id !== id));
    if (supabase) {
      try {
        await supabase.from('fines').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting fine from Supabase:', err);
      }
    }
  }

  public saveMileage(data: MileageReading[]) { this.setStorage('mileage', data); }
  public async saveMileageReading(reading: MileageReading) {
    const list = this.getMileage();
    list.unshift(reading);
    this.saveMileage(list);

    // Also update vehicle's odometro_atual
    const vehicles = this.getVehicles();
    const vIdx = vehicles.findIndex((v) => v.id === reading.veiculo_id);
    if (vIdx >= 0 && reading.km_atual > (vehicles[vIdx].odometro_atual || 0)) {
      vehicles[vIdx].odometro_atual = reading.km_atual;
      this.saveVehicles(vehicles);
      if (supabase) {
        try {
          await supabase.from('vehicles').upsert(vehicles[vIdx]);
        } catch (err) {
          console.error('Error updating vehicle mileage in Supabase:', err);
        }
      }
    }

    if (supabase) {
      try {
        await supabase.from('mileage_readings').upsert(reading);
      } catch (err) {
        console.error('Error saving mileage reading to Supabase:', err);
      }
    }
  }

  public saveTags(data: Tag[]) { this.setStorage('tags', data); }
  public async saveTag(tag: Tag) {
    const list = this.getTags();
    const idx = list.findIndex((t) => t.id === tag.id);
    if (idx >= 0) list[idx] = tag;
    else list.push(tag);
    this.saveTags(list);

    if (supabase) {
      try {
        await supabase.from('tags').upsert(tag);
      } catch (err) {
        console.error('Error saving tag to Supabase:', err);
      }
    }
  }
  public async deleteTag(id: string) {
    this.saveTags(this.getTags().filter((t) => t.id !== id));
    if (supabase) {
      try {
        await supabase.from('tags').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting tag from Supabase:', err);
      }
    }
  }

  public saveDecom(data: Demobilization[]) { this.setStorage('decom', data); }
  public async saveDemobilization(decom: Demobilization) {
    const list = this.getDecom();
    const idx = list.findIndex((d) => d.id === decom.id);
    if (idx >= 0) list[idx] = decom;
    else list.push(decom);
    this.saveDecom(list);

    // If completed, update vehicle status to Desmobilizado
    if (decom.status === 'Concluído') {
      const vehicles = this.getVehicles();
      const vIdx = vehicles.findIndex((v) => v.id === decom.veiculo_id);
      if (vIdx >= 0) {
        vehicles[vIdx].status = 'Desmobilizado';
        this.saveVehicles(vehicles);
        if (supabase) {
          try {
            await supabase.from('vehicles').upsert(vehicles[vIdx]);
          } catch (err) {
            console.error('Error updating vehicle status in Supabase:', err);
          }
        }
      }
    }

    if (supabase) {
      try {
        await supabase.from('demobilizations').upsert(decom);
      } catch (err) {
        console.error('Error saving demobilization to Supabase:', err);
      }
    }
  }

  public async addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const logs = this.getLogs();
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.setStorage('logs', [newLog, ...logs]);

    if (supabase) {
      try {
        await supabase.from('audit_logs').insert(newLog);
      } catch (err) {
        console.error('Error adding audit log to Supabase:', err);
      }
    }
  }

  public logAudit(user: UserProfile, modulo: string, acao: string, detalhes: string) {
    this.addAuditLog({
      usuario_nome: user.nome,
      usuario_role: user.role,
      modulo,
      acao,
      detalhes
    });
  }

  public async syncFromSupabase() {
    if (!supabase) return false;
    try {
      const [
        { data: companies },
        { data: carriers },
        { data: drivers },
        { data: vehicles },
        { data: contracts },
        { data: fines },
        { data: mileage },
        { data: tags },
        { data: decom },
        { data: logs }
      ] = await Promise.all([
        supabase.from('companies').select('*'),
        supabase.from('carriers').select('*'),
        supabase.from('drivers').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('contracts').select('*'),
        supabase.from('fines').select('*'),
        supabase.from('mileage_readings').select('*'),
        supabase.from('tags').select('*'),
        supabase.from('demobilizations').select('*'),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false })
      ]);

      if (companies && companies.length) this.saveCompanies(companies);
      if (carriers && carriers.length) this.saveCarriers(carriers);
      if (drivers && drivers.length) this.saveDrivers(drivers);
      if (vehicles && vehicles.length) this.saveVehicles(vehicles);
      if (contracts && contracts.length) this.saveContracts(contracts);
      if (fines && fines.length) this.saveFines(fines);
      if (mileage && mileage.length) this.saveMileage(mileage);
      if (tags && tags.length) this.saveTags(tags);
      if (decom && decom.length) this.saveDecom(decom);
      if (logs && logs.length) this.setStorage('logs', logs);

      return true;
    } catch (err) {
      console.error('Error syncing from Supabase:', err);
      return false;
    }
  }

  public resetToSeed() {
    localStorage.removeItem('frotas_initialized');
    this.init();
  }

  public resetAll() {
    this.resetToSeed();
  }
}

export const dbEngine = new LocalDbEngine();
dbEngine.init();
