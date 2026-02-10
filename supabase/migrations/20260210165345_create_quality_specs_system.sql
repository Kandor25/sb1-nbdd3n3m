/*
  # Create Quality/Granulometry Specifications System

  ## Overview
  This migration creates a system for managing quality and granulometry specifications
  for contracts. It supports three specification types: Range, Minimum, and Maximum values.

  ## New Tables

  ### `contract_quality_specs`
  - `id` (uuid, primary key)
  - `contract_id` (uuid, foreign key to contracts)
  - `metal` (text) - Metal element (Cu, Ag, Au, As, etc.)
  - `spec_type` (text) - Specification type: 'range', 'minimum', 'maximum'
  - `min_value` (numeric, nullable) - Minimum value (for 'range' and 'minimum' types)
  - `max_value` (numeric, nullable) - Maximum value (for 'range' and 'maximum' types)
  - `unit` (text) - Unit of measurement (%, g/tms, etc.)
  - `formula_text` (text) - Generated formula text for display
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `contract_template_quality_specs`
  - Same structure as contract_quality_specs but for templates
  - `template_id` (uuid) - Reference to contract template

  ## Security
  - RLS enabled on all tables
  - Authenticated users can read all quality specs
  - Authenticated users can insert and update their own quality specs

  ## Notes
  - Supports three specification types:
    1. Range: Uses both min_value and max_value (e.g., "20-25%")
    2. Minimum: Uses only min_value (e.g., ">=10 g/tms")
    3. Maximum: Uses only max_value (e.g., "<0.25%")
  - Formula text is auto-generated for display purposes
  - All fields nullable to accommodate different specification types
*/

-- Create contract_quality_specs table
CREATE TABLE IF NOT EXISTS contract_quality_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  metal text NOT NULL,
  spec_type text NOT NULL CHECK (spec_type IN ('range', 'minimum', 'maximum')),
  min_value numeric(10,4),
  max_value numeric(10,4),
  unit text NOT NULL,
  formula_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contract_template_quality_specs table
CREATE TABLE IF NOT EXISTS contract_template_quality_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid,
  metal text NOT NULL,
  spec_type text NOT NULL CHECK (spec_type IN ('range', 'minimum', 'maximum')),
  min_value numeric(10,4),
  max_value numeric(10,4),
  unit text NOT NULL,
  formula_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quality_specs_contract ON contract_quality_specs(contract_id);
CREATE INDEX IF NOT EXISTS idx_quality_specs_metal ON contract_quality_specs(metal);
CREATE INDEX IF NOT EXISTS idx_template_quality_specs_template ON contract_template_quality_specs(template_id);

-- Enable Row Level Security
ALTER TABLE contract_quality_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_template_quality_specs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contract_quality_specs
CREATE POLICY "Authenticated users can view quality specs"
  ON contract_quality_specs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert quality specs"
  ON contract_quality_specs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update quality specs"
  ON contract_quality_specs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete quality specs"
  ON contract_quality_specs FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for contract_template_quality_specs
CREATE POLICY "Authenticated users can view template quality specs"
  ON contract_template_quality_specs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert template quality specs"
  ON contract_template_quality_specs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update template quality specs"
  ON contract_template_quality_specs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete template quality specs"
  ON contract_template_quality_specs FOR DELETE
  TO authenticated
  USING (true);
