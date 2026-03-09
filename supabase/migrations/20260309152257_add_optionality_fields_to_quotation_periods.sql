/*
  # Agregar campos de opcionalidad a periodos de cotizaciones

  1. Cambios en la tabla `contract_quotation_periods`
    - Agregar columna `buyer_optionality` (boolean) - Opcionalidad definida por el comprador
    - Agregar columna `seller_optionality` (boolean) - Opcionalidad de fijación para el vendedor
  
  2. Notas
    - Los campos se agregan con valor por defecto `false`
    - Los campos permiten NULL para compatibilidad con registros existentes
*/

-- Agregar campos de opcionalidad
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contract_quotation_periods' AND column_name = 'buyer_optionality'
  ) THEN
    ALTER TABLE contract_quotation_periods 
    ADD COLUMN buyer_optionality boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contract_quotation_periods' AND column_name = 'seller_optionality'
  ) THEN
    ALTER TABLE contract_quotation_periods 
    ADD COLUMN seller_optionality boolean DEFAULT false;
  END IF;
END $$;