/*
  # Sistema de Fórmulas y Pagables para Contratos

  1. Nuevas Tablas
    - `payable_formulas`
      - `id` (uuid, primary key)
      - `name` (text) - Nombre de la fórmula
      - `description` (text) - Descripción de la fórmula
      - `is_deduction` (boolean) - Indica si es una fórmula de deducción
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `market_indices`
      - `id` (uuid, primary key)
      - `code` (text) - Código del índice (ej: LME_LOWEST_FOUR, LBMA_SILVER)
      - `name` (text) - Nombre del índice
      - `description` (text) - Descripción del índice
      - `created_at` (timestamptz)

    - `contract_payables`
      - `id` (uuid, primary key)
      - `contract_id` (uuid, foreign key)
      - `formula_id` (uuid, foreign key) - Referencia a payable_formulas
      - `metal` (text) - Metal (CU, AG, AU)
      - `deduction_value` (decimal) - Valor de la deducción
      - `deduction_unit` (text) - Unidad (%, g/tms)
      - `balance_percentage` (decimal) - Porcentaje de balance
      - `market_index_id` (uuid, foreign key) - Referencia a market_indices
      - `formula_text` (text) - Texto de la fórmula generada
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados

  3. Índices
    - Índice en contract_id para búsqueda rápida
    - Índice en formula_id
    - Índice en market_index_id
*/

-- Crear tabla de fórmulas de pagables
CREATE TABLE IF NOT EXISTS payable_formulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_deduction boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de índices de mercado
CREATE TABLE IF NOT EXISTS market_indices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de pagables de contratos
CREATE TABLE IF NOT EXISTS contract_payables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  formula_id uuid REFERENCES payable_formulas(id) ON DELETE RESTRICT,
  metal text NOT NULL CHECK (metal IN ('CU', 'AG', 'AU')),
  deduction_value decimal(10, 4) NOT NULL,
  deduction_unit text NOT NULL CHECK (deduction_unit IN ('%', 'g/tms')),
  balance_percentage decimal(5, 2) NOT NULL,
  market_index_id uuid REFERENCES market_indices(id) ON DELETE RESTRICT,
  formula_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_contract_payables_contract_id ON contract_payables(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_payables_formula_id ON contract_payables(formula_id);
CREATE INDEX IF NOT EXISTS idx_contract_payables_market_index_id ON contract_payables(market_index_id);

-- Habilitar RLS
ALTER TABLE payable_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_payables ENABLE ROW LEVEL SECURITY;

-- Políticas para payable_formulas
CREATE POLICY "Usuarios autenticados pueden ver fórmulas"
  ON payable_formulas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear fórmulas"
  ON payable_formulas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar fórmulas"
  ON payable_formulas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar fórmulas"
  ON payable_formulas FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para market_indices
CREATE POLICY "Usuarios autenticados pueden ver índices"
  ON market_indices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear índices"
  ON market_indices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar índices"
  ON market_indices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar índices"
  ON market_indices FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para contract_payables
CREATE POLICY "Usuarios autenticados pueden ver pagables"
  ON contract_payables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear pagables"
  ON contract_payables FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar pagables"
  ON contract_payables FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar pagables"
  ON contract_payables FOR DELETE
  TO authenticated
  USING (true);

-- Insertar fórmulas predefinidas
INSERT INTO payable_formulas (name, description, is_deduction) VALUES
  ('Deducción', 'Fórmula de deducción estándar para pagables', true)
ON CONFLICT DO NOTHING;

-- Insertar índices de mercado predefinidos
INSERT INTO market_indices (code, name, description) VALUES
  ('LME_LOWEST_FOUR', 'LME Lowest of the Four', 'London Metal Exchange - Promedio de los cuatro precios más bajos'),
  ('LME_MONTHLY_AVERAGE', 'LME Monthly Average', 'London Metal Exchange - Promedio mensual'),
  ('LME_SETTLEMENT', 'LME Settlement', 'London Metal Exchange - Precio de liquidación'),
  ('LBMA_SILVER', 'LBMA Silver', 'London Bullion Market Association - Plata'),
  ('LBMA_GOLD_AM', 'LBMA Gold AM', 'London Bullion Market Association - Oro AM'),
  ('LBMA_GOLD_PM', 'LBMA Gold PM (Final)', 'London Bullion Market Association - Oro PM (Final)'),
  ('COMEX_COPPER', 'COMEX Copper', 'COMEX - Cobre'),
  ('COMEX_SILVER', 'COMEX Silver', 'COMEX - Plata'),
  ('COMEX_GOLD', 'COMEX Gold', 'COMEX - Oro')
ON CONFLICT (code) DO NOTHING;