-- Supabase Migration Script for Fleet Management System
-- Executar no SQL Editor do Supabase ou via CLI (supabase db push)

-- 1. Habilitar Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criação das Tabelas

-- Companies (Empresas / Filiais)
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carriers (Locadoras)
CREATE TABLE IF NOT EXISTS public.carriers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  contato TEXT,
  telefone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (Perfis de Usuário)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administrador', 'Gestor', 'Operador', 'Visualizador')),
  empresa_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers (Condutores / Motoristas)
CREATE TABLE IF NOT EXISTS public.drivers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  departamento TEXT NOT NULL,
  empresa_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cnh TEXT NOT NULL,
  categoria_cnh TEXT NOT NULL,
  validade_cnh DATE NOT NULL,
  status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles (Veículos)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  placa TEXT NOT NULL UNIQUE,
  modelo TEXT NOT NULL,
  marca TEXT NOT NULL,
  ano INTEGER NOT NULL,
  cor TEXT NOT NULL,
  renavam TEXT NOT NULL,
  chassi TEXT NOT NULL,
  tipo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  empresa_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  centro_de_custo TEXT NOT NULL,
  locadora_id TEXT REFERENCES public.carriers(id) ON DELETE SET NULL,
  contrato_id TEXT,
  condutor_id TEXT REFERENCES public.drivers(id) ON DELETE SET NULL,
  data_aquisicao DATE NOT NULL,
  data_entrega DATE,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Reserva', 'Manutenção', 'Desmobilizado')),
  observacoes TEXT,
  odometro_atual INTEGER DEFAULT 0,
  documentos_anexos TEXT[],
  fotos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts (Contratos de Locação)
CREATE TABLE IF NOT EXISTS public.contracts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  empresa_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  locadora_id TEXT NOT NULL REFERENCES public.carriers(id) ON DELETE CASCADE,
  veiculo_id TEXT REFERENCES public.vehicles(id) ON DELETE SET NULL,
  numero_contrato TEXT NOT NULL UNIQUE,
  valor_mensal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  renovacao_automatica BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Vencendo', 'Vencido', 'Suspenso')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign Key retroativa em vehicles
ALTER TABLE public.vehicles
  DROP CONSTRAINT IF EXISTS fk_vehicles_contract,
  ADD CONSTRAINT fk_vehicles_contract FOREIGN KEY (contrato_id) REFERENCES public.contracts(id) ON DELETE SET NULL;

