/*
  # Agregar campos faltantes a la tabla contracts

  1. Cambios en tabla contracts
    - Agregar campos de escaladores de procesamiento
    - Agregar campos de escaladores de refinación
    - Agregar campos de muestreo
    
  2. Notas
    - Estos campos son necesarios para poder copiar contratos completos como plantillas
*/

-- Agregar campos de escalador de procesamiento
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'processing_escalator_value'
  ) THEN
    ALTER TABLE contracts ADD COLUMN processing_escalator_value numeric;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'processing_escalator_unit'
  ) THEN
    ALTER TABLE contracts ADD COLUMN processing_escalator_unit text DEFAULT '$/tm';
  END IF;
END $$;

-- Agregar campos de escalador de refinación
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'refining_escalator_value'
  ) THEN
    ALTER TABLE contracts ADD COLUMN refining_escalator_value numeric;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'refining_escalator_unit'
  ) THEN
    ALTER TABLE contracts ADD COLUMN refining_escalator_unit text DEFAULT '$/tm';
  END IF;
END $$;

-- Agregar campos de muestreo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'sampling_formula_id'
  ) THEN
    ALTER TABLE contracts ADD COLUMN sampling_formula_id uuid;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'sampling_incoterm_id'
  ) THEN
    ALTER TABLE contracts ADD COLUMN sampling_incoterm_id uuid;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'sampling_reference'
  ) THEN
    ALTER TABLE contracts ADD COLUMN sampling_reference text;
  END IF;
END $$;
