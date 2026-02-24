/*
  # Actualizar Datos Maestros Iniciales

  1. Actualizar Vendedores (Vendors)
    - Mineria Proton S.A.C.
    - Chinalco
    - Estrella del Sur S.A.C.

  2. Actualizar Productos (Products)
    - Concentrado de Cobre
    - Concentrado de Plata
    - Concentrado de Plomo
    - Concentrado de Zinc

  3. Actualizar Compradores (Buyers)
    - Trafigura SAC
    - IMX Trading
    - Trading A

  Nota: Limpiamos los datos existentes y agregamos los nuevos
*/

-- Limpiar datos existentes
DELETE FROM vendors;
DELETE FROM buyers;
DELETE FROM products;

-- Insertar Vendedores
INSERT INTO vendors (name, tax_id) VALUES
  ('Mineria Proton S.A.C.', '20100000001'),
  ('Chinalco', '20100000002'),
  ('Estrella del Sur S.A.C.', '20100000003');

-- Insertar Productos
INSERT INTO products (name, type) VALUES
  ('Concentrado de Cobre', 'mineral_concentrate'),
  ('Concentrado de Plata', 'mineral_concentrate'),
  ('Concentrado de Plomo', 'mineral_concentrate'),
  ('Concentrado de Zinc', 'mineral_concentrate');

-- Insertar Compradores
INSERT INTO buyers (name, tax_id) VALUES
  ('Trafigura SAC', '20200000001'),
  ('IMX Trading', '20200000002'),
  ('Trading A', '20200000003');