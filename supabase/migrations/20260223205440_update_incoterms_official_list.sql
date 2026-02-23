/*
  # Update Incoterms with Official List

  ## Overview
  This migration updates the incoterms table to include the complete official list of Incoterms 2020.
  It removes any existing data and inserts the 11 official incoterms with their proper codes and descriptions.

  ## Changes
  - Clear existing incoterms data
  - Insert all 11 official Incoterms 2020:
    1. EXW – Ex Works
    2. FCA – Franco Transportista
    3. CPT – Transporte pagado hasta
    4. CIP – Transporte pagado hasta
    5. DAP – Entregado en el lugar
    6. DPU – Entregado en el lugar de descarga
    7. DDP – Entrega con derechos pagados
    8. FAS – Franco al costado del buque
    9. FOB – Franco a bordo
    10. CFR – Costo y flete
    11. CIF – Costo, Seguro y Flete

  ## Notes
  - These incoterms will be used in both "Incoterm de Entrega" and "Maquila" sections
  - Data is ordered alphabetically by code for easy selection
*/

-- Clear existing incoterms (if any)
DELETE FROM incoterms;

-- Insert official Incoterms 2020
INSERT INTO incoterms (code, description) VALUES
  ('CFR', 'Costo y flete'),
  ('CIF', 'Costo, Seguro y Flete'),
  ('CIP', 'Transporte y Seguro pagado hasta'),
  ('CPT', 'Transporte pagado hasta'),
  ('DAP', 'Entregado en el lugar'),
  ('DDP', 'Entrega con derechos pagados'),
  ('DPU', 'Entregado en el lugar de descarga'),
  ('EXW', 'Ex Works'),
  ('FAS', 'Franco al costado del buque'),
  ('FCA', 'Franco Transportista'),
  ('FOB', 'Franco a bordo')
ON CONFLICT DO NOTHING;
