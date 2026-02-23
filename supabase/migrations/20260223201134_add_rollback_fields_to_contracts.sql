/*
  # Add Rollback Fields to Contracts

  ## Overview
  This migration adds structured rollback fields to contracts and templates, allowing users to:
  - Select "No aplica" (not applicable)
  - Apply rollback with a custom value and unit ($/tm)

  ## Changes to Tables

  ### `contracts` - New Columns
  - `rollback_applies` (boolean) - Whether rollback applies (true) or not (false = "No aplica")
  - `rollback_value` (numeric) - The rollback value in dollars
  - `rollback_unit` (text) - The unit for rollback (default: '$/tm')

  ### `contract_templates` - New Columns
  - `rollback_applies` (boolean) - Whether rollback applies by default
  - `rollback_value` (numeric) - Default rollback value
  - `rollback_unit` (text) - Default rollback unit

  ## Notes
  - The existing `rollback` text field in templates is kept for backward compatibility
  - New structured fields provide better data management
  - Default unit is '$/tm' but can be customized
*/

-- Add rollback fields to contracts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'rollback_applies'
  ) THEN
    ALTER TABLE contracts ADD COLUMN rollback_applies boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'rollback_value'
  ) THEN
    ALTER TABLE contracts ADD COLUMN rollback_value numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'rollback_unit'
  ) THEN
    ALTER TABLE contracts ADD COLUMN rollback_unit text DEFAULT '$/tm';
  END IF;
END $$;

-- Add rollback fields to contract_templates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'rollback_applies'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN rollback_applies boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'rollback_value'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN rollback_value numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'rollback_unit'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN rollback_unit text DEFAULT '$/tm';
  END IF;
END $$;
