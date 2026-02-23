/*
  # Create Processing (Maquila) System

  ## Overview
  This migration creates the processing formulas system for contracts, allowing users to:
  - Select from a list of processing formulas
  - Use the special "FRANCHISE" formula with incoterm selection and custom values
  - Add multiple processing entries per contract
  - Select "No Aplica" (N/A) option

  ## New Tables

  ### `processing_formulas`
  - `id` (uuid, primary key)
  - `name` (text) - Formula name (e.g., "FRANCHISE", "N/A")
  - `description` (text) - Formula description
  - `requires_incoterm` (boolean) - Whether this formula requires incoterm selection
  - `requires_value` (boolean) - Whether this formula requires value input
  - `is_no_aplica` (boolean) - Whether this is the "No Aplica" option
  - `created_at` (timestamptz)

  ### `contract_processing`
  - `id` (uuid, primary key)
  - `contract_id` (uuid, foreign key) - Reference to contracts table
  - `formula_id` (uuid, foreign key) - Reference to processing_formulas table
  - `incoterm_id` (uuid, foreign key, nullable) - For FRANCHISE formula
  - `value` (numeric, nullable) - Processing value
  - `unit` (text, nullable) - Unit (e.g., "%")
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Public read access for formulas
  - Authenticated users can manage their contract processing entries

  ## Initial Data
  - Pre-populated with common processing formulas including FRANCHISE and N/A
*/

-- Create processing_formulas table
CREATE TABLE IF NOT EXISTS processing_formulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  requires_incoterm boolean DEFAULT false,
  requires_value boolean DEFAULT true,
  is_no_aplica boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create contract_processing table
CREATE TABLE IF NOT EXISTS contract_processing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  formula_id uuid REFERENCES processing_formulas(id) NOT NULL,
  incoterm_id uuid REFERENCES incoterms(id),
  value numeric(10,4),
  unit text DEFAULT '%',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE processing_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_processing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for processing_formulas (public read access)
CREATE POLICY "Anyone can view processing formulas"
  ON processing_formulas FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert processing formulas"
  ON processing_formulas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update processing formulas"
  ON processing_formulas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete processing formulas"
  ON processing_formulas FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for contract_processing
CREATE POLICY "Anyone can view contract processing"
  ON contract_processing FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert contract processing"
  ON contract_processing FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contract processing"
  ON contract_processing FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contract processing"
  ON contract_processing FOR DELETE
  TO authenticated
  USING (true);

-- Insert initial processing formulas
INSERT INTO processing_formulas (name, description, requires_incoterm, requires_value, is_no_aplica)
VALUES
  ('Standard Processing', 'Procesamiento estándar con tarifa fija', false, true, false),
  ('Variable Rate', 'Tarifa variable según condiciones', false, true, false),
  ('FRANCHISE', 'Franquicia con incoterm específico', true, true, false),
  ('N/A', 'No aplica maquila', false, false, true)
ON CONFLICT DO NOTHING;
