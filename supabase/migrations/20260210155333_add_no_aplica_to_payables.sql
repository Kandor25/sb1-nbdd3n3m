/*
  # Add "No Aplica" Option to Payables System

  ## Overview
  This migration adds the "No Aplica" option to the payable formulas system,
  allowing users to create payables without specifying detailed formula information.

  ## Changes

  ### `payable_formulas` table
  - Insert "No Aplica" formula if it doesn't exist

  ### `contract_payables` table
  - Make metal, deduction_value, deduction_unit, balance_percentage, and market_index_id nullable
  - These fields are not required when "No Aplica" is selected

  ### `contract_template_payables` table
  - Make the same fields nullable for template payables

  ## Notes
  - When "No Aplica" is selected, users don't need to enter detailed formula information
  - The system will store NULL values for optional fields when "No Aplica" is chosen
*/

-- Insert "No Aplica" formula if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM payable_formulas WHERE name = 'No Aplica'
  ) THEN
    INSERT INTO payable_formulas (name, description, is_deduction)
    VALUES ('No Aplica', 'No se aplica fórmula de pagable', false);
  END IF;
END $$;

-- Make contract_payables fields nullable
ALTER TABLE contract_payables 
  ALTER COLUMN metal DROP NOT NULL,
  ALTER COLUMN deduction_value DROP NOT NULL,
  ALTER COLUMN deduction_unit DROP NOT NULL,
  ALTER COLUMN balance_percentage DROP NOT NULL,
  ALTER COLUMN market_index_id DROP NOT NULL;

-- Make contract_template_payables fields nullable
ALTER TABLE contract_template_payables 
  ALTER COLUMN metal DROP NOT NULL,
  ALTER COLUMN deduction_value DROP NOT NULL,
  ALTER COLUMN deduction_unit DROP NOT NULL,
  ALTER COLUMN balance_percentage DROP NOT NULL,
  ALTER COLUMN market_index_id DROP NOT NULL;
