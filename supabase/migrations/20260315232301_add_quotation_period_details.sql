/*
  # Add detailed fields to Quotation Periods

  1. Changes
    - Add `day_type` field to store the type of day (Primer Dia, Ultimo Dia, Fecha fija)
    - Add `fixed_date` field to store the specific date when day_type is 'Fecha fija'
    - Add `month_reference` field to store the month reference (M, M+1, M+2, M+3)
    - Add `event_type` field to store the type of event for the quotation period

  2. Notes
    - These fields provide more detailed information about when quotations are declared
    - The fields are nullable for backward compatibility with existing records
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contract_quotation_periods' AND column_name = 'day_type'
  ) THEN
    ALTER TABLE contract_quotation_periods ADD COLUMN day_type text DEFAULT 'Ultimo Dia';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contract_quotation_periods' AND column_name = 'fixed_date'
  ) THEN
    ALTER TABLE contract_quotation_periods ADD COLUMN fixed_date date;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contract_quotation_periods' AND column_name = 'month_reference'
  ) THEN
    ALTER TABLE contract_quotation_periods ADD COLUMN month_reference text DEFAULT 'M';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contract_quotation_periods' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE contract_quotation_periods ADD COLUMN event_type text DEFAULT 'Entrega en Deposito';
  END IF;
END $$;