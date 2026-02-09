/*
  # Create Contract Templates System

  ## Overview
  This migration creates a system for managing contract templates that allow users to quickly create 
  contracts using predefined clauses and settings for common product types.

  ## New Tables

  ### `contract_templates`
  Master table for contract templates
  - `id` (uuid, primary key) - Unique identifier for the template
  - `name` (text) - Template name (e.g., "Concentrado de Cu Estándar")
  - `description` (text) - Description of the template
  - `product_type` (text) - Type of product this template is for
  - `contract_type` (text) - Type of contract ('purchase' or 'sale')
  - `incoterm_code` (text) - Default incoterm code for this template
  - `default_tolerance` (numeric) - Default tolerance percentage
  - `default_h2o_percentage` (numeric) - Default moisture percentage
  - `has_payables` (boolean) - Whether this template includes payable configurations
  - `payables_count` (integer) - Number of payables configured in this template
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `contract_template_payables`
  Payables configuration for each template
  - `id` (uuid, primary key) - Unique identifier
  - `template_id` (uuid, foreign key) - Reference to contract_templates
  - `metal` (text) - Metal type ('CU', 'AG', 'AU')
  - `formula_id` (uuid, foreign key) - Reference to payable_formulas
  - `deduction_value` (numeric) - Deduction value
  - `deduction_unit` (text) - Unit of deduction ('%' or 'g/tms')
  - `balance_percentage` (numeric) - Balance percentage
  - `market_index_id` (uuid, foreign key) - Reference to market_indices
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for public read access (templates are shared across organization)
  - Add policies for authenticated users to manage templates

  ## Sample Data
  - Insert default templates for common product types:
    - Concentrado de Cu Estándar (Compra)
    - Concentrado de Cu Estándar (Venta)
    - Concentrado de Zn Estándar (Compra)
*/

-- Create contract_templates table
CREATE TABLE IF NOT EXISTS contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  product_type text NOT NULL,
  contract_type text NOT NULL CHECK (contract_type IN ('purchase', 'sale')),
  incoterm_code text,
  default_tolerance numeric DEFAULT 10,
  default_h2o_percentage numeric DEFAULT 10,
  has_payables boolean DEFAULT false,
  payables_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contract_template_payables table