-- Fines (Multas de Trânsito)
CREATE TABLE IF NOT EXISTS public.fines (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  veiculo_id TEXT NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  condutor_id TEXT REFERENCES public.drivers(id) ON DELETE SET NULL,
  data_infracao DATE NOT NULL,
  auto_infracao TEXT NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  valor NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  pontuacao INTEGER NOT NULL DEFAULT 0,
  orgao_emissor TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Recebida' CHECK (status IN ('Recebida', 'Enviada', 'Indicada', 'Assinada', 'Contestada', 'Paga')),
  documentos_anexos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mileage Readings (Apontamentos de Quilometragem)
CREATE TABLE IF NOT EXISTS public.mileage_readings (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  veiculo_id TEXT NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  data_leitura DATE NOT NULL,
  km_atual INTEGER NOT NULL,
  km_contratado_mensal INTEGER NOT NULL DEFAULT 3000,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags (Pedágios e Estacionamento)
CREATE TABLE IF NOT EXISTS public.tags (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  numero_tag TEXT NOT NULL UNIQUE,
  numero TEXT,
  operadora TEXT NOT NULL,
  status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Bloqueado')),
  ativa BOOLEAN DEFAULT TRUE,
  veiculo_id TEXT REFERENCES public.vehicles(id) ON DELETE SET NULL,
  centro_de_custo TEXT,
  saldo NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demobilizations (Processo de Desmobilização)
CREATE TABLE IF NOT EXISTS public.demobilizations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  veiculo_id TEXT NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  data_entrega DATE NOT NULL,
  km_final INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Em Andamento' CHECK (status IN ('Em Andamento', 'Concluído')),
  checklist JSONB NOT NULL DEFAULT '{"chave_reserva": true, "manual_usuario": true, "pneus_estepe": true, "higienizacao_interna": true, "isento_avarias": true}',
  custos_devolucao JSONB NOT NULL DEFAULT '{"avarias": 0, "quilometragem_excedente": 0, "taxas_administrativas": 0, "higienizacao": 0}',
  custo_total NUMERIC(12, 2) DEFAULT 0.00,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (Trilha de Auditoria)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  usuario_nome TEXT NOT NULL,
  usuario_role TEXT NOT NULL,
  acao TEXT NOT NULL,
  modulo TEXT NOT NULL,
  detalhes TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para Otimização de Performance
CREATE INDEX IF NOT EXISTS idx_vehicles_empresa ON public.vehicles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_placa ON public.vehicles(placa);
CREATE INDEX IF NOT EXISTS idx_drivers_cpf ON public.drivers(cpf);
CREATE INDEX IF NOT EXISTS idx_drivers_validade ON public.drivers(validade_cnh);
CREATE INDEX IF NOT EXISTS idx_fines_veiculo ON public.fines(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_mileage_veiculo ON public.mileage_readings(veiculo_id);

-- 4. Habilitar RLS (Row Level Security) e Políticas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mileage_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demobilizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all access to companies" ON public.companies FOR ALL USING (true);
CREATE POLICY "Allow public all access to carriers" ON public.carriers FOR ALL USING (true);
CREATE POLICY "Allow public all access to user_profiles" ON public.user_profiles FOR ALL USING (true);
CREATE POLICY "Allow public all access to drivers" ON public.drivers FOR ALL USING (true);
CREATE POLICY "Allow public all access to vehicles" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Allow public all access to contracts" ON public.contracts FOR ALL USING (true);
CREATE POLICY "Allow public all access to fines" ON public.fines FOR ALL USING (true);
CREATE POLICY "Allow public all access to mileage_readings" ON public.mileage_readings FOR ALL USING (true);
CREATE POLICY "Allow public all access to tags" ON public.tags FOR ALL USING (true);
CREATE POLICY "Allow public all access to demobilizations" ON public.demobilizations FOR ALL USING (true);
CREATE POLICY "Allow public all access to audit_logs" ON public.audit_logs FOR ALL USING (true);

-- 5. Carga Inicial de Dados (Seed Data)
INSERT INTO public.companies (id, nome, cnpj, email, telefone, endereco) VALUES
  ('comp-1', 'TechFrota Soluções S/A', '12.345.678/0001-90', 'contato@techfrota.com.br', '(11) 3456-7890', 'Av. Paulista, 1000 - São Paulo, SP'),
  ('comp-2', 'Logística Express LTDA', '98.765.432/0001-10', 'operacoes@logisticaexpress.com.br', '(11) 4002-8922', 'Rua do Comercio, 450 - Campinas, SP'),
  ('comp-3', 'Filial Sul Serviços EIRELI', '45.678.901/0001-22', 'sul@filialservicos.com.br', '(41) 3322-1100', 'Av. das Indústrias, 800 - Curitiba, PR')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.carriers (id, nome, cnpj, contato, telefone) VALUES
  ('loc-1', 'Localiza Fleet S/A', '16.670.085/0001-55', 'Marcos Aurelio (Gerente de Conta)', '0800 979 2020'),
  ('loc-2', 'Movida Gestão de Frotas', '07.976.147/0001-60', 'Fernanda Rocha', '0800 702 8787'),
  ('loc-3', 'Unidas Terceirização e Frota', '04.437.534/0001-30', 'Atendimento Corporativo', '0800 771 5151')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.drivers (id, nome, cpf, telefone, email, departamento, empresa_id, cnh, categoria_cnh, validade_cnh, observacoes) VALUES
  ('drv-1', 'Ana Júlia Martins', '123.456.789-00', '(11) 98765-4321', 'ana.martins@techfrota.com.br', 'Operações e Entregas', 'comp-1', '00987654321', 'B', '2026-08-15', 'Condutora principal do veículo utilitário Fiorino.'),
  ('drv-2', 'Carlos Eduardo Silva', '234.567.890-11', '(11) 97654-3210', 'carlos.silva@techfrota.com.br', 'Diretoria Executiva', 'comp-1', '00123456789', 'AB', '2028-05-20', 'Diretor de Operações. Utiliza veículo sedan passeio.'),
  ('drv-3', 'Mariana Lima Santos', '345.678.901-22', '(19) 96543-2109', 'mariana.lima@logisticaexpress.com.br', 'Logística Regional', 'comp-2', '00456789123', 'D', '2026-07-28', 'Habilitada para transporte de passageiros e carga pesada.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vehicles (id, placa, modelo, marca, ano, cor, renavam, chassi, tipo, categoria, empresa_id, centro_de_custo, locadora_id, condutor_id, data_aquisicao, status, observacoes, odometro_atual) VALUES
  ('veh-1', 'BRA2E19', 'Corolla XEi 2.0 Flex', 'Toyota', 2023, 'Prata Nevoa', '00129384756', '9BRBL3HE2P0129384', 'Passeio', 'Alugado', 'comp-1', 'CC-101 Diretoria', 'loc-1', 'drv-2', '2024-01-15', 'Ativo', 'Veículo executivo cedido à diretoria corporativa.', 42500),
  ('veh-2', 'LOG8A99', 'Fiorino Endurance 1.4 EVO', 'Fiat', 2022, 'Branco Banchisa', '00982374102', '9BD265322N1098237', 'Utilitário', 'Alugado', 'comp-2', 'CC-202 Operações', 'loc-2', 'drv-1', '2023-09-01', 'Ativo', 'Frota operacional para entregas urbanas rápidas.', 88200),
  ('veh-3', 'KGM-4156', 'Compass Limited 1.3 T270', 'Jeep', 2024, 'Preto Carbon', '00543216789', '98D654321P0054321', 'SUV', 'Próprio', 'comp-1', 'CC-101 Diretoria', NULL, 'drv-3', '2024-03-10', 'Ativo', 'Veículo próprio da frota corporativa.', 18900),
  ('veh-4', 'TRK-8080', 'Constellation 24.280 6x2', 'Volkswagen', 2021, 'Azul Boreal', '00776655443', '9BW321654M0077665', 'Caminhão', 'Próprio', 'comp-3', 'CC-303 Transporte Heavy', NULL, NULL, '2021-06-20', 'Manutenção', 'Caminhão pesado em revisão de suspensão e freios.', 165400)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.contracts (id, empresa_id, locadora_id, veiculo_id, numero_contrato, valor_mensal, data_inicio, data_fim, renovacao_automatica, status) VALUES
  ('ctr-1', 'comp-1', 'loc-1', 'veh-1', 'LOC-2024-8841', 3850.00, '2024-01-15', '2026-08-25', FALSE, 'Vencendo'),
  ('ctr-2', 'comp-2', 'loc-2', 'veh-2', 'MOV-2023-1102', 2400.00, '2023-09-01', '2026-09-01', TRUE, 'Vencendo')
ON CONFLICT (id) DO NOTHING;

UPDATE public.vehicles SET contrato_id = 'ctr-1' WHERE id = 'veh-1';
UPDATE public.vehicles SET contrato_id = 'ctr-2' WHERE id = 'veh-2';

INSERT INTO public.fines (id, veiculo_id, condutor_id, data_infracao, auto_infracao, descricao, valor, pontuacao, orgao_emissor, status) VALUES
  ('fine-1', 'veh-1', 'drv-2', '2026-07-10', 'M-98412', 'Transitar em velocidade superior à máxima permitida em até 20%', 130.16, 4, 'DER-SP', 'Recebida'),
  ('fine-2', 'veh-2', 'drv-1', '2026-07-22', 'CT-4401', 'Avançar o sinal vermelho do semáforo ou de parada obrigatória', 293.47, 7, 'DSV-SP', 'Enviada'),
  ('fine-3', 'veh-3', 'drv-3', '2026-06-15', 'PRF-8821', 'Transitar com o veículo em acostamentos ou rodovias sem autorização', 880.41, 7, 'PRF-BR', 'Contestada')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.mileage_readings (id, veiculo_id, data_leitura, km_atual, km_contratado_mensal, observacoes) VALUES
  ('mil-1', 'veh-1', '2026-07-01', 40100, 3000, 'Leitura de início de mês'),
  ('mil-2', 'veh-1', '2026-08-01', 42500, 3000, 'Consumo do mês: 2.400 km (Dentro da franquia)'),
  ('mil-3', 'veh-2', '2026-07-01', 84350, 3000, 'Leitura inicial de julho'),
  ('mil-4', 'veh-2', '2026-08-01', 88200, 3000, 'Consumo do mês: 3.850 km (EXCEDEU A FRANQUIA EM 850 KM!)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tags (id, numero_tag, numero, operadora, status, ativa, veiculo_id, centro_de_custo, saldo) VALUES
  ('tag-1', '0149982341', '0149982341', 'Sem Parar', 'Ativo', TRUE, 'veh-1', 'CC-101 Diretoria', 245.50),
  ('tag-2', '0882104921', '0882104921', 'Veloe', 'Ativo', TRUE, 'veh-2', 'CC-202 Operações', 112.00),
  ('tag-3', '0991204855', '0991204855', 'ConectCar', 'Ativo', TRUE, 'veh-3', 'CC-101 Diretoria', 15.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.demobilizations (id, veiculo_id, data_entrega, km_final, status, checklist, custos_devolucao, custo_total, observacoes) VALUES
  ('decom-1', 'veh-2', '2026-08-28', 88200, 'Em Andamento', '{"chave_reserva": true, "manual_usuario": true, "pneus_estepe": true, "higienizacao_interna": false, "isento_avarias": false}', '{"avarias": 650.00, "quilometragem_excedente": 425.00, "taxas_administrativas": 150.00, "higienizacao": 180.00}', 1405.00, 'Veículo com pequenos riscos no para-choque traseiro e excesso de km contratado no mês.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, email, nome, role, empresa_id) VALUES
  ('usr-admin', 'admin@frotas.com.br', 'Rodrigo Alcantara (Admin)', 'Administrador', 'comp-1'),
  ('usr-gestor', 'gestor@frotas.com.br', 'Camila Albuquerque (Gestora)', 'Gestor', 'comp-1'),
  ('usr-operador', 'operador@frotas.com.br', 'Lucas Vasconcelos (Operador)', 'Operador', 'comp-2'),
  ('usr-auditor', 'auditor@frotas.com.br', 'Fernanda Auditoria (Visualizadora)', 'Visualizador', 'comp-1')
ON CONFLICT (id) DO NOTHING;
