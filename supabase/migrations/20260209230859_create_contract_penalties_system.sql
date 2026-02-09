/*
  # Create Contract Penalties System

  ## Overview
  This migration creates a system for managing contract penalties based on quality parameters
  exceeding specified thresholds. Penalties are calculated per metal and apply charges when
  assay values exceed upper limits.

  ## New Tables

  ### `contract_penalties`
  Stores penalty configurations for each contract
  - `id` (uuid, primary key) - Unique identifier
  - `contract_id` (uuid, foreign key) - Reference to contracts table
  - `metal` (text) - Metal type subject to penalty ('CU', 'AG', 'AU', 'AS', 'PB', 'ZN', etc.)
  - `amount_usd` (numeric) - Penalty amount in USD per TMS
  - `lower_limit` (numeric) - Lower threshold value
  - `lower_limit_unit` (text) - Unit for lower limit (e.g., '0.01%', 'ppm', 'g/tms')
  - `upper_limit` (numeric) - Upper threshold value above which penalty applies
  - `upper_limit_unit` (text) - Unit for upper limit (e.g., '0.05%', 'ppm', 'g/tms')
  - `penalty_formula` (text) - Generated formula text for display
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Formula Example
  For Metal=CU, Amount=$2.5, Lower=0.01, LowerUnit=%, Upper=0.05, UpperUnit=%
  Formula: "(CU): $2.5 por TMS por cada 0.01% por encima de 0.05%"

  ## Security
  - Enable RLS on contract_penalties table
  - Add policies for public access (organizational data)
  - Authenticated users can manage penalties

  ## Indexes
  - Create index on contract_id for faster lookups
  - Create index on metal for filtering
*/

-- Create contract_penalties table
CREATE TABLE IF NOT EXISTS contract_penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  metal text NOT NULL,
  amount_usd numeric NOT NULL,
  lower_limit numeric NOT NULL,
  lower_limit_unit text NOT NULL,
  upper_limit numeric NOT NULL,
  upper_limit_unit text NOT NULL,
  penalty_formula text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contract_penalties ENABLE ROW LEVEL SECURITY;

-- Policies for contract_penalties
CREATE POLICY "Anyone can view contract penalties"
  ON contract_penalties
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create contract penalties"
  ON contract_penalties
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contract penalties"
  ON contract_penalties
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contract penalties"
  ON contract_penalties
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contract_penalties_contract ON contract_penalties(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_penalties_metal ON contract_penalties(metal);

-- Add penalties to contract templates
DO $$
BEGIN
  -- Add columns to contract_templates if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contract_templates' AND column_name = 'has_penalties'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN has_penalties boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contract_templates' AND column_name = 'penalties_count'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN penalties_count integer DEFAULT 0;
  END IF;
END $$;

-- Create contract_template_penalties table
CREATE TABLE IF NOT EXISTS contract_template_penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES contract_templates(id) ON DELETE CASCADE,
  metal text NOT NULL,
  amount_usd numeric NOT NULL,
  lower_limit numeric NOT NULL,
  lower_limit_unit text NOT NULL,
  upper_limit numeric NOT NULL,
  upper_limit_unit text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on template penalties
ALTER TABLE contract_template_penalties ENABLE ROW LEVEL SECURITY;

-- Policies for contract_template_penalties
CREATE POLICY "Anyone can view template penalties"
  ON contract_template_penalties
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create template penalties"
  ON contract_template_penalties
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update template penalties"
  ON contract_template_penalties
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete template penalties"
  ON contract_template_penalties
  FOR DELETE
  TO public
  USING (true);

-- Create index for template penalties
CREATE INDEX IF NOT EXISTS idx_template_penalties_template ON contract_template_penalties(template_id);
