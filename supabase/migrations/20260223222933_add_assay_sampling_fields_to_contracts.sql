/*
  # Agregar campos de Muestreo de Ensayes a Contratos

  1. Cambios en Tabla `contracts`
    - `assay_structure` (text) - Estructura de ensayes: '3Party', '3Lots', 'Umpire'
    - `assay_final_lab` (text) - Laboratorio de leyes final
    - `assay_cost_type` (text) - Tipo de costos: 'Comprador', 'Vendedor', 'Ambas Partes'

  2. Notas
    - Los campos son opcionales (nullable) para compatibilidad con contratos existentes
    - Los valores permitidos están documentados pero no se aplican restricciones a nivel de base de datos para flexibilidad futura
*/

-- Agregar campos de muestreo de ensayes a la tabla contracts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'assay_structure'
  ) THEN
    ALTER TABLE contracts ADD COLUMN assay_structure text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'assay_final_lab'
  ) THEN
    ALTER TABLE contracts ADD COLUMN assay_final_lab text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'assay_cost_type'
  ) THEN
    ALTER TABLE contracts ADD COLUMN assay_cost_type text;
  END IF;
END $$;