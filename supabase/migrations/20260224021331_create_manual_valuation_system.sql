/*
  # Sistema de Valorización Manual de Contratos

  1. Nuevas Tablas
    - `manual_valuations` - Tabla principal de valorizaciones manuales
      - `id` (uuid, primary key)
      - `contract_id` (uuid, foreign key a contracts)
      - `status` (text) - 'draft' | 'confirmed'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `valuation_weights` - Pesos (TMH, H2O, TMS)
      - `id` (uuid, primary key)
      - `valuation_id` (uuid, foreign key)
      - `tmh` (numeric)
      - `h2o_percentage` (numeric)
      - `tms` (numeric)
      - `created_at` (timestamptz)
    
    - `valuation_prices` - Precios de metales
      - `id` (uuid, primary key)
      - `valuation_id` (uuid, foreign key)
      - `metal` (text)
      - `price` (numeric)
      - `unit` (text)
      - `created_at` (timestamptz)
    
    - `valuation_assays` - Ensayes
      - `id` (uuid, primary key)
      - `valuation_id` (uuid, foreign key)
      - `metal` (text)
      - `assay_value` (numeric)
      - `unit` (text)
      - `created_at` (timestamptz)
    
    - `valuation_assay_sensitivity` - Sensibilidad de Ensayes
      - `id` (uuid, primary key)
      - `valuation_id` (uuid, foreign key)
      - `metal` (text)
      - `sensitivity_value` (numeric)
      - `unit` (text)
      - `created_at` (timestamptz)
    
    - `valuation_price_sensitivity` - Sensibilidad de Precios
      - `id` (uuid, primary key)
      - `valuation_id` (uuid, foreign key)
      - `metal` (text)
      - `price_sensitivity` (numeric)
      - `unit` (text)
      - `created_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Agregar políticas para acceso público (temporal para prototipo)
*/

-- Tabla principal de valorizaciones manuales
CREATE TABLE IF NOT EXISTS manual_valuations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de pesos
CREATE TABLE IF NOT EXISTS valuation_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_id uuid NOT NULL REFERENCES manual_valuations(id) ON DELETE CASCADE,
  tmh numeric NOT NULL,
  h2o_percentage numeric NOT NULL,
  tms numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de precios
CREATE TABLE IF NOT EXISTS valuation_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_id uuid NOT NULL REFERENCES manual_valuations(id) ON DELETE CASCADE,
  metal text NOT NULL,
  price numeric NOT NULL,
  unit text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de ensayes
CREATE TABLE IF NOT EXISTS valuation_assays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_id uuid NOT NULL REFERENCES manual_valuations(id) ON DELETE CASCADE,
  metal text NOT NULL,
  assay_value numeric NOT NULL,
  unit text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de sensibilidad de ensayes
CREATE TABLE IF NOT EXISTS valuation_assay_sensitivity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_id uuid NOT NULL REFERENCES manual_valuations(id) ON DELETE CASCADE,
  metal text NOT NULL,
  sensitivity_value numeric NOT NULL,
  unit text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de sensibilidad de precios
CREATE TABLE IF NOT EXISTS valuation_price_sensitivity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_id uuid NOT NULL REFERENCES manual_valuations(id) ON DELETE CASCADE,
  metal text NOT NULL,
  price_sensitivity numeric NOT NULL,
  unit text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE manual_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuation_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuation_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuation_assays ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuation_assay_sensitivity ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuation_price_sensitivity ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (para prototipo)
CREATE POLICY "Allow public read access to manual_valuations"
  ON manual_valuations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to manual_valuations"
  ON manual_valuations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to manual_valuations"
  ON manual_valuations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to manual_valuations"
  ON manual_valuations FOR DELETE
  TO public
  USING (true);

-- Políticas para valuation_weights
CREATE POLICY "Allow public read access to valuation_weights"
  ON valuation_weights FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to valuation_weights"
  ON valuation_weights FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to valuation_weights"
  ON valuation_weights FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to valuation_weights"
  ON valuation_weights FOR DELETE
  TO public
  USING (true);

-- Políticas para valuation_prices
CREATE POLICY "Allow public read access to valuation_prices"
  ON valuation_prices FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to valuation_prices"
  ON valuation_prices FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to valuation_prices"
  ON valuation_prices FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to valuation_prices"
  ON valuation_prices FOR DELETE
  TO public
  USING (true);

-- Políticas para valuation_assays
CREATE POLICY "Allow public read access to valuation_assays"
  ON valuation_assays FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to valuation_assays"
  ON valuation_assays FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to valuation_assays"
  ON valuation_assays FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to valuation_assays"
  ON valuation_assays FOR DELETE
  TO public
  USING (true);

-- Políticas para valuation_assay_sensitivity
CREATE POLICY "Allow public read access to valuation_assay_sensitivity"
  ON valuation_assay_sensitivity FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to valuation_assay_sensitivity"
  ON valuation_assay_sensitivity FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to valuation_assay_sensitivity"
  ON valuation_assay_sensitivity FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to valuation_assay_sensitivity"
  ON valuation_assay_sensitivity FOR DELETE
  TO public
  USING (true);

-- Políticas para valuation_price_sensitivity
CREATE POLICY "Allow public read access to valuation_price_sensitivity"
  ON valuation_price_sensitivity FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to valuation_price_sensitivity"
  ON valuation_price_sensitivity FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to valuation_price_sensitivity"
  ON valuation_price_sensitivity FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to valuation_price_sensitivity"
  ON valuation_price_sensitivity FOR DELETE
  TO public
  USING (true);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_manual_valuations_contract_id ON manual_valuations(contract_id);
CREATE INDEX IF NOT EXISTS idx_valuation_weights_valuation_id ON valuation_weights(valuation_id);
CREATE INDEX IF NOT EXISTS idx_valuation_prices_valuation_id ON valuation_prices(valuation_id);
CREATE INDEX IF NOT EXISTS idx_valuation_assays_valuation_id ON valuation_assays(valuation_id);
CREATE INDEX IF NOT EXISTS idx_valuation_assay_sensitivity_valuation_id ON valuation_assay_sensitivity(valuation_id);
CREATE INDEX IF NOT EXISTS idx_valuation_price_sensitivity_valuation_id ON valuation_price_sensitivity(valuation_id);