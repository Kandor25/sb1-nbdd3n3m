/*
  # Add Complete Contract Template Fields

  ## Overview
  This migration adds all remaining fields needed for complete contract templates, including:
  - Duration and quantities
  - Delivery details
  - Treatment charges and escalators
  - Payment terms
  - Pricing periods and optionality
  - Sampling procedures
  - Loss percentages

  ## Changes to Tables

  ### `contract_templates` - New Columns
  - `duration_months` (integer) - Duration of the contract in months
  - `monthly_quantity_tmh` (numeric) - Monthly quantity in TMH (Toneladas Métricas Húmedas)
  - `monthly_quantity_tms` (numeric) - Monthly quantity in TMS (Toneladas Métricas Secas)
  - `incoterm_delivery_location` (text) - Detailed delivery location for the incoterm
  - `rollback` (text) - Rollback clause details
  - `treatment_charge_usd_per_tms` (numeric) - Treatment charge in USD per TMS
  - `escalator_treatment_charge` (text) - Escalator formula for treatment charge
  - `escalator_refining_expenses` (text) - Escalator formula for refining expenses
  - `payment_provisional_percentage` (numeric) - Percentage for provisional payment
  - `payment_provisional_days` (integer) - Days for provisional payment
  - `payment_provisional_conditions` (text) - Conditions for provisional payment
  - `payment_final_conditions` (text) - Conditions for final payment
  - `pricing_period` (text) - Pricing period (e.g., "M+1", "M+3")
  - `pricing_period_details` (text) - Detailed description of pricing period
  - `pricing_optionality` (boolean) - Whether pricing has optionality
  - `pricing_declaration_deadline` (text) - Deadline for price declaration
  - `pricing_fixation_option` (boolean) - Whether fixation option is available
  - `sampling_weights_location` (text) - Location for weight sampling
  - `sampling_assays_procedure` (text) - Procedure for assay sampling
  - `sampling_costs` (text) - Description of sampling cost allocation
  - `sampling_final_assays` (text) - Description of final assay determination
  - `loss_percentage` (numeric) - Loss/shrinkage percentage

  ## Notes
  - All new fields are nullable to maintain compatibility with existing templates
  - Fields can be populated gradually as templates are updated
*/

-- Add new fields to contract_templates table
DO $$
BEGIN
  -- Duration and quantities
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'duration_months'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN duration_months integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'monthly_quantity_tmh'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN monthly_quantity_tmh numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'monthly_quantity_tms'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN monthly_quantity_tms numeric;
  END IF;

  -- Delivery details
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'incoterm_delivery_location'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN incoterm_delivery_location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'rollback'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN rollback text;
  END IF;

  -- Treatment charges
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'treatment_charge_usd_per_tms'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN treatment_charge_usd_per_tms numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'escalator_treatment_charge'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN escalator_treatment_charge text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'escalator_refining_expenses'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN escalator_refining_expenses text;
  END IF;

  -- Payment terms
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'payment_provisional_percentage'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN payment_provisional_percentage numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'payment_provisional_days'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN payment_provisional_days integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'payment_provisional_conditions'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN payment_provisional_conditions text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'payment_final_conditions'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN payment_final_conditions text;
  END IF;

  -- Pricing period
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'pricing_period'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN pricing_period text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'pricing_period_details'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN pricing_period_details text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'pricing_optionality'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN pricing_optionality boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'pricing_declaration_deadline'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN pricing_declaration_deadline text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'pricing_fixation_option'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN pricing_fixation_option boolean DEFAULT false;
  END IF;

  -- Sampling
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'sampling_weights_location'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN sampling_weights_location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'sampling_assays_procedure'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN sampling_assays_procedure text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'sampling_costs'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN sampling_costs text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'sampling_final_assays'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN sampling_final_assays text;
  END IF;

  -- Loss percentage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_templates' AND column_name = 'loss_percentage'
  ) THEN
    ALTER TABLE contract_templates ADD COLUMN loss_percentage numeric;
  END IF;
END $$;
