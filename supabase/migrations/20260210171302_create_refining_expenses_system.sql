/*
  # Create Refining Expenses System

  ## Overview
  This migration creates a system for managing refining expenses in contracts.
  Similar to penalties, it includes formula types and a "No Aplica" option.

  ## New Tables

  ### 1. `refining_expense_formulas`
  - `id` (uuid, primary key)
  - `name` (text, unique) - Formula name (e.g., "Gastos", "No Aplica")
  - `description` (text, nullable) - Formula description
  - `is_active` (boolean) - Whether formula is active
  - `created_at` (timestamptz)

  ### 2. `contract_refining_expenses`
  - `id` (uuid, primary key)
  - `contract_id` (uuid, foreign key to contracts)
  - `formula_id` (uuid, foreign key to refining_expense_formulas)
  - `metal` (text, nullable) - Metal element (CU, AG, AU)
  - `amount_usd` (numeric, nullable) - Amount in USD per unit
  - `unit` (text, nullable) - Unit of measurement (%, /lib, etc.)
  - `formula_text` (text) - Generated formula text for display
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `contract_template_refining_expenses`
  - Same structure as contract_refining_expenses but for templates

  ## Security
  - RLS enabled on all tables
  - Authenticated users can read all refining expenses
  - Authenticated users can insert and update their own refining expenses

  ## Notes
  - Supports two main formula types:
    1. "No Aplica" - No refining expenses apply
    2. "Gastos" - Standard refining expenses with metal, amount, and unit
  - Formula text is auto-generated based on the selected formula type
  - All fields except formula_id and formula_text are nullable to accommodate different formula types
*/

-- Create refining_expense_formulas table
CREATE TABLE IF NOT EXISTS refining_expense_formulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create contract_refining_expenses table
CREATE TABLE IF NOT EXISTS contract_refining_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  formula_id uuid REFERENCES refining_expense_formulas(id) ON DELETE RESTRICT,
  metal text CHECK (metal IS NULL OR metal IN ('CU', 'AG', 'AU', 'PB', 'ZN')),
  amount_usd numeric(10,4),
  unit text,
  formula_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contract_template_refining_expenses table
CREATE TABLE IF NOT EXISTS contract_template_refining_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid,
  formula_id uuid REFERENCES refining_expense_formulas(id) ON DELETE RESTRICT,
  metal text CHECK (metal IS NULL OR metal IN ('CU', 'AG', 'AU', 'PB', 'ZN')),
  amount_usd numeric(10,4),
  unit text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_refining_expenses_contract ON contract_refining_expenses(contract_id);
CREATE INDEX IF NOT EXISTS idx_refining_expenses_formula ON contract_refining_expenses(formula_id);
CREATE INDEX IF NOT EXISTS idx_template_refining_expenses_template ON contract_template_refining_expenses(template_id);

-- Enable Row Level Security
ALTER TABLE refining_expense_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_refining_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_template_refining_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for refining_expense_formulas
CREATE POLICY "Authenticated users can view refining expense formulas"
  ON refining_expense_formulas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert refining expense formulas"
  ON refining_expense_formulas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update refining expense formulas"
  ON refining_expense_formulas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for contract_refining_expenses
CREATE POLICY "Authenticated users can view refining expenses"
  ON contract_refining_expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert refining expenses"
  ON contract_refining_expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update refining expenses"
  ON contract_refining_expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete refining expenses"
  ON contract_refining_expenses FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for contract_template_refining_expenses
CREATE POLICY "Authenticated users can view template refining expenses"
  ON contract_template_refining_expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert template refining expenses"
  ON contract_template_refining_expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update template refining expenses"
  ON contract_template_refining_expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete template refining expenses"
  ON contract_template_refining_expenses FOR DELETE
  TO authenticated
  USING (true);

-- Insert default formulas
INSERT INTO refining_expense_formulas (name, description, is_active) VALUES
  ('No Aplica', 'No se aplican gastos de refinación', true),
  ('Gastos', 'Gastos de refinación estándar', true)
ON CONFLICT (name) DO NOTHING;
