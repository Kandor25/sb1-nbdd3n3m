/*
  # Add observations field to contracts

  1. Changes
    - `contracts` table: add `observations` column (text, nullable)

  This field is optional and stores free-text notes or remarks associated with a contract.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'observations'
  ) THEN
    ALTER TABLE contracts ADD COLUMN observations text DEFAULT NULL;
  END IF;
END $$;
