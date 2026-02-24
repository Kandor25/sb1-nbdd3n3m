/*
  # Sistema de Periodos de Cotizaciones

  1. Nueva Tabla `contract_quotation_periods`
    - `id` (uuid, primary key)
    - `contract_id` (uuid, foreign key) - Relación con el contrato
    - `formula` (text) - Tipo de fórmula: 'Mes de Entrega' o 'Mes después de Mes de llegada'
    - `months` (integer) - Número de meses
    - `metal` (text) - Metal: CU, AG, AU, PB, ZN
    - `display_order` (integer) - Orden de visualización
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS en la tabla
    - Políticas para permitir acceso público (temporal - ajustar según necesidades de autenticación)
*/

-- Crear tabla de periodos de cotizaciones
CREATE TABLE IF NOT EXISTS contract_quotation_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  formula text NOT NULL CHECK (formula IN ('Mes de Entrega', 'Mes después de Mes de llegada')),
  months integer NOT NULL CHECK (months > 0),
  metal text NOT NULL CHECK (metal IN ('CU', 'AG', 'AU', 'PB', 'ZN')),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE contract_quotation_periods ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (lectura pública)
CREATE POLICY "Anyone can view quotation periods"
  ON contract_quotation_periods
  FOR SELECT
  USING (true);

-- Política para INSERT (inserción pública)
CREATE POLICY "Anyone can insert quotation periods"
  ON contract_quotation_periods
  FOR INSERT
  WITH CHECK (true);

-- Política para UPDATE (actualización pública)
CREATE POLICY "Anyone can update quotation periods"
  ON contract_quotation_periods
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política para DELETE (eliminación pública)
CREATE POLICY "Anyone can delete quotation periods"
  ON contract_quotation_periods
  FOR DELETE
  USING (true);