CREATE TABLE IF NOT EXISTS contract_template_payables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES contract_templates(id) ON DELETE CASCADE,
  metal text NOT NULL CHECK (metal IN ('CU', 'AG', 'AU')),
  formula_id uuid REFERENCES payable_formulas(id),
  deduction_value numeric NOT NULL,
  deduction_unit text NOT NULL CHECK (deduction_unit IN ('%', 'g/tms')),
  balance_percentage numeric NOT NULL,
  market_index_id uuid REFERENCES market_indices(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_template_payables ENABLE ROW LEVEL SECURITY;

-- Policies for contract_templates
CREATE POLICY "Anyone can view contract templates"
  ON contract_templates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create contract templates"
  ON contract_templates
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contract templates"
  ON contract_templates
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contract templates"
  ON contract_templates
  FOR DELETE
  TO public
  USING (true);

-- Policies for contract_template_payables
CREATE POLICY "Anyone can view template payables"
  ON contract_template_payables
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create template payables"
  ON contract_template_payables
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update template payables"
  ON contract_template_payables
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete template payables"
  ON contract_template_payables
  FOR DELETE
  TO public
  USING (true);

-- Insert sample templates
DO $$
DECLARE
  v_template_id_1 uuid;
  v_template_id_2 uuid;
  v_template_id_3 uuid;
  v_deduction_formula_id uuid;
  v_lme_cu_index_id uuid;
  v_lme_ag_index_id uuid;
  v_lme_au_index_id uuid;
BEGIN
  -- Get the deduction formula ID
  SELECT id INTO v_deduction_formula_id 
  FROM payable_formulas 
  WHERE is_deduction = true 
  LIMIT 1;

  -- Get market indices
  SELECT id INTO v_lme_cu_index_id FROM market_indices WHERE code = 'LME_CU' LIMIT 1;
  SELECT id INTO v_lme_ag_index_id FROM market_indices WHERE code = 'LME_AG' LIMIT 1;
  SELECT id INTO v_lme_au_index_id FROM market_indices WHERE code = 'LME_AU' LIMIT 1;

  -- Template 1: Concentrado de Cu Estándar (Compra)
  INSERT INTO contract_templates (
    id,
    name,
    description,
    product_type,
    contract_type,
    incoterm_code,
    default_tolerance,
    default_h2o_percentage,
    has_payables,
    payables_count
  ) VALUES (
    gen_random_uuid(),
    'Concentrado de Cu Estándar',
    'Plantilla estándar para contratos de compra de concentrado de cobre con cláusulas típicas del mercado',
    'Concentrado de Cobre',
    'purchase',
    'CIF',
    10,
    10,
    true,
    3
  ) RETURNING id INTO v_template_id_1;

  -- Add payables for Template 1
  IF v_deduction_formula_id IS NOT NULL THEN
    -- Cu payable
    IF v_lme_cu_index_id IS NOT NULL THEN
      INSERT INTO contract_template_payables (
        template_id,
        metal,
        formula_id,
        deduction_value,
        deduction_unit,
        balance_percentage,
        market_index_id
      ) VALUES (
        v_template_id_1,
        'CU',
        v_deduction_formula_id,
        1.2,
        '%',
        96.5,
        v_lme_cu_index_id
      );
    END IF;

    -- Ag payable
    IF v_lme_ag_index_id IS NOT NULL THEN
      INSERT INTO contract_template_payables (
        template_id,
        metal,
        formula_id,
        deduction_value,
        deduction_unit,
        balance_percentage,
        market_index_id
      ) VALUES (
        v_template_id_1,
        'AG',
        v_deduction_formula_id,
        30,
        'g/tms',
        90,
        v_lme_ag_index_id
      );
    END IF;

    -- Au payable
    IF v_lme_au_index_id IS NOT NULL THEN
      INSERT INTO contract_template_payables (
        template_id,
        metal,
        formula_id,
        deduction_value,
        deduction_unit,
        balance_percentage,
        market_index_id
      ) VALUES (
        v_template_id_1,
        'AU',
        v_deduction_formula_id,
        1,
        'g/tms',
        90,
        v_lme_au_index_id
      );
    END IF;
  END IF;

  -- Template 2: Concentrado de Cu Estándar (Venta)
  INSERT INTO contract_templates (
    id,
    name,
    description,
    product_type,
    contract_type,
    incoterm_code,
    default_tolerance,
    default_h2o_percentage,
    has_payables,
    payables_count
  ) VALUES (
    gen_random_uuid(),
    'Concentrado de Cu Estándar',
    'Plantilla estándar para contratos de venta de concentrado de cobre',
    'Concentrado de Cobre',
    'sale',
    'FOB',
    10,
    10,
    true,
    3
  ) RETURNING id INTO v_template_id_2;

  -- Add payables for Template 2
  IF v_deduction_formula_id IS NOT NULL THEN
    IF v_lme_cu_index_id IS NOT NULL THEN
      INSERT INTO contract_template_payables (
        template_id,
        metal,
        formula_id,
        deduction_value,
        deduction_unit,
        balance_percentage,
        market_index_id
      ) VALUES (
        v_template_id_2,
        'CU',
        v_deduction_formula_id,
        1.0,
        '%',
        97,
        v_lme_cu_index_id
      );
    END IF;

    IF v_lme_ag_index_id IS NOT NULL THEN
      INSERT INTO contract_template_payables (
        template_id,
        metal,
        formula_id,
        deduction_value,
        deduction_unit,
        balance_percentage,
        market_index_id
      ) VALUES (
        v_template_id_2,
        'AG',
        v_deduction_formula_id,
        25,
        'g/tms',
        92,
        v_lme_ag_index_id
      );
    END IF;

    IF v_lme_au_index_id IS NOT NULL THEN
      INSERT INTO contract_template_payables (
        template_id,
        metal,
        formula_id,
        deduction_value,
        deduction_unit,
        balance_percentage,
        market_index_id
      ) VALUES (
        v_template_id_2,
        'AU',
        v_deduction_formula_id,
        0.8,
        'g/tms',
        92,
        v_lme_au_index_id
      );
    END IF;
  END IF;

  -- Template 3: Concentrado de Zn Estándar (Compra)
  INSERT INTO contract_templates (
    id,
    name,
    description,
    product_type,
    contract_type,
    incoterm_code,
    default_tolerance,
    default_h2o_percentage,
    has_payables,
    payables_count
  ) VALUES (
    gen_random_uuid(),
    'Concentrado de Zn Estándar',
    'Plantilla estándar para contratos de compra de concentrado de zinc',
    'Concentrado de Zinc',
    'purchase',
    'CIF',
    10,
    8,
    false,
    0
  ) RETURNING id INTO v_template_id_3;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_contract_templates_type ON contract_templates(contract_type);
CREATE INDEX IF NOT EXISTS idx_contract_templates_product ON contract_templates(product_type);
CREATE INDEX IF NOT EXISTS idx_template_payables_template ON contract_template_payables(template_id);
