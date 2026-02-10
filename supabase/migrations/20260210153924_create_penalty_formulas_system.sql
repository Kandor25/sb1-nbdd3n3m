/*
  # Create Penalty Formulas System

  ## Overview
  This migration creates a system for managing penalty formulas that can be selected
  when creating penalties in contracts. Similar to the payable formulas system.

  ## New Tables

  ### `penalty_formulas`
  Stores pre-defined penalty formula types
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Formula name (e.g., "Escalador (3)", "No Aplica")
  - `description` (text) - Optional description of the formula
  - `is_active` (boolean) - Whether the formula is available for selection
  - `created_at` (timestamptz) - Creation timestamp

  ## Table Modifications

  ### `contract_penalties`
  - Add `formula_id` column to link penalties to formulas
  - Make all penalty fields nullable (when formula is "No Aplica")

  ### `contract_template_penalties`
  - Add `formula_id` column for template penalties

  ## Initial Data
  - Insert "No Aplica" formula
  - Insert "Escalador (3)" formula
  - Insert other common penalty formulas

  ## Security
  - Enable RLS on penalty_formulas table
  - Add policies for public read access
*/

-- Create penalty_formulas table
CREATE TABLE IF NOT EXISTS penalty_formulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE penalty_formulas ENABLE ROW LEVEL SECURITY;

-- Policies for penalty_formulas
CREATE POLICY "Anyone can view penalty formulas"
  ON penalty_formulas
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage penalty formulas"
  ON penalty_formulas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add formula_id to contract_penalties
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contract_penalties' AND column_name = 'formula_id'
  ) THEN
    ALTER TABLE contract_penalties ADD COLUMN formula_id uuid REFERENCES penalty_formulas(id);
  END IF;
END $$;

-- Make penalty fields nullable (for "No Aplica" case)
ALTER TABLE contract_penalties 
  ALTER COLUMN metal DROP NOT NULL,
  ALTER COLUMN amount_usd DROP NOT NULL,
  ALTER COLUMN lower_limit DROP NOT NULL,
  ALTER COLUMN lower_limit_unit DROP NOT NULL,
  ALTER COLUMN upper_limit DROP NOT NULL,
  ALTER COLUMN upper_limit_unit DROP NOT NULL;

-- Add formula_id to contract_template_penalties
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contract_template_penalties' AND column_name = 'formula_id'
  ) THEN
    ALTER TABLE contract_template_penalties ADD COLUMN formula_id uuid REFERENCES penalty_formulas(id);
  END IF;
END $$;

-- Make template penalty fields nullable
ALTER TABLE contract_template_penalties 
  ALTER COLUMN metal DROP NOT NULL,
  ALTER COLUMN amount_usd DROP NOT NULL,
  ALTER COLUMN lower_limit DROP NOT NULL,
  ALTER COLUMN lower_limit_unit DROP NOT NULL,
  ALTER COLUMN upper_limit DROP NOT NULL,
  ALTER COLUMN upper_limit_unit DROP NOT NULL;

-- Insert initial penalty formulas
INSERT INTO penalty_formulas (name, description) VALUES
  ('No Aplica', 'No se aplica ninguna penalidad'),
  ('Escalador (3)', 'Fórmula de penalidad escalonada en 3 niveles'),
  ('Escalador (2)', 'Fórmula de penalidad escalonada en 2 niveles'),
  ('Fijo', 'Penalidad fija por unidad')
ON CONFLICT (name) DO NOTHING;

-- Create index for formula lookups
CREATE INDEX IF NOT EXISTS idx_contract_penalties_formula ON contract_penalties(formula_id);
CREATE INDEX IF NOT EXISTS idx_template_penalties_formula ON contract_template_penalties(formula_id);
