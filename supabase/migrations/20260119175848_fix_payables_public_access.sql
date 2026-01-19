/*
  # Permitir acceso público a tablas de configuración

  1. Cambios
    - Agregar políticas de lectura pública para `payable_formulas`
    - Agregar políticas de lectura pública para `market_indices`
    - Mantener las políticas de escritura solo para usuarios autenticados
  
  2. Seguridad
    - Las políticas de INSERT/UPDATE/DELETE siguen requiriendo autenticación
    - Solo la lectura (SELECT) es pública
*/

-- Eliminar políticas de SELECT existentes para payable_formulas
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver fórmulas" ON payable_formulas;

-- Crear política de lectura pública para payable_formulas
CREATE POLICY "Todos pueden ver fórmulas"
  ON payable_formulas
  FOR SELECT
  TO public
  USING (true);

-- Eliminar políticas de SELECT existentes para market_indices
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver índices" ON market_indices;

-- Crear política de lectura pública para market_indices
CREATE POLICY "Todos pueden ver índices"
  ON market_indices
  FOR SELECT
  TO public
  USING (true);
