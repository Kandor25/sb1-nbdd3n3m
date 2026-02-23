/*
  # Agregar campos de Merma a Contratos

  1. Cambios en Tabla `contracts`
    - `waste_applies` (text) - Indica si aplica merma: 'no_aplica' o 'aplica'
    - `waste_value` (numeric) - Valor de la merma
    - `waste_unit` (text) - Unidad de medida: '%', 'gtm', 'tms'

  2. Notas
    - Los campos son opcionales (nullable) para compatibilidad con contratos existentes
    - El campo waste_applies tiene un default de 'no_aplica'
*/

-- Agregar campos de merma a la tabla contracts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'waste_applies'
  ) THEN
    ALTER TABLE contracts ADD COLUMN waste_applies text DEFAULT 'no_aplica';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'waste_value'
  ) THEN
    ALTER TABLE contracts ADD COLUMN waste_value numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'waste_unit'
  ) THEN
    ALTER TABLE contracts ADD COLUMN waste_unit text;
  END IF;
END $$;