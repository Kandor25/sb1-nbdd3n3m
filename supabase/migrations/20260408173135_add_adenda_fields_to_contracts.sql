/*
  # Add Adenda (Amendment) fields to contracts

  1. Changes
    - `contracts` table: add `parent_contract_id` (uuid, nullable, FK to contracts.id)
    - `contracts` table: add `adenda_number` (integer, nullable) — sequential number starting from 1 per parent

  2. Notes
    - A contract with `parent_contract_id = NULL` is a "contrato principal"
    - A contract with `parent_contract_id` set is an "adenda"
    - `adenda_number` is auto-assigned at creation time (max + 1 per parent)
    - Adendas cannot themselves be parents (enforced at application level)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'parent_contract_id'
  ) THEN
    ALTER TABLE contracts ADD COLUMN parent_contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'adenda_number'
  ) THEN
    ALTER TABLE contracts ADD COLUMN adenda_number integer DEFAULT NULL;
  END IF;
END $$;
